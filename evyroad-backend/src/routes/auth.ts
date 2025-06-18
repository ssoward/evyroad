import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { authMiddleware } from '../middleware/auth';
import { userStorage, User } from '../storage/userStorage';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Helper functions
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
      return;
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = userStorage.findByEmail(email);
    if (existingUser) {
      res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = userStorage.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser.id);

    // Return user data (without password) and tokens
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
      return;
    }

    const { email, password } = value;

    // Find user
    const user = userStorage.findByEmail(email);
    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Return user data (without password) and tokens
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login'
    });
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', (req: Request, res: Response): void => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        error: 'Refresh token required',
        message: 'No refresh token provided'
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    ) as any;

    if (decoded.type !== 'refresh') {
      res.status(401).json({
        error: 'Invalid token type',
        message: 'Token is not a refresh token'
      });
      return;
    }

    // Find user
    const user = userStorage.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        error: 'User not found',
        message: 'Invalid refresh token'
      });
      return;
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.json({
      message: 'Tokens refreshed successfully',
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      message: 'Failed to refresh token'
    });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authMiddleware, (req: Request, res: Response) => {
  // In a real implementation, you'd blacklist the token or remove it from a token store
  // For now, we'll just return a success message since JWT tokens are stateless
  res.json({
    message: 'Logout successful',
    note: 'Please remove tokens from client storage'
  });
});

// GET /api/v1/auth/me - Get current user info
router.get('/me', authMiddleware, (req: Request, res: Response): void => {
  try {
    const userId = req.userId;
    const user = userStorage.findById(userId!);
    
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
      return;
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt
    };

    res.json({
      user: userResponse
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user information'
    });
  }
});

export default router;
