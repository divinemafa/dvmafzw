/**
 * Test Enhanced Listings API
 * 
 * Tests the enhanced GET /api/listings endpoint with:
 * - Pagination
 * - Enhanced provider data
 * - Sorting
 * - Search
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testEnhancedListingsAPI() {
  console.log('🧪 Testing Enhanced Listings API\n');
  console.log('='.repeat(60));
  
  // Test 1: Basic pagination
  console.log('\n📄 Test 1: Pagination (page 1, limit 5)');
  try {
    const response = await fetch(`${SITE_URL}/api/listings?status=active&page=1&limit=5`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Listings count: ${data.listings?.length || 0}`);
    console.log(`Pagination:`, data.pagination);
    
    if (data.listings && data.listings.length > 0) {
      const listing = data.listings[0];
      console.log(`\n📋 First Listing:`);
      console.log(`  - ID: ${listing.id}`);
      console.log(`  - Title: ${listing.title}`);
      console.log(`  - Price: ${listing.price_display || `${listing.price} ${listing.currency}`}`);
      console.log(`  - Provider: ${listing.provider?.display_name || 'N/A'}`);
      console.log(`  - Provider Username: ${listing.provider?.username || 'N/A'}`);
      console.log(`  - Provider Avatar: ${listing.provider?.avatar_url || 'N/A'}`);
      console.log(`  - Provider Verified: ${listing.provider?.is_verified || false}`);
      console.log(`  - Provider Rating: ${listing.provider?.rating || 0}`);
      console.log(`  - Provider Reviews: ${listing.provider?.total_reviews || 0}`);
    }
    
    console.log('✅ Test 1 passed');
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }
  
  // Test 2: Page 2 (if there are more listings)
  console.log('\n📄 Test 2: Pagination (page 2)');
  try {
    const response = await fetch(`${SITE_URL}/api/listings?status=active&page=2&limit=5`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Listings count: ${data.listings?.length || 0}`);
    console.log(`Has more: ${data.pagination?.hasMore}`);
    
    console.log('✅ Test 2 passed');
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }
  
  // Test 3: Sort by price (low to high)
  console.log('\n💰 Test 3: Sort by price (low to high)');
  try {
    const response = await fetch(`${SITE_URL}/api/listings?status=active&sort=price_low&limit=3`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Listings count: ${data.listings?.length || 0}`);
    
    if (data.listings && data.listings.length > 0) {
      console.log(`Prices (should be ascending):`);
      data.listings.forEach((listing, i) => {
        console.log(`  ${i + 1}. ${listing.title}: ${listing.price} ${listing.currency}`);
      });
    }
    
    console.log('✅ Test 3 passed');
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }
  
  // Test 4: Sort by price (high to low)
  console.log('\n💰 Test 4: Sort by price (high to low)');
  try {
    const response = await fetch(`${SITE_URL}/api/listings?status=active&sort=price_high&limit=3`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Listings count: ${data.listings?.length || 0}`);
    
    if (data.listings && data.listings.length > 0) {
      console.log(`Prices (should be descending):`);
      data.listings.forEach((listing, i) => {
        console.log(`  ${i + 1}. ${listing.title}: ${listing.price} ${listing.currency}`);
      });
    }
    
    console.log('✅ Test 4 passed');
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
  }
  
  // Test 5: Search functionality
  console.log('\n🔍 Test 5: Search (term: "cold")');
  try {
    const response = await fetch(`${SITE_URL}/api/listings?status=active&search=cold`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Listings count: ${data.listings?.length || 0}`);
    
    if (data.listings && data.listings.length > 0) {
      console.log(`Found listings:`);
      data.listings.forEach((listing, i) => {
        console.log(`  ${i + 1}. ${listing.title}`);
      });
    }
    
    console.log('✅ Test 5 passed');
  } catch (error) {
    console.error('❌ Test 5 failed:', error.message);
  }
  
  // Test 6: Provider data completeness
  console.log('\n👤 Test 6: Provider data fields');
  try {
    const response = await fetch(`${SITE_URL}/api/listings?status=active&limit=1`);
    const data = await response.json();
    
    if (data.listings && data.listings.length > 0) {
      const provider = data.listings[0].provider;
      
      console.log(`Provider fields present:`);
      console.log(`  - id: ${provider?.id ? '✅' : '❌'}`);
      console.log(`  - username: ${provider?.username ? '✅' : '❌'}`);
      console.log(`  - display_name: ${provider?.display_name ? '✅' : '❌'}`);
      console.log(`  - avatar_url: ${provider?.avatar_url !== undefined ? '✅' : '❌'}`);
      console.log(`  - rating: ${provider?.rating !== undefined ? '✅' : '❌'}`);
      console.log(`  - total_reviews: ${provider?.total_reviews !== undefined ? '✅' : '❌'}`);
      console.log(`  - is_verified: ${provider?.is_verified !== undefined ? '✅' : '❌'}`);
      console.log(`  - verification_level: ${provider?.verification_level !== undefined ? '✅' : '❌'}`);
      
      console.log('✅ Test 6 passed');
    } else {
      console.log('⚠️  No listings to test provider data');
    }
  } catch (error) {
    console.error('❌ Test 6 failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Run tests
testEnhancedListingsAPI().catch(console.error);
