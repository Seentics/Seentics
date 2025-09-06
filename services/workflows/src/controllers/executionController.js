import { executionService } from '../services/executionService.js';
import { workflowQueue } from '../services/queueService.js';
import { logger } from '../utils/logger.js';

class ExecutionController {
  // Execute workflow action
  async executeAction(req, res, next) {
    try {
      const actionData = {
        workflowId: req.body.workflowId,
        nodeId: req.body.nodeId,
        siteId: req.body.siteId,
        visitorId: req.body.visitorId,
        identifiedUser: req.body.identifiedUser,
        localStorageData: req.body.localStorageData
      };

      logger.info('Execution request received:', actionData);

      // For now, execute directly instead of queuing to avoid Redis issues
      try {
        const result = await executionService.executeWorkflowAction(actionData);
        res.json({ 
          success: true,
          result: result,
          message: 'Action executed successfully'
        });
      } catch (execError) {
        logger.error('Execution failed:', execError);
        res.json({ 
          success: false,
          error: execError.message,
          message: 'Action execution failed'
        });
      }
    } catch (error) {
      logger.error('Controller error:', error);
      next(error);
    }
  }

  // Get execution status
  async getExecutionStatus(req, res, next) {
    try {
      const job = await workflowQueue.getJob(req.params.jobId);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      const status = await job.getState();
      const progress = job.progress();
      
      res.json({
        id: job.id,
        status,
        progress,
        result: job.returnvalue,
        failedReason: job.failedReason
      });
    } catch (error) {
      next(error);
    }
  }

  // Get execution logs for a workflow
  async getExecutionLogs(req, res, next) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const { workflowId } = req.params;
      
      // Get recent jobs for this workflow
      const jobs = await workflowQueue.getJobs(['completed', 'failed'], parseInt(offset), parseInt(limit));
      
      const logs = this._formatExecutionLogs(jobs, workflowId);
      
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  // Private helper method to format execution logs
  _formatExecutionLogs(jobs, workflowId) {
    return jobs
      .filter(job => job.data.actionData.workflowId === workflowId)
      .map(job => ({
        id: job.id,
        status: job.finishedOn ? 'completed' : 'failed',
        createdAt: new Date(job.timestamp),
        finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
        result: job.returnvalue,
        error: job.failedReason,
        data: job.data.actionData
      }));
  }
}

export const executionController = new ExecutionController();