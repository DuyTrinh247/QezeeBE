"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const pdfFilesController_1 = require("../controllers/pdfFilesController");
const router = (0, express_1.Router)();
// Test route không cần authentication
router.get('/test', (req, res) => {
    res.json({ message: 'PDF Files API is working!', timestamp: new Date().toISOString() });
});
// Tất cả routes PDF files đều cần authentication
router.use(auth_1.authenticateToken);
// Upload PDF file
router.post('/upload', pdfFilesController_1.uploadMiddleware, pdfFilesController_1.uploadPdfFile);
// Get PDF files by user
router.get('/', pdfFilesController_1.getPdfFilesByUser);
// Get PDF content
router.get('/:id/content', pdfFilesController_1.getPdfContent);
// Delete PDF file
router.delete('/:id', pdfFilesController_1.deletePdfFile);
exports.default = router;
