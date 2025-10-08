import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
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
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
    cb(null, `${uniqueSuffix}-${originalName}`);
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
        questionTypes = ['multiple_choice', 'true_false'],
        timeLimit = 15
      } = req.body;

      // Parse questionTypes if it's a string
      let parsedQuestionTypes = questionTypes;
      if (typeof questionTypes === 'string') {
        try {
          parsedQuestionTypes = JSON.parse(questionTypes);
        } catch (error) {
          return res.status(400).json({ 
            error: 'Invalid questionTypes format. Expected JSON array.' 
          });
        }
      }

      console.log('📋 Generation options:', {
        numQuestions,
        questionTypes: parsedQuestionTypes,
        timeLimit,
        userId
      });

      // Validate options
      if (numQuestions < 1 || numQuestions > 20) {
        return res.status(400).json({ 
          error: 'Number of questions must be between 1 and 20' 
        });
      }

      const validQuestionTypes = ['multiple_choice', 'true_false'];
      const invalidTypes = parsedQuestionTypes.filter((type: string) => !validQuestionTypes.includes(type));
      if (invalidTypes.length > 0) {
        return res.status(400).json({ 
          error: `Invalid question types: ${invalidTypes.join(', ')}` 
        });
      }

      // Validate timeLimit
      if (timeLimit < 0 || timeLimit > 120) {
        return res.status(400).json({ 
          error: 'Time limit must be between 0 and 120 minutes' 
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
          questionTypes: parsedQuestionTypes,
          timeLimit: parseInt(timeLimit),
          userId,
          userName,
          userEmail
        });

        console.log('✅ Quiz generated successfully');

        // Create PDF file record for the uploaded file
        let pdfFileId = null;
        try {
          const { PdfFilesService } = await import('../services/pdfFilesService');
          const uploadedPdfFile = await PdfFilesService.createPdfFile({
            userId: userId,
            originalName: req.file.filename, // Use actual filename instead of originalname
            filePath: filePath,
            fileSize: req.file.size,
            fileType: req.file.mimetype
          });
          pdfFileId = uploadedPdfFile.id;
          console.log('✅ PDF file record created for uploaded file:', pdfFileId);
          console.log('📄 File path:', filePath);
          console.log('📄 Original name:', req.file.filename);
        } catch (pdfError) {
          console.warn('⚠️ Failed to create PDF file record, creating direct database record:', (pdfError as Error).message);
          // Create PDF file record directly in database to avoid foreign key constraint
          try {
            const { PdfFilesRepository } = await import('../repositories/pdfFilesRepository');
            const pdfFilesRepo = new PdfFilesRepository();
            const createdPdfFile = await pdfFilesRepo.create({
              user_id: userId,
              original_name: req.file.filename, // Use actual filename instead of originalname
              file_path: filePath,
              file_size: req.file.size,
              file_type: req.file.mimetype,
              upload_status: 'uploaded',
              processing_status: 'completed'
            });
            pdfFileId = createdPdfFile.id;
            console.log('✅ Direct PDF file record created:', pdfFileId);
          } catch (dbError) {
            console.error('❌ Failed to create direct PDF file record:', (dbError as Error).message);
            // Last resort: use a known existing PDF file ID
            pdfFileId = '00000000-0000-0000-0000-000000000000';
            console.log('🔄 Using emergency fallback PDF file ID:', pdfFileId);
          }
        }

        // Save quiz to database
        const savedQuiz = await quizzesService.createQuiz({
          user_id: userId,
          pdf_file_id: pdfFileId,
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

        // Keep uploaded file for PDF display
        console.log('📄 PDF file kept for display:', filePath);

        // Get PDF file info for response
        let pdfFileInfo = null;
        try {
          const { PdfFilesRepository } = await import('../repositories/pdfFilesRepository');
          const pdfFilesRepo = new PdfFilesRepository();
          pdfFileInfo = await pdfFilesRepo.findById(pdfFileId);
        } catch (pdfError) {
          console.warn('⚠️ Could not fetch PDF file info:', (pdfError as Error).message);
        }

        res.json({
          success: true,
          message: 'Quiz generated successfully from PDF',
          quiz: savedQuiz,
          pdfFile: pdfFileInfo
        });

      } catch (error) {
        // Keep file even on error for debugging
        console.log('📄 PDF file kept for debugging:', filePath);
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
      
      // Get user info from request (from frontend)
      const {
        pdfText,
        pdfBinary, // PDF binary data as base64
        fileName,
        fileSize,
        numQuestions = 5,
        questionTypes = ['multiple_choice', 'true_false'],
        timeLimit = 15
      } = req.body;

      // Get user info from authenticated request
      const userId = (req as any).user?.userId;
      const userName = (req as any).user?.name || 'Unknown User';
      const userEmail = (req as any).user?.email || 'unknown@example.com';

      // Use authenticated user info
      const finalUserId = userId;
      const finalUserName = userName;
      const finalUserEmail = userEmail;

      console.log('📋 Generation options:', {
        fileName,
        fileSize,
        numQuestions,
        questionTypes,
        timeLimit,
        userId: finalUserId,
        userName: finalUserName,
        userEmail: finalUserEmail
      });

      // Use pdfText as the main text content
      const text = pdfText;

      // Parse questionTypes if it's a string
      let parsedQuestionTypes = questionTypes;
      if (typeof questionTypes === 'string') {
        try {
          parsedQuestionTypes = JSON.parse(questionTypes);
        } catch (error) {
          return res.status(400).json({ 
            error: 'Invalid questionTypes format. Expected JSON array.' 
          });
        }
      }

        // Validate input
        if (!text || text.trim().length === 0) {
          return res.status(400).json({ error: 'Text content is required' });
        }

        if (text.length > 500000) {
          return res.status(400).json({ 
            error: 'Text content is too long (max 500,000 characters)' 
          });
        }

      // Validate options (same as PDF generation)
      if (numQuestions < 1 || numQuestions > 20) {
        return res.status(400).json({ 
          error: 'Number of questions must be between 1 and 20' 
        });
      }

      const validQuestionTypes = ['multiple_choice', 'true_false'];
      const invalidTypes = parsedQuestionTypes.filter((type: string) => !validQuestionTypes.includes(type));
      if (invalidTypes.length > 0) {
        return res.status(400).json({ 
          error: `Invalid question types: ${invalidTypes.join(', ')}` 
        });
      }

      console.log('📋 Generation options:', {
        numQuestions,
        questionTypes: parsedQuestionTypes,
        timeLimit,
        textLength: text.length
      });

      // Generate quiz from text
      const generatedQuiz = await aiQuizService.generateQuizFromText(text, {
        numQuestions: parseInt(numQuestions),
        questionTypes: parsedQuestionTypes,
        timeLimit: parseInt(timeLimit),
        userId: userId,
        userName: userName,
        userEmail: userEmail
      });

      console.log('✅ Quiz generated successfully');

      // Create a PDF file record for the processed PDF
      let pdfFileId = null;
      try {
        const { PdfFilesRepository } = await import('../repositories/pdfFilesRepository');
        const pdfFilesRepo = new PdfFilesRepository();
        
        // Use original filename for PDF file
        const originalFileName = fileName || 'AI Generated Quiz Document.pdf';
        const filePath = `uploads/${originalFileName}`;
        
        // Create the actual PDF file from binary data sent by frontend
        const uploadsDir = 'uploads';
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Write PDF binary data (received as base64) to file
        const fullFilePath = path.join(uploadsDir, originalFileName);
        if (pdfBinary) {
          // Decode base64 and write as binary
          const pdfBuffer = Buffer.from(pdfBinary, 'base64');
          fs.writeFileSync(fullFilePath, pdfBuffer);
          console.log('✅ PDF binary file created at:', fullFilePath, `(${pdfBuffer.length} bytes)`);
        } else {
          // Fallback: Create text file if no binary data provided
          fs.writeFileSync(fullFilePath, text, 'utf8');
          console.log('⚠️ PDF text file created at:', fullFilePath, '(no binary data provided)');
        }
        
        const createdPdfFile = await pdfFilesRepo.create({
          user_id: userId,
          original_name: originalFileName, // Keep original name for display
          file_path: filePath, // Use original filename for file system
          file_size: Buffer.byteLength(text, 'utf8'),
          file_type: 'application/pdf',
          upload_status: 'uploaded',
          processing_status: 'completed',
          content: text,
          content_length: text.length
        });
        pdfFileId = createdPdfFile.id;
        console.log('✅ PDF file record created:', pdfFileId);
      } catch (dbError) {
        console.error('❌ Failed to create PDF file record:', (dbError as Error).message);
        return res.status(500).json({ 
          error: 'Failed to create PDF file record', 
          details: (dbError as Error).message 
        });
      }

      // Save quiz to database
      const savedQuiz = await quizzesService.createQuiz({
        user_id: userId,
        pdf_file_id: pdfFileId,
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

      // Get PDF file info to return to frontend
      let pdfFileInfo = null;
      if (pdfFileId) {
        try {
          const { PdfFilesRepository } = await import('../repositories/pdfFilesRepository');
          const pdfFilesRepo = new PdfFilesRepository();
          const pdfFile = await pdfFilesRepo.findById(pdfFileId);
          
          // Construct PDF URL for frontend
          if (pdfFile) {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3002';
            const filename = pdfFile.file_path.split('/').pop() || '';
            const pdfUrl = `${baseUrl}/uploads/${encodeURIComponent(filename)}`;
            
            pdfFileInfo = {
              ...pdfFile,
              pdf_url: pdfUrl // Add constructed PDF URL
            };
            
            console.log('📄 PDF URL constructed:', pdfUrl);
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch PDF file info:', (error as Error).message);
        }
      }

      res.json({
        success: true,
        message: 'Quiz generated successfully from text',
        quiz: savedQuiz,
        pdfFile: pdfFileInfo // Include PDF file info with URL in response
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
