"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiQuizController_1 = __importDefault(require("../controllers/aiQuizController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @route POST /api/v1/ai-quiz/generate-from-pdf
 * @desc Generate quiz from uploaded PDF file
 * @access Private
 */
router.post('/generate-from-pdf', auth_1.authenticateToken, aiQuizController_1.default.getUploadMiddleware(), aiQuizController_1.default.generateQuizFromPDF);
/**
 * @route POST /api/v1/ai-quiz/generate-from-text
 * @desc Generate quiz from text content
 * @access Public (for testing)
 */
router.post('/generate-from-text', aiQuizController_1.default.generateQuizFromText);
exports.default = router;
