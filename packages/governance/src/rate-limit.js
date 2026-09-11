import { createActionEvent } from './action-event.js';

export function createRateLimiter({ limit, windowMs, now = () => Date.now() }) {
  if (!Number.isInteger(limit) || limit < 1) throw new TypeError('limit must be a positive integer');
  if (!Number.isFinite(windowMs) || windowMs <= 0) throw new TypeError('windowMs must be positive');

  const buckets = new Map();

  function check(key, { audit } = {}) {
    if (!key) throw new TypeError('rate-limit key is required');
    const timestamp = now();
    let bucket = buckets.get(key);
    if (!bucket || timestamp >= bucket.resetAt) {
      bucket = { count: 0, resetAt: timestamp + windowMs };
      buckets.set(key, bucket);
    }

    if (bucket.count >= limit) {
      const result = { allowed: false, remaining: 0, resetAt: bucket.resetAt };
      if (audit) {
        result.auditEvent = createActionEvent({
          action_id: `rate-limit:${key}:${timestamp}`,
          ...audit,
          approval_status: 'not_required',
          rate_limit_decision: 'denied',
          timestamp: new Date(timestamp).toISOString()
        });
      }
      return Object.freeze(result);
    }

    bucket.count += 1;
    return Object.freeze({ allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt });
  }

  return Object.freeze({ check });
}
