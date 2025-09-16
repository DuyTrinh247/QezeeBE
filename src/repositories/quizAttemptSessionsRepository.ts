import { Pool } from 'pg';
import { db } from '../db';

export interface QuizAttemptSession {
  id: string;
  attempt_id: string;
  session_start: Date;
  session_end?: Date;
  session_duration_ms?: number;
  pause_count: number;
  total_pause_duration_ms: number;
  last_activity?: Date;
  browser_info?: any; // JSONB
  screen_resolution?: string;
  timezone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuizAttemptSessionData {
  attempt_id: string;
  session_start: Date;
  browser_info?: any;
  screen_resolution?: string;
  timezone?: string;
}

export interface UpdateQuizAttemptSessionData {
  session_end?: Date;
  session_duration_ms?: number;
  pause_count?: number;
  total_pause_duration_ms?: number;
  last_activity?: Date;
  browser_info?: any;
  screen_resolution?: string;
  timezone?: string;
}

export class QuizAttemptSessionsRepository {
  private pool: Pool;

  constructor() {
    this.pool = db;
  }

  async create(data: CreateQuizAttemptSessionData): Promise<QuizAttemptSession> {
    const fields = ['attempt_id', 'session_start'];
    const values = [data.attempt_id, data.session_start];
    let paramCount = 2;

    if (data.browser_info !== undefined) {
      fields.push('browser_info');
      values.push(JSON.stringify(data.browser_info));
      paramCount++;
    }

    if (data.screen_resolution !== undefined) {
      fields.push('screen_resolution');
      values.push(data.screen_resolution);
      paramCount++;
    }

    if (data.timezone !== undefined) {
      fields.push('timezone');
      values.push(data.timezone);
      paramCount++;
    }

    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const query = `
      INSERT INTO quiz_attempt_sessions (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findByAttemptId(attemptId: string): Promise<QuizAttemptSession[]> {
    const query = `
      SELECT * FROM quiz_attempt_sessions 
      WHERE attempt_id = $1 
      ORDER BY session_start ASC
    `;
    const result = await this.pool.query(query, [attemptId]);
    return result.rows;
  }

  async findActiveSession(attemptId: string): Promise<QuizAttemptSession | null> {
    const query = `
      SELECT * FROM quiz_attempt_sessions 
      WHERE attempt_id = $1 AND session_end IS NULL
      ORDER BY session_start DESC
      LIMIT 1
    `;
    const result = await this.pool.query(query, [attemptId]);
    return result.rows[0] || null;
  }

  async update(id: string, data: UpdateQuizAttemptSessionData): Promise<QuizAttemptSession | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.session_end !== undefined) {
      fields.push(`session_end = $${paramCount++}`);
      values.push(data.session_end);
    }

    if (data.session_duration_ms !== undefined) {
      fields.push(`session_duration_ms = $${paramCount++}`);
      values.push(data.session_duration_ms);
    }

    if (data.pause_count !== undefined) {
      fields.push(`pause_count = $${paramCount++}`);
      values.push(data.pause_count);
    }

    if (data.total_pause_duration_ms !== undefined) {
      fields.push(`total_pause_duration_ms = $${paramCount++}`);
      values.push(data.total_pause_duration_ms);
    }

    if (data.last_activity !== undefined) {
      fields.push(`last_activity = $${paramCount++}`);
      values.push(data.last_activity);
    }

    if (data.browser_info !== undefined) {
      fields.push(`browser_info = $${paramCount++}`);
      values.push(JSON.stringify(data.browser_info));
    }

    if (data.screen_resolution !== undefined) {
      fields.push(`screen_resolution = $${paramCount++}`);
      values.push(data.screen_resolution);
    }

    if (data.timezone !== undefined) {
      fields.push(`timezone = $${paramCount++}`);
      values.push(data.timezone);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE quiz_attempt_sessions 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<QuizAttemptSession | null> {
    const query = 'SELECT * FROM quiz_attempt_sessions WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM quiz_attempt_sessions WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  async deleteByAttemptId(attemptId: string): Promise<boolean> {
    const query = 'DELETE FROM quiz_attempt_sessions WHERE attempt_id = $1';
    const result = await this.pool.query(query, [attemptId]);
    return (result.rowCount || 0) > 0;
  }

  async getSessionStats(attemptId: string): Promise<{
    total_sessions: number;
    total_duration_ms: number;
    total_pauses: number;
    total_pause_duration_ms: number;
    average_session_duration_ms: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(COALESCE(session_duration_ms, 0)) as total_duration_ms,
        SUM(pause_count) as total_pauses,
        SUM(total_pause_duration_ms) as total_pause_duration_ms,
        AVG(COALESCE(session_duration_ms, 0)) as average_session_duration_ms
      FROM quiz_attempt_sessions 
      WHERE attempt_id = $1
    `;
    
    const result = await this.pool.query(query, [attemptId]);
    const stats = result.rows[0];
    
    return {
      total_sessions: parseInt(stats.total_sessions),
      total_duration_ms: parseInt(stats.total_duration_ms) || 0,
      total_pauses: parseInt(stats.total_pauses) || 0,
      total_pause_duration_ms: parseInt(stats.total_pause_duration_ms) || 0,
      average_session_duration_ms: parseFloat(stats.average_session_duration_ms) || 0
    };
  }
}
