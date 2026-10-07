import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, readBody } from '@/lib/api';
import { createRecord, resourceName } from '@/lib/menu/mutations';
import { getMenu } from '@/lib/menu/repository';
type Context = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: Context): Promise<NextResponse> {
  try {
    await requireAdmin(request);
    const resource = resourceName((await context.params).resource);
    const menu = await getMenu(true);
    const data = resource === 'categories' ? menu.categories.map((category) => ({ id: category.id, name: category.name, active: category.active, sortOrder: category.sortOrder }))
      : resource === 'items' ? menu.categories.flatMap((category) => category.items)
      : menu.categories.flatMap((category) => category.items.flatMap((item) => item.variants));
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request, context: Context): Promise<NextResponse> {
  try {
    await requireAdmin(request);
    const resource = resourceName((await context.params).resource);
    return NextResponse.json({ data: await createRecord(resource, await readBody(request)) }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
