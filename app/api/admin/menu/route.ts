import { NextResponse } from 'next/server';
import { getMenu } from '@/lib/menu/repository';
import { requireAdmin } from '@/lib/auth';
import { errorResponse } from '@/lib/api';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin(request);
    return NextResponse.json(await getMenu(true), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
