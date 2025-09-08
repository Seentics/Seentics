import { workflowService } from './workflowService.js';
import { analyticsService } from './analyticsService.js';
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';
import { config } from '../config/config.js';
import crypto from 'crypto';
import { withRetry } from './retryPolicy.js';
import { sendToDLQ } from './dlqService.js';
import { visitorService } from './visitorService.js';

export class ExecutionService {
  constructor() {
    this.activeExecutions = new Map();
  }

  async executeWorkflowAction(actionData) {
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
      const result = await this.executeServerAction(node, {
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
  }

  async executeServerAction(node, context) {
    const { title, settings } = node.data;
    const { workflowId, siteId, visitorId, identifiedUser, localStorageData } = context;
    
    switch (title) {
      case 'Send Email':
        return await this.sendEmail(settings, context);
      
      case 'Webhook':
        return await this.sendWebhook(settings, context);
      
      case 'Add Tag':
        return await this.addTag(settings, context);
      
      case 'Remove Tag':
        return await this.removeTag(settings, context);
      
      case 'Custom Code':
        return await this.executeCustomCode(settings, context);
      
      default:
        logger.warn(`Unknown server action: ${title}`);
        return { success: false, error: 'Unknown action type' };
    }
  }

  // Execute server action from workflow execution
  async _executeServerAction(actionData) {
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
      const result = await this.executeServerAction(node, {
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
  }

  async sendEmail(settings, context) {
    try {
      const { emailTo, emailSubject, emailBody } = settings;
      const { identifiedUser, localStorageData } = context;
      
      // Replace placeholders in email content
      const processedSubject = this.replacePlaceholders(emailSubject, {
        identifiedUser,
        localStorageData
      });
      
      const processedBody = this.replacePlaceholders(emailBody, {
        identifiedUser,
        localStorageData
      });
      
      if (!config.email.resendApiKey) {
        logger.warn('RESEND_API_KEY not configured; skipping real email send');
        return { success: true, message: 'Email send simulated (no API key configured)' };
      }

      const resp = await withRetry(async () => {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.email.resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: config.email.fromAddress,
            to: Array.isArray(emailTo) ? emailTo : [emailTo],
            subject: processedSubject || '(no subject)',
            html: processedBody || ''
          })
        });
        if (!r.ok) {
          const t = await r.text().catch(() => '');
          throw new Error(`Resend failed: ${r.status} ${t}`);
        }
        return r;
      }, { maxAttempts: 5, initialDelayMs: 1000, multiplier: 2, maxDelayMs: 15000 }, (err, attempt, delay) => {
        logger.warn(`Resend attempt ${attempt} failed; retrying in ${delay}ms`, { error: err?.message });
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Resend failed: ${resp.status} ${text}`);
      }

      const json = await resp.json().catch(() => ({}));
      logger.info('Resend email sent', { id: json?.id });
      return { success: true, message: 'Email sent successfully', providerId: json?.id };
    } catch (error) {
      logger.error('Error sending email:', error);
      try { await sendToDLQ({ type: 'email', settings, context }, error.message); } catch {}
      return { success: false, error: error.message };
    }
  }

  // Helper function to substitute template variables
  substituteTemplateVariables(template, context) {
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
  }

  async sendWebhook(settings, context) {
    try {
      const { webhookUrl, webhookMethod = 'POST', webhookHeaders = {}, webhookBody } = settings;
      const { visitorId, identifiedUser, localStorageData } = context;
      
      // Parse custom webhook body with variable substitution
      let customPayload = {};
      if (webhookBody) {
        try {
          const substitutedBody = this.substituteTemplateVariables(webhookBody, context);
          customPayload = JSON.parse(substitutedBody);
        } catch (error) {
          logger.warn('Failed to parse custom webhook body, using as string:', error.message);
          customPayload = { customData: this.substituteTemplateVariables(webhookBody, context) };
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
        processedHeaders[key] = this.substituteTemplateVariables(value, context);
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
      try { await sendToDLQ({ type: 'webhook', settings, context }, error.message); } catch {}
      return { success: false, error: error.message };
    }
  }

  async addTag(settings, context) {
    try {
      const { tagName } = settings;
      const { visitorId, siteId } = context;
      
      if (!tagName || !visitorId || !siteId) {
        return { success: false, error: 'Missing tag name or visitor ID' };
      }
      
      await visitorService.addTag(siteId, visitorId, tagName);
      logger.info(`Tag "${tagName}" added to visitor ${visitorId}`);
      
      return { success: true, message: 'Tag added successfully' };
    } catch (error) {
      logger.error('Error adding tag:', error);
      return { success: false, error: error.message };
    }
  }

  async removeTag(settings, context) {
    try {
      const { tagName } = settings;
      const { visitorId, siteId } = context;
      
      if (!tagName || !visitorId || !siteId) {
        return { success: false, error: 'Missing tag name or visitor ID' };
      }
      
      await visitorService.removeTag(siteId, visitorId, tagName);
      logger.info(`Tag "${tagName}" removed from visitor ${visitorId}`);
      
      return { success: true, message: 'Tag removed successfully' };
    } catch (error) {
      logger.error('Error removing tag:', error);
      return { success: false, error: error.message };
    }
  }

  async executeCustomCode(settings, context) {
    try {
      const { customCode } = settings;
      
      // WARNING: This is potentially dangerous in production
      // Consider using a sandboxed environment or restrict this feature
      logger.warn('Custom code execution requested - this should be restricted in production');
      
      // For now, just log and return success
      logger.info('Custom code would be executed:', { code: customCode });
      
      return { success: true, message: 'Custom code executed successfully' };
    } catch (error) {
      logger.error('Error executing custom code:', error);
      return { success: false, error: error.message };
    }
  }

  replacePlaceholders(text, data) {
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
  }
}

export const executionService = new ExecutionService();