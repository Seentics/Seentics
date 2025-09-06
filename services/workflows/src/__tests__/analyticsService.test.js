import { jest } from '@jest/globals';
import { AnalyticsService } from '../services/analyticsService.js';
import { WorkflowEvent } from '../models/WorkflowEvent.js';
import { Workflow } from '../models/Workflow.js';

// Mock the models
jest.mock('../models/WorkflowEvent.js');
jest.mock('../models/Workflow.js');
jest.mock('../utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

describe('AnalyticsService', () => {
  let analyticsService;
  let mockEvent;
  let mockWorkflow;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    mockEvent = {
      _id: 'event123',
      siteId: 'site123',
      workflowId: 'workflow123',
      visitorId: 'visitor123',
      event: 'Trigger',
      nodeId: 'node1',
      nodeTitle: 'Exit Intent',
      detail: 'User triggered exit intent',
      timestamp: new Date(),
      save: jest.fn().mockResolvedValue(true)
    };

    mockWorkflow = {
      _id: 'workflow123',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          data: { title: 'Exit Intent' }
        },
        {
          id: 'node2',
          data: { title: 'Send Email' }
        }
      ]
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackWorkflowEvent', () => {
    it('should track workflow event successfully', async () => {
      const eventData = {
        siteId: 'site123',
        workflowId: 'workflow123',
        visitorId: 'visitor123',
        event: 'Trigger',
        nodeId: 'node1',
        nodeTitle: 'Exit Intent',
        detail: 'User triggered exit intent'
      };

      WorkflowEvent.mockImplementation(() => mockEvent);

      const result = await analyticsService.trackWorkflowEvent(eventData);

      expect(result).toEqual({ success: true });
      expect(mockEvent.save).toHaveBeenCalled();
    });

    it('should handle tracking errors', async () => {
      const eventData = {
        siteId: 'site123',
        workflowId: 'workflow123',
        visitorId: 'visitor123',
        event: 'Trigger',
        nodeId: 'node1',
        nodeTitle: 'Exit Intent'
      };

      WorkflowEvent.mockImplementation(() => ({
        ...mockEvent,
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      await expect(analyticsService.trackWorkflowEvent(eventData))
        .rejects.toThrow('Database error');
    });
  });

  describe('getWorkflowAnalytics', () => {
    it('should return workflow analytics with correct metrics', async () => {
      const mockEvents = [
        { event: 'Trigger', timestamp: new Date() },
        { event: 'Trigger', timestamp: new Date() },
        { event: 'Action Executed', timestamp: new Date() },
        { event: 'Action Executed', timestamp: new Date() }
      ];

      WorkflowEvent.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockEvents)
      });

      const result = await analyticsService.getWorkflowAnalytics('workflow123');

      expect(result).toBeDefined();
      expect(result.totalTriggers).toBe(2);
      expect(result.totalCompletions).toBe(2);
      expect(result.conversionRate).toBe('100.0%');
      expect(result.dailyData).toBeDefined();
      expect(result.hourlyData).toBeDefined();
      expect(result.recentEvents).toBeDefined();
    });

    it('should handle date range filters', async () => {
      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      WorkflowEvent.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      await analyticsService.getWorkflowAnalytics('workflow123', dateRange);

      expect(WorkflowEvent.find).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowId: 'workflow123',
          timestamp: expect.objectContaining({
            $gte: new Date('2024-01-01'),
            $lte: new Date('2024-01-31')
          })
        })
      );
    });

    it('should handle zero triggers correctly', async () => {
      WorkflowEvent.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const result = await analyticsService.getWorkflowAnalytics('workflow123');

      expect(result.totalTriggers).toBe(0);
      expect(result.totalCompletions).toBe(0);
      expect(result.conversionRate).toBe('0.0%');
    });
  });

  describe('getWorkflowActivity', () => {
    it('should return workflow activity with pagination', async () => {
      const mockActivities = [
        { event: 'Trigger', timestamp: new Date() },
        { event: 'Action Executed', timestamp: new Date() }
      ];

      WorkflowEvent.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockActivities)
          })
        })
      });

      WorkflowEvent.countDocuments.mockResolvedValue(10);

      const result = await analyticsService.getWorkflowActivity('workflow123', {
        limit: 5,
        offset: 0
      });

      expect(result).toBeDefined();
      expect(result.activities).toBeDefined();
      expect(result.totalCount).toBe(10);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('getWorkflowPerformanceChart', () => {
    it('should return performance chart data', async () => {
      const mockChartData = [
        { date: '2024-01-01', triggers: 10, completions: 5 },
        { date: '2024-01-02', triggers: 15, completions: 8 }
      ];

      WorkflowEvent.aggregate.mockResolvedValue(mockChartData);

      const result = await analyticsService.getWorkflowPerformanceChart('workflow123', '30d');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(WorkflowEvent.aggregate).toHaveBeenCalled();
    });
  });

  describe('getWorkflowNodePerformance', () => {
    it('should return node performance data', async () => {
      const mockNodeData = [
        { nodeId: 'node1', triggers: 10, completions: 5 },
        { nodeId: 'node2', triggers: 8, completions: 3 }
      ];

      WorkflowEvent.aggregate.mockResolvedValue(mockNodeData);
      Workflow.findById.mockResolvedValue(mockWorkflow);

      const result = await analyticsService.getWorkflowNodePerformance('workflow123');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(WorkflowEvent.aggregate).toHaveBeenCalled();
      expect(Workflow.findById).toHaveBeenCalled();
    });
  });

  describe('groupEventsByDate', () => {
    it('should group events by date correctly', () => {
      const events = [
        { event: 'Trigger', timestamp: new Date('2024-01-01') },
        { event: 'Trigger', timestamp: new Date('2024-01-01') },
        { event: 'Action Executed', timestamp: new Date('2024-01-01') },
        { event: 'Trigger', timestamp: new Date('2024-01-02') }
      ];

      const result = analyticsService.groupEventsByDate(events);

      expect(result).toBeDefined();
      expect(result['2024-01-01']).toBeDefined();
      expect(result['2024-01-02']).toBeDefined();
    });
  });

  describe('groupEventsByHour', () => {
    it('should group events by hour correctly', () => {
      const events = [
        { event: 'Trigger', timestamp: new Date('2024-01-01T10:00:00') },
        { event: 'Trigger', timestamp: new Date('2024-01-01T10:30:00') },
        { event: 'Action Executed', timestamp: new Date('2024-01-01T11:00:00') }
      ];

      const result = analyticsService.groupEventsByHour(events);

      expect(result).toBeDefined();
      expect(result[10]).toBeDefined();
      expect(result[11]).toBeDefined();
    });
  });
}); 