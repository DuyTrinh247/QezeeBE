const BASE_URL = "http://localhost:3002";

async function testFrontendQuiz() {
  try {
    console.log("🧪 Testing frontend quiz loading...");

    // Create a simple test quiz data that matches what frontend expects
    const testQuizData = {
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
    };

    // Save test data to localStorage for frontend testing
    console.log("💾 Saving test quiz data to localStorage...");
    console.log("Quiz ID:", testQuizData.id);
    console.log("Quiz Title:", testQuizData.title);
    console.log("Questions:", testQuizData.quiz_data.questions.length);

    // Create a simple JWT token for testing
    const jwt = require("jsonwebtoken");
    const testToken = jwt.sign(
      { userId: "test-user-123", email: "test@example.com" },
      "test-secret-key",
      { expiresIn: "24h" }
    );

    console.log("🔑 Test token created:", testToken);
    console.log("");
    console.log("📋 Instructions for frontend testing:");
    console.log("1. Open browser console");
    console.log("2. Run these commands:");
    console.log(`   localStorage.setItem('auth_token', '${testToken}');`);
    console.log(
      `   localStorage.setItem('selected_quiz_id', '${testQuizData.id}');`
    );
    console.log(
      `   localStorage.setItem('current_quiz', '${JSON.stringify(
        testQuizData
      )}');`
    );
    console.log("3. Navigate to QuizPage");
    console.log("4. The quiz should load with test data");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testFrontendQuiz();
