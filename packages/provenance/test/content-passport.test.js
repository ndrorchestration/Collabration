import test from 'node:test';
import assert from 'node:assert/strict';
import * as provenance from '../src/index.js';

test('content passport binds a subject revision to source revisions and responsible actors', () => {
  assert.equal(typeof provenance.createContentPassport, 'function');

  const passport = provenance.createContentPassport({
    subject: { id: 'post-123', revisionId: 'post-123@r2' },
    sourceRevisions: [
      { sourceId: 'source-a', revisionId: 'source-a@r4' },
      { sourceId: 'source-b', revisionId: 'source-b@r1' }
    ],
    transformations: ['extract_claims', 'summarize', 'human_edit'],
    responsibleActors: [
      { actorId: 'claim-agent-1', actorType: 'agent' },
      { actorId: 'user-ender', actorType: 'human' }
    ],
    generatedAt: '2026-09-11T08:20:00.000Z'
  });

  assert.deepEqual(passport.subject, { id: 'post-123', revisionId: 'post-123@r2' });
  assert.deepEqual(passport.sourceRevisions, [
    { sourceId: 'source-a', revisionId: 'source-a@r4' },
    { sourceId: 'source-b', revisionId: 'source-b@r1' }
  ]);
  assert.deepEqual(passport.transformations, ['extract_claims', 'summarize', 'human_edit']);
  assert.deepEqual(passport.responsibleActors, [
    { actorId: 'claim-agent-1', actorType: 'agent' },
    { actorId: 'user-ender', actorType: 'human' }
  ]);
  assert.equal(passport.generatedAt, '2026-09-11T08:20:00.000Z');
});

test('content passport requires at least one exact source revision', () => {
  assert.equal(typeof provenance.assertContentPassport, 'function');
  assert.throws(
    () => provenance.createContentPassport({
      subject: { id: 'post-123', revisionId: 'post-123@r2' },
      sourceRevisions: [],
      transformations: [],
      responsibleActors: [{ actorId: 'user-ender', actorType: 'human' }],
      generatedAt: '2026-09-11T08:20:00.000Z'
    }),
    /source revision/i
  );
});

test('content passport requires an exact subject id and revision id', () => {
  assert.throws(
    () => provenance.createContentPassport({
      subject: { id: 'post-123' },
      sourceRevisions: [{ sourceId: 'source-a', revisionId: 'source-a@r4' }],
      transformations: [],
      responsibleActors: [{ actorId: 'user-ender', actorType: 'human' }],
      generatedAt: '2026-09-11T08:20:00.000Z'
    }),
    /subject revision/i
  );
});
