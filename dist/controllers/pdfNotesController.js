"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNote = createNote;
exports.getNotesByPdfFile = getNotesByPdfFile;
exports.getAllUserNotes = getAllUserNotes;
exports.getNoteById = getNoteById;
exports.updateNote = updateNote;
exports.deleteNote = deleteNote;
const pdfNotesService_1 = require("../services/pdfNotesService");
async function createNote(req, res) {
    var _a;
    try {
        const { pdfFileId } = req.params;
        const { title, content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        console.log('📝 Creating note:', {
            pdfFileId,
            userId,
            title,
            content: (content === null || content === void 0 ? void 0 : content.substring(0, 50)) + '...'
        });
        if (!userId) {
            console.error('❌ User not authenticated');
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!title || !content) {
            console.error('❌ Title or content missing:', { title: !!title, content: !!content });
            return res.status(400).json({ error: 'Title and content are required' });
        }
        if (!pdfFileId) {
            console.error('❌ PDF file ID missing');
            return res.status(400).json({ error: 'PDF file ID is required' });
        }
        const note = await pdfNotesService_1.PdfNotesService.createNote({
            pdf_file_id: pdfFileId,
            user_id: userId,
            title,
            content
        });
        console.log('✅ Note created successfully:', note.id);
        res.status(201).json({
            success: true,
            note
        });
    }
    catch (error) {
        console.error('❌ Error creating note:', error);
        if (error instanceof Error) {
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
            res.status(400).json({ error: error.message || 'Unknown error creating note' });
        }
        else {
            console.error('❌ Unknown error type:', error);
            res.status(500).json({ error: 'Error creating note' });
        }
    }
}
async function getNotesByPdfFile(req, res) {
    var _a;
    try {
        const { pdfFileId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const notes = await pdfNotesService_1.PdfNotesService.getNotesByPdfFile(pdfFileId, userId);
        res.json({
            success: true,
            notes
        });
    }
    catch (error) {
        console.error('Error getting notes:', error);
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error getting notes' });
        }
    }
}
async function getAllUserNotes(req, res) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const notes = await pdfNotesService_1.PdfNotesService.getAllUserNotes(userId);
        res.json({
            success: true,
            notes
        });
    }
    catch (error) {
        console.error('Error getting user notes:', error);
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error getting user notes' });
        }
    }
}
async function getNoteById(req, res) {
    var _a;
    try {
        const { noteId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const note = await pdfNotesService_1.PdfNotesService.getNoteById(noteId);
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
    }
    catch (error) {
        console.error('Error getting note:', error);
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error getting note' });
        }
    }
}
async function updateNote(req, res) {
    var _a;
    try {
        const { noteId } = req.params;
        const { title, content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Check if note exists and user owns it
        const existingNote = await pdfNotesService_1.PdfNotesService.getNoteById(noteId);
        if (!existingNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (existingNote.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const updatedNote = await pdfNotesService_1.PdfNotesService.updateNote(noteId, {
            title,
            content
        });
        res.json({
            success: true,
            note: updatedNote
        });
    }
    catch (error) {
        console.error('Error updating note:', error);
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error updating note' });
        }
    }
}
async function deleteNote(req, res) {
    var _a;
    try {
        const { noteId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Check if note exists and user owns it
        const existingNote = await pdfNotesService_1.PdfNotesService.getNoteById(noteId);
        if (!existingNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        if (existingNote.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const deleted = await pdfNotesService_1.PdfNotesService.deleteNote(noteId, userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({
            success: true,
            message: 'Note deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting note:', error);
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error deleting note' });
        }
    }
}
