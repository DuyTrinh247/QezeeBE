"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfNotesRepository = void 0;
class PdfNotesRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async create(data) {
        const query = `
      INSERT INTO pdf_notes (pdf_file_id, user_id, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const values = [data.pdf_file_id, data.user_id, data.title, data.content];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async findById(id) {
        const query = 'SELECT * FROM pdf_notes WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }
    async findByPdfFileId(pdfFileId, userId) {
        const query = `
      SELECT * FROM pdf_notes 
      WHERE pdf_file_id = $1 AND user_id = $2 
      ORDER BY created_at DESC
    `;
        const result = await this.pool.query(query, [pdfFileId, userId]);
        return result.rows;
    }
    async findByUserId(userId) {
        const query = `
      SELECT n.*, pf.original_name as pdf_name
      FROM pdf_notes n
      JOIN pdf_files pf ON n.pdf_file_id = pf.id
      WHERE n.user_id = $1 
      ORDER BY n.created_at DESC
    `;
        const result = await this.pool.query(query, [userId]);
        return result.rows;
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (data.title !== undefined) {
            fields.push(`title = $${paramCount}`);
            values.push(data.title);
            paramCount++;
        }
        if (data.content !== undefined) {
            fields.push(`content = $${paramCount}`);
            values.push(data.content);
            paramCount++;
        }
        if (fields.length === 0) {
            return this.findById(id);
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const query = `
      UPDATE pdf_notes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }
    async delete(id, userId) {
        const query = 'DELETE FROM pdf_notes WHERE id = $1 AND user_id = $2';
        const result = await this.pool.query(query, [id, userId]);
        return (result.rowCount || 0) > 0;
    }
    async getNotesCountByPdfFile(pdfFileId, userId) {
        const query = `
      SELECT COUNT(*) as count 
      FROM pdf_notes 
      WHERE pdf_file_id = $1 AND user_id = $2
    `;
        const result = await this.pool.query(query, [pdfFileId, userId]);
        return parseInt(result.rows[0].count);
    }
}
exports.PdfNotesRepository = PdfNotesRepository;
