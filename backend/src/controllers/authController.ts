import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { JwtPayload } from '../middleware/authMiddleware';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  walletAddress?: string;
}

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  console.log('Registration request received:', { ...req.body, password: '[REDACTED]' });
  try {
    const { name, email, password, walletAddress } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists with email
    const existingUserEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // If wallet address provided, check if it's already registered
    if (walletAddress) {
      const existingUserWallet = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (existingUserWallet) {
        return res.status(400).json({ message: 'Wallet address already registered' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    console.log('Creating new user...');
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      walletAddress: walletAddress ? walletAddress.toLowerCase() : undefined,
      nonce: Math.floor(Math.random() * 1000000), // For wallet authentication
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data (excluding password) and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
    };

    console.log('User created successfully');
    console.log('Response data:', { user: userResponse, token });
    res.status(201).json({
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

interface LoginRequest {
  email: string;
  password: string;
}

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data (excluding password) and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
    };

    res.json({
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  // Type safety for user object
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
    };

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error getting user data' });
  }
};
