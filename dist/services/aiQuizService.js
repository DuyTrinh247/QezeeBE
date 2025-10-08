"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIQuizService = void 0;
const openai_1 = __importDefault(require("openai"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const fs_1 = __importDefault(require("fs"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
class AIQuizService {
    /**
     * Extract text content from PDF file
     */
    async extractTextFromPDF(filePath) {
        try {
            console.log('📄 Extracting text from PDF:', filePath);
            const dataBuffer = fs_1.default.readFileSync(filePath);
            const data = await (0, pdf_parse_1.default)(dataBuffer);
            console.log('✅ PDF text extracted successfully');
            console.log('📊 Text length:', data.text.length);
            return data.text;
        }
        catch (error) {
            console.error('❌ Error extracting PDF text:', error);
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
    }
    /**
     * Generate quiz questions from PDF text using OpenAI
     */
    async generateQuizFromText(text, options) {
        try {
            console.log('🤖 Generating quiz with OpenAI...');
            console.log('📋 Options:', options);
            // Truncate text if too long (OpenAI has token limits)
            const maxTextLength = 8000; // Approximate token limit for context
            const truncatedText = text.length > maxTextLength
                ? text.substring(0, maxTextLength) + '...'
                : text;
            const prompt = this.createQuizPrompt(truncatedText, options);
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert quiz generator. Create educational quiz questions based on the provided text content. Always respond with valid JSON format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.7,
            });
            const response = completion.choices[0].message.content;
            console.log('📝 OpenAI response received');
            // Clean the response to remove markdown code blocks
            let cleanedResponse = response || '{}';
            // Remove markdown code blocks if present
            if (cleanedResponse.includes('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
            }
            else if (cleanedResponse.includes('```')) {
                cleanedResponse = cleanedResponse.replace(/```\s*/g, '').replace(/```\s*$/g, '');
            }
            console.log('🧹 Cleaned response:', cleanedResponse.substring(0, 200) + '...');
            // Parse the JSON response
            const quizData = JSON.parse(cleanedResponse);
            // Debug PDF hints
            console.log('🔍 AI Generated Quiz Data:', quizData);
            console.log('🔍 AI Response structure:', {
                hasTitle: !!quizData.title,
                hasQuestions: !!quizData.questions,
                questionsCount: quizData.questions ? quizData.questions.length : 0
            });
            if (quizData.questions) {
                quizData.questions.forEach((question, index) => {
                    var _a;
                    console.log(`🔍 Question ${index + 1} Analysis:`, {
                        questionText: ((_a = question.questionText) === null || _a === void 0 ? void 0 : _a.substring(0, 50)) + '...',
                        pdfPageHint: question.pdfPageHint,
                        hasPdfPageHint: !!question.pdfPageHint,
                        pdfPageHintType: typeof question.pdfPageHint,
                        allQuestionKeys: Object.keys(question)
                    });
                });
            }
            else {
                console.log('❌ No questions found in AI response!');
            }
            // Generate unique IDs and format the quiz
            const quiz = this.formatQuizData(quizData, options);
            console.log('✅ Quiz generated successfully');
            console.log('📊 Generated questions:', quiz.questions.length);
            // Final PDF hints verification
            console.log('🔍 Final PDF Hints Verification:');
            quiz.questions.forEach((question, index) => {
                var _a;
                console.log(`Question ${index + 1}:`, {
                    questionText: ((_a = question.questionText) === null || _a === void 0 ? void 0 : _a.substring(0, 50)) + '...',
                    pdfPageHint: question.pdfPageHint,
                    hasPdfPageHint: !!question.pdfPageHint
                });
            });
            const questionsWithHints = quiz.questions.filter(q => q.pdfPageHint);
            console.log(`📈 PDF Hints Coverage: ${questionsWithHints.length}/${quiz.questions.length} questions have hints`);
            return quiz;
        }
        catch (error) {
            console.error('❌ Error generating quiz:', error);
            throw new Error(`Failed to generate quiz: ${error.message}`);
        }
    }
    /**
     * Create prompt for OpenAI to generate quiz
     */
    createQuizPrompt(text, options) {
        const questionTypesStr = options.questionTypes.join(', ');
        return `
Create a quiz based on the following text content. Generate exactly ${options.numQuestions} questions.

Text Content:
${text}

Requirements:
- Question types: ${questionTypesStr}
- Time limit: ${options.timeLimit} minutes
- Each question should test understanding of the content
- Provide clear explanations for answers
- Make questions relevant to the text content
- Use medium difficulty level for all questions
- CRITICAL: For each question, you MUST provide a pdfPageHint (page number 1-10) where the answer can be found
- CRITICAL: For multiple_choice questions, you MUST provide EXACTLY 4 options (A, B, C, D)

Please respond with a JSON object in this exact format:
{
  "title": "Quiz Title",
  "description": "Brief description of the quiz",
  "questions": [
    {
      "questionText": "Question text here",
      "questionType": "multiple_choice",
      "options": [
        {
          "text": "Option A",
          "isCorrect": true
        },
        {
          "text": "Option B", 
          "isCorrect": false
        },
        {
          "text": "Option C", 
          "isCorrect": false
        },
        {
          "text": "Option D", 
          "isCorrect": false
        }
      ],
      "correctAnswer": "Option A",
      "explanation": "Explanation why this is correct",
      "points": 10,
      "difficulty": "medium",
      "category": "General",
      "tags": ["tag1", "tag2"],
      "timeLimit": 60,
      "isRequired": true,
      "pdfPageHint": 3
    }
  ]
}

CRITICAL REQUIREMENTS:
- Ensure all JSON is valid
- Include exactly ${options.numQuestions} questions
- Use only the specified question types: ${questionTypesStr}
- Make sure explanations are educational and helpful
- EVERY question MUST have a pdfPageHint (number between 1-10)
- For pdfPageHint: Estimate which page (1-10) contains the information needed to answer the question
- If content is from beginning, use pages 1-3
- If content is from middle, use pages 4-7  
- If content is from end, use pages 8-10
- ALWAYS include pdfPageHint for every single question
- FOR MULTIPLE CHOICE QUESTIONS: MUST have EXACTLY 4 options (no more, no less)
- FOR TRUE/FALSE QUESTIONS: Only 2 options (True/False) are needed
`;
    }
    /**
     * Format the quiz data from OpenAI response
     */
    formatQuizData(data, options) {
        const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        // Format questions with unique IDs
        const formattedQuestions = data.questions.map((q, index) => {
            const questionId = `q_${quizId}_${index + 1}`;
            // Debug PDF hint processing
            const originalPdfPageHint = q.pdfPageHint;
            const fallbackPdfPageHint = Math.floor(Math.random() * 5) + 1;
            const finalPdfPageHint = q.pdfPageHint || fallbackPdfPageHint;
            console.log(`🔍 Processing Question ${index + 1} PDF Hint:`, {
                originalPdfPageHint,
                fallbackPdfPageHint,
                finalPdfPageHint,
                hasOriginalHint: !!originalPdfPageHint,
                usedFallback: !originalPdfPageHint
            });
            return {
                id: questionId,
                questionText: q.questionText || '',
                questionType: q.questionType || 'multiple_choice',
                options: (q.options || []).map((opt, optIndex) => ({
                    id: `opt_${questionId}_${optIndex + 1}`,
                    text: opt.text || '',
                    value: opt.text || '',
                    isCorrect: opt.isCorrect || false,
                    order: optIndex + 1
                })),
                correctAnswer: (() => {
                    if (q.questionType === 'true_false') {
                        // For True/False questions, ensure correctAnswer is boolean
                        if (q.correctAnswer === true || q.correctAnswer === 'true') {
                            return true;
                        }
                        else if (q.correctAnswer === false || q.correctAnswer === 'false') {
                            return false;
                        }
                        else {
                            // Default to false if not specified
                            return false;
                        }
                    }
                    else {
                        // For other question types, keep as string
                        return q.correctAnswer || '';
                    }
                })(),
                explanation: q.explanation || '',
                points: q.points || 10,
                difficulty: q.difficulty || 'medium',
                category: q.category || 'General',
                tags: q.tags || [],
                timeLimit: q.timeLimit || 60,
                isRequired: q.isRequired !== false,
                pdfPageHint: finalPdfPageHint, // Use processed PDF hint
                media: q.media
            };
        });
        return {
            id: quizId,
            title: data.title || 'Generated Quiz',
            description: data.description || 'Quiz generated from PDF content',
            totalQuestions: formattedQuestions.length,
            timeLimit: options.timeLimit || 30, // Use provided timeLimit in minutes
            difficulty: 'medium', // Always use medium difficulty
            category: 'AI Generated',
            tags: ['ai-generated', 'pdf-quiz'],
            questions: formattedQuestions,
            author: {
                id: options.userId,
                name: options.userName,
                email: options.userEmail
            },
            createdAt: now,
            updatedAt: now,
            status: 'published'
        };
    }
    /**
     * Generate quiz from PDF file
     */
    async generateQuizFromPDF(filePath, options) {
        try {
            console.log('🚀 Starting PDF to Quiz generation...');
            // Step 1: Extract text from PDF
            const text = await this.extractTextFromPDF(filePath);
            if (!text || text.trim().length === 0) {
                throw new Error('PDF file appears to be empty or could not be read');
            }
            // Step 2: Generate quiz from text
            const quiz = await this.generateQuizFromText(text, options);
            console.log('🎉 PDF to Quiz generation completed successfully');
            return quiz;
        }
        catch (error) {
            console.error('❌ Error in PDF to Quiz generation:', error);
            throw error;
        }
    }
}
exports.AIQuizService = AIQuizService;
exports.default = new AIQuizService();
