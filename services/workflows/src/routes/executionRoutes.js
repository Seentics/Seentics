import express from 'express';
import * as executionController from '../controllers/executionController.js';

const router = express.Router();

// Execute workflow action (called by tracker.js)
router.post('/action', executionController.executeAction);

// Get execution status
router.get('/status/:jobId', executionController.getExecutionStatus);

// Get execution logs for a workflow
router.get('/logs/:workflowId', executionController.getExecutionLogs);

export default router;