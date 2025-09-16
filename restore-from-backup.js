const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function restoreFromBackup() {
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

    // Drop all existing tables
    console.log("🗑️ Dropping all existing tables...");
    const dropTables = [
      "DROP TABLE IF EXISTS quiz_attempt_events CASCADE;",
      "DROP TABLE IF EXISTS quiz_attempt_sessions CASCADE;",
      "DROP TABLE IF EXISTS quiz_attempts CASCADE;",
      "DROP TABLE IF EXISTS quiz_questions CASCADE;",
      "DROP TABLE IF EXISTS quizzes CASCADE;",
      "DROP TABLE IF EXISTS pdf_files CASCADE;",
      "DROP TABLE IF EXISTS pdf_notes CASCADE;",
      "DROP TABLE IF EXISTS users CASCADE;",
    ];

    for (const query of dropTables) {
      await client.query(query);
    }
    console.log("✅ All tables dropped");

    // Read and execute backup file
    console.log("📖 Reading backup file...");
    const backupPath = path.join(__dirname, "qezee-backup.sql");

    if (!fs.existsSync(backupPath)) {
      throw new Error("Backup file not found: qezee-backup.sql");
    }

    const backupContent = fs.readFileSync(backupPath, "utf8");
    console.log("✅ Backup file read successfully");

    // Split SQL commands and execute them
    console.log("🔄 Executing backup SQL commands...");
    const sqlCommands = backupContent
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith("--"));

    let executedCount = 0;
    for (const command of sqlCommands) {
      if (command.trim()) {
        try {
          await client.query(command);
          executedCount++;
        } catch (error) {
          // Skip errors for commands that might already exist
          if (
            !error.message.includes("already exists") &&
            !error.message.includes("does not exist")
          ) {
            console.warn(`⚠️ Warning executing command: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ Executed ${executedCount} SQL commands`);

    // Verify tables were created
    console.log("🔍 Verifying tables...");
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

    // Check if test user exists, if not create one
    console.log("👤 Checking test user...");
    const userResult = await client.query(
      "SELECT id FROM users WHERE id = $1",
      ["550e8400-e29b-41d4-a716-446655440000"]
    );

    if (userResult.rows.length === 0) {
      console.log("Creating test user...");
      await client.query(
        `
        INSERT INTO users (id, name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
      `,
        [
          "550e8400-e29b-41d4-a716-446655440000",
          "testuser",
          "test@example.com",
          "hashed_password",
        ]
      );
      console.log("✅ Test user created");
    } else {
      console.log("✅ Test user already exists");
    }

    client.release();
    await pool.end();

    console.log("\n🎉 Database restored from backup successfully!");
    console.log("✅ Ready to use real database APIs!");
  } catch (error) {
    console.error("❌ Error restoring from backup:", error.message);
    await pool.end();
    process.exit(1);
  }
}

restoreFromBackup();
