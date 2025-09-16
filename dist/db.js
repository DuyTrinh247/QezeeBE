"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = void 0;
exports.checkDbConnection = checkDbConnection;
exports.checkDbConnectionWithError = checkDbConnectionWithError;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
// Đảm bảo env được nạp trước khi đọc các biến kết nối
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL;
exports.pool = databaseUrl
    ? new pg_1.Pool({ connectionString: databaseUrl, ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined })
    : new pg_1.Pool({
        host: process.env.PGHOST || "localhost",
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || undefined,
        database: process.env.PGDATABASE || "postgres",
        ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
    });
// Export db as alias for pool for backward compatibility
exports.db = exports.pool;
// Log database connection info
console.log("🔍 Database connection info:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("PGHOST:", process.env.PGHOST || "localhost");
console.log("PGPORT:", process.env.PGPORT || "5432");
console.log("PGUSER:", process.env.PGUSER || "postgres");
console.log("PGDATABASE:", process.env.PGDATABASE || "postgres");
console.log("PGPASSWORD:", process.env.PGPASSWORD ? "SET" : "NOT SET");
async function checkDbConnection() {
    try {
        const client = await exports.pool.connect();
        await client.query("SELECT 1");
        client.release();
        return true;
    }
    catch (error) {
        return false;
    }
}
async function checkDbConnectionWithError() {
    try {
        const client = await exports.pool.connect();
        await client.query("SELECT 1");
        client.release();
        return { ok: true };
    }
    catch (error) {
        if (error instanceof Error) {
            return { ok: false, error: error.message };
        }
        return { ok: false, error: "Unknown database error" };
    }
}
