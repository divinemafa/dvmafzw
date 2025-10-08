require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase URL or service role key.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const buffer = Buffer.from(base64Png, 'base64');
  const path = `service-test-${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, buffer, {
      upsert: false,
  contentType: 'image/png',
    });

  if (uploadError) {
    console.error('Service upload failed:', uploadError.message);
    return;
  }

  console.log('Service upload succeeded at path:', path);

  const { error: removeError } = await supabase.storage
    .from('avatars')
    .remove([path]);

  if (removeError) {
    console.warn('Failed to remove service test object:', removeError.message);
  } else {
    console.log('Service test object removed.');
  }
}

main();
