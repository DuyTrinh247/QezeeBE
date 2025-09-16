# Hướng dẫn cấu hình Database Qezee

## 🎯 Tổng quan

Database "qezee" đã được cập nhật thành công với đầy đủ chức năng hỗ trợ Google Login API.

## 📋 Cấu trúc Database

### Bảng `users`

```sql
- id: uuid NOT NULL DEFAULT uuid_generate_v4()
- name: text NOT NULL
- password: text NULL
- email: text NULL
- google_id: text NULL
- created_at: timestamp DEFAULT CURRENT_TIMESTAMP
- updated_at: timestamp DEFAULT CURRENT_TIMESTAMP
```

### Bảng `quizzes`

```sql
- id: uuid NOT NULL DEFAULT uuid_generate_v4()
- ngay_tao: text NOT NULL
- json: jsonb NOT NULL
- thoi_gian: text NOT NULL
- hashcode: text NOT NULL
- created_at: timestamp DEFAULT CURRENT_TIMESTAMP
- updated_at: timestamp DEFAULT CURRENT_TIMESTAMP
```

### Constraints

- **Primary Key**: `id` (UUID) cho cả users và quizzes
- **Unique**: `google_id` (cho Google users), `hashcode` (cho quizzes)
- **Trigger**: Tự động cập nhật `updated_at` khi có thay đổi cho cả hai bảng

## 🔧 Cấu hình

### 1. Tạo file `.env`

Tạo file `.env` trong thư mục root của project:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/qezee
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=qezee
PGSSL=false

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 2. Cấu hình PostgreSQL

Đảm bảo PostgreSQL đang chạy và có database "qezee":

```sql
-- Tạo database (nếu chưa có)
CREATE DATABASE qezee;

-- Kết nối vào database qezee
\c qezee;

-- Tạo extension uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 🚀 Chạy Migration

```bash
# Chạy migration để đảm bảo schema đúng
npm run db:migrate

# Hoặc chạy trực tiếp
node scripts/migrate.js
```

## 📊 API Endpoints

### Authentication

- `POST /api/v1/auth/login` - Đăng nhập thường
- `POST /api/v1/auth/register` - Đăng ký thường
- `POST /api/v1/auth/google-login` - Đăng nhập Google

### Users

- `GET /api/v1/users` - Lấy danh sách users (cần auth)
- `GET /api/v1/users/:id` - Lấy user theo ID (cần auth)
- `POST /api/v1/users` - Tạo user mới (cần auth)
- `PUT /api/v1/users/:id` - Cập nhật user (cần auth)
- `DELETE /api/v1/users/:id` - Xóa user (cần auth)

### Quizzes

- `GET /api/v1/quizzes` - Lấy danh sách quizzes (cần auth)
- `GET /api/v1/quizzes/:id` - Lấy quiz theo ID (cần auth)
- `GET /api/v1/quizzes/hash/:hashcode` - Lấy quiz theo hashcode (cần auth)
- `POST /api/v1/quizzes` - Tạo quiz mới (cần auth)
- `PUT /api/v1/quizzes/:id` - Cập nhật quiz (cần auth)
- `DELETE /api/v1/quizzes/:id` - Xóa quiz (cần auth)
- `GET /api/v1/quizzes/search?q=keyword` - Tìm kiếm quizzes (cần auth)
- `GET /api/v1/quizzes/date-range?startDate=...&endDate=...` - Lấy quizzes theo khoảng thời gian (cần auth)

## 🧪 Testing

### Test cơ bản

```bash
# Test Google Login (với token không hợp lệ)
curl -X POST http://localhost:3001/api/v1/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"token": "invalid-token"}'
```

### Test với Google token thật

```bash
curl -X POST http://localhost:3001/api/v1/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"token": "your-real-google-id-token"}'
```

## 📈 Trạng thái hiện tại

✅ **Đã hoàn thành:**

- Database "qezee" đã được cập nhật
- Schema với UUID và Google OAuth support
- Bảng quizzes với đầy đủ chức năng CRUD
- API endpoints hoạt động cho cả users và quizzes
- Validation schema hoạt động
- Server đang chạy tại http://localhost:3001
- Đã loại bỏ các endpoint health check không cần thiết

🔄 **Cần cấu hình:**

- File `.env` với database connection
- `GOOGLE_CLIENT_ID` cho Google OAuth
- `JWT_SECRET` cho authentication

## 🛠️ Troubleshooting

### Lỗi kết nối database

```
❌ Lỗi kết nối database: connection refused
```

**Giải pháp:**

1. Kiểm tra PostgreSQL có đang chạy không
2. Kiểm tra database "qezee" có tồn tại không
3. Kiểm tra username/password trong `.env`

### Lỗi Google OAuth

```
❌ Google login error: Wrong number of segments in token
```

**Giải pháp:**

1. Đảm bảo `GOOGLE_CLIENT_ID` đã được cấu hình
2. Sử dụng Google ID token hợp lệ từ frontend
3. Kiểm tra Google Cloud Console setup

### Lỗi 404 endpoint

```
❌ Route /api/v1/auth/google-login not found
```

**Giải pháp:**

1. Đảm bảo server đang chạy: `npm start`
2. Kiểm tra routes đã được mount đúng trong `src/index.ts`
3. Restart server sau khi thay đổi code

## 📝 Ghi chú

- Database "qezee" hỗ trợ cả user thường và Google user
- UUID được sử dụng cho tất cả user IDs
- Trigger tự động cập nhật `updated_at` timestamp
- API sử dụng JWT cho authentication
- Google OAuth sử dụng `google-auth-library`

## 🎉 Kết luận

Database "qezee" đã sẵn sàng cho production với đầy đủ chức năng:

- ✅ User management
- ✅ Quiz management với CRUD operations
- ✅ Google OAuth integration
- ✅ JWT authentication
- ✅ RESTful API
- ✅ Database schema với UUID
- ✅ Tìm kiếm và lọc quizzes
