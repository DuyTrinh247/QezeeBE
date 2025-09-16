# 🚀 Cấu hình hệ thống Qeezit Backend

## 📋 **Trạng thái hiện tại**

### ✅ **Backend (Qeeze-BE)**

- **URL**: http://localhost:3001
- **Framework**: Express + TypeScript
- **Port**: 3001
- **Database**: PostgreSQL (qezee)
- **Trạng thái**: ✅ Đang chạy bình thường

### ✅ **Database (PostgreSQL)**

- **Host**: localhost
- **Port**: 5432
- **Database**: qezee
- **User**: postgres
- **Password**: 1234
- **Trạng thái**: ✅ Đang chạy bình thường

## 🔧 **Cấu hình chi tiết**

### **Environment Variables (.env)**

```bash
# Database Configuration
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=1234
PGDATABASE=qezee
PGSSL=false

# Server Configuration
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### **CORS Configuration**

```typescript
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

### **API Routes**

- `GET /` - Health check
- `GET /api/v1/users` - Danh sách người dùng
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký
- `GET /api/v1/quizzes` - Danh sách quiz
- `POST /api/v1/upload` - Upload file
- `GET /api/v1/pdf-files` - Quản lý file PDF

## 🚀 **Hướng dẫn khởi động**

### **Development Mode**

```bash
# Cài đặt dependencies
npm install

# Build TypeScript
npm run build

# Chạy development server
npm run dev
```

### **Production Mode**

```bash
# Build
npm run build

# Start
npm start
```

### **Manual Start**

```bash
# Build và chạy trực tiếp
npm run build
node dist/index.js
```

## 🔍 **Kiểm tra trạng thái**

### **Health Check**

```bash
curl http://localhost:3001/
# Response: "Qeeze-BE chạy server thành công với Express"
```

### **API Test**

```bash
# Test users endpoint
curl http://localhost:3001/api/v1/users
# Response: {"error":"Access token required"}
```

### **Database Connection**

```bash
# Kiểm tra PostgreSQL
ps aux | grep postgres

# Kiểm tra kết nối database
# (Cần cài đặt psql client)
```

## 🛠️ **Troubleshooting**

### **Lỗi port 3001 bị chiếm**

```bash
# Tìm process đang chạy trên port 3001
lsof -ti:3001

# Dừng process
kill <PID>

# Hoặc dừng tất cả Node processes
pkill -f "node.*dist"
```

### **Lỗi database connection**

```bash
# Kiểm tra PostgreSQL đang chạy
ps aux | grep postgres

# Kiểm tra file .env
cat .env

# Test kết nối database
PGPASSWORD=1234 psql -h localhost -p 5432 -U postgres -d qezee -c "SELECT 1;"
```

### **Lỗi build TypeScript**

```bash
# Xóa dist folder và build lại
rm -rf dist
npm run build
```

## 📊 **Logs và Monitoring**

### **Database Connection Logs**

```
🔍 Database connection info:
DATABASE_URL: NOT SET
PGHOST: localhost
PGPORT: 5432
PGUSER: postgres
PGDATABASE: qezee
PGPASSWORD: SET
```

### **Server Start Log**

```
Server đang chạy tại http://localhost:3001
```

## 🔐 **Security Notes**

1. **JWT Secret**: Thay đổi trong production
2. **Database Password**: Sử dụng password mạnh
3. **CORS**: Chỉ cho phép localhost:3000
4. **Environment Variables**: Không commit file .env

## 📝 **Cập nhật cuối**

- **Ngày**: $(date)
- **Trạng thái**: ✅ Hoạt động bình thường
- **Port**: 3001
- **Database**: PostgreSQL (qezee)
- **Frontend**: http://localhost:3000
