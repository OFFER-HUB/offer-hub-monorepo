import { updateAvatarHandler, deleteOwnAccountHandler,updateProfileHandler } from '@/controllers/user.controller';
import { userService } from '@/services/user.service';
import { AppError, BadRequestError } from '@/utils/AppError';

// Mock email service to avoid sending emails during tests
jest.mock('@/services/email.service', () => ({
  sendAccountDeletionEmail: jest.fn().mockResolvedValue(undefined),
}));

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

describe('User Controller - deleteOwnAccountHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
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

  describe('Authentication Validation', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockReq.body = { password: 'password123', confirmation: 'DELETE' };
      mockReq.user = null;

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required',
          statusCode: 401,
        })
      );
    });

    it('should return 401 if user.id is missing', async () => {
      mockReq.body = { password: 'password123', confirmation: 'DELETE' };
      mockReq.user = {}; // user exists but no id

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required',
          statusCode: 401,
        })
      );
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      mockReq.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
    });

    it('should return 400 if password is missing', async () => {
      mockReq.body = { confirmation: 'DELETE' };

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Password is required',
          errorCode: 'MISSING_PASSWORD',
        })
      );
    });

    it('should return 400 if confirmation is missing', async () => {
      mockReq.body = { password: 'password123' };

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Confirmation is required',
          errorCode: 'MISSING_CONFIRMATION',
        })
      );
    });

    it('should return 400 if confirmation is not "DELETE"', async () => {
      mockReq.body = { password: 'password123', confirmation: 'delete' }; // lowercase

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Confirmation must be exactly 'DELETE'",
          errorCode: 'INVALID_CONFIRMATION',
        })
      );
    });

    it('should return 400 if confirmation is wrong string', async () => {
      mockReq.body = { password: 'password123', confirmation: 'CONFIRM' };

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Confirmation must be exactly 'DELETE'",
          errorCode: 'INVALID_CONFIRMATION',
        })
      );
    });
  });

  describe('Service Integration', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
      mockReq.user = { id: userId };
      mockReq.body = { password: 'correctPassword123', confirmation: 'DELETE' };
    });

    it('should call userService.deleteOwnAccount with correct parameters', async () => {
      mockUserService.deleteOwnAccount.mockResolvedValue(undefined);

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockUserService.deleteOwnAccount).toHaveBeenCalledWith(
        userId,
        'correctPassword123',
        'DELETE'
      );
      expect(mockUserService.deleteOwnAccount).toHaveBeenCalledTimes(1);
    });

    it('should return 200 with success message on successful deletion', async () => {
      mockUserService.deleteOwnAccount.mockResolvedValue(undefined);

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Account scheduled for deletion. You will receive a confirmation email.',
      });
    });

    it('should forward BadRequestError for incorrect password', async () => {
      const passwordError = new BadRequestError('Incorrect password', 'INVALID_PASSWORD');
      mockUserService.deleteOwnAccount.mockRejectedValue(passwordError);

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(passwordError);
    });

    it('should forward BadRequestError for invalid confirmation from service', async () => {
      const confirmError = new BadRequestError("Confirmation must be exactly 'DELETE'", 'INVALID_CONFIRMATION');
      mockUserService.deleteOwnAccount.mockRejectedValue(confirmError);

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(confirmError);
    });

    it('should forward NotFoundError when user does not exist', async () => {
      const notFoundError = new AppError('User not found', 404, 'USER_NOT_FOUND');
      mockUserService.deleteOwnAccount.mockRejectedValue(notFoundError);

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(notFoundError);
    });

    it('should forward BadRequestError when account is already deleted', async () => {
      const alreadyDeletedError = new BadRequestError('Account is already deleted', 'ACCOUNT_ALREADY_DELETED');
      mockUserService.deleteOwnAccount.mockRejectedValue(alreadyDeletedError);

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(alreadyDeletedError);
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockUserService.deleteOwnAccount.mockRejectedValue(unexpectedError);

      await deleteOwnAccountHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
  });
});


describe('User Controller - updateProfileHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      user: null,
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = null;
      mockReq.body = { username: 'newusername' };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID not found in token',
          statusCode: 401,
          errorCode: 'UNAUTHORIZED',
        })
      );
    });

    it('should return 401 if user ID is missing in token', async () => {
      mockReq.user = {};
      mockReq.body = { username: 'newusername' };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID not found in token',
          statusCode: 401,
        })
      );
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      mockReq.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
    });

    it('should throw ValidationError when no fields provided', async () => {
      mockReq.body = {};

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'At least one field (username or avatar_url) must be provided',
          statusCode: 422,
          errorCode: 'VALIDATION_ERROR',
        })
      );
    });

    it('should throw ValidationError when username is too short', async () => {
      mockReq.body = { username: 'ab' };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'The provided data is invalid',
          statusCode: 422,
          errorCode: 'VALIDATION_ERROR',
        })
      );
    });

    it('should throw ValidationError when username is too long', async () => {
      mockReq.body = { username: 'a'.repeat(101) };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          errorCode: 'VALIDATION_ERROR',
        })
      );
    });

    it('should throw ValidationError when username contains invalid characters', async () => {
      const invalidUsernames = ['user@name', 'user name', 'user-name', 'user.name'];

      for (const username of invalidUsernames) {
        jest.clearAllMocks();
        mockReq.body = { username };

        await updateProfileHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'The provided data is invalid',
            statusCode: 422,
          })
        );
      }
    });

    it('should throw ValidationError when username is not a string', async () => {
      mockReq.body = { username: 12345 };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
        })
      );
    });

    it('should accept valid usernames', async () => {
      const validUsernames = ['user123', 'user_name', 'User_Name_123', 'abc'];
      
      const mockUpdatedUser = createMockUser();
      mockUserService.updateProfile.mockResolvedValue(mockUpdatedUser);

      for (const username of validUsernames) {
        jest.clearAllMocks();
        mockReq.body = { username };

        await updateProfileHandler(mockReq, mockRes, mockNext);

        expect(mockUserService.updateProfile).toHaveBeenCalledWith(
          '123e4567-e89b-12d3-a456-426614174000',
          { username, avatar_url: undefined }
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
      }
    });

    it('should throw ValidationError when avatar_url is invalid', async () => {
      mockReq.body = { avatar_url: 'not-a-url' };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
        })
      );
    });

    it('should throw ValidationError when avatar_url uses invalid protocol', async () => {
      mockReq.body = { avatar_url: 'ftp://example.com/avatar.jpg' };

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
        })
      );
    });

    it('should accept valid avatar URLs', async () => {
      const validUrls = [
        'https://example.com/avatar.jpg',
        'http://example.com/avatar.png',
      ];

      const mockUpdatedUser = createMockUser();
      mockUserService.updateProfile.mockResolvedValue(mockUpdatedUser);

      for (const url of validUrls) {
        jest.clearAllMocks();
        mockReq.body = { avatar_url: url };

        await updateProfileHandler(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
      }
    });

    it('should convert empty string avatar_url to null', async () => {
      mockReq.body = { avatar_url: '' };

      const mockUpdatedUser = createMockUser({ avatar_url: null });
      mockUserService.updateProfile.mockResolvedValue(mockUpdatedUser);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { username: undefined, avatar_url: null }
      );
    });
  });

  describe('Success Cases', () => {
    beforeEach(() => {
      mockReq.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
    });

    it('should update username successfully', async () => {
      const newUsername = 'newusername';
      mockReq.body = { username: newUsername };

      const mockUpdatedUser = createMockUser({
        username: newUsername,
        updated_at: new Date().toISOString()
      });

      mockUserService.updateProfile.mockResolvedValue(mockUpdatedUser);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { username: newUsername, avatar_url: undefined }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile updated successfully',
          data: mockUpdatedUser
        })
      );
    });

    it('should update avatar_url successfully', async () => {
      const newAvatarUrl = 'https://example.com/avatar.jpg';
      mockReq.body = { avatar_url: newAvatarUrl };

      const mockUpdatedUser = createMockUser({
        avatar_url: newAvatarUrl,
      });

      mockUserService.updateProfile.mockResolvedValue(mockUpdatedUser);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should update both username and avatar_url', async () => {
      const newUsername = 'newusername';
      const newAvatarUrl = 'https://example.com/avatar.jpg';
      mockReq.body = { username: newUsername, avatar_url: newAvatarUrl };

      const mockUpdatedUser = createMockUser({
        username: newUsername,
        avatar_url: newAvatarUrl,
      });

      mockUserService.updateProfile.mockResolvedValue(mockUpdatedUser);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Service Errors', () => {
    beforeEach(() => {
      mockReq.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockReq.body = { username: 'newusername' };
    });

    it('should handle ConflictError from service', async () => {
      const conflictError = new AppError('Username is already taken', 409, 'USERNAME_TAKEN');
      mockUserService.updateProfile.mockRejectedValue(conflictError);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(conflictError);
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockUserService.updateProfile.mockRejectedValue(unexpectedError);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockReq.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
    });

    it('should accept username with exactly 3 characters', async () => {
      mockReq.body = { username: 'abc' };

      const mockUpdatedUser = createMockUser({ username: 'abc' });
      mockUserService.updateProfile.mockResolvedValue(mockUpdatedUser);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should accept username with exactly 100 characters', async () => {
      const longUsername = 'a'.repeat(100);
      mockReq.body = { username: longUsername };

      const mockUpdatedUser = createMockUser({ username: longUsername });
      mockUserService.updateProfile.mockResolvedValue(mockUpdatedUser);

      await updateProfileHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});