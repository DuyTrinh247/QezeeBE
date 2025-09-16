const BASE_URL = "http://localhost:3002";

async function testQuizCreation() {
  try {
    console.log("🧪 Testing quiz creation...");

    // Test quiz data
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

    // Create quiz (bypass auth for testing)
    console.log("📝 Creating quiz...");
    const createResponse = await fetch(`${BASE_URL}/api/v1/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token", // This will fail auth, but let's see the error
      },
      body: JSON.stringify(quizData),
    });

    const createData = await createResponse.json();
    console.log("✅ Quiz created successfully:", createData);

    // Get quiz by ID
    const quizId = createData.quiz.id;
    console.log("🔍 Getting quiz by ID:", quizId);

    const getResponse = await fetch(`${BASE_URL}/api/v1/quizzes/${quizId}`, {
      headers: {
        Authorization: "Bearer test-token",
      },
    });

    const getData = await getResponse.json();
    console.log("✅ Quiz retrieved successfully:", getData);
  } catch (error) {
    console.error("❌ Error:", error.message);

    if (error.message.includes("401")) {
      console.log(
        "🔐 Authentication required. Let's test with a mock token..."
      );

      // Test with a mock user creation first
      try {
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
        const userDataResult = await userResponse.json();
        console.log("✅ User created:", userDataResult);

        // Try to login
        console.log("🔑 Logging in...");
        const loginResponse = await fetch(`${BASE_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "testpass123",
          }),
        });

        const loginData = await loginResponse.json();
        console.log("✅ Login successful:", loginData);
        const token = loginData.token;

        // Now try to create quiz with real token
        console.log("📝 Creating quiz with real token...");
        const quizResponse = await fetch(`${BASE_URL}/api/v1/quizzes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(quizData),
        });

        const quizDataResult = await quizResponse.json();
        console.log("✅ Quiz created with real token:", quizDataResult);
      } catch (authError) {
        console.error("❌ Auth error:", authError.message);
      }
    }
  }
}

testQuizCreation();
