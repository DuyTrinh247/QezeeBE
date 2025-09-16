const express = require("express");
const { z } = require("zod");

const app = express();

// Test schema
const quizIdSchema = z.object({
  quizId: z.string().uuid("Invalid quiz ID format"),
});

// Test validation middleware
function validateParams(schema) {
  return (req, res, next) => {
    try {
      console.log("Validating params:", req.params);
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation error:", error.issues);
        return res.status(400).json({
          error: "Validation error",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

// Test route
app.post("/test/:quizId", validateParams(quizIdSchema), (req, res) => {
  console.log("Test route - req.params:", req.params);
  res.json({ params: req.params });
});

app.listen(3003, () => {
  console.log("Test server running on port 3003");

  // Test the route
  const http = require("http");
  const options = {
    hostname: "localhost",
    port: 3003,
    path: "/test/b41c9500-aa93-45a6-8bf4-75aea97a249a",
    method: "POST",
  };

  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log("Response:", data);
      process.exit(0);
    });
  });

  req.on("error", (e) => {
    console.error("Error:", e.message);
    process.exit(1);
  });

  req.end();
});
