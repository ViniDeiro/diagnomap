/**
 * Script: clean_patients.js
 * Purpose: Remove seeded patients to leave DB clean for flow-generated records.
 */
import pg from 'pg';

const { Client } = pg;

const connStr = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!connStr) {
  console.error('ERROR: POSTGRES_URL_NON_POOLING or POSTGRES_URL must be set.');
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    console.log('Connected. Deleting seeded patients (EXT-0001, EXT-0002)...');
    const { rowCount } = await client.query(
      `DELETE FROM public.patients WHERE external_id IN ($1, $2);`,
      ['EXT-0001', 'EXT-0002']
    );
    console.log(`Deleted rows: ${rowCount}`);

    const { rows } = await client.query('SELECT COUNT(*)::int as count FROM public.patients;');
    console.log(`Remaining patients count: ${rows[0].count}`);
  } catch (err) {
    console.error('Clean failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
