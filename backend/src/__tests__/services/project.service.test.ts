import { projectService } from '@/services/project.service';
import { supabase } from '@/lib/supabase/supabase';
import { ProjectStatus } from '@/types/project.types';


jest.mock('@/lib/supabase/supabase');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('ProjectService - getProjectById', () => {
  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';

  const mockProjectData = {
    id: mockProjectId,
    client_id: '456e7890-e89b-12d3-a456-426614174001',
    freelancer_id: null,
    title: 'Test Project',
    description: 'A test project description',
    category: 'Development',
    budget_amount: 1000,
    currency: 'XLM',
    status: ProjectStatus.OPEN,
    deadline: '2024-02-01T00:00:00Z',
    on_chain_tx_hash: '0x1234567890abcdef',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    project_skills: [
      { skill_name: 'JavaScript' },
      { skill_name: 'React' },
      { skill_name: 'Node.js' }
    ]
  };

  const expectedProject = {
    id: mockProjectId,
    clientId: mockProjectData.client_id,
    freelancerId: null,
    title: mockProjectData.title,
    description: mockProjectData.description,
    category: mockProjectData.category,
    budgetAmount: mockProjectData.budget_amount,
    currency: mockProjectData.currency,
    status: mockProjectData.status,
    deadline: mockProjectData.deadline,
    onChainTxHash: mockProjectData.on_chain_tx_hash,
    createdAt: mockProjectData.created_at,
    updatedAt: mockProjectData.updated_at,
    skills: ['JavaScript', 'React', 'Node.js']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful project retrieval', () => {
    it('should return project with skills when project exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProjectData,
              error: null
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(result).toEqual(expectedProject);
    });

    it('should return project with empty skills array when no skills exist', async () => {
      const projectWithoutSkills = {
        ...mockProjectData,
        project_skills: []
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: projectWithoutSkills,
              error: null
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(result?.skills).toEqual([]);
    });

    it('should return project with empty skills array when project_skills is null', async () => {
      const projectWithoutSkills = {
        ...mockProjectData,
        project_skills: null
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: projectWithoutSkills,
              error: null
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(result?.skills).toEqual([]);
    });
  });

  describe('Project not found', () => {
    it('should return null when project does not exist (PGRST116)', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' }
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(result).toBeNull();
    });

    it('should return null when data is null', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      } as any);

      const result = await projectService.getProjectById(mockProjectId);

      expect(result).toBeNull();
    });
  });

  describe('Database errors', () => {
    it('should throw error on database connection issues', async () => {
      const dbError = new Error('Database connection failed');
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: dbError
            })
          })
        })
      } as any);

      await expect(projectService.getProjectById(mockProjectId))
        .rejects
        .toThrow('Database error: Database connection failed');
    });

    it('should throw error on unexpected database errors', async () => {
      const unexpectedError = { code: 'UNKNOWN', message: 'Unexpected error' };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: unexpectedError
            })
          })
        })
      } as any);

      await expect(projectService.getProjectById(mockProjectId))
        .rejects
        .toThrow('Database error: Unexpected error');
    });
  });

  describe('Query structure', () => {
    it('should query the correct table and fields', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProjectData,
              error: null
            })
          })
        })
      } as any);

      await projectService.getProjectById(mockProjectId);

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      // Verify the select includes project_skills relation
      const mockSelect = mockSupabase.from('projects').select;
      expect(mockSelect).toHaveBeenCalledWith(`
        *,
        project_skills(skill_name)
      `);
    });

    it('should filter by the correct project ID', async () => {
      const mockEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockProjectData,
          error: null
        })
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq
        })
      } as any);

      await projectService.getProjectById(mockProjectId);

      expect(mockEq).toHaveBeenCalledWith('id', mockProjectId);
    });
  });
});

describe('ProjectService - listProjects', () => {
  const mockProjectsData = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      client_id: '456e7890-e89b-12d3-a456-426614174001',
      title: 'Web Development Project',
      description: 'Build a modern web application',
      category: 'Development',
      subcategory: 'Web Development',
      budget: 5000,
      budget_type: 'fixed' as const,
      status: 'published' as const,
      visibility: 'public' as const,
      project_type: 'on-time' as const,
      experience_level: 'intermediate' as const,
      duration: '3 months',
      deadline: '2024-06-01T00:00:00Z',
      tags: ['javascript', 'react'],
      version: 1,
      featured: false,
      priority: 0,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      project_skills: [
        { skill_name: 'JavaScript' },
        { skill_name: 'React' },
        { skill_name: 'Node.js' }
      ]
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      client_id: '456e7890-e89b-12d3-a456-426614174001',
      title: 'Mobile App Development',
      description: 'Create a mobile app',
      category: 'Development',
      subcategory: 'Mobile Development',
      budget: 8000,
      budget_type: 'fixed' as const,
      status: 'published' as const,
      visibility: 'public' as const,
      project_type: 'on-time' as const,
      experience_level: 'expert' as const,
      created_at: '2024-01-16T10:00:00Z',
      updated_at: '2024-01-16T10:00:00Z',
      tags: [],
      version: 1,
      featured: false,
      priority: 0,
      project_skills: [
        { skill_name: 'Swift' },
        { skill_name: 'Kotlin' }
      ]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default Parameters', () => {
    it('should return projects with default pagination', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProjectsData,
          error: null,
          count: 2
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await projectService.listProjects({});

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19);
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      
      expect(result.projects).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.projects[0].skills).toEqual(['JavaScript', 'React', 'Node.js']);
    });
  });

  describe('Pagination', () => {
    it('should apply custom page and limit', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProjectsData,
          error: null,
          count: 25
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({ page: 2, limit: 10 });

      expect(mockQuery.range).toHaveBeenCalledWith(10, 19);
    });

    it('should handle page 3 with limit 5 correctly', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({ page: 3, limit: 5 });

      expect(mockQuery.range).toHaveBeenCalledWith(10, 14);
    });
  });

  describe('Search Filter', () => {
    it('should filter by search term across title and description', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockProjectsData[0]],
          error: null,
          count: 1
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({ search: 'web' });

      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%web%,description.ilike.%web%');
    });

    it('should handle special characters in search', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({ search: 'test & project' });

      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%test & project%,description.ilike.%test & project%');
    });
  });

  describe('Status Filter', () => {
    it('should filter by status', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProjectsData,
          error: null,
          count: 2
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({ status: 'published' });

      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'published');
    });
  });

  describe('Category Filter', () => {
    it('should filter by category', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProjectsData,
          error: null,
          count: 2
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({ category: 'Development' });

      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'Development');
    });
  });

  describe('Budget Filters', () => {
    it('should filter by minimum budget', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProjectsData,
          error: null,
          count: 2
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({ minBudget: 5000 });

      expect(mockQuery.gte).toHaveBeenCalledWith('budget', 5000);
    });

    it('should filter by maximum budget', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockProjectsData[0]],
          error: null,
          count: 1
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({ maxBudget: 6000 });

      expect(mockQuery.lte).toHaveBeenCalledWith('budget', 6000);
    });

    it('should filter by budget range', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProjectsData,
          error: null,
          count: 2
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({ minBudget: 5000, maxBudget: 10000 });

      expect(mockQuery.gte).toHaveBeenCalledWith('budget', 5000);
      expect(mockQuery.lte).toHaveBeenCalledWith('budget', 10000);
    });
  });

  describe('Combined Filters', () => {
    it('should apply all filters together', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockProjectsData[0]],
          error: null,
          count: 1
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({
        page: 1,
        limit: 10,
        search: 'web',
        status: 'published',
        category: 'Development',
        minBudget: 4000,
        maxBudget: 6000
      });

      expect(mockQuery.or).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledTimes(2);
      expect(mockQuery.gte).toHaveBeenCalled();
      expect(mockQuery.lte).toHaveBeenCalled();
      expect(mockQuery.range).toHaveBeenCalled();
      expect(mockQuery.order).toHaveBeenCalled();
    });
  });

  describe('Skills Processing', () => {
    it('should transform project_skills to skills array', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProjectsData,
          error: null,
          count: 2
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await projectService.listProjects({});

      expect(result.projects[0].skills).toEqual(['JavaScript', 'React', 'Node.js']);
      expect(result.projects[1].skills).toEqual(['Swift', 'Kotlin']);
      expect(result.projects[0]).not.toHaveProperty('project_skills');
    });

    it('should handle projects with empty skills', async () => {
      const projectWithoutSkills = {
        ...mockProjectsData[0],
        project_skills: []
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [projectWithoutSkills],
          error: null,
          count: 1
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await projectService.listProjects({});

      expect(result.projects[0].skills).toEqual([]);
    });

    it('should handle projects with null skills', async () => {
      const projectWithNullSkills = {
        ...mockProjectsData[0],
        project_skills: null
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [projectWithNullSkills],
          error: null,
          count: 1
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await projectService.listProjects({});

      expect(result.projects[0].skills).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should throw error on database errors', async () => {
      const dbError = new Error('Database connection failed');
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: dbError,
          count: null
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(projectService.listProjects({}))
        .rejects
        .toThrow('Database error: Database connection failed');
    });
  });

  describe('Empty Results', () => {
    it('should handle empty results gracefully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await projectService.listProjects({ search: 'nonexistent' });

      expect(result.projects).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('Ordering', () => {
    it('should order by created_at descending', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProjectsData,
          error: null,
          count: 2
        })
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await projectService.listProjects({});

      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });
});