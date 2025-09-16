const http = require('http');

console.log('🔍 Debugging Google OAuth...');

// Test all auth endpoints
const endpoints = [
  'GET /api/v1/auth/login',
  'POST /api/v1/auth/login',
  'GET /api/v1/auth/register', 
  'POST /api/v1/auth/register',
  'GET /api/v1/auth/google-login',
  'POST /api/v1/auth/google-login'
];

async function testEndpoint(method, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`${method} ${path}: ${res.statusCode} - ${data.substring(0, 100)}`);
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.log(`${method} ${path}: ERROR - ${err.message}`);
      resolve(0);
    });

    if (method === 'POST') {
      req.write(JSON.stringify({ token: 'test' }));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('Testing all auth endpoints...\n');
  
  for (const endpoint of endpoints) {
    const [method, path] = endpoint.split(' ');
    await testEndpoint(method, path);
  }
  
  console.log('\n✅ Debug complete!');
}

runTests();
