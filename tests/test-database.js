/**
 * Database Connection Test Script
 * 
 * Tests direct connection to Supabase and checks database state
 * Run with: node tests/test-database.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('============================================================');
console.log('TESTING DATABASE CONNECTION');
console.log('============================================================\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('\n-----------------------------------------------------------\n');

async function testDatabase() {
  try {
    // Create admin client
    console.log('🔌 Creating Supabase admin client...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    console.log('✅ Client created\n');

    // Test 1: Check user_type enum
    console.log('📝 TEST 1: Check user_type enum values');
    console.log('-----------------------------------------------------------');
    const { data: enumData, error: enumError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT enumlabel 
          FROM pg_enum 
          WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')
          ORDER BY enumsortorder
        `
      })
      .catch(() => {
        // Fallback: Try direct query if RPC doesn't exist
        return supabase.from('profiles').select('user_type').limit(0);
      });

    if (!enumError && enumData) {
      console.log('✅ user_type enum exists');
    } else {
      console.log('⚠️ Could not verify enum (might need direct database access)');
    }
    console.log('');

    // Test 2: Count existing users
    console.log('📝 TEST 2: Count existing profiles');
    console.log('-----------------------------------------------------------');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Error counting profiles:', countError.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('Total profiles:', count);
    }
    console.log('');

    // Test 3: Try creating a test user
    console.log('📝 TEST 3: Create test user with admin.createUser');
    console.log('-----------------------------------------------------------');
    const testEmail = `test${Date.now()}@example.com`;
    console.log('Test email:', testEmail);
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123',
      email_confirm: false,
      user_metadata: {
        user_type: 'business',
        phone_number: '+27821234567',
      },
    });

    if (userError) {
      console.log('❌ Error creating user:', userError.message);
      console.log('Error details:', JSON.stringify(userError, null, 2));
    } else {
      console.log('✅ User created successfully!');
      console.log('User ID:', userData.user.id);
      console.log('User metadata:', userData.user.user_metadata);
      
      // Check if profile was created
      console.log('\n📝 TEST 4: Check if profile was created by trigger');
      console.log('-----------------------------------------------------------');
      
      // Wait a moment for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userData.user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile NOT created by trigger!');
        console.log('Error:', profileError.message);
        console.log('\n🔍 This is the problem! The trigger is not working.');
      } else {
        console.log('✅ Profile created by trigger!');
        console.log('Profile data:', JSON.stringify(profile, null, 2));
      }
      
      // Cleanup: Delete test user
      console.log('\n🧹 Cleaning up test user...');
      await supabase.auth.admin.deleteUser(userData.user.id);
      console.log('✅ Test user deleted');
    }

    console.log('\n============================================================');
    console.log('TEST COMPLETE');
    console.log('============================================================\n');

  } catch (error) {
    console.log('\n❌ EXCEPTION:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDatabase();
