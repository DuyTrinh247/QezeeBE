import { Pool } from 'pg';
import { db } from '../db';

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  started_at: Date;
  completed_at: Date | null;
  time_taken: number | null;
  time_taken_seconds?: number;
  time_taken_milliseconds?: number;
  time_limit_seconds?: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers?: number;
  answers: any; // JSONB - User's answers
  quiz_data?: any; // JSONB - Quiz questions and data at time of attempt
  question_timings?: any; // JSONB
  ip_address?: string;
  user_agent?: string;
  device_info?: any; // JSONB
  status: 'in_progress' | 'completed' | 'abandoned' | 'timeout';
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuizAttemptData {
  user_id: string;
  quiz_id: string;
  total_questions: number;
  time_limit_seconds?: number;
  ip_address?: string;
  user_agent?: string;
  device_info?: any;
}

export interface UpdateQuizAttemptData {
  completed_at?: Date;
  time_taken?: number;
  time_taken_seconds?: number;
  time_taken_milliseconds?: number;
  score?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  answers?: any;
  quiz_data?: any; // Quiz questions and data at time of attempt
  question_timings?: any;
  status?: 'in_progress' | 'completed' | 'abandoned' | 'timeout';
}

export interface QuizAttemptWithDetails extends QuizAttempt {
  quiz_title?: string;
  user_name?: string;
}

export class QuizAttemptsRepository {
  private pool: Pool;

  constructor() {
    this.pool = db;
  }

  async create(data: CreateQuizAttemptData): Promise<QuizAttempt> {
    const fields = ['user_id', 'quiz_id', 'total_questions'];
    const values = [data.user_id, data.quiz_id, data.total_questions];
    let paramCount = 3;

    if (data.time_limit_seconds !== undefined) {
      fields.push('time_limit_seconds');
      values.push(data.time_limit_seconds);
      paramCount++;
    }

    if (data.ip_address !== undefined) {
      fields.push('ip_address');
      values.push(data.ip_address);
      paramCount++;
    }

    if (data.user_agent !== undefined) {
      fields.push('user_agent');
      values.push(data.user_agent);
      paramCount++;
    }

    if (data.device_info !== undefined) {
      fields.push('device_info');
      values.push(JSON.stringify(data.device_info));
      paramCount++;
    }

    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const query = `
      INSERT INTO quiz_attempts (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<QuizAttempt | null> {
    const query = 'SELECT * FROM quiz_attempts WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByUserId(userId: string, limit?: number, offset?: number): Promise<QuizAttemptWithDetails[]> {
    let query = `
      SELECT 
        qa.*,
        q.title as quiz_title,
        u.name as user_name
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN users u ON qa.user_id = u.id
      WHERE qa.user_id = $1
      ORDER BY qa.created_at DESC
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

  async findByQuizId(quizId: string): Promise<QuizAttempt[]> {
    const query = 'SELECT * FROM quiz_attempts WHERE quiz_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [quizId]);
    return result.rows;
  }

  async findActiveAttempt(userId: string, quizId: string): Promise<QuizAttempt | null> {
    const query = `
      SELECT * FROM quiz_attempts 
      WHERE user_id = $1 AND quiz_id = $2 AND status = 'in_progress'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await this.pool.query(query, [userId, quizId]);
    return result.rows[0] || null;
  }

  async update(id: string, data: UpdateQuizAttemptData): Promise<QuizAttempt | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.completed_at !== undefined) {
      fields.push(`completed_at = $${paramCount++}`);
      values.push(data.completed_at);
    }

    // Remove time_taken as it doesn't exist in database schema
    // if (data.time_taken !== undefined) {
    //   fields.push(`time_taken = $${paramCount++}`);
    //   values.push(data.time_taken);
    // }

    if (data.time_taken_seconds !== undefined) {
      fields.push(`time_taken_seconds = $${paramCount++}`);
      values.push(data.time_taken_seconds);
    }

    if (data.time_taken_milliseconds !== undefined) {
      fields.push(`time_taken_milliseconds = $${paramCount++}`);
      values.push(data.time_taken_milliseconds);
    }

    if (data.score !== undefined) {
      fields.push(`score = $${paramCount++}`);
      values.push(data.score);
    }

    if (data.correct_answers !== undefined) {
      fields.push(`correct_answers = $${paramCount++}`);
      values.push(data.correct_answers);
    }

    if (data.incorrect_answers !== undefined) {
      fields.push(`incorrect_answers = $${paramCount++}`);
      values.push(data.incorrect_answers);
    }

    if (data.answers !== undefined) {
      fields.push(`answers = $${paramCount++}`);
      values.push(JSON.stringify(data.answers));
    }

    if (data.quiz_data !== undefined) {
      fields.push(`quiz_data = $${paramCount++}`);
      values.push(JSON.stringify(data.quiz_data));
    }

    if (data.question_timings !== undefined) {
      fields.push(`question_timings = $${paramCount++}`);
      values.push(JSON.stringify(data.question_timings));
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
      UPDATE quiz_attempts 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM quiz_attempts WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  async getAttemptStats(userId: string): Promise<{
    total_attempts: number;
    completed_attempts: number;
    average_score: number;
    total_quizzes_taken: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_attempts,
        AVG(CASE WHEN status = 'completed' THEN score END) as average_score,
        COUNT(DISTINCT quiz_id) as total_quizzes_taken
      FROM quiz_attempts 
      WHERE user_id = $1
    `;
    
    const result = await this.pool.query(query, [userId]);
    const stats = result.rows[0];
    
    return {
      total_attempts: parseInt(stats.total_attempts),
      completed_attempts: parseInt(stats.completed_attempts),
      average_score: parseFloat(stats.average_score) || 0,
      total_quizzes_taken: parseInt(stats.total_quizzes_taken)
    };
  }

  async getQuizAttemptStats(quizId: string): Promise<{
    total_attempts: number;
    completed_attempts: number;
    average_score: number;
    average_time: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_attempts,
        AVG(CASE WHEN status = 'completed' THEN score END) as average_score,
        AVG(CASE WHEN status = 'completed' THEN time_taken END) as average_time
      FROM quiz_attempts 
      WHERE quiz_id = $1
    `;
    
    const result = await this.pool.query(query, [quizId]);
    const stats = result.rows[0];
    
    return {
      total_attempts: parseInt(stats.total_attempts),
      completed_attempts: parseInt(stats.completed_attempts),
      average_score: parseFloat(stats.average_score) || 0,
      average_time: parseFloat(stats.average_time) || 0
    };
  }

  async getRecentAttempts(userId: string, limit: number = 10): Promise<QuizAttemptWithDetails[]> {
    return this.findByUserId(userId, limit);
  }
}
