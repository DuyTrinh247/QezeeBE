const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function testLogin() {
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

    // Test login logic
    const username = "testuser";
    const password = "password123";

    // Find user by username
    const userResult = await client.query(
      "SELECT * FROM users WHERE name = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      console.log("❌ User not found");
      return;
    }

    const user = userResult.rows[0];
    console.log("👤 User found:", user.name, user.email);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("🔐 Password valid:", isValidPassword);

    if (isValidPassword) {
      console.log("✅ Login successful!");
    } else {
      console.log("❌ Invalid password");
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error("❌ Error testing login:", error.message);
    await pool.end();
  }
}

testLogin();
