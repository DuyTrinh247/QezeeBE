import { Request, Response } from 'express';
import { PdfNotesService } from '../services/pdfNotesService';
import { AuthRequest } from '../middleware/auth';

export async function createNote(req: AuthRequest, res: Response) {
  try {
    const { pdfFileId } = req.params;
    const { title, content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const note = await PdfNotesService.createNote({
      pdf_file_id: pdfFileId,
      user_id: userId,
      title,
      content
    });

    res.status(201).json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error creating note' });
    }
  }
}

export async function getNotesByPdfFile(req: AuthRequest, res: Response) {
  try {
    const { pdfFileId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notes = await PdfNotesService.getNotesByPdfFile(pdfFileId, userId);

    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error getting notes:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error getting notes' });
    }
  }
}

export async function getAllUserNotes(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notes = await PdfNotesService.getAllUserNotes(userId);

    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error getting user notes:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error getting user notes' });
    }
  }
}

export async function getNoteById(req: AuthRequest, res: Response) {
  try {
    const { noteId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const note = await PdfNotesService.getNoteById(noteId);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if user owns this note
    if (note.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Error getting note:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error getting note' });
    }
  }
}

export async function updateNote(req: AuthRequest, res: Response) {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if note exists and user owns it
    const existingNote = await PdfNotesService.getNoteById(noteId);
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (existingNote.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedNote = await PdfNotesService.updateNote(noteId, {
      title,
      content
    });

    res.json({
      success: true,
      note: updatedNote
    });
  } catch (error) {
    console.error('Error updating note:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error updating note' });
    }
  }
}

export async function deleteNote(req: AuthRequest, res: Response) {
  try {
    const { noteId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if note exists and user owns it
    const existingNote = await PdfNotesService.getNoteById(noteId);
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (existingNote.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await PdfNotesService.deleteNote(noteId, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error deleting note' });
    }
  }
}
