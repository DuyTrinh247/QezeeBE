import { Request, Response } from 'express';
import { QuizAnalysisService } from '../services/quizAnalysisService';
import { quizzesService } from '../services/quizzesService';
import { quizAttemptsService } from '../services/quizAttemptsService';

export const analyzeQuizResults = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Quiz Analysis Request received');
    
    const { quizId, attemptId } = req.params;
    const userId = req.user?.userId;

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
    const quiz = await quizzesService.getQuizById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quiz not found' 
      });
    }

    // Get attempt data from database
    const attempt = await quizAttemptsService.getQuizAttemptById(attemptId);
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
    const analysis = await QuizAnalysisService.analyzeQuizResults(analysisRequest);

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

  } catch (error: any) {
    console.error('❌ Error in quiz analysis:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze quiz results',
      details: error.message 
    });
  }
};
