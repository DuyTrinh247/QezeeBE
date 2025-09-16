# QuizPage PDF Preview Guide

## Tổng quan
Hướng dẫn sử dụng chức năng Preview PDF trong trang QuizPage.

## Tính năng mới

### 1. Nút Preview PDF
- **Vị trí**: Header của QuizPage, bên cạnh nút Submit
- **Style**: Màu xanh với border, nổi bật
- **Chức năng**: Mở modal hiển thị PDF file

### 2. PDF Preview Modal
- **Full-screen modal** hiển thị PDF
- **Header**: Hiển thị tên file PDF
- **Body**: Iframe hiển thị PDF
- **Footer**: Nút Close

## Cách hoạt động

### 1. Lấy PDF file info
```javascript
// Priority 1: localStorage 'current_pdf_file'
const pdfFileData = localStorage.getItem('current_pdf_file')
if (pdfFileData) {
  const pdfFile = JSON.parse(pdfFileData)
  pdfFileUrl.value = `http://localhost:3001/uploads/${pdfFile.file_path.split('/').pop()}`
  pdfFileName.value = pdfFile.original_name
}

// Priority 2: Quiz data (fallback)
if (quiz.value?.pdf_file_name) {
  pdfFileUrl.value = `http://localhost:3001/uploads/${quiz.value.pdf_file_name}`
  pdfFileName.value = quiz.value.pdf_file_name
}
```

### 2. Hiển thị PDF
- URL: `http://localhost:3001/uploads/[filename]`
- Format: Iframe với full-screen modal
- Error handling: Alert nếu không load được

## Cách test

### Method 1: Sử dụng trang test
1. Truy cập: **http://localhost:3000/test-quiz-pdf-preview**
2. Click **"Set Sample PDF Data"**
3. Click **"Set Sample Quiz Data"**
4. Click **"Go to QuizPage"**
5. Click **"Preview PDF"** trong header
6. PDF sẽ hiển thị trong full-screen modal

### Method 2: Browser Console
1. Truy cập: **http://localhost:3000/QuizPage**
2. Mở DevTools → Console
3. Chạy lệnh:
```javascript
// Set PDF data
localStorage.setItem("current_pdf_file", JSON.stringify({
  "id": "test-pdf-123",
  "original_name": "ETEST _ IELTS READING TEST 2.pdf",
  "file_path": "uploads/file-1757667368384-367672332.pdf",
  "file_size": 758178,
  "mime_type": "application/pdf",
  "uploaded_at": "2025-09-12T08:58:23.263Z",
  "user_id": "test-user-123"
}))

// Set quiz data
localStorage.setItem("current_quiz", JSON.stringify({
  "id": "quiz_001",
  "title": "Sample Quiz",
  "pdf_file_name": "file-1757667368384-367672332.pdf",
  "pdfFileId": "test-pdf-123"
}))
```
4. Refresh trang
5. Click **"Preview PDF"**

### Method 3: Upload file thật
1. Upload PDF file từ trang chủ
2. Chuyển đến ProcessingPage
3. Click **"Bắt đầu Quiz"**
4. Trong QuizPage, click **"Preview PDF"**

## Expected Results

### Khi có PDF data:
- Modal hiển thị full-screen
- PDF load trong iframe
- Header hiển thị tên file
- Có thể đóng modal bằng nút X hoặc Close

### Khi không có PDF data:
- Alert: "No PDF file found. Please check if the file exists."
- Modal không mở

### Error handling:
- Alert: "Error loading PDF. Please check if the file exists on the server."
- Hiển thị khi iframe không load được

## Files đã cập nhật

### QuizPage.vue
- ✅ Thêm nút "Preview PDF" trong header
- ✅ Thêm PDF preview modal
- ✅ Thêm methods: `previewPDF()`, `closePdfModal()`, `handleIframeError()`
- ✅ Thêm reactive variables: `showPdfModal`, `pdfFileUrl`, `pdfFileName`
- ✅ Thêm CSS cho PDF modal

### test-quiz-pdf-preview.vue
- ✅ Trang test đầy đủ chức năng
- ✅ Set sample data cho cả PDF và Quiz
- ✅ Direct PDF preview để test
- ✅ Clear data functionality

## Troubleshooting

### PDF không hiển thị:
1. Kiểm tra file có tồn tại trong `uploads/` không
2. Kiểm tra URL có đúng không: `http://localhost:3001/uploads/[filename]`
3. Kiểm tra CORS settings trong backend

### Modal không mở:
1. Kiểm tra `localStorage` có data không
2. Kiểm tra console logs
3. Kiểm tra `pdfFile.file_path` có tồn tại không

### Lỗi iframe:
1. Kiểm tra network tab trong DevTools
2. Kiểm tra response status của PDF URL
3. Kiểm tra file permissions

## Services cần thiết
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **PDF Files**: http://localhost:3001/uploads/

## Ready to use! 🚀
Chức năng Preview PDF trong QuizPage đã sẵn sàng sử dụng!
