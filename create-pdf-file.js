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

async function createPdfFile() {
  try {
    console.log("🔍 Creating PDF file record...");

    const query = `
      INSERT INTO pdf_files (id, filename, file_path, uploaded_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `;

    const pdfFileId = "3d0a5094-1711-4295-8f04-414f1eafe774";
    const filename = "test-document.pdf";
    const filePath = "/uploads/test-document.pdf";
    const uploadedBy = "a6c8b068-ad91-4105-8f53-be47c5c4e4e5"; // testuser ID

    const result = await pool.query(query, [
      pdfFileId,
      filename,
      filePath,
      uploadedBy,
    ]);

    if (result.rows.length > 0) {
      console.log("✅ PDF file record created successfully!");
      console.log("PDF file data:", result.rows[0]);
    } else {
      console.log("ℹ️ PDF file record already exists");
    }

    // Check if the record exists
    const checkQuery = `SELECT * FROM pdf_files WHERE id = $1;`;
    const checkResult = await pool.query(checkQuery, [pdfFileId]);

    if (checkResult.rows.length > 0) {
      console.log("📊 PDF file record found:", checkResult.rows[0]);
    } else {
      console.log("❌ PDF file record not found");
    }
  } catch (error) {
    console.error("❌ Error creating PDF file record:", error);
  } finally {
    await pool.end();
  }
}

createPdfFile();
