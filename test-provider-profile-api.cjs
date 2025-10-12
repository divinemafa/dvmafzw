/**
 * Test Provider Profile API
 * 
 * Tests GET /api/profiles/:username endpoint
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testProviderProfileAPI() {
  console.log('🧪 Testing Provider Profile API\n');
  console.log('='.repeat(60));
  
  // First, get a username from the listings API
  console.log('\n📋 Step 1: Getting a provider username from listings...');
  try {
    const listingsResponse = await fetch(`${SITE_URL}/api/listings?status=active&limit=1`);
    const listingsData = await listingsResponse.json();
    
    if (!listingsData.success || !listingsData.listings || listingsData.listings.length === 0) {
      console.log('⚠️  No active listings found. Cannot test profile API.');
      return;
    }
    
    const listing = listingsData.listings[0];
    const providerUsername = listing.provider?.username;
    
    if (!providerUsername) {
      console.log('⚠️  Provider has no username. Cannot test profile API.');
      console.log('Provider data:', JSON.stringify(listing.provider, null, 2));
      return;
    }
    
    console.log(`✅ Found provider: @${providerUsername} (${listing.provider.display_name})`);
    console.log(`   From listing: "${listing.title}"`);
    
    // Test 1: Fetch profile by username
    console.log(`\n👤 Test 1: Fetching profile for @${providerUsername}`);
    const profileResponse = await fetch(`${SITE_URL}/api/profiles/${providerUsername}`);
    const profileData = await profileResponse.json();
    
    console.log(`Status: ${profileResponse.status}`);
    console.log(`Success: ${profileData.success}`);
    
    if (profileData.success && profileData.profile) {
      const { profile, listings, stats } = profileData;
      
      console.log(`\n📊 Profile Data:`);
      console.log(`  - Username: @${profile.username}`);
      console.log(`  - Display Name: ${profile.display_name}`);
      console.log(`  - Verified: ${profile.is_verified ? '✅' : '❌'}`);
      console.log(`  - Verification Level: ${profile.verification_level}/4`);
      console.log(`  - Premium: ${profile.is_premium ? '✅' : '❌'}`);
      console.log(`  - Rating: ${profile.rating.toFixed(1)} ⭐`);
      console.log(`  - Total Reviews: ${profile.total_reviews}`);
      console.log(`  - Total Bookings: ${profile.total_bookings}`);
      console.log(`  - Services Completed: ${profile.services_completed}`);
      console.log(`  - Location: ${profile.location || 'N/A'}`);
      console.log(`  - Bio: ${profile.bio ? `"${profile.bio.substring(0, 50)}..."` : 'N/A'}`);
      console.log(`  - Website: ${profile.website_url || 'N/A'}`);
      console.log(`  - Avatar URL: ${profile.avatar_url || 'N/A'}`);
      console.log(`  - Cover Image: ${profile.cover_image_url || 'N/A'}`);
      console.log(`  - Joined: ${new Date(profile.joined_at).toLocaleDateString()}`);
      
      console.log(`\n📈 Stats:`);
      console.log(`  - Active Listings: ${stats.activeListings}`);
      console.log(`  - Total Bookings: ${stats.totalBookings}`);
      console.log(`  - Total Reviews: ${stats.totalReviews}`);
      console.log(`  - Services Completed: ${stats.servicesCompleted}`);
      console.log(`  - Response Time: ${stats.responseTime}`);
      console.log(`  - Success Rate: ${stats.successRate}%`);
      
      console.log(`\n📋 Listings (showing ${listings.length}):`);
      listings.forEach((listing, i) => {
        console.log(`  ${i + 1}. ${listing.title}`);
        console.log(`     - Price: ${listing.price_display || `${listing.price} ${listing.currency}`}`);
        console.log(`     - Rating: ${listing.rating} ⭐ (${listing.reviews_count} reviews)`);
        console.log(`     - Views: ${listing.views}`);
        console.log(`     - Slug: /market/${listing.slug}`);
      });
      
      console.log('\n✅ Test 1 passed - Profile API working!');
    } else {
      console.log(`❌ Test 1 failed: ${profileData.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  // Test 2: Invalid username
  console.log('\n🚫 Test 2: Invalid username');
  try {
    const response = await fetch(`${SITE_URL}/api/profiles/invalid_user_123456789`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Expected 404: ${response.status === 404 ? '✅' : '❌'}`);
    console.log(`Error message: ${data.error}`);
    
    if (response.status === 404) {
      console.log('✅ Test 2 passed - 404 for invalid username');
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }
  
  // Test 3: Invalid username format (special characters)
  console.log('\n🚫 Test 3: Invalid username format');
  try {
    const response = await fetch(`${SITE_URL}/api/profiles/user@123!`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Expected 400: ${response.status === 400 ? '✅' : '❌'}`);
    console.log(`Error message: ${data.error}`);
    
    if (response.status === 400) {
      console.log('✅ Test 3 passed - 400 for invalid format');
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All provider profile API tests completed!\n');
}

// Run tests
testProviderProfileAPI().catch(console.error);
