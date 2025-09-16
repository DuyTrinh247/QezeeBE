import { Router } from "express";

const router = Router();

// Mock quiz data for testing
const mockQuizData = {
  id: "test-quiz-123",
  title: "Test Quiz from PDF",
  description: "Quiz created from uploaded PDF file",
  total_questions: 3,
  time_limit_minutes: 10,
  difficulty_level: "medium",
  status: "active",
  quiz_data: {
    questions: [
      {
        id: "q1",
        questionText: "What is the main topic of the PDF?",
        questionType: "multiple_choice",
        points: 10,
        difficulty: "easy",
        options: [
          { id: "a1", text: "Technology", value: "A" },
          { id: "a2", text: "Science", value: "B" },
          { id: "a3", text: "History", value: "C" },
          { id: "a4", text: "Literature", value: "D" }
        ],
        correctAnswer: "A"
      },
      {
        id: "q2", 
        questionText: "How many pages does the PDF have?",
        questionType: "multiple_choice",
        points: 10,
        difficulty: "medium",
        options: [
          { id: "b1", text: "5-10 pages", value: "A" },
          { id: "b2", text: "10-15 pages", value: "B" },
          { id: "b3", text: "15-20 pages", value: "C" },
          { id: "b4", text: "20+ pages", value: "D" }
        ],
        correctAnswer: "B"
      },
      {
        id: "q3",
        questionText: "What is the author's main argument?",
        questionType: "multiple_choice", 
        points: 10,
        difficulty: "hard",
        options: [
          { id: "c1", text: "Technology is beneficial", value: "A" },
          { id: "c2", text: "Technology has drawbacks", value: "B" },
          { id: "c3", text: "Technology is neutral", value: "C" },
          { id: "c4", text: "Technology is complex", value: "D" }
        ],
        correctAnswer: "D"
      }
    ]
  },
  pdf_file_id: "test-pdf-123",
  pdf_file_name: "test-document.pdf",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock PDF content
const mockPdfContent = {
  success: true,
  title: "Test Document",
  content: `
    <h1>Test Document</h1>
    <p>This is a test PDF document for quiz creation.</p>
    <p>The main topic is about technology and its impact on society.</p>
    <p>The document contains approximately 10-15 pages of content.</p>
    <p>The author's main argument is that technology is complex and has both benefits and drawbacks.</p>
  `
};

// Test routes (no authentication required)
router.get("/quiz/:id", (req, res) => {
  const { id } = req.params;
  console.log(`📝 Mock API: Getting quiz ${id}`);
  res.json({ quiz: mockQuizData });
});

router.get("/pdf-files/:id/content", (req, res) => {
  const { id } = req.params;
  console.log(`📄 Mock API: Getting PDF content ${id}`);
  res.json(mockPdfContent);
});

router.post("/quiz-attempts/start/:quizId", (req, res) => {
  const { quizId } = req.params;
  console.log(`🚀 Mock API: Starting quiz attempt for ${quizId}`);
  res.json({
    success: true,
    attempt: {
      id: `attempt-${Date.now()}`,
      quiz_id: quizId,
      user_id: "test-user-123",
      status: "active",
      started_at: new Date().toISOString()
    }
  });
});

router.post("/quiz-attempts/submit/:attemptId", (req, res) => {
  const { attemptId } = req.params;
  const { answers, timeSpent } = req.body;
  console.log(`✅ Mock API: Submitting quiz attempt ${attemptId}`);
  console.log(`📊 Answers:`, answers);
  console.log(`⏱️ Time spent:`, timeSpent);
  
  res.json({
    success: true,
    attempt: {
      id: attemptId,
      status: "completed",
      submitted_at: new Date().toISOString(),
      answers: answers,
      time_spent: timeSpent
    }
  });
});

// Mock PDF Upload API
router.post("/pdf-files/upload", (req, res) => {
  console.log(`📄 Mock API: Uploading PDF file`);
  const mockPdfFile = {
    id: `pdf_${Date.now()}`,
    original_name: "test-document.pdf",
    file_path: "/uploads/test-document.pdf",
    file_size: 1024000,
    created_at: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    pdfFile: mockPdfFile
  });
});

// Real PDF Upload API (saves to database)
router.post("/pdf-files/upload-real", async (req, res) => {
  try {
    console.log(`📄 Real API: Uploading PDF file to database`);
    
    // Import multer for file handling
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');
    
// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `file-${uniqueSuffix}.pdf`);
  }
});
    
    const upload = multer({ storage: storage });
    
    // Handle single file upload
    upload.single('file')(req, res, async (err: any) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(500).json({
          success: false,
          error: 'File upload failed'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }
      
      try {
        const { PdfFilesService } = await import('../services/pdfFilesService');
        
        const pdfFileData = {
          userId: "bfddf5ec-964d-423e-8b96-d6d20b725239", // Real user ID from database
          originalName: req.file.originalname,
          filePath: `/uploads/${req.file.filename}`,
          fileSize: req.file.size,
          fileType: req.file.mimetype
        };
        
        const pdfFile = await PdfFilesService.createPdfFile(pdfFileData);
        
        res.status(201).json({
          success: true,
          pdfFile: pdfFile
        });
      } catch (error) {
        console.error('Error saving PDF to database:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to save PDF file to database'
        });
      }
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload PDF file'
    });
  }
});

// Mock Quiz Creation API
router.post("/quizzes", (req, res) => {
  console.log(`📝 Mock API: Creating quiz`);
  const { pdf_file_id, title, description, time_limit, quiz_data, total_questions, difficulty_level } = req.body;
  
  const mockQuiz = {
    id: `quiz_${Date.now()}`,
    user_id: "test-user-123",
    pdf_file_id,
    title,
    description,
    quiz_data,
    total_questions,
    difficulty_level,
    time_limit_minutes: time_limit,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    quiz: mockQuiz
  });
});

// Real Quiz Creation API (saves to database)
router.post("/quizzes-real", async (req, res) => {
  try {
    console.log(`📝 Real API: Creating quiz in database`);
    const { pdf_file_id, title, description, time_limit, quiz_data, total_questions, difficulty_level } = req.body;
    
    const { addQuiz } = await import('../services/quizzesService');
    
    const quizData = {
      pdf_file_id,
      title,
      description,
      time_limit: time_limit,
      quiz_data,
      total_questions,
      difficulty_level,
      status: 'active' as const
    };
    
    const quiz = await addQuiz(quizData);
    
    res.status(201).json({
      success: true,
      quiz: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create quiz'
    });
  }
});

// Get PDF file by ID
router.get("/pdf-files/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📄 API: Getting PDF file ${id}`);
    
    const { PdfFilesService } = await import('../services/pdfFilesService');
    const pdfFile = await PdfFilesService.getPdfFileById(id);
    
    if (pdfFile) {
      res.json({
        success: true,
        pdfFile: pdfFile
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'PDF file not found'
      });
    }
  } catch (error) {
    console.error('Error getting PDF file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get PDF file'
    });
  }
});

// Mock PDF Notes API
router.get("/pdf-notes/pdf/:pdfFileId", (req, res) => {
  const { pdfFileId } = req.params;
  console.log(`📝 Mock API: Getting notes for PDF ${pdfFileId}`);
  res.json({ 
    success: true, 
    notes: [
      {
        id: "note-1",
        title: "Sample Note 1",
        content: "This is a sample note for testing",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  });
});

router.post("/pdf-notes/pdf/:pdfFileId", (req, res) => {
  const { pdfFileId } = req.params;
  const { title, content } = req.body;
  console.log(`📝 Mock API: Creating note for PDF ${pdfFileId}`);
  console.log(`📝 Title: ${title}, Content: ${content}`);
  
  const newNote = {
    id: `note-${Date.now()}`,
    title,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  res.status(201).json({ 
    success: true, 
    note: newNote
  });
});

router.delete("/pdf-notes/:noteId", (req, res) => {
  const { noteId } = req.params;
  console.log(`📝 Mock API: Deleting note ${noteId}`);
  res.json({ 
    success: true, 
    message: "Note deleted successfully"
  });
});

export default router;
