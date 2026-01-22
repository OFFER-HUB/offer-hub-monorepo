import { updateAvatarHandler } from '@/controllers/user.controller';
import { userService } from '@/services/user.service';
import { AppError } from '@/utils/AppError';

// Mock the user service
jest.mock('@/services/user.service');
const mockUserService = userService as jest.Mocked<typeof userService>;

// Helper to create mock user objects
const createMockUser = (overrides: any = {}): any => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  wallet_address: '0x1234567890abcdef',
  username: 'testuser',
  name: null,
  bio: null,
  email: null,
  avatar_url: null,
  is_freelancer: false,
  nonce: null,
  created_at: '2024-01-21T16:00:00Z',
  updated_at: '2024-01-21T17:00:00Z',
  ...overrides,
});

describe('User Controller - updateAvatarHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      user: null,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should return 400 if userId is missing', async () => {
      mockReq.params = {};

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID is required',
        })
      );
    });

    it('should return 400 if userId is invalid UUID', async () => {
      mockReq.params = { userId: 'invalid-uuid' };

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid user ID format',
        })
      );
    });

    it('should return 403 if user is not authenticated', async () => {
      mockReq.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      mockReq.user = null;

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied. You can only update your own avatar.',
          statusCode: 403,
        })
      );
    });

    it('should return 403 if user tries to update another user avatar', async () => {
      mockReq.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      mockReq.user = { id: 'different-user-id' };

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied. You can only update your own avatar.',
          statusCode: 403,
        })
      );
    });
  });

  describe('Avatar URL Validation', () => {
    beforeEach(() => {
      mockReq.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      mockReq.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
    });

    it('should accept valid avatar URLs', async () => {
      const validUrls = [
        'https://example.com/avatar.jpg',
        'https://example.com/avatar.png',
        'https://example.com/avatar.jpeg',
        'https://example.com/avatar.gif',
        'https://example.com/avatar.webp',
      ];

      const mockUpdatedUser = createMockUser({
        avatar_url: 'https://example.com/avatar.jpg',
        updated_at: '2024-01-21T17:00:00Z',
      });

      mockUserService.updateAvatar.mockResolvedValue(mockUpdatedUser);

      for (const url of validUrls) {
        mockReq.body = { avatar_url: url };

        await updateAvatarHandler(mockReq, mockRes, mockNext);

        expect(mockUserService.updateAvatar).toHaveBeenCalledWith(
          '123e4567-e89b-12d3-a456-426614174000',
          url
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'Avatar updated successfully',
            data: mockUpdatedUser,
          })
        );
      }
    });

    it('should reject invalid avatar URLs', async () => {
      const invalidUrls = [
        'not-a-url',
        'https://example.com/avatar.bmp',
        'https://example.com/avatar.svg',
        'ftp://example.com/avatar.jpg',
      ];

      for (const url of invalidUrls) {
        mockReq.body = { avatar_url: url };

        await updateAvatarHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Invalid avatar URL format. Must be a valid URL ending with .jpg, .jpeg, .png, .gif, or .webp',
          })
        );
      }
    });

    it('should reject non-string avatar URLs', async () => {
      mockReq.body = { avatar_url: 123 };

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Avatar URL must be a string',
        })
      );
    });

    it('should accept null avatar_url to remove avatar', async () => {
      mockReq.body = { avatar_url: null };

      const mockUpdatedUser = createMockUser({
        updated_at: '2024-01-21T17:00:00Z',
      });

      mockUserService.updateAvatar.mockResolvedValue(mockUpdatedUser);

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockUserService.updateAvatar).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        null
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should accept empty string avatar_url and convert to null', async () => {
      mockReq.body = { avatar_url: '' };

      const mockUpdatedUser = createMockUser({
        updated_at: '2024-01-21T17:00:00Z',
      });

      mockUserService.updateAvatar.mockResolvedValue(mockUpdatedUser);

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockUserService.updateAvatar).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        null
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Service Integration', () => {
    beforeEach(() => {
      mockReq.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      mockReq.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockReq.body = { avatar_url: 'https://example.com/avatar.jpg' };
    });

    it('should call userService.updateAvatar with correct parameters', async () => {
      const mockUpdatedUser = createMockUser({
        avatar_url: 'https://example.com/avatar.jpg',
        updated_at: '2024-01-21T17:00:00Z',
      });

      mockUserService.updateAvatar.mockResolvedValue(mockUpdatedUser);

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockUserService.updateAvatar).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        'https://example.com/avatar.jpg'
      );
      expect(mockUserService.updateAvatar).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with updated user data on success', async () => {
      const mockUpdatedUser = createMockUser({
        avatar_url: 'https://example.com/avatar.jpg',
        updated_at: '2024-01-21T17:00:00Z',
      });

      mockUserService.updateAvatar.mockResolvedValue(mockUpdatedUser);

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Avatar updated successfully',
          data: mockUpdatedUser,
        })
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('User not found', 404, 'USER_NOT_FOUND');
      mockUserService.updateAvatar.mockRejectedValue(serviceError);

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockUserService.updateAvatar.mockRejectedValue(unexpectedError);

      await updateAvatarHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
  });
});