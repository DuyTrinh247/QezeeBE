import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users";
import authRouter from "./routes/auth";
import quizzesRouter from "./routes/quizzes";
import uploadRouter from "./routes/upload";
import pdfFilesRouter from "./routes/pdfFiles";
import quizAttemptsRouter from "./routes/quizAttempts";
import pdfNotesRouter from "./routes/pdfNotes";
import aiQuizRouter from "./routes/aiQuiz";
import quizAnalysisRouter from "./routes/quizAnalysis";
import aiAnalysisRouter from "./routes/aiAnalysis";
import contactRouter from "./routes/contact";
import testRouter from "./routes/test";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://duytrinh247.github.io',
    'https://qeezeui.onrender.com',
    'https://qeezeui-1.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase request body size limit to 10MB for PDF base64 data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
}, express.static('uploads'));

const port = process.env.PORT ? Number(process.env.PORT) : 3002;

app.get("/", (_req, res) => {
  res.status(200).send("Qeeze-BE chạy server thành công với Express");
});

// Debug endpoint to list all routes
app.get("/debug/routes", (_req, res) => {
  const routes: any[] = [];
  
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

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/quizzes", quizzesRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/pdf-files", pdfFilesRouter);
app.use("/api/v1/quiz-attempts", quizAttemptsRouter);
app.use("/api/v1/pdf-notes", pdfNotesRouter);
app.use("/api/v1/ai-quiz", aiQuizRouter);
app.use("/api/v1/quiz-analysis", quizAnalysisRouter);
app.use("/api/v1/ai-analysis", aiAnalysisRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/test", testRouter);

// Error handling middleware (phải đặt cuối cùng)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
