import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  loadCapabilityMatrix,
  policyForAgent,
  validateCapabilityMatrix
} from '../src/matrix.js';

const matrixText = await readFile(new URL('../../../governance/capability-matrix.yaml', import.meta.url), 'utf8');

test('canonical capability matrix parses and validates fail-closed invariants', () => {
  const matrix = loadCapabilityMatrix(matrixText);
  assert.equal(matrix.default, 'deny');
  assert.equal(matrix.principles.accountable_owner_required, true);
  assert.equal(matrix.principles.self_escalation, 'deny');
  assert.equal(matrix.alpha_constraints.autonomous_public_posting, 'deny');
});

test('community runtime policy uses canonical matrix vocabulary and approval semantics', () => {
  const matrix = loadCapabilityMatrix(matrixText);
  const policy = policyForAgent(matrix, 'community_agent');
  assert.equal(policy.capabilities.summarize_space, 'allow');
  assert.equal(policy.capabilities.publish_public_content, 'approval_required');
  assert.equal(policy.capabilities.delete_content, 'deny');
  assert.equal(policy.capabilities.grant_capability, 'deny');
  assert.equal(policy.capabilities.summarize, undefined);
  assert.equal(policy.capabilities.publish, undefined);
});

test('claim runtime policy is derived from the same canonical matrix', () => {
  const matrix = loadCapabilityMatrix(matrixText);
  const policy = policyForAgent(matrix, 'claim_agent');
  assert.equal(policy.capabilities.extract_claims, 'allow');
  assert.equal(policy.capabilities.publish_annotation, 'approval_required');
  assert.equal(policy.capabilities.grant_capability, 'deny');
});

test('invalid decision values fail matrix validation', () => {
  const matrix = loadCapabilityMatrix(matrixText);
  const broken = structuredClone(matrix);
  broken.agents.community_agent.capabilities.delete_content = 'sometimes';
  assert.throws(() => validateCapabilityMatrix(broken), /invalid capability decision/);
});

test('authority-bearing matrices must remain deny-by-default', () => {
  const matrix = loadCapabilityMatrix(matrixText);
  const broken = structuredClone(matrix);
  broken.default = 'allow';
  assert.throws(() => validateCapabilityMatrix(broken), /default must be deny/);
});

test('agents cannot gain grant-capability authority through matrix edits', () => {
  const matrix = loadCapabilityMatrix(matrixText);
  const broken = structuredClone(matrix);
  broken.agents.claim_agent.capabilities.grant_capability = 'allow';
  assert.throws(() => validateCapabilityMatrix(broken), /grant_capability must be deny/);
});
