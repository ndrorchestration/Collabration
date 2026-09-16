import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ACTIVE_SOURCE_ROOTS = ['apps', 'packages', 'agents'];
const ACTIVE_EXTENSIONS = new Set(['.js', '.mjs', '.json']);

async function collectFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      files.push(...await collectFiles(path));
      continue;
    }

    const extension = entry.name.includes('.') ? entry.name.slice(entry.name.lastIndexOf('.')) : '';
    if (ACTIVE_EXTENSIONS.has(extension)) files.push(path);
  }

  return files;
}

test('canonical package identity is Collabration', async () => {
  const rootPackage = JSON.parse(await readFile('package.json', 'utf8'));
  const webPackage = JSON.parse(await readFile('apps/web/package.json', 'utf8'));

  assert.equal(rootPackage.name, 'collabration');
  assert.equal(webPackage.name, '@collabration/web');
  assert.equal(webPackage.dependencies?.['@collabration/governance'], '0.0.1-alpha');
  assert.equal(webPackage.dependencies?.['@collabration/social-core'], '0.0.1-alpha');
});

test('active application source no longer imports the historical Intellectro npm scope', async () => {
  const files = (await Promise.all(ACTIVE_SOURCE_ROOTS.map(collectFiles))).flat();
  const violations = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (source.includes('@intellectro/')) violations.push(file);
  }

  assert.deepEqual(violations, []);
});

test('current UI presents Collabration and the canonical brand language', async () => {
  const layout = await readFile('apps/web/app/layout.js', 'utf8');
  const landing = await readFile('apps/web/app/page.js', 'utf8');
  const login = await readFile('apps/web/app/login/page.js', 'utf8');

  assert.match(layout, /Collabration/);
  assert.match(landing, /Collabration/);
  assert.match(login, /Collabration/);
  assert.match(landing, /Metacollaborate\. Metacalibrate\. Metacelebrate\./);
});
