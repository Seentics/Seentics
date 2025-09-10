import * as analyticsService from '../services/analyticsService.js';
import { analyticsQueue } from '../services/queueService.js';
import * as workflowService from '../services/workflowService.js';
import { logger } from '../utils/logger.js';

// Track single workflow event
export const trackEvent = async (req, res, next) => {
  try {

    // Handle new analytics event structure from workflow-tracker.js
    const eventData = req.body;

    // Process the event through analytics service
    await analyticsService.trackWorkflowEvent(eventData);

    // Update workflow counters for main events (both old and new event types)
    if (eventData.type === 'Trigger' || eventData.analytics_event_type === 'workflow_trigger') {
      await workflowService.incrementTriggers(eventData.workflowId || eventData.workflow_id);
    } else if (eventData.type === 'Action Executed' || eventData.analytics_event_type === 'action_completed') {
      await workflowService.incrementCompletions(eventData.workflowId || eventData.workflow_id);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Track multiple workflow events in batch
export const trackBatchEvents = async (req, res, next) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Events array is required' });
    }

    // Process each event in the batch
    const promises = events.map(async (event) => {
      // Process the event through analytics service
      await analyticsService.trackWorkflowEvent(event);

      // Update workflow counters for main events (both old and new event types)
      if (event.type === 'Trigger' || event.analytics_event_type === 'workflow_trigger') {
        await workflowService.incrementTriggers(event.workflowId || event.workflow_id);
      } else if (event.type === 'Action Executed' || event.analytics_event_type === 'action_completed') {
        await workflowService.incrementCompletions(event.workflowId || event.workflow_id);
      }
    });

    await Promise.all(promises);

    res.json({ success: true, processed: events.length });
  } catch (error) {
    next(error);
  }
};

// Get workflow funnel data
export const getWorkflowFunnel = async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const { startDate, endDate } = req.query;

    setNoCacheHeaders(res);

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
};

// Get workflow analytics
export const getWorkflowAnalytics = async (req, res, next) => {
  try {
    setNoCacheHeaders(res);

    const { startDate, endDate } = req.query;
    const analytics = await analyticsService.getWorkflowAnalytics(req.params.workflowId, {
      startDate,
      endDate
    });

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// Get workflow activity log
export const getWorkflowActivity = async (req, res, next) => {
  try {
    setNoCacheHeaders(res);

    const { limit = 50, offset = 0 } = req.query;
    const activities = await analyticsService.getWorkflowActivity(req.params.workflowId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

// Get workflow performance chart
export const getWorkflowChart = async (req, res, next) => {
  try {
    setNoCacheHeaders(res);

    const { period = '30d' } = req.query;
    const chartData = await analyticsService.getWorkflowPerformanceChart(req.params.workflowId, period);

    res.json(chartData);
  } catch (error) {
    next(error);
  }
};

// Get workflow node performance
export const getWorkflowNodes = async (req, res, next) => {
  try {
    const nodePerformance = await analyticsService.getWorkflowNodePerformance(req.params.workflowId);
    res.json(nodePerformance);
  } catch (error) {
    next(error);
  }
};

// Get workflow trigger types
export const getWorkflowTriggers = async (req, res, next) => {
  try {
    const triggerTypes = await analyticsService.getWorkflowTriggerTypes(req.params.workflowId);
    res.json(triggerTypes);
  } catch (error) {
    next(error);
  }
};

// Get workflow action types
export const getWorkflowActions = async (req, res, next) => {
  try {
    const actionTypes = await analyticsService.getWorkflowActionTypes(req.params.workflowId);
    res.json(actionTypes);
  } catch (error) {
    next(error);
  }
};

// Get workflow hourly data
export const getWorkflowHourly = async (req, res, next) => {
  try {
    const hourlyData = await analyticsService.getWorkflowHourlyData(req.params.workflowId);
    res.json(hourlyData);
  } catch (error) {
    next(error);
  }
};

// Get workflows summary for dashboard
export const getWorkflowsSummary = async (req, res, next) => {
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
};

// Helper method to process events with queue fallback
const processEvent = async (eventData) => {
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
};

// Helper method to set no-cache headers
const setNoCacheHeaders = (res) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
};