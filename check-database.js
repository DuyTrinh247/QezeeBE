const { Pool } = require("pg");
require("dotenv").config();

async function checkDatabase() {
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

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("📋 Tables in database:");
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    // Check users
    const usersResult = await client.query("SELECT * FROM users");
    console.log(`\n👥 Users in database: ${usersResult.rows.length}`);
    usersResult.rows.forEach((user) => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`);
    });

    // Check pdf_files
    const pdfFilesResult = await client.query("SELECT * FROM pdf_files");
    console.log(`\n📄 PDF files in database: ${pdfFilesResult.rows.length}`);

    // Check quizzes
    const quizzesResult = await client.query("SELECT * FROM quizzes");
    console.log(`\n🧩 Quizzes in database: ${quizzesResult.rows.length}`);

    client.release();
    await pool.end();
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    await pool.end();
  }
}

checkDatabase();
