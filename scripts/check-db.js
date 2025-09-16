const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || "qezee",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
});

async function checkDatabase() {
  const client = await pool.connect();

  try {
    console.log("🔍 Checking database structure...");

    // Check if quiz_attempts table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quiz_attempts'
      );
    `);

    console.log("quiz_attempts table exists:", tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Get column information
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'quiz_attempts'
        ORDER BY ordinal_position;
      `);

      console.log("\n📋 Current columns in quiz_attempts:");
      columns.rows.forEach((row) => {
        console.log(
          `  - ${row.column_name}: ${row.data_type} (${
            row.is_nullable === "YES" ? "nullable" : "not null"
          })`
        );
      });

      // Check if new columns exist
      const newColumns = [
        "time_taken_seconds",
        "time_taken_milliseconds",
        "time_limit_seconds",
        "incorrect_answers",
      ];
      console.log("\n🔍 Checking for new columns:");
      for (const col of newColumns) {
        const exists = columns.rows.some((row) => row.column_name === col);
        console.log(`  - ${col}: ${exists ? "✅ EXISTS" : "❌ MISSING"}`);
      }
    }

    // Check if new tables exist
    const newTables = ["quiz_attempt_sessions", "quiz_attempt_events"];
    console.log("\n🔍 Checking for new tables:");
    for (const table of newTables) {
      const exists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        );
      `);
      console.log(
        `  - ${table}: ${exists.rows[0].exists ? "✅ EXISTS" : "❌ MISSING"}`
      );
    }
  } catch (error) {
    console.error("❌ Error checking database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDatabase();
