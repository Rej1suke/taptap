import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { csvRows, parseSeedMenu } from '../lib/menu/csv';
import { parseItem, parseVariant } from '../lib/menu/validation';
import { passwordField } from '../lib/api';

const csv = readFileSync('data/menu.csv', 'utf8');
test('authoritative CSV retains identities, variants, process, and add-on size', () => {
  const menu = parseSeedMenu(csv);
  assert.deepEqual([menu.categories.length, menu.items.length, menu.variants.length], [8, 33, 40]);
  assert.equal(menu.variants.find((variant) => variant.id === 'var-americano-iced')?.priceCentavos, 17500);
  assert.equal(menu.variants.find((variant) => variant.id === 'var-americano-hot')?.priceCentavos, 17000);
  assert.equal(menu.variants.find((variant) => variant.id === 'var-upsize-standard')?.sizeOz, 16);
  assert.equal(menu.items.find((item) => item.id === 'item-finca-deborah-parabolic-geisha')?.process, 'Deeply Extended Natural · Carbonic Maceration');
  assert.ok(menu.variants.every((variant) => variant.available === null));
});
test('quoted CSV keeps embedded commas, escaped quotes, and rejects unclosed records', () => {
  assert.deepEqual(csvRows('a,b\n"tea, milk","a ""quote"""\n'), [['a', 'b'], ['tea, milk', 'a "quote"']]);
  assert.throws(() => csvRows('"broken'));
  assert.throws(() => parseSeedMenu(csv.replace('175.00', '175.001')));
  assert.throws(() => parseSeedMenu(csv + csv.split('\n')[1]));
});
test('mutation boundary rejects privilege fields, ambiguous price floats, and invalid enums', () => {
  assert.throws(() => parseItem({ name: 'X', isAdmin: true }, true));
  assert.throws(() => parseVariant({ priceCentavos: 100.5 }, true));
  assert.throws(() => parseVariant({ temperature: 'warm' }, true));
  assert.throws(() => parseItem({ id: 'replace' }, true));
  assert.throws(() => parseVariant({ priceCentavos: -1 }, true));
  assert.equal(passwordField('  secret password  '), '  secret password  ');
});
