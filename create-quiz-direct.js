const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createTestQuiz() {
  try {
    console.log("🧪 Creating test quiz directly in database...");

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

    // Insert quiz directly into database
    const query = `
      INSERT INTO quizzes (
        user_id, pdf_file_id, title, description, total_questions, 
        time_limit_minutes, difficulty_level, quiz_data, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, title, created_at
    `;

    const values = [
      "00000000-0000-0000-0000-000000000000", // temporary user_id, will update later
      quizData.pdf_file_id,
      quizData.title,
      quizData.description,
      quizData.total_questions,
      quizData.time_limit_minutes,
      quizData.difficulty_level,
      JSON.stringify(quizData.quiz_data),
      true, // is_active instead of status
    ];

    const result = await pool.query(query, values);
    console.log("✅ Quiz created successfully:", result.rows[0]);

    const quizId = result.rows[0].id;
    console.log("📝 Quiz ID:", quizId);
    console.log("📝 Quiz Title:", result.rows[0].title);
    console.log("📝 Created at:", result.rows[0].created_at);

    // Test retrieving the quiz
    console.log("🔍 Testing quiz retrieval...");
    const getQuery = "SELECT * FROM quizzes WHERE id = $1";
    const getResult = await pool.query(getQuery, [quizId]);
    console.log("✅ Quiz retrieved successfully:", getResult.rows[0]);

    // Create a test user and token for frontend testing
    console.log("👤 Creating test user...");
    const userQuery = `
      INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, username, email
    `;

    const userId = require("crypto").randomUUID();
    const userResult = await pool.query(userQuery, [
      userId,
      "testuser",
      "test@example.com",
      "hashed_password_123", // In real app, this would be properly hashed
    ]);

    console.log("✅ User created:", userResult.rows[0]);

    // Update quiz with real user_id
    const updateQuizQuery = `
      UPDATE quizzes SET user_id = $1 WHERE id = $2
      RETURNING id, title, user_id
    `;

    const updateResult = await pool.query(updateQuizQuery, [userId, quizId]);
    console.log("✅ Quiz updated with user_id:", updateResult.rows[0]);

    // Create a simple JWT token (for testing only)
    const jwt = require("jsonwebtoken");
    const testToken = jwt.sign(
      { userId: userResult.rows[0].id, email: userResult.rows[0].email },
      "test-secret-key",
      { expiresIn: "24h" }
    );

    console.log("🔑 Test token created:", testToken);
    console.log("📋 Summary:");
    console.log("  - Quiz ID:", quizId);
    console.log("  - User ID:", userResult.rows[0].id);
    console.log("  - Token:", testToken);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await pool.end();
  }
}

createTestQuiz();
