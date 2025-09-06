import { analyticsService } from '../services/analyticsService.js';
import { logger } from '../utils/logger.js';

class WorkflowAnalyticsController {
  // Get workflow analytics
  async getAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await analyticsService.getWorkflowAnalytics(req.params.id, {
        startDate,
        endDate
      });
      res.json(analytics);
    } catch (error) {
      logger.error('Error getting workflow analytics:', error);
      next(error);
    }
  }

  // Get workflow activity log
  async getActivity(req, res, next) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const activities = await analyticsService.getWorkflowActivity(req.params.id, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(activities);
    } catch (error) {
      logger.error('Error getting workflow activity:', error);
      next(error);
    }
  }

  // Get workflow performance chart
  async getChart(req, res, next) {
    try {
      const { period = '30d' } = req.query;
      const chartData = await analyticsService.getWorkflowPerformanceChart(req.params.id, period);
      res.json(chartData);
    } catch (error) {
      logger.error('Error getting workflow chart data:', error);
      next(error);
    }
  }

  // Get workflow node performance
  async getNodePerformance(req, res, next) {
    try {
      const nodePerformance = await analyticsService.getWorkflowNodePerformance(req.params.id);
      res.json(nodePerformance);
    } catch (error) {
      logger.error('Error getting workflow node performance:', error);
      next(error);
    }
  }
}

export const workflowAnalyticsController = new WorkflowAnalyticsController();