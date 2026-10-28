import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCreateOrder } from '../lib/orders/validation';
import { isPublicOrder, parseTableNumber } from '../lib/orders/types';

const requestId = '00000000-0000-4000-8000-000000000000';

test('order input accepts a bounded, unique list of variants with defaults', () => {
  assert.deepEqual(parseCreateOrder({
    requestId,
    items: [{ variantId: 'var-americano-iced', quantity: 2 }],
  }), {
    requestId,
    orderType: 'dine_in',
    tableNumber: null,
    items: [{ variantId: 'var-americano-iced', quantity: 2, addonVariantIds: [] }],
  });
});

test('order input keeps add-ons with their drink and the table and order type', () => {
  assert.deepEqual(parseCreateOrder({
    requestId,
    orderType: 'takeout',
    tableNumber: 4,
    paymentMethod: 'counter',
    items: [
      { variantId: 'var-latte-iced', quantity: 1, addonVariantIds: ['var-upsize-standard', 'var-oatmilk-standard'] },
      { variantId: 'var-latte-iced', quantity: 1 },
    ],
  }), {
    requestId,
    orderType: 'takeout',
    tableNumber: 4,
    items: [
      { variantId: 'var-latte-iced', quantity: 1, addonVariantIds: ['var-oatmilk-standard', 'var-upsize-standard'] },
      { variantId: 'var-latte-iced', quantity: 1, addonVariantIds: [] },
    ],
  });
});

test('order input rejects client-supplied prices, duplicate lines, and invalid quantities', () => {
  assert.throws(() => parseCreateOrder({ requestId, total: 1, items: [{ variantId: 'coffee', quantity: 1 }] }));
  assert.throws(() => parseCreateOrder({
    requestId,
    items: [{ variantId: 'coffee', quantity: 1 }, { variantId: 'coffee', quantity: 1 }],
  }));
  assert.throws(() => parseCreateOrder({
    requestId,
    items: [
      { variantId: 'coffee', quantity: 1, addonVariantIds: ['a', 'b'] },
      { variantId: 'coffee', quantity: 1, addonVariantIds: ['b', 'a'] },
    ],
  }));
  assert.throws(() => parseCreateOrder({ requestId, items: [{ variantId: 'coffee', quantity: 0 }] }));
  assert.throws(() => parseCreateOrder({
    requestId,
    items: Array.from({ length: 6 }, (_, index) => ({ variantId: `coffee-${index}`, quantity: 20 })),
  }));
});

test('order input rejects bad add-ons, tables, order types, and online payment for now', () => {
  const items = [{ variantId: 'coffee', quantity: 1 }];
  assert.throws(() => parseCreateOrder({ requestId, items: [{ variantId: 'coffee', quantity: 1, addonVariantIds: ['a', 'a'] }] }));
  assert.throws(() => parseCreateOrder({ requestId, items: [{ variantId: 'coffee', quantity: 1, addonVariantIds: ['coffee'] }] }));
  assert.throws(() => parseCreateOrder({ requestId, items: [{ variantId: 'coffee', quantity: 1, addonVariantIds: 'a' }] }));
  assert.throws(() => parseCreateOrder({ requestId, tableNumber: 0, items }));
  assert.throws(() => parseCreateOrder({ requestId, tableNumber: 100, items }));
  assert.throws(() => parseCreateOrder({ requestId, tableNumber: '4', items }));
  assert.throws(() => parseCreateOrder({ requestId, orderType: 'delivery', items }));
  assert.throws(() => parseCreateOrder({ requestId, paymentMethod: 'online', items }));
});

test('table numbers from the NFC link are accepted only as 1 to 99', () => {
  assert.equal(parseTableNumber('4'), 4);
  assert.equal(parseTableNumber(['12', '3']), 12);
  for (const value of [undefined, '', '0', '100', '4a', '-1', '1.5', ' 4']) {
    assert.equal(parseTableNumber(value), null, String(value));
  }
});

test('public order guard accepts the API shape and rejects unknown statuses', () => {
  const order = {
    orderNumber: '42', status: 'placed', orderType: 'dine_in', tableNumber: 4, paymentMethod: 'counter',
    totalCentavos: 24000, createdAt: '2026-10-25T02:24:00.000Z',
    lines: [{ name: 'Latte', variantLabel: 'Iced', quantity: 1, unitPriceCentavos: 17500, lineTotalCentavos: 24000, addons: [{ name: 'Oatmilk', unitPriceCentavos: 4500 }] }],
  };
  assert.equal(isPublicOrder(order), true);
  assert.equal(isPublicOrder({ ...order, status: 'lost' }), false);
});
