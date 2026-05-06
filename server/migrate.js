/**
 * migrate.js - Runs DB schema creation on startup (idempotent using IF NOT EXISTS)
 * Called automatically when server starts on Render.
 */

const pool = require('./db');

const migrations = [
  // patients table
  `CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,

  // labs table
  `CREATE TABLE IF NOT EXISTS labs (
    id SERIAL PRIMARY KEY,
    lab_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    license_number VARCHAR(100) UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,

  // records table
  `CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    provider VARCHAR(255),
    doctor VARCHAR(255),
    type VARCHAR(100),
    category VARCHAR(100),
    notes TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner VARCHAR(50) NOT NULL,
    patient_id VARCHAR(100) NOT NULL,
    lab_id INTEGER REFERENCES labs(id) ON DELETE SET NULL
  )`,

  // predictions table
  `CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(100),
    record_id INTEGER,
    lab_id INTEGER,
    final_score DECIMAL(5,2),
    scores JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,

  // indexes
  `CREATE INDEX IF NOT EXISTS idx_predictions_patient ON predictions(patient_id)`,
  `CREATE INDEX IF NOT EXISTS idx_predictions_record ON predictions(record_id)`,
];

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  const client = await pool.connect();
  try {
    for (const sql of migrations) {
      await client.query(sql);
    }
    console.log('✅ Database migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    // Don't crash the server — tables may already exist
  } finally {
    client.release();
  }
}

module.exports = runMigrations;
