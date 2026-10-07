import { NextResponse } from 'next/server';
import { getPublicMenu } from '@/lib/menu/repository';
import { errorResponse } from '@/lib/api';

export async function GET(): Promise<NextResponse> {
  try { return NextResponse.json(await getPublicMenu(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return errorResponse(error); }
}
