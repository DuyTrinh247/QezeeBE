const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function createTestUser() {
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

    // Hash password
    const password = "password123";
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("🔐 Password hashed");

    // Check if user exists
    const existingUser = await client.query(
      "SELECT * FROM users WHERE name = $1",
      ["testuser"]
    );

    if (existingUser.rows.length > 0) {
      console.log("👤 User testuser already exists, updating password...");
      await client.query("UPDATE users SET password = $1 WHERE name = $2", [
        hashedPassword,
        "testuser",
      ]);
      console.log("✅ Password updated for testuser");
    } else {
      console.log("👤 Creating new test user...");
      await client.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        ["testuser", "test@example.com", hashedPassword]
      );
      console.log("✅ Test user created");
    }

    client.release();
    await pool.end();

    console.log("\n🎉 Test user ready!");
    console.log("Username: testuser");
    console.log("Password: password123");
  } catch (error) {
    console.error("❌ Error creating test user:", error.message);
    await pool.end();
  }
}

createTestUser();
