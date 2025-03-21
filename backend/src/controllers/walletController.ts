import { Request, Response } from 'express';
// import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface WalletVerifyRequest {
  address: string;
  signature: string;
  nonce: string;
}

type WalletUser = Pick<IUser, '_id' | 'name' | 'walletAddress' | 'nonce'>;

export const verifyWalletSignature = async (req: Request, res: Response) => {
  try {
    const { address, signature, nonce } = req.body;

    if (!address || !signature || !nonce) {
      return res.status(400).json({ message: 'Address, signature, and nonce are required' });
    }

    // Simplified signature verification for now
    // In production, use ethers.js to verify the signature properly
    // For now, let's just check if the nonce matches what we expect
    try {
      // For debugging - simplified nonce check
      const user = await User.findOne({ walletAddress: address.toLowerCase() });
      if (user && user.nonce.toString() !== nonce) {
        return res.status(401).json({ message: 'Invalid nonce' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Verification error' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      try {
        user = await User.create({
          name: `Wallet User ${address.substring(0, 6)}`,
          walletAddress: address.toLowerCase(),
          nonce: Math.floor(Math.random() * 1000000),
          email: `${address.toLowerCase()}@wallet.user`,
          isActive: true
        });
      } catch (error: any) {
        if (error.code === 11000) { // Duplicate key error
          return res.status(400).json({ message: 'Wallet address already registered' });
        }
        throw error;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, walletAddress: address },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update nonce for next login
    await User.findByIdAndUpdate(user._id, {
      nonce: Math.floor(Math.random() * 1000000),
      lastLogin: new Date()
    });

    const userResponse: WalletUser = {
      _id: user._id.toString(),
      name: user.name,
      walletAddress: user.walletAddress || '',
      nonce: user.nonce
    };

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Wallet verification error:', error);
    res.status(500).json({ message: 'Server error during wallet verification' });
  }
};

export const getNonce = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: `Wallet User ${address.substring(0, 6)}`,
        walletAddress: address.toLowerCase(),
        nonce: Math.floor(Math.random() * 1000000),
      });
    }

    res.json({ nonce: user.nonce });
  } catch (error) {
    console.error('Get nonce error:', error);
    res.status(500).json({ message: 'Server error while getting nonce' });
  }
};
