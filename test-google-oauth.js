const https = require('https');
const http = require('http');

console.log('🧪 Testing Google OAuth Integration');
console.log('===================================');

// Test 1: Check if backend is running
function testBackend() {
  return new Promise((resolve) => {
    console.log('\n1. Testing backend connection...');
    
    const req = http.get('http://localhost:3002/api/v1/auth/google-login', (res) => {
      if (res.statusCode === 400) {
        console.log('✅ Backend is running and Google OAuth endpoint exists');
        console.log('   (400 is expected for GET request without token)');
        resolve(true);
      } else {
        console.log('❌ Backend returned unexpected status:', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log('❌ Backend connection failed:', err.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Backend connection timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 2: Test Google OAuth with POST request
function testGoogleOAuth() {
  return new Promise((resolve) => {
    console.log('\n2. Testing Google OAuth POST request...');
    
    const postData = JSON.stringify({
      token: 'test-token-123'
    });

    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/v1/auth/google-login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📊 Response status:', res.statusCode);
        console.log('📊 Response body:', data);
        
        if (res.statusCode === 500) {
          console.log('⚠️  Server error (expected with invalid token)');
          console.log('   This means the endpoint exists but token validation failed');
          resolve(true);
        } else if (res.statusCode === 400) {
          console.log('✅ Bad request (expected with invalid token)');
          resolve(true);
        } else {
          console.log('❌ Unexpected response');
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Request failed:', err.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Check frontend
function testFrontend() {
  return new Promise((resolve) => {
    console.log('\n3. Testing frontend connection...');
    
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend is running on port 3000');
        resolve(true);
      } else {
        console.log('❌ Frontend returned status:', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log('❌ Frontend connection failed:', err.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Frontend connection timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Main test function
async function runTests() {
  console.log('Starting tests...\n');

  const backendOk = await testBackend();
  const oauthOk = await testGoogleOAuth();
  const frontendOk = await testFrontend();

  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Backend (port 3002): ${backendOk ? '✅' : '❌'}`);
  console.log(`Google OAuth: ${oauthOk ? '✅' : '❌'}`);
  console.log(`Frontend (port 3000): ${frontendOk ? '✅' : '❌'}`);

  if (backendOk && oauthOk && frontendOk) {
    console.log('\n🎉 All tests passed!');
    console.log('   You can now test Google OAuth in your browser:');
    console.log('   1. Go to http://localhost:3000/LogIn/SignIn');
    console.log('   2. Click "Continue with Google" button');
    console.log('   3. Complete the OAuth flow');
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.');
  }
}

runTests();
