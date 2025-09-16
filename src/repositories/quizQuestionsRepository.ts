import { Pool } from 'pg';
import { db } from '../db';

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_number: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options: any; // JSONB array of options
  correct_answer: string;
  explanation: string | null;
  points: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuizQuestionData {
  quiz_id: string;
  question_number: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: any;
  correct_answer: string;
  explanation?: string;
  points?: number;
}

export interface UpdateQuizQuestionData {
  question_text?: string;
  question_type?: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: any;
  correct_answer?: string;
  explanation?: string;
  points?: number;
}

export class QuizQuestionsRepository {
  private pool: Pool;

  constructor() {
    this.pool = db;
  }

  async create(data: CreateQuizQuestionData): Promise<QuizQuestion> {
    const query = `
      INSERT INTO quiz_questions (
        quiz_id, question_number, question_text, question_type, 
        options, correct_answer, explanation, points
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.quiz_id,
      data.question_number,
      data.question_text,
      data.question_type,
      data.options || null,
      data.correct_answer,
      data.explanation || null,
      data.points || 1
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async createMany(questions: CreateQuizQuestionData[]): Promise<QuizQuestion[]> {
    if (questions.length === 0) return [];

    const query = `
      INSERT INTO quiz_questions (
        quiz_id, question_number, question_text, question_type, 
        options, correct_answer, explanation, points
      )
      VALUES ${questions.map((_, index) => {
        const baseIndex = index * 8;
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8})`;
      }).join(', ')}
      RETURNING *
    `;

    const values = questions.flatMap(q => [
      q.quiz_id,
      q.question_number,
      q.question_text,
      q.question_type,
      q.options || null,
      q.correct_answer,
      q.explanation || null,
      q.points || 1
    ]);

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async findById(id: string): Promise<QuizQuestion | null> {
    const query = 'SELECT * FROM quiz_questions WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByQuizId(quizId: string): Promise<QuizQuestion[]> {
    const query = 'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY question_number ASC';
    const result = await this.pool.query(query, [quizId]);
    return result.rows;
  }

  async update(id: string, data: UpdateQuizQuestionData): Promise<QuizQuestion | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.question_text !== undefined) {
      fields.push(`question_text = $${paramCount++}`);
      values.push(data.question_text);
    }

    if (data.question_type !== undefined) {
      fields.push(`question_type = $${paramCount++}`);
      values.push(data.question_type);
    }

    if (data.options !== undefined) {
      fields.push(`options = $${paramCount++}`);
      values.push(JSON.stringify(data.options));
    }

    if (data.correct_answer !== undefined) {
      fields.push(`correct_answer = $${paramCount++}`);
      values.push(data.correct_answer);
    }

    if (data.explanation !== undefined) {
      fields.push(`explanation = $${paramCount++}`);
      values.push(data.explanation);
    }

    if (data.points !== undefined) {
      fields.push(`points = $${paramCount++}`);
      values.push(data.points);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE quiz_questions 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM quiz_questions WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  async deleteByQuizId(quizId: string): Promise<number> {
    const query = 'DELETE FROM quiz_questions WHERE quiz_id = $1';
    const result = await this.pool.query(query, [quizId]);
    return result.rowCount || 0;
  }

  async getQuestionCount(quizId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = $1';
    const result = await this.pool.query(query, [quizId]);
    return parseInt(result.rows[0].count);
  }

  async getQuestionsByType(quizId: string, questionType: string): Promise<QuizQuestion[]> {
    const query = 'SELECT * FROM quiz_questions WHERE quiz_id = $1 AND question_type = $2 ORDER BY question_number ASC';
    const result = await this.pool.query(query, [quizId, questionType]);
    return result.rows;
  }
}
