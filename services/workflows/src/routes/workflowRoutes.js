import express from 'express';
import { workflowController } from '../controllers/workflowController.js';
import { workflowAnalyticsController } from '../controllers/workflowAnalyticsController.js';
import { executionController } from '../controllers/executionController.js';

const router = express.Router();

// Workflow CRUD operations
router.post('/', workflowController.create.bind(workflowController));
router.get('/', workflowController.getAll.bind(workflowController));
router.get('/:id', workflowController.getById.bind(workflowController));
router.put('/:id', workflowController.update.bind(workflowController));
router.patch('/:id/status', workflowController.updateStatus.bind(workflowController));
router.delete('/:id', workflowController.delete.bind(workflowController));

// Public endpoints for tracker
router.get('/active', workflowController.getActiveByQuery.bind(workflowController));
router.get('/site/:siteId/active', workflowController.getActiveBySite.bind(workflowController));

// Execution endpoints (public with validation)
router.post('/execution/action', executionController.executeAction.bind(executionController));

// Analytics endpoints
router.get('/:id/analytics', workflowAnalyticsController.getAnalytics.bind(workflowAnalyticsController));
router.get('/:id/activity', workflowAnalyticsController.getActivity.bind(workflowAnalyticsController));
router.get('/:id/chart', workflowAnalyticsController.getChart.bind(workflowAnalyticsController));
router.get('/:id/nodes', workflowAnalyticsController.getNodePerformance.bind(workflowAnalyticsController));

export default router;