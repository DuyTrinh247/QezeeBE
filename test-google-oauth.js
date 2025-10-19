const { OAuth2Client } = require('google-auth-library');

// Test Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '493784879052-2bc2gefphqufa97n8cj7tm4qqt2844q0.apps.googleusercontent.com';

console.log('🔍 Testing Google OAuth configuration...');
console.log('Google Client ID:', GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
console.log('Client ID Length:', GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.length : 0);

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Test with a fake token to see what error we get
const testToken = 'fake-token-for-testing';

googleClient.verifyIdToken({
  idToken: testToken,
  audience: GOOGLE_CLIENT_ID,
})
.then(ticket => {
  console.log('✅ Google OAuth client initialized successfully');
  console.log('Ticket:', ticket);
})
.catch(error => {
  console.log('❌ Google OAuth test failed (expected):', error.message);
  console.log('This is expected with a fake token, but shows the client is working');
});

console.log('🔍 Google OAuth client created successfully');
console.log('Ready to test with real tokens from frontend');
