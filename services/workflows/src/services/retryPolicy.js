import { logger } from '../utils/logger.js';

// Calculate next delay with exponential backoff and jitter
const nextDelay = (attempt, { initialDelayMs = 1000, maxDelayMs = 30000, multiplier = 2, jitter = true } = {}) => {
  const base = Math.min(maxDelayMs, initialDelayMs * Math.pow(multiplier, attempt - 1));
  if (!jitter) return base;
  const rand = Math.random() * 0.3 + 0.85; // jitter 85%-115%
  return Math.floor(base * rand);
};

// Execute function with retry policy
const executeWithRetry = async (fn, { maxAttempts = 5, ...delayOpts } = {}, onRetry) => {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await fn();
    } catch (err) {
      if (attempt >= maxAttempts) throw err;
      const delay = nextDelay(attempt, delayOpts);
      if (onRetry) {
        try { onRetry(err, attempt, delay); } catch {}
      }
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

export async function withRetry(fn, opts = {}, onRetry) {
  return executeWithRetry(fn, opts, onRetry);
}

