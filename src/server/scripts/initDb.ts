import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1920',
  };

  try {
    // Create connection without database selected
    const connection = await mysql.createConnection(config);
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS organ_finder`);
    console.log('Database organ_finder created or already exists');
    
    // Use the database
    await connection.query(`USE organ_finder`);
    console.log('Using database organ_finder');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');
    
    // Create donors table
    await connection.query(`
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
    console.log('Donors table created or already exists');
    
    // Create recipients table
    await connection.query(`
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
    console.log('Recipients table created or already exists');
    
    // Create hospital_contacts table
    await connection.query(`
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
    console.log('Hospital contacts table created or already exists');
    
    console.log('Database initialization completed successfully');
    await connection.end();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 