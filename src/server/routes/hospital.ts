import express, { Request, Response } from 'express';
import pool from '../config/db';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Mock hospital data since we don't have a hospitals table yet
const mockHospitals = [
  {
    id: 1,
    name: 'City General Hospital',
    address: '123 Main St, Cityville, ST 12345',
    phone: '(555) 123-4567',
    email: 'contact@citygeneralhospital.org',
    specialties: ['Cardiac', 'Renal', 'Neurology'],
    transplantTypes: ['Heart', 'Kidney', 'Liver'],
    distance: 2.5
  },
  {
    id: 2,
    name: 'Memorial Medical Center',
    address: '456 Park Ave, Townsburg, ST 12345',
    phone: '(555) 987-6543',
    email: 'info@memorialmedical.org',
    specialties: ['Oncology', 'Pediatrics', 'Transplant'],
    transplantTypes: ['Kidney', 'Cornea', 'Bone Marrow'],
    distance: 5.1
  },
  {
    id: 3,
    name: 'University Health System',
    address: '789 College Blvd, Academia, ST 12345',
    phone: '(555) 222-3333',
    email: 'contact@universityhealthsystem.edu',
    specialties: ['Research', 'Surgery', 'Teaching'],
    transplantTypes: ['Heart', 'Lung', 'Liver', 'Kidney', 'Pancreas'],
    distance: 8.7
  },
  {
    id: 4,
    name: 'Children\'s Specialty Hospital',
    address: '101 Pediatric Lane, Kidsville, ST 12345',
    phone: '(555) 444-5555',
    email: 'care@childrensspecialty.org',
    specialties: ['Pediatric Surgery', 'Neonatal', 'Pediatric Oncology'],
    transplantTypes: ['Kidney', 'Bone Marrow', 'Heart'],
    distance: 12.3
  }
];

// Get list of hospitals
router.get('/list', async (req: Request, res: Response) => {
  try {
    // In the future, this will query from the database
    // const [hospitals] = await pool.query('SELECT * FROM hospitals');
    
    res.json(mockHospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ message: 'Failed to fetch hospitals' });
  }
});

// Send contact message to hospital
router.post('/contact', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { hospitalName, message } = req.body;
    
    if (!hospitalName || !message) {
      return res.status(400).json({ message: 'Hospital name and message are required' });
    }
    
    // In the future, we'll store this in the database
    // await pool.query(
    //   'INSERT INTO hospital_contacts (user_id, hospital_name, message, created_at) VALUES (?, ?, ?, NOW())',
    //   [userId, hospitalName, message]
    // );
    
    // For now, we'll just log it
    console.log(`Hospital contact from user ${userId} to ${hospitalName}: ${message}`);
    
    res.json({ message: 'Contact message sent successfully' });
  } catch (error) {
    console.error('Error sending hospital contact:', error);
    res.status(500).json({ message: 'Failed to send contact message' });
  }
});

// Get all hospital contacts for the current user
router.get('/contacts', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM hospital_contacts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching hospital contacts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 