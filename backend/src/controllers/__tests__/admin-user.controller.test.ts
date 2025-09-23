import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  createUserAsAdminHandler,
  getAllUsersForAdminHandler,
  getUserByIdForAdminHandler,
  updateUserAsAdminHandler,
  deleteUserAsAdminHandler,
  suspendUserHandler,
  activateUserHandler,
  changeUserRoleHandler,
  verifyUserHandler,
  bulkUserOperationHandler,
  getUserAnalyticsHandler,
  getUserActivityLogsHandler,
  exportUsersHandler
} from '../admin-user.controller';
import { userManagementService } from '@/services/user-management.service';
import { BadRequestError, NotFoundError } from '@/utils/AppError';

// Mock the user management service
jest.mock('@/services/user-management.service', () => ({
  userManagementService: {
    createUser: jest.fn(),
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    suspendUser: jest.fn(),
    activateUser: jest.fn(),
    changeUserRole: jest.fn(),
    verifyUser: jest.fn(),
    bulkOperation: jest.fn(),
    getUserAnalytics: jest.fn(),
    getUserActivityLogs: jest.fn(),
    exportUsers: jest.fn()
  }
}));

describe('Admin User Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 'admin-123' }
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
      setHeader: jest.fn(),
      send: jest.fn()
    };
    
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createUserAsAdminHandler', () => {
    it('should create user successfully', async () => {
      const userData = {
        wallet_address: '0x1234567890abcdef',
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
        status: 'active'
      };

      mockReq.body = userData;

      const mockUser = {
        id: 'user-123',
        ...userData,
        created_at: new Date().toISOString()
      };

      (userManagementService.createUser as jest.Mock).mockResolvedValue(mockUser);

      await createUserAsAdminHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.createUser).toHaveBeenCalledWith(userData, 'admin-123');
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUser,
          message: 'User created successfully by admin'
        })
      );
    });

    it('should handle missing admin ID', async () => {
      mockReq.user = undefined;

      await createUserAsAdminHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('getAllUsersForAdminHandler', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'user1', email: 'user1@test.com' },
        { id: 'user-2', username: 'user2', email: 'user2@test.com' }
      ];

      const mockResult = {
        users: mockUsers,
        total: 2
      };

      (userManagementService.getAllUsers as jest.Mock).mockResolvedValue(mockResult);

      await getAllUsersForAdminHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.getAllUsers).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUsers,
          message: 'Users retrieved successfully'
        })
      );
    });

    it('should apply query filters', async () => {
      mockReq.query = {
        page: '2',
        limit: '10',
        search: 'test',
        status: 'active',
        role: 'user'
      };

      const mockResult = { users: [], total: 0 };
      (userManagementService.getAllUsers as jest.Mock).mockResolvedValue(mockResult);

      await getAllUsersForAdminHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.getAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
          search: 'test',
          status: 'active',
          role: 'user'
        })
      );
    });
  });

  describe('getUserByIdForAdminHandler', () => {
    it('should return user by id', async () => {
      const userId = 'user-123';
      mockReq.params = { id: userId };

      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com'
      };

      (userManagementService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await getUserByIdForAdminHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUser,
          message: 'User fetched successfully'
        })
      );
    });

    it('should handle missing user ID', async () => {
      mockReq.params = {};

      await getUserByIdForAdminHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateUserAsAdminHandler', () => {
    it('should update user successfully', async () => {
      const userId = 'user-123';
      const updates = { first_name: 'Updated' };
      
      mockReq.params = { id: userId };
      mockReq.body = updates;

      const mockUpdatedUser = {
        id: userId,
        first_name: 'Updated',
        updated_by: 'admin-123'
      };

      (userManagementService.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await updateUserAsAdminHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.updateUser).toHaveBeenCalledWith(userId, updates, 'admin-123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdatedUser,
          message: 'User updated successfully'
        })
      );
    });
  });

  describe('deleteUserAsAdminHandler', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-123';
      mockReq.params = { id: userId };

      (userManagementService.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await deleteUserAsAdminHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.deleteUser).toHaveBeenCalledWith(userId, 'admin-123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: null,
          message: 'User deleted successfully'
        })
      );
    });
  });

  describe('suspendUserHandler', () => {
    it('should suspend user successfully', async () => {
      const userId = 'user-123';
      const suspensionData = {
        reason: 'Violation of terms',
        notes: 'Multiple warnings'
      };

      mockReq.params = { id: userId };
      mockReq.body = suspensionData;

      const mockSuspendedUser = {
        id: userId,
        status: 'suspended',
        suspension_reason: 'Violation of terms'
      };

      (userManagementService.suspendUser as jest.Mock).mockResolvedValue(mockSuspendedUser);

      await suspendUserHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.suspendUser).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          status: 'suspended',
          reason: 'Violation of terms',
          notes: 'Multiple warnings'
        }),
        'admin-123'
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('activateUserHandler', () => {
    it('should activate user successfully', async () => {
      const userId = 'user-123';
      mockReq.params = { id: userId };

      const mockActivatedUser = {
        id: userId,
        status: 'active'
      };

      (userManagementService.activateUser as jest.Mock).mockResolvedValue(mockActivatedUser);

      await activateUserHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.activateUser).toHaveBeenCalledWith(userId, 'admin-123');
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('changeUserRoleHandler', () => {
    it('should change user role successfully', async () => {
      const userId = 'user-123';
      const roleData = {
        role: 'moderator',
        reason: 'Promoted to moderator'
      };

      mockReq.params = { id: userId };
      mockReq.body = roleData;

      const mockUserWithNewRole = {
        id: userId,
        role: 'moderator',
        role_change_reason: 'Promoted to moderator'
      };

      (userManagementService.changeUserRole as jest.Mock).mockResolvedValue(mockUserWithNewRole);

      await changeUserRoleHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.changeUserRole).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          role: 'moderator',
          reason: 'Promoted to moderator'
        }),
        'admin-123'
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('verifyUserHandler', () => {
    it('should verify user successfully', async () => {
      const userId = 'user-123';
      const verificationData = {
        verification_status: 'verified',
        verification_type: 'identity',
        notes: 'Documents verified'
      };

      mockReq.params = { id: userId };
      mockReq.body = verificationData;

      const mockVerifiedUser = {
        id: userId,
        verification_status: 'verified',
        verification_type: 'identity'
      };

      (userManagementService.verifyUser as jest.Mock).mockResolvedValue(mockVerifiedUser);

      await verifyUserHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.verifyUser).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          verification_status: 'verified',
          verification_type: 'identity',
          notes: 'Documents verified'
        }),
        'admin-123'
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('bulkUserOperationHandler', () => {
    it('should perform bulk operation successfully', async () => {
      const bulkOperation = {
        action: 'suspend',
        user_ids: ['user-1', 'user-2'],
        reason: 'Bulk suspension',
        notes: 'Policy violation'
      };

      mockReq.body = bulkOperation;

      const mockResult = {
        successful: 2,
        failed: 0,
        errors: []
      };

      (userManagementService.bulkOperation as jest.Mock).mockResolvedValue(mockResult);

      await bulkUserOperationHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.bulkOperation).toHaveBeenCalledWith(bulkOperation, 'admin-123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockResult,
          message: 'Bulk operation completed'
        })
      );
    });
  });

  describe('getUserAnalyticsHandler', () => {
    it('should return user analytics', async () => {
      const mockAnalytics = {
        total_users: 100,
        active_users: 85,
        suspended_users: 10,
        pending_verification: 5
      };

      (userManagementService.getUserAnalytics as jest.Mock).mockResolvedValue(mockAnalytics);

      await getUserAnalyticsHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.getUserAnalytics).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockAnalytics,
          message: 'User analytics retrieved successfully'
        })
      );
    });
  });

  describe('getUserActivityLogsHandler', () => {
    it('should return user activity logs', async () => {
      const userId = 'user-123';
      mockReq.params = { id: userId };
      mockReq.query = { limit: '50' };

      const mockLogs = [
        { id: 'log-1', action: 'login', timestamp: new Date().toISOString() },
        { id: 'log-2', action: 'profile_update', timestamp: new Date().toISOString() }
      ];

      (userManagementService.getUserActivityLogs as jest.Mock).mockResolvedValue(mockLogs);

      await getUserActivityLogsHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.getUserActivityLogs).toHaveBeenCalledWith(userId, 50);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockLogs,
          message: 'User activity logs retrieved successfully'
        })
      );
    });
  });

  describe('exportUsersHandler', () => {
    it('should export users successfully', async () => {
      const exportOptions = {
        format: 'csv',
        fields: ['id', 'username', 'email'],
        filters: {}
      };

      mockReq.body = exportOptions;

      const mockCsvData = 'id,username,email\n1,user1,user1@test.com\n2,user2,user2@test.com';

      (userManagementService.exportUsers as jest.Mock).mockResolvedValue(mockCsvData);

      await exportUsersHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(userManagementService.exportUsers).toHaveBeenCalledWith(exportOptions);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="users.csv"');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(mockCsvData);
    });
  });
});
