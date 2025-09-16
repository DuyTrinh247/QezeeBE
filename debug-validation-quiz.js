const { z } = require("zod");

// Test schema
const quizIdSchema = z.object({
  quizId: z.string().uuid("Invalid quiz ID format"),
});

// Test params
const testParams = {
  quizId: "ffb52226-d6a4-4605-80a5-1cca01e40f0d",
};

console.log("Testing quiz params:", testParams);

try {
  const result = quizIdSchema.parse(testParams);
  console.log("✅ Quiz validation passed:", result);
} catch (error) {
  console.log("❌ Quiz validation failed:", error.issues);
}

// Test with wrong field name
const wrongParams = {
  id: "ffb52226-d6a4-4605-80a5-1cca01e40f0d",
};

console.log("\nTesting with wrong field name:", wrongParams);

try {
  const result = quizIdSchema.parse(wrongParams);
  console.log("✅ Quiz validation passed:", result);
} catch (error) {
  console.log("❌ Quiz validation failed:", error.issues);
}
