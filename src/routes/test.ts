import express from 'express';
import aiQuizService from '../services/aiQuizService';

const router = express.Router();

/**
 * @route POST /api/test/ai-quiz-generate
 * @desc Test AI quiz generation without database save
 * @access Public
 */
router.post('/ai-quiz-generate', async (req, res) => {
  try {
    console.log('🧪 Testing AI Quiz Generation...');
    
    const {
      text,
      numQuestions = 5,
      difficulty = 'medium',
      questionTypes = ['multiple_choice', 'true_false']
    } = req.body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ 
        error: 'Text content is too long (max 50,000 characters)' 
      });
    }

    // Validate options
    if (numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({ 
        error: 'Number of questions must be between 1 and 20' 
      });
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({
        error: 'Difficulty must be easy, medium, or hard' 
      });
    }

    const validQuestionTypes = ['multiple_choice', 'true_false', 'fill_blank', 'essay'];
    const invalidTypes = questionTypes.filter((type: string) => !validQuestionTypes.includes(type));
    if (invalidTypes.length > 0) {
      return res.status(400).json({ 
        error: `Invalid question types: ${invalidTypes.join(', ')}` 
      });
    }

    console.log('📋 Generation options:', {
      numQuestions,
      difficulty,
      questionTypes,
      textLength: text.length
    });

    // Generate quiz from text (without saving to database)
    const generatedQuiz = await aiQuizService.generateQuizFromText(text, {
      numQuestions: parseInt(numQuestions),
      questionTypes,
      timeLimit: 15, // Default 15 minutes for test
      userId: 'test-user-123',
      userName: 'Test User',
      userEmail: 'test@example.com'
    });

    console.log('✅ Quiz generated successfully');

    res.json({
      success: true,
      message: 'Quiz generated successfully from text (not saved to database)',
      quiz: generatedQuiz
    });

  } catch (error) {
    console.error('❌ Error generating quiz:', error);
    res.status(500).json({
      error: 'Failed to generate quiz from text',
      details: (error as Error).message
    });
  }
});

export default router;