import { QuizAttemptsRepository } from '../repositories/quizAttemptsRepository';

const quizAttemptsRepo = new QuizAttemptsRepository();

export async function getQuizAttemptById(attemptId: string) {
  try {
    console.log('🔍 Getting quiz attempt by ID:', attemptId);
    const attempt = await quizAttemptsRepo.findById(attemptId);
    console.log('✅ Quiz attempt retrieved:', attempt ? 'Found' : 'Not found');
    return attempt;
  } catch (error) {
    console.error('❌ Error getting quiz attempt:', error);
    throw error;
  }
}

export async function getUserQuizAttempts(userId: string) {
  try {
    console.log('🔍 Getting quiz attempts for user:', userId);
    const attempts = await quizAttemptsRepo.findByUserId(userId);
    console.log('✅ User quiz attempts retrieved:', attempts.length, 'attempts');
    return attempts;
  } catch (error) {
    console.error('❌ Error getting user quiz attempts:', error);
    throw error;
  }
}

export const quizAttemptsService = {
  getQuizAttemptById,
  getUserQuizAttempts
};
