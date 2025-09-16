const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || "qezee",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
  ssl: { rejectUnauthorized: false },
});

async function addNotesTable() {
  try {
    console.log("🔍 Connecting to database...");

    // Tạo bảng pdf_notes
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS pdf_notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pdf_file_id UUID NOT NULL REFERENCES pdf_files(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL DEFAULT 'Untitled Note',
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log("✅ Created pdf_notes table");

    // Tạo indexes
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_pdf_notes_pdf_file_id ON pdf_notes(pdf_file_id);
      CREATE INDEX IF NOT EXISTS idx_pdf_notes_user_id ON pdf_notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_pdf_notes_created_at ON pdf_notes(created_at);
    `;

    await pool.query(createIndexesQuery);
    console.log("✅ Created indexes for pdf_notes table");

    // Thêm sample data
    const sampleNotesQuery = `
      INSERT INTO pdf_notes (pdf_file_id, user_id, title, content)
      SELECT 
        pf.id as pdf_file_id,
        pf.user_id,
        'Sample Note for ' || pf.original_name as title,
        'This is a sample note for the PDF file: ' || pf.original_name || '. You can edit this note or add new ones.' as content
      FROM pdf_files pf
      WHERE pf.id IN (
        SELECT id FROM pdf_files 
        WHERE processing_status = 'completed' 
        LIMIT 3
      )
      ON CONFLICT DO NOTHING;
    `;

    const result = await pool.query(sampleNotesQuery);
    console.log("✅ Added sample notes data");

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

addNotesTable().catch(console.error);
