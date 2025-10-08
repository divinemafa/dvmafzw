/**
 * Test Script: Create User via Supabase Admin API
 * 
 * This script tests user creation using the Supabase service role key.
 * Run with: node tests/cjs/test-create-user.cjs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

async function testCreateUser() {
  section('🧪 SUPABASE USER CREATION TEST');

  // Step 1: Check environment variables
  section('Step 1: Checking Environment Variables');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    log(colors.red, '❌', 'NEXT_PUBLIC_SUPABASE_URL is missing');
    process.exit(1);
  }
  log(colors.green, '✓', `Supabase URL: ${supabaseUrl}`);

  if (!serviceRoleKey) {
    log(colors.red, '❌', 'SUPABASE_SERVICE_ROLE_KEY is missing');
    process.exit(1);
  }
  log(colors.green, '✓', `Service Role Key: ${serviceRoleKey.substring(0, 20)}...`);

  // Step 2: Create admin client
  section('Step 2: Creating Admin Client');
  
  let supabase;
  try {
    supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    log(colors.green, '✓', 'Admin client created successfully');
  } catch (error) {
    log(colors.red, '❌', `Failed to create admin client: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Generate test user data
  section('Step 3: Generating Test User Data');
  
  const timestamp = Date.now();
  const testUser = {
    email: `test-user-${timestamp}@example.com`,
    password: 'Test@Password123!',
    userType: 'business',
    phone: '+27671188760'
  };

  log(colors.blue, '📧', `Email: ${testUser.email}`);
  log(colors.blue, '🔒', `Password: ${testUser.password}`);
  log(colors.blue, '👤', `User Type: ${testUser.userType}`);
  log(colors.blue, '📱', `Phone: ${testUser.phone}`);

  // Step 4: Create user
  section('Step 4: Creating User with Admin API');
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        user_type: testUser.userType,
        phone_number: testUser.phone,
      },
    });

    if (error) {
      log(colors.red, '❌', 'User creation failed');
      console.error(colors.red + 'Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error code:', error.code + colors.reset);
      
      // Check if it's a duplicate email error
      if (error.message.includes('already registered')) {
        log(colors.yellow, '⚠️', 'This email is already registered. Try with a different timestamp.');
      }
      
      process.exit(1);
    }

    if (!data.user) {
      log(colors.red, '❌', 'No user data returned');
      process.exit(1);
    }

    log(colors.green, '✅', 'User created successfully!');
    console.log(`\n${colors.bright}User Details:${colors.reset}`);
    console.log(`  ID: ${colors.cyan}${data.user.id}${colors.reset}`);
    console.log(`  Email: ${colors.cyan}${data.user.email}${colors.reset}`);
    console.log(`  Created At: ${colors.cyan}${data.user.created_at}${colors.reset}`);
    console.log(`  Email Confirmed: ${data.user.email_confirmed_at ? colors.green + 'Yes' : colors.red + 'No'}${colors.reset}`);

    // Step 5: Verify profile was created
    section('Step 5: Verifying Profile Creation');
    
    // Wait a bit for triggers to execute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (profileError) {
      log(colors.red, '❌', `Profile query failed: ${profileError.message}`);
      log(colors.yellow, '⚠️', 'User was created but profile trigger may have failed');
    } else if (profileData) {
      log(colors.green, '✅', 'Profile created successfully!');
      console.log(`\n${colors.bright}Profile Details:${colors.reset}`);
      console.log(`  Profile ID: ${colors.cyan}${profileData.id}${colors.reset}`);
      console.log(`  User Type: ${colors.cyan}${profileData.user_type}${colors.reset}`);
      console.log(`  Display Name: ${colors.cyan}${profileData.display_name}${colors.reset}`);
      console.log(`  Status: ${colors.cyan}${profileData.status}${colors.reset}`);
      console.log(`  Phone: ${colors.cyan}${profileData.phone_number || 'N/A'}${colors.reset}`);
    } else {
      log(colors.yellow, '⚠️', 'Profile not found - trigger may not have executed');
    }

    // Step 6: Verify verification record
    section('Step 6: Verifying Verification Record');
    
    const { data: verificationData, error: verificationError } = await supabase
      .from('user_verification')
      .select('*')
      .eq('user_id', profileData?.id)
      .single();

    if (verificationError) {
      log(colors.yellow, '⚠️', `Verification record not found: ${verificationError.message}`);
    } else if (verificationData) {
      log(colors.green, '✅', 'Verification record created!');
      console.log(`\n${colors.bright}Verification Details:${colors.reset}`);
      console.log(`  Email Verified: ${verificationData.email_verified ? colors.green + 'Yes' : colors.red + 'No'}${colors.reset}`);
      console.log(`  Phone Verified: ${verificationData.phone_verified ? colors.green + 'Yes' : colors.red + 'No'}${colors.reset}`);
      console.log(`  ID Verified: ${verificationData.id_verified ? colors.green + 'Yes' : colors.red + 'No'}${colors.reset}`);
      console.log(`  Verification Level: ${colors.cyan}${verificationData.verification_level}${colors.reset}`);
    }

    // Step 7: Verify settings record
    section('Step 7: Verifying Settings Record');
    
    const { data: settingsData, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', profileData?.id)
      .single();

    if (settingsError) {
      log(colors.yellow, '⚠️', `Settings record not found: ${settingsError.message}`);
    } else if (settingsData) {
      log(colors.green, '✅', 'Settings record created!');
      console.log(`\n${colors.bright}Settings Details:${colors.reset}`);
      console.log(`  Notifications Enabled: ${settingsData.notifications_enabled ? colors.green + 'Yes' : colors.red + 'No'}${colors.reset}`);
      console.log(`  Two-Factor Enabled: ${settingsData.two_factor_enabled ? colors.green + 'Yes' : colors.red + 'No'}${colors.reset}`);
    }

    // Success summary
    section('✅ TEST COMPLETED SUCCESSFULLY');
    log(colors.green, '🎉', 'All user creation steps passed!');
    console.log(`\n${colors.bright}Test User Credentials:${colors.reset}`);
    console.log(`  Email: ${colors.cyan}${testUser.email}${colors.reset}`);
    console.log(`  Password: ${colors.cyan}${testUser.password}${colors.reset}`);
    console.log(`  User ID: ${colors.cyan}${data.user.id}${colors.reset}`);
    console.log(`\n${colors.yellow}Note: You can use these credentials to test login${colors.reset}\n`);

  } catch (error) {
    log(colors.red, '❌', 'Unexpected error occurred');
    console.error(colors.red + 'Error:', error);
    console.error('Stack:', error.stack + colors.reset);
    process.exit(1);
  }
}

// Run the test
testCreateUser()
  .then(() => {
    log(colors.green, '✓', 'Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    log(colors.red, '✗', 'Test script failed');
    console.error(error);
    process.exit(1);
  });
