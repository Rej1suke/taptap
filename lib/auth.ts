import 'server-only';
import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/prisma/db';
import { ApiError, requireSameOrigin } from './api';

export const PENDING_MESSAGE = 'Log in again once the admin verifies you';

export function statelessAuth(): ReturnType<typeof createSupabaseClient> {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function synchronizeProfile(user: User, fullName?: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id) || !user.email) throw new ApiError(401, 'INVALID_IDENTITY', 'A verified email identity is required.');
  const existing = await db.orm.public.User.where({ id: user.id }).first();
  if (existing) return; // Never overwrite manual approval or a previously synchronized profile.
  const collision = await db.orm.public.User.where({ email: user.email }).first();
  if (collision) throw new ApiError(409, 'PROFILE_CONFLICT', 'This identity needs operator reconciliation before signing in.');
  const metadata: unknown = user.user_metadata.full_name;
  const name = fullName ?? (typeof metadata === 'string' ? metadata.trim().slice(0, 200) : '');
  await db.orm.public.User.upsert({ create: { id: user.id, email: user.email, fullName: name, isAdmin: false }, update: {} });
}

export async function assertAdminIdentity(user: Pick<User, 'id'>): Promise<{ id: string; fullName: string }> {
  const profile = await db.orm.public.User.where({ id: user.id }).first();
  if (!profile?.isAdmin) throw new ApiError(403, 'PENDING_APPROVAL', PENDING_MESSAGE);
  return { id: profile.id, fullName: profile.fullName };
}

export async function requireAdmin(request?: Request): Promise<{ id: string; fullName: string }> {
  const authorization = request?.headers.get('authorization');
  if (authorization !== null && authorization !== undefined) {
    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match) throw new ApiError(401, 'UNAUTHENTICATED', 'A valid Bearer token is required.');
    const { data, error } = await statelessAuth().auth.getUser(match[1]);
    if (error || !data.user) throw new ApiError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
    return assertAdminIdentity(data.user);
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new ApiError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
  if (request && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) requireSameOrigin(request);
  return assertAdminIdentity(data.user);
}
