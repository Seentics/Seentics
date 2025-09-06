import { logger } from '../utils/logger.js';

export class RetryPolicy {
  constructor({
    maxAttempts = 5,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    multiplier = 2,
    jitter = true,
  } = {}) {
    this.maxAttempts = maxAttempts;
    this.initialDelayMs = initialDelayMs;
    this.maxDelayMs = maxDelayMs;
    this.multiplier = multiplier;
    this.jitter = jitter;
  }

  nextDelay(attempt) {
    const base = Math.min(this.maxDelayMs, this.initialDelayMs * Math.pow(this.multiplier, attempt - 1));
    if (!this.jitter) return base;
    const rand = Math.random() * 0.3 + 0.85; // jitter 85%-115%
    return Math.floor(base * rand);
  }

  async execute(fn, onRetry) {
    let attempt = 0;
    while (attempt < this.maxAttempts) {
      attempt += 1;
      try {
        return await fn();
      } catch (err) {
        if (attempt >= this.maxAttempts) throw err;
        const delay = this.nextDelay(attempt);
        if (onRetry) {
          try { onRetry(err, attempt, delay); } catch {}
        }
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}

export async function withRetry(fn, opts = {}, onRetry) {
  const policy = new RetryPolicy(opts);
  return policy.execute(fn, onRetry);
}

