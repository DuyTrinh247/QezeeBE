const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO users (name, password) VALUES ($1, $2), ($3, $4) ON CONFLICT DO NOTHING;`,
      ["Alice", "password123", "Bob", "password456"]
    );
    console.log("Seed completed: inserted sample users.");
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error("Seed error:", err.message || err);
  process.exit(1);
});
