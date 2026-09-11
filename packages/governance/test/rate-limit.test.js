import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../src/index.js';

const audit = { actor_id: 'agent-community-1', owner_id: 'user-1', action: 'summarize', scope: 'space:alpha', policy_version: 'alpha-0.1', capabilities_used: ['summarize'] };

test('rate limiter denies actions after quota and emits an audit event', () => {
  let now = 1_000;
  const limiter = createRateLimiter({ limit: 2, windowMs: 1_000, now: () => now });
  assert.equal(limiter.check('agent-community-1', { audit }).allowed, true);
  assert.equal(limiter.check('agent-community-1', { audit }).allowed, true);
  const denied = limiter.check('agent-community-1', { audit });
  assert.equal(denied.allowed, false);
  assert.equal(denied.auditEvent.rate_limit_decision, 'denied');
  assert.equal(denied.auditEvent.action, 'summarize');
});

test('rate limiter resets after the window elapses', () => {
  let now = 5_000;
  const limiter = createRateLimiter({ limit: 1, windowMs: 100, now: () => now });
  assert.equal(limiter.check('agent-community-1', { audit }).allowed, true);
  assert.equal(limiter.check('agent-community-1', { audit }).allowed, false);
  now = 5_101;
  assert.equal(limiter.check('agent-community-1', { audit }).allowed, true);
});
