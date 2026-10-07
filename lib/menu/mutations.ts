import 'server-only';
import { randomUUID } from 'node:crypto';
import { db } from '@/prisma/db';
import { ApiError, stringField } from '@/lib/api';
import { parseCategory, parseItem, parseVariant } from './validation';

export type Resource = 'categories' | 'items' | 'variants';
export function resourceName(value: string): Resource {
  if (value !== 'categories' && value !== 'items' && value !== 'variants') throw new ApiError(404, 'NOT_FOUND', 'Resource not found.');
  return value;
}

export async function createRecord(resource: Resource, body: Record<string, unknown>): Promise<unknown> {
  if (resource === 'categories') {
    const input = parseCategory(body);
    return db.orm.public.MenuCategory.create({ id: input.id ?? randomUUID(), name: stringField(input.name, 'name'), sortOrder: 0, active: true, ...input });
  }
  if (resource === 'items') {
    const input = parseItem(body);
    const categoryId = stringField(input.categoryId, 'categoryId');
    if (!await db.orm.public.MenuCategory.where({ id: categoryId }).first()) throw new ApiError(400, 'INVALID_REFERENCE', 'categoryId does not exist.');
    if (!input.itemType) throw new ApiError(400, 'VALIDATION_ERROR', 'itemType is required.');
    return db.orm.public.MenuItem.create({
      id: input.id ?? randomUUID(), categoryId, itemType: input.itemType, name: stringField(input.name, 'name'),
      description: null, process: null, roaster: null, pictureUrl: null, sortOrder: 0, active: true, ...input,
    });
  }
  const input = parseVariant(body);
  const itemId = stringField(input.itemId, 'itemId');
  if (!await db.orm.public.MenuItem.where({ id: itemId }).first()) throw new ApiError(400, 'INVALID_REFERENCE', 'itemId does not exist.');
  if (input.priceCentavos === undefined || !input.priceKind) throw new ApiError(400, 'VALIDATION_ERROR', 'priceCentavos and priceKind are required.');
  return db.orm.public.MenuVariant.create({
    id: input.id ?? randomUUID(), itemId, name: stringField(input.name, 'name'), priceCentavos: input.priceCentavos,
    priceKind: input.priceKind, currency: 'PHP', temperature: null, sizeOz: null, sortOrder: 0, available: null, ...input,
  });
}

export async function updateRecord(resource: Resource, id: string, body: Record<string, unknown>): Promise<unknown> {
  if (resource === 'categories') {
    const input = parseCategory(body, true);
    if (!await db.orm.public.MenuCategory.where({ id }).first()) throw new ApiError(404, 'NOT_FOUND', 'Category not found.');
    return db.orm.public.MenuCategory.where({ id }).update(input);
  }
  if (resource === 'items') {
    const input = parseItem(body, true);
    if (!await db.orm.public.MenuItem.where({ id }).first()) throw new ApiError(404, 'NOT_FOUND', 'Item not found.');
    if (input.categoryId && !await db.orm.public.MenuCategory.where({ id: input.categoryId }).first()) throw new ApiError(400, 'INVALID_REFERENCE', 'categoryId does not exist.');
    return db.orm.public.MenuItem.where({ id }).update(input);
  }
  const input = parseVariant(body, true);
  if (!await db.orm.public.MenuVariant.where({ id }).first()) throw new ApiError(404, 'NOT_FOUND', 'Variant not found.');
  if (input.itemId && !await db.orm.public.MenuItem.where({ id: input.itemId }).first()) throw new ApiError(400, 'INVALID_REFERENCE', 'itemId does not exist.');
  return db.orm.public.MenuVariant.where({ id }).update(input);
}

export async function deleteRecord(resource: Resource, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    if (resource === 'categories') {
      if (!await tx.orm.public.MenuCategory.where({ id }).first()) throw new ApiError(404, 'NOT_FOUND', 'Category not found.');
      if (await tx.orm.public.MenuItem.where({ categoryId: id }).first()) throw new ApiError(409, 'CATEGORY_NOT_EMPTY', 'Move or delete the category items first.');
      await tx.orm.public.MenuCategory.where({ id }).delete();
    } else if (resource === 'items') {
      if (!await tx.orm.public.MenuItem.where({ id }).first()) throw new ApiError(404, 'NOT_FOUND', 'Item not found.');
      await tx.orm.public.MenuVariant.where({ itemId: id }).delete();
      await tx.orm.public.MenuItem.where({ id }).delete();
    } else {
      if (!await tx.orm.public.MenuVariant.where({ id }).first()) throw new ApiError(404, 'NOT_FOUND', 'Variant not found.');
      await tx.orm.public.MenuVariant.where({ id }).delete();
    }
  });
}
