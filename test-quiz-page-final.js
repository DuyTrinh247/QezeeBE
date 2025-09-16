// Final test of QuizPage functionality
const http = require("http");

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function testQuizPage() {
  try {
    console.log("🧪 Testing QuizPage API integration...");

    const quizId = "ffb52226-d6a4-4605-80a5-1cca01e40f0d";
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZmRkZjVlYy05NjRkLTQyM2UtOGI5Ni1kNmQyMGI3MjUyMzkiLCJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3NTc5MjkyNzUsImV4cCI6MTc1ODAxNTY3NX0.7uL0Pd5BQPQ4KMBm5-QH0bdAYhaaZHMNgpuX2VyPLYk";

    // Test 1: Load quiz data
    console.log("📋 Step 1: Loading quiz data...");
    const quizResponse = await makeRequest(
      `http://localhost:3002/api/v1/quizzes/${quizId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (quizResponse.status !== 200) {
      throw new Error(`Quiz API failed: ${quizResponse.status}`);
    }

    console.log("✅ Quiz data loaded successfully");
    console.log("   - Title:", quizResponse.data.quiz.title);
    console.log(
      "   - Total Questions:",
      quizResponse.data.quiz.total_questions
    );
    console.log("   - Time Limit:", quizResponse.data.quiz.time_limit);
    console.log(
      "   - Questions in quiz_data:",
      quizResponse.data.quiz.quiz_data?.questions?.length || 0
    );

    // Test 2: Start quiz attempt
    console.log("🚀 Step 2: Starting quiz attempt...");
    const attemptResponse = await makeRequest(
      `http://localhost:3002/api/v1/quiz-attempts/start/${quizId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (attemptResponse.status !== 201) {
      throw new Error(`Quiz attempt API failed: ${attemptResponse.status}`);
    }

    console.log("✅ Quiz attempt started successfully");
    console.log("   - Attempt ID:", attemptResponse.data.attempt.id);
    console.log("   - Status:", attemptResponse.data.attempt.status);

    // Test 3: Submit quiz attempt
    console.log("📤 Step 3: Submitting quiz attempt...");
    const submitData = JSON.stringify({
      answers: {
        q_001: "b",
        q_002: "a",
        q_003: "b",
      },
      timeSpent: 120,
    });

    const submitResponse = await makeRequest(
      `http://localhost:3002/api/v1/quiz-attempts/submit/${attemptResponse.data.attempt.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(submitData),
        },
      }
    );

    if (submitResponse.status !== 200) {
      throw new Error(`Quiz submit API failed: ${submitResponse.status}`);
    }

    console.log("✅ Quiz attempt submitted successfully");
    console.log("   - Score:", submitResponse.data.attempt.score);
    console.log("   - Status:", submitResponse.data.attempt.status);

    console.log("🎉 All tests passed! QuizPage should work correctly.");
    console.log("");
    console.log("📝 To test QuizPage in browser:");
    console.log("1. Open http://localhost:3000/QeezeUI/test-quiz-page.html");
    console.log('2. Click "Go to QuizPage" button');
    console.log("3. QuizPage should load with real quiz data from database");
    console.log("");
    console.log("🔗 Direct QuizPage URL:");
    console.log("http://localhost:3000/QeezeUI/QuizPage");
    console.log("");
    console.log("📋 Quiz ID to test with:");
    console.log(quizId);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testQuizPage();
