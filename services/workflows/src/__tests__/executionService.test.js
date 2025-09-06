import { jest } from '@jest/globals';
import { ExecutionService } from '../services/executionService.js';
import { NotFoundError } from '../utils/errors.js';

// Mock the services
jest.mock('../services/workflowService.js', () => ({
  workflowService: {
    getWorkflow: jest.fn(),
    incrementCompletions: jest.fn()
  }
}));

jest.mock('../services/analyticsService.js', () => ({
  analyticsService: {
    trackWorkflowEvent: jest.fn()
  }
}));

jest.mock('../utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('ExecutionService', () => {
  let executionService;
  let mockWorkflow;
  let mockNode;

  beforeEach(() => {
    executionService = new ExecutionService();
    mockWorkflow = {
      _id: 'workflow123',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          data: {
            title: 'Send Email',
            settings: {
              emailTo: 'test@example.com',
              emailSubject: 'Test Subject',
              emailBody: 'Test Body'
            }
          }
        },
        {
          id: 'node2',
          data: {
            title: 'Webhook',
            settings: {
              webhookUrl: 'https://api.example.com/webhook',
              webhookMethod: 'POST',
              webhookBody: '{"test": "data"}'
            }
          }
        }
      ]
    };

    mockNode = mockWorkflow.nodes[0];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeWorkflowAction', () => {
    it('should execute workflow action successfully', async () => {
      const actionData = {
        workflowId: 'workflow123',
        nodeId: 'node1',
        siteId: 'site123',
        visitorId: 'visitor123',
        identifiedUser: { email: 'user@example.com' },
        localStorageData: { key: 'value' }
      };

      const { workflowService, analyticsService } = await import('../services/workflowService.js');
      workflowService.getWorkflow.mockResolvedValue(mockWorkflow);
      analyticsService.trackWorkflowEvent.mockResolvedValue({ success: true });
      workflowService.incrementCompletions.mockResolvedValue(true);

      const result = await executionService.executeWorkflowAction(actionData);

      expect(result).toBeDefined();
      expect(workflowService.getWorkflow).toHaveBeenCalledWith('workflow123', 'system');
      expect(analyticsService.trackWorkflowEvent).toHaveBeenCalled();
      expect(workflowService.incrementCompletions).toHaveBeenCalledWith('workflow123');
    });

    it('should throw NotFoundError for non-existent workflow', async () => {
      const actionData = {
        workflowId: 'nonexistent',
        nodeId: 'node1',
        siteId: 'site123',
        visitorId: 'visitor123'
      };

      const { workflowService } = await import('../services/workflowService.js');
      workflowService.getWorkflow.mockResolvedValue(null);

      await expect(executionService.executeWorkflowAction(actionData))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for non-existent node', async () => {
      const actionData = {
        workflowId: 'workflow123',
        nodeId: 'nonexistent',
        siteId: 'site123',
        visitorId: 'visitor123'
      };

      const { workflowService } = await import('../services/workflowService.js');
      workflowService.getWorkflow.mockResolvedValue(mockWorkflow);

      await expect(executionService.executeWorkflowAction(actionData))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('executeServerAction', () => {
    it('should execute Send Email action', async () => {
      const context = {
        workflowId: 'workflow123',
        siteId: 'site123',
        visitorId: 'visitor123',
        identifiedUser: { email: 'user@example.com' },
        localStorageData: { key: 'value' }
      };

      const result = await executionService.executeServerAction(mockNode, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should execute Webhook action', async () => {
      const webhookNode = mockWorkflow.nodes[1];
      const context = {
        workflowId: 'workflow123',
        siteId: 'site123',
        visitorId: 'visitor123',
        identifiedUser: { email: 'user@example.com' },
        localStorageData: { key: 'value' }
      };

      const result = await executionService.executeServerAction(webhookNode, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle unknown action type', async () => {
      const unknownNode = {
        id: 'node3',
        data: {
          title: 'Unknown Action',
          settings: {}
        }
      };

      const context = {
        workflowId: 'workflow123',
        siteId: 'site123',
        visitorId: 'visitor123'
      };

      const result = await executionService.executeServerAction(unknownNode, context);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown action type');
    });
  });

  describe('sendEmail', () => {
    it('should send email with processed content', async () => {
      const settings = {
        emailTo: 'test@example.com',
        emailSubject: 'Hello {{user.email}}',
        emailBody: 'Welcome {{user.email}}!'
      };

      const context = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: { key: 'value' }
      };

      const result = await executionService.sendEmail(settings, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.subject).toContain('user@example.com');
      expect(result.body).toContain('user@example.com');
    });

    it('should handle missing user data', async () => {
      const settings = {
        emailTo: 'test@example.com',
        emailSubject: 'Hello {{user.email}}',
        emailBody: 'Welcome!'
      };

      const context = {
        identifiedUser: null,
        localStorageData: {}
      };

      const result = await executionService.sendEmail(settings, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('sendWebhook', () => {
    it('should send webhook with processed content', async () => {
      const settings = {
        webhookUrl: 'https://api.example.com/webhook',
        webhookMethod: 'POST',
        webhookBody: '{"user": "{{user.email}}", "data": "{{localStorage.key}}"}'
      };

      const context = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: { key: 'value' }
      };

      const result = await executionService.sendWebhook(settings, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://api.example.com/webhook');
      expect(result.method).toBe('POST');
    });

    it('should handle missing webhook settings', async () => {
      const settings = {};
      const context = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: {}
      };

      const result = await executionService.sendWebhook(settings, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe('addTag', () => {
    it('should add tag successfully', async () => {
      const settings = {
        tagName: 'VIP Customer'
      };

      const context = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: {}
      };

      const result = await executionService.addTag(settings, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.tagName).toBe('VIP Customer');
    });
  });

  describe('removeTag', () => {
    it('should remove tag successfully', async () => {
      const settings = {
        tagName: 'Old Tag'
      };

      const context = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: {}
      };

      const result = await executionService.removeTag(settings, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.tagName).toBe('Old Tag');
    });
  });

  describe('executeCustomCode', () => {
    it('should execute custom code successfully', async () => {
      const settings = {
        customCode: 'console.log("Hello World"); return { success: true };'
      };

      const context = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: { key: 'value' }
      };

      const result = await executionService.executeCustomCode(settings, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle custom code errors', async () => {
      const settings = {
        customCode: 'throw new Error("Test error");'
      };

      const context = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: {}
      };

      const result = await executionService.executeCustomCode(settings, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('replacePlaceholders', () => {
    it('should replace user placeholders', () => {
      const text = 'Hello {{user.email}}!';
      const data = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: {}
      };

      const result = executionService.replacePlaceholders(text, data);

      expect(result).toBe('Hello user@example.com!');
    });

    it('should replace localStorage placeholders', () => {
      const text = 'Data: {{localStorage.key}}';
      const data = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: { key: 'value' }
      };

      const result = executionService.replacePlaceholders(text, data);

      expect(result).toBe('Data: value');
    });

    it('should handle missing placeholders', () => {
      const text = 'Hello {{user.name}}!';
      const data = {
        identifiedUser: { email: 'user@example.com' },
        localStorageData: {}
      };

      const result = executionService.replacePlaceholders(text, data);

      expect(result).toBe('Hello !');
    });
  });
}); 