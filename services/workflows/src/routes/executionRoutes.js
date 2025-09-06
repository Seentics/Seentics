import express from 'express';
import { executionController } from '../controllers/executionController.js';

const router = express.Router();

// Execute workflow action (called by tracker.js)
router.post('/action', executionController.executeAction.bind(executionController));

// Get execution status
router.get('/status/:jobId', executionController.getExecutionStatus.bind(executionController));

// Get execution logs for a workflow
router.get('/logs/:workflowId', executionController.getExecutionLogs.bind(executionController));

export default router;