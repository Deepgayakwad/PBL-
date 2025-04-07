import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth';
import userRoutes from './routes/user';
import donorRoutes from './routes/donor';
import recipientRoutes from './routes/recipient';
import hospitalRoutes from './routes/hospital';
import { testConnection, initializeDatabase } from './config/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/recipient', recipientRoutes);
app.use('/api/hospital', hospitalRoutes);

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    try {
      await testConnection();
      // Initialize database tables
      await initializeDatabase();
      console.log('Database connected and initialized successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      console.warn('Server will start without database connection. Authentication features will not work properly.');
    }
    
    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 