const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Support both DATABASE_URL (Railway) and individual variables (local)
const isRemote = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');

const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isRemote || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })
  : new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

module.exports = pool;
