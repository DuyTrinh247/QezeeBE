const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createAIAnalysisTable() {
  try {
    console.log("🔍 Creating ai_quiz_analyses table...");

    const query = `
      CREATE TABLE IF NOT EXISTS ai_quiz_analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        analysis_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(quiz_id, attempt_id)
      );
      
      -- Create index for faster lookups
      CREATE INDEX IF NOT EXISTS idx_ai_quiz_analyses_quiz_id ON ai_quiz_analyses(quiz_id);
      CREATE INDEX IF NOT EXISTS idx_ai_quiz_analyses_attempt_id ON ai_quiz_analyses(attempt_id);
      CREATE INDEX IF NOT EXISTS idx_ai_quiz_analyses_quiz_attempt ON ai_quiz_analyses(quiz_id, attempt_id);
    `;

    await pool.query(query);
    console.log("✅ ai_quiz_analyses table created successfully!");

    // Check if table exists and show structure
    const checkQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ai_quiz_analyses' 
      ORDER BY ordinal_position;
    `;

    const result = await pool.query(checkQuery);
    console.log("📊 Table structure:");
    result.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (${
          row.is_nullable === "YES" ? "nullable" : "not null"
        })`
      );
    });
  } catch (error) {
    console.error("❌ Error creating ai_quiz_analyses table:", error);
  } finally {
    await pool.end();
  }
}

createAIAnalysisTable();
