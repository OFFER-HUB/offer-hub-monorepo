/**
 * @fileoverview Unit tests for project service state validation logic
 * @author Offer Hub Team
 */

import { projectService } from '../project.service';
import { 
  NotFoundError, 
  ForbiddenError, 
  BadRequestError 
} from '@/utils/AppError';
import { supabase } from '@/lib/supabase/supabase';
import { Project, ProjectStatus } from '@/types/project.types';

// Mock Supabase
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('ProjectService - State Validation Logic', () => {
  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = 'user-123';
  const mockOtherUserId = 'user-456';

  const createMockProject = (overrides: Partial<Project> = {}): Project => ({
    id: mockProjectId,
    client_id: mockUserId,
    title: 'Test Project',
    description: 'Test Description',
    category: 'Web Development',
    budget_amount: 1000,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Status Validation', () => {
    it('should allow updates when status is "open"', async () => {
      const mockProject = createMockProject({ status: 'open' });
      const mockUpdate = { title: 'Updated Title' };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });
      const mockUpdateChain = jest.fn().mockReturnThis();
      const mockSelectAfterUpdate = jest.fn().mockReturnThis();
      const mockSingleAfterUpdate = jest.fn().mockResolvedValue({
        data: { ...mockProject, ...mockUpdate, updated_at: new Date().toISOString() },
        error: null,
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          update: mockUpdateChain,
        });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockUpdateChain.mockReturnValue({ eq: jest.fn().mockReturnValue({ select: mockSelectAfterUpdate }) });
      mockSelectAfterUpdate.mockReturnValue({ single: mockSingleAfterUpdate });

      const result = await projectService.updateProject(
        mockProjectId,
        mockUpdate,
        mockUserId
      );

      expect(result.title).toBe('Updated Title');
      expect(mockSingle).toHaveBeenCalled();
    });

    it('should allow updates when status is "in_progress"', async () => {
      const mockProject = createMockProject({ status: 'in_progress' });
      const mockUpdate = { description: 'Updated Description' };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });
      const mockUpdateChain = jest.fn().mockReturnThis();
      const mockSelectAfterUpdate = jest.fn().mockReturnThis();
      const mockSingleAfterUpdate = jest.fn().mockResolvedValue({
        data: { ...mockProject, ...mockUpdate, updated_at: new Date().toISOString() },
        error: null,
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          update: mockUpdateChain,
        });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockUpdateChain.mockReturnValue({ eq: jest.fn().mockReturnValue({ select: mockSelectAfterUpdate }) });
      mockSelectAfterUpdate.mockReturnValue({ single: mockSingleAfterUpdate });

      const result = await projectService.updateProject(
        mockProjectId,
        mockUpdate,
        mockUserId
      );

      expect(result.description).toBe('Updated Description');
    });

    it('should reject updates when status is "completed"', async () => {
      const mockProject = createMockProject({ status: 'completed' });
      const mockUpdate = { title: 'Updated Title' };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(BadRequestError);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow('Project cannot be updated when status is');
    });

    it('should reject updates when status is "cancelled"', async () => {
      const mockProject = createMockProject({ status: 'cancelled' });
      const mockUpdate = { title: 'Updated Title' };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(BadRequestError);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow('Project cannot be updated when status is');
    });
  });

  describe('Owner Validation', () => {
    it('should allow updates when user is the project owner', async () => {
      const mockProject = createMockProject({ client_id: mockUserId });
      const mockUpdate = { title: 'Updated Title' };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });
      const mockUpdateChain = jest.fn().mockReturnThis();
      const mockSelectAfterUpdate = jest.fn().mockReturnThis();
      const mockSingleAfterUpdate = jest.fn().mockResolvedValue({
        data: { ...mockProject, ...mockUpdate, updated_at: new Date().toISOString() },
        error: null,
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          update: mockUpdateChain,
        });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockUpdateChain.mockReturnValue({ eq: jest.fn().mockReturnValue({ select: mockSelectAfterUpdate }) });
      mockSelectAfterUpdate.mockReturnValue({ single: mockSingleAfterUpdate });

      const result = await projectService.updateProject(
        mockProjectId,
        mockUpdate,
        mockUserId
      );

      expect(result).toBeDefined();
    });

    it('should reject updates when user is not the project owner', async () => {
      const mockProject = createMockProject({ client_id: mockOtherUserId });
      const mockUpdate = { title: 'Updated Title' };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(ForbiddenError);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow('Only the project owner can update this project');
    });
  });

  describe('Budget Protection', () => {
    it('should allow budget update when no freelancer is assigned', async () => {
      const mockProject = createMockProject({ freelancer_id: null });
      const mockUpdate = { budget_amount: 2000 };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });
      const mockUpdateChain = jest.fn().mockReturnThis();
      const mockSelectAfterUpdate = jest.fn().mockReturnThis();
      const mockSingleAfterUpdate = jest.fn().mockResolvedValue({
        data: { ...mockProject, ...mockUpdate, updated_at: new Date().toISOString() },
        error: null,
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          update: mockUpdateChain,
        });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockUpdateChain.mockReturnValue({ eq: jest.fn().mockReturnValue({ select: mockSelectAfterUpdate }) });
      mockSelectAfterUpdate.mockReturnValue({ single: mockSingleAfterUpdate });

      const result = await projectService.updateProject(
        mockProjectId,
        mockUpdate,
        mockUserId
      );

      expect(result.budget_amount).toBe(2000);
    });

    it('should reject budget update when freelancer is assigned', async () => {
      const mockProject = createMockProject({ 
        freelancer_id: 'freelancer-123' 
      });
      const mockUpdate = { budget_amount: 2000 };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(BadRequestError);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow('Budget cannot be modified once a freelancer is assigned');
    });
  });

  describe('Protected Fields', () => {
    it('should reject updates to protected field "id"', async () => {
      const mockProject = createMockProject();
      const mockUpdate = { id: 'new-id' } as any;

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(BadRequestError);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow('Cannot modify protected fields');
    });

    it('should reject updates to protected field "client_id"', async () => {
      const mockProject = createMockProject();
      const mockUpdate = { client_id: 'new-client-id' } as any;

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(BadRequestError);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow('Cannot modify protected fields');
    });

    it('should reject updates to protected field "on_chain_tx_hash"', async () => {
      const mockProject = createMockProject();
      const mockUpdate = { on_chain_tx_hash: 'new-hash' } as any;

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(BadRequestError);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow('Cannot modify protected fields');
    });
  });

  describe('Status Transition Validation', () => {
    it('should allow transition from "open" to "in_progress"', async () => {
      const mockProject = createMockProject({ status: 'open' });
      const mockUpdate = { status: 'in_progress' as ProjectStatus };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });
      const mockUpdateChain = jest.fn().mockReturnThis();
      const mockSelectAfterUpdate = jest.fn().mockReturnThis();
      const mockSingleAfterUpdate = jest.fn().mockResolvedValue({
        data: { ...mockProject, ...mockUpdate, updated_at: new Date().toISOString() },
        error: null,
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          update: mockUpdateChain,
        });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockUpdateChain.mockReturnValue({ eq: jest.fn().mockReturnValue({ select: mockSelectAfterUpdate }) });
      mockSelectAfterUpdate.mockReturnValue({ single: mockSingleAfterUpdate });

      const result = await projectService.updateProject(
        mockProjectId,
        mockUpdate,
        mockUserId
      );

      expect(result.status).toBe('in_progress');
    });

    it('should allow transition from "open" to "cancelled"', async () => {
      const mockProject = createMockProject({ status: 'open' });
      const mockUpdate = { status: 'cancelled' as ProjectStatus };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });
      const mockUpdateChain = jest.fn().mockReturnThis();
      const mockSelectAfterUpdate = jest.fn().mockReturnThis();
      const mockSingleAfterUpdate = jest.fn().mockResolvedValue({
        data: { ...mockProject, ...mockUpdate, updated_at: new Date().toISOString() },
        error: null,
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          update: mockUpdateChain,
        });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockUpdateChain.mockReturnValue({ eq: jest.fn().mockReturnValue({ select: mockSelectAfterUpdate }) });
      mockSelectAfterUpdate.mockReturnValue({ single: mockSingleAfterUpdate });

      const result = await projectService.updateProject(
        mockProjectId,
        mockUpdate,
        mockUserId
      );

      expect(result.status).toBe('cancelled');
    });

    it('should reject transition from "open" to "completed"', async () => {
      const mockProject = createMockProject({ status: 'open' });
      const mockUpdate = { status: 'completed' as ProjectStatus };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(BadRequestError);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow('Invalid status transition');
    });

    it('should allow transition from "in_progress" to "completed"', async () => {
      const mockProject = createMockProject({ status: 'in_progress' });
      const mockUpdate = { status: 'completed' as ProjectStatus };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });
      const mockUpdateChain = jest.fn().mockReturnThis();
      const mockSelectAfterUpdate = jest.fn().mockReturnThis();
      const mockSingleAfterUpdate = jest.fn().mockResolvedValue({
        data: { ...mockProject, ...mockUpdate, updated_at: new Date().toISOString() },
        error: null,
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          update: mockUpdateChain,
        });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockUpdateChain.mockReturnValue({ eq: jest.fn().mockReturnValue({ select: mockSelectAfterUpdate }) });
      mockSelectAfterUpdate.mockReturnValue({ single: mockSingleAfterUpdate });

      const result = await projectService.updateProject(
        mockProjectId,
        mockUpdate,
        mockUserId
      );

      expect(result.status).toBe('completed');
    });

    it('should reject transition from "completed" to any other status', async () => {
      const mockProject = createMockProject({ status: 'completed' });
      const mockUpdate = { status: 'open' as ProjectStatus };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      // First, it should fail because status is 'completed' (not allowed for updates)
      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('Project Not Found', () => {
    it('should throw NotFoundError when project does not exist', async () => {
      const mockUpdate = { title: 'Updated Title' };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'No rows returned' } 
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdate, mockUserId)
      ).rejects.toThrow('Project not found');
    });
  });
});
