const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || "qezee",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
});

async function migrateSimple() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting simple migration...");

    // 1. Thêm cột time_taken_seconds nếu chưa có
    console.log("📝 Adding time_taken_seconds column...");
    await client.query(`
      ALTER TABLE quiz_attempts 
      ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER
    `);

    // 2. Cập nhật time_taken_seconds từ time_taken
    console.log("🔄 Updating time_taken_seconds from time_taken...");
    await client.query(`
      UPDATE quiz_attempts 
      SET time_taken_seconds = time_taken 
      WHERE time_taken_seconds IS NULL AND time_taken IS NOT NULL
    `);

    // 3. Tạo bảng quiz_attempt_sessions
    console.log("📊 Creating quiz_attempt_sessions table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempt_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        session_start TIMESTAMP NOT NULL,
        session_end TIMESTAMP,
        session_duration_ms BIGINT,
        pause_count INTEGER DEFAULT 0,
        total_pause_duration_ms BIGINT DEFAULT 0,
        last_activity TIMESTAMP,
        browser_info JSONB,
        screen_resolution TEXT,
        timezone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Tạo bảng quiz_attempt_events
    console.log("📈 Creating quiz_attempt_events table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempt_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        event_timestamp TIMESTAMP NOT NULL,
        event_data JSONB,
        question_id UUID,
        question_number INTEGER,
        time_spent_ms BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Tạo indexes
    console.log("🔍 Creating indexes...");
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempt_sessions_attempt_id ON quiz_attempt_sessions(attempt_id)",
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempt_sessions_session_start ON quiz_attempt_sessions(session_start)",
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempt_events_attempt_id ON quiz_attempt_events(attempt_id)",
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempt_events_event_type ON quiz_attempt_events(event_type)",
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempt_events_event_timestamp ON quiz_attempt_events(event_timestamp)",
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempt_events_question_id ON quiz_attempt_events(question_id)",
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempts_started_at ON quiz_attempts(started_at)",
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at)",
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }

    console.log("✅ Simple migration completed successfully!");

    // 6. Hiển thị thống kê
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_attempts,
        COUNT(CASE WHEN time_taken_seconds IS NOT NULL THEN 1 END) as attempts_with_timing
      FROM quiz_attempts
    `);

    console.log("📊 Migration Statistics:");
    console.log(`   Total attempts: ${stats.rows[0].total_attempts}`);
    console.log(`   Completed attempts: ${stats.rows[0].completed_attempts}`);
    console.log(
      `   Attempts with timing: ${stats.rows[0].attempts_with_timing}`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

migrateSimple()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
