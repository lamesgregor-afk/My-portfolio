import { neon } from '@neondatabase/serverless';

// Create a serverless SQL client.
// @neondatabase/serverless uses HTTP-based queries — safe for serverless
// and handles connection pooling automatically.
const sql = neon(process.env.DATABASE_URL);

export default sql;
