import * as workflowService from '../services/workflowService.js';
import { logger } from '../utils/logger.js';
import { validateWorkflowRequest, validateWorkflowUpdate } from '../utils/validators.js';

// Helper: extract user ID from request
const getUserId = (req) => {
  return req.user?._id || req.user?.id || req.headers['x-user-id'];
};

// Create workflow
export const create = async (req, res, next) => {
  try {
    const validation = validateWorkflowRequest(req.body);
    if (validation.error) {
      return res.status(400).json({
        error: "Validation Error",
        message: validation.error.details[0].message
      });
    }
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const workflow = await workflowService.createWorkflow(req.body, userId);
    res.status(201).json(workflow);
  } catch (error) {
    logger.error('Error creating workflow:', error);
    next(error);
  }
};

// Get all workflows for user
export const getAll = async (req, res, next) => {
  try {
    const { status, siteId } = req.query;
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const workflows = await workflowService.getWorkflows(userId, { status, siteId });
    res.json(workflows);
  } catch (error) {
    logger.error('Error getting workflows:', error);
    next(error);
  }
};

// Get specific workflow
export const getById = async (req, res, next) => {
  try {
    // Disable caching for workflow data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const workflow = await workflowService.getWorkflow(req.params.id, userId);
    res.json(workflow);
  } catch (error) {
    logger.error('Error getting workflow by ID:', error);
    next(error);
  }
};

// Update workflow
export const update = async (req, res, next) => {
  try {
    // Use the update validation instead of create validation
    const validation = validateWorkflowUpdate(req.body);
    if (validation.error) {
      return res.status(400).json({
        error: "Validation Error",
        message: validation.error.details[0].message
      });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const workflow = await workflowService.updateWorkflow(req.params.id, req.body, userId);
    res.json(workflow);
  } catch (error) {
    logger.error('Error updating workflow:', error);
    next(error);
  }
};

// Update workflow status only (lighter endpoint for status changes)
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Draft', 'Active', 'Paused'].includes(status)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Valid status is required (Draft, Active, or Paused)"
      });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const workflow = await workflowService.updateWorkflow(req.params.id, { status }, userId);
    res.json(workflow);
  } catch (error) {
    logger.error('Error updating workflow status:', error);
    next(error);
  }
};

// Delete workflow
export const deleteWorkflow = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await workflowService.deleteWorkflow(req.params.id, userId);
    res.json(result);
  } catch (error) {
    logger.error('Error deleting workflow:', error);
    next(error);
  }
};

// Get active workflows by query parameter (public endpoint for tracker)
export const getActiveByQuery = async (req, res, next) => {
  try {
    const siteId = req.query.siteId;
    if (!siteId) {
      return res.status(400).json({ error: 'siteId query parameter is required' });
    }
    const workflows = await workflowService.getActiveWorkflows(siteId);
    res.json({ workflows });
  } catch (error) {
    logger.error('Error getting active workflows by query:', error);
    next(error);
  }
};

// Get active workflows for a site (public endpoint for tracker)
export const getActiveBySite = async (req, res, next) => {
  try {
    const workflows = await workflowService.getActiveWorkflows(req.params.siteId);
    res.json({ workflows });
  } catch (error) {
    logger.error('Error getting active workflows by site:', error);
    next(error);
  }
};