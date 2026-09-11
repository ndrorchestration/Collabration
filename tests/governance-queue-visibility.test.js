import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../apps/web/app/app/page.js', import.meta.url), 'utf8');

test('moderator queue queries pending governed actions independently of capped action history', () => {
  assert.match(page, /from\('agent_actions'\)[\s\S]*?\.eq\('space_id', activeSpace\.id\)[\s\S]*?\.eq\('approval_status', 'pending'\)/);
  assert.doesNotMatch(page, /const pendingActions = agentActions\.filter/);
});

test('correction queue resolves target Space directly instead of depending on capped post/action lists', () => {
  assert.match(page, /correction_requests[\s\S]*posts\(space_id\)[\s\S]*agent_actions\(space_id\)/);
  assert.match(page, /correctionTargetSpaceId/);
  assert.doesNotMatch(page, /activePostIds[\s\S]*activeActionIds[\s\S]*visibleCorrections\.filter/);
});
