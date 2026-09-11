import test from 'node:test';
import assert from 'node:assert/strict';
import { assertProvenanceRecord, createProvenanceRecord } from '../src/index.js';

test('provenance requires at least one source object', () => {
  assert.throws(() => createProvenanceRecord({ sourceObjects: [], transformations: [], generatedAt: '2026-09-11T02:00:00.000Z' }), /source object/);
});

test('provenance preserves transformation order', () => {
  const record = createProvenanceRecord({ sourceObjects: ['source-1', 'source-2'], transformations: ['extract_claims', 'summarize', 'human_edit'], generatedAt: '2026-09-11T02:00:00.000Z' });
  assert.deepEqual(record.transformations, ['extract_claims', 'summarize', 'human_edit']);
  assert.equal(assertProvenanceRecord(record), true);
});

test('provenance validation does not synthesize truth or confidence claims', () => {
  const record = createProvenanceRecord({ sourceObjects: ['source-1'], transformations: ['extract_claims'], generatedAt: '2026-09-11T02:00:00.000Z' });
  assert.equal('truth' in record, false);
  assert.equal('confidence' in record, false);
  assert.equal('verified' in record, false);
});
