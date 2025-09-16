"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfNotesService = void 0;
const pdfNotesRepository_1 = require("../repositories/pdfNotesRepository");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'qezee',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'password',
    ssl: { rejectUnauthorized: false },
});
const pdfNotesRepo = new pdfNotesRepository_1.PdfNotesRepository(pool);
class PdfNotesService {
    static async createNote(data) {
        return await pdfNotesRepo.create(data);
    }
    static async getNotesByPdfFile(pdfFileId, userId) {
        return await pdfNotesRepo.findByPdfFileId(pdfFileId, userId);
    }
    static async getAllUserNotes(userId) {
        return await pdfNotesRepo.findByUserId(userId);
    }
    static async getNoteById(noteId) {
        return await pdfNotesRepo.findById(noteId);
    }
    static async updateNote(noteId, data) {
        return await pdfNotesRepo.update(noteId, data);
    }
    static async deleteNote(noteId, userId) {
        return await pdfNotesRepo.delete(noteId, userId);
    }
    static async getNotesCountByPdfFile(pdfFileId, userId) {
        return await pdfNotesRepo.getNotesCountByPdfFile(pdfFileId, userId);
    }
}
exports.PdfNotesService = PdfNotesService;
