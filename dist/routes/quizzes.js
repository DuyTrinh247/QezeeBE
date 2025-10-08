"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizzesController_1 = require("../controllers/quizzesController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
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
        const { findQuizById } = await Promise.resolve().then(() => __importStar(require("../services/quizzesService")));
        const quiz = await findQuizById(id);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        res.json({ quiz });
    }
    catch (error) {
        console.error('Direct route error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Tất cả routes quizzes đều cần authentication
router.use(auth_1.authenticateToken);
// CRUD operations
router.get("/", quizzesController_1.getQuizzes);
router.get("/user", quizzesController_1.getQuizzes); // Get user's quizzes
router.get("/search", (0, validation_1.validateQuery)(schemas_1.searchSchema), quizzesController_1.searchQuizzes);
router.get("/date-range", (0, validation_1.validateQuery)(schemas_1.dateRangeSchema), quizzesController_1.getQuizzesByDateRange);
router.get("/hash/:hashcode", (0, validation_1.validateParams)(schemas_1.quizHashcodeSchema), quizzesController_1.getQuizByHash);
router.get("/:id", quizzesController_1.getQuiz);
router.post("/", (0, validation_1.validateBody)(schemas_1.createQuizSchema), quizzesController_1.createQuiz);
router.put("/:id", (0, validation_1.validateParams)(schemas_1.quizIdSchema), (0, validation_1.validateBody)(schemas_1.updateQuizSchema), quizzesController_1.updateQuiz);
router.delete("/:id", (0, validation_1.validateParams)(schemas_1.quizIdSchema), quizzesController_1.deleteQuiz);
exports.default = router;
