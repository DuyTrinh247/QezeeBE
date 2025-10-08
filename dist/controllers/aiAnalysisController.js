"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAIAnalysis = exports.checkAIAnalysisByQuiz = exports.saveAIAnalysisByQuiz = exports.getAIAnalysisByQuiz = exports.checkAIAnalysis = exports.saveAIAnalysis = exports.getAIAnalysis = void 0;
const aiAnalysisRepository_1 = require("../repositories/aiAnalysisRepository");
const db_1 = require("../db");
const aiAnalysisRepo = new aiAnalysisRepository_1.AIAnalysisRepository(db_1.pool);
// Get AI analysis by quiz and attempt
const getAIAnalysis = async (req, res) => {
    try {
        const { quizId, attemptId } = req.params;
        if (!quizId || !attemptId) {
            return res.status(400).json({ error: 'Quiz ID and Attempt ID are required' });
        }
        console.log('🔍 Getting AI analysis for quiz:', quizId, 'attempt:', attemptId);
        const analysis = await aiAnalysisRepo.getByQuizAndAttempt(quizId, attemptId);
        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'AI analysis not found',
                needsAnalysis: true
            });
        }
        console.log('✅ AI analysis found:', analysis.id);
        res.json({
            success: true,
            analysis: {
                id: analysis.id,
                quizId: analysis.quiz_id,
                attemptId: analysis.attempt_id,
                data: analysis.analysis_data,
                createdAt: analysis.created_at,
                updatedAt: analysis.updated_at
            }
        });
    }
    catch (error) {
        console.error('Error getting AI analysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAIAnalysis = getAIAnalysis;
// Save AI analysis
const saveAIAnalysis = async (req, res) => {
    try {
        const { quizId, attemptId, analysisData } = req.body;
        if (!quizId || !attemptId || !analysisData) {
            return res.status(400).json({ error: 'Quiz ID, Attempt ID, and analysis data are required' });
        }
        console.log('💾 Saving AI analysis for quiz:', quizId, 'attempt:', attemptId);
        const analysis = await aiAnalysisRepo.createOrUpdate(quizId, attemptId, analysisData);
        console.log('✅ AI analysis saved:', analysis.id);
        res.json({
            success: true,
            analysis: {
                id: analysis.id,
                quizId: analysis.quiz_id,
                attemptId: analysis.attempt_id,
                data: analysis.analysis_data,
                createdAt: analysis.created_at,
                updatedAt: analysis.updated_at
            }
        });
    }
    catch (error) {
        console.error('Error saving AI analysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.saveAIAnalysis = saveAIAnalysis;
// Check if AI analysis exists
const checkAIAnalysis = async (req, res) => {
    try {
        const { quizId, attemptId } = req.params;
        if (!quizId || !attemptId) {
            return res.status(400).json({ error: 'Quiz ID and Attempt ID are required' });
        }
        const exists = await aiAnalysisRepo.exists(quizId, attemptId);
        res.json({
            success: true,
            exists,
            needsAnalysis: !exists
        });
    }
    catch (error) {
        console.error('Error checking AI analysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.checkAIAnalysis = checkAIAnalysis;
// Get AI analysis by quiz only (not attempt-specific)
const getAIAnalysisByQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        if (!quizId) {
            return res.status(400).json({ error: 'Quiz ID is required' });
        }
        console.log('🔍 Getting AI analysis for quiz:', quizId);
        const analysis = await aiAnalysisRepo.getByQuiz(quizId);
        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'AI analysis not found for this quiz',
                needsAnalysis: true
            });
        }
        console.log('✅ AI analysis found for quiz:', analysis.id);
        res.json({
            success: true,
            analysis: {
                id: analysis.id,
                quizId: analysis.quiz_id,
                attemptId: analysis.attempt_id,
                data: analysis.analysis_data,
                createdAt: analysis.created_at,
                updatedAt: analysis.updated_at
            }
        });
    }
    catch (error) {
        console.error('Error getting AI analysis by quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAIAnalysisByQuiz = getAIAnalysisByQuiz;
// Save AI analysis by quiz only (not attempt-specific)
const saveAIAnalysisByQuiz = async (req, res) => {
    try {
        const { quizId, analysisData } = req.body;
        if (!quizId || !analysisData) {
            return res.status(400).json({ error: 'Quiz ID and analysis data are required' });
        }
        console.log('💾 Saving AI analysis for quiz:', quizId);
        // Use a default attempt ID for quiz-level analysis
        const defaultAttemptId = 'quiz-level-analysis';
        const analysis = await aiAnalysisRepo.createOrUpdate(quizId, defaultAttemptId, analysisData);
        console.log('✅ AI analysis saved for quiz:', analysis.id);
        res.json({
            success: true,
            analysis: {
                id: analysis.id,
                quizId: analysis.quiz_id,
                attemptId: analysis.attempt_id,
                data: analysis.analysis_data,
                createdAt: analysis.created_at,
                updatedAt: analysis.updated_at
            }
        });
    }
    catch (error) {
        console.error('Error saving AI analysis by quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.saveAIAnalysisByQuiz = saveAIAnalysisByQuiz;
// Check if AI analysis exists for quiz
const checkAIAnalysisByQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        if (!quizId) {
            return res.status(400).json({ error: 'Quiz ID is required' });
        }
        const exists = await aiAnalysisRepo.existsByQuiz(quizId);
        res.json({
            success: true,
            exists,
            needsAnalysis: !exists
        });
    }
    catch (error) {
        console.error('Error checking AI analysis by quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.checkAIAnalysisByQuiz = checkAIAnalysisByQuiz;
// Delete AI analysis
const deleteAIAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Analysis ID is required' });
        }
        const deleted = await aiAnalysisRepo.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'AI analysis not found' });
        }
        res.json({
            success: true,
            message: 'AI analysis deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting AI analysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteAIAnalysis = deleteAIAnalysis;
