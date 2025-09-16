// Using built-in fetch (Node.js 18+)

const BASE_URL = "http://localhost:3002";
const FRONTEND_URL = "http://localhost:3000";

// Test data
const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZmRkZjVlYy05NjRkLTQyM2UtOGI5Ni1kNmQyMGI3MjUyMzkiLCJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3NTc5MjkyNzUsImV4cCI6MTc1ODAxNTY3NX0.7uL0Pd5BQPQ4KMBm5-QH0bdAYhaaZHMNgpuX2VyPLYk";

async function testCompleteFlow() {
  console.log("🚀 Testing Complete Quiz Flow");
  console.log("===============================");

  try {
    // Step 1: Test backend health
    console.log("\n1. Testing backend health...");
    const healthResponse = await fetch(`${BASE_URL}/api/v1/quiz-attempts/test`);
    const healthData = await healthResponse.json();
    console.log("✅ Backend health:", healthData.message);

    // Step 2: Test frontend health
    console.log("\n2. Testing frontend health...");
    const frontendResponse = await fetch(FRONTEND_URL);
    console.log("✅ Frontend status:", frontendResponse.status);

    // Step 3: Test quiz data loading
    console.log("\n3. Testing quiz data loading...");
    const quizResponse = await fetch(
      `${BASE_URL}/api/v1/quizzes/ffb52226-d6a4-4605-80a5-1cca01e40f0d`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (quizResponse.ok) {
      const quizData = await quizResponse.json();
      console.log("✅ Quiz data loaded:", quizData.quiz.title);
      console.log("   PDF file ID:", quizData.quiz.pdf_file_id);
      console.log("   Total questions:", quizData.quiz.total_questions);
    } else {
      console.log("❌ Failed to load quiz data:", quizResponse.status);
    }

    // Step 4: Test quiz attempt start
    console.log("\n4. Testing quiz attempt start...");
    const startResponse = await fetch(
      `${BASE_URL}/api/v1/quiz-attempts/start/ffb52226-d6a4-4605-80a5-1cca01e40f0d`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (startResponse.ok) {
      const startData = await startResponse.json();
      console.log("✅ Quiz attempt started:", startData.attempt.id);

      // Step 5: Test quiz attempt submit
      console.log("\n5. Testing quiz attempt submit...");
      const submitResponse = await fetch(
        `${BASE_URL}/api/v1/quiz-attempts/submit/${startData.attempt.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers: {
              q1: "option_a",
              q2: "option_b",
              q3: "option_c",
            },
            timeSpent: 300,
          }),
        }
      );

      if (submitResponse.ok) {
        const submitData = await submitResponse.json();
        console.log("✅ Quiz attempt submitted:", submitData.attempt.id);
        console.log("   Score:", submitData.attempt.score);
        console.log("   Status:", submitData.attempt.status);
      } else {
        console.log("❌ Failed to submit quiz attempt:", submitResponse.status);
      }
    } else {
      console.log("❌ Failed to start quiz attempt:", startResponse.status);
    }

    // Step 6: Test PDF notes API
    console.log("\n6. Testing PDF notes API...");
    const notesResponse = await fetch(
      `${BASE_URL}/api/test/pdf-notes/pdf/test-pdf-file-id-123`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (notesResponse.ok) {
      const notesData = await notesResponse.json();
      console.log(
        "✅ PDF notes API working:",
        notesData.notes?.length || 0,
        "notes found"
      );
    } else {
      console.log("❌ PDF notes API failed:", notesResponse.status);
    }

    console.log("\n🎉 Complete flow test finished!");
    console.log("\n📝 Next steps:");
    console.log("1. Open browser and go to http://localhost:3000");
    console.log("2. Upload a PDF and create a quiz");
    console.log("3. Take the quiz and submit it");
    console.log("4. Check the QuizReview page for detailed results");
    console.log("5. Test adding notes to the PDF");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testCompleteFlow();
