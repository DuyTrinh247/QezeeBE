const { Pool } = require("pg");
require("dotenv").config();

async function checkUser() {
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

    // Check if user exists
    const userResult = await client.query("SELECT * FROM users WHERE id = $1", [
      "550e8400-e29b-41d4-a716-446655440000",
    ]);
    console.log("User exists:", userResult.rows.length > 0);

    if (userResult.rows.length === 0) {
      console.log("Creating test user...");
      await client.query(
        `
        INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
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
      console.log("✅ User already exists");
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    await pool.end();
  }
}

checkUser();
