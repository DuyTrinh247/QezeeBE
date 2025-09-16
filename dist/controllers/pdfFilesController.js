"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
exports.uploadPdfFile = uploadPdfFile;
exports.getPdfFilesByUser = getPdfFilesByUser;
exports.deletePdfFile = deletePdfFile;
exports.getPdfContent = getPdfContent;
const pdfFilesService_1 = require("../services/pdfFilesService");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});
exports.uploadMiddleware = upload.single('file');
async function uploadPdfFile(req, res) {
    var _a;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Get user ID from JWT token (assuming it's set by auth middleware)
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        const pdfFile = await pdfFilesService_1.PdfFilesService.createPdfFile(fileData);
        res.status(201).json({
            success: true,
            pdfFile,
            message: 'File uploaded successfully'
        });
    }
    catch (error) {
        console.error('Error uploading PDF file:', error);
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error uploading file' });
        }
    }
}
async function getPdfFilesByUser(req, res) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const pdfFiles = await pdfFilesService_1.PdfFilesService.getPdfFilesByUserId(userId);
        res.json({ pdfFiles });
    }
    catch (error) {
        console.error('Error getting PDF files:', error);
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error getting PDF files' });
        }
    }
}
async function deletePdfFile(req, res) {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const success = await pdfFilesService_1.PdfFilesService.deletePdfFile(id, userId);
        if (success) {
            res.json({ success: true, message: 'File deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'File not found or access denied' });
        }
    }
    catch (error) {
        console.error('Error deleting PDF file:', error);
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error deleting file' });
        }
    }
}
async function getPdfContent(req, res) {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const pdfContent = await pdfFilesService_1.PdfFilesService.getPdfContent(id, userId);
        if (pdfContent) {
            res.json({
                success: true,
                content: pdfContent.content,
                title: pdfContent.title
            });
        }
        else {
            res.status(404).json({ error: 'PDF content not found or not accessible' });
        }
    }
    catch (error) {
        console.error('Error getting PDF content:', error);
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error getting PDF content' });
        }
    }
}
