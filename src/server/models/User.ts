import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

class UserModel {
  static async findById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.query<User[]>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.query<User[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async create(userData: { username: string; email: string; password: string }): Promise<number> {
    try {
      const { username, email, password } = userData;
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password]
      );
      
      return (result as any).insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

export default UserModel; 