import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Log the environment variables for debugging
console.log('DB Configuration:', {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ? '(password hidden)' : 'No password',
  database: process.env.DB_DATABASE || 'organ_finder',
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1920',
  database: process.env.DB_DATABASE || 'organ_finder',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

// Initialize database tables if needed
export async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create donors table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS donors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        blood_type VARCHAR(10) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        organ_type VARCHAR(50) NOT NULL,
        medical_history TEXT,
        emergency_contact VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create recipients table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        blood_type VARCHAR(10) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        organ_needed VARCHAR(50) NOT NULL,
        medical_condition TEXT,
        urgency_level VARCHAR(20) NOT NULL,
        hospital_affiliated VARCHAR(100),
        doctor_name VARCHAR(100),
        insurance_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create hospital_contacts table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hospital_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        hospital_name VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database initialized successfully.');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export default pool; 