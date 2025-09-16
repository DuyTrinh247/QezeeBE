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
router.use(authenticateToken);

// Get all notes for a specific PDF file
router.get('/pdf/:pdfFileId', getNotesByPdfFile);

// Get all notes for the authenticated user
router.get('/user', getAllUserNotes);

// Get a specific note by ID
router.get('/:noteId', getNoteById);

// Create a new note for a PDF file
router.post('/pdf/:pdfFileId', createNote);

// Update a note
router.put('/:noteId', updateNote);

// Delete a note
router.delete('/:noteId', deleteNote);

export default router;
