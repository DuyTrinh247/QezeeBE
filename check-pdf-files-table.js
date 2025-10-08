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

async function checkPdfFilesTable() {
  try {
    console.log("🔍 Checking pdf_files table structure...");

    // Check table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'pdf_files'
      ORDER BY ordinal_position;
    `;

    const structureResult = await pool.query(structureQuery);
    console.log("📊 pdf_files table structure:");
    structureResult.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (${
          row.is_nullable === "YES" ? "nullable" : "not null"
        })`
      );
    });

    // Check existing records
    const recordsQuery = `SELECT * FROM pdf_files LIMIT 5;`;
    const recordsResult = await pool.query(recordsQuery);
    console.log("\n📋 Existing pdf_files records:");
    recordsResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}.`, row);
    });
  } catch (error) {
    console.error("❌ Error checking pdf_files table:", error);
  } finally {
    await pool.end();
  }
}

checkPdfFilesTable();
