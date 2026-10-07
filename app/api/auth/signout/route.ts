import { NextResponse } from 'next/server';
import { errorResponse, requireSameOrigin } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    requireSameOrigin(request);
    const { error } = await (await createClient()).auth.signOut({ scope: 'local' });
    if (error) throw error;
    return NextResponse.json({ redirectTo: '/login' });
  } catch (error) { return errorResponse(error); }
}
