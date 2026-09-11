import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function read(path) { return readFile(new URL(`../${path}`, import.meta.url), 'utf8'); }

test('social shell states chronological ranking and demo persistence boundaries', async () => {
  const page = await read('apps/web/app/page.js');
  assert.match(page, /Chronological feed/); assert.match(page, /No ranking model/); assert.match(page, /Demo mode/);
});

test('post UI exposes typed trust context and provenance-not-truth disclosure', async () => {
  const card = await read('apps/web/components/post-card.js');
  assert.match(card, /Human-authored/); assert.match(card, /Source-linked/); assert.match(card, /AI-assisted/); assert.match(card, /View context/); assert.match(card, /does not certify that a claim is true/i);
});

test('claim response controls use contextual actions rather than truth voting', async () => {
  const bar = await read('apps/web/components/context-response-bar.js');
  assert.match(bar, /Support/); assert.match(bar, /Challenge/); assert.match(bar, /Qualify/); assert.match(bar, /Add evidence/); assert.doesNotMatch(bar, />True</); assert.doesNotMatch(bar, />False</);
});

test('auth UI fails visibly closed when Supabase is not configured', async () => {
  const form = await read('apps/web/components/login-form.js');
  assert.match(form, /disabled=\{!configured \|\| busy\}/); assert.match(form, /Demo mode/); assert.match(form, /signInWithOtp/);
});
