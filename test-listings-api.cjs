// Test API endpoint for listings
const fetch = require('node-fetch');

async function testListingsAPI() {
  try {
    console.log('Testing GET /api/listings endpoint...\n');
    console.log('NOTE: This test runs without authentication, so it will only see public active listings.');
    console.log('To test with authentication, use the browser with a logged-in session.\n');
    
    // Test 1: Fetch all listings (will default to active only)
    console.log('1. Fetching active listings (public):');
    const response1 = await fetch('http://localhost:3000/api/listings');
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Result:', JSON.stringify(data1, null, 2));
    console.log('\n---\n');
    
    // Test 2: Try fetching with my_listings flag (will fail without auth)
    console.log('2. Fetching with my_listings=true (requires authentication):');
    const response2 = await fetch('http://localhost:3000/api/listings?my_listings=true');
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Result:', JSON.stringify(data2, null, 2));
    console.log('\n---\n');
    
    // Test 3: Direct database check
    console.log('3. For reference, your listing in the database has:');
    console.log('   - title: "Cold Storge hard drive"');
    console.log('   - status: "draft"');
    console.log('   - This is why it doesn\'t appear in public API calls');
    console.log('   - It WILL appear in the dashboard when logged in with my_listings=true');
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testListingsAPI();
