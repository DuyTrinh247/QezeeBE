import { Pool } from 'pg';

export class AIAnalysisRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Create or update AI analysis
  async createOrUpdate(quizId: string, attemptId: string, analysisData: any): Promise<any> {
    const query = `
      INSERT INTO ai_quiz_analyses (quiz_id, attempt_id, analysis_data)
      VALUES ($1, $2, $3)
      ON CONFLICT (quiz_id, attempt_id)
      DO UPDATE SET 
        analysis_data = $3,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const values = [quizId, attemptId, JSON.stringify(analysisData)];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Get AI analysis by quiz and attempt
  async getByQuizAndAttempt(quizId: string, attemptId: string): Promise<any | null> {
    const query = `
      SELECT * FROM ai_quiz_analyses 
      WHERE quiz_id = $1 AND attempt_id = $2
    `;
    
    const result = await this.pool.query(query, [quizId, attemptId]);
    return result.rows[0] || null;
  }

  // Get AI analysis by quiz ID (latest analysis for the quiz)
  async getByQuizId(quizId: string): Promise<any | null> {
    const query = `
      SELECT * FROM ai_quiz_analyses 
      WHERE quiz_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await this.pool.query(query, [quizId]);
    return result.rows[0] || null;
  }

  // Delete AI analysis
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM ai_quiz_analyses WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // Delete AI analysis by quiz and attempt
  async deleteByQuizAndAttempt(quizId: string, attemptId: string): Promise<boolean> {
    const query = 'DELETE FROM ai_quiz_analyses WHERE quiz_id = $1 AND attempt_id = $2';
    const result = await this.pool.query(query, [quizId, attemptId]);
    return (result.rowCount || 0) > 0;
  }

  // Get AI analysis by quiz (latest analysis for the quiz)
  async getByQuiz(quizId: string): Promise<any | null> {
    const query = `
      SELECT * FROM ai_quiz_analyses 
      WHERE quiz_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await this.pool.query(query, [quizId]);
    return result.rows[0] || null;
  }

  // Check if analysis exists
  async exists(quizId: string, attemptId: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM ai_quiz_analyses 
        WHERE quiz_id = $1 AND attempt_id = $2
      )
    `;
    
    const result = await this.pool.query(query, [quizId, attemptId]);
    return result.rows[0].exists;
  }

  // Check if analysis exists for quiz
  async existsByQuiz(quizId: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM ai_quiz_analyses 
        WHERE quiz_id = $1
      )
    `;
    
    const result = await this.pool.query(query, [quizId]);
    return result.rows[0].exists;
  }
}
