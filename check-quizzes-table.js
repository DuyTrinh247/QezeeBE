const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function checkQuizzesTable() {
  try {
    console.log("🔍 Checking quizzes table structure...");

    // Check table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'quizzes'
      ORDER BY ordinal_position;
    `;

    const structureResult = await pool.query(structureQuery);
    console.log("📊 quizzes table structure:");
    structureResult.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === "YES" ? "nullable" : "not null"})`);
    });

    // Check existing quiz records
    const recordsQuery = `SELECT id, title, created_at FROM quizzes ORDER BY created_at DESC LIMIT 3;`;
    const recordsResult = await pool.query(recordsQuery);
    console.log("\n📋 Recent quiz records:");
    recordsResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}, Title: ${row.title}, Created: ${row.created_at}`);
    });

    // Check if there's a specific quiz we're working with
    const specificQuizQuery = `SELECT * FROM quizzes WHERE id = '84b5d086-9d20-4bb8-a582-e6349f26e338';`;
    const specificQuizResult = await pool.query(specificQuizQuery);
    console.log("\n🔍 Specific quiz (84b5d086-9d20-4bb8-a582-e6349f26e338):");
    if (specificQuizResult.rows.length > 0) {
      console.log("Quiz data:", specificQuizResult.rows[0]);
    } else {
      console.log("Quiz not found");
    }

  } catch (error) {
    console.error("❌ Error checking quizzes table:", error);
  } finally {
    await pool.end();
  }
}

checkQuizzesTable();
