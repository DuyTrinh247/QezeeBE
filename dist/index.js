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
const test_1 = __importDefault(require("./routes/test"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static('uploads'));
const port = process.env.PORT ? Number(process.env.PORT) : 3002;
app.get("/", (_req, res) => {
    res.status(200).send("Qeeze-BE chạy server thành công với Express");
});
app.use("/api/v1/users", users_1.default);
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/quizzes", quizzes_1.default);
app.use("/api/v1/upload", upload_1.default);
app.use("/api/v1/pdf-files", pdfFiles_1.default);
app.use("/api/v1/quiz-attempts", quizAttempts_1.default);
app.use("/api/v1/pdf-notes", pdfNotes_1.default);
app.use("/api/test", test_1.default);
// Error handling middleware (phải đặt cuối cùng)
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
