/**
 * Test Script: Booking API Endpoints
 * 
 * Tests the booking system to verify:
 * 1. Recent bookings API works
 * 2. Single booking API works
 * 3. Data is correctly formatted
 * 
 * Usage: node test-booking-api.cjs [email]
 */

const https = require('https');

const BASE_URL = 'http://localhost:3000';

// Get email from command line or use default
const testEmail = process.argv[2] || 'test@example.com';

console.log('🧪 Testing Booking API Endpoints\n');
console.log('=' .repeat(60));
console.log(`Testing with email: ${testEmail}\n`);

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    };

    const req = (parsedUrl.protocol === 'https:' ? https : require('http')).request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Test 1: Fetch recent bookings by email
async function testRecentBookings() {
  console.log('\n📋 Test 1: GET /api/bookings/recent?email=...');
  console.log('-'.repeat(60));
  
  try {
    const url = `${BASE_URL}/api/bookings/recent?email=${encodeURIComponent(testEmail)}&limit=50`;
    console.log(`URL: ${url}`);
    
    const response = await makeRequest(url);
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.bookings) {
      console.log(`✅ Success! Found ${response.data.bookings.length} booking(s)`);
      
      if (response.data.bookings.length > 0) {
        const firstBooking = response.data.bookings[0];
        console.log('\nFirst booking details:');
        console.log(`  - Reference: ${firstBooking.booking_reference}`);
        console.log(`  - Project: ${firstBooking.project_title}`);
        console.log(`  - Status: ${firstBooking.status}`);
        console.log(`  - Amount: ${firstBooking.currency} ${firstBooking.amount}`);
        
        return firstBooking.booking_reference; // Return for next test
      } else {
        console.log('⚠️  No bookings found for this email');
        console.log('\nTip: Try creating a booking first by:');
        console.log('1. Going to /market');
        console.log('2. Finding a service');
        console.log('3. Filling out the booking form');
      }
    } else {
      console.log('❌ Failed to fetch bookings');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  return null;
}

// Test 2: Fetch single booking by reference
async function testSingleBooking(bookingReference) {
  if (!bookingReference) {
    console.log('\n⏭️  Skipping Test 2 (no booking reference available)');
    return;
  }
  
  console.log('\n\n📄 Test 2: GET /api/bookings/[bookingReference]');
  console.log('-'.repeat(60));
  
  try {
    const url = `${BASE_URL}/api/bookings/${bookingReference}`;
    console.log(`URL: ${url}`);
    
    const response = await makeRequest(url);
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200 && response.data.booking) {
      console.log('✅ Success! Booking details retrieved');
      
      const booking = response.data.booking;
      console.log('\nBooking Details:');
      console.log(`  - Reference: ${booking.bookingReference}`);
      console.log(`  - Status: ${booking.status}`);
      console.log(`  - Project: ${booking.projectTitle}`);
      console.log(`  - Service: ${booking.listing.title}`);
      console.log(`  - Provider: ${booking.provider.name}`);
      console.log(`  - Client: ${booking.clientEmail}`);
      console.log(`  - Amount: ${booking.currency} ${booking.amount}`);
      console.log(`  - Preferred Date: ${booking.preferredDate}`);
      console.log(`  - Location: ${booking.location}`);
      console.log(`  - Timeline Steps: ${booking.timeline.length}`);
      console.log(`  - Current Step: ${booking.currentStep}`);
      
      console.log('\nTimeline:');
      booking.timeline.forEach((step, index) => {
        const icon = step.completed ? '✅' : '⏳';
        console.log(`  ${icon} ${step.label} ${step.timestamp ? `(${new Date(step.timestamp).toLocaleString()})` : ''}`);
      });
    } else {
      console.log('❌ Failed to fetch booking details');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 3: Check database directly (requires Supabase connection)
async function testDatabaseQuery() {
  console.log('\n\n💾 Test 3: Database Query Check');
  console.log('-'.repeat(60));
  console.log('To check the database directly, run this SQL query:');
  console.log('\nSELECT');
  console.log('  booking_reference,');
  console.log('  project_title,');
  console.log('  client_email,');
  console.log('  status,');
  console.log('  amount,');
  console.log('  created_at');
  console.log('FROM bookings');
  console.log(`WHERE client_email = '${testEmail}'`);
  console.log('ORDER BY created_at DESC');
  console.log('LIMIT 5;');
}

// Run all tests
async function runTests() {
  const bookingReference = await testRecentBookings();
  await testSingleBooking(bookingReference);
  await testDatabaseQuery();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Tests Complete!\n');
}

// Execute
runTests().catch(console.error);
