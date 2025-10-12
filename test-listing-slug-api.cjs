/**
 * Test Listing Slug API
 * 
 * Tests GET /api/listings/slug/:slug endpoint
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testListingSlugAPI() {
  console.log('🧪 Testing Listing Slug API\n');
  console.log('='.repeat(60));
  
  // First, get a slug from the listings API
  console.log('\n📋 Step 1: Getting a listing slug...');
  try {
    const listingsResponse = await fetch(`${SITE_URL}/api/listings?status=active&limit=1`);
    const listingsData = await listingsResponse.json();
    
    if (!listingsData.success || !listingsData.listings || listingsData.listings.length === 0) {
      console.log('⚠️  No active listings found.');
      return;
    }
    
    const listing = listingsData.listings[0];
    const slug = listing.slug;
    
    console.log(`✅ Found listing: "${listing.title}"`);
    console.log(`   Slug: ${slug}`);
    
    // Test: Fetch listing by slug
    console.log(`\n🔍 Step 2: Fetching listing by slug...`);
    const slugResponse = await fetch(`${SITE_URL}/api/listings/slug/${slug}`);
    const slugData = await slugResponse.json();
    
    console.log(`\nStatus: ${slugResponse.status}`);
    console.log(`Success: ${slugData.success}`);
    
    if (slugData.success && slugData.listing) {
      const { listing } = slugData;
      
      console.log(`\n📊 Listing Data:`);
      console.log(`  - Title: ${listing.title}`);
      console.log(`  - Slug: ${listing.slug}`);
      console.log(`  - Price: ${listing.priceDisplay || `${listing.price} ${listing.currency}`}`);
      console.log(`  - Category: ${listing.category}`);
      console.log(`  - Status: ${listing.status}`);
      console.log(`  - Rating: ${listing.rating.toFixed(1)} ⭐ (${listing.reviews} reviews)`);
      console.log(`  - Views: ${listing.views}`);
      console.log(`  - Location: ${listing.location || 'N/A'}`);
      console.log(`  - Image URL: ${listing.image ? listing.image.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`  - Short Desc: ${listing.shortDescription ? listing.shortDescription.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`  - Features: ${listing.features ? listing.features.length : 0} items`);
      console.log(`  - Tags: ${listing.tags ? listing.tags.join(', ') : 'N/A'}`);
      
      if (listing.provider) {
        console.log(`\n👤 Provider Data:`);
        console.log(`  - Username: @${listing.provider.username}`);
        console.log(`  - Display Name: ${listing.provider.display_name}`);
        console.log(`  - Verified: ${listing.provider.is_verified ? '✅' : '❌'}`);
        console.log(`  - Verification Level: ${listing.provider.verification_level}/4`);
        console.log(`  - Premium: ${listing.provider.is_premium ? '✅' : '❌'}`);
        console.log(`  - Rating: ${listing.provider.rating.toFixed(1)} ⭐`);
        console.log(`  - Total Reviews: ${listing.provider.total_reviews}`);
        console.log(`  - Services Completed: ${listing.provider.services_completed}`);
        console.log(`  - Location: ${listing.provider.location || 'N/A'}`);
        console.log(`  - Response Time: ${listing.provider.response_time}`);
      } else {
        console.log(`\n⚠️  No provider data found`);
      }
      
      console.log('\n✅ Test passed - Slug API working!');
      console.log(`   View at: ${SITE_URL}/market/${slug}`);
    } else {
      console.log(`❌ Test failed: ${slugData.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Listing slug API test completed!\n');
}

// Run test
testListingSlugAPI().catch(console.error);
