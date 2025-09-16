import { pool } from "../db";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  google_id?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query<User>("SELECT id, name, email, password, google_id, created_at, updated_at FROM users ORDER BY name ASC");
  return result.rows;
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await pool.query<User>("SELECT id, name, email, password, google_id, created_at, updated_at FROM users WHERE id = $1", [userId]);
  return result.rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>("SELECT id, name, email, password, google_id, created_at, updated_at FROM users WHERE email = $1", [email]);
  return result.rows[0] ?? null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await pool.query<User>("SELECT id, name, email, password, google_id, created_at, updated_at FROM users WHERE name = $1", [username]);
  return result.rows[0] ?? null;
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const result = await pool.query<User>(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, password, google_id, created_at, updated_at",
    [name, email, password]
  );
  return result.rows[0];
}

export async function updateUser(userId: string, name: string, password: string): Promise<User | null> {
  const result = await pool.query<User>(
    "UPDATE users SET name = $1, password_hash = $2 WHERE id = $3 RETURNING id, name, email, password_hash, google_id, avatar_url, created_at, updated_at",
    [name, password, userId]
  );
  return result.rows[0] ?? null;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  return (result.rowCount || 0) > 0;
}


