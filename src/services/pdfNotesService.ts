import { PdfNotesRepository, CreatePdfNoteData, UpdatePdfNoteData } from '../repositories/pdfNotesRepository';
import { pool } from '../db';

const pdfNotesRepo = new PdfNotesRepository(pool);

export class PdfNotesService {
  static async createNote(data: CreatePdfNoteData): Promise<any> {
    return await pdfNotesRepo.create(data);
  }

  static async getNotesByPdfFile(pdfFileId: string, userId: string): Promise<any[]> {
    return await pdfNotesRepo.findByPdfFileId(pdfFileId, userId);
  }

  static async getAllUserNotes(userId: string): Promise<any[]> {
    return await pdfNotesRepo.findByUserId(userId);
  }

  static async getNoteById(noteId: string): Promise<any> {
    return await pdfNotesRepo.findById(noteId);
  }

  static async updateNote(noteId: string, data: UpdatePdfNoteData): Promise<any> {
    return await pdfNotesRepo.update(noteId, data);
  }

  static async deleteNote(noteId: string, userId: string): Promise<boolean> {
    return await pdfNotesRepo.delete(noteId, userId);
  }

  static async getNotesCountByPdfFile(pdfFileId: string, userId: string): Promise<number> {
    return await pdfNotesRepo.getNotesCountByPdfFile(pdfFileId, userId);
  }
}
