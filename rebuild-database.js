const { Pool } = require("pg");
require("dotenv").config();

async function rebuildDatabase() {
  const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    console.log("🔗 Connected to database");

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log("✅ UUID extension enabled");

    // Drop existing tables (in correct order due to foreign keys)
    console.log("🗑️ Dropping existing tables...");
    const dropTables = [
      "DROP TABLE IF EXISTS quiz_attempt_events CASCADE;",
      "DROP TABLE IF EXISTS quiz_attempt_sessions CASCADE;",
      "DROP TABLE IF EXISTS quiz_attempts CASCADE;",
      "DROP TABLE IF EXISTS quiz_questions CASCADE;",
      "DROP TABLE IF EXISTS quizzes CASCADE;",
      "DROP TABLE IF EXISTS pdf_files CASCADE;",
      "DROP TABLE IF EXISTS pdf_notes CASCADE;",
      "DROP TABLE IF EXISTS users CASCADE;",
    ];

    for (const query of dropTables) {
      await client.query(query);
    }
    console.log("✅ Existing tables dropped");

    // Create users table
    console.log("👥 Creating users table...");
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT,
        google_id TEXT UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table created");

    // Create pdf_files table
    console.log("📄 Creating pdf_files table...");
    await client.query(`
      CREATE TABLE pdf_files (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        file_type TEXT NOT NULL DEFAULT 'application/pdf',
        upload_status TEXT NOT NULL DEFAULT 'uploaded',
        processing_status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ PDF files table created");

    // Create pdf_notes table
    console.log("📝 Creating pdf_notes table...");
    await client.query(`
      CREATE TABLE pdf_notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pdf_file_id UUID NOT NULL REFERENCES pdf_files(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ PDF notes table created");

    // Create quizzes table
    console.log("🧩 Creating quizzes table...");
    await client.query(`
      CREATE TABLE quizzes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pdf_file_id UUID NOT NULL REFERENCES pdf_files(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        total_questions INTEGER NOT NULL DEFAULT 0,
        time_limit INTEGER,
        difficulty_level TEXT DEFAULT 'medium',
        quiz_data JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Quizzes table created");

    // Create quiz_questions table
    console.log("❓ Creating quiz_questions table...");
    await client.query(`
      CREATE TABLE quiz_questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL DEFAULT 'multiple_choice',
        options JSONB,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        points INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Quiz questions table created");

    // Create quiz_attempts table
    console.log("🎯 Creating quiz_attempts table...");
    await client.query(`
      CREATE TABLE quiz_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        time_taken_seconds INTEGER,
        time_taken_milliseconds BIGINT,
        time_limit_seconds INTEGER,
        score INTEGER DEFAULT 0,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER DEFAULT 0,
        incorrect_answers INTEGER DEFAULT 0,
        answers JSONB,
        question_timings JSONB,
        status TEXT NOT NULL DEFAULT 'in_progress',
        ip_address INET,
        user_agent TEXT,
        device_info JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Quiz attempts table created");

    // Create quiz_attempt_sessions table
    console.log("📊 Creating quiz_attempt_sessions table...");
    await client.query(`
      CREATE TABLE quiz_attempt_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        session_start TIMESTAMP WITH TIME ZONE NOT NULL,
        session_end TIMESTAMP WITH TIME ZONE,
        session_duration_ms BIGINT,
        pause_count INTEGER DEFAULT 0,
        total_pause_duration_ms BIGINT DEFAULT 0,
        last_activity TIMESTAMP WITH TIME ZONE,
        browser_info JSONB,
        screen_resolution TEXT,
        timezone TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Quiz attempt sessions table created");

    // Create quiz_attempt_events table
    console.log("📈 Creating quiz_attempt_events table...");
    await client.query(`
      CREATE TABLE quiz_attempt_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        event_data JSONB,
        question_id UUID,
        question_number INTEGER,
        time_spent_ms BIGINT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Quiz attempt events table created");

    // Create indexes
    console.log("🔍 Creating indexes...");
    const indexes = [
      "CREATE INDEX idx_pdf_files_user_id ON pdf_files(user_id);",
      "CREATE INDEX idx_pdf_files_processing_status ON pdf_files(processing_status);",
      "CREATE INDEX idx_quizzes_pdf_file_id ON quizzes(pdf_file_id);",
      "CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);",
      "CREATE INDEX idx_quizzes_status ON quizzes(status);",
      "CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);",
      "CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);",
      "CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);",
      "CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);",
      "CREATE INDEX idx_quiz_attempts_started_at ON quiz_attempts(started_at);",
      "CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);",
      "CREATE INDEX idx_quiz_attempt_sessions_attempt_id ON quiz_attempt_sessions(attempt_id);",
      "CREATE INDEX idx_quiz_attempt_sessions_session_start ON quiz_attempt_sessions(session_start);",
      "CREATE INDEX idx_quiz_attempt_events_attempt_id ON quiz_attempt_events(attempt_id);",
      "CREATE INDEX idx_quiz_attempt_events_event_type ON quiz_attempt_events(event_type);",
      "CREATE INDEX idx_quiz_attempt_events_event_timestamp ON quiz_attempt_events(event_timestamp);",
      "CREATE INDEX idx_quiz_attempt_events_question_id ON quiz_attempt_events(question_id);",
      "CREATE INDEX idx_quiz_attempts_user_quiz_status ON quiz_attempts(user_id, quiz_id, status);",
      "CREATE INDEX idx_quiz_attempts_user_started_at ON quiz_attempts(user_id, started_at DESC);",
      "CREATE INDEX idx_quiz_attempt_events_attempt_type ON quiz_attempt_events(attempt_id, event_type);",
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log("✅ Indexes created");

    // Create test user
    console.log("👤 Creating test user...");
    await client.query(
      `
      INSERT INTO users (id, name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `,
      [
        "550e8400-e29b-41d4-a716-446655440000",
        "testuser",
        "test@example.com",
        "hashed_password",
      ]
    );
    console.log("✅ Test user created");

    client.release();
    await pool.end();

    console.log("\n🎉 Database rebuilt successfully!");
    console.log("📋 Tables created:");
    console.log("  - users");
    console.log("  - pdf_files");
    console.log("  - pdf_notes");
    console.log("  - quizzes");
    console.log("  - quiz_questions");
    console.log("  - quiz_attempts");
    console.log("  - quiz_attempt_sessions");
    console.log("  - quiz_attempt_events");
    console.log("\n✅ Ready to use real database APIs!");
  } catch (error) {
    console.error("❌ Error rebuilding database:", error.message);
    await pool.end();
    process.exit(1);
  }
}

rebuildDatabase();
