import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, readBody } from '@/lib/api';
import { deleteRecord, resourceName, updateRecord } from '@/lib/menu/mutations';
type Context = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(request: Request, context: Context): Promise<NextResponse> {
  try {
    await requireAdmin(request);
    const { resource, id } = await context.params;
    return NextResponse.json({ data: await updateRecord(resourceName(resource), id, await readBody(request)) });
  } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request, context: Context): Promise<NextResponse> {
  try {
    await requireAdmin(request);
    const { resource, id } = await context.params;
    await deleteRecord(resourceName(resource), id);
    return new NextResponse(null, { status: 204 });
  } catch (error) { return errorResponse(error); }
}
