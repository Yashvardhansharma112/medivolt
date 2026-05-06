const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: false,
      }
);

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client to connect to database:', err.stack);
  }
  console.log('Successfully connected to the PostgreSQL database!');
  release();
});

module.exports = pool;