import express from 'express';
import * as executionController from '../controllers/executionController.js';
import * as workflowAnalyticsController from '../controllers/workflowAnalyticsController.js';
import * as workflowController from '../controllers/workflowController.js';
import * as workflowStatsController from '../controllers/workflowStatsController.js';

const router = express.Router();

// Workflow CRUD operations
router.post('/', workflowController.create);
router.get('/', workflowController.getAll);
router.get('/:id', workflowController.getById);
router.put('/:id', workflowController.update);
router.patch('/:id/status', workflowController.updateStatus);
router.delete('/:id', workflowController.deleteWorkflow);

// Public endpoints for tracker
router.get('/active', workflowController.getActiveByQuery);
router.get('/site/:siteId/active', workflowController.getActiveBySite);

// Execution endpoints (public with validation)
router.post('/execution/action', executionController.executeAction);

// Analytics endpoints (legacy)
router.get('/:id/analytics', workflowAnalyticsController.getAnalytics);
router.get('/:id/activity', workflowAnalyticsController.getActivity);
router.get('/:id/chart', workflowAnalyticsController.getChart);
router.get('/:id/nodes', workflowAnalyticsController.getNodePerformance);

// New aggregated stats endpoints
router.get('/:id/stats', workflowStatsController.getWorkflowStats);
router.get('/:id/stats/nodes', workflowStatsController.getNodePerformance);
router.get('/stats/summary', workflowStatsController.getWorkflowSummary);
router.post('/:id/stats/reset', workflowStatsController.resetWorkflowStats);

export default router;