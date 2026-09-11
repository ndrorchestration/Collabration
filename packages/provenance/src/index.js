const CONTENT_PASSPORT_FORBIDDEN_SEMANTICS = Object.freeze([
  'truth',
  'confidence',
  'verified',
  'certified',
  'correct'
]);

const CONTENT_PASSPORT_SCHEMA_VERSION = '0.1.0-alpha';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function assertExactSourceRevisions(sourceRevisions, label) {
  if (!Array.isArray(sourceRevisions)) throw new Error(`${label} must be an array`);
  const sourceIds = new Set();
  for (const source of sourceRevisions) {
    if (!isNonEmptyString(source?.sourceId) || !isNonEmptyString(source?.revisionId)) {
      throw new Error(`${label} requires sourceId and revisionId`);
    }
    if (sourceIds.has(source.sourceId)) throw new Error(`duplicate source revision identity: ${source.sourceId}`);
    sourceIds.add(source.sourceId);
  }
}

export function assertProvenanceRecord(record) {
  if (!record || typeof record !== 'object') throw new TypeError('provenance record is required');
  if (!Array.isArray(record.sourceObjects) || record.sourceObjects.length === 0) throw new Error('provenance record requires at least one source object');
  if (!Array.isArray(record.transformations)) throw new Error('transformations must be an array');
  if (!record.generatedAt || Number.isNaN(Date.parse(record.generatedAt))) throw new Error('generatedAt must be an ISO date-time');
  return true;
}

export function createProvenanceRecord({ sourceObjects, transformations = [], generatedAt }) {
  const record = { sourceObjects: Object.freeze([...(sourceObjects ?? [])]), transformations: Object.freeze([...transformations]), generatedAt };
  assertProvenanceRecord(record);
  return Object.freeze(record);
}

export function assertContentPassport(passport) {
  if (!passport || typeof passport !== 'object') throw new TypeError('content passport is required');
  if (!isNonEmptyString(passport.subject?.id) || !isNonEmptyString(passport.subject?.revisionId)) {
    throw new Error('content passport requires exact subject revision identity');
  }
  if (!Array.isArray(passport.sourceRevisions) || passport.sourceRevisions.length === 0) {
    throw new Error('content passport requires at least one source revision');
  }
  assertExactSourceRevisions(passport.sourceRevisions, 'source revision');

  if (!Array.isArray(passport.transformations)) throw new Error('transformations must be an array');
  if (passport.transformations.some((transformation) => !isNonEmptyString(transformation))) {
    throw new Error('transformations must contain non-empty string steps');
  }

  if (!Array.isArray(passport.responsibleActors) || passport.responsibleActors.length === 0) {
    throw new Error('content passport requires at least one responsible actor');
  }
  for (const actor of passport.responsibleActors) {
    if (!isNonEmptyString(actor?.actorId)) throw new Error('responsible actor requires actorId');
    if (!['human', 'agent'].includes(actor?.actorType)) throw new Error('responsible actor type must be human or agent');
  }

  if (!passport.generatedAt || Number.isNaN(Date.parse(passport.generatedAt))) {
    throw new Error('generatedAt must be an ISO date-time');
  }

  for (const semantic of CONTENT_PASSPORT_FORBIDDEN_SEMANTICS) {
    if (semantic in passport) {
      throw new Error(`forbidden semantic on content passport: ${semantic}; provenance is not a truth or certification claim`);
    }
  }

  return true;
}

export function createContentPassport({ subject, sourceRevisions, transformations = [], responsibleActors, generatedAt }) {
  const passport = {
    kind: 'content_passport',
    schemaVersion: CONTENT_PASSPORT_SCHEMA_VERSION,
    subject: Object.freeze({ ...subject }),
    sourceRevisions: Object.freeze([...(sourceRevisions ?? [])].map((source) => Object.freeze({ ...source }))),
    transformations: Array.isArray(transformations) ? Object.freeze([...transformations]) : transformations,
    responsibleActors: Object.freeze([...(responsibleActors ?? [])].map((actor) => Object.freeze({ ...actor }))),
    generatedAt
  };
  assertContentPassport(passport);
  return Object.freeze(passport);
}

export function assessContentPassportCurrentness(passport, currentSourceRevisions) {
  assertContentPassport(passport);
  assertExactSourceRevisions(currentSourceRevisions, 'current source revisions');

  const currentBySource = new Map(currentSourceRevisions.map((source) => [source.sourceId, source.revisionId]));
  const changedSourceIds = [];
  const missingSourceIds = [];

  for (const source of passport.sourceRevisions) {
    if (!currentBySource.has(source.sourceId)) {
      missingSourceIds.push(source.sourceId);
      continue;
    }
    if (currentBySource.get(source.sourceId) !== source.revisionId) changedSourceIds.push(source.sourceId);
  }

  const state = changedSourceIds.length > 0
    ? 'inputs_changed'
    : missingSourceIds.length > 0
      ? 'unknown'
      : 'current';

  return Object.freeze({
    state,
    changedSourceIds: Object.freeze(changedSourceIds),
    missingSourceIds: Object.freeze(missingSourceIds)
  });
}
