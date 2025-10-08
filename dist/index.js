"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("./routes/users"));
const auth_1 = __importDefault(require("./routes/auth"));
const quizzes_1 = __importDefault(require("./routes/quizzes"));
const upload_1 = __importDefault(require("./routes/upload"));
const pdfFiles_1 = __importDefault(require("./routes/pdfFiles"));
const quizAttempts_1 = __importDefault(require("./routes/quizAttempts"));
const pdfNotes_1 = __importDefault(require("./routes/pdfNotes"));
const aiQuiz_1 = __importDefault(require("./routes/aiQuiz"));
const quizAnalysis_1 = __importDefault(require("./routes/quizAnalysis"));
const aiAnalysis_1 = __importDefault(require("./routes/aiAnalysis"));
const contact_1 = __importDefault(require("./routes/contact"));
const test_1 = __importDefault(require("./routes/test"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration - allow localhost, GitHub Pages, and all Render.com origins
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://duytrinh247.github.io'
        ];
        // Allow all onrender.com subdomains (check if origin exists and is string)
        const isRenderOrigin = origin && typeof origin === 'string' && origin.includes('onrender.com');
        if (!origin || allowedOrigins.includes(origin) || isRenderOrigin) {
            callback(null, true);
        }
        else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Handle preflight OPTIONS requests explicitly
app.options('/*', (req, res) => {
    res.status(200).end();
});
// Increase request body size limit to 10MB for PDF base64 data
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Serve static files from uploads directory with proper headers
app.use('/uploads', (req, res, next) => {
    // Set proper Content-Type for PDF files
    if (req.path.toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline'); // Display in browser, not download
        // Remove X-Frame-Options to allow iframe from any origin
        res.removeHeader('X-Frame-Options');
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    next();
}, express_1.default.static('uploads'));
const port = process.env.PORT ? Number(process.env.PORT) : 3002;
app.get("/", (_req, res) => {
    res.status(200).send("Qeeze-BE chạy server thành công với Express");
});
// Debug endpoint to list all routes
app.get("/debug/routes", (_req, res) => {
    const routes = [];
    res.json({
        message: "Available routes",
        registeredRoutes: [
            "/api/v1/users",
            "/api/v1/auth",
            "/api/v1/quizzes",
            "/api/v1/upload",
            "/api/v1/pdf-files",
            "/api/v1/quiz-attempts",
            "/api/v1/pdf-notes",
            "/api/v1/ai-quiz",
            "/api/v1/quiz-analysis",
            "/api/v1/ai-analysis",
            "/api/v1/contact",
            "/api/test"
        ],
        authRoutes: [
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/google-login"
        ]
    });
});
app.use("/api/v1/users", users_1.default);
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/quizzes", quizzes_1.default);
app.use("/api/v1/upload", upload_1.default);
app.use("/api/v1/pdf-files", pdfFiles_1.default);
app.use("/api/v1/quiz-attempts", quizAttempts_1.default);
app.use("/api/v1/pdf-notes", pdfNotes_1.default);
app.use("/api/v1/ai-quiz", aiQuiz_1.default);
app.use("/api/v1/quiz-analysis", quizAnalysis_1.default);
app.use("/api/v1/ai-analysis", aiAnalysis_1.default);
app.use("/api/v1/contact", contact_1.default);
app.use("/api/test", test_1.default);
// Error handling middleware (phải đặt cuối cùng)
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
