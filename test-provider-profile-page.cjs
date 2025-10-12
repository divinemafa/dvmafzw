/**
 * Test Public Provider Profile Page
 * 
 * Tests the /profile/[username] page rendering
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testProviderProfilePage() {
  console.log('🧪 Testing Provider Profile Page\n');
  console.log('='.repeat(60));
  
  // Get a username from listings
  console.log('\n📋 Step 1: Getting a provider username...');
  const listingsResponse = await fetch(`${SITE_URL}/api/listings?status=active&limit=1`);
  const listingsData = await listingsResponse.json();
  
  if (!listingsData.success || !listingsData.listings || listingsData.listings.length === 0) {
    console.log('⚠️  No active listings found.');
    return;
  }
  
  const listing = listingsData.listings[0];
  const providerUsername = listing.provider?.username;
  
  if (!providerUsername) {
    console.log('⚠️  Provider has no username.');
    return;
  }
  
  console.log(`✅ Found provider: @${providerUsername}`);
  
  // Test: Fetch profile page HTML
  console.log(`\n🌐 Test: Loading profile page for @${providerUsername}`);
  console.log(`   URL: ${SITE_URL}/profile/${providerUsername}`);
  
  try {
    const response = await fetch(`${SITE_URL}/profile/${providerUsername}`);
    
    console.log(`\nStatus: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      const html = await response.text();
      
      // Check for key elements in HTML
      const checks = {
        'Has provider name': html.includes(listing.provider.display_name),
        'Has username': html.includes(`@${providerUsername}`),
        'Has rating': html.includes('rating'),
        'Has back button': html.includes('Back to marketplace'),
        'Has active listings section': html.includes('Active Listings'),
      };
      
      console.log('\n📊 Page Content Checks:');
      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`  ${passed ? '✅' : '❌'} ${check}`);
      });
      
      const allPassed = Object.values(checks).every(v => v);
      if (allPassed) {
        console.log('\n✅ Provider profile page rendered successfully!');
        console.log(`   View at: ${SITE_URL}/profile/${providerUsername}`);
      } else {
        console.log('\n⚠️  Some checks failed, but page loaded.');
      }
    } else {
      console.log(`❌ Failed to load profile page: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Provider profile page test completed!\n');
}

// Run test
testProviderProfilePage().catch(console.error);
