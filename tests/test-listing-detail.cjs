/**
 * Test Listing Detail Page Data Fetching
 * Tests the database query used by the listing detail page
 * 
 * Run: node tests/test-listing-detail.cjs
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testListingDetail() {
  console.log('🧪 Testing Listing Detail Page Data Fetch\n');
  console.log('═══════════════════════════════════════\n');

  // First, get a test slug
  console.log('📋 Step 1: Get a test listing slug');
  console.log('─────────────────────────────────────');
  
  const { data: testListings } = await supabase
    .from('service_listings')
    .select('slug, title')
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(1);

  if (!testListings || testListings.length === 0) {
    console.log('❌ No active listings found to test');
    process.exit(1);
  }

  const testSlug = testListings[0].slug;
  console.log(`✅ Found test listing: "${testListings[0].title}"`);
  console.log(`   Slug: ${testSlug}\n`);

  // Test the actual query used by the page
  console.log('🔍 Step 2: Fetch full listing details (as page does)');
  console.log('─────────────────────────────────────');
  
  try {
    const { data: listing, error } = await supabase
      .from('service_listings')
      .select(`
        *,
        provider:profiles(
          id,
          username,
          display_name,
          avatar_url,
          rating,
          total_reviews,
          is_verified,
          verification_level
        )
      `)
      .eq('slug', testSlug)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('❌ FAILED:', error.message);
      console.error('   Details:', error);
      process.exit(1);
    }

    console.log('✅ SUCCESS: Listing fetched successfully');
    console.log(`   Title: ${listing.title}`);
    console.log(`   ID: ${listing.id}`);
    console.log(`   Slug: ${listing.slug}`);
    console.log(`   Provider: ${listing.provider?.display_name || listing.provider?.username || 'N/A'}`);
    console.log(`   Price: ${listing.price_display || listing.price}`);
    console.log(`   Status: ${listing.status}`);
    console.log('');

    // Verify all required fields exist
    console.log('✅ Step 3: Verify required fields');
    console.log('─────────────────────────────────────');
    
    const requiredFields = [
      'id', 'slug', 'title', 'short_description', 
      'price', 'status', 'provider'
    ];
    
    let allFieldsPresent = true;
    requiredFields.forEach(field => {
      const value = listing[field];
      const exists = value !== null && value !== undefined;
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${field}: ${exists ? 'Present' : 'MISSING'}`);
      if (!exists) allFieldsPresent = false;
    });
    
    console.log('');

    if (allFieldsPresent) {
      console.log('═══════════════════════════════════════');
      console.log('✅ ALL TESTS PASSED');
      console.log('');
      console.log('The listing detail page should work correctly!');
      console.log(`Test URL: /market/${testSlug}`);
      console.log('═══════════════════════════════════════');
    } else {
      console.log('═══════════════════════════════════════');
      console.log('⚠️  MISSING FIELDS DETECTED');
      console.log('Some required fields are missing.');
      console.log('═══════════════════════════════════════');
    }

  } catch (err) {
    console.error('❌ FAILED:', err.message);
    process.exit(1);
  }
}

testListingDetail()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
