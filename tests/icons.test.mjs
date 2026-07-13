import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const metadata = JSON.parse(await readFile(new URL('../icons.json', import.meta.url), 'utf8'));

test('ships a broad, uniquely named icon catalog', async () => {
  const files = (await readdir(new URL('../icons/', import.meta.url))).filter((file) => file.endsWith('.svg'));
  assert.equal(files.length, 360);
  assert.equal(metadata.length, 360);
  assert.equal(new Set(metadata.map((item) => item.name)).size, 360);
  assert.ok(new Set(metadata.map((item) => item.category)).size >= 12);
});

test('every SVG follows the RiskLab geometry and accessibility contract', async () => {
  for (const { name } of metadata) {
    const source = await readFile(new URL(`../icons/${name}.svg`, import.meta.url), 'utf8');
    assert.match(source, /^<svg /);
    assert.match(source, /viewBox="0 0 24 24"/);
    assert.match(source, /stroke="currentColor"/);
    assert.match(source, /stroke-linecap="round"/);
    assert.match(source, new RegExp(`aria-label="${name}"`));
    assert.doesNotMatch(source, /<script|on\w+=|javascript:/i);
  }
});

test('catalog contains no brand or product marks', () => {
  const names = metadata.map((item) => `${item.name} ${item.keywords.join(' ')}`).join(' ');
  assert.doesNotMatch(names, /logo|brand|trademark/i);
});

test('sprite exposes every icon as a namespaced symbol', async () => {
  const sprite = await readFile(new URL('../sprite/risklab-icons.svg', import.meta.url), 'utf8');
  const symbols = sprite.match(/<symbol /g) ?? [];
  assert.equal(symbols.length, 360);
  assert.match(sprite, /id="risklab-database-check"/);
});

test('runtime renders escaped, accessible SVG strings and searchable metadata', async () => {
  const runtime = await import('../dist/index.js');
  const labeled = runtime.icon('shield-check', { size: 20, label: 'Verified & safe' });
  assert.match(labeled, /width="20"/);
  assert.match(labeled, /aria-label="Verified &amp; safe"/);
  assert.doesNotMatch(labeled, /aria-hidden/);
  const decorative = runtime.icon('shield');
  assert.match(decorative, /aria-hidden="true"/);
  assert.deepEqual(runtime.searchIcons('database'), ['database', 'database-circle', 'database-square', 'database-add', 'database-check']);
});
