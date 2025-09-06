import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

// Mock the database connections
jest.mock('../config/mongodb.js', () => ({
  initializeMongoDB: jest.fn().mockResolvedValue(true)
}));

jest.mock('../config/redis.js', () => ({
  initializeRedis: jest.fn().mockResolvedValue(true)
}));

jest.mock('../services/queueService.js', () => ({
  initializeQueues: jest.fn().mockResolvedValue(true)
}));

// Mock authentication middleware
jest.mock('../middleware/authMiddleware.js', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { _id: 'user123', email: 'test@example.com' };
    next();
  }
}));

describe('Workflows Service Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Workflow Management', () => {
    const testWorkflow = {
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

    it('should create a workflow', async () => {
      const response = await request(app)
        .post('/api/v1/workflows')
        .send(testWorkflow)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe('Test Workflow');
    });

    it('should get all workflows for user', async () => {
      const response = await request(app)
        .get('/api/v1/workflows')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get workflows with filters', async () => {
      const response = await request(app)
        .get('/api/v1/workflows?status=Active&siteId=site123')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should get specific workflow', async () => {
      // First create a workflow
      const createResponse = await request(app)
        .post('/api/v1/workflows')
        .send(testWorkflow)
        .expect(201);

      const workflowId = createResponse.body.id;

      // Then get the workflow
      const response = await request(app)
        .get(`/api/v1/workflows/${workflowId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(workflowId);
    });

    it('should update workflow', async () => {
      // First create a workflow
      const createResponse = await request(app)
        .post('/api/v1/workflows')
        .send(testWorkflow)
        .expect(201);

      const workflowId = createResponse.body.id;

      // Then update the workflow
      const updateData = {
        name: 'Updated Workflow',
        status: 'Active'
      };

      const response = await request(app)
        .put(`/api/v1/workflows/${workflowId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe('Updated Workflow');
      expect(response.body.status).toBe('Active');
    });

    it('should update workflow status only', async () => {
      // First create a workflow
      const createResponse = await request(app)
        .post('/api/v1/workflows')
        .send(testWorkflow)
        .expect(201);

      const workflowId = createResponse.body.id;

      // Then update the status
      const response = await request(app)
        .patch(`/api/v1/workflows/${workflowId}/status`)
        .send({ status: 'Active' })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('Active');
    });

    it('should delete workflow', async () => {
      // First create a workflow
      const createResponse = await request(app)
        .post('/api/v1/workflows')
        .send(testWorkflow)
        .expect(201);

      const workflowId = createResponse.body.id;

      // Then delete the workflow
      const response = await request(app)
        .delete(`/api/v1/workflows/${workflowId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
    });
  });

  describe('Workflow Analytics', () => {
    it('should get workflow analytics', async () => {
      // First create a workflow
      const createResponse = await request(app)
        .post('/api/v1/workflows')
        .send({
          name: 'Analytics Test Workflow',
          siteId: 'site123',
          nodes: [],
          edges: []
        })
        .expect(201);

      const workflowId = createResponse.body.id;

      // Then get analytics
      const response = await request(app)
        .get(`/api/v1/workflows/${workflowId}/analytics`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.totalTriggers).toBeDefined();
      expect(response.body.totalCompletions).toBeDefined();
      expect(response.body.conversionRate).toBeDefined();
    });

    it('should get workflow activity', async () => {
      // First create a workflow
      const createResponse = await request(app)
        .post('/api/v1/workflows')
        .send({
          name: 'Activity Test Workflow',
          siteId: 'site123',
          nodes: [],
          edges: []
        })
        .expect(201);

      const workflowId = createResponse.body.id;

      // Then get activity
      const response = await request(app)
        .get(`/api/v1/workflows/${workflowId}/activity`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.activities).toBeDefined();
      expect(response.body.totalCount).toBeDefined();
    });

    it('should get workflow performance chart', async () => {
      // First create a workflow
      const createResponse = await request(app)
        .post('/api/v1/workflows')
        .send({
          name: 'Chart Test Workflow',
          siteId: 'site123',
          nodes: [],
          edges: []
        })
        .expect(201);

      const workflowId = createResponse.body.id;

      // Then get chart data
      const response = await request(app)
        .get(`/api/v1/workflows/${workflowId}/chart?period=30d`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get workflow node performance', async () => {
      // First create a workflow
      const createResponse = await request(app)
        .post('/api/v1/workflows')
        .send({
          name: 'Node Performance Test Workflow',
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
          edges: []
        })
        .expect(201);

      const workflowId = createResponse.body.id;

      // Then get node performance
      const response = await request(app)
        .get(`/api/v1/workflows/${workflowId}/nodes`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Workflow Execution', () => {
    it('should execute workflow action', async () => {
      const actionData = {
        workflowId: 'workflow123',
        nodeId: 'node1',
        siteId: 'site123',
        visitorId: 'visitor123',
        identifiedUser: { email: 'user@example.com' },
        localStorageData: { key: 'value' }
      };

      const response = await request(app)
        .post('/api/v1/execution/action')
        .send(actionData)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should get execution status', async () => {
      const response = await request(app)
        .get('/api/v1/execution/status/job123')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should get execution logs', async () => {
      const response = await request(app)
        .get('/api/v1/execution/logs/workflow123')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Analytics Tracking', () => {
    it('should track workflow event', async () => {
      const eventData = {
        siteId: 'site123',
        workflowId: 'workflow123',
        visitorId: 'visitor123',
        event: 'Trigger',
        nodeId: 'node1',
        nodeTitle: 'Exit Intent',
        detail: 'User triggered exit intent'
      };

      const response = await request(app)
        .post('/api/v1/workflows/analytics/track')
        .send(eventData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
    });

    it('should get workflow analytics', async () => {
      const response = await request(app)
        .get('/api/v1/workflows/analytics/workflow123')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should get workflow activity', async () => {
      const response = await request(app)
        .get('/api/v1/workflows/analytics/workflow123/activity')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should get workflow performance chart', async () => {
      const response = await request(app)
        .get('/api/v1/workflows/analytics/workflow123/chart')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should get workflow node performance', async () => {
      const response = await request(app)
        .get('/api/v1/workflows/analytics/workflow123/nodes')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should get workflow summaries', async () => {
      const response = await request(app)
        .get('/api/v1/workflows/analytics/summary')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Public Endpoints', () => {
    it('should get active workflows for site', async () => {
      const response = await request(app)
        .get('/api/v1/workflows/site/site123/active')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.workflows).toBeDefined();
      expect(Array.isArray(response.body.workflows)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid workflow creation', async () => {
      const invalidWorkflow = {
        name: '', // Invalid: empty name
        siteId: 'site123',
        nodes: [],
        edges: []
      };

      const response = await request(app)
        .post('/api/v1/workflows')
        .send(invalidWorkflow)
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBe('Validation Error');
    });

    it('should handle non-existent workflow', async () => {
      const response = await request(app)
        .get('/api/v1/workflows/nonexistent')
        .expect(404);

      expect(response.body).toBeDefined();
    });

    it('should handle invalid status update', async () => {
      // First create a workflow
      const createResponse = await request(app)
        .post('/api/v1/workflows')
        .send({
          name: 'Status Test Workflow',
          siteId: 'site123',
          nodes: [],
          edges: []
        })
        .expect(201);

      const workflowId = createResponse.body.id;

      // Then try to update with invalid status
      const response = await request(app)
        .patch(`/api/v1/workflows/${workflowId}/status`)
        .send({ status: 'Invalid' })
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBe('Validation Error');
    });
  });
}); 