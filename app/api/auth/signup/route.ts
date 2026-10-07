import { NextResponse } from 'next/server';
import { allowedKeys, ApiError, errorResponse, passwordField, readBody, requireSameOrigin, stringField } from '@/lib/api';
import { PENDING_MESSAGE, statelessAuth, synchronizeProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request): Promise<NextResponse> {
  const auth = statelessAuth();
  let acceptedOrigin = false;
  try {
    requireSameOrigin(request);
    acceptedOrigin = true;
    const body = await readBody(request);
    allowedKeys(body, ['email', 'password', 'fullName']);
    const fullName = stringField(body.fullName, 'fullName');
    const email = stringField(body.email, 'email', 254).toLowerCase();
    const password = passwordField(body.password);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) throw new ApiError(400, 'VALIDATION_ERROR', 'Use a valid email and a password of at least 8 characters.');
    const { data, error } = await auth.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) throw new ApiError(400, 'SIGNUP_FAILED', error.message);
    if (!data.session) throw new ApiError(503, 'CONFIRMATION_SETTING_REQUIRED', 'Email confirmation must be disabled for this registration workflow. If an account was created, confirm its email and sign in to synchronize your profile.');
    const verified = await auth.auth.getUser(data.session.access_token);
    if (verified.error || !verified.data.user) throw new ApiError(401, 'INVALID_IDENTITY', 'Identity verification failed.');
    await synchronizeProfile(verified.data.user, fullName);
    return NextResponse.json({ message: PENDING_MESSAGE }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  } finally {
    if (acceptedOrigin) {
      await auth.auth.signOut({ scope: 'local' });
      const existing = await createClient();
      await existing.auth.signOut({ scope: 'local' });
    }
  }
}
