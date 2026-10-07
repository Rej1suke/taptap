import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { db } from '../prisma/db';
import { parseSeedMenu } from '../lib/menu/csv';

try {
  const menu = parseSeedMenu(await readFile(new URL('../data/menu.csv', import.meta.url), 'utf8'));
  const replace = process.argv.includes('--replace');
  await db.transaction(async (tx) => {
    for (const category of menu.categories) {
      const exists = await tx.orm.public.MenuCategory.where({ id: category.id }).first();
      if (!exists) await tx.orm.public.MenuCategory.create(category);
      else if (replace) await tx.orm.public.MenuCategory.where({ id: category.id }).update(category);
    }
    for (const item of menu.items) {
      const exists = await tx.orm.public.MenuItem.where({ id: item.id }).first();
      if (!exists) await tx.orm.public.MenuItem.create(item);
      else if (replace) await tx.orm.public.MenuItem.where({ id: item.id }).update(item);
    }
    for (const variant of menu.variants) {
      const exists = await tx.orm.public.MenuVariant.where({ id: variant.id }).first();
      if (!exists) await tx.orm.public.MenuVariant.create(variant);
      else if (replace) await tx.orm.public.MenuVariant.where({ id: variant.id }).update(variant);
    }
  });
  console.log(`Seeded ${menu.categories.length} categories, ${menu.items.length} items, ${menu.variants.length} variants (${replace ? 'replace matching IDs' : 'preserve existing records'}).`);
} catch (error) {
  console.error(error instanceof Error ? error.name : 'SeedFailed'); process.exitCode = 1;
} finally { await db.close(); }
