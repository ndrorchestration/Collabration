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
  if (!Array.isArray(passport.sourceRevisions) || passport.sourceRevisions.length === 0) {
    throw new Error('content passport requires at least one source revision');
  }
  return true;
}

export function createContentPassport({ subject, sourceRevisions, transformations = [], responsibleActors, generatedAt }) {
  const passport = {
    subject: { ...subject },
    sourceRevisions: [...(sourceRevisions ?? [])].map((source) => ({ ...source })),
    transformations: [...transformations],
    responsibleActors: [...(responsibleActors ?? [])].map((actor) => ({ ...actor })),
    generatedAt
  };
  assertContentPassport(passport);
  return passport;
}
