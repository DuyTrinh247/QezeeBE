import { PdfFilesRepository, CreatePdfFileData } from '../repositories/pdfFilesRepository';

const pdfFilesRepo = new PdfFilesRepository();

export class PdfFilesService {
  static async createPdfFile(fileData: {
    userId: string;
    originalName: string;
    filePath: string;
    fileUrl?: string; // Optional external URL
    fileSize: number;
    fileType: string;
    content?: string;
    contentLength?: number;
  }): Promise<any> {
    const createData: CreatePdfFileData = {
      user_id: fileData.userId,
      original_name: fileData.originalName,
      file_path: fileData.filePath,
      file_url: fileData.fileUrl,
      file_size: fileData.fileSize,
      file_type: fileData.fileType,
      upload_status: 'uploaded',
      processing_status: 'pending',
      content: fileData.content || '',
      content_length: fileData.contentLength || 0
    };

    return await pdfFilesRepo.create(createData);
  }

  static async getPdfFilesByUserId(userId: string): Promise<any[]> {
    return await pdfFilesRepo.findByUserId(userId);
  }

  static async getPdfFileById(id: string): Promise<any | null> {
    return await pdfFilesRepo.findById(id);
  }

  static async updatePdfFile(id: string, updateData: Partial<CreatePdfFileData>): Promise<any | null> {
    return await pdfFilesRepo.update(id, updateData);
  }

  static async deletePdfFile(id: string, userId: string): Promise<boolean> {
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
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
    }

    // Delete from database
    return await pdfFilesRepo.delete(id);
  }

  static async getPdfContent(id: string, userId: string): Promise<{ content: string; title: string } | null> {
    // First check if the file belongs to the user
    const pdfFile = await pdfFilesRepo.findById(id);
    if (!pdfFile || pdfFile.user_id !== userId) {
      return null;
    }

    // Get PDF content
    return await pdfFilesRepo.getPdfContent(id);
  }
}

export default new PdfFilesService();
