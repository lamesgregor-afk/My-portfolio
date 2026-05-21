// Run: node db/migrate.js
// Make sure DATABASE_URL is set in your environment or .env file

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import 'dotenv/config';

const require = createRequire(import.meta.url);
const { Client } = require('pg');

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await client.query(sql);

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
