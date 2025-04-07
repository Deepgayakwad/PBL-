import express, { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader } from 'mysql2';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Interface for recipient registration data
interface RecipientRegistration {
  fullName: string;
  age: number;
  bloodType: string;
  contactNumber: string;
  address: string;
  organNeeded: string;
  medicalCondition: string;
  urgencyLevel: string;
  hospitalAffiliated: string;
  doctorName: string;
  insuranceInfo: string;
}

// Register as a recipient
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
      organNeeded,
      medicalCondition,
      urgencyLevel,
      hospitalAffiliated,
      doctorName,
      insuranceInfo
    }: RecipientRegistration = req.body;

    // Basic validation
    if (!fullName || !age || !bloodType || !contactNumber || !address || !organNeeded || !urgencyLevel) {
      return res.status(400).json({ message: 'Missing required recipient information' });
    }

    // Check if user is already registered as a recipient
    const [existing] = await pool.query(
      'SELECT * FROM recipients WHERE user_id = ?',
      [userId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing recipient record
      await pool.query(
        `UPDATE recipients SET 
          full_name = ?, 
          age = ?, 
          blood_type = ?, 
          contact_number = ?, 
          address = ?, 
          organ_needed = ?, 
          medical_condition = ?, 
          urgency_level = ?,
          hospital_affiliated = ?,
          doctor_name = ?,
          insurance_info = ?,
          updated_at = NOW() 
        WHERE user_id = ?`,
        [
          fullName,
          age,
          bloodType,
          contactNumber,
          address,
          organNeeded,
          medicalCondition || '',
          urgencyLevel,
          hospitalAffiliated || '',
          doctorName || '',
          insuranceInfo || '',
          userId
        ]
      );

      return res.json({ message: 'Recipient information updated successfully' });
    } else {
      // Register new recipient
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO recipients (
          user_id, 
          full_name, 
          age, 
          blood_type, 
          contact_number, 
          address, 
          organ_needed, 
          medical_condition, 
          urgency_level,
          hospital_affiliated,
          doctor_name,
          insurance_info,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          fullName,
          age,
          bloodType,
          contactNumber,
          address,
          organNeeded,
          medicalCondition || '',
          urgencyLevel,
          hospitalAffiliated || '',
          doctorName || '',
          insuranceInfo || ''
        ]
      );

      if (result.affectedRows > 0) {
        return res.status(201).json({
          message: 'Recipient registered successfully',
          recipientId: result.insertId
        });
      } else {
        return res.status(500).json({ message: 'Failed to register recipient' });
      }
    }
  } catch (error) {
    console.error('Error registering recipient:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user's recipient information
router.get('/profile', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM recipients WHERE user_id = ?',
      [userId]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ message: 'Recipient profile not found' });
    }
  } catch (error) {
    console.error('Error fetching recipient profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 