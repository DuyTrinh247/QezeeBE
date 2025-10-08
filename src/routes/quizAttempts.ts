import { Router } from "express";
import { 
  startQuizAttempt,
  submitQuizAttempt,
  getQuizAttempt,
  getUserQuizAttempts,
  getQuizAttemptStats,
  getUserAttemptStats,
  getQuizAttemptSessions,
  getQuizAttemptEvents,
  logQuizAttemptEvent,
  deleteQuizAttempt
} from "../controllers/quizAttemptsController";
import { authenticateToken } from "../middleware/auth";
import { validateParams, validateBody } from "../middleware/validation";
import { quizIdSchema, attemptIdSchema } from "../validation/schemas";


const router = Router();

// Test route before authentication
router.get("/test", (req, res) => {
  res.json({ message: "Quiz Attempts API is working!", timestamp: new Date().toISOString() });
});

// Test route without any middleware
router.post("/test-start/:quizId", (req, res) => {
  console.log('Test start route - req.params:', req.params);
  res.json({ 
    success: true, 
    message: 'Test route working',
    params: req.params,
    user: req.user
  });
});

// All routes require authentication
router.use(authenticateToken as any);

// Debug route
router.post("/debug/:quizId", (req, res) => {
  console.log('Debug route - req.params:', req.params);
  res.json({ params: req.params });
});

// Debug validation route
router.post("/debug-validation/:quizId", validateParams(quizIdSchema), (req, res) => {
  console.log('Debug validation route - req.params:', req.params);
  res.json({ params: req.params });
});

// Quiz attempt routes
router.post("/start/:quizId", (req, res) => {
  console.log('Start quiz attempt - req.params:', req.params);
  console.log('Start quiz attempt - req.user:', req.user);
  (startQuizAttempt as any)(req, res);
});

// Test route without any middleware
router.post("/test-start/:quizId", (req, res) => {
  console.log('Test start route - req.params:', req.params);
  res.json({ 
    success: true, 
    message: 'Test route working',
    params: req.params,
    user: req.user
  });
});
router.post("/submit/:attemptId", validateParams(attemptIdSchema), submitQuizAttempt as any);
router.get("/:attemptId", validateParams(attemptIdSchema), getQuizAttempt as any);
router.get("/user/attempts", getUserQuizAttempts as any);
router.get("/stats/quiz/:quizId", validateParams(quizIdSchema), getQuizAttemptStats as any);
router.get("/stats/user", getUserAttemptStats as any);

// Enhanced tracking routes
router.get("/:attemptId/sessions", validateParams(attemptIdSchema), getQuizAttemptSessions as any);
router.get("/:attemptId/events", validateParams(attemptIdSchema), getQuizAttemptEvents as any);
router.post("/:attemptId/events", validateParams(attemptIdSchema), logQuizAttemptEvent as any);

// Delete quiz attempt
router.delete("/:attemptId", validateParams(attemptIdSchema), deleteQuizAttempt as any);

export default router;
