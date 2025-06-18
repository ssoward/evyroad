import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface JWTPayload {
  userId: string;
  type: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authorization required',
        message: 'No valid authorization token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JWTPayload;

    // Check if it's an access token
    if (decoded.type !== 'access') {
      res.status(401).json({
        error: 'Invalid token type',
        message: 'Access token required'
      });
      return;
    }

    // Add userId to request object
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'Access token is invalid'
      });
    } else {
      console.error('Auth middleware error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Authentication failed'
      });
    }
  }
};

// Optional auth middleware - doesn't fail if no token provided
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JWTPayload;

    if (decoded.type === 'access') {
      req.userId = decoded.userId;
    }
    
    next();
  } catch (error) {
    // Token invalid, continue without authentication
    next();
  }
};
