// Test setup file
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_for_testing_only';
