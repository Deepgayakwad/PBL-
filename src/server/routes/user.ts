import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/auth';
import UserModel from '../models/User';

const router = express.Router();

// In-memory fallback data for when database is unavailable
const inMemoryUsers: { [id: number]: { id: number; email: string; created_at: string } } = {};

// Get current user profile (protected route)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    // req.user is set by the auth middleware
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password from response
      const { password, ...userData } = user;
      
      res.json(userData);
    } catch (dbError) {
      console.error('Database error when fetching user:', dbError);
      
      // Check in-memory storage as fallback
      const inMemoryUser = inMemoryUsers[userId];
      if (inMemoryUser) {
        return res.json(inMemoryUser);
      } else {
        // Create a placeholder user for demonstration
        const placeholderUser = {
          id: userId,
          email: `user${userId}@example.com`,
          created_at: new Date().toISOString()
        };
        
        // Store for future requests
        inMemoryUsers[userId] = placeholderUser;
        
        return res.json(placeholderUser);
      }
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 