export type ItemType = 'beverage' | 'food' | 'addon';
export type Temperature = 'iced' | 'hot' | null;
export type PriceKind = 'base' | 'surcharge';

export interface MenuVariant {
  id: string;
  itemId: string;
  name: string;
  temperature: Temperature;
  sizeOz: number | null;
  priceCentavos: number;
  currency: 'PHP';
  priceKind: PriceKind;
  sortOrder: number;
  available: boolean | null;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  itemType: ItemType;
  name: string;
  description: string | null;
  process: string | null;
  roaster: string | null;
  pictureUrl: string | null;
  sortOrder: number;
  active: boolean;
  variants: MenuVariant[];
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
  items: MenuItem[];
}

export interface MenuResponse {
  currency: 'PHP';
  categories: MenuCategory[];
}
