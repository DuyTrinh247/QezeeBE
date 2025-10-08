# Hướng Dẫn Sử Dụng PDF URL

## Tổng Quan

Hệ thống hiện hỗ trợ **2 cách** lưu trữ PDF:

1. **Upload File Vật Lý**: Upload file PDF lên server, file được lưu trong thư mục `uploads/`
2. **Lưu Link PDF**: Chỉ lưu URL của PDF (hosted ở nơi khác), không upload file

## 1. Upload File PDF (Cách cũ)

### Backend API

```typescript
POST /api/v1/pdf-files/upload
Headers: 
  - Authorization: Bearer <token>
  - Content-Type: multipart/form-data
Body:
  - file: <PDF file>
```

### Frontend Usage

```typescript
const formData = new FormData()
formData.append('file', pdfFile)

const response = await $fetch('/api/v1/pdf-files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})

// Response:
{
  success: true,
  pdfFile: {
    id: 'uuid',
    original_name: 'document.pdf',
    file_path: 'uploads/file-123456.pdf',
    file_url: null,
    file_size: 1234567
  }
}
```

## 2. Lưu Link PDF (Cách mới)

### Backend API

```typescript
POST /api/v1/pdf-files/create-from-url
Headers: 
  - Authorization: Bearer <token>
  - Content-Type: application/json
Body: {
  pdfUrl: string,         // Required: External URL of PDF
  originalName: string,   // Optional: Display name
  fileSize: number,       // Optional: File size in bytes
  content: string,        // Optional: Extracted text content
  contentLength: number   // Optional: Length of content
}
```

### Frontend Usage

```typescript
const response = await $fetch('/api/v1/pdf-files/create-from-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: {
    pdfUrl: 'https://example.com/documents/my-document.pdf',
    originalName: 'My Document',
    fileSize: 1234567,
    content: 'Extracted text content...',
    contentLength: 5000
  }
})

// Response:
{
  success: true,
  pdfFile: {
    id: 'uuid',
    original_name: 'My Document',
    file_path: 'external-url',  // Placeholder
    file_url: 'https://example.com/documents/my-document.pdf',
    file_size: 1234567
  }
}
```

## 3. Hiển Thị PDF Trong Frontend

Frontend `QuizPage.vue` đã được cập nhật để **ưu tiên `file_url`** khi có:

```typescript
const loadPdfData = () => {
  // Check for file_url first (external URL)
  if (pdfFile.file_url) {
    pdfFileUrl.value = pdfFile.file_url  // Use directly
  } 
  // Fallback to file_path (local file)
  else if (pdfFile.file_path) {
    pdfFileUrl.value = getPdfUrl(pdfFile.file_path)  // Construct server URL
  }
}
```

## 4. Ví Dụ: AI Quiz Generation Với PDF URL

```typescript
// Frontend: Extract PDF text và gửi lên backend
const pdfText = await extractTextFromPDF(pdfFile)

// Generate quiz with AI
const response = await $fetch('/api/v1/ai-quiz/generate-from-text', {
  method: 'POST',
  body: {
    pdfText: pdfText,
    fileName: pdfFile.name,
    fileSize: pdfFile.size,
    pdfFileId: generateUUID(),
    // Optional: Include PDF URL if hosted somewhere
    pdfUrl: 'https://your-cdn.com/pdfs/document.pdf'
  }
})
```

## 5. Database Schema

```sql
CREATE TABLE pdf_files (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  original_name TEXT,
  file_path TEXT,      -- Path for uploaded files OR 'external-url' for URLs
  file_url TEXT,       -- External URL (nullable)
  file_size INTEGER,
  file_type TEXT,
  content TEXT,        -- Extracted text content
  content_length INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 6. Lợi Ích Của PDF URL

✅ **Không tốn dung lượng server**: PDF được lưu ở nơi khác (CDN, cloud storage)
✅ **Tốc độ nhanh hơn**: Không cần upload file lên server
✅ **Dễ chia sẻ**: Có thể dùng chung 1 PDF cho nhiều quiz
✅ **Tiết kiệm bandwidth**: PDF được load trực tiếp từ source

## 7. Khi Nào Dùng Cách Nào?

| Tình Huống | Cách Nên Dùng |
|------------|---------------|
| User upload PDF từ máy | Upload File Vật Lý |
| PDF đã có sẵn URL (Google Drive, Dropbox, CDN) | Lưu Link PDF |
| Cần xử lý/chỉnh sửa PDF | Upload File Vật Lý |
| Chỉ cần hiển thị PDF | Lưu Link PDF |

## 8. Migration

Migration đã được chạy để thêm column `file_url`:

```sql
ALTER TABLE pdf_files 
ADD COLUMN IF NOT EXISTS file_url TEXT;
```

Tất cả PDF file hiện tại sẽ có `file_url = null`, hệ thống vẫn hoạt động bình thường với `file_path`.

