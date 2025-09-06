import { jest } from '@jest/globals';
import { WorkflowService } from '../services/workflowService.js';
import { Workflow } from '../models/Workflow.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';

// Mock the Workflow model
jest.mock('../models/Workflow.js');
jest.mock('../utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

describe('WorkflowService', () => {
  let workflowService;
  let mockWorkflow;

  beforeEach(() => {
    workflowService = new WorkflowService();
    mockWorkflow = {
      _id: 'workflow123',
      name: 'Test Workflow',
      category: 'Marketing',
      status: 'Draft',
      siteId: 'site123',
      userId: 'user123',
      nodes: [
        {
          id: 'node1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: {
            iconName: 'MousePointer',
            title: 'Exit Intent',
            type: 'Trigger',
            color: 'hsl(var(--chart-1))',
            settings: {}
          }
        }
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2'
        }
      ],
      totalTriggers: 0,
      totalCompletions: 0,
      completionRate: '0.0%',
      toObject: jest.fn().mockReturnValue({
        _id: 'workflow123',
        name: 'Test Workflow',
        category: 'Marketing',
        status: 'Draft',
        siteId: 'site123',
        userId: 'user123',
        nodes: [],
        edges: [],
        totalTriggers: 0,
        totalCompletions: 0,
        completionRate: '0.0%'
      })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkflow', () => {
    it('should create a workflow successfully', async () => {
      const workflowData = {
        name: 'Test Workflow',
        category: 'Marketing',
        siteId: 'site123',
        nodes: [
          {
            id: 'node1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: {
              iconName: 'MousePointer',
              title: 'Exit Intent',
              type: 'Trigger',
              color: 'hsl(var(--chart-1))',
              settings: {}
            }
          }
        ],
        edges: [
          {
            id: 'edge1',
            source: 'node1',
            target: 'node2'
          }
        ]
      };

      const mockSave = jest.fn().mockResolvedValue(mockWorkflow);
      Workflow.mockImplementation(() => ({
        save: mockSave
      }));

      const result = await workflowService.createWorkflow(workflowData, 'user123');

      expect(result).toBeDefined();
      expect(result.id).toBe('workflow123');
      expect(result.name).toBe('Test Workflow');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid workflow data', async () => {
      const invalidWorkflowData = {
        name: '', // Invalid: empty name
        siteId: 'site123',
        nodes: [],
        edges: []
      };

      await expect(workflowService.createWorkflow(invalidWorkflowData, 'user123'))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('getWorkflow', () => {
    it('should return workflow for valid user', async () => {
      Workflow.findById.mockResolvedValue(mockWorkflow);

      const result = await workflowService.getWorkflow('workflow123', 'user123');

      expect(result).toBeDefined();
      expect(result.id).toBe('workflow123');
      expect(Workflow.findById).toHaveBeenCalledWith('workflow123');
    });

    it('should throw NotFoundError for non-existent workflow', async () => {
      Workflow.findById.mockResolvedValue(null);

      await expect(workflowService.getWorkflow('nonexistent', 'user123'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError for unauthorized user', async () => {
      Workflow.findById.mockResolvedValue(mockWorkflow);

      await expect(workflowService.getWorkflow('workflow123', 'unauthorized'))
        .rejects.toThrow(ForbiddenError);
    });
  });

  describe('updateWorkflow', () => {
    it('should update workflow successfully', async () => {
      const updateData = { name: 'Updated Workflow' };
      const updatedWorkflow = { ...mockWorkflow, name: 'Updated Workflow' };

      Workflow.findById.mockResolvedValue(mockWorkflow);
      Workflow.findByIdAndUpdate.mockResolvedValue(updatedWorkflow);

      const result = await workflowService.updateWorkflow('workflow123', updateData, 'user123');

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Workflow');
    });

    it('should throw NotFoundError for non-existent workflow', async () => {
      Workflow.findById.mockResolvedValue(null);

      await expect(workflowService.updateWorkflow('nonexistent', {}, 'user123'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete workflow successfully', async () => {
      Workflow.findById.mockResolvedValue(mockWorkflow);
      Workflow.findByIdAndDelete.mockResolvedValue(mockWorkflow);

      const result = await workflowService.deleteWorkflow('workflow123', 'user123');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundError for non-existent workflow', async () => {
      Workflow.findById.mockResolvedValue(null);

      await expect(workflowService.deleteWorkflow('nonexistent', 'user123'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getWorkflows', () => {
    it('should return workflows for user', async () => {
      const mockWorkflows = [mockWorkflow];
      Workflow.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockWorkflows)
      });

      const result = await workflowService.getWorkflows('user123');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should apply filters correctly', async () => {
      const filters = { status: 'Active', siteId: 'site123' };
      Workflow.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      await workflowService.getWorkflows('user123', filters);

      expect(Workflow.find).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          status: 'Active',
          siteId: 'site123'
        })
      );
    });
  });

  describe('getActiveWorkflows', () => {
    it('should return active workflows for site', async () => {
      const mockWorkflows = [mockWorkflow];
      Workflow.find.mockResolvedValue(mockWorkflows);

      const result = await workflowService.getActiveWorkflows('site123');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(Workflow.find).toHaveBeenCalledWith({
        siteId: 'site123',
        status: 'Active'
      });
    });
  });

  describe('incrementTriggers', () => {
    it('should increment triggers successfully', async () => {
      Workflow.findByIdAndUpdate.mockResolvedValue(mockWorkflow);

      await workflowService.incrementTriggers('workflow123');

      expect(Workflow.findByIdAndUpdate).toHaveBeenCalledWith(
        'workflow123',
        { $inc: { totalTriggers: 1 } },
        { new: true }
      );
    });
  });

  describe('incrementCompletions', () => {
    it('should increment completions and update rate', async () => {
      const updatedWorkflow = {
        ...mockWorkflow,
        totalTriggers: 10,
        totalCompletions: 5
      };
      Workflow.findByIdAndUpdate.mockResolvedValue(updatedWorkflow);

      await workflowService.incrementCompletions('workflow123');

      expect(Workflow.findByIdAndUpdate).toHaveBeenCalledWith(
        'workflow123',
        expect.objectContaining({
          $inc: { totalCompletions: 1 }
        }),
        { new: true }
      );
    });
  });
}); 