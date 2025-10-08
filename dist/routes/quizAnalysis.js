"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quizAnalysisController_1 = require("../controllers/quizAnalysisController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
// Analyze quiz results with AI
router.post('/analyze/:quizId/:attemptId', quizAnalysisController_1.analyzeQuizResults);
exports.default = router;
