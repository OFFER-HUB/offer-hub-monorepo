import { taskService } from '@/services/task.service';
import { supabase } from '@/lib/supabase/supabase';
import { TaskRecordService } from '@/blockchain/task-record.service';
import { AppError, ValidationError, ConflictError, NotFoundError, AuthorizationError } from '@/utils/AppError';

// Mock Supabase
jest.mock('@/lib/supabase/supabase');

// Mock TaskRecordService
jest.mock('@/blockchain/task-record.service');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const MockTaskRecordService = TaskRecordService as jest.MockedClass<typeof TaskRecordService>;

describe('TaskService', () => {
  const mockClientId = '123e4567-e89b-12d3-a456-426614174000';
  const mockProjectId = '456e7890-e89b-12d3-a456-426614174001';
  const mockFreelancerId = '789e0123-e89b-12d3-a456-426614174002';

  const mockProject = {
    id: mockProjectId,
    client_id: mockClientId,
    status: 'in_progress',
    title: 'Test Project'
  };

  const mockTaskRecordData = {
    project_id: mockProjectId,
    freelancer_id: mockFreelancerId,
    completed: true,
    outcome_description: 'Task completed successfully'
  };

  const mockBlockchainResult = {
    transactionHash: '0x1234567890abcdef',
    taskId: 1,
    timestamp: Date.now(),
    ledger: 12345
  };

  const mockCreatedTaskRecord = {
    id: 'task-record-id',
    project_id: mockProjectId,
    freelancer_id: mockFreelancerId,
    client_id: mockClientId,
    completed: true,
    outcome_description: 'Task completed successfully',
    on_chain_tx_hash: mockBlockchainResult.transactionHash,
    on_chain_task_id: mockBlockchainResult.taskId,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock blockchain service instance
    const mockBlockchainInstance = {
      recordTask: jest.fn().mockResolvedValue(mockBlockchainResult)
    };
    MockTaskRecordService.mockImplementation(() => mockBlockchainInstance as any);
  });

  describe('createTaskRecord', () => {
    beforeEach(() => {
      // Setup default mocks for successful case
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'projects') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProject,
                  error: null
                })
              })
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null
              })
            })
          } as any;
        }
        
        if (table === 'task_records') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' } // No rows found
                })
              })
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockCreatedTaskRecord,
                  error: null
                })
              })
            })
          } as any;
        }
        
        return {} as any;
      });
    });

    it('should successfully create a task record with blockchain registration', async () => {
      const result = await taskService.createTaskRecord(mockTaskRecordData, mockClientId);

      expect(result).toEqual(mockCreatedTaskRecord);
      
      // Verify project lookup
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      
      // Verify existing record check
      expect(mockSupabase.from).toHaveBeenCalledWith('task_records');
      
      // Verify task record insertion
      expect(mockSupabase.from).toHaveBeenCalledWith('task_records');
      
      // Verify project status update
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
    });

    it('should throw NotFoundError when project does not exist', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'projects') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' }
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await expect(taskService.createTaskRecord(mockTaskRecordData, mockClientId))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when project status is not in_progress', async () => {
      const projectWithWrongStatus = { ...mockProject, status: 'completed' };
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'projects') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: projectWithWrongStatus,
                  error: null
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await expect(taskService.createTaskRecord(mockTaskRecordData, mockClientId))
        .rejects.toThrow(ValidationError);
    });

    it('should throw AuthorizationError when requester is not the project client', async () => {
      const differentClientId = 'different-client-id';

      await expect(taskService.createTaskRecord(mockTaskRecordData, differentClientId))
        .rejects.toThrow(AuthorizationError);
    });

    it('should throw ConflictError when task record already exists', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'projects') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProject,
                  error: null
                })
              })
            })
          } as any;
        }
        
        if (table === 'task_records') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'existing-record' },
                  error: null
                })
              })
            })
          } as any;
        }
        
        return {} as any;
      });

      await expect(taskService.createTaskRecord(mockTaskRecordData, mockClientId))
        .rejects.toThrow(ConflictError);
    });

    it('should handle blockchain failure gracefully and continue with database record', async () => {
      // Mock blockchain service to fail
      const mockBlockchainInstance = {
        recordTask: jest.fn().mockRejectedValue(new Error('Blockchain error'))
      };
      MockTaskRecordService.mockImplementation(() => mockBlockchainInstance as any);

      const expectedRecordWithoutBlockchain = {
        ...mockCreatedTaskRecord,
        on_chain_tx_hash: undefined,
        on_chain_task_id: undefined
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'task_records' && mockSupabase.from.mock.calls.length > 1) {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: expectedRecordWithoutBlockchain,
                  error: null
                })
              })
            })
          } as any;
        }
        return mockSupabase.from.mockImplementation((table) => {
          if (table === 'projects') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockProject,
                    error: null
                  })
                })
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  error: null
                })
              })
            } as any;
          }
          
          if (table === 'task_records') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' }
                  })
                })
              })
            } as any;
          }
          
          return {} as any;
        })(table);
      });

      const result = await taskService.createTaskRecord(mockTaskRecordData, mockClientId);

      expect(result).toEqual(expectedRecordWithoutBlockchain);
      expect(mockBlockchainInstance.recordTask).toHaveBeenCalledTimes(3); // 3 retry attempts
    });

    it('should update project status to completed when task is completed', async () => {
      await taskService.createTaskRecord(mockTaskRecordData, mockClientId);

      // Verify project status update was called with 'completed'
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
    });

    it('should update project status to cancelled when task is not completed', async () => {
      const incompleteTaskData = { ...mockTaskRecordData, completed: false };
      
      await taskService.createTaskRecord(incompleteTaskData, mockClientId);

      // Verify project status update was called
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
    });
  });

  describe('getTaskRecordByProjectId', () => {
    it('should return task record when found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCreatedTaskRecord,
              error: null
            })
          })
        })
      } as any);

      const result = await taskService.getTaskRecordByProjectId(mockProjectId);

      expect(result).toEqual(mockCreatedTaskRecord);
      expect(mockSupabase.from).toHaveBeenCalledWith('task_records');
    });

    it('should return null when task record not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      } as any);

      const result = await taskService.getTaskRecordByProjectId(mockProjectId);

      expect(result).toBeNull();
    });

    it('should throw AppError for database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'OTHER_ERROR', message: 'Database error' }
            })
          })
        })
      } as any);

      await expect(taskService.getTaskRecordByProjectId(mockProjectId))
        .rejects.toThrow(AppError);
    });
  });

  describe('getTaskRecordsByClientId', () => {
    it('should return array of task records for client', async () => {
      const mockTaskRecords = [mockCreatedTaskRecord];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockTaskRecords,
              error: null
            })
          })
        })
      } as any);

      const result = await taskService.getTaskRecordsByClientId(mockClientId);

      expect(result).toEqual(mockTaskRecords);
      expect(mockSupabase.from).toHaveBeenCalledWith('task_records');
    });

    it('should throw AppError for database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      } as any);

      await expect(taskService.getTaskRecordsByClientId(mockClientId))
        .rejects.toThrow(AppError);
    });
  });

  describe('getTaskRecordsByFreelancerId', () => {
    it('should return array of task records for freelancer', async () => {
      const mockTaskRecords = [mockCreatedTaskRecord];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockTaskRecords,
              error: null
            })
          })
        })
      } as any);

      const result = await taskService.getTaskRecordsByFreelancerId(mockFreelancerId);

      expect(result).toEqual(mockTaskRecords);
      expect(mockSupabase.from).toHaveBeenCalledWith('task_records');
    });
  });

  describe('updateTaskRating', () => {
    const mockRecordId = 'task-record-id';
    const mockRatingData = {
      rating: 5,
      comment: 'Excellent work!'
    };

    const mockTaskRecordWithoutRating = {
      ...mockCreatedTaskRecord,
      id: mockRecordId,
      rating: null,
      rating_comment: null,
      completed: true
    };

    const mockUpdatedTaskRecord = {
      ...mockTaskRecordWithoutRating,
      rating: 5,
      rating_comment: 'Excellent work!',
      updated_at: '2024-01-15T11:00:00Z'
    };

    it('should successfully update task rating', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'task_records') {
          let callCount = 0;
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockTaskRecordWithoutRating,
                  error: null
                })
              })
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockUpdatedTaskRecord,
                    error: null
                  })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      const result = await taskService.updateTaskRating(mockRecordId, mockRatingData, mockClientId);

      expect(result).toEqual(mockUpdatedTaskRecord);
      expect(mockSupabase.from).toHaveBeenCalledWith('task_records');
    });

    it('should successfully update task rating without comment', async () => {
      const ratingDataWithoutComment = { rating: 4 };
      const updatedRecordWithoutComment = {
        ...mockTaskRecordWithoutRating,
        rating: 4,
        rating_comment: null
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'task_records') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockTaskRecordWithoutRating,
                  error: null
                })
              })
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: updatedRecordWithoutComment,
                    error: null
                  })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      const result = await taskService.updateTaskRating(mockRecordId, ratingDataWithoutComment, mockClientId);

      expect(result.rating).toBe(4);
      expect(result.rating_comment).toBeNull();
    });

    it('should throw NotFoundError when task record does not exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      } as any);

      await expect(taskService.updateTaskRating(mockRecordId, mockRatingData, mockClientId))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when requester is not the task client', async () => {
      const differentClientId = 'different-client-id';
      const taskRecordWithDifferentClient = {
        ...mockTaskRecordWithoutRating,
        client_id: differentClientId
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: taskRecordWithDifferentClient,
              error: null
            })
          })
        })
      } as any);

      await expect(taskService.updateTaskRating(mockRecordId, mockRatingData, mockClientId))
        .rejects.toThrow(AuthorizationError);
    });

    it('should throw ConflictError when rating is already set', async () => {
      const taskRecordWithRating = {
        ...mockTaskRecordWithoutRating,
        rating: 3,
        rating_comment: 'Previous comment'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: taskRecordWithRating,
              error: null
            })
          })
        })
      } as any);

      await expect(taskService.updateTaskRating(mockRecordId, mockRatingData, mockClientId))
        .rejects.toThrow(ConflictError);
    });

    it('should throw ValidationError when task is not completed', async () => {
      const incompleteTaskRecord = {
        ...mockTaskRecordWithoutRating,
        completed: false
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: incompleteTaskRecord,
              error: null
            })
          })
        })
      } as any);

      await expect(taskService.updateTaskRating(mockRecordId, mockRatingData, mockClientId))
        .rejects.toThrow(ValidationError);
    });

    it('should throw AppError for database update errors', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'task_records') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockTaskRecordWithoutRating,
                  error: null
                })
              })
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Update failed' }
                  })
                })
              })
            })
          } as any;
        }
        return {} as any;
      });

      await expect(taskService.updateTaskRating(mockRecordId, mockRatingData, mockClientId))
        .rejects.toThrow(AppError);
    });
  });
});