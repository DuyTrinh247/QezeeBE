#!/usr/bin/env node

const https = require("https");
const http = require("http");

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    const req = client.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testAPI() {
  console.log("🧪 Testing API endpoints...\n");

  try {
    // Test 1: Check if backend is running
    console.log("1️⃣ Testing backend health...");
    const healthResult = await makeRequest(
      "http://localhost:3002/api/v1/users"
    );
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Response: ${JSON.stringify(healthResult.data)}\n`);

    // Test 2: Test user registration
    console.log("2️⃣ Testing user registration...");
    const registerResult = await makeRequest(
      "http://localhost:3002/api/v1/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "API Test User",
          email: "apitest@example.com",
          password: "test123",
        }),
      }
    );
    console.log(`   Status: ${registerResult.status}`);
    console.log(`   Response: ${JSON.stringify(registerResult.data)}\n`);

    // Test 3: Test user login
    console.log("3️⃣ Testing user login...");
    const loginResult = await makeRequest(
      "http://localhost:3002/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "apitest@example.com",
          password: "test123",
        }),
      }
    );
    console.log(`   Status: ${loginResult.status}`);
    console.log(`   Response: ${JSON.stringify(loginResult.data)}\n`);

    // Test 4: Test PDF files endpoint
    console.log("4️⃣ Testing PDF files endpoint...");
    const pdfResult = await makeRequest(
      "http://localhost:3002/api/v1/pdf-files"
    );
    console.log(`   Status: ${pdfResult.status}`);
    console.log(`   Response: ${JSON.stringify(pdfResult.data)}\n`);

    console.log("🎉 API testing completed!");
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

testAPI();
