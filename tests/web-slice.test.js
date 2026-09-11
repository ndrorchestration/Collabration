import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function read(path) { return readFile(new URL(`../${path}`, import.meta.url), 'utf8'); }

test('social shell states chronological ranking and demo persistence boundaries', async () => {
  const page = await read('apps/web/app/page.js');
  assert.match(page, /chronological feed/i);
  assert.match(page, /No ranking model/);
  assert.match(page, /Demo mode/);
  assert.match(page, /never represents an authenticated session/i);
});

test('post UI exposes exceptional typed trust context and provenance-not-truth disclosure', async () => {
  const card = await read('apps/web/components/post-card.js');
  const signals = await read('apps/web/components/trust-signals.js');
  assert.doesNotMatch(card, />Human-authored</);
  assert.match(signals, /Source-linked/);
  assert.match(signals, /AI summarized/);
  assert.match(signals, /AI extracted claims/);
  assert.match(signals, /Human approved/);
  assert.match(signals, /Awaiting approval/);
  assert.match(card, /View context/);
  assert.match(card, /does not certify that a claim is true/i);
  assert.doesNotMatch(card, /AI enhanced/i);
  assert.doesNotMatch(signals, /AI enhanced/i);
});

test('claim response controls use contextual actions rather than truth voting', async () => {
  const bar = await read('apps/web/components/context-response-bar.js');
  assert.match(bar, /Support/);
  assert.match(bar, /Challenge/);
  assert.match(bar, /Qualify/);
  assert.match(bar, /Add evidence/);
  assert.doesNotMatch(bar, />True</);
  assert.doesNotMatch(bar, />False</);
});

test('auth UI fails visibly closed when Supabase is not configured', async () => {
  const form = await read('apps/web/components/login-form.js');
  assert.match(form, /disabled=\{!configured \|\| busy\}/);
  assert.match(form, /Demo mode/);
  assert.match(form, /signInWithOtp/);
});
