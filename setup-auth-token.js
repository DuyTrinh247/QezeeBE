// Script to set up authentication token for frontend testing
const jwt = require("jsonwebtoken");

// Create a test JWT token
const testToken = jwt.sign(
  {
    userId: "test-user-123",
    email: "test@example.com",
    username: "testuser",
  },
  "your-secret-key",
  { expiresIn: "24h" }
);

console.log("🔑 Test Authentication Token Setup");
console.log("==================================");
console.log("");
console.log("📋 Instructions:");
console.log("1. Open your browser and go to http://localhost:3000/QeezeUI/");
console.log("2. Open Developer Tools (F12)");
console.log("3. Go to Console tab");
console.log("4. Copy and paste the following command:");
console.log("");
console.log(`localStorage.setItem('auth_token', '${testToken}');`);
console.log("");
console.log("5. Refresh the page");
console.log('6. Now you can use "Convert to Quiz" feature without 401 error');
console.log("");
console.log("🔗 Direct links:");
console.log("- Frontend: http://localhost:3000/QeezeUI/");
console.log("- Backend: http://localhost:3002");
console.log("");
console.log("✅ Authentication token is ready!");
console.log("");
console.log("📝 Token details:");
console.log("- User ID: test-user-123");
console.log("- Email: test@example.com");
console.log("- Username: testuser");
console.log("- Expires: 24 hours");
