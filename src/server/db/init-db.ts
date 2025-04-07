import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  // Connect to MySQL server without specifying a database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1920',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    // Create database if it doesn't exist
    console.log(`Creating database ${process.env.DB_NAME || 'organ_finder_db'}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'organ_finder_db'}`);
    
    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'organ_finder_db'}`);
    
    // Create users table
    console.log('Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create donor_registrations table
    console.log('Creating donor_registrations table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS donor_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        blood_type VARCHAR(5) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        organ_type VARCHAR(50) NOT NULL,
        medical_history TEXT,
        emergency_contact VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create recipient_registrations table
    console.log('Creating recipient_registrations table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recipient_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        blood_type VARCHAR(5) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        organ_needed VARCHAR(50) NOT NULL,
        medical_condition TEXT NOT NULL,
        urgency_level VARCHAR(20) NOT NULL,
        hospital_affiliated VARCHAR(255) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        insurance_info VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create hospital_contacts table
    console.log('Creating hospital_contacts table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hospital_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        hospital_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database setup failed:', err);
      process.exit(1);
    });
}

export default initializeDatabase; 