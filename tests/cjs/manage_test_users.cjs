/**
 * Manage Test Users - CommonJS harness for Supabase auth debugging
 *
 * This script demonstrates how to:
 *   • validate environment configuration
 *   • create a temporary user with the service role key
 *   • confirm profile/metadata state using both admin + anon clients
 *   • clean up the created user to keep the auth table tidy
 *
 * Run with: node tests/cjs/manage_test_users.cjs
 */

const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local relative to repo root
dotenv.config({ path: path.resolve(__dirname, '../..', '.env.local') });

const FALLBACK_SUPABASE_URL = 'https://swemmmqiaieanqliagkd.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZW1tbXFpYWllYW5xbGlhZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDA4NTAsImV4cCI6MjA3NTIxNjg1MH0.75D2NQFo8pFQ93SRY3YZ3_I9S7eC33B6S_e84dkNPlc';
const FALLBACK_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZW1tbXFpYWllYW5xbGlhZ2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY0MDg1MCwiZXhwIjoyMDc1MjE2ODUwfQ.pR3_PtEYdvmUkv9K6M2KHlb_-LHN5mbgXltqg70dULk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY;

const section = (title) => {
  const divider = '='.repeat(title.length + 8);
  console.log('\n' + divider);
  console.log(`>>> ${title} <<<`);
  console.log(divider + '\n');
};

const validateEnv = () => {
  section('ENVIRONMENT VALIDATION');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('⚠️  Using fallback Supabase URL (env missing)');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️  Using fallback anon key (env missing)');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  Using fallback service role key (env missing)');
  }
  console.log('✅ Supabase URL in use:', supabaseUrl);
  console.log('🔑 Anon key source:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'env' : 'fallback literal');
  console.log('🛡️  Service role key source:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'env' : 'fallback literal');
};

const createSupabaseClients = () => {
  section('CLIENT INITIALISATION');
  const anonClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  console.log('✅ Anon client ready (simulates public app access)');

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  console.log('✅ Admin client ready (service role)');

  return { anonClient, adminClient };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  validateEnv();
  const { anonClient, adminClient } = createSupabaseClients();

  section('CREATE TEMP USER');
  const testEmail = `autotest+${Date.now()}@example.com`;
  try {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: 'TempPass123!',
      email_confirm: true,
      user_metadata: {
        user_type: 'business',
        phone_number: '+27820000000',
        display_name: 'Temp Automation User',
        created_by: 'manage_test_users.cjs'
      }
    });

    if (error) {
      console.error('❌ Failed to create user:', error);
      process.exit(1);
    }

    const userId = data.user.id;
    console.log('✅ Created user', userId, 'with email', testEmail);

    section('CHECK PROFILE VIA ADMIN CLIENT');
    await sleep(1500); // ensure any DB triggers have time to run

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.warn('⚠️  Profile lookup failed:', profileError.message);
    } else if (!profile) {
      console.warn('⚠️  No profile row found for new user');
    } else {
      console.log('✅ Profile row located:', profile);
    }

    section('CHECK PROFILE VIA ANON CLIENT');
    const { data: anonProfile, error: anonError } = await anonClient
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (anonError) {
      console.log('🔒 Anon profile access blocked (expected if RLS active):', anonError.message);
    } else {
      console.log('🔍 Anon client fetched profile:', anonProfile);
    }

    section('CLEANUP - DELETE TEMP USER');
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('❌ Failed to delete temp user:', deleteError.message);
      process.exit(1);
    }
    console.log('✅ Temp user deleted successfully');
    console.log('\n🎉 Test flow complete');
  } catch (err) {
    console.error('💥 Unexpected script error:', err);
    process.exit(1);
  }
};

main();
