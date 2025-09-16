import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  uploadPdfFile, 
  uploadMiddleware, 
  getPdfFilesByUser, 
  deletePdfFile,
  getPdfContent
} from '../controllers/pdfFilesController';

const router = Router();

// Test route không cần authentication
router.get('/test', (req, res) => {
  res.json({ message: 'PDF Files API is working!', timestamp: new Date().toISOString() });
});

// Tất cả routes PDF files đều cần authentication
router.use(authenticateToken);

// Upload PDF file
router.post('/upload', uploadMiddleware, uploadPdfFile);

// Get PDF files by user
router.get('/', getPdfFilesByUser);

// Get PDF content
router.get('/:id/content', getPdfContent);

// Delete PDF file
router.delete('/:id', deletePdfFile);

export default router;
