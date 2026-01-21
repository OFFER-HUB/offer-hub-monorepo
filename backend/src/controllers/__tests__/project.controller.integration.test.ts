/**
 * @fileoverview Integration tests for project controller
 * @author Offer Hub Team
 */

import request from 'supertest';
import express from 'express';
import projectRoutes from '@/routes/project.routes';
import { projectService } from '@/services/project.service';
import { verifyToken } from '@/middlewares/auth.middleware';
import { 
  NotFoundError, 
  ForbiddenError, 
  BadRequestError 
} from '@/utils/AppError';
import { Project } from '@/types/project.types';

// Mock dependencies
jest.mock('@/services/project.service');
jest.mock('@/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    // Mock authenticated user
    (req as any).user = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'client',
    };
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

describe('Project Controller - Integration Tests', () => {
  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = 'user-123';

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

  describe('PATCH /api/projects/:projectId', () => {
    describe('Success Scenarios', () => {
      it('should return 200 and updated project when update is successful', async () => {
        const mockProject = createMockProject();
        const updatedProject = { ...mockProject, title: 'Updated Title', updated_at: new Date().toISOString() };

        (projectService.updateProject as jest.Mock).mockResolvedValue(updatedProject);

        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({ title: 'Updated Title' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe('Updated Title');
        expect(response.body.message).toBe('Project updated successfully');
        expect(projectService.updateProject).toHaveBeenCalledWith(
          mockProjectId,
          { title: 'Updated Title' },
          mockUserId
        );
      });

      it('should allow updating multiple fields at once', async () => {
        const mockProject = createMockProject();
        const updatedProject = {
          ...mockProject,
          title: 'Updated Title',
          description: 'Updated Description',
          category: 'Mobile Development',
          updated_at: new Date().toISOString(),
        };

        (projectService.updateProject as jest.Mock).mockResolvedValue(updatedProject);

        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({
            title: 'Updated Title',
            description: 'Updated Description',
            category: 'Mobile Development',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe('Updated Title');
        expect(response.body.data.description).toBe('Updated Description');
        expect(response.body.data.category).toBe('Mobile Development');
      });

      it('should allow updating budget when no freelancer is assigned', async () => {
        const mockProject = createMockProject({ freelancer_id: undefined });
        const updatedProject = {
          ...mockProject,
          budget_amount: 2000,
          updated_at: new Date().toISOString(),
        };

        (projectService.updateProject as jest.Mock).mockResolvedValue(updatedProject);

        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({ budget_amount: 2000 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.budget_amount).toBe(2000);
      });
    });

    describe('Error Scenarios', () => {
      it('should return 404 when project is not found', async () => {
        (projectService.updateProject as jest.Mock).mockRejectedValue(
          new NotFoundError('Project not found', 'PROJECT_NOT_FOUND')
        );

        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({ title: 'Updated Title' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('Project not found');
        expect(response.body.error.code).toBe('PROJECT_NOT_FOUND');
      });

      it('should return 403 when user is not the project owner', async () => {
        (projectService.updateProject as jest.Mock).mockRejectedValue(
          new ForbiddenError(
            'Only the project owner can update this project',
            'RESOURCE_ACCESS_DENIED'
          )
        );

        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({ title: 'Updated Title' })
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('Only the project owner');
        expect(response.body.error.code).toBe('RESOURCE_ACCESS_DENIED');
      });

      it('should return 400 when project status does not allow updates', async () => {
        (projectService.updateProject as jest.Mock).mockRejectedValue(
          new BadRequestError(
            "Project cannot be updated when status is 'completed'. Only projects with status 'open' or 'in_progress' can be updated.",
            'INVALID_STATUS_TRANSITION'
          )
        );

        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({ title: 'Updated Title' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('cannot be updated when status is');
        expect(response.body.error.code).toBe('INVALID_STATUS_TRANSITION');
      });

      it('should return 400 when trying to update budget with freelancer assigned', async () => {
        (projectService.updateProject as jest.Mock).mockRejectedValue(
          new BadRequestError(
            'Budget cannot be modified once a freelancer is assigned',
            'BUSINESS_LOGIC_ERROR'
          )
        );

        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({ budget_amount: 2000 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('Budget cannot be modified');
        expect(response.body.error.code).toBe('BUSINESS_LOGIC_ERROR');
      });

      it('should return 400 when trying to update protected fields', async () => {
        (projectService.updateProject as jest.Mock).mockRejectedValue(
          new BadRequestError(
            'Cannot modify protected fields: id, client_id',
            'BUSINESS_LOGIC_ERROR'
          )
        );

        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({ id: 'new-id', client_id: 'new-client-id' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('Cannot modify protected fields');
      });

      it('should return 400 when update data is empty', async () => {
        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('Update data is required');
      });

      it('should return 400 when projectId is invalid UUID', async () => {
        const response = await request(app)
          .patch('/api/projects/invalid-id')
          .send({ title: 'Updated Title' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('Invalid project ID format');
      });

      it('should return 400 when projectId is missing', async () => {
        const response = await request(app)
          .patch('/api/projects/')
          .send({ title: 'Updated Title' })
          .expect(404); // Express returns 404 for missing route params
      });

      it('should return 400 when status transition is invalid', async () => {
        (projectService.updateProject as jest.Mock).mockRejectedValue(
          new BadRequestError(
            "Invalid status transition from 'open' to 'completed'. Allowed transitions from 'open': in_progress, cancelled",
            'INVALID_STATUS_TRANSITION'
          )
        );

        const response = await request(app)
          .patch(`/api/projects/${mockProjectId}`)
          .send({ status: 'completed' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('Invalid status transition');
        expect(response.body.error.code).toBe('INVALID_STATUS_TRANSITION');
      });
    });

    describe('Validation', () => {
      it('should validate UUID format for projectId', async () => {
        const response = await request(app)
          .patch('/api/projects/not-a-uuid')
          .send({ title: 'Updated Title' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_UUID');
      });
    });
  });

  describe('GET /api/projects/:projectId', () => {
    it('should return 200 and project when found', async () => {
      const mockProject = createMockProject();

      (projectService.getProjectById as jest.Mock).mockResolvedValue(mockProject);

      const response = await request(app)
        .get(`/api/projects/${mockProjectId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockProjectId);
      expect(response.body.message).toBe('Project fetched successfully');
    });

    it('should return 404 when project is not found', async () => {
      (projectService.getProjectById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/projects/${mockProjectId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Project not found');
    });

    it('should return 400 when projectId is invalid UUID', async () => {
      const response = await request(app)
        .get('/api/projects/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_UUID');
    });
  });
});
