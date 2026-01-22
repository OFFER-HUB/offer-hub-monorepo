/**
 * @fileoverview Jest setup file for test configuration
 * @author Offer Hub Team
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
// Jest setup file for backend tests
import { config } from 'dotenv';

// Extend global object for test utilities
declare global {
  var testUtils: {
    wait: (ms: number) => Promise<void>;
    createMockReq: (overrides?: any) => any;
    createMockRes: (overrides?: any) => any;
    createMockNext: () => jest.MockedFunction<any>;
  };
}

// Load test environment variables
config({ path: '.env.test' });


// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create mock request/response objects
  createMockReq: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),

  createMockRes: (overrides = {}) => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    ...overrides,
  }),

  createMockNext: () => jest.fn(),
};
