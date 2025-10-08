import express from 'express';
import { analyzeQuizResults } from '../controllers/quizAnalysisController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as any);

// Analyze quiz results with AI
router.post('/analyze/:quizId/:attemptId', analyzeQuizResults as any);

export default router;
