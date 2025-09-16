# Database Schema Design V2 - Enhanced Quiz Time Tracking

## Tổng quan
Thiết kế lại database để cải thiện việc lưu trữ và theo dõi thời gian làm quiz của người dùng với độ chính xác cao hơn.

## Cấu trúc Database Cải Tiến

### 1. Bảng `users` (Không thay đổi)
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

### 2. Bảng `pdf_files` (Không thay đổi)
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

### 3. Bảng `quizzes` (Cải tiến)
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

### 4. Bảng `quiz_questions` (Không thay đổi)
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

### 5. Bảng `quiz_attempts` (Cải tiến mạnh)
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  
  -- Thời gian bắt đầu và kết thúc
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Thời gian làm bài (cải tiến)
  time_taken_seconds INTEGER, -- thời gian làm bài (giây)
  time_taken_milliseconds BIGINT, -- thời gian làm bài (milliseconds) - chính xác hơn
  time_limit_seconds INTEGER, -- thời gian giới hạn (giây)
  
  -- Kết quả quiz
  score INTEGER DEFAULT 0, -- điểm số (0-100)
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  
  -- Dữ liệu câu trả lời
  answers JSONB, -- lưu câu trả lời của user với thời gian chi tiết
  question_timings JSONB, -- lưu thời gian làm từng câu hỏi
  
  -- Trạng thái
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, abandoned, timeout
  
  -- Metadata
  ip_address INET, -- IP address của user
  user_agent TEXT, -- User agent string
  device_info JSONB, -- Thông tin thiết bị
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Bảng `quiz_attempt_sessions` (Mới - Theo dõi session chi tiết)
```sql
CREATE TABLE quiz_attempt_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  
  -- Thông tin session
  session_start TIMESTAMP NOT NULL,
  session_end TIMESTAMP,
  session_duration_ms BIGINT, -- thời gian session (milliseconds)
  
  -- Thông tin tạm dừng
  pause_count INTEGER DEFAULT 0, -- số lần tạm dừng
  total_pause_duration_ms BIGINT DEFAULT 0, -- tổng thời gian tạm dừng
  last_activity TIMESTAMP, -- thời gian hoạt động cuối cùng
  
  -- Metadata
  browser_info JSONB, -- thông tin browser
  screen_resolution TEXT, -- độ phân giải màn hình
  timezone TEXT, -- múi giờ
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Bảng `quiz_attempt_events` (Mới - Theo dõi sự kiện)
```sql
CREATE TABLE quiz_attempt_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  
  -- Thông tin sự kiện
  event_type TEXT NOT NULL, -- start, answer, pause, resume, submit, timeout
  event_timestamp TIMESTAMP NOT NULL,
  event_data JSONB, -- dữ liệu chi tiết của sự kiện
  
  -- Metadata
  question_id UUID, -- ID câu hỏi (nếu có)
  question_number INTEGER, -- số thứ tự câu hỏi
  time_spent_ms BIGINT, -- thời gian làm câu hỏi (milliseconds)
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## JSONB Structure Examples

### answers (trong bảng quiz_attempts) - Cải tiến
```json
{
  "attemptId": "uuid",
  "answers": [
    {
      "questionId": "uuid",
      "questionNumber": 1,
      "userAnswer": "Programming language",
      "isCorrect": true,
      "timeSpentMs": 15000, // 15 giây
      "timeSpentSeconds": 15,
      "answeredAt": "2024-01-15T10:30:45.123Z",
      "confidence": 0.8 // độ tin cậy (0-1)
    }
  ],
  "summary": {
    "totalTimeMs": 120000, // 2 phút
    "totalTimeSeconds": 120,
    "correctAnswers": 4,
    "totalQuestions": 5,
    "score": 80,
    "averageTimePerQuestion": 24000 // 24 giây/câu
  }
}
```

### question_timings (trong bảng quiz_attempts) - Mới
```json
{
  "questionTimings": [
    {
      "questionId": "uuid",
      "questionNumber": 1,
      "startTime": "2024-01-15T10:30:30.123Z",
      "endTime": "2024-01-15T10:30:45.123Z",
      "timeSpentMs": 15000,
      "timeSpentSeconds": 15,
      "pauses": [
        {
          "pauseStart": "2024-01-15T10:30:35.000Z",
          "pauseEnd": "2024-01-15T10:30:37.000Z",
          "pauseDurationMs": 2000
        }
      ]
    }
  ]
}
```

### event_data (trong bảng quiz_attempt_events) - Mới
```json
{
  "eventType": "answer",
  "questionId": "uuid",
  "questionNumber": 1,
  "userAnswer": "Programming language",
  "isCorrect": true,
  "timeSpentMs": 15000,
  "confidence": 0.8,
  "browserInfo": {
    "userAgent": "Mozilla/5.0...",
    "language": "vi-VN",
    "platform": "MacOS"
  }
}
```

## Indexes Cải Tiến

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
CREATE INDEX idx_quiz_attempts_started_at ON quiz_attempts(started_at);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);

-- New indexes for enhanced tracking
CREATE INDEX idx_quiz_attempt_sessions_attempt_id ON quiz_attempt_sessions(attempt_id);
CREATE INDEX idx_quiz_attempt_sessions_session_start ON quiz_attempt_sessions(session_start);
CREATE INDEX idx_quiz_attempt_events_attempt_id ON quiz_attempt_events(attempt_id);
CREATE INDEX idx_quiz_attempt_events_event_type ON quiz_attempt_events(event_type);
CREATE INDEX idx_quiz_attempt_events_event_timestamp ON quiz_attempt_events(event_timestamp);
CREATE INDEX idx_quiz_attempt_events_question_id ON quiz_attempt_events(question_id);

-- Composite indexes for better performance
CREATE INDEX idx_quiz_attempts_user_quiz_status ON quiz_attempts(user_id, quiz_id, status);
CREATE INDEX idx_quiz_attempts_user_started_at ON quiz_attempts(user_id, started_at DESC);
CREATE INDEX idx_quiz_attempt_events_attempt_type ON quiz_attempt_events(attempt_id, event_type);
```

## Migration Scripts

### 1. Migration từ V1 sang V2
```sql
-- Thêm cột mới vào quiz_attempts
ALTER TABLE quiz_attempts 
ADD COLUMN time_taken_milliseconds BIGINT,
ADD COLUMN time_limit_seconds INTEGER,
ADD COLUMN incorrect_answers INTEGER DEFAULT 0,
ADD COLUMN question_timings JSONB,
ADD COLUMN ip_address INET,
ADD COLUMN user_agent TEXT,
ADD COLUMN device_info JSONB;

-- Cập nhật time_taken_seconds từ time_taken
UPDATE quiz_attempts 
SET time_taken_seconds = time_taken 
WHERE time_taken_seconds IS NULL;

-- Tạo bảng mới
CREATE TABLE quiz_attempt_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  session_start TIMESTAMP NOT NULL,
  session_end TIMESTAMP,
  session_duration_ms BIGINT,
  pause_count INTEGER DEFAULT 0,
  total_pause_duration_ms BIGINT DEFAULT 0,
  last_activity TIMESTAMP,
  browser_info JSONB,
  screen_resolution TEXT,
  timezone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_attempt_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_timestamp TIMESTAMP NOT NULL,
  event_data JSONB,
  question_id UUID,
  question_number INTEGER,
  time_spent_ms BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo indexes
CREATE INDEX idx_quiz_attempt_sessions_attempt_id ON quiz_attempt_sessions(attempt_id);
CREATE INDEX idx_quiz_attempt_sessions_session_start ON quiz_attempt_sessions(session_start);
CREATE INDEX idx_quiz_attempt_events_attempt_id ON quiz_attempt_events(attempt_id);
CREATE INDEX idx_quiz_attempt_events_event_type ON quiz_attempt_events(event_type);
CREATE INDEX idx_quiz_attempt_events_event_timestamp ON quiz_attempt_events(event_timestamp);
CREATE INDEX idx_quiz_attempt_events_question_id ON quiz_attempt_events(question_id);
```

## API Endpoints Cải Tiến

### Quiz Attempt Management
- `POST /api/v1/quiz-attempts/start/:quizId` - Bắt đầu quiz attempt
- `POST /api/v1/quiz-attempts/submit/:attemptId` - Submit quiz answers
- `GET /api/v1/quiz-attempts/:attemptId` - Lấy thông tin attempt
- `GET /api/v1/quiz-attempts/user/attempts` - Lấy tất cả attempts của user
- `GET /api/v1/quiz-attempts/quiz/:quizId` - Lấy attempts của quiz
- `GET /api/v1/quiz-attempts/:attemptId/events` - Lấy events của attempt
- `GET /api/v1/quiz-attempts/:attemptId/sessions` - Lấy sessions của attempt

### Analytics & Statistics
- `GET /api/v1/quiz-attempts/stats/user` - Thống kê của user
- `GET /api/v1/quiz-attempts/stats/quiz/:quizId` - Thống kê của quiz
- `GET /api/v1/quiz-attempts/analytics/time-tracking` - Phân tích thời gian
- `GET /api/v1/quiz-attempts/analytics/question-performance` - Phân tích hiệu suất câu hỏi

## Lợi ích của Schema V2

### 1. **Độ chính xác thời gian cao hơn**
- Lưu trữ thời gian bằng milliseconds
- Theo dõi thời gian làm từng câu hỏi
- Ghi lại các sự kiện tạm dừng/tiếp tục

### 2. **Phân tích chi tiết hơn**
- Theo dõi hành vi người dùng
- Phân tích hiệu suất từng câu hỏi
- Thống kê thời gian làm bài

### 3. **Bảo mật tốt hơn**
- Lưu trữ IP address và user agent
- Theo dõi thiết bị và browser
- Phát hiện hành vi bất thường

### 4. **Khả năng mở rộng**
- Dễ dàng thêm các loại sự kiện mới
- Hỗ trợ nhiều loại thiết bị
- Tích hợp với hệ thống analytics

## Workflow Cải Tiến

### 1. Bắt đầu Quiz
1. Tạo record trong `quiz_attempts`
2. Tạo record trong `quiz_attempt_sessions`
3. Ghi event "start" vào `quiz_attempt_events`
4. Lưu thông tin thiết bị và IP

### 2. Làm Quiz
1. Ghi event "answer" mỗi khi trả lời
2. Cập nhật `question_timings` real-time
3. Theo dõi thời gian tạm dừng
4. Lưu thông tin confidence và metadata

### 3. Hoàn thành Quiz
1. Ghi event "submit"
2. Cập nhật `quiz_attempts` với kết quả cuối
3. Cập nhật `quiz_attempt_sessions` với thời gian kết thúc
4. Tính toán thống kê và analytics

## Security & Privacy

### 1. **Data Encryption**
- Mã hóa dữ liệu nhạy cảm
- Sử dụng JWT với expiration
- Hash passwords với bcrypt

### 2. **Access Control**
- User chỉ truy cập được attempts của mình
- Admin có thể xem tất cả
- Rate limiting cho API calls

### 3. **Data Retention**
- Tự động xóa dữ liệu cũ (6 tháng)
- Backup dữ liệu quan trọng
- Tuân thủ GDPR/CCPA
