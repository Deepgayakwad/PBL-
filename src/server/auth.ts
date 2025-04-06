import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from './models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory fallback for when database is unavailable
let inMemoryUsers: { id: number; email: string; password: string }[] = [];
let nextId = 1;

// Signup route
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    try {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userId = await UserModel.create({
        email,
        password: hashedPassword,
      });

      res.status(201).json({ 
        message: 'User created successfully',
        userId
      });
    } catch (dbError) {
      console.error('Database error during signup:', dbError);
      
      // Fallback to in-memory storage
      const existingUser = inMemoryUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in memory
      const newUser = {
        id: nextId++,
        email,
        password: hashedPassword
      };
      inMemoryUsers.push(newUser);

      res.status(201).json({ 
        message: 'User created successfully (in-memory mode)',
        userId: newUser.id
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      // Find user in database
      const user = await UserModel.findByEmail(email);
      if (user) {
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
          // Generate JWT token
          const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: '24h',
          });
          
          return res.json({ token });
        }
      }
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      
      // Fallback to in-memory storage
      const user = inMemoryUsers.find(user => user.email === email);
      if (user) {
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
          // Generate JWT token
          const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: '24h',
          });
          
          return res.json({ token });
        }
      }
    }

    // If we reach here, authentication failed
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 