import dotenv from "dotenv";
import { Pool } from "pg";

// Đảm bảo env được nạp trước khi đọc các biến kết nối
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined })
  : new Pool({
      host: process.env.PGHOST || "localhost",
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || undefined,
      database: process.env.PGDATABASE || "postgres",
      ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
    });

// Export db as alias for pool for backward compatibility
export const db = pool;

// Log database connection info
console.log("🔍 Database connection info:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("PGHOST:", process.env.PGHOST || "localhost");
console.log("PGPORT:", process.env.PGPORT || "5432");
console.log("PGUSER:", process.env.PGUSER || "postgres");
console.log("PGDATABASE:", process.env.PGDATABASE || "postgres");
console.log("PGPASSWORD:", process.env.PGPASSWORD ? "SET" : "NOT SET");

export async function checkDbConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch (error) {
    return false;
  }
}

export async function checkDbConnectionWithError(): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Unknown database error" };
  }
}


