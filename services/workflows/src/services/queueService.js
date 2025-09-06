import Queue from 'bull';
import { redisClient } from '../config/redis.js';
import { executionService } from './executionService.js';
import { initializeDLQ } from './dlqService.js';
import { analyticsService } from './analyticsService.js';
import { logger } from '../utils/logger.js';

let workflowQueue;
let analyticsQueue;

export async function initializeQueues() {
  try {
    // Initialize workflow execution queue
    workflowQueue = new Queue('workflow execution', {
      redis: redisClient,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50
      }
    });

    // Initialize analytics queue
    analyticsQueue = new Queue('analytics processing', {
      redis: redisClient,
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 100
      }
    });

    // Process workflow execution jobs
    workflowQueue.process('execute-action', async (job) => {
      const { actionData } = job.data;
      return await executionService.executeWorkflowAction(actionData);
    });

    analyticsQueue.process('track-workflow-event', async (job) => {
      const { eventData } = job.data;
      return await analyticsService.trackWorkflowEvent(eventData);
    });

    // Queue event handlers
    workflowQueue.on('completed', (job) => {
      logger.debug(`Workflow job completed: ${job.id}`);
    });

    workflowQueue.on('failed', (job, err) => {
      logger.error(`Workflow job failed: ${job.id}`, err);
    });

    analyticsQueue.on('completed', (job) => {
      logger.debug(`Analytics job completed: ${job.id}`);
    });

    analyticsQueue.on('failed', (job, err) => {
      logger.error(`Analytics job failed: ${job.id}`, err);
    });

    logger.info('Queues initialized successfully');
    // Ensure DLQ is ready
    initializeDLQ();
  } catch (error) {
    logger.error('Failed to initialize queues:', error);
    throw error;
  }
}

export { workflowQueue, analyticsQueue };