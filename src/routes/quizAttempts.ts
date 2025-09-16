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
  logQuizAttemptEvent
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
router.use(authenticateToken);

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
  startQuizAttempt(req, res);
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
router.post("/submit/:attemptId", validateParams(attemptIdSchema), submitQuizAttempt);
router.get("/:attemptId", validateParams(attemptIdSchema), getQuizAttempt);
router.get("/user/attempts", getUserQuizAttempts);
router.get("/stats/quiz/:quizId", validateParams(quizIdSchema), getQuizAttemptStats);
router.get("/stats/user", getUserAttemptStats);

// Enhanced tracking routes
router.get("/:attemptId/sessions", validateParams(attemptIdSchema), getQuizAttemptSessions);
router.get("/:attemptId/events", validateParams(attemptIdSchema), getQuizAttemptEvents);
router.post("/:attemptId/events", validateParams(attemptIdSchema), logQuizAttemptEvent);

export default router;
