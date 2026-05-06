-- Database initialization script for MediVault

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- In production, ensure passwords are hashed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labs table
CREATE TABLE IF NOT EXISTS labs (
  id SERIAL PRIMARY KEY,
  lab_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- In production, ensure passwords are hashed
  phone VARCHAR(50),
  address TEXT,
  license_number VARCHAR(100) UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create records table
CREATE TABLE IF NOT EXISTS records (
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
);

-- Insert sample data
INSERT INTO patients (patient_id, first_name, last_name, email, password, created_at)
VALUES ('john1681234567', 'John', 'Doe', 'john@example.com', 'Password123!', '2023-12-15T10:30:00.000Z');

INSERT INTO labs (lab_name, email, password, license_number, created_at)
VALUES ('City Medical Laboratory', 'citylab@example.com', 'LabPassword123!', 'LIC12345', '2023-11-24T14:15:00.000Z');

INSERT INTO records (title, date, provider, doctor, type, category, created_at, owner, patient_id, lab_id)
VALUES ('Annual Physical Examination', '2023-12-15', 'General Hospital', 'Dr. Sarah Johnson', 'Examination', 'General', '2023-12-15T10:30:00.000Z', 'user', 'john1681234567', NULL);

INSERT INTO records (title, date, provider, doctor, type, category, created_at, owner, patient_id, lab_id)
VALUES ('COVID-19 PCR Test', '2023-11-24', 'City Medical Lab', 'Dr. Michael Chen', 'Laboratory', 'Infectious Disease', '2023-11-24T14:15:00.000Z', 'pathlab', 'john1681234567', 1);

