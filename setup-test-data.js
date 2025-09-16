// Script to set up test data for frontend testing
const testData = {
  authToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzU3ODQyODE4LCJleHAiOjE3NTc5MjkyMTh9.kipQa7lGtBq2asT-kGbOWH_G5TsTpn77Rti8eHK1qrw",
  quizId: "test-quiz-123",
  quizData: {
    id: "test-quiz-123",
    title: "Test Quiz from PDF",
    description: "Quiz created from uploaded PDF file",
    total_questions: 3,
    time_limit_minutes: 10,
    difficulty_level: "medium",
    status: "active",
    quiz_data: {
      questions: [
        {
          id: "q1",
          questionText: "What is the main topic of the PDF?",
          questionType: "multiple_choice",
          points: 10,
          difficulty: "easy",
          options: [
            { id: "a1", text: "Technology", value: "A" },
            { id: "a2", text: "Science", value: "B" },
            { id: "a3", text: "History", value: "C" },
            { id: "a4", text: "Literature", value: "D" },
          ],
          correctAnswer: "A",
        },
        {
          id: "q2",
          questionText: "How many pages does the PDF have?",
          questionType: "multiple_choice",
          points: 10,
          difficulty: "medium",
          options: [
            { id: "b1", text: "5-10 pages", value: "A" },
            { id: "b2", text: "10-15 pages", value: "B" },
            { id: "b3", text: "15-20 pages", value: "C" },
            { id: "b4", text: "20+ pages", value: "D" },
          ],
          correctAnswer: "B",
        },
        {
          id: "q3",
          questionText: "What is the author's main argument?",
          questionType: "multiple_choice",
          points: 10,
          difficulty: "hard",
          options: [
            { id: "c1", text: "Technology is beneficial", value: "A" },
            { id: "c2", text: "Technology has drawbacks", value: "B" },
            { id: "c3", text: "Technology is neutral", value: "C" },
            { id: "c4", text: "Technology is complex", value: "D" },
          ],
          correctAnswer: "D",
        },
      ],
    },
    pdf_file_id: "test-pdf-123",
    pdf_file_name: "test-document.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

console.log("🧪 Test Data Setup for Frontend");
console.log("================================");
console.log("");
console.log("📋 Instructions:");
console.log("1. Open your browser and go to http://localhost:3000/QeezeUI/");
console.log("2. Open Developer Tools (F12)");
console.log("3. Go to Console tab");
console.log("4. Copy and paste the following commands:");
console.log("");
console.log("// Set authentication token");
console.log(`localStorage.setItem('auth_token', '${testData.authToken}');`);
console.log("");
console.log("// Set quiz ID for loading");
console.log(`localStorage.setItem('selected_quiz_id', '${testData.quizId}');`);
console.log("");
console.log("// Set quiz data (fallback)");
console.log(
  `localStorage.setItem('current_quiz', '${JSON.stringify(
    testData.quizData
  )}');`
);
console.log("");
console.log("// Set PDF file data");
console.log(
  `localStorage.setItem('current_pdf_file', '${JSON.stringify({
    file_path: "/uploads/test-document.pdf",
    original_name: "test-document.pdf",
  })}');`
);
console.log("");
console.log("5. Navigate to QuizPage (or refresh if already there)");
console.log("6. The quiz should load with test data from the mock API");
console.log("");
console.log("🔗 Direct links:");
console.log("- Frontend: http://localhost:3000/QeezeUI/");
console.log("- Backend: http://localhost:3002");
console.log("- Test API: http://localhost:3002/api/test/quiz/test-quiz-123");
console.log("");
console.log("✅ Test data is ready!");
