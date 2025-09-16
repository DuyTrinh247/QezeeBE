const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || "qezee",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
});

async function migrateToV2() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting migration to Database Schema V2...");

    // 1. Thêm cột mới vào quiz_attempts
    console.log("📝 Adding new columns to quiz_attempts...");

    await client.query(`
      ALTER TABLE quiz_attempts 
      ADD COLUMN IF NOT EXISTS time_taken_milliseconds BIGINT,
      ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER,
      ADD COLUMN IF NOT EXISTS incorrect_answers INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS question_timings JSONB,
      ADD COLUMN IF NOT EXISTS ip_address INET,
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS device_info JSONB
    `);

    // 2. Cập nhật time_taken_seconds từ time_taken (sau khi đã tạo cột)
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
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz_status ON quiz_attempts(user_id, quiz_id, status)",
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_started_at ON quiz_attempts(user_id, started_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_quiz_attempt_events_attempt_type ON quiz_attempt_events(attempt_id, event_type)",
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }

    // 6. Tạo function để tính toán thời gian
    console.log("⚙️ Creating utility functions...");

    await client.query(`
      CREATE OR REPLACE FUNCTION calculate_quiz_duration(
        start_time TIMESTAMP,
        end_time TIMESTAMP
      ) RETURNS BIGINT AS $$
      BEGIN
        IF end_time IS NULL THEN
          RETURN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) * 1000;
        ELSE
          RETURN EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 7. Tạo function để cập nhật thời gian
    await client.query(`
      CREATE OR REPLACE FUNCTION update_quiz_attempt_timing(
        attempt_uuid UUID
      ) RETURNS VOID AS $$
      DECLARE
        attempt_record RECORD;
        duration_ms BIGINT;
      BEGIN
        SELECT * INTO attempt_record 
        FROM quiz_attempts 
        WHERE id = attempt_uuid;
        
        IF attempt_record IS NOT NULL THEN
          duration_ms := calculate_quiz_duration(
            attempt_record.started_at, 
            attempt_record.completed_at
          );
          
          UPDATE quiz_attempts 
          SET 
            time_taken_milliseconds = duration_ms,
            time_taken_seconds = ROUND(duration_ms / 1000)
          WHERE id = attempt_uuid;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 8. Cập nhật dữ liệu hiện có
    console.log("🔄 Updating existing data...");

    await client.query(`
      UPDATE quiz_attempts 
      SET 
        time_taken_milliseconds = EXTRACT(EPOCH FROM (COALESCE(completed_at, CURRENT_TIMESTAMP) - started_at)) * 1000,
        time_taken_seconds = ROUND(EXTRACT(EPOCH FROM (COALESCE(completed_at, CURRENT_TIMESTAMP) - started_at))),
        incorrect_answers = total_questions - correct_answers
      WHERE time_taken_milliseconds IS NULL
    `);

    // 9. Tạo trigger để tự động cập nhật thời gian
    console.log("🔧 Creating triggers...");

    await client.query(`
      CREATE OR REPLACE FUNCTION trigger_update_quiz_timing()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
          NEW.time_taken_milliseconds := calculate_quiz_duration(NEW.started_at, NEW.completed_at);
          NEW.time_taken_seconds := ROUND(NEW.time_taken_milliseconds / 1000);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_quiz_timing_trigger ON quiz_attempts;
      CREATE TRIGGER update_quiz_timing_trigger
        BEFORE UPDATE ON quiz_attempts
        FOR EACH ROW
        EXECUTE FUNCTION trigger_update_quiz_timing();
    `);

    console.log("✅ Migration to Database Schema V2 completed successfully!");

    // 10. Hiển thị thống kê
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_attempts,
        COUNT(CASE WHEN time_taken_milliseconds IS NOT NULL THEN 1 END) as attempts_with_timing,
        AVG(time_taken_seconds) as avg_time_seconds,
        MIN(time_taken_seconds) as min_time_seconds,
        MAX(time_taken_seconds) as max_time_seconds
      FROM quiz_attempts
    `);

    console.log("📊 Migration Statistics:");
    console.log(`   Total attempts: ${stats.rows[0].total_attempts}`);
    console.log(`   Completed attempts: ${stats.rows[0].completed_attempts}`);
    console.log(
      `   Attempts with timing: ${stats.rows[0].attempts_with_timing}`
    );
    console.log(
      `   Average time: ${Math.round(
        stats.rows[0].avg_time_seconds || 0
      )} seconds`
    );
    console.log(`   Min time: ${stats.rows[0].min_time_seconds || 0} seconds`);
    console.log(`   Max time: ${stats.rows[0].max_time_seconds || 0} seconds`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function rollbackV2() {
  const client = await pool.connect();

  try {
    console.log("🔄 Rolling back to Database Schema V1...");

    // Xóa trigger
    await client.query(
      "DROP TRIGGER IF EXISTS update_quiz_timing_trigger ON quiz_attempts"
    );

    // Xóa function
    await client.query("DROP FUNCTION IF EXISTS trigger_update_quiz_timing()");
    await client.query(
      "DROP FUNCTION IF EXISTS update_quiz_attempt_timing(UUID)"
    );
    await client.query(
      "DROP FUNCTION IF EXISTS calculate_quiz_duration(TIMESTAMP, TIMESTAMP)"
    );

    // Xóa bảng mới
    await client.query("DROP TABLE IF EXISTS quiz_attempt_events CASCADE");
    await client.query("DROP TABLE IF EXISTS quiz_attempt_sessions CASCADE");

    // Xóa cột mới
    await client.query(`
      ALTER TABLE quiz_attempts 
      DROP COLUMN IF EXISTS time_taken_milliseconds,
      DROP COLUMN IF EXISTS time_limit_seconds,
      DROP COLUMN IF EXISTS incorrect_answers,
      DROP COLUMN IF EXISTS question_timings,
      DROP COLUMN IF EXISTS ip_address,
      DROP COLUMN IF EXISTS user_agent,
      DROP COLUMN IF EXISTS device_info
    `);

    console.log("✅ Rollback completed successfully!");
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Chạy migration
if (require.main === module) {
  const command = process.argv[2];

  if (command === "rollback") {
    rollbackV2()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    migrateToV2()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}

module.exports = { migrateToV2, rollbackV2 };
