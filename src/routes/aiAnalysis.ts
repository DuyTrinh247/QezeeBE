import { Router } from "express";
import { 
  getAIAnalysis,
  saveAIAnalysis,
  checkAIAnalysis,
  deleteAIAnalysis,
  getAIAnalysisByQuiz,
  saveAIAnalysisByQuiz,
  checkAIAnalysisByQuiz
} from "../controllers/aiAnalysisController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Get AI analysis by quiz and attempt
router.get("/quiz/:quizId/attempt/:attemptId", authenticateToken as any, getAIAnalysis as any);

// Check if AI analysis exists
router.get("/check/quiz/:quizId/attempt/:attemptId", authenticateToken as any, checkAIAnalysis as any);

// Save AI analysis (attempt-specific)
router.post("/save", authenticateToken as any, saveAIAnalysis as any);

// Get AI analysis by quiz only (not attempt-specific)
router.get("/quiz/:quizId", authenticateToken as any, getAIAnalysisByQuiz as any);

// Check if AI analysis exists for quiz
router.get("/check/quiz/:quizId", authenticateToken as any, checkAIAnalysisByQuiz as any);

// Save AI analysis by quiz only (not attempt-specific)
router.post("/save-quiz", authenticateToken as any, saveAIAnalysisByQuiz as any);

// Delete AI analysis
router.delete("/:id", authenticateToken as any, deleteAIAnalysis as any);

export default router;
