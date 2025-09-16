const jwt = require("jsonwebtoken");
require("dotenv").config();

// User ID thật từ database
const userId = "bfddf5ec-964d-423e-8b96-d6d20b725239";
const email = "test@example.com";
const username = "testuser";

// Tạo token với user ID đúng
const token = jwt.sign(
  {
    userId: userId,
    email: email,
    username: username,
  },
  process.env.JWT_SECRET || "your-secret-key",
  { expiresIn: "24h" }
);

console.log("🔑 Correct Authentication Token");
console.log("================================\n");

console.log("📋 Instructions:");
console.log("1. Open your browser and go to http://localhost:3000");
console.log("2. Open Developer Tools (F12)");
console.log("3. Go to Console tab");
console.log("4. Copy and paste the following command:\n");

console.log(`localStorage.setItem('auth_token', '${token}');`);
console.log("");

console.log("5. Refresh the page");
console.log("6. Now you can access YourQuizzes page with authentication\n");

console.log("🔗 Direct links:");
console.log("- Frontend: http://localhost:3000");
console.log("- YourQuizzes: http://localhost:3000/YourQuizzes");
console.log("- Backend: http://localhost:3002\n");

console.log("✅ Authentication token is ready!");
console.log("");
console.log("📝 Token details:");
console.log(`- User ID: ${userId}`);
console.log(`- Email: ${email}`);
console.log(`- Username: ${username}`);
console.log("- Expires: 24 hours");
