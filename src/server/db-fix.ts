import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function fixDatabaseSchema() {
  console.log('Starting database schema fix...');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1920',
    database: process.env.DB_DATABASE || 'organ_finder',
  };

  console.log('DB Configuration:', {
    host: config.host,
    user: config.user,
    password: '(password hidden)',
    database: config.database,
  });

  const connection = await mysql.createConnection(config);
  
  try {
    console.log('Connected to database successfully');
    
    // Temporarily disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    console.log('Foreign key checks disabled');
    
    // Check if users table exists
    const [tables] = await connection.query(`SHOW TABLES LIKE 'users'`);
    const tablesArray = tables as any[];
    
    if (tablesArray.length > 0) {
      console.log('Users table found, checking schema...');
      
      // Check if username column exists
      const [columns] = await connection.query(`SHOW COLUMNS FROM users`);
      const columnsArray = columns as any[];
      
      const hasUsername = columnsArray.some((col: any) => col.Field === 'username');
      
      if (!hasUsername) {
        console.log('Username column missing, fixing the table...');
        
        // First, check if there are existing users
        const [users] = await connection.query(`SELECT * FROM users`);
        const usersArray = users as any[];
        
        if (usersArray.length > 0) {
          console.log(`Found ${usersArray.length} existing users, backing them up...`);
          
          // Create backup table
          await connection.query(`
            CREATE TABLE IF NOT EXISTS users_backup AS
            SELECT * FROM users
          `);
          
          console.log('Users backed up to users_backup table');
        }
        
        // Drop existing users table
        await connection.query(`DROP TABLE IF EXISTS users`);
        console.log('Dropped existing users table');
        
        // Create new users table with username column
        await connection.query(`
          CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log('Created new users table with username column');
        
        // If we had existing users, try to restore them with a default username
        if (usersArray && usersArray.length > 0) {
          console.log('Restoring users with default usernames...');
          
          for (const user of usersArray) {
            const defaultUsername = user.email ? user.email.split('@')[0] : `user_${user.id}`;
            try {
              await connection.query(`
                INSERT INTO users (id, username, email, password, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
              `, [user.id, defaultUsername, user.email, user.password, 
                  user.created_at || new Date(), user.updated_at || new Date()]);
              console.log(`Restored user ${user.id} with username ${defaultUsername}`);
            } catch (error) {
              console.error(`Failed to restore user ${user.id}:`, error);
            }
          }
        }
      } else {
        console.log('Username column already exists, no action needed');
      }
    } else {
      console.log('Users table does not exist, creating it...');
      await connection.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Created new users table with username column');
    }
    
    // Re-create the donors table if it exists
    const [donorsTables] = await connection.query(`SHOW TABLES LIKE 'donors'`);
    const donorsTablesArray = donorsTables as any[];
    
    if (donorsTablesArray.length > 0) {
      console.log('Donors table exists, recreating with proper foreign key...');
      
      // Backup donors table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS donors_backup AS
        SELECT * FROM donors
      `);
      console.log('Donors backed up to donors_backup table');
      
      // Drop donors table
      await connection.query(`DROP TABLE IF EXISTS donors`);
      
      // Re-create donors table
      await connection.query(`
        CREATE TABLE donors (
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
      console.log('Donors table recreated with proper foreign key');
    }
    
    // Re-create the recipients table if it exists
    const [recipientsTables] = await connection.query(`SHOW TABLES LIKE 'recipients'`);
    const recipientsTablesArray = recipientsTables as any[];
    
    if (recipientsTablesArray.length > 0) {
      console.log('Recipients table exists, recreating with proper foreign key...');
      
      // Backup recipients table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS recipients_backup AS
        SELECT * FROM recipients
      `);
      console.log('Recipients backed up to recipients_backup table');
      
      // Drop recipients table
      await connection.query(`DROP TABLE IF EXISTS recipients`);
      
      // Re-create recipients table
      await connection.query(`
        CREATE TABLE recipients (
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
      console.log('Recipients table recreated with proper foreign key');
    }
    
    // Re-create the hospital_contacts table if it exists
    const [contactsTables] = await connection.query(`SHOW TABLES LIKE 'hospital_contacts'`);
    const contactsTablesArray = contactsTables as any[];
    
    if (contactsTablesArray.length > 0) {
      console.log('Hospital contacts table exists, recreating with proper foreign key...');
      
      // Backup hospital_contacts table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS hospital_contacts_backup AS
        SELECT * FROM hospital_contacts
      `);
      console.log('Hospital contacts backed up to hospital_contacts_backup table');
      
      // Drop hospital_contacts table
      await connection.query(`DROP TABLE IF EXISTS hospital_contacts`);
      
      // Re-create hospital_contacts table
      await connection.query(`
        CREATE TABLE hospital_contacts (
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
      console.log('Hospital contacts table recreated with proper foreign key');
    }
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
    console.log('Foreign key checks re-enabled');
    
    console.log('Database schema fix completed successfully');
  } catch (error) {
    console.error('Error fixing database schema:', error);
    // Make sure we re-enable foreign key checks even if there's an error
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS=1');
      console.log('Foreign key checks re-enabled after error');
    } catch (fkError) {
      console.error('Failed to re-enable foreign key checks:', fkError);
    }
    throw error;
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

// Run the function
fixDatabaseSchema()
  .then(() => {
    console.log('Database schema fix script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database schema fix script failed:', error);
    process.exit(1);
  }); 