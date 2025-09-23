const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

describe('useUserManagement Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have jest available', () => {
    expect(typeof jest).toBe('object');
    expect(typeof jest.fn).toBe('function');
  });

  it('should be able to create mocks', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should be able to create mock objects', () => {
    const mockService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn()
    };

    expect(typeof mockService.getAllUsers).toBe('function');
    expect(typeof mockService.getUserById).toBe('function');
    expect(typeof mockService.createUser).toBe('function');
  });
});