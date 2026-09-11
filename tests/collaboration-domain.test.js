import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createResearchQuestion,
  createProjectFromResearchQuestion,
  createProjectTask,
  transitionProjectTask,
  createProjectArtifact,
  createProjectOutcome
} from '../packages/social-core/src/collaboration.js';

const t0 = '2026-09-11T10:45:00Z';
const t1 = '2026-09-11T10:46:00Z';

function question() {
  return createResearchQuestion({
    id: 'rq-1',
    spaceId: 'space-1',
    createdBy: 'user-1',
    title: 'How should we evaluate this claim?',
    body: 'Define the evidence and decision criteria.',
    createdAt: t0
  });
}

test('research question is immutable, Space-scoped, and human-owned', () => {
  const value = question();
  assert.deepEqual(value, {
    id: 'rq-1',
    spaceId: 'space-1',
    createdBy: 'user-1',
    title: 'How should we evaluate this claim?',
    body: 'Define the evidence and decision criteria.',
    status: 'open',
    createdAt: t0
  });
  assert.equal(Object.isFrozen(value), true);
});

test('research question promotes to project without losing source identity', () => {
  const project = createProjectFromResearchQuestion(question(), {
    id: 'project-1',
    ownerId: 'user-1',
    title: 'Claim evaluation project',
    createdAt: t1
  });
  assert.equal(project.spaceId, 'space-1');
  assert.equal(project.sourceResearchQuestionId, 'rq-1');
  assert.equal(project.ownerId, 'user-1');
  assert.equal(project.status, 'active');
  assert.equal(Object.isFrozen(project), true);
});

test('project task has bounded lifecycle and explicit actor', () => {
  const task = createProjectTask({
    id: 'task-1', projectId: 'project-1', createdBy: 'user-1', title: 'Collect primary sources', createdAt: t0
  });
  assert.equal(task.status, 'open');

  const active = transitionProjectTask(task, { actorId: 'user-2', status: 'in_progress', updatedAt: t1 });
  assert.equal(active.status, 'in_progress');
  assert.equal(active.lastChangedBy, 'user-2');

  const done = transitionProjectTask(active, { actorId: 'user-2', status: 'done', updatedAt: '2026-09-11T10:47:00Z' });
  assert.equal(done.status, 'done');
  assert.throws(() => transitionProjectTask(done, { actorId: 'user-2', status: 'open', updatedAt: '2026-09-11T10:48:00Z' }), /terminal/i);
  assert.throws(() => transitionProjectTask(task, { actorId: 'user-2', status: 'invalid', updatedAt: t1 }), /unsupported task status/i);
});

test('project artifact records human creator and an external or internal content reference', () => {
  const artifact = createProjectArtifact({
    id: 'artifact-1', projectId: 'project-1', createdBy: 'user-2', title: 'Evidence table', artifactType: 'document', contentRef: 'doc:evidence-table-v1', createdAt: t0
  });
  assert.equal(artifact.createdBy, 'user-2');
  assert.equal(artifact.artifactType, 'document');
  assert.equal(artifact.contentRef, 'doc:evidence-table-v1');
  assert.equal(Object.isFrozen(artifact), true);
});

test('project outcome is a recorded human disposition, not a truth or authority claim', () => {
  const outcome = createProjectOutcome({
    id: 'outcome-1', projectId: 'project-1', recordedBy: 'user-1', summary: 'Proceed with the controlled test.', createdAt: t1
  });
  assert.deepEqual(outcome, {
    id: 'outcome-1',
    projectId: 'project-1',
    recordedBy: 'user-1',
    summary: 'Proceed with the controlled test.',
    createdAt: t1
  });
  assert.equal('verified' in outcome, false);
  assert.equal('truth' in outcome, false);
  assert.equal('authority' in outcome, false);
});
