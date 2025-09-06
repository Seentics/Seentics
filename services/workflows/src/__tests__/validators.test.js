import { jest } from '@jest/globals';
import { validateWorkflow, validateWorkflowRequest, validateWorkflowUpdate, validateNodeSettings } from '../utils/validators.js';

describe('Validators', () => {
  describe('validateWorkflow', () => {
    it('should validate a valid workflow', () => {
      const validWorkflow = {
        name: 'Test Workflow',
        category: 'Marketing',
        status: 'Draft',
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

      const result = validateWorkflow(validWorkflow);
      expect(result.error).toBeUndefined();
    });

    it('should reject workflow with empty name', () => {
      const invalidWorkflow = {
        name: '',
        siteId: 'site123',
        nodes: [],
        edges: []
      };

      const result = validateWorkflow(invalidWorkflow);
      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toContain('name');
    });

    it('should reject workflow with invalid status', () => {
      const invalidWorkflow = {
        name: 'Test Workflow',
        status: 'Invalid',
        siteId: 'site123',
        nodes: [],
        edges: []
      };

      const result = validateWorkflow(invalidWorkflow);
      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toContain('status');
    });

    it('should reject workflow with invalid node type', () => {
      const invalidWorkflow = {
        name: 'Test Workflow',
        siteId: 'site123',
        nodes: [
          {
            id: 'node1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: {
              iconName: 'MousePointer',
              title: 'Exit Intent',
              type: 'Invalid', // Invalid type
              color: 'hsl(var(--chart-1))',
              settings: {}
            }
          }
        ],
        edges: []
      };

      const result = validateWorkflow(invalidWorkflow);
      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toContain('type');
    });

    it('should reject workflow with missing required fields', () => {
      const invalidWorkflow = {
        name: 'Test Workflow',
        // Missing siteId, nodes, edges
      };

      const result = validateWorkflow(invalidWorkflow);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateWorkflowRequest', () => {
    it('should validate a valid workflow request', () => {
      const validRequest = {
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

      const result = validateWorkflowRequest(validRequest);
      expect(result.error).toBeUndefined();
    });

    it('should reject request with missing required fields', () => {
      const invalidRequest = {
        name: 'Test Workflow',
        // Missing siteId, nodes, edges
      };

      const result = validateWorkflowRequest(invalidRequest);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateWorkflowUpdate', () => {
    it('should validate a valid workflow update', () => {
      const validUpdate = {
        name: 'Updated Workflow',
        status: 'Active'
      };

      const result = validateWorkflowUpdate(validUpdate);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty update object', () => {
      const emptyUpdate = {};

      const result = validateWorkflowUpdate(emptyUpdate);
      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toContain('at least 1');
    });

    it('should accept partial updates', () => {
      const partialUpdate = {
        status: 'Active'
      };

      const result = validateWorkflowUpdate(partialUpdate);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateNodeSettings', () => {
    it('should validate Send Email node settings', () => {
      const validSettings = {
        emailTo: 'test@example.com',
        emailSubject: 'Test Subject',
        emailBody: 'Test Body'
      };

      const result = validateNodeSettings('Send Email', validSettings);
      expect(result.error).toBeUndefined();
    });

    it('should validate Webhook node settings', () => {
      const validSettings = {
        webhookUrl: 'https://api.example.com/webhook',
        webhookMethod: 'POST',
        webhookBody: '{"test": "data"}'
      };

      const result = validateNodeSettings('Webhook', validSettings);
      expect(result.error).toBeUndefined();
    });

    it('should validate Add Tag node settings', () => {
      const validSettings = {
        tagName: 'VIP Customer'
      };

      const result = validateNodeSettings('Add Tag', validSettings);
      expect(result.error).toBeUndefined();
    });

    it('should validate Remove Tag node settings', () => {
      const validSettings = {
        tagName: 'Old Tag'
      };

      const result = validateNodeSettings('Remove Tag', validSettings);
      expect(result.error).toBeUndefined();
    });

    it('should validate Custom Code node settings', () => {
      const validSettings = {
        customCode: 'console.log("Hello World");'
      };

      const result = validateNodeSettings('Custom Code', validSettings);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid Send Email settings', () => {
      const invalidSettings = {
        emailTo: '', // Empty email
        emailSubject: 'Test Subject',
        emailBody: 'Test Body'
      };

      const result = validateNodeSettings('Send Email', invalidSettings);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid Webhook settings', () => {
      const invalidSettings = {
        webhookUrl: 'invalid-url', // Invalid URL
        webhookMethod: 'POST',
        webhookBody: '{"test": "data"}'
      };

      const result = validateNodeSettings('Webhook', invalidSettings);
      expect(result.error).toBeDefined();
    });

    it('should handle unknown node types', () => {
      const settings = { test: 'value' };

      const result = validateNodeSettings('Unknown Type', settings);
      expect(result.error).toBeUndefined(); // Should not throw for unknown types
    });
  });

  describe('Edge validation', () => {
    it('should validate valid edges', () => {
      const validWorkflow = {
        name: 'Test Workflow',
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
            target: 'node2',
            animated: true
          }
        ]
      };

      const result = validateWorkflow(validWorkflow);
      expect(result.error).toBeUndefined();
    });

    it('should reject edges with missing required fields', () => {
      const invalidWorkflow = {
        name: 'Test Workflow',
        siteId: 'site123',
        nodes: [],
        edges: [
          {
            id: 'edge1',
            // Missing source and target
          }
        ]
      };

      const result = validateWorkflow(invalidWorkflow);
      expect(result.error).toBeDefined();
    });
  });

  describe('Node validation', () => {
    it('should validate nodes with UI-specific properties', () => {
      const workflowWithUIProps = {
        name: 'Test Workflow',
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
            },
            selected: true,
            dragging: false,
            positionAbsolute: { x: 100, y: 100 },
            measured: { width: 200, height: 100 },
            resizing: false
          }
        ],
        edges: []
      };

      const result = validateWorkflow(workflowWithUIProps);
      expect(result.error).toBeUndefined();
    });

    it('should reject nodes with invalid position', () => {
      const invalidWorkflow = {
        name: 'Test Workflow',
        siteId: 'site123',
        nodes: [
          {
            id: 'node1',
            type: 'custom',
            position: { x: 'invalid', y: 100 }, // Invalid x position
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
      };

      const result = validateWorkflow(invalidWorkflow);
      expect(result.error).toBeDefined();
    });
  });
}); 