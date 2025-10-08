const { Pool } = require("pg");
require("dotenv").config();

async function addQuizDataColumn() {
  const pool = new Pool({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT || "5432"),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🔍 Checking if quiz_data column exists...");

    // Check if column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_attempts' 
      AND column_name = 'quiz_data'
    `);

    if (checkColumn.rows.length > 0) {
      console.log("✅ Column quiz_data already exists!");
      return;
    }

    console.log("📝 Adding quiz_data column to quiz_attempts table...");

    // Add quiz_data column
    await pool.query(`
      ALTER TABLE quiz_attempts 
      ADD COLUMN quiz_data JSONB DEFAULT NULL
    `);

    console.log("✅ Column quiz_data added successfully!");

    // Verify
    const verify = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_attempts' 
      AND column_name = 'quiz_data'
    `);

    console.log("🔍 Verification:", verify.rows);
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

addQuizDataColumn()
  .then(() => {
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
