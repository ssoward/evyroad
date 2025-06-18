const request = require('supertest');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { userStorage } from '../../storage/userStorage';
import authRoutes from '../auth';

// Create test app
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Routes
  app.use('/api/v1/auth', authRoutes);
  
  return app;
};

describe('Authentication API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    // Clear user storage before each test
    userStorage.clear();
  });

  describe('POST /api/v1/auth/register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'User registered successfully',
        user: {
          email: validUserData.email,
          firstName: validUserData.firstName,
          lastName: validUserData.lastName
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }
      });

      // User should have an ID and createdAt
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.createdAt).toBeDefined();
      
      // Password should not be returned
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 400 for invalid email', async () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed'
      });
    });

    it('should return 400 for short password', async () => {
      const invalidData = { ...validUserData, password: '123' };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed'
      });
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = { email: validUserData.email };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed'
      });
    });

    it('should return 409 for duplicate email registration', async () => {
      // Register user first time
      await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);

      // Try to register same email again
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body).toMatchObject({
        error: 'User already exists'
      });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    beforeEach(async () => {
      // Register a user before each login test
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Login successful',
        user: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }
      });

      // Password should not be returned
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: userData.password
        })
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Invalid credentials'
      });
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Invalid credentials'
      });
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email
          // Missing password
        })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed'
      });
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and get refresh token
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      refreshToken = registerResponse.body.tokens.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Tokens refreshed successfully',
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }
      });
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Refresh token required'
      });
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Invalid refresh token'
      });
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;
    let userData: any;

    beforeEach(async () => {
      // Register and get access token
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      accessToken = registerResponse.body.tokens.accessToken;
      userData = registerResponse.body.user;
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      });
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Authorization required'
      });
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Invalid token'
      });
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Authorization required'
      });
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and get access token
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      accessToken = registerResponse.body.tokens.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Logout successful'
      });
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Authorization required'
      });
    });
  });
});
