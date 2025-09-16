const BASE_URL = "http://localhost:3002";

async function createTestQuiz() {
  try {
    console.log("🧪 Creating test quiz...");

    // First create a user
    console.log("👤 Creating test user...");
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "testpass123",
    };

    const userResponse = await fetch(`${BASE_URL}/api/v1/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const userResult = await userResponse.json();
    console.log("✅ User created:", userResult);

    // Login to get token
    console.log("🔑 Logging in...");
    const loginResponse = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "testpass123",
      }),
    });

    const loginResult = await loginResponse.json();
    console.log("✅ Login successful:", loginResult);
    const token = loginResult.token;

    // Create quiz with real token
    console.log("📝 Creating quiz with real token...");
    const quizData = {
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
    };

    const quizResponse = await fetch(`${BASE_URL}/api/v1/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(quizData),
    });

    const quizResult = await quizResponse.json();
    console.log("✅ Quiz created successfully:", quizResult);

    // Save token for frontend testing
    console.log("💾 Saving token for frontend testing...");
    console.log("Token:", token);
    console.log("Quiz ID:", quizResult.quiz?.id);

    // Test getting the quiz
    if (quizResult.quiz?.id) {
      console.log("🔍 Testing quiz retrieval...");
      const getResponse = await fetch(
        `${BASE_URL}/api/v1/quizzes/${quizResult.quiz.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const getResult = await getResponse.json();
      console.log("✅ Quiz retrieved successfully:", getResult);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createTestQuiz();
