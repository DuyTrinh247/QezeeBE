import { Router } from 'express';
import { 
  createNote, 
  getNotesByPdfFile, 
  getAllUserNotes, 
  getNoteById, 
  updateNote, 
  deleteNote 
} from '../controllers/pdfNotesController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as any);

// Get all notes for a specific PDF file
router.get('/pdf/:pdfFileId', getNotesByPdfFile as any);

// Get all notes for the authenticated user
router.get('/user', getAllUserNotes as any);

// Get a specific note by ID
router.get('/:noteId', getNoteById as any);

// Create a new note for a PDF file
router.post('/pdf/:pdfFileId', createNote as any);

// Update a note
router.put('/:noteId', updateNote as any);

// Delete a note
router.delete('/:noteId', deleteNote as any);

export default router;
