/**
 * Test API Routes with Anonymous Access
 * 
 * Tests the actual Next.js API routes to ensure they work without authentication
 * 
 * Run: node tests/test-api-anonymous.cjs
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

console.log('🧪 Testing API Routes (Anonymous Access)\n');
console.log('═══════════════════════════════════════\n');
console.log(`Base URL: ${BASE_URL}\n`);

async function fetchAPI(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (err) {
          resolve({ status: res.statusCode, data, error: 'Invalid JSON' });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testAPIRoutes() {
  let allPassed = true;

  // Test 1: Categories API
  console.log('📋 Test 1: GET /api/categories');
  console.log('─────────────────────────────────────');
  try {
    const result = await fetchAPI('/api/categories');
    
    if (result.status === 200 && result.data.success) {
      console.log(`✅ PASSED: ${result.data.categories?.length || 0} categories fetched`);
      if (result.data.categories && result.data.categories.length > 0) {
        console.log(`   Sample: ${result.data.categories[0].name}`);
      }
    } else {
      console.error(`❌ FAILED: Status ${result.status}`);
      console.error('   Response:', JSON.stringify(result.data, null, 2));
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    allPassed = false;
  }
  console.log('');

  // Test 2: Listings API
  console.log('📦 Test 2: GET /api/listings?status=active');
  console.log('─────────────────────────────────────');
  try {
    const result = await fetchAPI('/api/listings?status=active&page=1&limit=5');
    
    if (result.status === 200 && result.data.success) {
      console.log(`✅ PASSED: ${result.data.listings?.length || 0} listings fetched`);
      if (result.data.listings && result.data.listings.length > 0) {
        console.log(`   Sample: "${result.data.listings[0].title}"`);
      }
    } else {
      console.error(`❌ FAILED: Status ${result.status}`);
      console.error('   Response:', JSON.stringify(result.data, null, 2));
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    allPassed = false;
  }
  console.log('');

  // Test 3: Listing by Slug API
  console.log('🔍 Test 3: GET /api/listings/slug/[slug]');
  console.log('─────────────────────────────────────');
  try {
    // First get a slug
    const listingsResult = await fetchAPI('/api/listings?status=active&limit=1');
    
    if (listingsResult.data.listings && listingsResult.data.listings.length > 0) {
      const slug = listingsResult.data.listings[0].slug;
      const result = await fetchAPI(`/api/listings/slug/${slug}`);
      
      if (result.status === 200 && result.data.success) {
        console.log(`✅ PASSED: Fetched listing "${result.data.listing.title}"`);
        console.log(`   Slug: ${result.data.listing.slug}`);
        console.log(`   Provider: ${result.data.listing.provider?.display_name || 'N/A'}`);
      } else {
        console.error(`❌ FAILED: Status ${result.status}`);
        console.error('   Response:', JSON.stringify(result.data, null, 2));
        allPassed = false;
      }
    } else {
      console.log('⚠️  SKIPPED: No listings available to test');
    }
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    allPassed = false;
  }
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════');
  if (allPassed) {
    console.log('✅ ALL API TESTS PASSED');
    console.log('');
    console.log('API routes are working correctly!');
    console.log('Anonymous users can access marketplace through APIs.');
  } else {
    console.log('❌ SOME API TESTS FAILED');
    console.log('');
    console.log('Check that the dev server is running: npm run dev');
    console.log('Or test against production URL.');
  }
  console.log('═══════════════════════════════════════');
}

testAPIRoutes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
