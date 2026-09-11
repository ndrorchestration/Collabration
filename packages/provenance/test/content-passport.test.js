import test from 'node:test';
import assert from 'node:assert/strict';
import * as provenance from '../src/index.js';

function validPassportInput(overrides = {}) {
  return {
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
    generatedAt: '2026-09-11T08:20:00.000Z',
    ...overrides
  };
}

test('content passport binds a subject revision to source revisions and responsible actors', () => {
  assert.equal(typeof provenance.createContentPassport, 'function');
  const passport = provenance.createContentPassport(validPassportInput());

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
    () => provenance.createContentPassport(validPassportInput({ sourceRevisions: [] })),
    /source revision/i
  );
});

test('content passport requires an exact subject id and revision id', () => {
  assert.throws(
    () => provenance.createContentPassport(validPassportInput({ subject: { id: 'post-123' } })),
    /subject revision/i
  );
});

test('source revision lineage must be exact and unambiguous', () => {
  assert.throws(
    () => provenance.createContentPassport(validPassportInput({
      sourceRevisions: [{ sourceId: 'source-a' }]
    })),
    /source revision/i
  );
  assert.throws(
    () => provenance.createContentPassport(validPassportInput({
      sourceRevisions: [
        { sourceId: 'source-a', revisionId: 'source-a@r4' },
        { sourceId: 'source-a', revisionId: 'source-a@r5' }
      ]
    })),
    /duplicate source/i
  );
});

test('content passport requires accountable human or agent actors', () => {
  assert.throws(
    () => provenance.createContentPassport(validPassportInput({ responsibleActors: [] })),
    /responsible actor/i
  );
  assert.throws(
    () => provenance.createContentPassport(validPassportInput({
      responsibleActors: [{ actorId: 'service-1', actorType: 'service' }]
    })),
    /actor type/i
  );
});

test('content passport validates transformation shape and generation time', () => {
  assert.throws(
    () => provenance.createContentPassport(validPassportInput({ transformations: 'summarize' })),
    /transformations/i
  );
  assert.throws(
    () => provenance.createContentPassport(validPassportInput({ generatedAt: 'not-a-date' })),
    /generatedAt/i
  );
});

test('content passport rejects truth confidence verification and certification semantics', () => {
  const passport = provenance.createContentPassport(validPassportInput());
  for (const forbidden of ['truth', 'confidence', 'verified', 'certified', 'correct']) {
    assert.equal(forbidden in passport, false);
    assert.throws(
      () => provenance.assertContentPassport({ ...passport, [forbidden]: true }),
      /not a truth|forbidden semantic/i
    );
  }
});
