"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizAttemptsService = void 0;
exports.getQuizAttemptById = getQuizAttemptById;
exports.getUserQuizAttempts = getUserQuizAttempts;
const quizAttemptsRepository_1 = require("../repositories/quizAttemptsRepository");
const quizAttemptsRepo = new quizAttemptsRepository_1.QuizAttemptsRepository();
async function getQuizAttemptById(attemptId) {
    try {
        console.log('🔍 Getting quiz attempt by ID:', attemptId);
        const attempt = await quizAttemptsRepo.findById(attemptId);
        console.log('✅ Quiz attempt retrieved:', attempt ? 'Found' : 'Not found');
        return attempt;
    }
    catch (error) {
        console.error('❌ Error getting quiz attempt:', error);
        throw error;
    }
}
async function getUserQuizAttempts(userId) {
    try {
        console.log('🔍 Getting quiz attempts for user:', userId);
        const attempts = await quizAttemptsRepo.findByUserId(userId);
        console.log('✅ User quiz attempts retrieved:', attempts.length, 'attempts');
        return attempts;
    }
    catch (error) {
        console.error('❌ Error getting user quiz attempts:', error);
        throw error;
    }
}
exports.quizAttemptsService = {
    getQuizAttemptById,
    getUserQuizAttempts
};
