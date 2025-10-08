const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sqlPath = path.resolve(__dirname, '../supabase/storage_buckets_setup.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

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

(async () => {
  try {
    await client.connect();
    await client.query('begin');
    await client.query(sql);
    await client.query('commit');
    console.log('Storage bucket setup script applied successfully.');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    console.error('Failed to apply storage bucket setup script:', error);
  } finally {
    await client.end();
  }
})();
