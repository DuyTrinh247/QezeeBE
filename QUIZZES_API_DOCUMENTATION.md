# Quizzes API Documentation

## 🎯 Tổng quan

API Quizzes cung cấp các endpoint để quản lý quizzes với đầy đủ chức năng CRUD và tìm kiếm.

## 📋 Cấu trúc Bảng Quizzes

```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ngay_tao TEXT NOT NULL,
  json JSONB NOT NULL,
  thoi_gian TEXT NOT NULL,
  hashcode TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Các trường:

- **id**: UUID tự động tạo (Primary Key)
- **ngay_tao**: Ngày tạo quiz (TEXT)
- **json**: Dữ liệu quiz dạng JSON (JSONB)
- **thoi_gian**: Thời gian quiz (TEXT)
- **hashcode**: Mã hash duy nhất (TEXT)
- **created_at**: Thời gian tạo record (TIMESTAMP)
- **updated_at**: Thời gian cập nhật cuối (TIMESTAMP)

## 🔐 Authentication

Tất cả endpoints đều yêu cầu authentication token trong header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 API Endpoints

### 1. Lấy danh sách tất cả quizzes

```http
GET /api/v1/quizzes
```

**Response:**

```json
{
  "quizzes": [
    {
      "id": "uuid",
      "ngay_tao": "2024-01-15",
      "json": { "questions": [...] },
      "thoi_gian": "30 phút",
      "hashcode": "abc123",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Lấy quiz theo ID

```http
GET /api/v1/quizzes/:id
```

**Parameters:**

- `id`: UUID của quiz

**Response:**

```json
{
  "quiz": {
    "id": "uuid",
    "ngay_tao": "2024-01-15",
    "json": { "questions": [...] },
    "thoi_gian": "30 phút",
    "hashcode": "abc123",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### 3. Lấy quiz theo hashcode

```http
GET /api/v1/quizzes/hash/:hashcode
```

**Parameters:**

- `hashcode`: Mã hash của quiz

**Response:**

```json
{
  "quiz": {
    "id": "uuid",
    "ngay_tao": "2024-01-15",
    "json": { "questions": [...] },
    "thoi_gian": "30 phút",
    "hashcode": "abc123",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### 4. Tạo quiz mới

```http
POST /api/v1/quizzes
```

**Request Body:**

```json
{
  "ngay_tao": "2024-01-15",
  "json": {
    "title": "Quiz về JavaScript",
    "questions": [
      {
        "question": "JavaScript là gì?",
        "options": ["Ngôn ngữ lập trình", "Framework", "Database"],
        "correct": 0
      }
    ]
  },
  "thoi_gian": "30 phút",
  "hashcode": "unique-hash-123"
}
```

**Response:**

```json
{
  "quiz": {
    "id": "uuid",
    "ngay_tao": "2024-01-15",
    "json": { "title": "Quiz về JavaScript", ... },
    "thoi_gian": "30 phút",
    "hashcode": "unique-hash-123",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### 5. Cập nhật quiz

```http
PUT /api/v1/quizzes/:id
```

**Parameters:**

- `id`: UUID của quiz

**Request Body:** (Tất cả trường đều optional)

```json
{
  "ngay_tao": "2024-01-16",
  "json": { "updated": "content" },
  "thoi_gian": "45 phút",
  "hashcode": "new-hash-456"
}
```

**Response:**

```json
{
  "quiz": {
    "id": "uuid",
    "ngay_tao": "2024-01-16",
    "json": { "updated": "content" },
    "thoi_gian": "45 phút",
    "hashcode": "new-hash-456",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-16T11:00:00Z"
  }
}
```

### 6. Xóa quiz

```http
DELETE /api/v1/quizzes/:id
```

**Parameters:**

- `id`: UUID của quiz

**Response:**

```
Status: 204 No Content
```

### 7. Tìm kiếm quizzes theo nội dung

```http
GET /api/v1/quizzes/search?q=javascript
```

**Query Parameters:**

- `q`: Từ khóa tìm kiếm

**Response:**

```json
{
  "quizzes": [
    {
      "id": "uuid",
      "ngay_tao": "2024-01-15",
      "json": { "title": "Quiz về JavaScript", ... },
      "thoi_gian": "30 phút",
      "hashcode": "abc123",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 8. Lấy quizzes theo khoảng thời gian

```http
GET /api/v1/quizzes/date-range?startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**

- `startDate`: Ngày bắt đầu (YYYY-MM-DD)
- `endDate`: Ngày kết thúc (YYYY-MM-DD)

**Response:**

```json
{
  "quizzes": [
    {
      "id": "uuid",
      "ngay_tao": "2024-01-15",
      "json": { "questions": [...] },
      "thoi_gian": "30 phút",
      "hashcode": "abc123",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## 🚨 Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "ngay_tao",
      "message": "Ngày tạo là bắt buộc"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Access denied. No token provided."
}
```

### 404 Not Found

```json
{
  "error": "Không tìm thấy quiz"
}
```

### 500 Internal Server Error

```json
{
  "error": "Lỗi khi lấy danh sách quizzes"
}
```

## 🧪 Testing Examples

### Tạo quiz mới

```bash
curl -X POST http://localhost:3001/api/v1/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "ngay_tao": "2024-01-15",
    "json": {
      "title": "Quiz Test",
      "questions": [
        {
          "question": "Câu hỏi test?",
          "options": ["A", "B", "C"],
          "correct": 0
        }
      ]
    },
    "thoi_gian": "15 phút",
    "hashcode": "test-hash-123"
  }'
```

### Lấy danh sách quizzes

```bash
curl -X GET http://localhost:3001/api/v1/quizzes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Tìm kiếm quizzes

```bash
curl -X GET "http://localhost:3001/api/v1/quizzes/search?q=javascript" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Ghi chú

- Tất cả endpoints đều yêu cầu authentication
- Hashcode phải là duy nhất trong hệ thống
- JSON field có thể chứa bất kỳ cấu trúc dữ liệu nào
- Timestamps được tự động cập nhật khi có thay đổi
- API sử dụng UUID cho tất cả quiz IDs
- Validation được thực hiện bằng Zod schemas
