import { allowedKeys, ApiError, stringField } from '@/lib/api';
import type { MenuCategory, MenuItem, MenuVariant } from './types';

export type CategoryInput = Omit<MenuCategory, 'items'>;
export type ItemInput = Omit<MenuItem, 'variants'>;
export type VariantInput = MenuVariant;
type Validator = (value: unknown, field: string) => unknown;
const text: Validator = (value, field) => stringField(value, field);
const nullableText: Validator = (value, field) => value === null ? null : stringField(value, field, 2000);
const id: Validator = (value, field) => {
  const result = stringField(value, field, 120);
  if (!/^[a-zA-Z0-9_-]+$/.test(result)) throw new ApiError(400, 'VALIDATION_ERROR', `${field} must contain letters, digits, underscores or hyphens.`);
  return result;
};
const integer: Validator = (value, field) => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 2147483647) throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a nonnegative 32-bit integer.`);
  return value;
};
const boolean: Validator = (value, field) => {
  if (typeof value !== 'boolean') throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a boolean.`);
  return value;
};
function choice(values: readonly (string | null)[]): Validator {
  return (value, field) => {
    if ((typeof value !== 'string' && value !== null) || !values.includes(value)) throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be one of ${values.join(', ')}.`);
    return value;
  };
}
const category = { id, name: text, sortOrder: integer, active: boolean } satisfies Record<string, Validator>;
const item = {
  id, categoryId: id, itemType: choice(['beverage', 'food', 'addon']), name: text,
  description: nullableText, process: nullableText, roaster: nullableText,
  pictureUrl: ((value, field) => {
    if (value === null) return null;
    const result = stringField(value, field, 2000);
    if (!result.startsWith('/') && !/^https:\/\/[^\s]+$/.test(result)) throw new ApiError(400, 'VALIDATION_ERROR', 'pictureUrl must be a local absolute path or HTTPS URL.');
    return result;
  }) satisfies Validator,
  sortOrder: integer, active: boolean,
} satisfies Record<string, Validator>;
const variant = {
  id, itemId: id, name: text, temperature: choice(['iced', 'hot', null]),
  sizeOz: ((value, field) => value === null ? null : integer(value, field)) satisfies Validator,
  priceCentavos: integer, currency: choice(['PHP']), priceKind: choice(['base', 'surcharge']), sortOrder: integer,
  available: ((value, field) => value === null ? null : boolean(value, field)) satisfies Validator,
} satisfies Record<string, Validator>;

function parse(body: Record<string, unknown>, fields: Record<string, Validator>, patch: boolean): Record<string, unknown> {
  allowedKeys(body, Object.keys(fields).filter((key) => !patch || key !== 'id'));
  if (patch && Object.keys(body).length === 0) throw new ApiError(400, 'VALIDATION_ERROR', 'Provide at least one field.');
  return Object.fromEntries(Object.entries(body).map(([key, value]) => [key, fields[key](value, key)]));
}

export function parseCategory(body: Record<string, unknown>, patch = false): Partial<CategoryInput> {
  return parse(body, category, patch);
}
export function parseItem(body: Record<string, unknown>, patch = false): Partial<ItemInput> {
  return parse(body, item, patch);
}
export function parseVariant(body: Record<string, unknown>, patch = false): Partial<VariantInput> {
  return parse(body, variant, patch);
}
