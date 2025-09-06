import express from 'express';
import { analyticsController } from '../controllers/analyticsController.js';

const router = express.Router();

// Track workflow event (called by tracker.js)
router.post('/track', analyticsController.trackEvent.bind(analyticsController));

// Track multiple workflow events in batch (called by tracker.js)
router.post('/track/batch', analyticsController.trackBatchEvents.bind(analyticsController));

// Get workflow funnel data for detailed step-by-step analytics
router.get('/funnel/:workflowId', analyticsController.getWorkflowFunnel.bind(analyticsController));

// Get workflow analytics
router.get('/workflow/:workflowId', analyticsController.getWorkflowAnalytics.bind(analyticsController));

// Get workflow activity log
router.get('/workflow/:workflowId/activity', analyticsController.getWorkflowActivity.bind(analyticsController));

// Get workflow performance chart
router.get('/workflow/:workflowId/chart', analyticsController.getWorkflowChart.bind(analyticsController));

// Get workflow node performance
router.get('/workflow/:workflowId/nodes', analyticsController.getWorkflowNodes.bind(analyticsController));

// Get workflow trigger types
router.get('/workflow/:workflowId/triggers', analyticsController.getWorkflowTriggers.bind(analyticsController));

// Get workflow action types
router.get('/workflow/:workflowId/actions', analyticsController.getWorkflowActions.bind(analyticsController));

// Get workflow hourly data
router.get('/workflow/:workflowId/hourly', analyticsController.getWorkflowHourly.bind(analyticsController));

// Get workflows summary for dashboard
router.get('/workflows/summary', analyticsController.getWorkflowsSummary.bind(analyticsController));

export default router;