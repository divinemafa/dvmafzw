/**
 * Registration API Test Script
 * 
 * This script tests the signup API directly without the browser
 * Run with: node tests/test-signup-api.js
 */

const fetch = require('node-fetch');

// Test configuration
const API_URL = 'http://localhost:3000/api/auth/signup';
const TEST_USER = {
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123',
  userType: 'business',
  phone: '+27821234567'
};

console.log('============================================================');
console.log('TESTING SIGNUP API');
console.log('============================================================\n');

async function testSignup() {
  console.log('📋 Test User Data:');
  console.log(JSON.stringify(TEST_USER, null, 2));
  console.log('\n📤 Sending POST request to:', API_URL);
  console.log('-----------------------------------------------------------\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    console.log('📥 Response Status:', response.status, response.statusText);
    console.log('-----------------------------------------------------------\n');

    const data = await response.json();
    
    console.log('📦 Response Body:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n-----------------------------------------------------------\n');

    if (response.ok && data.success) {
      console.log('✅ TEST PASSED: User created successfully!');
      console.log('User ID:', data.userId);
      console.log('\n🎉 Registration working correctly!\n');
      process.exit(0);
    } else {
      console.log('❌ TEST FAILED: Registration failed');
      console.log('Error:', data.error);
      console.log('\n🔍 Check the error message above for details\n');
      process.exit(1);
    }

  } catch (error) {
    console.log('❌ TEST ERROR: Exception occurred');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.log('\n🔍 Make sure the dev server is running (pnpm dev)\n');
    process.exit(1);
  }
}

console.log('🚀 Starting test...\n');
testSignup();
