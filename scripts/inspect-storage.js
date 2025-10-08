require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase URL or service role key.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'storage',
  },
});

async function main() {
  const { data: listData, error: listError } = await supabase.storage.from('avatars').list('', {
    limit: 10,
    offset: 0,
  });

  if (listError) {
    console.error('Failed to list avatars bucket objects:', listError);
  } else {
    console.log('Sample avatars bucket objects:', listData);
  }

  const { data: coverList, error: coverListError } = await supabase.storage.from('covers').list('', {
    limit: 10,
    offset: 0,
  });

  if (coverListError) {
    console.error('Failed to list covers bucket objects:', coverListError);
  } else {
    console.log('Sample covers bucket objects:', coverList);
  }

  const client = new Client({
    host: 'aws-1-eu-central-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.swemmmqiaieanqliagkd',
    password: 'x3qaJYjrh08voto8',
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  try {
    const result = await client.query(
      "select id, bucket_id, name, owner, created_at from storage.objects where bucket_id = 'avatars' order by created_at desc limit 5;"
    );
    console.log('Recent storage.objects rows:', result.rows);

    const coverObjects = await client.query(
      "select id, bucket_id, name, owner, created_at from storage.objects where bucket_id = 'covers' order by created_at desc limit 5;"
    );
    console.log('Recent cover storage.objects rows:', coverObjects.rows);

    const policies = await client.query(
      "select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check from pg_policies where tablename = 'objects' order by schemaname, policyname;"
    );
    console.log('Current storage.objects policies:', policies.rows);

    const profileResult = await client.query(
      "select id, email, display_name, avatar_url, cover_image_url, updated_at from profiles order by updated_at desc limit 5;"
    );
    console.log('Recent profiles rows (showing image URLs):', profileResult.rows);
  } catch (error) {
    console.error('Failed to query storage.objects via pg client:', error);
  } finally {
    await client.end();
  }
}

main();
