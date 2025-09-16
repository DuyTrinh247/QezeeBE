"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
exports.uploadFile = uploadFile;
exports.deleteFile = deleteFile;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Cấu hình multer để lưu file tạm thời
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Chỉ chấp nhận file PDF, DOCX, PPTX'));
        }
    }
});
exports.uploadMiddleware = upload.single('file');
async function uploadFile(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file được upload' });
        }
        const file = req.file;
        // Tạo thông tin file response
        const fileInfo = {
            id: (0, uuid_1.v4)(),
            originalName: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            path: file.path,
            uploadedAt: new Date().toISOString()
        };
        // TODO: Xử lý file để tạo quiz
        // Ở đây có thể gọi AI service để phân tích file và tạo quiz
        res.status(200).json({
            message: 'File uploaded successfully',
            file: fileInfo
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Lỗi khi upload file' });
    }
}
async function deleteFile(req, res) {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(__dirname, '../../uploads', filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            res.status(200).json({ message: 'File deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'File not found' });
        }
    }
    catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Lỗi khi xóa file' });
    }
}
