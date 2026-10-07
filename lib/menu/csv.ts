import { parseCategory, parseItem, parseVariant, type CategoryInput, type ItemInput, type VariantInput } from './validation';

export interface SeedMenu {
  categories: CategoryInput[];
  items: ItemInput[];
  variants: (VariantInput & { sourceImage: string | null; sourcePriceText: string | null })[];
}

export function csvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index++; }
      else quoted = !quoted;
    } else if (!quoted && (char === ',' || char === '\n')) {
      row.push(field.replace(/\r$/, '')); field = '';
      if (char === '\n') { if (row.some(Boolean)) rows.push(row); row = []; }
    } else field += char;
  }
  if (quoted) throw new Error('Unclosed CSV quote.');
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows;
}

export function parseSeedMenu(text: string): SeedMenu {
  const [headers, ...rows] = csvRows(text.replace(/^\uFEFF/, ''));
  if (!headers?.includes('variant_id')) throw new Error('CSV headers are missing.');
  const categories = new Map<string, CategoryInput>();
  const items = new Map<string, ItemInput>();
  const variants: SeedMenu['variants'] = [];
  const variantIds = new Set<string>();
  const nullable = (value: string): string | null => value === 'null' || value === '' ? null : value;
  const bool = (value: string): boolean => {
    if (value !== 'true' && value !== 'false') throw new Error('Invalid CSV boolean.');
    return value === 'true';
  };
  for (const row of rows) {
    if (row.length !== headers.length) throw new Error('CSV column count mismatch.');
    const source = Object.fromEntries(headers.map((header, index) => [header, row[index]]));
    const category = {
      id: source.category_id, name: source.category_name, sortOrder: Number(source.category_sort_order), active: true,
    } satisfies CategoryInput;
    parseCategory(category);
    const item = {
      id: source.item_id, categoryId: source.category_id, itemType: source.item_type as ItemInput['itemType'],
      name: source.item_name, description: nullable(source.description), process: nullable(source.coffee_details),
      roaster: nullable(source.roaster), pictureUrl: nullable(source.picture_url), sortOrder: Number(source.item_sort_order), active: bool(source.item_is_active),
    } satisfies ItemInput;
    parseItem(item);
    const priorCategory = categories.get(category.id), priorItem = items.get(item.id);
    if (priorCategory && JSON.stringify(priorCategory) !== JSON.stringify(category)) throw new Error(`Inconsistent category ${category.id}.`);
    if (priorItem && JSON.stringify(priorItem) !== JSON.stringify(item)) throw new Error(`Inconsistent item ${item.id}.`);
    if (variantIds.has(source.variant_id)) throw new Error(`Duplicate variant ${source.variant_id}.`);
    if (!/^\d+\.\d{2}$/.test(source.price_amount)) throw new Error('Prices must use exactly two decimal places.');
    const [pesos, cents] = source.price_amount.split('.');
    const variant = {
      id: source.variant_id, itemId: source.item_id, name: source.variant_name,
      temperature: nullable(source.temperature) as VariantInput['temperature'],
      sizeOz: nullable(source.size_oz) === null ? null : Number(source.size_oz),
      priceCentavos: Number(pesos) * 100 + Number(cents), currency: source.currency as 'PHP',
      priceKind: source.price_kind as VariantInput['priceKind'], sortOrder: Number(source.variant_sort_order),
      available: nullable(source.variant_is_available) === null ? null : bool(source.variant_is_available),
    } satisfies VariantInput;
    parseVariant(variant);
    categories.set(category.id, category); items.set(item.id, item); variantIds.add(variant.id);
    variants.push({ ...variant, sourceImage: nullable(source.source_image), sourcePriceText: nullable(source.source_price_text) });
  }
  return { categories: [...categories.values()], items: [...items.values()], variants };
}
