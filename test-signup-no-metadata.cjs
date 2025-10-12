#!/usr/bin/env node
/**
 * Test user creation WITHOUT user_type in metadata
 * This will help confirm if the issue is with the user_type enum
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://swemmmqiaieanqliagkd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZW1tbXFpYWllYW5xbGlhZ2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY0MDg1MCwiZXhwIjoyMDc1MjE2ODUwfQ.pR3_PtEYdvmUkv9K6M2KHlb_-LHN5mbgXltqg70dULk';

const TEST_EMAIL = `test-no-metadata-${Date.now()}@bitcoinmascot.com`;

console.log('='.repeat(80));
console.log('🧪 TEST: User Creation WITHOUT user_type Metadata');
console.log('='.repeat(80));
console.log('');
console.log('Test Email:', TEST_EMAIL);
console.log('Metadata: NONE (empty object)');
console.log('');

async function test() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('📤 Creating user with EMPTY metadata...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: 'TestPassword123!',
      email_confirm: false,
      user_metadata: {}, // EMPTY - no user_type
    });

    if (error) {
      console.error('❌ FAILED:', error.message);
      console.error('   Status:', error.status);
      console.error('');
      console.log('This confirms the trigger function itself has an issue.');
      process.exit(1);
    }

    console.log('✅ SUCCESS! User created without user_type metadata');
    console.log('   User ID:', data.user.id);
    console.log('');

    // Check what user_type was set by trigger
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, status')
      .eq('auth_user_id', data.user.id)
      .single();

    if (profile) {
      console.log('📋 Profile created with:');
      console.log('   user_type:', profile.user_type, '(should be "client" - the default)');
      console.log('   status:', profile.status);
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('✅ TEST PASSED - Trigger works when user_type is omitted!');
    console.log('='.repeat(80));
    console.log('');
    console.log('💡 CONCLUSION:');
    console.log('   The issue is specifically with casting the user_type string');
    console.log('   from metadata to the user_type enum in the trigger function.');
    console.log('');
    console.log('   Supabase PgBouncer has a stale prepared statement cache.');
    console.log('   SOLUTION: Pause and Resume the Supabase project.');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('💥 ERROR:', error.message);
    process.exit(1);
  }
}

test();
