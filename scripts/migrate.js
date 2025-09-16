const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

async function migrate() {
  // Sử dụng database qezee nếu không có DATABASE_URL
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/qezee";
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        password TEXT,
        email TEXT,
        google_id TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Xóa bảng quizzes cũ nếu tồn tại
    await client.query(`DROP TABLE IF EXISTS quizzes CASCADE;`);

    // Tạo bảng pdf_files để lưu thông tin file PDF
    await client.query(`
      CREATE TABLE IF NOT EXISTS pdf_files (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        file_type TEXT NOT NULL DEFAULT 'application/pdf',
        upload_status TEXT NOT NULL DEFAULT 'uploaded',
        processing_status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tạo bảng quizzes để lưu thông tin quiz được tạo từ PDF
    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pdf_file_id UUID NOT NULL REFERENCES pdf_files(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        total_questions INTEGER NOT NULL DEFAULT 0,
        time_limit INTEGER, -- thời gian làm bài (phút)
        difficulty_level TEXT DEFAULT 'medium', -- easy, medium, hard
        quiz_data JSONB NOT NULL, -- chứa toàn bộ dữ liệu quiz
        status TEXT NOT NULL DEFAULT 'active', -- active, inactive, archived
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tạo bảng quiz_questions để lưu từng câu hỏi
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- multiple_choice, true_false, fill_blank
        options JSONB, -- array of options for multiple choice
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        points INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tạo bảng quiz_attempts để lưu lần làm quiz của user
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        time_taken INTEGER, -- thời gian làm bài (giây)
        score INTEGER DEFAULT 0,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER DEFAULT 0,
        answers JSONB, -- lưu câu trả lời của user
        status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, abandoned
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tạo trigger để tự động cập nhật updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tạo trigger cho bảng pdf_files
    await client.query(`
      DROP TRIGGER IF EXISTS update_pdf_files_updated_at ON pdf_files;
      CREATE TRIGGER update_pdf_files_updated_at
        BEFORE UPDATE ON pdf_files
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tạo trigger cho bảng quizzes
    await client.query(`
      DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
      CREATE TRIGGER update_quizzes_updated_at
        BEFORE UPDATE ON quizzes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tạo trigger cho bảng quiz_questions
    await client.query(`
      DROP TRIGGER IF EXISTS update_quiz_questions_updated_at ON quiz_questions;
      CREATE TRIGGER update_quiz_questions_updated_at
        BEFORE UPDATE ON quiz_questions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tạo trigger cho bảng quiz_attempts
    await client.query(`
      DROP TRIGGER IF EXISTS update_quiz_attempts_updated_at ON quiz_attempts;
      CREATE TRIGGER update_quiz_attempts_updated_at
        BEFORE UPDATE ON quiz_attempts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tạo indexes để tối ưu performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pdf_files_user_id ON pdf_files(user_id);
      CREATE INDEX IF NOT EXISTS idx_pdf_files_processing_status ON pdf_files(processing_status);
      CREATE INDEX IF NOT EXISTS idx_quizzes_pdf_file_id ON quizzes(pdf_file_id);
      CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
      CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);
    `);

    console.log("Migration completed: All tables created successfully!");
    console.log(
      "Tables: users, pdf_files, quizzes, quiz_questions, quiz_attempts"
    );
  } finally {
    await client.end();
  }
}

migrate().catch((err) => {
  console.error("Migration error:", err.message || err);
  process.exit(1);
});
