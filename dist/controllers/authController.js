"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.googleLogin = googleLogin;
const usersService_1 = require("../services/usersService");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
// Khởi tạo Google OAuth2 client
const googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
async function login(req, res) {
    const { username, password } = req.body;
    try {
        console.log('🔍 Login attempt:', { username });
        // Tìm user theo username
        const user = await (0, usersService_1.findUserByUsername)(username);
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
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        console.log('✅ Password valid:', isValidPassword);
        if (!isValidPassword) {
            console.log('❌ Invalid password');
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Tạo JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
        res.status(200).json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function register(req, res) {
    const { name, email, password } = req.body;
    try {
        // Kiểm tra user đã tồn tại chưa
        const existingUser = await (0, usersService_1.findUserByEmail)(email);
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Tạo user mới
        const user = await (0, usersService_1.addUser)(name, email, hashedPassword);
        // Tạo JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
// Helper function để tìm user theo Google ID
async function findUserByGoogleId(googleId) {
    var _a;
    const { pool } = await Promise.resolve().then(() => __importStar(require("../db")));
    const result = await pool.query("SELECT id, name, email, google_id FROM users WHERE google_id = $1", [googleId]);
    return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
}
// Helper function để tạo user mới với Google
async function createGoogleUser(name, email, googleId) {
    const { pool } = await Promise.resolve().then(() => __importStar(require("../db")));
    const result = await pool.query("INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING id, name, email, google_id", [name, email, googleId]);
    return result.rows[0];
}
async function googleLogin(req, res) {
    const { token } = req.body;
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
        const jwtToken = jsonwebtoken_1.default.sign({ userId: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
        res.status(200).json({
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
