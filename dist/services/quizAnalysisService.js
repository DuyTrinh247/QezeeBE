"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizAnalysisService = void 0;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
class QuizAnalysisService {
    static async analyzeQuizResults(data) {
        var _a, _b;
        try {
            console.log('🤖 Starting AI Quiz Analysis...');
            console.log('Quiz Title:', data.quizTitle);
            console.log('Total Questions:', data.totalQuestions);
            console.log('Correct Answers:', data.correctAnswers);
            console.log('Score:', data.score);
            // Prepare questions and answers for analysis
            const analysisData = data.questions.map((question, index) => {
                const userAnswer = data.userAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                return {
                    questionNumber: index + 1,
                    question: question.questionText,
                    questionType: question.questionType,
                    correctAnswer: question.correctAnswer,
                    userAnswer: userAnswer,
                    isCorrect: isCorrect,
                    options: question.options
                };
            });
            console.log('Analysis data prepared:', analysisData.length, 'questions');
            const prompt = `
You are an expert educational AI tutor. Analyze this quiz results and provide insights about the student's knowledge mastery.

QUIZ INFORMATION:
- Title: ${data.quizTitle}
- Total Questions: ${data.totalQuestions}
- Correct Answers: ${data.correctAnswers}
- Score: ${data.score}%

QUESTION-BY-QUESTION ANALYSIS:
${analysisData.map(q => `
Question ${q.questionNumber}: ${q.question}
- Type: ${q.questionType}
- Correct Answer: ${q.correctAnswer}
- User Answer: ${q.userAnswer}
- Result: ${q.isCorrect ? 'CORRECT' : 'INCORRECT'}
`).join('\n')}

Based on this analysis, please provide:

1. MASTERED CONCEPTS: List 3-5 key concepts/topics the student has demonstrated strong understanding of (based on correct answers)
2. WEAK CONCEPTS: List 3-5 key concepts/topics the student needs to improve (based on incorrect answers)
3. RECOMMENDATIONS: Provide 3-4 specific study recommendations to help the student improve
4. SUMMARY: A brief 2-3 sentence summary of the student's overall performance and learning path

Please format your response as JSON:
{
  "masteredConcepts": ["concept1", "concept2", ...],
  "weakConcepts": ["concept1", "concept2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "summary": "brief summary text"
}

Focus on identifying specific learning concepts, not just question topics. Be encouraging but constructive.
`;
            console.log('Sending request to OpenAI...');
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert educational AI tutor specializing in quiz analysis and learning recommendations. Always respond with valid JSON format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.7,
            });
            const content = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            console.log('OpenAI Response:', content);
            // Clean and parse the response
            let cleanContent = content.trim();
            // Remove markdown code blocks if present
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            }
            else if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            console.log('Cleaned content:', cleanContent);
            const analysis = JSON.parse(cleanContent);
            // Validate the response structure
            if (!analysis.masteredConcepts || !analysis.weakConcepts || !analysis.recommendations || !analysis.summary) {
                throw new Error('Invalid analysis structure from AI');
            }
            console.log('✅ AI Analysis completed successfully');
            console.log('Mastered Concepts:', analysis.masteredConcepts);
            console.log('Weak Concepts:', analysis.weakConcepts);
            console.log('Recommendations:', analysis.recommendations);
            return analysis;
        }
        catch (error) {
            console.error('❌ Error in AI Quiz Analysis:', error);
            // Fallback analysis if AI fails
            return {
                masteredConcepts: ['Basic understanding demonstrated'],
                weakConcepts: ['Some concepts need reinforcement'],
                recommendations: [
                    'Review incorrect answers',
                    'Practice similar questions',
                    'Focus on weak areas'
                ],
                summary: `You scored ${data.score}% on this quiz. ${data.correctAnswers} out of ${data.totalQuestions} questions were answered correctly. Keep practicing to improve your understanding.`
            };
        }
    }
}
exports.QuizAnalysisService = QuizAnalysisService;
