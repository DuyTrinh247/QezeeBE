const { z } = require("zod");

// Test schema
const quizIdSchema = z.object({
  quizId: z.string().uuid("Invalid quiz ID format"),
});

// Test params
const testParams = {
  quizId: "b41c9500-aa93-45a6-8bf4-75aea97a249a",
};

console.log("Testing params:", testParams);

try {
  const result = quizIdSchema.parse(testParams);
  console.log("✅ Validation passed:", result);
} catch (error) {
  console.log("❌ Validation failed:", error.issues);
}
