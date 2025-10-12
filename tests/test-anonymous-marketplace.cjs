/**
 * Test Anonymous Access to Marketplace
 * 
 * This script tests that anonymous users (not logged in) can:
 * 1. Fetch categories
 * 2. Fetch active listings
 * 3. Fetch individual listing by slug
 * 
 * Run: node tests/test-anonymous-marketplace.cjs
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓' : '✗');
  process.exit(1);
}

// Create anonymous Supabase client (no auth)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAnonymousAccess() {
  console.log('🧪 Testing Anonymous Marketplace Access\n');
  console.log('═══════════════════════════════════════\n');

  let allPassed = true;

  // Test 1: Fetch Categories
  console.log('📋 Test 1: Fetch Categories (Anonymous)');
  console.log('─────────────────────────────────────');
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .limit(5);

    if (error) {
      console.error('❌ FAILED:', error.message);
      console.error('   Details:', error);
      allPassed = false;
    } else {
      console.log(`✅ PASSED: Fetched ${categories?.length || 0} categories`);
      if (categories && categories.length > 0) {
        console.log('   Sample:', categories[0].name);
      }
    }
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    allPassed = false;
  }
  console.log('');

  // Test 2: Fetch Active Listings
  console.log('📦 Test 2: Fetch Active Listings (Anonymous)');
  console.log('─────────────────────────────────────');
  try {
    const { data: listings, error } = await supabase
      .from('service_listings')
      .select(`
        id,
        slug,
        title,
        status,
        price,
        provider:profiles(username, display_name)
      `)
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(5);

    if (error) {
      console.error('❌ FAILED:', error.message);
      console.error('   Details:', error);
      allPassed = false;
    } else {
      console.log(`✅ PASSED: Fetched ${listings?.length || 0} listings`);
      if (listings && listings.length > 0) {
        console.log(`   Sample: "${listings[0].title}" (${listings[0].slug})`);
      }
    }
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    allPassed = false;
  }
  console.log('');

  // Test 3: Fetch Listing by Slug
  console.log('🔍 Test 3: Fetch Listing by Slug (Anonymous)');
  console.log('─────────────────────────────────────');
  try {
    // First get a listing slug
    const { data: testListing } = await supabase
      .from('service_listings')
      .select('slug')
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(1)
      .single();

    if (testListing && testListing.slug) {
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
            total_reviews
          )
        `)
        .eq('slug', testListing.slug)
        .eq('status', 'active')
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('❌ FAILED:', error.message);
        console.error('   Details:', error);
        allPassed = false;
      } else {
        console.log(`✅ PASSED: Fetched listing "${listing.title}"`);
        console.log(`   Slug: ${listing.slug}`);
        console.log(`   Provider: ${listing.provider?.display_name || listing.provider?.username}`);
      }
    } else {
      console.log('⚠️  SKIPPED: No active listings found to test');
    }
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    allPassed = false;
  }
  console.log('');

  // Test 4: Check Auth Status
  console.log('🔐 Test 4: Verify Anonymous Status');
  console.log('─────────────────────────────────────');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('⚠️  WARNING: User is authenticated!');
      console.log('   User ID:', user.id);
      console.log('   This test should run as anonymous');
    } else {
      console.log('✅ PASSED: Running as anonymous user (no auth)');
    }
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    allPassed = false;
  }
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════');
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED');
    console.log('');
    console.log('Anonymous marketplace access is working!');
    console.log('Users can browse categories and listings without logging in.');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('');
    console.log('RLS policies may not be configured correctly.');
    console.log('Run these migrations:');
    console.log('  - 20251013000000_fix_categories_rls.sql');
    console.log('  - 20251013000001_fix_listings_rls_grants.sql');
  }
  console.log('═══════════════════════════════════════');
}

// Run tests
testAnonymousAccess()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
