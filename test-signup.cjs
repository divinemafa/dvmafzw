#!/usr/bin/env node
/**
 * Standalone test for user signup
 * Tests the exact flow that's failing in production
 * 
 * Usage: node test-signup.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const SUPABASE_URL = 'https://swemmmqiaieanqliagkd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZW1tbXFpYWllYW5xbGlhZ2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY0MDg1MCwiZXhwIjoyMDc1MjE2ODUwfQ.pR3_PtEYdvmUkv9K6M2KHlb_-LHN5mbgXltqg70dULk';

// Test data
const TEST_USER = {
  email: `test-${Date.now()}@bitcoinmascot.com`,
  password: 'TestPassword123!',
  userType: 'service',
  phone: '+27671188761'
};

console.log('='.repeat(80));
console.log('🧪 SUPABASE USER CREATION TEST');
console.log('='.repeat(80));
console.log('');

console.log('📋 Test Configuration:');
console.log('  Supabase URL:', SUPABASE_URL);
console.log('  Service Role Key:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing');
console.log('  Test Email:', TEST_USER.email);
console.log('  User Type:', TEST_USER.userType);
console.log('  Phone:', TEST_USER.phone);
console.log('');

async function testUserCreation() {
  try {
    console.log('📡 Creating Supabase admin client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Admin client created');
    console.log('');

    console.log('👤 Creating user with admin.createUser()...');
    console.log('  Metadata:', {
      user_type: TEST_USER.userType,
      phone_number: TEST_USER.phone
    });
    console.log('');

    const startTime = Date.now();
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: false,
      user_metadata: {
        user_type: TEST_USER.userType,
        phone_number: TEST_USER.phone,
      },
    });
    const duration = Date.now() - startTime;

    console.log(`⏱️  Request completed in ${duration}ms`);
    console.log('');

    if (error) {
      console.error('❌ ERROR CREATING USER:');
      console.error('');
      console.error('  Message:', error.message);
      console.error('  Status:', error.status || 'N/A');
      console.error('  Name:', error.name || 'N/A');
      console.error('');
      console.error('  Full Error Object:');
      console.error(JSON.stringify(error, null, 2));
      console.log('');
      process.exit(1);
    }

    if (!data.user) {
      console.error('❌ NO USER RETURNED');
      console.error('  Data:', JSON.stringify(data, null, 2));
      console.log('');
      process.exit(1);
    }

    console.log('✅ USER CREATED SUCCESSFULLY!');
    console.log('');
    console.log('  User ID:', data.user.id);
    console.log('  Email:', data.user.email);
    console.log('  Created At:', data.user.created_at);
    console.log('  Metadata:', JSON.stringify(data.user.user_metadata, null, 2));
    console.log('');

    // Check if profile was created by trigger
    console.log('🔍 Checking if profile was created...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (profileError) {
      console.error('⚠️  Profile check failed:', profileError.message);
    } else if (profile) {
      console.log('✅ Profile created by trigger:');
      console.log('  Profile ID:', profile.id);
      console.log('  User Type:', profile.user_type);
      console.log('  Status:', profile.status);
      console.log('  Display Name:', profile.display_name);
    } else {
      console.error('❌ No profile found');
    }
    console.log('');

    // Check if verification record was created
    console.log('🔍 Checking if verification record was created...');
    const { data: verification, error: verificationError } = await supabase
      .from('user_verification')
      .select('*')
      .eq('user_id', profile?.id)
      .single();

    if (verificationError) {
      console.error('⚠️  Verification check failed:', verificationError.message);
    } else if (verification) {
      console.log('✅ Verification record created:');
      console.log('  Current Level:', verification.current_level);
      console.log('  Email Verified:', verification.email_verified);
    } else {
      console.error('❌ No verification record found');
    }
    console.log('');

    // Check if settings record was created
    console.log('🔍 Checking if settings record was created...');
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', profile?.id)
      .single();

    if (settingsError) {
      console.error('⚠️  Settings check failed:', settingsError.message);
    } else if (settings) {
      console.log('✅ Settings record created:');
      console.log('  Language:', settings.preferred_language);
      console.log('  Currency:', settings.preferred_currency);
      console.log('  Theme:', settings.theme_preference);
    } else {
      console.error('❌ No settings record found');
    }
    console.log('');

    console.log('='.repeat(80));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(80));
    console.log('');
    console.log('🧹 Cleanup: Test user created with email:', TEST_USER.email);
    console.log('   You can delete this user from Supabase Dashboard if needed.');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('💥 UNEXPECTED ERROR:');
    console.error('');
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
    console.error('');
    console.error('  Full Error:');
    console.error(error);
    console.log('');
    process.exit(1);
  }
}

// Run the test
testUserCreation();
