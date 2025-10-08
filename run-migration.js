require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false }, // Always use SSL for Render.com
});

async function runMigration() {
  try {
    console.log("🔍 Connecting to database...");
    console.log("Database:", process.env.PGDATABASE);
    console.log("Host:", process.env.PGHOST);

    // Read migration file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "add_file_url_column.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📝 Running migration...");
    console.log("SQL:", migrationSQL);

    // Run migration
    await pool.query(migrationSQL);

    console.log("✅ Migration completed successfully!");

    // Verify the column was added
    const checkQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pdf_files' AND column_name = 'file_url'
    `;
    const result = await pool.query(checkQuery);

    if (result.rows.length > 0) {
      console.log("✅ Column file_url exists:", result.rows[0]);
    } else {
      console.log("❌ Column file_url was not created");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log("✅ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
