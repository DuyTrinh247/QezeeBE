# QuizPage Toggle PDF Guide

## Tổng quan
Hướng dẫn sử dụng chức năng toggle PDF trong trang QuizPage.

## Tính năng mới

### 1. Toggle PDF Button
- **Vị trí**: Bên trái của quiz questions, ở giữa màn hình
- **Icon**: PDF document icon
- **Chức năng**: Toggle hiển thị/ẩn PDF trong left column

### 2. PDF Content Column
- **Left Column**: Hiển thị PDF trong iframe
- **Responsive**: Tự động ẩn/hiện theo toggle
- **Layout**: PDF column (2/3) + Quiz column (1/3) khi hiển thị

## Cách hoạt động

### 1. Load PDF data
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

### 2. Toggle functionality
- **Show PDF**: Left column hiển thị PDF iframe
- **Hide PDF**: Left column ẩn, quiz questions full-width
- **Smooth transition**: CSS transition cho UX tốt

## Cách test

### Method 1: Sử dụng trang test
1. Truy cập: **http://localhost:3000/test-quiz-pdf-preview**
2. Click **"Set Sample PDF Data"**
3. Click **"Set Sample Quiz Data"**
4. Click **"Go to QuizPage"**
5. Click **toggle button** (PDF icon) bên trái quiz questions
6. PDF sẽ hiển thị trong left column
7. Click toggle lại để ẩn PDF

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
5. Click **toggle button** để hiển thị PDF

## Expected Results

### Khi có PDF data:
- Toggle button hiển thị PDF icon
- Click toggle → Left column hiển thị PDF iframe
- Click toggle lại → Left column ẩn, quiz full-width
- Smooth transition animation

### Khi không có PDF data:
- Toggle button vẫn hiển thị
- Click toggle → Left column hiển thị "No PDF file available"
- Error handling cho iframe

### Layout changes:
- **PDF visible**: PDF column (2/3) + Quiz column (1/3)
- **PDF hidden**: Quiz column full-width (100%)

## Files đã cập nhật

### QuizPage.vue
- ✅ Xóa nút "Preview PDF" trong header
- ✅ Thay đổi toggle button từ text content sang PDF content
- ✅ Cập nhật left column hiển thị PDF iframe
- ✅ Thêm methods: `loadPdfData()`, `togglePdfContent()`
- ✅ Cập nhật responsive layout
- ✅ Xóa PDF modal và CSS không cần thiết

### test-quiz-pdf-preview.vue
- ✅ Cập nhật hướng dẫn test
- ✅ Mô tả toggle functionality

## UI/UX Improvements

### 1. Better Integration
- PDF hiển thị ngay trong quiz interface
- Không cần modal popup
- Toggle dễ dàng giữa PDF và quiz

### 2. Responsive Design
- Layout tự động điều chỉnh
- PDF column 2/3, Quiz column 1/3
- Smooth transitions

### 3. User Experience
- Một click để toggle
- PDF luôn sẵn sàng khi cần
- Không làm gián đoạn quiz flow

## Troubleshooting

### PDF không hiển thị:
1. Kiểm tra file có tồn tại trong `uploads/` không
2. Kiểm tra URL có đúng không: `http://localhost:3001/uploads/[filename]`
3. Kiểm tra `localStorage` có data không

### Toggle không hoạt động:
1. Kiểm tra `isPdfContentVisible` state
2. Kiểm tra console logs
3. Kiểm tra CSS transitions

### Layout issues:
1. Kiểm tra responsive classes
2. Kiểm tra CSS transitions
3. Kiểm tra z-index của toggle button

## Services cần thiết
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **PDF Files**: http://localhost:3001/uploads/

## Ready to use! 🚀
Chức năng toggle PDF trong QuizPage đã sẵn sàng sử dụng!
