"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesRepository = void 0;
const db_1 = require("../db");
class QuizzesRepository {
    constructor() {
        this.pool = db_1.db;
    }
    async create(data) {
        const query = `
      INSERT INTO quizzes (
        user_id, pdf_file_id, title, description, total_questions, 
        time_limit, difficulty_level, quiz_data, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const values = [
            data.user_id,
            data.pdf_file_id,
            data.title,
            data.description || null,
            data.total_questions || 0,
            data.time_limit || null,
            data.difficulty_level || 'medium',
            JSON.stringify(data.quiz_data),
            data.status || 'active'
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async findById(id) {
        const query = 'SELECT * FROM quizzes WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }
    async findByPdfFileId(pdfFileId) {
        const query = 'SELECT * FROM quizzes WHERE pdf_file_id = $1';
        const result = await this.pool.query(query, [pdfFileId]);
        return result.rows[0] || null;
    }
    async findByUserId(userId, limit, offset) {
        let query = `
      SELECT 
        q.*,
        pf.original_name as pdf_file_name,
        u.name as user_name
      FROM quizzes q
      LEFT JOIN pdf_files pf ON q.pdf_file_id = pf.id
      JOIN users u ON q.user_id = u.id
      WHERE q.user_id = $1
      ORDER BY q.created_at DESC
    `;
        const values = [userId];
        if (limit) {
            query += ` LIMIT $${values.length + 1}`;
            values.push(limit.toString());
        }
        if (offset) {
            query += ` OFFSET $${values.length + 1}`;
            values.push(offset.toString());
        }
        const result = await this.pool.query(query, values);
        return result.rows;
    }
    async findAll(limit, offset) {
        let query = `
      SELECT 
        q.*,
        pf.original_name as pdf_file_name,
        u.name as user_name
      FROM quizzes q
      JOIN pdf_files pf ON q.pdf_file_id = pf.id
      JOIN users u ON pf.user_id = u.id
      ORDER BY q.created_at DESC
    `;
        const values = [];
        if (limit) {
            query += ` LIMIT $${values.length + 1}`;
            values.push(limit.toString());
        }
        if (offset) {
            query += ` OFFSET $${values.length + 1}`;
            values.push(offset.toString());
        }
        const result = await this.pool.query(query, values);
        return result.rows;
    }
    async findByStatus(status) {
        const query = 'SELECT * FROM quizzes WHERE status = $1 ORDER BY created_at DESC';
        const result = await this.pool.query(query, [status]);
        return result.rows;
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (data.title !== undefined) {
            fields.push(`title = $${paramCount++}`);
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(data.description);
        }
        if (data.total_questions !== undefined) {
            fields.push(`total_questions = $${paramCount++}`);
            values.push(data.total_questions);
        }
        if (data.time_limit !== undefined) {
            fields.push(`time_limit = $${paramCount++}`);
            values.push(data.time_limit);
        }
        if (data.difficulty_level !== undefined) {
            fields.push(`difficulty_level = $${paramCount++}`);
            values.push(data.difficulty_level);
        }
        if (data.quiz_data !== undefined) {
            fields.push(`quiz_data = $${paramCount++}`);
            values.push(JSON.stringify(data.quiz_data));
        }
        if (data.status !== undefined) {
            fields.push(`status = $${paramCount++}`);
            values.push(data.status);
        }
        if (fields.length === 0) {
            return this.findById(id);
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const query = `
      UPDATE quizzes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }
    async delete(id) {
        const query = 'DELETE FROM quizzes WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return (result.rowCount || 0) > 0;
    }
    async getQuizStats(userId) {
        const query = `
      SELECT 
        COUNT(q.id) as total_quizzes,
        COUNT(CASE WHEN q.status = 'active' THEN 1 END) as active_quizzes,
        COALESCE(SUM(q.total_questions), 0) as total_questions,
        COALESCE(AVG(q.total_questions), 0) as average_questions
      FROM quizzes q
      JOIN pdf_files pf ON q.pdf_file_id = pf.id
      WHERE pf.user_id = $1
    `;
        const result = await this.pool.query(query, [userId]);
        const stats = result.rows[0];
        return {
            total_quizzes: parseInt(stats.total_quizzes),
            active_quizzes: parseInt(stats.active_quizzes),
            total_questions: parseInt(stats.total_questions),
            average_questions: parseFloat(stats.average_questions)
        };
    }
    async searchQuizzes(searchTerm, userId) {
        let query = `
      SELECT 
        q.*,
        pf.original_name as pdf_file_name,
        u.name as user_name
      FROM quizzes q
      JOIN pdf_files pf ON q.pdf_file_id = pf.id
      JOIN users u ON pf.user_id = u.id
      WHERE (q.title ILIKE $1 OR q.description ILIKE $1)
    `;
        const values = [`%${searchTerm}%`];
        if (userId) {
            query += ` AND pf.user_id = $${values.length + 1}`;
            values.push(userId);
        }
        query += ` ORDER BY q.created_at DESC`;
        const result = await this.pool.query(query, values);
        return result.rows;
    }
}
exports.QuizzesRepository = QuizzesRepository;
