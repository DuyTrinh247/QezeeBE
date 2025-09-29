import OpenAI from 'openai';
import pdf from 'pdf-parse';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
  options: {
    id: string;
    text: string;
    value: string;
    isCorrect: boolean;
    order: number;
  }[];
  correctAnswer: string;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  timeLimit: number;
  isRequired: boolean;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    alt?: string;
  };
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  questions: QuizQuestion[];
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  status: 'published' | 'draft' | 'archived';
}

export class AIQuizService {
  /**
   * Extract text content from PDF file
   */
  async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      console.log('📄 Extracting text from PDF:', filePath);
      
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      console.log('✅ PDF text extracted successfully');
      console.log('📊 Text length:', data.text.length);
      
      return data.text;
    } catch (error) {
      console.error('❌ Error extracting PDF text:', error);
      throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`);
    }
  }

  /**
   * Generate quiz questions from PDF text using OpenAI
   */
  async generateQuizFromText(
    text: string,
    options: {
      numQuestions: number;
      difficulty: 'easy' | 'medium' | 'hard';
      questionTypes: ('multiple_choice' | 'true_false' | 'fill_blank' | 'essay')[];
      userId: string;
      userName: string;
      userEmail: string;
    }
  ): Promise<GeneratedQuiz> {
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

      // Parse the JSON response
      const quizData = JSON.parse(response || '{}');
      
      // Generate unique IDs and format the quiz
      const quiz = this.formatQuizData(quizData, options);
      
      console.log('✅ Quiz generated successfully');
      console.log('📊 Generated questions:', quiz.questions.length);

      return quiz;
    } catch (error) {
      console.error('❌ Error generating quiz:', error);
      throw new Error(`Failed to generate quiz: ${(error as Error).message}`);
    }
  }

  /**
   * Create prompt for OpenAI to generate quiz
   */
  private createQuizPrompt(
    text: string, 
    options: {
      numQuestions: number;
      difficulty: 'easy' | 'medium' | 'hard';
      questionTypes: ('multiple_choice' | 'true_false' | 'fill_blank' | 'essay')[];
    }
  ): string {
    const questionTypesStr = options.questionTypes.join(', ');
    
    return `
Create a quiz based on the following text content. Generate exactly ${options.numQuestions} questions.

Text Content:
${text}

Requirements:
- Difficulty level: ${options.difficulty}
- Question types: ${questionTypesStr}
- Each question should test understanding of the content
- Provide clear explanations for answers
- Make questions relevant to the text content

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
        }
      ],
      "correctAnswer": "Option A",
      "explanation": "Explanation why this is correct",
      "points": 10,
      "difficulty": "medium",
      "category": "General",
      "tags": ["tag1", "tag2"],
      "timeLimit": 60,
      "isRequired": true
    }
  ]
}

Important:
- Ensure all JSON is valid
- Include exactly ${options.numQuestions} questions
- Use only the specified question types: ${questionTypesStr}
- Make sure explanations are educational and helpful
- Distribute difficulty appropriately
`;
  }

  /**
   * Format the quiz data from OpenAI response
   */
  private formatQuizData(
    data: any, 
    options: {
      userId: string;
      userName: string;
      userEmail: string;
    }
  ): GeneratedQuiz {
    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Format questions with unique IDs
    const formattedQuestions: QuizQuestion[] = data.questions.map((q: any, index: number) => {
      const questionId = `q_${quizId}_${index + 1}`;
      
      return {
        id: questionId,
        questionText: q.questionText || '',
        questionType: q.questionType || 'multiple_choice',
        options: (q.options || []).map((opt: any, optIndex: number) => ({
          id: `opt_${questionId}_${optIndex + 1}`,
          text: opt.text || '',
          value: opt.text || '',
          isCorrect: opt.isCorrect || false,
          order: optIndex + 1
        })),
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
        points: q.points || 10,
        difficulty: q.difficulty || 'medium',
        category: q.category || 'General',
        tags: q.tags || [],
        timeLimit: q.timeLimit || 60,
        isRequired: q.isRequired !== false,
        media: q.media
      };
    });

    return {
      id: quizId,
      title: data.title || 'Generated Quiz',
      description: data.description || 'Quiz generated from PDF content',
      totalQuestions: formattedQuestions.length,
      timeLimit: 30 * formattedQuestions.length, // 30 seconds per question
      difficulty: (options as any).difficulty || 'medium',
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
  async generateQuizFromPDF(
    filePath: string,
    options: {
      numQuestions: number;
      difficulty: 'easy' | 'medium' | 'hard';
      questionTypes: ('multiple_choice' | 'true_false' | 'fill_blank' | 'essay')[];
      userId: string;
      userName: string;
      userEmail: string;
    }
  ): Promise<GeneratedQuiz> {
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
      
    } catch (error) {
      console.error('❌ Error in PDF to Quiz generation:', error);
      throw error;
    }
  }
}

export default new AIQuizService();
