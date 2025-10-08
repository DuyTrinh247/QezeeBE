import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  uploadPdfFile, 
  uploadMiddleware, 
  getPdfFilesByUser, 
  deletePdfFile,
  getPdfContent,
  createPdfFromUrl
} from '../controllers/pdfFilesController';

const router = Router();

// Test route không cần authentication
router.get('/test', (req, res) => {
  res.json({ message: 'PDF Files API is working!', timestamp: new Date().toISOString() });
});

// Tất cả routes PDF files đều cần authentication
router.use(authenticateToken as any);

// Upload PDF file (physical file)
router.post('/upload', uploadMiddleware, uploadPdfFile);

// Create PDF record from external URL (no file upload)
router.post('/create-from-url', createPdfFromUrl);

// Get PDF files by user
router.get('/', getPdfFilesByUser);

// Get PDF content
router.get('/:id/content', getPdfContent);

// Delete PDF file
router.delete('/:id', deletePdfFile);

export default router;
