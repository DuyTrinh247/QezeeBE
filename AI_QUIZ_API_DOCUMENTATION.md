# AI Quiz Generation API Documentation

## Overview
This API provides AI-powered quiz generation from text content and PDF files using OpenAI's GPT models. The system can automatically create educational quizzes with multiple question types based on provided content.

## Features
- 📄 **PDF Processing**: Extract text from PDF files and generate quizzes
- 📝 **Text Processing**: Generate quizzes directly from text content
- 🤖 **AI-Powered**: Uses OpenAI GPT-3.5-turbo for intelligent question generation
- 🎯 **Multiple Question Types**: Support for multiple choice, true/false, fill-in-the-blank, and essay questions
- ⚙️ **Customizable**: Configurable difficulty levels, number of questions, and question types
- 💾 **Database Integration**: Automatically saves generated quizzes to the database

## API Endpoints

### 1. Generate Quiz from Text

**Endpoint:** `POST /api/v1/ai-quiz/generate-from-text`

**Description:** Generate a quiz from provided text content using AI.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "text": "Your text content here...",
  "numQuestions": 5,
  "difficulty": "medium",
  "questionTypes": ["multiple_choice", "true_false"]
}
```

**Parameters:**
- `text` (string, required): The text content to generate quiz from
- `numQuestions` (number, optional): Number of questions to generate (1-20, default: 5)
- `difficulty` (string, optional): Difficulty level - "easy", "medium", or "hard" (default: "medium")
- `questionTypes` (array, optional): Types of questions to generate (default: ["multiple_choice", "true_false"])
  - Available types: "multiple_choice", "true_false", "fill_blank", "essay"

**Response:**
```json
{
  "success": true,
  "message": "Quiz generated successfully from text",
  "quiz": {
    "id": "quiz_1759161581415_n8hywsrpq",
    "title": "Generated Quiz Title",
    "description": "Quiz description",
    "total_questions": 5,
    "time_limit": 150,
    "difficulty_level": "medium",
    "quiz_data": {
      "questions": [
        {
          "id": "q_quiz_123_1",
          "questionText": "What is artificial intelligence?",
          "questionType": "multiple_choice",
          "options": [
            {
              "id": "opt_q_123_1_1",
              "text": "Option A",
              "value": "Option A",
              "isCorrect": true,
              "order": 1
            }
          ],
          "correctAnswer": "Option A",
          "explanation": "Explanation text",
          "points": 10,
          "difficulty": "medium",
          "category": "General",
          "tags": ["ai", "technology"],
          "timeLimit": 60,
          "isRequired": true
        }
      ],
      "category": "AI Generated",
      "tags": ["ai-generated", "text-quiz"],
      "author": {
        "id": "user-123",
        "name": "User Name",
        "email": "user@example.com"
      }
    },
    "status": "active",
    "created_at": "2025-09-29T15:56:21.415Z",
    "updated_at": "2025-09-29T15:56:21.415Z"
  }
}
```

### 2. Generate Quiz from PDF

**Endpoint:** `POST /api/v1/ai-quiz/generate-from-pdf`

**Description:** Upload a PDF file and generate a quiz from its content.

**Authentication:** Required (Bearer token)

**Request:** Multipart form data
- `pdfFile` (file, required): PDF file to process (max 10MB)
- `numQuestions` (number, optional): Number of questions to generate (1-20, default: 5)
- `difficulty` (string, optional): Difficulty level (default: "medium")
- `questionTypes` (string, optional): JSON string of question types array

**Response:** Same as text generation endpoint

### 3. Test Endpoint (No Database)

**Endpoint:** `POST /api/test/ai-quiz-generate`

**Description:** Test quiz generation without saving to database.

**Authentication:** Not required

**Request Body:** Same as text generation endpoint

**Response:** Same format as text generation but without database save

## Error Responses

### 400 Bad Request
```json
{
  "error": "Text content is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate quiz from text",
  "details": "OpenAI API error message"
}
```

## Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Generate quiz from text
async function generateQuizFromText() {
  try {
    const response = await axios.post(
      'http://localhost:3002/api/v1/ai-quiz/generate-from-text',
      {
        text: "Your educational content here...",
        numQuestions: 5,
        difficulty: "medium",
        questionTypes: ["multiple_choice", "true_false"]
      },
      {
        headers: {
          'Authorization': 'Bearer your-token-here',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Generated quiz:', response.data.quiz);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Generate quiz from PDF
async function generateQuizFromPDF() {
  try {
    const formData = new FormData();
    formData.append('pdfFile', fs.createReadStream('document.pdf'));
    formData.append('numQuestions', '5');
    formData.append('difficulty', 'medium');
    formData.append('questionTypes', JSON.stringify(['multiple_choice']));

    const response = await axios.post(
      'http://localhost:3002/api/v1/ai-quiz/generate-from-pdf',
      formData,
      {
        headers: {
          'Authorization': 'Bearer your-token-here',
          ...formData.getHeaders()
        }
      }
    );
    
    console.log('Generated quiz:', response.data.quiz);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### cURL Examples

#### Generate from Text
```bash
curl -X POST http://localhost:3002/api/v1/ai-quiz/generate-from-text \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial Intelligence is the simulation of human intelligence in machines...",
    "numQuestions": 3,
    "difficulty": "medium",
    "questionTypes": ["multiple_choice", "true_false"]
  }'
```

#### Generate from PDF
```bash
curl -X POST http://localhost:3002/api/v1/ai-quiz/generate-from-pdf \
  -H "Authorization: Bearer your-token-here" \
  -F "pdfFile=@document.pdf" \
  -F "numQuestions=5" \
  -F "difficulty=hard" \
  -F "questionTypes=[\"multiple_choice\",\"essay\"]"
```

## Configuration

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Database Configuration (for saving quizzes)
PGHOST=your-database-host
PGPORT=5432
PGUSER=your-username
PGDATABASE=your-database
PGPASSWORD=your-password
PGSSL=true
```

### Dependencies
- `openai`: OpenAI API client
- `pdf-parse`: PDF text extraction
- `multer`: File upload handling
- `pg`: PostgreSQL database client

## Rate Limits and Considerations

- **OpenAI API Limits**: Subject to OpenAI's rate limits and usage quotas
- **File Size**: PDF files limited to 10MB
- **Text Length**: Text content limited to 50,000 characters
- **Questions**: Maximum 20 questions per generation request
- **Processing Time**: Typically 5-15 seconds depending on content length and complexity

## Best Practices

1. **Content Quality**: Provide clear, well-structured text for better quiz generation
2. **Question Types**: Mix different question types for variety
3. **Difficulty**: Match difficulty to your target audience
4. **Error Handling**: Always handle API errors gracefully
5. **Authentication**: Keep API tokens secure and rotate regularly

## Troubleshooting

### Common Issues

1. **OpenAI API Key Invalid**
   - Check that `OPENAI_API_KEY` is set correctly in environment variables
   - Verify the API key is valid and has sufficient credits

2. **PDF Processing Failed**
   - Ensure the PDF file is not corrupted
   - Check file size is under 10MB
   - Verify the PDF contains extractable text (not just images)

3. **Database Connection Error**
   - Check database connection settings
   - Ensure database is running and accessible
   - Verify user permissions

4. **Authentication Required**
   - Include valid Bearer token in Authorization header
   - Ensure token is not expired

## Support

For issues or questions regarding the AI Quiz API:
1. Check the error response details
2. Verify your request format matches the documentation
3. Test with the `/api/test/ai-quiz-generate` endpoint first
4. Check server logs for detailed error information
