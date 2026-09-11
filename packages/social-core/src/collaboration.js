const TASK_STATUSES = new Set(['open', 'in_progress', 'done']);
const ARTIFACT_TYPES = new Set(['document', 'dataset', 'code', 'decision_record', 'other']);

function requireText(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} is required`);
  return value.trim();
}

function requireDateTime(value, name) {
  const normalized = requireText(value, name);
  if (Number.isNaN(Date.parse(normalized))) throw new TypeError(`${name} must be an ISO date-time`);
  return normalized;
}

export function createResearchQuestion({ id, spaceId, createdBy, title, body, createdAt }) {
  return Object.freeze({
    id: requireText(id, 'id'),
    spaceId: requireText(spaceId, 'spaceId'),
    createdBy: requireText(createdBy, 'createdBy'),
    title: requireText(title, 'title'),
    body: requireText(body, 'body'),
    status: 'open',
    createdAt: requireDateTime(createdAt, 'createdAt')
  });
}

export function createProjectFromResearchQuestion(question, { id, ownerId, title, createdAt }) {
  if (!question || typeof question !== 'object') throw new TypeError('research question is required');
  if (question.status !== 'open') throw new Error('research question must be open');
  return Object.freeze({
    id: requireText(id, 'id'),
    spaceId: requireText(question.spaceId, 'question.spaceId'),
    sourceResearchQuestionId: requireText(question.id, 'question.id'),
    ownerId: requireText(ownerId, 'ownerId'),
    title: requireText(title, 'title'),
    status: 'active',
    createdAt: requireDateTime(createdAt, 'createdAt')
  });
}

export function createProjectTask({ id, projectId, createdBy, title, createdAt }) {
  return Object.freeze({
    id: requireText(id, 'id'),
    projectId: requireText(projectId, 'projectId'),
    createdBy: requireText(createdBy, 'createdBy'),
    title: requireText(title, 'title'),
    status: 'open',
    createdAt: requireDateTime(createdAt, 'createdAt'),
    updatedAt: null,
    lastChangedBy: null
  });
}

export function transitionProjectTask(task, { actorId, status, updatedAt }) {
  if (!task || typeof task !== 'object') throw new TypeError('project task is required');
  if (task.status === 'done') throw new Error('done project task is terminal');
  const normalizedStatus = requireText(status, 'status');
  if (!TASK_STATUSES.has(normalizedStatus)) throw new TypeError(`unsupported task status: ${normalizedStatus}`);
  const allowed = task.status === 'open'
    ? new Set(['open', 'in_progress', 'done'])
    : new Set(['in_progress', 'done']);
  if (!allowed.has(normalizedStatus)) throw new Error(`unsupported task transition: ${task.status} -> ${normalizedStatus}`);
  return Object.freeze({
    ...task,
    status: normalizedStatus,
    updatedAt: requireDateTime(updatedAt, 'updatedAt'),
    lastChangedBy: requireText(actorId, 'actorId')
  });
}

export function createProjectArtifact({ id, projectId, createdBy, title, artifactType, contentRef, createdAt }) {
  const type = requireText(artifactType, 'artifactType');
  if (!ARTIFACT_TYPES.has(type)) throw new TypeError(`unsupported artifact type: ${type}`);
  return Object.freeze({
    id: requireText(id, 'id'),
    projectId: requireText(projectId, 'projectId'),
    createdBy: requireText(createdBy, 'createdBy'),
    title: requireText(title, 'title'),
    artifactType: type,
    contentRef: requireText(contentRef, 'contentRef'),
    createdAt: requireDateTime(createdAt, 'createdAt')
  });
}

export function createProjectOutcome({ id, projectId, recordedBy, summary, createdAt }) {
  return Object.freeze({
    id: requireText(id, 'id'),
    projectId: requireText(projectId, 'projectId'),
    recordedBy: requireText(recordedBy, 'recordedBy'),
    summary: requireText(summary, 'summary'),
    createdAt: requireDateTime(createdAt, 'createdAt')
  });
}
