/**
 * Audit Supabase auth triggers and functions.
 *
 * Attempts to list all non-internal triggers, their target tables, and the
 * function definitions. Highlights whether each function is SECURITY DEFINER.
 *
 * Run with: node tests/cjs/audit_auth_triggers.cjs
 */

const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load env first, then fall back to literals like our other harness
dotenv.config({ path: path.resolve(__dirname, '../..', '.env.local') });

const FALLBACK_SUPABASE_URL = 'https://swemmmqiaieanqliagkd.supabase.co';
const FALLBACK_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZW1tbXFpYWllYW5xbGlhZ2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY0MDg1MCwiZXhwIjoyMDc1MjE2ODUwfQ.pR3_PtEYdvmUkv9K6M2KHlb_-LHN5mbgXltqg70dULk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY;

const section = (title) => {
  const line = '='.repeat(title.length + 8);
  console.log('\n' + line);
  console.log(`>>> ${title} <<<`);
  console.log(line + '\n');
};

const query = `
  with trigger_data as (
    select
      n.nspname as table_schema,
      c.relname as table_name,
      t.tgname as trigger_name,
      pg_get_triggerdef(t.oid) as trigger_definition,
      p.oid as function_oid,
      fn.nspname as function_schema,
      p.proname as function_name,
      p.prosecdef as is_security_definer,
      pg_get_functiondef(p.oid) as function_definition,
      pg_get_userbyid(p.proowner) as function_owner
    from pg_trigger t
    join pg_class c on t.tgrelid = c.oid
    join pg_namespace n on c.relnamespace = n.oid
    join pg_proc p on t.tgfoid = p.oid
    join pg_namespace fn on p.pronamespace = fn.oid
    where not t.tgisinternal
  )
  select *
  from trigger_data
  order by table_schema, table_name, trigger_name;
`;

async function main() {
  section('CLIENT INITIALISATION');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Service key source:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'env' : 'fallback literal');

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  console.log('✅ Admin client ready');

  section('QUERYING TRIGGERS');
  console.log('Using postgres meta endpoint to enumerate custom triggers...');

  try {
    const health = await fetch(`${supabaseUrl}/postgres/v1/schemas`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    if (!health.ok) {
      const body = await health.text();
      console.error('❌ Unable to reach postgres meta schemas endpoint:', health.status, health.statusText);
      console.error(body);
      process.exit(1);
    }

    console.log('✅ postgres meta schemas endpoint reachable');

    const response = await fetch(`${supabaseUrl}/postgres/v1/query`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Postgres meta request failed:', response.status, response.statusText);
      console.error(text);
      process.exit(1);
    }

    const { result } = await response.json();

    if (!Array.isArray(result)) {
      console.warn('⚠️ Unexpected payload from postgres meta:', result);
      process.exit(1);
    }

    if (result.length === 0) {
      console.log('✅ No custom triggers found.');
      process.exit(0);
    }

    for (const row of result) {
      const {
        table_schema,
        table_name,
        trigger_name,
        trigger_definition,
        function_schema,
        function_name,
        is_security_definer,
        function_owner,
        function_definition
      } = row;

      console.log('Table:', `${table_schema}.${table_name}`);
      console.log('Trigger:', trigger_name);
      console.log('Definition:', trigger_definition);
      console.log('Function:', `${function_schema}.${function_name}`);
      console.log('Function owner:', function_owner);
      console.log('Security definer:', is_security_definer ? '✅ yes' : '❌ no');
      console.log('--- function body start ---');
      console.log(function_definition);
      console.log('--- function body end ---');
      console.log('='.repeat(60));
    }

    process.exit(0);
  } catch (err) {
    console.error('💥 Unexpected error during trigger audit:', err);
    process.exit(1);
  }
}

main();
