import 'server-only';
import { db } from '@/prisma/db';
import type { ItemType, MenuResponse, MenuVariant, PriceKind, Temperature } from './types';

export async function getMenu(includeInactive = false): Promise<MenuResponse> {
  const [categories, items, variants] = await Promise.all([
    db.orm.public.MenuCategory.orderBy([(row) => row.sortOrder.asc(), (row) => row.id.asc()]).all(),
    db.orm.public.MenuItem.orderBy([(row) => row.sortOrder.asc(), (row) => row.id.asc()]).all(),
    db.orm.public.MenuVariant.orderBy([(row) => row.sortOrder.asc(), (row) => row.id.asc()]).all(),
  ]);
  return {
    currency: 'PHP',
    categories: categories.filter((category) => includeInactive || category.active).map((category) => ({
      ...category,
      items: items.filter((item) => item.categoryId === category.id && (includeInactive || item.active)).map((item) => ({
        ...item,
        itemType: item.itemType as ItemType,
        variants: variants.filter((variant) => variant.itemId === item.id && (includeInactive || variant.available !== false)).map((variant): MenuVariant => ({
          id: variant.id, itemId: variant.itemId, name: variant.name,
          temperature: variant.temperature as Temperature,
          sizeOz: variant.sizeOz, priceCentavos: variant.priceCentavos,
          currency: 'PHP', priceKind: variant.priceKind as PriceKind,
          sortOrder: variant.sortOrder, available: variant.available,
        })),
      })).filter((item) => includeInactive || item.variants.length > 0),
    })).filter((category) => includeInactive || category.items.length > 0),
  };
}

export async function getPublicMenu(): Promise<MenuResponse> {
  return getMenu();
}
