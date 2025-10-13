/**
 * Test Bookings API
 * 
 * This script tests the bookings API endpoints to verify:
 * 1. Recent bookings fetch works correctly
 * 2. Single booking fetch works with booking reference
 * 3. Data transformation is correct
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

async function testRecentBookingsAPI() {
  logSection('TEST 1: Fetch Recent Bookings (No Filter)');
  
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/recent?limit=10`);
    const data = await response.json();

    log(`Status: ${response.status}`, response.ok ? colors.green : colors.red);
    
    if (response.ok) {
      log(`✓ Found ${data.bookings?.length || 0} bookings`, colors.green);
      
      if (data.bookings && data.bookings.length > 0) {
        log('\nFirst Booking:', colors.cyan);
        const booking = data.bookings[0];
        console.log(JSON.stringify({
          booking_reference: booking.booking_reference,
          project_title: booking.project_title,
          listing_title: booking.listingTitle,
          status: booking.status,
          client_email: booking.clientEmail,
          provider: booking.provider,
          amount: booking.amount,
          currency: booking.currency,
          created_at: booking.createdAt,
        }, null, 2));
        
        return booking.booking_reference; // Return for next test
      } else {
        log('⚠ No bookings found in database', colors.yellow);
      }
    } else {
      log(`✗ Error: ${data.error}`, colors.red);
    }
  } catch (error) {
    log(`✗ Request failed: ${error.message}`, colors.red);
  }
  
  return null;
}

async function testRecentBookingsByEmail(email) {
  logSection(`TEST 2: Fetch Recent Bookings by Email (${email})`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/recent?email=${encodeURIComponent(email)}&limit=10`);
    const data = await response.json();

    log(`Status: ${response.status}`, response.ok ? colors.green : colors.red);
    
    if (response.ok) {
      log(`✓ Found ${data.bookings?.length || 0} bookings for this email`, colors.green);
      
      if (data.bookings && data.bookings.length > 0) {
        data.bookings.forEach((booking, index) => {
          log(`\nBooking ${index + 1}:`, colors.cyan);
          console.log(JSON.stringify({
            booking_reference: booking.booking_reference,
            project_title: booking.project_title,
            status: booking.status,
            client_email: booking.clientEmail,
          }, null, 2));
        });
      } else {
        log('⚠ No bookings found for this email', colors.yellow);
        log('\nPossible reasons:', colors.yellow);
        log('  1. Booking was created with a different email', colors.yellow);
        log('  2. Booking exists but email filter is not matching', colors.yellow);
        log('  3. Database query issue', colors.yellow);
      }
    } else {
      log(`✗ Error: ${data.error}`, colors.red);
    }
  } catch (error) {
    log(`✗ Request failed: ${error.message}`, colors.red);
  }
}

async function testSingleBooking(bookingReference) {
  if (!bookingReference) {
    log('\n⚠ Skipping single booking test (no booking reference provided)', colors.yellow);
    return;
  }
  
  logSection(`TEST 3: Fetch Single Booking (${bookingReference})`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/${bookingReference}`);
    const data = await response.json();

    log(`Status: ${response.status}`, response.ok ? colors.green : colors.red);
    
    if (response.ok) {
      log('✓ Booking found', colors.green);
      log('\nBooking Details:', colors.cyan);
      console.log(JSON.stringify({
        booking_reference: data.booking?.bookingReference,
        status: data.booking?.status,
        project_title: data.booking?.projectTitle,
        listing: data.booking?.listing?.title,
        provider: data.booking?.provider?.name,
        client_email: data.booking?.clientEmail,
        amount: data.booking?.amount,
        currency: data.booking?.currency,
        timeline: data.booking?.timeline,
      }, null, 2));
    } else {
      log(`✗ Error: ${data.error}`, colors.red);
    }
  } catch (error) {
    log(`✗ Request failed: ${error.message}`, colors.red);
  }
}

async function testDatabaseDirectly() {
  logSection('TEST 4: Check Database Directly (Last 5 Bookings)');
  
  try {
    // This assumes you have a test endpoint or we can create one
    log('Note: This would require direct database access', colors.yellow);
    log('Suggestion: Check Supabase dashboard > Table Editor > bookings table', colors.cyan);
  } catch (error) {
    log(`✗ Error: ${error.message}`, colors.red);
  }
}

// Main execution
async function runAllTests() {
  log('\n' + '█'.repeat(60), colors.bright + colors.cyan);
  log('  BOOKINGS API TEST SUITE', colors.bright + colors.cyan);
  log('█'.repeat(60) + '\n', colors.bright + colors.cyan);
  
  // Test 1: Get all recent bookings
  const firstBookingReference = await testRecentBookingsAPI();
  
  // Test 2: Get bookings by email (use the email from your booking)
  // Update this with the actual email you used when creating the booking
  const testEmail = 'test@example.com'; // CHANGE THIS TO YOUR EMAIL
  log(`\n${'='.repeat(60)}`, colors.yellow);
  log(`⚠ IMPORTANT: Update testEmail variable in the script`, colors.yellow);
  log(`   Current test email: ${testEmail}`, colors.yellow);
  log(`   Change to match the email you used when booking`, colors.yellow);
  log(`${'='.repeat(60)}`, colors.yellow);
  
  await testRecentBookingsByEmail(testEmail);
  
  // Test 3: Get single booking
  if (firstBookingReference) {
    await testSingleBooking(firstBookingReference);
  }
  
  // Test 4: Database check reminder
  await testDatabaseDirectly();
  
  // Summary
  logSection('SUMMARY & NEXT STEPS');
  log('\n✓ If bookings appear in Test 1 but not Test 2:', colors.cyan);
  log('  → Update the testEmail variable with your actual email', colors.cyan);
  log('  → Re-run this script: node test-bookings-api.cjs', colors.cyan);
  
  log('\n✓ If no bookings appear at all:', colors.cyan);
  log('  → Check Supabase dashboard > bookings table', colors.cyan);
  log('  → Verify booking was created successfully', colors.cyan);
  log('  → Check browser console for POST /api/bookings response', colors.cyan);
  
  log('\n✓ If bookings exist but not showing in UI:', colors.cyan);
  log('  → Check browser Network tab for /api/bookings/recent request', colors.cyan);
  log('  → Verify userEmail prop is correct in BookingsSection', colors.cyan);
  log('  → Check browser console for errors', colors.cyan);
  
  console.log('\n');
}

// Run the tests
runAllTests().catch(error => {
  log(`\n✗ Test suite failed: ${error.message}`, colors.red);
  process.exit(1);
});
