import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { QuizAttemptsRepository } from '../repositories/quizAttemptsRepository';
import { QuizAttemptSessionsRepository } from '../repositories/quizAttemptSessionsRepository';
import { QuizAttemptEventsRepository } from '../repositories/quizAttemptEventsRepository';
import { QuizzesRepository } from '../repositories/quizzesRepository';

const quizAttemptsRepo = new QuizAttemptsRepository();
const quizAttemptSessionsRepo = new QuizAttemptSessionsRepository();
const quizAttemptEventsRepo = new QuizAttemptEventsRepository();
const quizzesRepo = new QuizzesRepository();

// Start a new quiz attempt
export const startQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🚀 Starting quiz attempt - req.params:', req.params);
    console.log('🚀 Starting quiz attempt - req.user:', req.user);
    
    const { quizId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      console.log('❌ No user ID found');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('🔍 Looking for quiz with ID:', quizId);
    // Check if quiz exists
    const quiz = await quizzesRepo.findById(quizId);
    if (!quiz) {
      console.log('❌ Quiz not found:', quizId);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    console.log('✅ Quiz found:', quiz.id, quiz.title);

    console.log('🔍 Checking for active attempts for user:', userId, 'quiz:', quizId);
    // Allow multiple attempts - just log if there are active attempts but don't block
    try {
      const activeAttempt = await quizAttemptsRepo.findActiveAttempt(userId, quizId);
      if (activeAttempt) {
        console.log('⚠️ Active attempt found:', activeAttempt.id, '- allowing new attempt anyway');
        // Don't block, just log the warning
      } else {
        console.log('✅ No active attempts found, proceeding to create new attempt');
      }
    } catch (activeAttemptError) {
      console.error('❌ Error checking for active attempts:', activeAttemptError);
      // Don't block on error, just log and continue
      console.log('⚠️ Continuing despite error checking active attempts');
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
    console.log('📝 Creating new quiz attempt with data:', {
      user_id: userId,
      quiz_id: quizId,
      total_questions: quiz.total_questions,
      time_limit_seconds: quiz.time_limit ? quiz.time_limit * 60 : undefined,
      ip_address: ipAddress,
      user_agent: userAgent
    });
    
    let attempt;
    try {
      attempt = await quizAttemptsRepo.create({
        user_id: userId,
        quiz_id: quizId,
        total_questions: quiz.total_questions,
        time_limit_seconds: quiz.time_limit ? quiz.time_limit * 60 : undefined,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_info: deviceInfo
      });
      
      console.log('✅ Quiz attempt created successfully:', attempt.id);
    } catch (createError) {
      console.error('❌ Error creating quiz attempt:', createError);
      throw createError;
    }

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
  } catch (error) {
    console.error('❌ Error starting quiz attempt:', error);
    console.error('❌ Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: (error as Error).message 
    });
  }
};

// Submit quiz attempt with answers and time
export const submitQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { answers, timeSpent, timeSpentMs } = req.body;
    const userId = req.user?.userId;

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
    
    console.log('🔍 Calculating score...');
    console.log('Quiz data structure:', {
      hasQuizData: !!quizData,
      hasQuestions: !!(quizData && quizData.questions),
      questionsCount: quizData?.questions?.length || 0
    });
    console.log('User answers:', answers);
    
    if (quizData && quizData.questions) {
      quizData.questions.forEach((question: any, index: number) => {
        const userAnswer = answers[question.id];
        
        // Normalize answers for comparison
        let normalizedUserAnswer = userAnswer;
        let normalizedCorrectAnswer = question.correctAnswer;
        
        // Handle True/False questions - convert boolean to string for comparison
        if (question.questionType === 'true_false') {
          // Convert user answer to uppercase string
          if (typeof userAnswer === 'boolean') {
            normalizedUserAnswer = userAnswer ? 'TRUE' : 'FALSE';
          } else if (typeof userAnswer === 'string') {
            normalizedUserAnswer = userAnswer.toUpperCase();
          }
          
          // Convert correct answer to uppercase string
          if (typeof question.correctAnswer === 'boolean') {
            normalizedCorrectAnswer = question.correctAnswer ? 'TRUE' : 'FALSE';
          } else if (typeof question.correctAnswer === 'string') {
            normalizedCorrectAnswer = question.correctAnswer.toUpperCase();
          }
        }
        
        const isCorrect = normalizedUserAnswer && normalizedUserAnswer === normalizedCorrectAnswer;
        
        console.log(`Question ${index + 1}:`, {
          questionId: question.id,
          questionText: question.questionText?.substring(0, 50) + '...',
          questionType: question.questionType,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          normalizedUserAnswer: normalizedUserAnswer,
          normalizedCorrectAnswer: normalizedCorrectAnswer,
          userAnswerType: typeof userAnswer,
          correctAnswerType: typeof question.correctAnswer,
          isMatch: normalizedUserAnswer === normalizedCorrectAnswer,
          isCorrect: isCorrect
        });
        
        if (isCorrect) {
          correctAnswers++;
        }
      });
    }
    
    console.log('✅ Score calculation complete:', {
      correctAnswers,
      totalQuestions: attempt.total_questions,
      scorePercentage: Math.round((correctAnswers / attempt.total_questions) * 100)
    });

    const score = Math.round((correctAnswers / attempt.total_questions) * 100);
    
    // Handle timeSpent - prioritize timeSpentMs if available, otherwise use timeSpent
    let timeTaken = undefined;
    let timeTakenMs = undefined;
    
    if (timeSpentMs !== undefined && timeSpentMs !== null) {
      // timeSpentMs is in milliseconds, convert to seconds
      timeTaken = Math.round(timeSpentMs / 1000);
      timeTakenMs = Math.round(timeSpentMs);
    } else if (timeSpent !== undefined && timeSpent !== null) {
      // timeSpent is already in seconds
      timeTaken = Math.round(timeSpent);
      timeTakenMs = Math.round(timeSpent * 1000);
    }
    
    console.log('Time calculation:', {
      timeSpent,
      timeSpentMs,
      timeTaken,
      timeTakenMs
    });
    const incorrectAnswers = attempt.total_questions - correctAnswers;

    // Calculate question timings if provided
    const questionTimings = answers ? Object.keys(answers).map((questionId, index) => ({
      questionId,
      questionNumber: index + 1,
      answeredAt: new Date().toISOString(),
      timeSpentMs: Math.random() * 30000 + 5000 // Placeholder - should be calculated from frontend
    })) : undefined;

    // Calculate completed_at based on started_at + time_taken
    let completedAt = new Date();
    if (timeTaken && attempt.started_at) {
      // Calculate completed_at = started_at + time_taken (in seconds)
      const startedAt = new Date(attempt.started_at);
      completedAt = new Date(startedAt.getTime() + (timeTaken * 1000));
    }
    
    console.log('Time calculation details:', {
      started_at: attempt.started_at,
      started_at_parsed: new Date(attempt.started_at),
      time_taken: timeTaken,
      calculated_completed_at: completedAt,
      current_time: new Date(),
      timezone_offset: new Date().getTimezoneOffset()
    });

    // Update attempt with enhanced data including quiz_data for AI analysis
    const updatedAttempt = await quizAttemptsRepo.update(attemptId, {
      completed_at: completedAt,
      time_taken: timeTaken,
      time_taken_seconds: timeTaken,
      time_taken_milliseconds: timeTakenMs,
      score: score,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
      answers: answers,
      quiz_data: quizData, // Save quiz questions for later AI analysis
      question_timings: questionTimings,
      status: 'completed'
    });

    // Update session end time
    const activeSession = await quizAttemptSessionsRepo.findActiveSession(attemptId);
    if (activeSession) {
      // Use current time for session_end to avoid timezone issues
      const currentTime = new Date();
      const sessionDuration = currentTime.getTime() - new Date(activeSession.session_start).getTime();
      await quizAttemptSessionsRepo.update(activeSession.id, {
        session_end: currentTime,
        session_duration_ms: sessionDuration,
        last_activity: currentTime
      });
      
      console.log('Session updated:', {
        session_start: activeSession.session_start,
        session_start_parsed: new Date(activeSession.session_start),
        session_end: currentTime,
        session_duration_ms: sessionDuration,
        session_duration_seconds: Math.round(sessionDuration / 1000)
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
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get quiz attempt details
export const getQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user?.userId;

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

    console.log('Quiz attempt retrieved:', {
      id: attempt.id,
      time_taken: attempt.time_taken,
      time_taken_seconds: attempt.time_taken_seconds,
      time_taken_milliseconds: attempt.time_taken_milliseconds,
      score: attempt.score,
      correct_answers: attempt.correct_answers,
      status: attempt.status,
      hasAnswers: !!attempt.answers,
      hasQuizData: !!(attempt as any).quiz_data,
      answersType: typeof attempt.answers,
      quizDataType: typeof (attempt as any).quiz_data
    });

    res.json({
      success: true,
      attempt: attempt
    });
  } catch (error) {
    console.error('Error getting quiz attempt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's quiz attempts
export const getUserQuizAttempts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { limit = 10, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const attempts = await quizAttemptsRepo.findByUserId(
      userId, 
      parseInt(limit as string), 
      parseInt(offset as string)
    );

    res.json({
      success: true,
      attempts: attempts,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: attempts.length
      }
    });
  } catch (error) {
    console.error('Error getting user quiz attempts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get quiz attempt statistics
export const getQuizAttemptStats = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await quizAttemptsRepo.getQuizAttemptStats(quizId);

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error getting quiz attempt stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's attempt statistics
export const getUserAttemptStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await quizAttemptsRepo.getAttemptStats(userId);

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error getting user attempt stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get quiz attempt sessions
export const getQuizAttemptSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user?.userId;

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
  } catch (error) {
    console.error('Error getting quiz attempt sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get quiz attempt events
export const getQuizAttemptEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user?.userId;
    const { limit = 100, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify ownership
    const attempt = await quizAttemptsRepo.findById(attemptId);
    if (!attempt || attempt.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const events = await quizAttemptEventsRepo.findByAttemptId(
      attemptId,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    const eventStats = await quizAttemptEventsRepo.getEventStats(attemptId);
    const timeline = await quizAttemptEventsRepo.getTimeline(attemptId);

    res.json({
      success: true,
      events: events,
      stats: eventStats,
      timeline: timeline
    });
  } catch (error) {
    console.error('Error getting quiz attempt events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Log quiz attempt event (for real-time tracking)
export const logQuizAttemptEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { eventType, questionId, questionNumber, timeSpentMs, eventData } = req.body;
    const userId = req.user?.userId;

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
  } catch (error) {
    console.error('Error logging quiz attempt event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a quiz attempt
export const deleteQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!attemptId) {
      return res.status(400).json({ error: 'Attempt ID is required' });
    }

    console.log('🗑️ Deleting quiz attempt:', attemptId, 'for user:', userId);

    // Check if attempt exists and belongs to user
    const attempt = await quizAttemptsRepo.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }

    if (attempt.user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own quiz attempts' });
    }

    // Delete the attempt
    const deleted = await quizAttemptsRepo.delete(attemptId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete quiz attempt' });
    }

    console.log('✅ Successfully deleted quiz attempt:', attemptId);

    res.json({
      success: true,
      message: 'Quiz attempt deleted successfully',
      attemptId: attemptId
    });

  } catch (error) {
    console.error('Error deleting quiz attempt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
