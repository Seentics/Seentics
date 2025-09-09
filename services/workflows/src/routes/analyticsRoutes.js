import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// Track workflow event (called by tracker.js)
router.post('/track', analyticsController.trackEvent);

// Track multiple workflow events in batch (called by tracker.js)
router.post('/track/batch', analyticsController.trackBatchEvents);

// Get workflow funnel data for detailed step-by-step analytics
router.get('/funnel/:workflowId', analyticsController.getWorkflowFunnel);

// Get workflow analytics
router.get('/workflow/:workflowId', analyticsController.getWorkflowAnalytics);

// Get workflow activity log
router.get('/workflow/:workflowId/activity', analyticsController.getWorkflowActivity);

// Get workflow performance chart
router.get('/workflow/:workflowId/chart', analyticsController.getWorkflowChart);

// Get workflow node performance
router.get('/workflow/:workflowId/nodes', analyticsController.getWorkflowNodes);

// Get workflow trigger types
router.get('/workflow/:workflowId/triggers', analyticsController.getWorkflowTriggers);

// Get workflow action types
router.get('/workflow/:workflowId/actions', analyticsController.getWorkflowActions);

// Get workflow hourly data
router.get('/workflow/:workflowId/hourly', analyticsController.getWorkflowHourly);

// Get workflows summary for dashboard
router.get('/workflows/summary', analyticsController.getWorkflowsSummary);

export default router;