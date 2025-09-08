import { analyticsService } from '../services/analyticsService.js';
import { workflowService } from '../services/workflowService.js';
import { analyticsQueue } from '../services/queueService.js';
import { logger } from '../utils/logger.js';

class AnalyticsController {
  // Track single workflow event
  async trackEvent(req, res, next) {
    try {
      // const eventData = {
      //   siteId: req.body.siteId,
      //   workflowId: req.body.workflowId,
      //   visitorId: req.body.visitorId,
      //   event: req.body.type,
      //   nodeId: req.body.nodeId,
      //   nodeTitle: req.body.nodeTitle,
      //   nodeType: req.body.nodeType,
      //   detail: req.body.detail,
      //   runId: req.body.runId,
      //   stepOrder: req.body.stepOrder,
      //   executionTime: req.body.executionTime,
      //   success: req.body.success
      // };

      // await this._processEvent(eventData);
      
      // Update workflow counters only for main events
      if (req.body.type === 'Trigger') {
        await workflowService.incrementTriggers(req.body.workflowId);
      } else if (req.body.type === 'Action Executed') {
        await workflowService.incrementCompletions(req.body.workflowId);
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // Track multiple workflow events in batch
  async trackBatchEvents(req, res, next) {
    try {
      const { events } = req.body;
      
      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ error: 'Events array is required' });
      }

      // Process each event in the batch
      const promises = events.map(async (event) => {
        // const eventData = {
        //   siteId: event.siteId,
        //   workflowId: event.workflowId,
        //   visitorId: event.visitorId,
        //   event: event.type,
        //   nodeId: event.nodeId,
        //   nodeTitle: event.nodeTitle,
        //   nodeType: event.nodeType,
        //   detail: event.detail,
        //   runId: event.runId,
        //   stepOrder: event.stepOrder,
        //   executionTime: event.executionTime,
        //   success: event.success
        // };

        // await this._processEvent(eventData);
        
        // Update workflow counters
        if (event.type === 'Trigger') {
          await workflowService.incrementTriggers(event.workflowId);
        } else if (event.type === 'Action Executed') {
          await workflowService.incrementCompletions(event.workflowId);
        }
      });

      await Promise.all(promises);
      
      res.json({ success: true, processed: events.length });
    } catch (error) {
      next(error);
    }
  }

  // Get workflow funnel data
  async getWorkflowFunnel(req, res, next) {
    try {
      const { workflowId } = req.params;
      const { startDate, endDate } = req.query;
      
      this._setNoCacheHeaders(res);
      
      const dateRange = {};
      if (startDate) dateRange.startDate = new Date(startDate);
      if (endDate) dateRange.endDate = new Date(endDate);
      
      const funnelData = await analyticsService.getWorkflowFunnelData(workflowId, dateRange);
      
      res.json({
        success: true,
        data: funnelData
      });
    } catch (error) {
      next(error);
    }
  }

  // Get workflow analytics
  async getWorkflowAnalytics(req, res, next) {
    try {
      this._setNoCacheHeaders(res);
      
      const { startDate, endDate } = req.query;
      const analytics = await analyticsService.getWorkflowAnalytics(req.params.workflowId, {
        startDate,
        endDate
      });
      
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  // Get workflow activity log
  async getWorkflowActivity(req, res, next) {
    try {
      this._setNoCacheHeaders(res);
      
      const { limit = 50, offset = 0 } = req.query;
      const activities = await analyticsService.getWorkflowActivity(req.params.workflowId, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json(activities);
    } catch (error) {
      next(error);
    }
  }

  // Get workflow performance chart
  async getWorkflowChart(req, res, next) {
    try {
      this._setNoCacheHeaders(res);
      
      const { period = '30d' } = req.query;
      const chartData = await analyticsService.getWorkflowPerformanceChart(req.params.workflowId, period);
      
      res.json(chartData);
    } catch (error) {
      next(error);
    }
  }

  // Get workflow node performance
  async getWorkflowNodes(req, res, next) {
    try {
      const nodePerformance = await analyticsService.getWorkflowNodePerformance(req.params.workflowId);
      res.json(nodePerformance);
    } catch (error) {
      next(error);
    }
  }

  // Get workflow trigger types
  async getWorkflowTriggers(req, res, next) {
    try {
      const triggerTypes = await analyticsService.getWorkflowTriggerTypes(req.params.workflowId);
      res.json(triggerTypes);
    } catch (error) {
      next(error);
    }
  }

  // Get workflow action types
  async getWorkflowActions(req, res, next) {
    try {
      const actionTypes = await analyticsService.getWorkflowActionTypes(req.params.workflowId);
      res.json(actionTypes);
    } catch (error) {
      next(error);
    }
  }

  // Get workflow hourly data
  async getWorkflowHourly(req, res, next) {
    try {
      const hourlyData = await analyticsService.getWorkflowHourlyData(req.params.workflowId);
      res.json(hourlyData);
    } catch (error) {
      next(error);
    }
  }

  // Get workflows summary for dashboard
  async getWorkflowsSummary(req, res, next) {
    try {
      const { siteId, startDate, endDate } = req.query;
      const workflows = await workflowService.getWorkflows(req.user._id, { siteId });
      
      const summaryPromises = workflows.map(async (workflow) => {
        const analytics = await analyticsService.getWorkflowAnalytics(workflow.id, {
          startDate,
          endDate
        });
        return {
          ...workflow,
          analytics
        };
      });
      
      const summaries = await Promise.all(summaryPromises);
      res.json(summaries);
    } catch (error) {
      next(error);
    }
  }

  // Private helper method to process events with queue fallback
  async _processEvent(eventData) {
    try {
      // Try to queue the event for processing with a timeout
      const queuePromise = analyticsQueue.add('track-workflow-event', { eventData });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Queue timeout')), 1000)
      );
      
      await Promise.race([queuePromise, timeoutPromise]);
    } catch (queueError) {
      // Fallback: store event directly if queue fails or times out
      logger.warn('Queue failed or timed out, storing event directly:', queueError.message);
      await analyticsService.trackWorkflowEvent(eventData);
    }
  }

  // Private helper method to set no-cache headers
  _setNoCacheHeaders(res) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
}

export const analyticsController = new AnalyticsController();