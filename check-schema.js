const { Pool } = require("pg");
require("dotenv").config();

async function checkSchema() {
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

    // Check users table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log("Users table structure:");
    result.rows.forEach((row) => {
      console.log(
        `  ${row.column_name}: ${row.data_type} (${
          row.is_nullable === "YES" ? "nullable" : "not null"
        })`
      );
    });

    client.release();
    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    await pool.end();
  }
}

checkSchema();
