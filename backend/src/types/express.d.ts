import { JwtPayload } from '../middleware/authMiddleware';

declare global {
  namespace Express {
    // This augments the existing Express.Request interface
    interface Request {
      user?: JwtPayload;
    }
  }
}

