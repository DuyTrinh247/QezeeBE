"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdfNotesController_1 = require("../controllers/pdfNotesController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
// Get all notes for a specific PDF file
router.get('/pdf/:pdfFileId', pdfNotesController_1.getNotesByPdfFile);
// Get all notes for the authenticated user
router.get('/user', pdfNotesController_1.getAllUserNotes);
// Get a specific note by ID
router.get('/:noteId', pdfNotesController_1.getNoteById);
// Create a new note for a PDF file
router.post('/pdf/:pdfFileId', pdfNotesController_1.createNote);
// Update a note
router.put('/:noteId', pdfNotesController_1.updateNote);
// Delete a note
router.delete('/:noteId', pdfNotesController_1.deleteNote);
exports.default = router;
