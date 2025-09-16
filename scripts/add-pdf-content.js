const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || "qezee",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
});

async function addPdfContent() {
  const client = await pool.connect();

  try {
    console.log("🚀 Adding PDF content fields...");

    // Add content field to pdf_files table
    console.log("📝 Adding content field to pdf_files...");
    await client.query(`
      ALTER TABLE pdf_files 
      ADD COLUMN IF NOT EXISTS content TEXT,
      ADD COLUMN IF NOT EXISTS content_extracted_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS content_length INTEGER
    `);

    console.log("✅ PDF content fields added successfully!");

    // Check current structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'pdf_files'
      ORDER BY ordinal_position;
    `);

    console.log("\n📋 Updated pdf_files columns:");
    columns.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (${
          row.is_nullable === "YES" ? "nullable" : "not null"
        })`
      );
    });

  } catch (error) {
    console.error("❌ Error adding PDF content fields:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addPdfContent();
