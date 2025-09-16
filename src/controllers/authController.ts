import { Request, Response } from "express";
import { findUserById, findUserByEmail, findUserByUsername, addUser } from "../services/usersService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { LoginInput, RegisterInput, GoogleLoginInput } from "../validation/schemas";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

// Khởi tạo Google OAuth2 client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function login(req: Request, res: Response) {
  const { username, password }: LoginInput = req.body;

  try {
    // Tìm user theo username
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user.id, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function register(req: Request, res: Response) {
  const { name, email, password }: RegisterInput = req.body;

  try {
    // Kiểm tra user đã tồn tại chưa
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const user = await addUser(name, email, hashedPassword);
    
    // Tạo JWT token
    const token = jwt.sign(
      { userId: user.id, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Helper function để tìm user theo Google ID
async function findUserByGoogleId(googleId: string) {
  const { pool } = await import("../db");
  const result = await pool.query(
    "SELECT id, name, email, google_id FROM users WHERE google_id = $1",
    [googleId]
  );
  return result.rows[0] ?? null;
}

// Helper function để tạo user mới với Google
async function createGoogleUser(name: string, email: string, googleId: string) {
  const { pool } = await import("../db");
  const result = await pool.query(
    "INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING id, name, email, google_id",
    [name, email, googleId]
  );
  return result.rows[0];
}

export async function googleLogin(req: Request, res: Response) {
  const { token }: GoogleLoginInput = req.body;

  try {
    // Xác thực Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const { sub: googleId, name, email } = payload;

    if (!googleId || !name || !email) {
      return res.status(400).json({ error: "Missing required Google user information" });
    }

    // Tìm user theo Google ID
    let user = await findUserByGoogleId(googleId);

    // Nếu user chưa tồn tại, tạo mới
    if (!user) {
      user = await createGoogleUser(name, email, googleId);
    }

    // Tạo JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token: jwtToken,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
