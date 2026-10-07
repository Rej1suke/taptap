import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseSeedMenu } from '../lib/menu/csv';
import type { MenuResponse } from '../lib/menu/types';

const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const menuResponse = await fetch(`${base}/api/menu`);
assert.equal(menuResponse.status, 200);
const menu = await menuResponse.json() as MenuResponse;
const expected = parseSeedMenu(await readFile(new URL('../data/menu.csv', import.meta.url), 'utf8'));
assert.equal(menu.categories.length, expected.categories.length);
const items = menu.categories.flatMap((category) => category.items);
assert.equal(items.length, expected.items.length);
const variants = items.flatMap((item) => item.variants);
assert.deepEqual(variants.map((variant) => [variant.id, variant.priceCentavos, variant.temperature]).sort(), expected.variants.map((variant) => [variant.id, variant.priceCentavos, variant.temperature]).sort());
for (const path of ['/api/admin/menu', '/api/admin/categories', '/api/admin/items', '/api/admin/variants']) {
  assert.equal((await fetch(`${base}${path}`)).status, 401);
  assert.equal((await fetch(`${base}${path}`, { headers: { Authorization: 'Bearer forged' } })).status, 401);
}
for (const endpoint of ['signup', 'signin', 'signout']) {
  const response = await fetch(`${base}/api/auth/${endpoint}`, { method: 'POST', headers: { Origin: 'https://other.invalid', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('set-cookie'), null, `${endpoint} invalid origin must not change cookies`);
}
assert.equal((await fetch(`${base}/api/admin/items`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
assert.equal((await fetch(`${base}/dashboard`, { redirect: 'manual' })).status, 307);
console.log('Public CSV API, anonymous/forged admin denial, dashboard redirect, and cross-origin no-cookie-mutation checks passed.');
