# Hướng dẫn thiết lập Google Login API

## 1. Cấu hình Google OAuth

### Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Kích hoạt Google+ API

### Bước 2: Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Chọn **Web application**
4. Thêm **Authorized JavaScript origins**:
   - `http://localhost:3000` (cho development)
   - Domain production của bạn
5. Thêm **Authorized redirect URIs**:
   - `http://localhost:3000/auth/google/callback` (cho development)
   - Domain production của bạn

### Bước 3: Lấy Client ID

- Copy **Client ID** từ credentials vừa tạo
- Thêm vào file `.env`:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 2. Cấu hình Database

### Chạy Migration

```bash
npm run db:migrate
```

Migration sẽ tạo/cập nhật bảng `users` với các trường:

- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL)
- `password` (TEXT, nullable - cho user thường)
- `email` (TEXT, nullable - cho Google user)
- `google_id` (TEXT, UNIQUE - cho Google user)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 3. API Endpoints

### POST /api/v1/auth/google-login

Đăng nhập bằng Google token

**Request Body:**

```json
{
  "token": "google-id-token-from-frontend"
}
```

**Response Success (200):**

```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-uuid",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

**Response Error (401):**

```json
{
  "error": "Invalid Google token"
}
```

## 4. Frontend Integration

### JavaScript Example

```javascript
// 1. Load Google API
function loadGoogleAPI() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

// 2. Initialize Google Sign-In
async function initGoogleSignIn() {
  await loadGoogleAPI();

  google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID",
    callback: handleCredentialResponse,
  });

  google.accounts.id.renderButton(
    document.getElementById("google-signin-button"),
    { theme: "outline", size: "large" }
  );
}

// 3. Handle Google response
async function handleCredentialResponse(response) {
  try {
    const res = await fetch("/api/v1/auth/google-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: response.credential,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Lưu JWT token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect hoặc update UI
      console.log("Login successful:", data.user);
    } else {
      console.error("Login failed:", data.error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// 4. Initialize khi page load
document.addEventListener("DOMContentLoaded", initGoogleSignIn);
```

### HTML Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Google Login</title>
  </head>
  <body>
    <div id="google-signin-button"></div>

    <script>
      // Code JavaScript ở trên
    </script>
  </body>
</html>
```

## 5. Environment Variables

Tạo file `.env` với các biến sau:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 6. Testing

### Test với curl

```bash
curl -X POST http://localhost:3001/api/v1/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"token": "your-google-id-token"}'
```

## 7. Lưu ý bảo mật

1. **Luôn validate Google token** trên server
2. **Không tin tưởng** token từ client
3. **Sử dụng HTTPS** trong production
4. **Giữ bí mật** GOOGLE_CLIENT_ID và JWT_SECRET
5. **Cập nhật** redirect URIs khi deploy

## 8. Troubleshooting

### Lỗi "Invalid Google token"

- Kiểm tra GOOGLE_CLIENT_ID có đúng không
- Đảm bảo token chưa hết hạn
- Kiểm tra domain có được authorize không

### Lỗi "Missing required Google user information"

- Google token không chứa đủ thông tin user
- Kiểm tra scope trong Google OAuth setup

### Lỗi Database

- Chạy migration: `npm run db:migrate`
- Kiểm tra kết nối database
- Kiểm tra quyền truy cập database
