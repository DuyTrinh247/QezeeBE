"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeQuizResults = void 0;
const quizAnalysisService_1 = require("../services/quizAnalysisService");
const quizzesService_1 = require("../services/quizzesService");
const quizAttemptsService_1 = require("../services/quizAttemptsService");
const analyzeQuizResults = async (req, res) => {
    var _a;
    try {
        console.log('🔍 Quiz Analysis Request received');
        const { quizId, attemptId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        if (!quizId || !attemptId) {
            return res.status(400).json({
                success: false,
                error: 'Quiz ID and Attempt ID are required'
            });
        }
        console.log('User ID:', userId);
        console.log('Quiz ID:', quizId);
        console.log('Attempt ID:', attemptId);
        // Get quiz data
        const quiz = await quizzesService_1.quizzesService.getQuizById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found'
            });
        }
        // Get attempt data from database
        const attempt = await quizAttemptsService_1.quizAttemptsService.getQuizAttemptById(attemptId);
        if (!attempt) {
            return res.status(404).json({
                success: false,
                error: 'Quiz attempt not found'
            });
        }
        console.log('Quiz data retrieved:', quiz.title);
        console.log('Attempt data retrieved:', attempt.score, '%');
        // Prepare data for AI analysis
        const analysisRequest = {
            quizTitle: quiz.title,
            questions: quiz.quiz_data.questions,
            userAnswers: attempt.answers,
            correctAnswers: attempt.correct_answers,
            totalQuestions: attempt.total_questions,
            score: attempt.score
        };
        console.log('Starting AI analysis...');
        // Get AI analysis
        const analysis = await quizAnalysisService_1.QuizAnalysisService.analyzeQuizResults(analysisRequest);
        console.log('✅ AI Analysis completed');
        res.json({
            success: true,
            analysis: analysis,
            quizInfo: {
                id: quiz.id,
                title: quiz.title,
                score: attempt.score,
                correctAnswers: attempt.correct_answers,
                totalQuestions: attempt.total_questions
            },
            attemptInfo: {
                id: attempt.id,
                timeTaken: attempt.time_taken_seconds,
                completedAt: attempt.completed_at
            }
        });
    }
    catch (error) {
        console.error('❌ Error in quiz analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze quiz results',
            details: error.message
        });
    }
};
exports.analyzeQuizResults = analyzeQuizResults;
