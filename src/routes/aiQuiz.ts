import express from 'express';
import aiQuizController from '../controllers/aiQuizController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /api/v1/ai-quiz/generate-from-pdf
 * @desc Generate quiz from uploaded PDF file
 * @access Private
 */
router.post(
  '/generate-from-pdf',
  authenticateToken,
  aiQuizController.getUploadMiddleware(),
  aiQuizController.generateQuizFromPDF
);

/**
 * @route POST /api/v1/ai-quiz/generate-from-text
 * @desc Generate quiz from text content
 * @access Public (for testing)
 */
router.post(
  '/generate-from-text',
  aiQuizController.generateQuizFromText
);

export default router;
