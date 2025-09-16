#!/usr/bin/env node

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
});

async function testDatabase() {
  try {
    console.log("🔍 Testing database connection and structure...\n");

    // Test connection
    const connectionResult = await pool.query(
      "SELECT NOW() as current_time, version() as db_version"
    );
    console.log("✅ Database connection successful!");
    console.log(`   Current time: ${connectionResult.rows[0].current_time}`);
    console.log(
      `   Database version: ${connectionResult.rows[0].db_version}\n`
    );

    // Check tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("📋 Available tables:");
    tablesResult.rows.forEach((row) => console.log(`   - ${row.table_name}`));
    console.log();

    // Test inserting a user
    console.log("🧪 Testing user creation...");
    const insertResult = await pool.query(
      `
      INSERT INTO users (name, email, password_hash) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, email, created_at
    `,
      ["Test User", "test@example.com", "hashed_password_123"]
    );

    console.log("✅ User created successfully!");
    console.log(`   ID: ${insertResult.rows[0].id}`);
    console.log(`   Name: ${insertResult.rows[0].name}`);
    console.log(`   Email: ${insertResult.rows[0].email}`);
    console.log(`   Created: ${insertResult.rows[0].created_at}\n`);

    // Test querying users
    console.log("🔍 Testing user query...");
    const usersResult = await pool.query(
      "SELECT COUNT(*) as user_count FROM users"
    );
    console.log(
      `✅ Found ${usersResult.rows[0].user_count} users in database\n`
    );

    // Test PDF file creation
    console.log("🧪 Testing PDF file creation...");
    const pdfResult = await pool.query(
      `
      INSERT INTO pdf_files (user_id, original_name, file_path, file_size, content) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, original_name, file_size, created_at
    `,
      [
        insertResult.rows[0].id,
        "test.pdf",
        "/uploads/test.pdf",
        1024,
        "Test PDF content",
      ]
    );

    console.log("✅ PDF file created successfully!");
    console.log(`   ID: ${pdfResult.rows[0].id}`);
    console.log(`   Name: ${pdfResult.rows[0].original_name}`);
    console.log(`   Size: ${pdfResult.rows[0].file_size} bytes`);
    console.log(`   Created: ${pdfResult.rows[0].created_at}\n`);

    // Test quiz creation
    console.log("🧪 Testing quiz creation...");
    const quizResult = await pool.query(
      `
      INSERT INTO quizzes (user_id, pdf_file_id, title, description, quiz_data, total_questions) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, title, total_questions, created_at
    `,
      [
        insertResult.rows[0].id,
        pdfResult.rows[0].id,
        "Test Quiz",
        "A test quiz",
        JSON.stringify({ questions: [] }),
        0,
      ]
    );

    console.log("✅ Quiz created successfully!");
    console.log(`   ID: ${quizResult.rows[0].id}`);
    console.log(`   Title: ${quizResult.rows[0].title}`);
    console.log(`   Questions: ${quizResult.rows[0].total_questions}`);
    console.log(`   Created: ${quizResult.rows[0].created_at}\n`);

    console.log("🎉 All database tests passed successfully!");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase();
