"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfFilesRepository = void 0;
const db_1 = require("../db");
class PdfFilesRepository {
    constructor() {
        this.pool = db_1.db;
    }
    async create(data) {
        const query = `
      INSERT INTO pdf_files (user_id, original_name, file_path, file_size, file_type, upload_status, processing_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [
            data.user_id,
            data.original_name,
            data.file_path,
            data.file_size,
            data.file_type || 'application/pdf',
            data.upload_status || 'uploaded',
            data.processing_status || 'pending'
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async findById(id) {
        const query = 'SELECT * FROM pdf_files WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }
    async findByUserId(userId) {
        const query = 'SELECT * FROM pdf_files WHERE user_id = $1 ORDER BY created_at DESC';
        const result = await this.pool.query(query, [userId]);
        return result.rows;
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (data.upload_status !== undefined) {
            fields.push(`upload_status = $${paramCount++}`);
            values.push(data.upload_status);
        }
        if (data.processing_status !== undefined) {
            fields.push(`processing_status = $${paramCount++}`);
            values.push(data.processing_status);
        }
        if (data.content !== undefined) {
            fields.push(`content = $${paramCount++}`);
            values.push(data.content);
        }
        if (data.content_extracted_at !== undefined) {
            fields.push(`content_extracted_at = $${paramCount++}`);
            values.push(data.content_extracted_at);
        }
        if (data.content_length !== undefined) {
            fields.push(`content_length = $${paramCount++}`);
            values.push(data.content_length);
        }
        if (fields.length === 0) {
            return this.findById(id);
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const query = `
      UPDATE pdf_files 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }
    async delete(id) {
        const query = 'DELETE FROM pdf_files WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return (result.rowCount || 0) > 0;
    }
    async findByProcessingStatus(status) {
        const query = 'SELECT * FROM pdf_files WHERE processing_status = $1 ORDER BY created_at ASC';
        const result = await this.pool.query(query, [status]);
        return result.rows;
    }
    async getFileStats(userId) {
        const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN upload_status = 'uploaded' THEN 1 END) as uploaded,
        COUNT(CASE WHEN processing_status = 'processing' THEN 1 END) as processing,
        COUNT(CASE WHEN processing_status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN processing_status = 'failed' THEN 1 END) as failed
      FROM pdf_files 
      WHERE user_id = $1
    `;
        const result = await this.pool.query(query, [userId]);
        const stats = result.rows[0];
        return {
            total: parseInt(stats.total),
            uploaded: parseInt(stats.uploaded),
            processing: parseInt(stats.processing),
            completed: parseInt(stats.completed),
            failed: parseInt(stats.failed)
        };
    }
    async getPdfContent(pdfId) {
        const query = `
      SELECT content, original_name as title
      FROM pdf_files 
      WHERE id = $1 AND content IS NOT NULL
    `;
        const result = await this.pool.query(query, [pdfId]);
        if (result.rows.length === 0) {
            return null;
        }
        return {
            content: result.rows[0].content,
            title: result.rows[0].title
        };
    }
}
exports.PdfFilesRepository = PdfFilesRepository;
