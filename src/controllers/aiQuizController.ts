import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import aiQuizService from '../services/aiQuizService';
import { quizzesService } from '../services/quizzesService';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `pdf-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed') as any, false);
    }
  }
});

export class AIQuizController {
  /**
   * Generate quiz from uploaded PDF file
   */
  async generateQuizFromPDF(req: Request, res: Response) {
    try {
      console.log('🚀 Starting PDF to Quiz generation request');
      
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = (req.user as any).userId;
      const userName = (req.user as any).name || 'Unknown User';
      const userEmail = (req.user as any).email || 'unknown@example.com';

      // Get generation options from request body
      const {
        numQuestions = 5,
        difficulty = 'medium',
        questionTypes = ['multiple_choice', 'true_false']
      } = req.body;

      console.log('📋 Generation options:', {
        numQuestions,
        difficulty,
        questionTypes,
        userId
      });

      // Validate options
      if (numQuestions < 1 || numQuestions > 20) {
        return res.status(400).json({ 
          error: 'Number of questions must be between 1 and 20' 
        });
      }

      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ 
          error: 'Difficulty must be easy, medium, or hard' 
        });
      }

      const validQuestionTypes = ['multiple_choice', 'true_false', 'fill_blank', 'essay'];
      const invalidTypes = questionTypes.filter((type: string) => !validQuestionTypes.includes(type));
      if (invalidTypes.length > 0) {
        return res.status(400).json({ 
          error: `Invalid question types: ${invalidTypes.join(', ')}` 
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'PDF file is required' });
      }

      const filePath = req.file.path;
      console.log('📄 Processing PDF file:', filePath);

      try {
        // Generate quiz from PDF
        const generatedQuiz = await aiQuizService.generateQuizFromPDF(filePath, {
          numQuestions: parseInt(numQuestions),
          difficulty,
          questionTypes,
          userId,
          userName,
          userEmail
        });

        console.log('✅ Quiz generated successfully');

        // Save quiz to database
        const savedQuiz = await quizzesService.createQuiz({
          pdf_file_id: `ai-generated-${Date.now()}`,
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          total_questions: generatedQuiz.totalQuestions,
          time_limit: generatedQuiz.timeLimit,
          difficulty_level: generatedQuiz.difficulty,
          quiz_data: {
            questions: generatedQuiz.questions,
            category: generatedQuiz.category,
            tags: generatedQuiz.tags,
            author: generatedQuiz.author
          },
          status: 'active'
        });

        console.log('💾 Quiz saved to database with ID:', savedQuiz.id);

        // Clean up uploaded file
        fs.unlinkSync(filePath);
        console.log('🗑️ Temporary PDF file cleaned up');

        res.json({
          success: true,
          message: 'Quiz generated successfully from PDF',
          quiz: savedQuiz
        });

      } catch (error) {
        // Clean up file on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw error;
      }

    } catch (error) {
      console.error('❌ Error generating quiz from PDF:', error);
      res.status(500).json({
        error: 'Failed to generate quiz from PDF',
        details: (error as Error).message
      });
    }
  }

  /**
   * Generate quiz from text content
   */
  async generateQuizFromText(req: Request, res: Response) {
    try {
      console.log('🚀 Starting text to Quiz generation request');
      
      // For testing, use default user data
      const userId = 'test-user-123';
      const userName = 'Test User';
      const userEmail = 'test@example.com';

      const {
        text,
        numQuestions = 5,
        difficulty = 'medium',
        questionTypes = ['multiple_choice', 'true_false']
      } = req.body;

      // Validate input
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text content is required' });
      }

      if (text.length > 50000) {
        return res.status(400).json({ 
          error: 'Text content is too long (max 50,000 characters)' 
        });
      }

      // Validate options (same as PDF generation)
      if (numQuestions < 1 || numQuestions > 20) {
        return res.status(400).json({ 
          error: 'Number of questions must be between 1 and 20' 
        });
      }

      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ 
          error: 'Difficulty must be easy, medium, or hard' 
        });
      }

      const validQuestionTypes = ['multiple_choice', 'true_false', 'fill_blank', 'essay'];
      const invalidTypes = questionTypes.filter((type: string) => !validQuestionTypes.includes(type));
      if (invalidTypes.length > 0) {
        return res.status(400).json({ 
          error: `Invalid question types: ${invalidTypes.join(', ')}` 
        });
      }

      console.log('📋 Generation options:', {
        numQuestions,
        difficulty,
        questionTypes,
        textLength: text.length
      });

      // Generate quiz from text
      const generatedQuiz = await aiQuizService.generateQuizFromText(text, {
        numQuestions: parseInt(numQuestions),
        difficulty,
        questionTypes,
        userId,
        userName,
        userEmail
      });

      console.log('✅ Quiz generated successfully');

      // Save quiz to database
      const savedQuiz = await quizzesService.createQuiz({
        pdf_file_id: `ai-generated-${Date.now()}`,
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        total_questions: generatedQuiz.totalQuestions,
        time_limit: generatedQuiz.timeLimit,
        difficulty_level: generatedQuiz.difficulty,
        quiz_data: {
          questions: generatedQuiz.questions,
          category: generatedQuiz.category,
          tags: generatedQuiz.tags,
          author: generatedQuiz.author
        },
        status: 'active'
      });

      console.log('💾 Quiz saved to database with ID:', savedQuiz.id);

      res.json({
        success: true,
        message: 'Quiz generated successfully from text',
        quiz: savedQuiz
      });

    } catch (error) {
      console.error('❌ Error generating quiz from text:', error);
      res.status(500).json({
        error: 'Failed to generate quiz from text',
        details: (error as Error).message
      });
    }
  }

  /**
   * Get multer upload middleware
   */
  getUploadMiddleware() {
    return upload.single('pdfFile');
  }
}

export default new AIQuizController();
