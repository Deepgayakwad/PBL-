import express, { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader } from 'mysql2';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Interface for donor registration data
interface DonorRegistration {
  fullName: string;
  age: number;
  bloodType: string;
  contactNumber: string;
  address: string;
  organType: string;
  medicalHistory: string;
  emergencyContact: string;
}

// Register as a donor
router.post('/register', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      fullName,
      age,
      bloodType,
      contactNumber,
      address,
      organType,
      medicalHistory,
      emergencyContact
    }: DonorRegistration = req.body;

    // Basic validation
    if (!fullName || !age || !bloodType || !contactNumber || !address || !organType) {
      return res.status(400).json({ message: 'Missing required donor information' });
    }

    // Check if user is already registered as a donor
    const [existing] = await pool.query(
      'SELECT * FROM donors WHERE user_id = ?',
      [userId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing donor record
      await pool.query(
        `UPDATE donors SET 
          full_name = ?, 
          age = ?, 
          blood_type = ?, 
          contact_number = ?, 
          address = ?, 
          organ_type = ?, 
          medical_history = ?, 
          emergency_contact = ?,
          updated_at = NOW() 
        WHERE user_id = ?`,
        [
          fullName,
          age,
          bloodType,
          contactNumber,
          address,
          organType,
          medicalHistory || '',
          emergencyContact || '',
          userId
        ]
      );

      return res.json({ message: 'Donor information updated successfully' });
    } else {
      // Register new donor
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO donors (
          user_id, 
          full_name, 
          age, 
          blood_type, 
          contact_number, 
          address, 
          organ_type, 
          medical_history, 
          emergency_contact,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          fullName,
          age,
          bloodType,
          contactNumber,
          address,
          organType,
          medicalHistory || '',
          emergencyContact || ''
        ]
      );

      if (result.affectedRows > 0) {
        return res.status(201).json({
          message: 'Donor registered successfully',
          donorId: result.insertId
        });
      } else {
        return res.status(500).json({ message: 'Failed to register donor' });
      }
    }
  } catch (error) {
    console.error('Error registering donor:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user's donor information
router.get('/profile', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM donors WHERE user_id = ?',
      [userId]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ message: 'Donor profile not found' });
    }
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 