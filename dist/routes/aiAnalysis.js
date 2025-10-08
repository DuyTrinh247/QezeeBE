"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiAnalysisController_1 = require("../controllers/aiAnalysisController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get AI analysis by quiz and attempt
router.get("/quiz/:quizId/attempt/:attemptId", auth_1.authenticateToken, aiAnalysisController_1.getAIAnalysis);
// Check if AI analysis exists
router.get("/check/quiz/:quizId/attempt/:attemptId", auth_1.authenticateToken, aiAnalysisController_1.checkAIAnalysis);
// Save AI analysis (attempt-specific)
router.post("/save", auth_1.authenticateToken, aiAnalysisController_1.saveAIAnalysis);
// Get AI analysis by quiz only (not attempt-specific)
router.get("/quiz/:quizId", auth_1.authenticateToken, aiAnalysisController_1.getAIAnalysisByQuiz);
// Check if AI analysis exists for quiz
router.get("/check/quiz/:quizId", auth_1.authenticateToken, aiAnalysisController_1.checkAIAnalysisByQuiz);
// Save AI analysis by quiz only (not attempt-specific)
router.post("/save-quiz", auth_1.authenticateToken, aiAnalysisController_1.saveAIAnalysisByQuiz);
// Delete AI analysis
router.delete("/:id", auth_1.authenticateToken, aiAnalysisController_1.deleteAIAnalysis);
exports.default = router;
