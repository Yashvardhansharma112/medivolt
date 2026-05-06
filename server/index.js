const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Import the database connection pool
const pool = require('./db');
const runMigrations = require('./migrate');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check for EB load balancer
app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// View file endpoint
app.get('/view/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  console.log('Trying to serve:', filePath); // Debugging line
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath); // Debugging line
    return res.status(404).send('File not found');
  }
  // Set Content-Disposition to inline for browser viewing
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filePath);
});

// Download file endpoint
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  res.download(filePath); // This sets Content-Disposition: attachment
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Create the 'uploads' folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Run all DB migrations on startup (idempotent)
runMigrations();
// Helper function to generate patient ID
const generatePatientId = (firstName) => {
  const timestamp = Date.now();
  return `${firstName.toLowerCase()}${timestamp}`;
};

// Email transporter configuration (using Gmail SMTP - free and fast)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your Gmail app password
  }
});

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

// Authentication endpoints
app.post('/api/auth/patient/register', async (req, res) => {
  try {
        const { firstName, lastName, email, password } = req.body;
    console.log('Request body:', req.body);
    
    // Check if email already exists
    const existingUser = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Generate patient ID
    const patientId = generatePatientId(firstName);
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert patient
    const query = `
      INSERT INTO patients (patient_id, first_name, last_name, email, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, patient_id, first_name, last_name, email, created_at
    `;
    
    const values = [patientId, firstName, lastName, email, hashedPassword];
    console.log('Query:', query);
    console.log('Values:', values);
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Patient registered successfully',
      patient: result.rows[0]
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ error: 'Failed to register patient' });
  }
});

app.post('/api/auth/lab/register', async (req, res) => {
  try {
        const { labName, email, password, phone, address, licenseNumber, description } = req.body;
    console.log('Request body:', req.body);
    
    // Check if email already exists
    const existingLab = await pool.query('SELECT * FROM labs WHERE email = $1', [email]);
    if (existingLab.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert lab
    const query = `
      INSERT INTO labs (lab_name, email, password, phone, address, license_number, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, lab_name, email, phone, license_number, created_at
    `;
    
    const values = [labName, email, hashedPassword, phone, address, licenseNumber, description];
    console.log('Query:', query);
    console.log('Values:', values);
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Laboratory registered successfully',
      lab: result.rows[0]
    });
  } catch (error) {
    console.error('Error registering laboratory:', error);
    res.status(500).json({ error: 'Failed to register laboratory' });
  }
});

app.post('/api/auth/patient/login', async (req, res) => {
  try {
        const { email, password } = req.body;
    console.log('Request body:', req.body);
    
    // Find patient by email
    const result = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const patient = result.rows[0];
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, patient.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Return patient data (excluding password)
    const { password: _, ...patientData } = patient;
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        ...patientData,
        role: 'patient'
      }
    });
  } catch (error) {
    console.error('Error logging in patient:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/auth/lab/login', async (req, res) => {
  try {
        const { email, password } = req.body;
    
    // Find lab by email
    const result = await pool.query('SELECT * FROM labs WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const lab = result.rows[0];
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, lab.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Return lab data (excluding password)
    const { password: _, ...labData } = lab;
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        ...labData,
        role: 'pathlab', // Ensure role is set
      },
    });
  } catch (error) {
    console.error('Error logging in laboratory:', error);
    res.status(500).json({ error: 'Failed to login' });
  }

});

// Password reset endpoints
app.post('/api/auth/password-reset-request', async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    if (!['patient', 'lab'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const tableName = role === 'patient' ? 'patients' : 'labs';
    const userResult = await pool.query(`SELECT * FROM ${tableName} WHERE email = $1`, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP with expiration (5 minutes)
    const key = `${role}:${email}`;
    otpStore.set(key, {
      otp,
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    });

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - MediVault',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">MediVault Password Reset</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password. Your OTP is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc2626; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>MediVault Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/auth/password-reset', async (req, res) => {
  try {
    const { email, role, otp, newPassword } = req.body;

    if (!email || !role || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['patient', 'lab'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check OTP
    const key = `${role}:${email}`;
    const storedOtpData = otpStore.get(key);

    if (!storedOtpData) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const tableName = role === 'patient' ? 'patients' : 'labs';
    await pool.query(`UPDATE ${tableName} SET password = $1 WHERE email = $2`, [hashedPassword, email]);

    // Clear OTP
    otpStore.delete(key);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Records API endpoints
app.get('/api/records', async (req, res) => {
  const { userRole, labId, patientId } = req.query;

  try {
    let query = '';
    let values = [];

    if (userRole === 'pathlab') {
      query = 'SELECT * FROM records WHERE lab_id = $1 ORDER BY created_at DESC';
      values = [labId];
    } else if (userRole === 'patient') {
      query = 'SELECT * FROM records WHERE patient_id = $1 ORDER BY created_at DESC';
      values = [patientId];
    }

    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.get('/api/records/patient/:patientId', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { patientId } = req.params;
    console.log('Querying patient with ID:', patientId);
    const result = await pool.query(
     'SELECT r.*, l.lab_name FROM records r LEFT JOIN labs l ON r.lab_id = l.id WHERE r.patient_id = $1 ORDER BY r.created_at DESC',
      [patientId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching patient records:', error);
    res.status(500).json({ error: 'Failed to fetch patient records' });
  }
});

app.get('/api/records/lab/:labId', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { labId } = req.params;

    if (!labId || isNaN(labId)) {
      return res.status(400).json({ error: 'Invalid lab ID' });
    }

    const result = await pool.query(
      'SELECT r.*, p.first_name, p.last_name FROM records r JOIN patients p ON r.patient_id = p.patient_id WHERE r.lab_id = $1 ORDER BY r.created_at DESC',
      [labId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching lab records:', error);
    res.status(500).json({ error: 'Failed to fetch lab records' });
  }
});

app.post('/api/records', upload.single('file'), async (req, res) => {
  console.log('Request body:', req.body); // Debugging
  console.log('Uploaded file:', req.file); // Debugging

  try {
  // Support both snake_case (from form data) and camelCase (from JSON) field names
  const { title, date, provider, doctor, type, category, notes, owner, labId, lab_id } = req.body;
  const patientId = req.body.patient_id || req.body.patientId || null;
  const labIdValue = lab_id || labId || null;

    const fileName = req.file ? req.file.filename : null;
    const fileSize = req.file ? req.file.size : null;

    // Insert record into the database
    const query = `
      INSERT INTO records (title, date, provider, doctor, type, category, notes, file_name, file_size, owner, patient_id, lab_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
  const values = [title, date, provider, doctor, type, category, notes, fileName, fileSize, owner, patientId, labIdValue];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).json({ error: 'Failed to insert record' });
  }
});

// Persist a prediction result (from frontend after calling ML service)
app.post('/api/predictions', async (req, res) => {
  try {
    const { patient_id, record_id, lab_id, final_score, scores } = req.body;

    // Insert new prediction row (allows multiple predictions per patient)
    const query = `
      INSERT INTO predictions (patient_id, record_id, lab_id, final_score, scores, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const values = [patient_id || null, record_id || null, lab_id || null, final_score, scores ? JSON.stringify(scores) : null];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting prediction:', error);
    res.status(500).json({ error: 'Failed to save prediction' });
  }
});

// Get predictions for a record
app.get('/api/predictions/record/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const result = await pool.query('SELECT * FROM predictions WHERE record_id = $1 ORDER BY created_at DESC', [recordId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching predictions for record:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Get predictions for a patient (all records)
app.get('/api/predictions/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query('SELECT * FROM predictions WHERE patient_id = $1 ORDER BY created_at ASC', [patientId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching predictions for patient:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Get all predictions (for dashboard aggregation)
app.get('/api/predictions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM predictions ORDER BY updated_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching all predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

app.get('/api/records/:id', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM records WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const record = result.rows[0];
    console.log('File path:', path.join(__dirname, 'uploads', record.file_name));
    res.status(200).json(record);
  } catch (error) {
    console.error('Error fetching record by ID:', error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// Delete record by ID
app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM records WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const record = result.rows[0];
    
    // Delete the file from uploads folder if it exists
    if (record.file_name) {
      const filePath = path.join(__dirname, 'uploads', record.file_name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted file:', filePath);
      }
    }
    
    // Delete associated predictions for this record
    await pool.query('DELETE FROM predictions WHERE record_id = $1', [id]);
    
    // Delete the record from database
    await pool.query('DELETE FROM records WHERE id = $1', [id]);
    
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// Patient verification endpoint for labs by email
app.get('/api/patients/verify', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email is required' });
    }

    const result = await pool.query(
      'SELECT patient_id, first_name, last_name FROM patients WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error verifying patient:', error);
    res.status(500).json({ error: 'Failed to verify patient' });
  }
});

// Get patient by ID
app.get('/api/patients/:id', async (req, res) => {
  try {
        const { id } = req.params;
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const patient = result.rows[0];
    delete patient.password; // Don't send password
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient data' });
  }
});

// Update patient
app.put('/api/patients/:id', async (req, res) => {
  try {
        const { id } = req.params;
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this endpoint
    
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE patients 
      SET ${setClause} 
      WHERE id = $${fields.length + 1} 
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const patient = result.rows[0];
    delete patient.password;
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient data' });
  }
});

// Get lab by ID
app.get('/api/labs/:id', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM labs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Laboratory not found' });
    }
    
    const lab = result.rows[0];
    delete lab.password;
    res.status(200).json(lab);
  } catch (error) {
    console.error('Error fetching laboratory:', error);
    res.status(500).json({ error: 'Failed to fetch laboratory data' });
  }
});

// Update lab
app.put('/api/labs/:id', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { id } = req.params;
    const updates = req.body;
    delete updates.password;
    
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE labs 
      SET ${setClause} 
      WHERE id = $${fields.length + 1} 
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Laboratory not found' });
    }
    
    const lab = result.rows[0];
    delete lab.password;
    res.status(200).json(lab);
  } catch (error) {
    console.error('Error updating laboratory:', error);
    res.status(500).json({ error: 'Failed to update laboratory data' });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
