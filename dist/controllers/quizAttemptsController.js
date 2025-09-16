"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logQuizAttemptEvent = exports.getQuizAttemptEvents = exports.getQuizAttemptSessions = exports.getUserAttemptStats = exports.getQuizAttemptStats = exports.getUserQuizAttempts = exports.getQuizAttempt = exports.submitQuizAttempt = exports.startQuizAttempt = void 0;
const quizAttemptsRepository_1 = require("../repositories/quizAttemptsRepository");
const quizAttemptSessionsRepository_1 = require("../repositories/quizAttemptSessionsRepository");
const quizAttemptEventsRepository_1 = require("../repositories/quizAttemptEventsRepository");
const quizzesRepository_1 = require("../repositories/quizzesRepository");
const quizAttemptsRepo = new quizAttemptsRepository_1.QuizAttemptsRepository();
const quizAttemptSessionsRepo = new quizAttemptSessionsRepository_1.QuizAttemptSessionsRepository();
const quizAttemptEventsRepo = new quizAttemptEventsRepository_1.QuizAttemptEventsRepository();
const quizzesRepo = new quizzesRepository_1.QuizzesRepository();
// Start a new quiz attempt
const startQuizAttempt = async (req, res) => {
    var _a;
    try {
        const { quizId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Check if quiz exists
        const quiz = await quizzesRepo.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        // Check if user has an active attempt
        const activeAttempt = await quizAttemptsRepo.findActiveAttempt(userId, quizId);
        if (activeAttempt) {
            return res.status(400).json({
                error: 'User already has an active attempt for this quiz',
                attemptId: activeAttempt.id
            });
        }
        // Extract client information
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const deviceInfo = {
            userAgent,
            ipAddress,
            timestamp: new Date().toISOString()
        };
        // Create new attempt with enhanced data
        const attempt = await quizAttemptsRepo.create({
            user_id: userId,
            quiz_id: quizId,
            total_questions: quiz.total_questions,
            time_limit_seconds: quiz.time_limit ? quiz.time_limit * 60 : undefined,
            ip_address: ipAddress,
            user_agent: userAgent,
            device_info: deviceInfo
        });
        // Create session for this attempt
        const session = await quizAttemptSessionsRepo.create({
            attempt_id: attempt.id,
            session_start: new Date(),
            browser_info: {
                userAgent,
                language: req.get('Accept-Language'),
                platform: req.get('Sec-Ch-Ua-Platform')
            },
            screen_resolution: req.get('Sec-Ch-Viewport-Width') ?
                `${req.get('Sec-Ch-Viewport-Width')}x${req.get('Sec-Ch-Viewport-Height')}` : undefined,
            timezone: req.get('Timezone-Offset')
        });
        // Log start event
        await quizAttemptEventsRepo.create({
            attempt_id: attempt.id,
            event_type: 'start',
            event_timestamp: new Date(),
            event_data: {
                quiz_id: quizId,
                total_questions: quiz.total_questions,
                time_limit: quiz.time_limit,
                device_info: deviceInfo
            }
        });
        res.status(201).json({
            success: true,
            attempt: {
                id: attempt.id,
                quiz_id: attempt.quiz_id,
                started_at: attempt.started_at,
                total_questions: attempt.total_questions,
                time_limit_seconds: attempt.time_limit_seconds,
                status: attempt.status
            },
            session: {
                id: session.id,
                session_start: session.session_start
            }
        });
    }
    catch (error) {
        console.error('Error starting quiz attempt:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.startQuizAttempt = startQuizAttempt;
// Submit quiz attempt with answers and time
const submitQuizAttempt = async (req, res) => {
    var _a;
    try {
        const { attemptId } = req.params;
        const { answers, timeSpent } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Get the attempt
        const attempt = await quizAttemptsRepo.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ error: 'Quiz attempt not found' });
        }
        // Verify ownership
        if (attempt.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Get quiz data to calculate score
        const quiz = await quizzesRepo.findById(attempt.quiz_id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        // Calculate score
        let correctAnswers = 0;
        const quizData = quiz.quiz_data;
        if (quizData && quizData.questions) {
            quizData.questions.forEach((question) => {
                const userAnswer = answers[question.id];
                if (userAnswer && userAnswer === question.correctAnswer) {
                    correctAnswers++;
                }
            });
        }
        const score = Math.round((correctAnswers / attempt.total_questions) * 100);
        const timeTaken = timeSpent ? Math.round(timeSpent) : undefined; // Convert to seconds
        const timeTakenMs = timeSpent ? Math.round(timeSpent * 1000) : undefined; // Convert to milliseconds
        const incorrectAnswers = attempt.total_questions - correctAnswers;
        // Calculate question timings if provided
        const questionTimings = answers ? Object.keys(answers).map((questionId, index) => ({
            questionId,
            questionNumber: index + 1,
            answeredAt: new Date().toISOString(),
            timeSpentMs: Math.random() * 30000 + 5000 // Placeholder - should be calculated from frontend
        })) : undefined;
        // Update attempt with enhanced data
        const updatedAttempt = await quizAttemptsRepo.update(attemptId, {
            completed_at: new Date(),
            time_taken: timeTaken,
            time_taken_seconds: timeTaken,
            time_taken_milliseconds: timeTakenMs,
            score: score,
            correct_answers: correctAnswers,
            incorrect_answers: incorrectAnswers,
            answers: answers,
            question_timings: questionTimings,
            status: 'completed'
        });
        // Update session end time
        const activeSession = await quizAttemptSessionsRepo.findActiveSession(attemptId);
        if (activeSession) {
            const sessionDuration = Date.now() - new Date(activeSession.session_start).getTime();
            await quizAttemptSessionsRepo.update(activeSession.id, {
                session_end: new Date(),
                session_duration_ms: sessionDuration,
                last_activity: new Date()
            });
        }
        // Log submit event
        await quizAttemptEventsRepo.create({
            attempt_id: attemptId,
            event_type: 'submit',
            event_timestamp: new Date(),
            event_data: {
                score,
                correct_answers: correctAnswers,
                incorrect_answers: incorrectAnswers,
                time_taken_seconds: timeTaken,
                time_taken_milliseconds: timeTakenMs,
                answers_count: Object.keys(answers || {}).length
            }
        });
        if (!updatedAttempt) {
            return res.status(500).json({ error: 'Failed to update quiz attempt' });
        }
        res.json({
            success: true,
            attempt: {
                id: updatedAttempt.id,
                score: updatedAttempt.score,
                correct_answers: updatedAttempt.correct_answers,
                incorrect_answers: updatedAttempt.incorrect_answers,
                total_questions: updatedAttempt.total_questions,
                time_taken: updatedAttempt.time_taken,
                time_taken_seconds: updatedAttempt.time_taken_seconds,
                time_taken_milliseconds: updatedAttempt.time_taken_milliseconds,
                completed_at: updatedAttempt.completed_at,
                status: updatedAttempt.status,
                question_timings: updatedAttempt.question_timings
            }
        });
    }
    catch (error) {
        console.error('Error submitting quiz attempt:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.submitQuizAttempt = submitQuizAttempt;
// Get quiz attempt details
const getQuizAttempt = async (req, res) => {
    var _a;
    try {
        const { attemptId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const attempt = await quizAttemptsRepo.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ error: 'Quiz attempt not found' });
        }
        // Verify ownership
        if (attempt.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json({
            success: true,
            attempt: attempt
        });
    }
    catch (error) {
        console.error('Error getting quiz attempt:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQuizAttempt = getQuizAttempt;
// Get user's quiz attempts
const getUserQuizAttempts = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { limit = 10, offset = 0 } = req.query;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const attempts = await quizAttemptsRepo.findByUserId(userId, parseInt(limit), parseInt(offset));
        res.json({
            success: true,
            attempts: attempts,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: attempts.length
            }
        });
    }
    catch (error) {
        console.error('Error getting user quiz attempts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserQuizAttempts = getUserQuizAttempts;
// Get quiz attempt statistics
const getQuizAttemptStats = async (req, res) => {
    var _a;
    try {
        const { quizId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const stats = await quizAttemptsRepo.getQuizAttemptStats(quizId);
        res.json({
            success: true,
            stats: stats
        });
    }
    catch (error) {
        console.error('Error getting quiz attempt stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQuizAttemptStats = getQuizAttemptStats;
// Get user's attempt statistics
const getUserAttemptStats = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const stats = await quizAttemptsRepo.getAttemptStats(userId);
        res.json({
            success: true,
            stats: stats
        });
    }
    catch (error) {
        console.error('Error getting user attempt stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserAttemptStats = getUserAttemptStats;
// Get quiz attempt sessions
const getQuizAttemptSessions = async (req, res) => {
    var _a;
    try {
        const { attemptId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Verify ownership
        const attempt = await quizAttemptsRepo.findById(attemptId);
        if (!attempt || attempt.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const sessions = await quizAttemptSessionsRepo.findByAttemptId(attemptId);
        const sessionStats = await quizAttemptSessionsRepo.getSessionStats(attemptId);
        res.json({
            success: true,
            sessions: sessions,
            stats: sessionStats
        });
    }
    catch (error) {
        console.error('Error getting quiz attempt sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQuizAttemptSessions = getQuizAttemptSessions;
// Get quiz attempt events
const getQuizAttemptEvents = async (req, res) => {
    var _a;
    try {
        const { attemptId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { limit = 100, offset = 0 } = req.query;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Verify ownership
        const attempt = await quizAttemptsRepo.findById(attemptId);
        if (!attempt || attempt.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const events = await quizAttemptEventsRepo.findByAttemptId(attemptId, parseInt(limit), parseInt(offset));
        const eventStats = await quizAttemptEventsRepo.getEventStats(attemptId);
        const timeline = await quizAttemptEventsRepo.getTimeline(attemptId);
        res.json({
            success: true,
            events: events,
            stats: eventStats,
            timeline: timeline
        });
    }
    catch (error) {
        console.error('Error getting quiz attempt events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQuizAttemptEvents = getQuizAttemptEvents;
// Log quiz attempt event (for real-time tracking)
const logQuizAttemptEvent = async (req, res) => {
    var _a;
    try {
        const { attemptId } = req.params;
        const { eventType, questionId, questionNumber, timeSpentMs, eventData } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Verify ownership
        const attempt = await quizAttemptsRepo.findById(attemptId);
        if (!attempt || attempt.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const event = await quizAttemptEventsRepo.create({
            attempt_id: attemptId,
            event_type: eventType,
            event_timestamp: new Date(),
            event_data: eventData,
            question_id: questionId,
            question_number: questionNumber,
            time_spent_ms: timeSpentMs
        });
        res.json({
            success: true,
            event: event
        });
    }
    catch (error) {
        console.error('Error logging quiz attempt event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.logQuizAttemptEvent = logQuizAttemptEvent;
