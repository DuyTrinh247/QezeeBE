// Test script to verify QuizPage can load quiz data
const fetch = require("node-fetch");

async function testQuizPage() {
  try {
    console.log("🧪 Testing QuizPage API integration...");

    const quizId = "ffb52226-d6a4-4605-80a5-1cca01e40f0d";
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZmRkZjVlYy05NjRkLTQyM2UtOGI5Ni1kNmQyMGI3MjUyMzkiLCJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3NTc5MjkyNzUsImV4cCI6MTc1ODAxNTY3NX0.7uL0Pd5BQPQ4KMBm5-QH0bdAYhaaZHMNgpuX2VyPLYk";

    // Test 1: Load quiz data
    console.log("📋 Step 1: Loading quiz data...");
    const quizResponse = await fetch(
      `http://localhost:3002/api/v1/quizzes/${quizId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!quizResponse.ok) {
      throw new Error(
        `Quiz API failed: ${quizResponse.status} ${quizResponse.statusText}`
      );
    }

    const quizData = await quizResponse.json();
    console.log("✅ Quiz data loaded successfully");
    console.log("   - Title:", quizData.quiz.title);
    console.log("   - Total Questions:", quizData.quiz.total_questions);
    console.log("   - Time Limit:", quizData.quiz.time_limit);
    console.log(
      "   - Questions in quiz_data:",
      quizData.quiz.quiz_data?.questions?.length || 0
    );

    // Test 2: Start quiz attempt
    console.log("🚀 Step 2: Starting quiz attempt...");
    const attemptResponse = await fetch(
      `http://localhost:3002/api/v1/quiz-attempts/start/${quizId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!attemptResponse.ok) {
      throw new Error(
        `Quiz attempt API failed: ${attemptResponse.status} ${attemptResponse.statusText}`
      );
    }

    const attemptData = await attemptResponse.json();
    console.log("✅ Quiz attempt started successfully");
    console.log("   - Attempt ID:", attemptData.attempt.id);
    console.log("   - Status:", attemptData.attempt.status);

    // Test 3: Submit quiz attempt
    console.log("📤 Step 3: Submitting quiz attempt...");
    const submitResponse = await fetch(
      `http://localhost:3002/api/v1/quiz-attempts/submit/${attemptData.attempt.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: {
            q_001: "b",
            q_002: "a",
            q_003: "b",
          },
          timeSpent: 120,
        }),
      }
    );

    if (!submitResponse.ok) {
      throw new Error(
        `Quiz submit API failed: ${submitResponse.status} ${submitResponse.statusText}`
      );
    }

    const submitData = await submitResponse.json();
    console.log("✅ Quiz attempt submitted successfully");
    console.log("   - Score:", submitData.attempt.score);
    console.log("   - Status:", submitData.attempt.status);

    console.log("🎉 All tests passed! QuizPage should work correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testQuizPage();
