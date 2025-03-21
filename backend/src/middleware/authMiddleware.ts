import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
}

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (typeof decoded === 'string' || !('userId' in decoded)) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }
    req.user = decoded as JwtPayload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export { authenticateToken };
