require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Blob } = require('buffer');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
// IMPORTANT: These are loaded from your .env.local file
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Supabase URL and Anon Key are not defined in .env.local');
  process.exit(1);
}
if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
  console.error('Error: TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Helper Functions ---

/**
 * Creates a small, fake PNG file in memory.
 * @returns {Blob} A Blob object representing a 1x1 transparent PNG.
 */
function createFakePngBlob() {
  // A 1x1 transparent PNG file as a base64 string
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const buffer = Buffer.from(base64Png, 'base64');
  return new Blob([buffer], { type: 'image/png' });
}

/**
 * Main test function
 */
async function testAvatarUpload() {
  console.log('--- Starting Avatar Upload Test for Existing User ---');

  // 1. Sign in as the existing test user
  console.log(`Attempting to sign in as: ${TEST_USER_EMAIL}`);

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (signInError) {
    console.error('Test Failed: Could not sign in.');
    console.error(signInError);
    return;
  }

  if (!signInData.user) {
    console.error('Test Failed: User not returned after sign in.');
    return;
  }

  const userId = signInData.user.id;
  console.log(`Successfully signed in as user: ${userId}`);

  // 2. Create a fake file to upload
  const fakeFile = createFakePngBlob();
  const filePath = `${userId}/avatar-${Date.now()}.png`;
  console.log(`Preparing to upload fake PNG to path: avatars/${filePath}`);

  // 3. Attempt to upload the file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, fakeFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/png',
    });

  if (uploadError) {
    console.error('\n--- 🚨 TEST FAILED 🚨 ---');
    console.error('Reason: File upload failed.');
    console.error('Supabase error:', uploadError.message);
    console.log('\nTroubleshooting:');
    console.log('- Ensure the `storage_buckets_setup.sql` script has been run successfully.');
    console.log('- Check that the RLS policies for the `avatars` bucket are active.');
    console.log('- Confirm the RLS insert policy allows the authenticated user to be the owner of the object.');
    console.log(`- File path attempted: ${filePath}`);
    return;
  }

  console.log('\n--- ✅ TEST PASSED ✅ ---');
  console.log('File uploaded successfully!');
  console.log('Full path:', uploadData.path);

  // 4. Clean up: Remove the uploaded file
  console.log('\nCleaning up...');
  const { error: removeError } = await supabase.storage
    .from('avatars')
    .remove([filePath]);

  if (removeError) {
    console.warn('Warning: Failed to clean up and remove test file.');
    console.warn(removeError.message);
  } else {
    console.log('Successfully removed test file from storage.');
  }

  console.log('--- Test Finished ---');
}

// --- Run the test ---
testAvatarUpload();
