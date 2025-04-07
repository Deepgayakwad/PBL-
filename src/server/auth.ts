import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from './models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// In-memory fallback for when database is unavailable
let inMemoryUsers: { id: number; username: string; email: string; password: string }[] = [];
let nextId = 1;

// Signup route
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
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

      // Create user - make sure to include username
      const userId = await UserModel.create({
        username,
        email,
        password: hashedPassword,
      });

      // Generate JWT
      const token = jwt.sign(
        { id: userId },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ 
        message: 'User created successfully',
        token,
        user: {
          id: userId,
          username,
          email
        }
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
        username,
        email,
        password: hashedPassword
      };
      inMemoryUsers.push(newUser);

      // Generate JWT
      const token = jwt.sign(
        { id: newUser.id },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ 
        message: 'User created successfully (in-memory mode)',
        token,
        user: {
          id: newUser.id,
          username,
          email
        }
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
    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let authSuccess = false;
    let userData: { id: number; username: string; email: string } | null = null;
    let authToken: string | null = null;

    try {
      // Find user in database
      console.log('Attempting to find user in database');
      const user = await UserModel.findByEmail(email);
      
      if (user) {
        console.log('User found in database');
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
          console.log('Password is valid');
          // Generate JWT token
          authToken = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: '24h',
          });
          
          authSuccess = true;
          userData = {
            id: user.id,
            username: user.username,
            email: user.email
          };
        } else {
          console.log('Password is invalid');
        }
      } else {
        console.log('User not found in database');
      }
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      console.log('Falling back to in-memory user storage');
      
      // Fallback to in-memory storage
      const user = inMemoryUsers.find(user => user.email === email);
      
      if (user) {
        console.log('User found in in-memory storage');
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
          console.log('Password is valid (in-memory)');
          // Generate JWT token
          authToken = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: '24h',
          });
          
          authSuccess = true;
          userData = {
            id: user.id,
            username: user.username,
            email: user.email
          };
        } else {
          console.log('Password is invalid (in-memory)');
        }
      } else {
        console.log('User not found in in-memory storage');
      }
    }

    if (authSuccess && authToken && userData) {
      console.log('Authentication successful, sending token');
      return res.json({ 
        token: authToken,
        user: userData
      });
    }

    // If we reach here, authentication failed
    console.log('Authentication failed');
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 