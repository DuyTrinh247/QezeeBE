import { Request, Response } from 'express';
import { PdfFilesService } from '../services/pdfFilesService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export const uploadMiddleware = upload.single('file');

export async function uploadPdfFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get user ID from JWT token (assuming it's set by auth middleware)
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const fileData = {
      userId,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    };

    const pdfFile = await PdfFilesService.createPdfFile(fileData);
    
    res.status(201).json({ 
      success: true,
      pdfFile,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading PDF file:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error uploading file' });
    }
  }
}

export async function getPdfFilesByUser(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const pdfFiles = await PdfFilesService.getPdfFilesByUserId(userId);
    res.json({ pdfFiles });
  } catch (error) {
    console.error('Error getting PDF files:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error getting PDF files' });
    }
  }
}

export async function deletePdfFile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const success = await PdfFilesService.deletePdfFile(id, userId);
    
    if (success) {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found or access denied' });
    }
  } catch (error) {
    console.error('Error deleting PDF file:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error deleting file' });
    }
  }
}

export async function getPdfContent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const pdfContent = await PdfFilesService.getPdfContent(id, userId);
    
    if (pdfContent) {
      res.json({ 
        success: true, 
        content: pdfContent.content,
        title: pdfContent.title
      });
    } else {
      res.status(404).json({ error: 'PDF content not found or not accessible' });
    }
  } catch (error) {
    console.error('Error getting PDF content:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error getting PDF content' });
    }
  }
}
