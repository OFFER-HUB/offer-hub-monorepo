import { getProjectHandler, listProjectsHandler } from '@/controllers/project.controller';
import { projectService } from '@/services/project.service';
import { ProjectStatus } from '@/types/project.types';

// Mock the project service
jest.mock('@/services/project.service');
const mockProjectService = projectService as jest.Mocked<typeof projectService>;

describe('Project Controller - getProjectHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';

  const mockProject = {
    id: mockProjectId,
    clientId: '456e7890-e89b-12d3-a456-426614174001',
    freelancerId: null,
    title: 'Test Project',
    description: 'A test project description',
    category: 'Development',
    budgetAmount: 1000,
    currency: 'XLM',
    status: ProjectStatus.OPEN,
    deadline: '2024-02-01T00:00:00Z',
    onChainTxHash: '0x1234567890abcdef',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    skills: ['JavaScript', 'React', 'Node.js']
  };

  beforeEach(() => {
    mockReq = {
      params: {},
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
    it('should return 404 if projectId is missing', async () => {
      mockReq.params = {};

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project ID is required',
          statusCode: 404
        })
      );
    });

    it('should return 404 if projectId is invalid UUID', async () => {
      mockReq.params = { projectId: 'invalid-uuid' };

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid project ID format',
          statusCode: 404
        })
      );
    });

    it('should validate UUID format correctly', async () => {
      // Test valid UUID
      mockReq.params = { projectId: mockProjectId };
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.getProjectById).toHaveBeenCalledWith(mockProjectId);
    });
  });

  describe('Successful Project Retrieval', () => {
    beforeEach(() => {
      mockReq.params = { projectId: mockProjectId };
    });

    it('should return 200 with project data when project exists', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.getProjectById).toHaveBeenCalledWith(mockProjectId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Project retrieved successfully',
          data: mockProject
        })
      );
    });

    it('should return project with all required fields', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData).toEqual(mockProject);
      expect(responseData.id).toBe(mockProjectId);
      expect(responseData.skills).toEqual(['JavaScript', 'React', 'Node.js']);
      expect(responseData.onChainTxHash).toBe('0x1234567890abcdef');
    });
  });

  describe('Project Not Found', () => {
    beforeEach(() => {
      mockReq.params = { projectId: mockProjectId };
    });

    it('should return 404 when project does not exist', async () => {
      mockProjectService.getProjectById.mockResolvedValue(null);

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project not found',
          statusCode: 404
        })
      );
    });

    it('should not call res.json when project is not found', async () => {
      mockProjectService.getProjectById.mockResolvedValue(null);

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    beforeEach(() => {
      mockReq.params = { projectId: mockProjectId };
    });

    it('should call projectService.getProjectById with correct ID', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.getProjectById).toHaveBeenCalledTimes(1);
      expect(mockProjectService.getProjectById).toHaveBeenCalledWith(mockProjectId);
    });

    it('should handle service errors appropriately', async () => {
      const serviceError = new Error('Database connection failed');
      mockProjectService.getProjectById.mockRejectedValue(serviceError);

      await getProjectHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockReq.params = { projectId: mockProjectId };
    });

    it('should return standardized API response format', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];

      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', 'Project retrieved successfully');
      expect(response).toHaveProperty('data');
      expect(response.data).toEqual(mockProject);
    });

    it('should include timestamp in response', async () => {
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await getProjectHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response).toHaveProperty('timestamp');
      expect(typeof response.timestamp).toBe('string');
    });
  });
});

describe('Project Controller - listProjectsHandler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockProjects = [
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      clientId: '456e7890-e89b-12d3-a456-426614174001',
      title: 'Mobile App Development',
      description: 'Create a mobile app for iOS and Android',
      category: 'Development',
      subcategory: 'Mobile Development',
      budgetAmount: 8000,
      currency: 'XLM',
      budget_type: 'fixed' as const,
      status: ProjectStatus.OPEN as const,
      visibility: 'public' as const,
      project_type: 'on-time' as const,
      experience_level: 'expert' as const,
      duration: '4 months',
      deadline: '2024-07-01T00:00:00Z',
      tags: ['mobile', 'ios', 'android'],
      version: 1,
      featured: true,
      priority: 1,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
      skills: ['Swift', 'Kotlin', 'React Native']
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      clientId: '456e7890-e89b-12d3-a456-426614174001',
      title: 'Web Development Project',
      description: 'Build a modern web application',
      category: 'Development',
      subcategory: 'Web Development',
      budgetAmount: 5000,
      currency: 'XLM',
      budget_type: 'fixed' as const,
      status: ProjectStatus.OPEN as const,
      visibility: 'public' as const,
      project_type: 'on-time' as const,
      experience_level: 'intermediate' as const,
      duration: '3 months',
      deadline: '2024-06-01T00:00:00Z',
      tags: ['javascript', 'react', 'nodejs'],
      version: 1,
      featured: false,
      priority: 0,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      skills: ['JavaScript', 'React', 'Node.js']
    }
  ];

  beforeEach(() => {
    mockReq = {
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('Default Pagination', () => {
    it('should return projects with default pagination (page=1, limit=20)', async () => {
      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 2
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
        status: undefined,
        category: undefined,
        minBudget: undefined,
        maxBudget: undefined
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Projects retrieved successfully',
          data: mockProjects,
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_items: 2,
            per_page: 20
          }
        })
      );
    });

    it('should handle empty results', async () => {
      mockProjectService.listProjects.mockResolvedValue({
        projects: [],
        total: 0
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
          pagination: {
            current_page: 1,
            total_pages: 0,
            total_items: 0,
            per_page: 20
          }
        })
      );
    });
  });

  describe('Custom Pagination', () => {
    it('should accept custom page and limit parameters', async () => {
      mockReq.query = { page: '2', limit: '10' };

      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 25
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: undefined,
        status: undefined,
        category: undefined,
        minBudget: undefined,
        maxBudget: undefined
      });

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: {
            current_page: 2,
            total_pages: 3,
            total_items: 25,
            per_page: 10
          }
        })
      );
    });

    it('should reject page number less than 1', async () => {
      mockReq.query = { page: '0' };

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Page number must be between 1 and 1000'
        })
      );
    });

    it('should reject page number greater than 1000', async () => {
      mockReq.query = { page: '1001' };

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Page number must be between 1 and 1000'
        })
      );
    });

    it('should reject limit less than 1', async () => {
      mockReq.query = { limit: '0' };

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Limit must be between 1 and 100'
        })
      );
    });

    it('should reject limit greater than 100', async () => {
      mockReq.query = { limit: '101' };

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Limit must be between 1 and 100'
        })
      );
    });
  });

  describe('Search Functionality', () => {
    it('should filter projects by search term', async () => {
      mockReq.query = { search: 'web' };

      mockProjectService.listProjects.mockResolvedValue({
        projects: [mockProjects[0]],
        total: 1
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'web'
        })
      );

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [mockProjects[0]],
          pagination: expect.objectContaining({
            total_items: 1
          })
        })
      );
    });

    it('should search across title and description fields', async () => {
      mockReq.query = { search: 'application' };

      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 2
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'application'
        })
      );
    });
  });

  describe('Status Filter', () => {
    it('should filter projects by status', async () => {
      mockReq.query = { status: ProjectStatus.OPEN };

      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 2
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ProjectStatus.OPEN
        })
      );
    });
  });

  describe('Category Filter', () => {
    it('should filter projects by category', async () => {
      mockReq.query = { category: 'Development' };

      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 2
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Development'
        })
      );
    });
  });

  describe('Budget Filters', () => {
    it('should filter projects by minimum budget', async () => {
      mockReq.query = { minBudget: '5000' };

      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 2
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          minBudget: 5000
        })
      );
    });

    it('should filter projects by maximum budget', async () => {
      mockReq.query = { maxBudget: '6000' };

      mockProjectService.listProjects.mockResolvedValue({
        projects: [mockProjects[0]],
        total: 1
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          maxBudget: 6000
        })
      );
    });

    it('should filter projects by budget range', async () => {
      mockReq.query = { minBudget: '5000', maxBudget: '8000' };

      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 2
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          minBudget: 5000,
          maxBudget: 8000
        })
      );
    });

    it('should reject negative minimum budget', async () => {
      mockReq.query = { minBudget: '-100' };

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Minimum budget cannot be negative'
        })
      );
    });

    it('should reject negative maximum budget', async () => {
      mockReq.query = { maxBudget: '-100' };

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Maximum budget cannot be negative'
        })
      );
    });

    it('should reject when minBudget > maxBudget', async () => {
      mockReq.query = { minBudget: '8000', maxBudget: '5000' };

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Minimum budget cannot be greater than maximum budget'
        })
      );
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters simultaneously', async () => {
      mockReq.query = {
        page: '1',
        limit: '10',
        search: 'development',
        status: ProjectStatus.OPEN,
        category: 'Development',
        minBudget: '5000',
        maxBudget: '10000'
      };

      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 2
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'development',
        status: ProjectStatus.OPEN,
        category: 'Development',
        minBudget: 5000,
        maxBudget: 10000
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockProjects
        })
      );
    });
  });

  describe('Response Format', () => {
    it('should return standardized API response format', async () => {
      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 2
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];

      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', 'Projects retrieved successfully');
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('pagination');
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should include pagination metadata', async () => {
      mockReq.query = { page: '2', limit: '5' };

      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 12
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];

      expect(response.pagination).toEqual({
        current_page: 2,
        total_pages: 3,
        total_items: 12,
        per_page: 5
      });
    });
  });

  describe('Service Integration', () => {
    it('should call projectService.listProjects with correct parameters', async () => {
      mockProjectService.listProjects.mockResolvedValue({
        projects: [],
        total: 0
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockProjectService.listProjects).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors appropriately', async () => {
      const serviceError = new Error('Database connection failed');
      mockProjectService.listProjects.mockRejectedValue(serviceError);

      await listProjectsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('Ordering', () => {
    it('should return projects ordered by created_at descending', async () => {
      mockProjectService.listProjects.mockResolvedValue({
        projects: mockProjects,
        total: 2
      });

      await listProjectsHandler(mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      const projects = response.data;

      expect(projects[0].createdAt >= projects[1].createdAt).toBe(true);
    });
  });
});