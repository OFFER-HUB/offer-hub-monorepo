import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { UserManagementService } from '../user-management.service';
import { supabase } from '@/lib/supabase/supabase';
import { BadRequestError, NotFoundError, InternalServerError } from '@/utils/AppError';
import { AdminUserFilters, AdminCreateUserDTO, UserStatusChange, UserRoleChange, UserVerification, BulkUserOperation } from '@/types/user-management.types';

// Mock Supabase
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
            limit: jest.fn()
          }))
        })),
        ilike: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(),
            limit: jest.fn()
          }))
        })),
        order: jest.fn(() => ({
          range: jest.fn(),
          limit: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn()
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn()
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}));

describe('UserManagementService', () => {
  let userManagementService: UserManagementService;
  let mockSupabase: any;

  beforeEach(() => {
    userManagementService = new UserManagementService();
    mockSupabase = supabase as any;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData: AdminCreateUserDTO = {
        wallet_address: '0x1234567890abcdef',
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
        status: 'active'
      };
      const adminId = 'admin-123';

      const mockUser = {
        id: 'user-123',
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: adminId,
        updated_by: adminId
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [mockUser],
            error: null
          })
        })
      });

      const result = await userManagementService.createUser(userData, adminId);

      expect(result).toEqual(mockUser);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should throw error if user creation fails', async () => {
      const userData: AdminCreateUserDTO = {
        wallet_address: '0x1234567890abcdef',
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
        status: 'active'
      };
      const adminId = 'admin-123';

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      });

      await expect(userManagementService.createUser(userData, adminId))
        .rejects.toThrow(InternalServerError);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users with filters', async () => {
      const filters: AdminUserFilters = {
        page: 1,
        limit: 10,
        search: 'test',
        status: 'active',
        role: 'user'
      };

      const mockUsers = [
        {
          id: 'user-1',
          username: 'testuser1',
          email: 'test1@example.com',
          status: 'active',
          role: 'user'
        },
        {
          id: 'user-2',
          username: 'testuser2',
          email: 'test2@example.com',
          status: 'active',
          role: 'user'
        }
      ];

      const mockCount = { count: 2 };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockUsers,
                error: null
              })
            })
          })
        })
      });

      // Mock count query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockUsers,
                error: null
              })
            })
          })
        })
      });

      const result = await userManagementService.getAllUsers(filters);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should handle empty results', async () => {
      const filters: AdminUserFilters = {
        page: 1,
        limit: 10
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const result = await userManagementService.getAllUsers(filters);

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        status: 'active'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      });

      const result = await userManagementService.getUserById(userId);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      const userId = 'user-123';

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' }
            })
          })
        })
      });

      await expect(userManagementService.getUserById(userId))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-123';
      const updates = {
        first_name: 'Updated',
        last_name: 'Name'
      };
      const adminId = 'admin-123';

      const mockUpdatedUser = {
        id: userId,
        first_name: 'Updated',
        last_name: 'Name',
        updated_by: adminId
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [mockUpdatedUser],
              error: null
            })
          })
        })
      });

      const result = await userManagementService.updateUser(userId, updates, adminId);

      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-123';
      const adminId = 'admin-123';

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      });

      await expect(userManagementService.deleteUser(userId, adminId))
        .resolves.not.toThrow();
    });
  });

  describe('suspendUser', () => {
    it('should suspend user successfully', async () => {
      const statusChange: UserStatusChange = {
        user_id: 'user-123',
        status: 'suspended',
        reason: 'Violation of terms',
        notes: 'Multiple warnings issued'
      };
      const adminId = 'admin-123';

      const mockSuspendedUser = {
        id: 'user-123',
        status: 'suspended',
        suspension_reason: 'Violation of terms',
        suspension_notes: 'Multiple warnings issued'
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [mockSuspendedUser],
              error: null
            })
          })
        })
      });

      const result = await userManagementService.suspendUser(statusChange, adminId);

      expect(result.status).toBe('suspended');
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const userId = 'user-123';
      const adminId = 'admin-123';

      const mockActivatedUser = {
        id: userId,
        status: 'active'
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [mockActivatedUser],
              error: null
            })
          })
        })
      });

      const result = await userManagementService.activateUser(userId, adminId);

      expect(result.status).toBe('active');
    });
  });

  describe('changeUserRole', () => {
    it('should change user role successfully', async () => {
      const roleChange: UserRoleChange = {
        user_id: 'user-123',
        role: 'moderator',
        reason: 'Promoted to moderator'
      };
      const adminId = 'admin-123';

      const mockUserWithNewRole = {
        id: 'user-123',
        role: 'moderator',
        role_change_reason: 'Promoted to moderator'
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [mockUserWithNewRole],
              error: null
            })
          })
        })
      });

      const result = await userManagementService.changeUserRole(roleChange, adminId);

      expect(result.role).toBe('moderator');
    });
  });

  describe('verifyUser', () => {
    it('should verify user successfully', async () => {
      const verification: UserVerification = {
        user_id: 'user-123',
        verification_status: 'verified',
        verification_type: 'identity',
        notes: 'Documents verified'
      };
      const adminId = 'admin-123';

      const mockVerifiedUser = {
        id: 'user-123',
        verification_status: 'verified',
        verification_type: 'identity',
        verification_notes: 'Documents verified'
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [mockVerifiedUser],
              error: null
            })
          })
        })
      });

      const result = await userManagementService.verifyUser(verification, adminId);

      expect(result.verification_status).toBe('verified');
    });
  });

  describe('bulkOperation', () => {
    it('should perform bulk operation successfully', async () => {
      const operation: BulkUserOperation = {
        action: 'suspend',
        user_ids: ['user-1', 'user-2'],
        reason: 'Bulk suspension',
        notes: 'Policy violation'
      };
      const adminId = 'admin-123';

      const mockResult = {
        successful: 2,
        failed: 0,
        errors: []
      };

      // Mock multiple update calls
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ id: 'user-1', status: 'suspended' }],
              error: null
            })
          })
        })
      });

      const result = await userManagementService.bulkOperation(operation, adminId);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
    });
  });

  describe('getUserAnalytics', () => {
    it('should return user analytics', async () => {
      const mockAnalytics = {
        total_users: 100,
        active_users: 85,
        suspended_users: 10,
        pending_verification: 5,
        user_growth: [
          { month: '2024-01', count: 50 },
          { month: '2024-02', count: 75 },
          { month: '2024-03', count: 100 }
        ],
        role_distribution: {
          user: 80,
          moderator: 15,
          admin: 5
        }
      };

      // Mock multiple queries for analytics
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { count: 100 },
              error: null
            })
          })
        })
      });

      const result = await userManagementService.getUserAnalytics();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('exportUsers', () => {
    it('should export users in CSV format', async () => {
      const options = {
        format: 'csv' as const,
        fields: ['id', 'username', 'email', 'status'],
        filters: {}
      };

      const mockUsers = [
        { id: '1', username: 'user1', email: 'user1@test.com', status: 'active' },
        { id: '2', username: 'user2', email: 'user2@test.com', status: 'active' }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockUsers,
              error: null
            })
          })
        })
      });

      const result = await userManagementService.exportUsers(options);

      expect(result).toContain('id,username,email,status');
      expect(result).toContain('user1,user1@test.com,active');
    });
  });

  describe('importUsers', () => {
    it('should import users from CSV successfully', async () => {
      const csvData = 'wallet_address,username,email,first_name,last_name\n0x123,testuser,test@example.com,Test,User';
      const adminId = 'admin-123';

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 'new-user-123' }],
            error: null
          })
        })
      });

      const result = await userManagementService.importUsers(csvData, adminId);

      expect(result.successful_imports).toBe(1);
      expect(result.failed_imports).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle import errors', async () => {
      const csvData = 'wallet_address,username\n0x123,'; // Missing username
      const adminId = 'admin-123';

      const result = await userManagementService.importUsers(csvData, adminId);

      expect(result.successful_imports).toBe(0);
      expect(result.failed_imports).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });
});
