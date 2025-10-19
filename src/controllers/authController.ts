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
    console.log('🔍 Login attempt:', { username });
    
    // Tìm user theo username
    const user = await findUserByUsername(username);
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log('🔐 Password verification:', {
      providedPassword: password,
      storedPassword: user.password ? 'Present' : 'Missing',
      passwordLength: user.password ? user.password.length : 0,
      userObject: user
    });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
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
  try {
    const { pool } = await import("../db");
    console.log('🔍 Querying database for Google ID:', googleId);
    const result = await pool.query(
      "SELECT id, name, email, google_id FROM users WHERE google_id = $1",
      [googleId]
    );
    console.log('🔍 Database query result:', {
      rowCount: result.rowCount,
      hasUser: result.rows.length > 0
    });
    return result.rows[0] ?? null;
  } catch (error) {
    console.error('❌ Database error in findUserByGoogleId:', error);
    throw error;
  }
}

// Helper function để tạo user mới với Google
async function createGoogleUser(name: string, email: string, googleId: string) {
  try {
    const { pool } = await import("../db");
    console.log('🔍 Creating new Google user in database:', { name, email, googleId });
    const result = await pool.query(
      "INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING id, name, email, google_id",
      [name, email, googleId]
    );
    console.log('✅ New Google user created in database:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Database error in createGoogleUser:', error);
    throw error;
  }
}

export async function googleLogin(req: Request, res: Response) {
  const { token }: GoogleLoginInput = req.body;

  try {
    console.log('🔍 Google login attempt:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      googleClientId: GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      clientIdLength: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.length : 0
    });

    if (!token) {
      console.error('❌ No Google token provided');
      return res.status(400).json({ error: "Google token is required" });
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error('❌ Google Client ID not configured');
      return res.status(500).json({ error: "Google OAuth not configured" });
    }

    // Xác thực Google token
    console.log('🔍 Verifying Google token...');
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('🔍 Google token payload:', {
      hasPayload: !!payload,
      googleId: payload?.sub,
      name: payload?.name,
      email: payload?.email,
      emailVerified: payload?.email_verified
    });

    if (!payload) {
      console.error('❌ Invalid Google token payload');
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const { sub: googleId, name, email } = payload;

    if (!googleId || !name || !email) {
      console.error('❌ Missing required Google user information:', {
        googleId: !!googleId,
        name: !!name,
        email: !!email
      });
      return res.status(400).json({ error: "Missing required Google user information" });
    }

    // Tìm user theo Google ID
    console.log('🔍 Looking for user with Google ID:', googleId);
    let user = await findUserByGoogleId(googleId);
    console.log('👤 User found:', user ? 'Yes' : 'No');

    // Nếu user chưa tồn tại, tạo mới
    if (!user) {
      console.log('👤 Creating new Google user:', { name, email, googleId });
      user = await createGoogleUser(name, email, googleId);
      console.log('✅ New Google user created:', user.id);
    }

    // Tạo JWT token
    console.log('🔐 Creating JWT token for user:', user.id);
    const jwtToken = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log('✅ Google login successful for user:', user.id);
    res.status(200).json({
      token: jwtToken,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error("❌ Google login error:", error);
    if (error instanceof Error) {
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
