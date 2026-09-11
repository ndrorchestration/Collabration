import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ALPHA_CAPABILITY_MATRIX,
  buildPermissionInspection,
  loadCapabilityMatrix
} from '../packages/governance/src/index.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const matrix = loadCapabilityMatrix(read('governance/capability-matrix.yaml'));

test('executable alpha policy projection is exactly equal to canonical YAML', () => {
  assert.deepEqual(ALPHA_CAPABILITY_MATRIX, matrix);
});

test('permission inspection exposes declared decisions and default-denies unknown capabilities', () => {
  const inspection = buildPermissionInspection(ALPHA_CAPABILITY_MATRIX, 'community_agent', ['unknown_future_capability']);
  assert.equal(inspection.version, '0.1.0-alpha');
  assert.equal(inspection.agentType, 'community_agent');
  assert.equal(inspection.defaultDecision, 'deny');
  assert.equal(inspection.capabilities.find((item) => item.capability === 'summarize_space')?.decision, 'allow');
  assert.equal(inspection.capabilities.find((item) => item.capability === 'draft_public_content')?.decision, 'approval_required');
  assert.equal(inspection.capabilities.find((item) => item.capability === 'delete_content')?.decision, 'deny');
  assert.equal(inspection.capabilities.find((item) => item.capability === 'unknown_future_capability')?.decision, 'deny');
  assert.equal(Object.isFrozen(inspection), true);
});

test('claim agent inspection preserves denied moderation and approval-required publication', () => {
  const inspection = buildPermissionInspection(ALPHA_CAPABILITY_MATRIX, 'claim_agent');
  assert.equal(inspection.capabilities.find((item) => item.capability === 'moderate_user')?.decision, 'deny');
  assert.equal(inspection.capabilities.find((item) => item.capability === 'publish_annotation')?.decision, 'approval_required');
});

test('persisted app exposes permission inspector and RLS-bound action history without execution claims', () => {
  const page = read('apps/web/app/app/page.js');
  assert.match(page, /Permission inspector/);
  assert.match(page, /Permission does not mean an action occurred/);
  assert.match(page, /from\('agent_actions'\)/);
  assert.match(page, /approval_records/);
  assert.match(page, /buildPermissionInspection/);
  assert.match(page, /ALPHA_CAPABILITY_MATRIX/);
});
