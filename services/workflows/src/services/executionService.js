import * as workflowService from './workflowService.js';
import * as analyticsService from './analyticsService.js';
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';
import { config } from '../config/config.js';
import crypto from 'crypto';
import { withRetry } from './retryPolicy.js';
import * as visitorService from './visitorService.js';

// Active executions map
const activeExecutions = new Map();

// Execute workflow action
export const executeWorkflowAction = async (actionData) => {
    try {
      const { workflowId, nodeId, siteId, visitorId, identifiedUser, localStorageData } = actionData;
      
      // Get workflow to validate
      const workflow = await workflowService.getWorkflow(workflowId, 'system'); // Use system user for execution
      if (!workflow) {
        throw new NotFoundError('Workflow not found');
      }
      
      // Find the node
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) {
        throw new NotFoundError('Node not found');
      }
      
      // Execute the action based on node type
      const result = await executeServerAction(node, {
        workflowId,
        siteId,
        visitorId,
        identifiedUser,
        localStorageData
      });
      
      // Track the action execution
      await analyticsService.trackWorkflowEvent({
        siteId,
        workflowId,
        visitorId,
        event: 'Action Executed',
        nodeId: node.id,
        nodeTitle: node.data.title,
        detail: 'Server action executed'
      });
      
      // Increment completions counter
      await workflowService.incrementCompletions(workflowId);
      
      logger.info(`Server action executed: ${node.data.title}`, {
        workflowId,
        nodeId,
        visitorId
      });
      
      return result;
    } catch (error) {
      logger.error('Error executing workflow action:', error);
      throw error;
    }
};

// Execute server action
const executeServerAction = async (node, context) => {
    const { title, settings } = node.data;
    const { workflowId, siteId, visitorId, identifiedUser, localStorageData } = context;
    
    // MVP Actions Only - Simplified execution
    switch (title) {
      case 'Webhook':
        return await sendWebhook(settings, context);
      
      case 'Track Event':
        return await trackEvent(settings, context);
      
      default:
        logger.warn(`Unknown or unsupported server action: ${title}`);
        return { success: false, error: 'Action not supported in MVP' };
    }
};

// Execute server action from workflow execution
export const _executeServerAction = async (actionData) => {
    try {
      const { workflowId, nodeId, siteId, visitorId, identifiedUser, localStorageData } = actionData;
      
      // Get workflow to validate
      const workflow = await workflowService.getWorkflow(workflowId, 'system'); // Use system user for execution
      if (!workflow) {
        throw new NotFoundError('Workflow not found');
      }
      
      // Find the node
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) {
        throw new NotFoundError('Node not found');
      }
      
      // Execute the action based on node type
      const result = await executeServerAction(node, {
        workflowId,
        siteId,
        visitorId,
        identifiedUser,
        localStorageData
      });
      
      // Track the action execution
      // await analyticsService.trackWorkflowEvent({
      //   siteId,
      //   workflowId,
      //   visitorId,
      //   event: 'Action Executed',
      //   nodeId: node.id,
      //   nodeTitle: node.data.title,
      //   detail: 'Server action executed'
      // });
      
      // Increment completions counter
      await workflowService.incrementCompletions(workflowId);
      
      logger.info(`Server action executed: ${node.data.title}`, {
        workflowId,
        nodeId,
        visitorId
      });
      
      return result;
    } catch (error) {
      logger.error('Error executing server action:', error);
      throw error;
    }
};

// MVP Action: Track Event
const trackEvent = async (settings, context) => {
    try {
      const { eventName, eventData } = settings;
      const { siteId, visitorId } = context;
      
      // Send event to analytics service
      await analyticsService.trackWorkflowEvent({
        siteId,
        visitorId,
        event: eventName || 'Custom Event',
        detail: eventData || {},
        timestamp: new Date().toISOString()
      });
      
      logger.info('Event tracked successfully', { eventName, siteId, visitorId });
      return { success: true, message: 'Event tracked successfully' };
    } catch (error) {
      logger.error('Error tracking event:', error);
      return { success: false, error: error.message };
    }
};

// Helper function to substitute template variables
const substituteTemplateVariables = (template, context) => {
    const { visitorId, identifiedUser, localStorageData, siteId } = context;
    const timestamp = new Date().toISOString();
    
    return template
      .replace(/\{\{visitorId\}\}/g, visitorId || '')
      .replace(/\{\{user\.email\}\}/g, identifiedUser?.email || '')
      .replace(/\{\{user\.name\}\}/g, identifiedUser?.name || '')
      .replace(/\{\{user\.id\}\}/g, identifiedUser?.id || '')
      .replace(/\{\{timestamp\}\}/g, timestamp)
      .replace(/\{\{siteId\}\}/g, siteId || '')
      .replace(/\{\{localStorage\.([^}]+)\}\}/g, (match, key) => {
        return localStorageData?.[key] || '';
      });
};

// Send webhook
const sendWebhook = async (settings, context) => {
    try {
      const { webhookUrl, webhookMethod = 'POST', webhookHeaders = {}, webhookBody } = settings;
      const { visitorId, identifiedUser, localStorageData } = context;
      
      // Parse custom webhook body with variable substitution
      let customPayload = {};
      if (webhookBody) {
        try {
          const substitutedBody = substituteTemplateVariables(webhookBody, context);
          customPayload = JSON.parse(substitutedBody);
        } catch (error) {
          logger.warn('Failed to parse custom webhook body, using as string:', error.message);
          customPayload = { customData: substituteTemplateVariables(webhookBody, context) };
        }
      }
      
      const payload = {
        visitorId,
        identifiedUser,
        localStorageData,
        timestamp: new Date().toISOString(),
        ...customPayload
      };
      
      // Process custom headers with variable substitution
      const processedHeaders = {};
      for (const [key, value] of Object.entries(webhookHeaders || {})) {
        processedHeaders[key] = substituteTemplateVariables(value, context);
      }
      
      // HMAC signature if configured
      const headers = {
        'Content-Type': 'application/json',
        ...processedHeaders
      };
      if (config.webhooks.hmacSecret) {
        const signature = crypto
          .createHmac('sha256', config.webhooks.hmacSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        headers['X-Seentics-Signature'] = signature;
      }

      const response = await withRetry(async () => {
        const r = await fetch(webhookUrl, {
          method: webhookMethod,
          headers,
          body: JSON.stringify(payload)
        });
        if (!r.ok) {
          const t = await r.text().catch(() => '');
          throw new Error(`Webhook failed: ${r.status} ${t}`);
        }
        return r;
      }, { maxAttempts: 5, initialDelayMs: 1000, multiplier: 2, maxDelayMs: 20000 }, (err, attempt, delay) => {
        logger.warn(`Webhook attempt ${attempt} failed; retrying in ${delay}ms`, { error: err?.message, url: webhookUrl });
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }
      
      logger.info('Webhook sent successfully:', { url: webhookUrl });
      return { success: true, message: 'Webhook sent successfully' };
    } catch (error) {
      logger.error('Error sending webhook:', error);
      // Log webhook failure for monitoring
      logger.error('Webhook failed, no DLQ available:', error.message);
      return { success: false, error: error.message };
    }
};

// Helper method for placeholder replacement
export const replacePlaceholders = (text, data) => {
    if (!text) return text;
    
    let result = text;
    
    // Replace user data placeholders
    if (data.identifiedUser) {
      result = result.replace(/\{\{user\.(\w+)\}\}/g, (match, field) => {
        return data.identifiedUser[field] || match;
      });
    }
    
    // Replace localStorage placeholders
    if (data.localStorageData) {
      result = result.replace(/\{\{localStorage\.(\w+)\}\}/g, (match, field) => {
        return data.localStorageData[field] || match;
      });
    }
    
    return result;
};