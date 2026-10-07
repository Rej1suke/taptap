import { NextResponse } from 'next/server';
import { allowedKeys, ApiError, errorResponse, passwordField, readBody, requireSameOrigin, stringField } from '@/lib/api';
import { assertAdminIdentity, synchronizeProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  let acceptedOrigin = false;
  try {
    requireSameOrigin(request);
    acceptedOrigin = true;
    const body = await readBody(request);
    allowedKeys(body, ['email', 'password']);
    const email = stringField(body.email, 'email', 254);
    const password = passwordField(body.password);
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    const verified = await supabase.auth.getUser();
    if (verified.error || !verified.data.user) throw new ApiError(401, 'UNAUTHENTICATED', 'Identity verification failed.');
    await synchronizeProfile(verified.data.user);
    const profile = await assertAdminIdentity(verified.data.user);
    return NextResponse.json({ user: profile, redirectTo: '/dashboard' });
  } catch (error) {
    if (acceptedOrigin) await supabase.auth.signOut({ scope: 'local' });
    return errorResponse(error);
  }
}
