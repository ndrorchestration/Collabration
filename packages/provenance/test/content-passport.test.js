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
  assert.throws(() => provenance.createContentPassport(validPassportInput({ sourceRevisions: [] })), /source revision/i);
});

test('content passport requires an exact subject id and revision id', () => {
  assert.throws(() => provenance.createContentPassport(validPassportInput({ subject: { id: 'post-123' } })), /subject revision/i);
});

test('source revision lineage must be exact and unambiguous', () => {
  assert.throws(() => provenance.createContentPassport(validPassportInput({ sourceRevisions: [{ sourceId: 'source-a' }] })), /source revision/i);
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
  assert.throws(() => provenance.createContentPassport(validPassportInput({ responsibleActors: [] })), /responsible actor/i);
  assert.throws(
    () => provenance.createContentPassport(validPassportInput({
      responsibleActors: [{ actorId: 'service-1', actorType: 'service' }]
    })),
    /actor type/i
  );
});

test('content passport validates transformation shape and generation time', () => {
  assert.throws(() => provenance.createContentPassport(validPassportInput({ transformations: 'summarize' })), /transformations/i);
  assert.throws(() => provenance.createContentPassport(validPassportInput({ generatedAt: 'not-a-date' })), /generatedAt/i);
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

test('content passport is a typed versioned immutable snapshot', () => {
  const input = validPassportInput();
  const passport = provenance.createContentPassport(input);

  assert.equal(passport.kind, 'content_passport');
  assert.equal(passport.schemaVersion, '0.1.0-alpha');
  assert.equal(Object.isFrozen(passport), true);
  assert.equal(Object.isFrozen(passport.subject), true);
  assert.equal(Object.isFrozen(passport.sourceRevisions), true);
  assert.equal(Object.isFrozen(passport.sourceRevisions[0]), true);
  assert.equal(Object.isFrozen(passport.transformations), true);
  assert.equal(Object.isFrozen(passport.responsibleActors), true);
  assert.equal(Object.isFrozen(passport.responsibleActors[0]), true);

  input.subject.revisionId = 'post-123@r3';
  input.sourceRevisions[0].revisionId = 'source-a@r5';
  input.responsibleActors[0].actorId = 'other-agent';

  assert.equal(passport.subject.revisionId, 'post-123@r2');
  assert.equal(passport.sourceRevisions[0].revisionId, 'source-a@r4');
  assert.equal(passport.responsibleActors[0].actorId, 'claim-agent-1');
});

test('content passport assertion requires exact kind and schema version', () => {
  const passport = provenance.createContentPassport(validPassportInput());
  const { kind, ...withoutKind } = passport;
  assert.equal(kind, 'content_passport');
  assert.throws(() => provenance.assertContentPassport(withoutKind), /content passport kind/i);
  assert.throws(
    () => provenance.assertContentPassport({ ...passport, schemaVersion: '0.2.0' }),
    /schema version/i
  );
});

test('passport currentness is current only when every bound source revision matches', () => {
  assert.equal(typeof provenance.assessContentPassportCurrentness, 'function');
  const passport = provenance.createContentPassport(validPassportInput());
  assert.deepEqual(
    provenance.assessContentPassportCurrentness(passport, [
      { sourceId: 'source-a', revisionId: 'source-a@r4' },
      { sourceId: 'source-b', revisionId: 'source-b@r1' }
    ]),
    { state: 'current', changedSourceIds: [], missingSourceIds: [] }
  );
});

test('passport currentness reports known input revision drift', () => {
  const passport = provenance.createContentPassport(validPassportInput());
  assert.deepEqual(
    provenance.assessContentPassportCurrentness(passport, [
      { sourceId: 'source-a', revisionId: 'source-a@r4' },
      { sourceId: 'source-b', revisionId: 'source-b@r2' }
    ]),
    { state: 'inputs_changed', changedSourceIds: ['source-b'], missingSourceIds: [] }
  );
});

test('passport currentness is unknown when required current revision evidence is missing', () => {
  const passport = provenance.createContentPassport(validPassportInput());
  assert.deepEqual(
    provenance.assessContentPassportCurrentness(passport, [
      { sourceId: 'source-a', revisionId: 'source-a@r4' }
    ]),
    { state: 'unknown', changedSourceIds: [], missingSourceIds: ['source-b'] }
  );
});
