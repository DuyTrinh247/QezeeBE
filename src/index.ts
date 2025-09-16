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
import testRouter from "./routes/test";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

const port = process.env.PORT ? Number(process.env.PORT) : 3002;

app.get("/", (_req, res) => {
  res.status(200).send("Qeeze-BE chạy server thành công với Express");
});

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/quizzes", quizzesRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/pdf-files", pdfFilesRouter);
app.use("/api/v1/quiz-attempts", quizAttemptsRouter);
app.use("/api/v1/pdf-notes", pdfNotesRouter);
app.use("/api/test", testRouter);

// Error handling middleware (phải đặt cuối cùng)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
