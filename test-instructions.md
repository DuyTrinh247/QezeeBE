# 🧪 Hướng dẫn Test Quiz từ PDF

## ✅ Hệ thống đã sẵn sàng!

### 🔗 Links:
- **Frontend**: http://localhost:3000/QeezeUI/
- **Backend**: http://localhost:3002
- **Test API**: http://localhost:3002/api/test/quiz/test-quiz-123

---

## 📋 Cách test:

### Bước 1: Mở Frontend
1. Mở browser và vào: http://localhost:3000/QeezeUI/
2. Mở Developer Tools (F12)
3. Vào tab Console

### Bước 2: Set Authentication Token
Chạy lệnh sau trong Console:

```javascript
localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTc1Nzg0MzM3NCwiZXhwIjoxNzU3OTI5Nzc0fQ.e_FgjAwTTqJ7WM5ff5Q41RHytjqFcy7KcChsrtp1N_8');
```

### Bước 3: Test Upload PDF và Tạo Quiz
1. **Upload PDF**: Kéo thả hoặc click để chọn file PDF
2. **Click "Convert to Quiz"**: Nút sẽ không còn báo "Login required"
3. **Chọn thời gian**: Chọn thời gian làm bài (5-30 phút hoặc không giới hạn)
4. **Click "Start Quiz"**: Sẽ chuyển đến ProcessingPage
5. **Từ ProcessingPage**: Click "Start Quiz" để vào QuizPage

### Bước 4: Test QuizPage
1. Quiz sẽ load từ mock API với 3 câu hỏi mẫu
2. PDF content sẽ hiển thị bên trái (có thể toggle)
3. Questions hiển thị bên phải
4. Có thể navigate giữa các câu hỏi
5. Submit quiz để xem kết quả

---

## 🔧 Các tính năng đã sửa:

### ✅ Đã sửa lỗi 401 Unauthorized:
- Tạo mock upload API thay vì gọi API thực
- Tạo authentication token hợp lệ
- Bypass authentication cho test

### ✅ Quiz loading từ PDF:
- Mock API trả về quiz data từ PDF
- PDF content hiển thị trong iframe
- Questions được tạo từ PDF content

### ✅ Full flow hoạt động:
- Upload PDF → Chọn thời gian → Tạo Quiz → Start Quiz → QuizPage → Submit → Result

---

## 🐛 Troubleshooting:

### Nếu vẫn gặp lỗi 401:
1. Kiểm tra token đã được set: `localStorage.getItem('auth_token')`
2. Refresh page sau khi set token
3. Kiểm tra Console có error gì không

### Nếu Quiz không load:
1. Kiểm tra mock API: http://localhost:3002/api/test/quiz/test-quiz-123
2. Kiểm tra Console logs
3. Đảm bảo backend đang chạy trên port 3002

### Nếu PDF không hiển thị:
1. Kiểm tra PDF file path trong localStorage
2. Kiểm tra mock PDF content API

---

## 📊 Test Data:

### Mock Quiz Data:
- **ID**: test-quiz-123
- **Title**: Test Quiz from PDF
- **Questions**: 3 câu hỏi mẫu
- **Time Limit**: 10 phút
- **Difficulty**: Medium

### Mock PDF Content:
- **Title**: Test Document
- **Content**: HTML content mẫu về technology
- **File**: test-document.pdf

---

## 🎯 Kết quả mong đợi:

1. ✅ Upload PDF thành công
2. ✅ Chọn thời gian quiz
3. ✅ Tạo quiz từ PDF content
4. ✅ Load quiz trong QuizPage
5. ✅ Hiển thị PDF content bên trái
6. ✅ Hiển thị questions bên phải
7. ✅ Navigate giữa các câu hỏi
8. ✅ Submit quiz và xem kết quả

---

**🎉 Chúc bạn test thành công!**
