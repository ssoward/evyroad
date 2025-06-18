import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { authMiddleware } from '../auth';

// Mock Express Request and Response objects
const mockRequest = (headers: any = {}) => ({
  headers,
  userId: undefined
} as Request);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Auth Middleware', () => {
  const validToken = jwt.sign(
    { userId: '123', type: 'access' },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: '123', type: 'refresh' },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '7d' }
  );

  const expiredToken = jwt.sign(
    { userId: '123', type: 'access' },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '0s' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() with valid authorization header', () => {
    const req = mockRequest({
      authorization: `Bearer ${validToken}`
    });
    const res = mockResponse();

    authMiddleware(req, res, mockNext);

    expect(req.userId).toBe('123');
    expect(mockNext).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 without authorization header', () => {
    const req = mockRequest();
    const res = mockResponse();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authorization required',
      message: 'No valid authorization token provided'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with malformed authorization header', () => {
    const req = mockRequest({
      authorization: 'InvalidFormat token'
    });
    const res = mockResponse();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authorization required',
      message: 'No valid authorization token provided'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with invalid token', () => {
    const req = mockRequest({
      authorization: 'Bearer invalid.token.here'
    });
    const res = mockResponse();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid token',
      message: 'Access token is invalid'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with expired token', () => {
    const req = mockRequest({
      authorization: `Bearer ${expiredToken}`
    });
    const res = mockResponse();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Token expired',
      message: 'Access token has expired'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with refresh token instead of access token', () => {
    const req = mockRequest({
      authorization: `Bearer ${refreshToken}`
    });
    const res = mockResponse();

    authMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid token type',
      message: 'Access token required'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
