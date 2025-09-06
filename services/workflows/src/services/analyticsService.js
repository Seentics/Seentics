import { WorkflowEvent, DailyAggregation } from '../models/WorkflowEvent.js';
import { Workflow } from '../models/Workflow.js';
import { logger } from '../utils/logger.js';

export class AnalyticsService {

  async trackWorkflowEvent(eventData) {
    try {
      const event = new WorkflowEvent({
        ...eventData,
        timestamp: new Date()
      });

      await event.save();
      
      logger.debug('Workflow event tracked:', { 
        workflowId: event.workflowId,
        event: event.event,
        nodeId: event.nodeId 
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error tracking workflow event:', error);
      throw error;
    }
  }

  async getWorkflowAnalytics(workflowId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      let query = { workflowId };
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      
      const events = await WorkflowEvent.find(query)
        .sort({ timestamp: -1 })
        .lean();
      
      // Calculate metrics
      const triggers = events.filter(e => e.event === 'Trigger').length;
      const completions = events.filter(e => e.event === 'Action Executed').length;
      const conversionRate = triggers > 0 ? (completions / triggers * 100).toFixed(1) : '0.0';
      
      // Group by date for trends
      const dailyData = this.groupEventsByDate(events);
      
      // Get hourly distribution
      const hourlyData = this.groupEventsByHour(events);
      
      return {
        totalTriggers: triggers,
        totalCompletions: completions,
        conversionRate: `${conversionRate}%`,
        dailyData,
        hourlyData,
        recentEvents: events.slice(0, 50)
      };
    } catch (error) {
      logger.error('Error getting workflow analytics:', error);
      throw error;
    }
  }

  async getWorkflowActivity(workflowId, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;
      
      const activities = await WorkflowEvent.find({ workflowId })
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
      
      const totalCount = await WorkflowEvent.countDocuments({ workflowId });
      
      return {
        activities,
        totalCount,
        hasMore: offset + limit < totalCount
      };
    } catch (error) {
      logger.error('Error getting workflow activity:', error);
      throw error;
    }
  }

  async getWorkflowPerformanceChart(workflowId, period = '30d') {
    try {
      const days = parseInt(period.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const pipeline = [
        {
          $match: {
            workflowId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              event: "$event"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            triggers: {
              $sum: { $cond: [{ $eq: ["$_id.event", "Trigger"] }, "$count", 0] }
            },
            completions: {
              $sum: { $cond: [{ $eq: ["$_id.event", "Action Executed"] }, "$count", 0] }
            }
          }
        },
        {
          $project: {
            date: "$_id",
            triggers: 1,
            completions: 1,
            conversionRate: {
              $cond: [
                { $gt: ["$triggers", 0] },
                { $multiply: [{ $divide: ["$completions", "$triggers"] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { date: 1 } }
      ];
      
      const chartData = await WorkflowEvent.aggregate(pipeline);
      
      return chartData;
    } catch (error) {
      logger.error('Error getting workflow performance chart:', error);
      throw error;
    }
  }

  async getWorkflowNodePerformance(workflowId) {
    try {
      const pipeline = [
        { $match: { workflowId } },
        {
          $group: {
            _id: {
              nodeId: "$nodeId",
              nodeTitle: "$nodeTitle",
              event: "$event"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              nodeId: "$_id.nodeId",
              nodeTitle: "$_id.nodeTitle"
            },
            triggers: {
              $sum: { $cond: [{ $eq: ["$_id.event", "Trigger"] }, "$count", 0] }
            },
            executions: {
              $sum: { $cond: [{ $eq: ["$_id.event", "Action Executed"] }, "$count", 0] }
            }
          }
        },
        {
          $project: {
            nodeId: "$_id.nodeId",
            nodeTitle: "$_id.nodeTitle",
            triggers: 1,
            executions: 1,
            performance: {
              $cond: [
                { $gt: ["$triggers", 0] },
                { $multiply: [{ $divide: ["$executions", "$triggers"] }, 100] },
                { $cond: [{ $gt: ["$executions", 0] }, 100, 0] }
              ]
            }
          }
        },
        { $sort: { performance: -1 } }
      ];
      
      const nodePerformance = await WorkflowEvent.aggregate(pipeline);
      
      return nodePerformance;
    } catch (error) {
      logger.error('Error getting workflow node performance:', error);
      throw error;
    }
  }

  groupEventsByDate(events) {
    const grouped = {};
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { date, triggers: 0, completions: 0 };
      }
      
      if (event.event === 'Trigger') {
        grouped[date].triggers++;
      } else if (event.event === 'Action Executed') {
        grouped[date].completions++;
      }
    });
    
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }

  groupEventsByHour(events) {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      triggers: 0,
      completions: 0
    }));
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      if (event.event === 'Trigger') {
        hourlyData[hour].triggers++;
      } else if (event.event === 'Action Executed') {
        hourlyData[hour].completions++;
      }
    });
    
    return hourlyData;
  }

  async getWorkflowTriggerTypes(workflowId) {
    try {
      const pipeline = [
        { $match: { workflowId, event: 'Trigger' } },
        {
          $group: {
            _id: { triggerType: "$detail" },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            triggerType: { $ifNull: ["$_id.triggerType", "Unknown"] },
            count: 1
          }
        },
        { $sort: { count: -1 } }
      ];
      
      const triggerTypes = await WorkflowEvent.aggregate(pipeline);
      
      // Calculate percentages
      const totalTriggers = triggerTypes.reduce((sum, item) => sum + item.count, 0);
      
      return triggerTypes.map(item => ({
        ...item,
        percentage: totalTriggers > 0 ? Math.round((item.count / totalTriggers) * 100) : 0
      }));
    } catch (error) {
      logger.error('Error getting workflow trigger types:', error);
      throw error;
    }
  }

  async getWorkflowActionTypes(workflowId) {
    try {
      const pipeline = [
        { $match: { workflowId, event: 'Action Executed' } },
        {
          $group: {
            _id: { actionType: "$detail" },
            count: { $sum: 1 },
            successCount: { $sum: 1 } // Assuming all executed actions are successful
          }
        },
        {
          $project: {
            actionType: { $ifNull: ["$_id.actionType", "Unknown"] },
            count: 1,
            successRate: 100 // All executed actions are considered successful
          }
        },
        { $sort: { count: -1 } }
      ];
      
      const actionTypes = await WorkflowEvent.aggregate(pipeline);
      
      return actionTypes;
    } catch (error) {
      logger.error('Error getting workflow action types:', error);
      throw error;
    }
  }

  async getWorkflowHourlyData(workflowId) {
    try {
      const pipeline = [
        { $match: { workflowId } },
        {
          $group: {
            _id: {
              hour: { $hour: "$timestamp" },
              event: "$event"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.hour",
            triggers: {
              $sum: { $cond: [{ $eq: ["$_id.event", "Trigger"] }, "$count", 0] }
            },
            completions: {
              $sum: { $cond: [{ $eq: ["$_id.event", "Action Executed"] }, "$count", 0] }
            }
          }
        },
        {
          $project: {
            hour: "$_id",
            triggers: 1,
            completions: 1,
            completionRate: {
              $cond: [
                { $gt: ["$triggers", 0] },
                { $round: [{ $multiply: [{ $divide: ["$completions", "$triggers"] }, 100] }, 1] },
                0
              ]
            }
          }
        },
        { $sort: { hour: 1 } }
      ];
      
      const hourlyData = await WorkflowEvent.aggregate(pipeline);
      
      // Fill in missing hours with zero values
      const completeHourlyData = Array.from({ length: 24 }, (_, i) => {
        const existing = hourlyData.find(item => item.hour === i);
        return existing || {
          hour: i,
          triggers: 0,
          completions: 0,
          completionRate: 0
        };
      });
      
      return completeHourlyData;
    } catch (error) {
      logger.error('Error getting workflow hourly data:', error);
      throw error;
    }
  }

  async getWorkflowFunnelData(workflowId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      let query = { workflowId };
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      
      // Get all step-related events
      const events = await WorkflowEvent.find({
        ...query,
        event: { $in: ['Step Entered', 'Step Completed', 'Condition Evaluated', 'Action Executed'] }
      }).sort({ timestamp: 1 }).lean();
      
      // Group events by runId to track individual visitor journeys
      const visitorJourneys = this.groupEventsByRunId(events);
      
      // Calculate step-by-step funnel data
      const funnelSteps = this.calculateFunnelSteps(visitorJourneys, workflowId);
      
      // Calculate additional metrics
      const dropOffRates = this.calculateDropOffRates(funnelSteps);
      const averageTimePerStep = this.calculateStepTiming(visitorJourneys);
      const pathAnalysis = this.analyzeVisitorPaths(visitorJourneys);
      
      return {
        totalVisitors: funnelSteps[0]?.count || 0,
        steps: funnelSteps,
        dropOffRates,
        averageTimePerStep,
        pathAnalysis,
        totalRuns: visitorJourneys.length,
        successfulCompletions: visitorJourneys.filter(j => j.completed).length
      };
    } catch (error) {
      logger.error('Error getting workflow funnel data:', error);
      throw error;
    }
  }

  groupEventsByRunId(events) {
    const journeys = {};
    
    events.forEach(event => {
      if (!journeys[event.runId]) {
        journeys[event.runId] = {
          runId: event.runId,
          visitorId: event.visitorId,
          steps: [],
          startTime: event.timestamp,
          completed: false,
          totalSteps: 0
        };
      }
      
      const journey = journeys[event.runId];
      
      if (event.event === 'Step Entered') {
        journey.steps.push({
          nodeId: event.nodeId,
          nodeTitle: event.nodeTitle,
          nodeType: event.nodeType,
          stepOrder: event.stepOrder,
          enteredAt: event.timestamp,
          completed: false
        });
        journey.totalSteps++;
      } else if (event.event === 'Step Completed' || event.event === 'Action Executed') {
        const step = journey.steps.find(s => s.nodeId === event.nodeId);
        if (step) {
          step.completed = true;
          step.completedAt = event.timestamp;
          step.executionTime = event.executionTime;
        }
      } else if (event.event === 'Condition Evaluated') {
        const step = journey.steps.find(s => s.nodeId === event.nodeId);
        if (step) {
          step.conditionMet = event.success;
          step.executionTime = event.executionTime;
        }
      }
      
      // Mark as completed if we have a completion event
      if (event.event === 'Action Executed') {
        journey.completed = true;
        journey.endTime = event.timestamp;
      }
    });
    
    return Object.values(journeys);
  }

  calculateFunnelSteps(visitorJourneys, workflowId) {
    if (visitorJourneys.length === 0) return [];
    
    // Get workflow structure to understand the intended flow
    // For now, we'll use the actual steps visitors took
    const stepCounts = {};
    const stepTypes = {};
    
    visitorJourneys.forEach(journey => {
      journey.steps.forEach((step, index) => {
        const stepKey = `${step.nodeTitle} (${step.nodeType})`;
        
        if (!stepCounts[stepKey]) {
          stepCounts[stepKey] = {
            name: stepKey,
            nodeType: step.nodeType,
            count: 0,
            completed: 0,
            conversionRate: 0,
            dropOff: 0,
            avgTime: 0,
            stepOrder: step.stepOrder,
            successRate: 0
          };
          stepTypes[stepKey] = step.nodeType;
        }
        
        stepCounts[stepKey].count++;
        
        if (step.completed) {
          stepCounts[stepKey].completed++;
        }
        
        if (step.executionTime) {
          stepCounts[stepKey].avgTime = 
            (stepCounts[stepKey].avgTime * (stepCounts[stepKey].count - 1) + step.executionTime) / 
            stepCounts[stepKey].count;
        }
      });
    });
    
    // Convert to array and sort by step order
    const steps = Object.values(stepCounts).sort((a, b) => a.stepOrder - b.stepOrder);
    
    // Calculate conversion rates (relative to first step) and drop-offs (percent from previous step)
    const firstCount = steps.length > 0 ? steps[0].count : 0;
    
    steps.forEach((step, index) => {
      const conv = firstCount > 0 ? (step.count / firstCount) * 100 : 0;
      step.conversionRate = Number.isFinite(conv) ? conv.toFixed(1) : '0.0';
      const success = step.count > 0 ? (step.completed / step.count) * 100 : 0;
      step.successRate = Number.isFinite(success) ? success.toFixed(1) : '0.0';
      if (index > 0) {
        const prev = steps[index - 1];
        const drop = prev.count > 0 ? ((prev.count - step.count) / prev.count) * 100 : 0;
        step.dropOff = Number.isFinite(drop) ? drop : 0;
      } else {
        step.dropOff = 0;
      }
    });
    
    return steps;
  }

  calculateDropOffRates(funnelSteps) {
    if (funnelSteps.length < 2) return [];
    
    const dropOffs = [];
    
    for (let i = 1; i < funnelSteps.length; i++) {
      const currentStep = funnelSteps[i];
      const previousStep = funnelSteps[i - 1];
      
      const dropOffCount = previousStep.count - currentStep.count;
      const dropOffRate = previousStep.count > 0 ? (dropOffCount / previousStep.count * 100).toFixed(1) : 0;
      
      dropOffs.push({
        fromStep: previousStep.name,
        toStep: currentStep.name,
        dropOffCount,
        dropOffRate: parseFloat(dropOffRate),
        critical: parseFloat(dropOffRate) > 50 // Flag high drop-off rates
      });
    }
    
    return dropOffs;
  }

  calculateStepTiming(visitorJourneys) {
    const stepTiming = {};
    
    visitorJourneys.forEach(journey => {
      journey.steps.forEach(step => {
        if (step.executionTime) {
          const stepKey = step.nodeTitle;
          if (!stepTiming[stepKey]) {
            stepTiming[stepKey] = { totalTime: 0, count: 0, avgTime: 0 };
          }
          
          stepTiming[stepKey].totalTime += step.executionTime;
          stepTiming[stepKey].count++;
          stepTiming[stepKey].avgTime = stepTiming[stepKey].totalTime / stepTiming[stepKey].count;
        }
      });
    });
    
    return Object.entries(stepTiming).map(([stepName, timing]) => ({
      stepName,
      averageTime: Math.round(timing.avgTime),
      totalExecutions: timing.count
    }));
  }

  analyzeVisitorPaths(visitorJourneys) {
    const paths = {};
    
    visitorJourneys.forEach(journey => {
      const path = journey.steps.map(s => s.nodeTitle).join(' → ');
      
      if (!paths[path]) {
        paths[path] = { count: 0, visitors: [] };
      }
      
      paths[path].count++;
      paths[path].visitors.push(journey.visitorId);
    });
    
    // Sort by frequency
    return Object.entries(paths)
      .map(([path, data]) => ({ path, count: data.count, visitors: data.visitors }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 paths
  }

  // Clean up old workflow events to maintain performance
  // This is a backup to the TTL index and can be called manually if needed
  async cleanupOldEvents(hoursOld = 24) {
    try {
      const cutoffDate = new Date(Date.now() - (hoursOld * 60 * 60 * 1000));
      
      const result = await WorkflowEvent.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      
      logger.info(`Cleaned up ${result.deletedCount} workflow events older than ${hoursOld} hours`);
      
      return {
        success: true,
        deletedCount: result.deletedCount,
        cutoffDate: cutoffDate
      };
    } catch (error) {
      logger.error('Error cleaning up old workflow events:', error);
      throw error;
    }
  }

  // Get cleanup statistics for monitoring
}

export const analyticsService = new AnalyticsService();