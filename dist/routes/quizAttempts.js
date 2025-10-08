"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizAttemptsController_1 = require("../controllers/quizAttemptsController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
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
router.use(auth_1.authenticateToken);
// Debug route
router.post("/debug/:quizId", (req, res) => {
    console.log('Debug route - req.params:', req.params);
    res.json({ params: req.params });
});
// Debug validation route
router.post("/debug-validation/:quizId", (0, validation_1.validateParams)(schemas_1.quizIdSchema), (req, res) => {
    console.log('Debug validation route - req.params:', req.params);
    res.json({ params: req.params });
});
// Quiz attempt routes
router.post("/start/:quizId", (req, res) => {
    console.log('Start quiz attempt - req.params:', req.params);
    console.log('Start quiz attempt - req.user:', req.user);
    quizAttemptsController_1.startQuizAttempt(req, res);
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
router.post("/submit/:attemptId", (0, validation_1.validateParams)(schemas_1.attemptIdSchema), quizAttemptsController_1.submitQuizAttempt);
router.get("/:attemptId", (0, validation_1.validateParams)(schemas_1.attemptIdSchema), quizAttemptsController_1.getQuizAttempt);
router.get("/user/attempts", quizAttemptsController_1.getUserQuizAttempts);
router.get("/stats/quiz/:quizId", (0, validation_1.validateParams)(schemas_1.quizIdSchema), quizAttemptsController_1.getQuizAttemptStats);
router.get("/stats/user", quizAttemptsController_1.getUserAttemptStats);
// Enhanced tracking routes
router.get("/:attemptId/sessions", (0, validation_1.validateParams)(schemas_1.attemptIdSchema), quizAttemptsController_1.getQuizAttemptSessions);
router.get("/:attemptId/events", (0, validation_1.validateParams)(schemas_1.attemptIdSchema), quizAttemptsController_1.getQuizAttemptEvents);
router.post("/:attemptId/events", (0, validation_1.validateParams)(schemas_1.attemptIdSchema), quizAttemptsController_1.logQuizAttemptEvent);
// Delete quiz attempt
router.delete("/:attemptId", (0, validation_1.validateParams)(schemas_1.attemptIdSchema), quizAttemptsController_1.deleteQuizAttempt);
exports.default = router;
