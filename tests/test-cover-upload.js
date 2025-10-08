require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Blob } = require('buffer');

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

function createWidePngBlob() {
  const base64Png =
    'iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAABAf7ccAAAACXBIWXMAAAsTAAALEwEAmpwYAAABFUlEQVR42u2XMU4DMQxFX10H0iAJpAHqAFqABngiHUKAF2gCtUPIJSKNfYZ7vOux0mbqlnX4W2en335nzOTyQSE41YCLC7FWynAExdoj6aACfA6WATAAQkET0Bp8CMgFgCkgS1KoyYo6R69hQVWgDYCrgSjqmXkXpv0VGxgHL5pXu4InlinebVnx0+u1600ildHEFosl4fsLxJraWQSj0qlSAIWliWeX61Y6XQ6n5EjU6nUfV4vEImk3G43G0+k0Wr/f74nFYvHs7HR6fRVaLNYLB7/s7KyZDKZTKfT6GCz2UwzUajcby+V6vQ6fXx7PZVLpdDjezqdfrtbrdYjFYtXpdDq9Xq8/lMoFEJm81mM1muVyuf32N7/dLpdIppVJ43mAwmEwmEwmk0qlwnU63XdiagUjn88nk8nk8nk/p8Pj6PT6azWbz2Ww2Wq3WryfmP7n6BUz8DLp1UiaAAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64Png, 'base64');
  return new Blob([buffer], { type: 'image/png' });
}

async function testCoverUpload() {
  console.log('--- Starting Cover Upload Test for Existing User ---');
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

  const fakeFile = createWidePngBlob();
  const filePath = `${userId}/cover-${Date.now()}.png`;
  console.log(`Preparing to upload fake PNG to path: covers/${filePath}`);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('covers')
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
    console.log('- Check that the RLS policies for the `covers` bucket are active.');
    console.log('- Confirm the RLS insert policy allows the authenticated user to be the owner of the object.');
    console.log(`- File path attempted: ${filePath}`);
    return;
  }

  console.log('\n--- ✅ TEST PASSED ✅ ---');
  console.log('File uploaded successfully!');
  console.log('Full path:', uploadData.path);

  const { error: removeError } = await supabase.storage
    .from('covers')
    .remove([filePath]);

  if (removeError) {
    console.warn('Warning: Failed to clean up and remove test file.');
    console.warn(removeError.message);
  } else {
    console.log('Successfully removed test file from storage.');
  }

  console.log('--- Test Finished ---');
}

testCoverUpload();
