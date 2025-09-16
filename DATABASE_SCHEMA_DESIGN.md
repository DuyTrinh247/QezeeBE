# Database Schema Design - PDF to Quiz System

## Tổng quan
Hệ thống cho phép người dùng upload file PDF, AI sẽ tạo bộ câu hỏi từ PDF và lưu trữ kết quả.

## Cấu trúc Database

### 1. Bảng `users`
Lưu thông tin người dùng
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  password TEXT,
  email TEXT,
  google_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Bảng `pdf_files`
Lưu thông tin file PDF được upload
```sql
CREATE TABLE pdf_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'application/pdf',
  upload_status TEXT NOT NULL DEFAULT 'uploaded',
  processing_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Các trạng thái:**
- `upload_status`: uploaded, failed
- `processing_status`: pending, processing, completed, failed

### 3. Bảng `quizzes`
Lưu thông tin quiz được tạo từ PDF
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pdf_file_id UUID NOT NULL REFERENCES pdf_files(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_limit INTEGER, -- thời gian làm bài (phút)
  difficulty_level TEXT DEFAULT 'medium', -- easy, medium, hard
  quiz_data JSONB NOT NULL, -- chứa toàn bộ dữ liệu quiz
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, archived
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Các trạng thái:**
- `difficulty_level`: easy, medium, hard
- `status`: active, inactive, archived

### 4. Bảng `quiz_questions`
Lưu từng câu hỏi trong quiz
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB, -- array of options for multiple choice
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Các loại câu hỏi:**
- `question_type`: multiple_choice, true_false, fill_blank

### 5. Bảng `quiz_attempts`
Lưu lần làm quiz của user
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  time_taken INTEGER, -- thời gian làm bài (giây)
  score INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  answers JSONB, -- lưu câu trả lời của user
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Các trạng thái:**
- `status`: in_progress, completed, abandoned

## Relationships

```
users (1) -----> (N) pdf_files
pdf_files (1) -----> (1) quizzes
quizzes (1) -----> (N) quiz_questions
users (1) -----> (N) quiz_attempts
quizzes (1) -----> (N) quiz_attempts
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_pdf_files_user_id ON pdf_files(user_id);
CREATE INDEX idx_pdf_files_processing_status ON pdf_files(processing_status);
CREATE INDEX idx_quizzes_pdf_file_id ON quizzes(pdf_file_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);
```

## Workflow

### 1. Upload PDF
1. User upload file PDF
2. Lưu thông tin vào `pdf_files` với `processing_status = 'pending'`
3. Trả về `pdf_file_id`

### 2. AI Processing
1. AI xử lý file PDF
2. Cập nhật `processing_status = 'processing'`
3. Tạo quiz data
4. Lưu vào `quizzes` và `quiz_questions`
5. Cập nhật `processing_status = 'completed'`

### 3. Quiz Taking
1. User bắt đầu làm quiz
2. Tạo record trong `quiz_attempts`
3. Lưu câu trả lời vào `answers` JSONB
4. Cập nhật `status = 'completed'` khi hoàn thành

## JSONB Structure Examples

### quiz_data (trong bảng quizzes)
```json
{
  "metadata": {
    "title": "JavaScript Fundamentals Quiz",
    "description": "Quiz about basic JavaScript concepts",
    "totalQuestions": 5,
    "timeLimit": 30,
    "difficulty": "medium"
  },
  "questions": [
    {
      "id": "uuid",
      "questionNumber": 1,
      "questionText": "What is JavaScript?",
      "questionType": "multiple_choice",
      "options": ["Programming language", "Database", "Framework"],
      "correctAnswer": "Programming language",
      "explanation": "JavaScript is a programming language...",
      "points": 1
    }
  ]
}
```

### answers (trong bảng quiz_attempts)
```json
{
  "attemptId": "uuid",
  "answers": [
    {
      "questionId": "uuid",
      "questionNumber": 1,
      "userAnswer": "Programming language",
      "isCorrect": true,
      "timeSpent": 15
    }
  ],
  "summary": {
    "totalTime": 120,
    "correctAnswers": 4,
    "totalQuestions": 5,
    "score": 80
  }
}
```

## API Endpoints Cần Thiết

### PDF Management
- `POST /api/v1/pdf/upload` - Upload PDF file
- `GET /api/v1/pdf/:id` - Get PDF info
- `GET /api/v1/pdf/user/:userId` - Get user's PDFs
- `DELETE /api/v1/pdf/:id` - Delete PDF

### Quiz Management
- `GET /api/v1/quiz/:id` - Get quiz details
- `GET /api/v1/quiz/pdf/:pdfId` - Get quiz by PDF
- `POST /api/v1/quiz/generate` - Generate quiz from PDF
- `PUT /api/v1/quiz/:id` - Update quiz

### Quiz Taking
- `POST /api/v1/quiz/:id/start` - Start quiz attempt
- `POST /api/v1/quiz/:id/submit` - Submit quiz answers
- `GET /api/v1/quiz/attempt/:id` - Get attempt details
- `GET /api/v1/quiz/attempts/user/:userId` - Get user's attempts

## Security Considerations

1. **File Upload Security**
   - Validate file type (PDF only)
   - Limit file size
   - Scan for malware

2. **Data Privacy**
   - Encrypt sensitive data
   - Implement data retention policies
   - User data deletion on request

3. **Access Control**
   - User can only access their own PDFs/quizzes
   - JWT authentication required
   - Rate limiting on API endpoints
