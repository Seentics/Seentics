import Queue from 'bull';
import { redisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

let dlq;

export function initializeDLQ() {
  dlq = new Queue('workflow dlq', { redis: redisClient });
  dlq.on('completed', (job) => logger.debug(`DLQ job completed: ${job.id}`));
  dlq.on('failed', (job, err) => logger.error(`DLQ job failed: ${job.id}`, err));
  return dlq;
}

export async function sendToDLQ(payload, reason = 'unknown') {
  if (!dlq) initializeDLQ();
  await dlq.add('dlq-item', { payload, reason }, { removeOnComplete: 500, removeOnFail: 200 });
}

export { dlq };

