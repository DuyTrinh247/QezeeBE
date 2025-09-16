import { Router } from "express";
import { 
  createQuiz, 
  deleteQuiz, 
  getQuiz, 
  getQuizByHash,
  getQuizzes, 
  updateQuiz,
  getQuizzesByDateRange,
  searchQuizzes
} from "../controllers/quizzesController";
import { authenticateToken } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validation";
import { 
  createQuizSchema, 
  updateQuizSchema, 
  quizIdSchema,
  quizHashcodeSchema,
  dateRangeSchema,
  searchSchema
} from "../validation/schemas";

const router = Router();

// Test route không cần authentication
router.get("/test", (req, res) => {
  res.json({ message: "Quizzes API is working!", timestamp: new Date().toISOString() });
});

// Debug route
router.get("/debug/:id", (req, res) => {
  console.log('Debug route - req.params:', req.params);
  res.json({ params: req.params });
});

// Test route without validation
router.get("/test/:id", (req, res) => {
  console.log('Test route - req.params:', req.params);
  res.json({ params: req.params });
});

// Test route with direct controller call
router.get("/direct/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Direct route - req.params:', req.params);
    
    const { findQuizById } = await import("../services/quizzesService");
    const quiz = await findQuizById(id);
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    res.json({ quiz });
  } catch (error) {
    console.error('Direct route error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Tất cả routes quizzes đều cần authentication
router.use(authenticateToken);

// CRUD operations
router.get("/", getQuizzes);
router.get("/search", validateQuery(searchSchema), searchQuizzes);
router.get("/date-range", validateQuery(dateRangeSchema), getQuizzesByDateRange);
router.get("/hash/:hashcode", validateParams(quizHashcodeSchema), getQuizByHash);
router.get("/:id", getQuiz);
router.post("/", validateBody(createQuizSchema), createQuiz);
router.put("/:id", validateParams(quizIdSchema), validateBody(updateQuizSchema), updateQuiz);
router.delete("/:id", validateParams(quizIdSchema), deleteQuiz);

export default router;
