"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfFilesService = void 0;
const pdfFilesRepository_1 = require("../repositories/pdfFilesRepository");
const pdfFilesRepo = new pdfFilesRepository_1.PdfFilesRepository();
class PdfFilesService {
    static async createPdfFile(fileData) {
        const createData = {
            user_id: fileData.userId,
            original_name: fileData.originalName,
            file_path: fileData.filePath,
            file_size: fileData.fileSize,
            file_type: fileData.fileType,
            upload_status: 'uploaded',
            processing_status: 'pending'
        };
        return await pdfFilesRepo.create(createData);
    }
    static async getPdfFilesByUserId(userId) {
        return await pdfFilesRepo.findByUserId(userId);
    }
    static async getPdfFileById(id) {
        return await pdfFilesRepo.findById(id);
    }
    static async updatePdfFile(id, updateData) {
        return await pdfFilesRepo.update(id, updateData);
    }
    static async deletePdfFile(id, userId) {
        // First check if the file belongs to the user
        const pdfFile = await pdfFilesRepo.findById(id);
        if (!pdfFile || pdfFile.user_id !== userId) {
            return false;
        }
        // Delete the file from filesystem
        const fs = require('fs');
        try {
            if (fs.existsSync(pdfFile.file_path)) {
                fs.unlinkSync(pdfFile.file_path);
            }
        }
        catch (error) {
            console.error('Error deleting file from filesystem:', error);
        }
        // Delete from database
        return await pdfFilesRepo.delete(id);
    }
    static async getPdfContent(id, userId) {
        // First check if the file belongs to the user
        const pdfFile = await pdfFilesRepo.findById(id);
        if (!pdfFile || pdfFile.user_id !== userId) {
            return null;
        }
        // Get PDF content
        return await pdfFilesRepo.getPdfContent(id);
    }
}
exports.PdfFilesService = PdfFilesService;
