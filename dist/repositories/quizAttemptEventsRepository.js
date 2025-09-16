"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizAttemptEventsRepository = void 0;
const db_1 = require("../db");
class QuizAttemptEventsRepository {
    constructor() {
        this.pool = db_1.db;
    }
    async create(data) {
        const fields = ['attempt_id', 'event_type', 'event_timestamp'];
        const values = [data.attempt_id, data.event_type, data.event_timestamp];
        let paramCount = 3;
        if (data.event_data !== undefined) {
            fields.push('event_data');
            values.push(JSON.stringify(data.event_data));
            paramCount++;
        }
        if (data.question_id !== undefined) {
            fields.push('question_id');
            values.push(data.question_id);
            paramCount++;
        }
        if (data.question_number !== undefined) {
            fields.push('question_number');
            values.push(data.question_number.toString());
            paramCount++;
        }
        if (data.time_spent_ms !== undefined) {
            fields.push('time_spent_ms');
            values.push(data.time_spent_ms.toString());
            paramCount++;
        }
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
        const query = `
      INSERT INTO quiz_attempt_events (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async findByAttemptId(attemptId, limit, offset) {
        let query = `
      SELECT * FROM quiz_attempt_events 
      WHERE attempt_id = $1 
      ORDER BY event_timestamp ASC
    `;
        const values = [attemptId];
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
    async findByFilter(filter) {
        const conditions = [];
        const values = [];
        let paramCount = 1;
        if (filter.attempt_id) {
            conditions.push(`attempt_id = $${paramCount++}`);
            values.push(filter.attempt_id);
        }
        if (filter.event_type) {
            conditions.push(`event_type = $${paramCount++}`);
            values.push(filter.event_type);
        }
        if (filter.question_id) {
            conditions.push(`question_id = $${paramCount++}`);
            values.push(filter.question_id);
        }
        if (filter.start_date) {
            conditions.push(`event_timestamp >= $${paramCount++}`);
            values.push(filter.start_date);
        }
        if (filter.end_date) {
            conditions.push(`event_timestamp <= $${paramCount++}`);
            values.push(filter.end_date);
        }
        let query = `
      SELECT * FROM quiz_attempt_events 
      ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY event_timestamp ASC
    `;
        if (filter.limit) {
            query += ` LIMIT $${paramCount++}`;
            values.push(filter.limit.toString());
        }
        if (filter.offset) {
            query += ` OFFSET $${paramCount++}`;
            values.push(filter.offset.toString());
        }
        const result = await this.pool.query(query, values);
        return result.rows;
    }
    async findById(id) {
        const query = 'SELECT * FROM quiz_attempt_events WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }
    async delete(id) {
        const query = 'DELETE FROM quiz_attempt_events WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return (result.rowCount || 0) > 0;
    }
    async deleteByAttemptId(attemptId) {
        const query = 'DELETE FROM quiz_attempt_events WHERE attempt_id = $1';
        const result = await this.pool.query(query, [attemptId]);
        return (result.rowCount || 0) > 0;
    }
    async getEventStats(attemptId) {
        // Tổng số events
        const totalQuery = `
      SELECT COUNT(*) as total_events
      FROM quiz_attempt_events 
      WHERE attempt_id = $1
    `;
        const totalResult = await this.pool.query(totalQuery, [attemptId]);
        const totalEvents = parseInt(totalResult.rows[0].total_events);
        // Events theo loại
        const typeQuery = `
      SELECT event_type, COUNT(*) as count
      FROM quiz_attempt_events 
      WHERE attempt_id = $1
      GROUP BY event_type
    `;
        const typeResult = await this.pool.query(typeQuery, [attemptId]);
        const eventsByType = typeResult.rows.reduce((acc, row) => {
            acc[row.event_type] = parseInt(row.count);
            return acc;
        }, {});
        // Tổng thời gian và hiệu suất câu hỏi
        const performanceQuery = `
      SELECT 
        question_id,
        question_number,
        SUM(time_spent_ms) as total_time_spent_ms,
        COUNT(*) as event_count
      FROM quiz_attempt_events 
      WHERE attempt_id = $1 AND question_id IS NOT NULL
      GROUP BY question_id, question_number
      ORDER BY question_number
    `;
        const performanceResult = await this.pool.query(performanceQuery, [attemptId]);
        const questionPerformance = performanceResult.rows.map(row => ({
            question_id: row.question_id,
            question_number: parseInt(row.question_number),
            time_spent_ms: parseInt(row.total_time_spent_ms) || 0,
            event_count: parseInt(row.event_count)
        }));
        const totalTimeSpentMs = questionPerformance.reduce((sum, q) => sum + q.time_spent_ms, 0);
        const averageTimePerQuestionMs = questionPerformance.length > 0
            ? totalTimeSpentMs / questionPerformance.length
            : 0;
        return {
            total_events: totalEvents,
            events_by_type: eventsByType,
            total_time_spent_ms: totalTimeSpentMs,
            average_time_per_question_ms: averageTimePerQuestionMs,
            question_performance: questionPerformance
        };
    }
    async getTimeline(attemptId) {
        const query = `
      SELECT 
        event_timestamp as timestamp,
        event_type,
        question_number,
        time_spent_ms,
        event_data
      FROM quiz_attempt_events 
      WHERE attempt_id = $1
      ORDER BY event_timestamp ASC
    `;
        const result = await this.pool.query(query, [attemptId]);
        return result.rows.map(row => ({
            timestamp: row.timestamp,
            event_type: row.event_type,
            question_number: row.question_number,
            time_spent_ms: row.time_spent_ms,
            event_data: row.event_data
        }));
    }
}
exports.QuizAttemptEventsRepository = QuizAttemptEventsRepository;
