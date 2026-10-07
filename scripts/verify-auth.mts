import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { db } from '../prisma/db';
import type { MenuResponse } from '../lib/menu/types';

// Run only after explicit authorization to create/remove isolated temporary accounts.
if (!process.argv.includes('--allow-temporary-accounts')) throw new Error('Explicit authorization required: rerun with --allow-temporary-accounts only after permission to create/remove test accounts.');
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const admin = createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
const isolated = createClient(supabaseUrl, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
const fixture = randomUUID();
const emails = [`nuwave-test-pending-${fixture}@example.com`, `nuwave-test-admin-${fixture}@example.com`];
const password = `Nuwave-${randomUUID()}!`;
const createdUsers: string[] = [];
const categoryId = `test-category-${fixture}`, itemId = `test-item-${fixture}`, variantId = `test-variant-${fixture}`;
let cookies = '';
async function discoverFixtureUsers(): Promise<void> {
  for (let page = 1; ; page++) {
    const result = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (result.error) throw new Error('Unable to verify temporary Auth identity cleanup.');
    for (const user of result.data.users) if (user.email && emails.includes(user.email) && !createdUsers.includes(user.id)) createdUsers.push(user.id);
    if (result.data.users.length < 1000) return;
  }
}
async function authPost(endpoint: string, body: Record<string, unknown>, cookie = ''): Promise<Response> {
  return fetch(`${base}/api/auth/${endpoint}`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
}
async function bearerRequest(path: string, token: string, method = 'GET', body?: Record<string, unknown>): Promise<Response> {
  return fetch(`${base}${path}`, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
async function publicContainsItem(): Promise<boolean> {
  const menu = await (await fetch(`${base}/api/menu`)).json() as MenuResponse;
  return menu.categories.some((category) => category.items.some((item) => item.id === itemId));
}
try {
  const settings = await (await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: publicKey } })).json() as { mailer_autoconfirm?: boolean };
  assert.equal(settings.mailer_autoconfirm, true, 'Email confirmation must be disabled before creating signup fixtures.');
  for (const email of emails) {
    const signup = await authPost('signup', { email, password, fullName: 'Temporary Nuwave QA' });
    const body = await signup.json() as { message?: string; error?: { code: string } };
    await discoverFixtureUsers();
    const profileByEmail = await db.orm.public.User.where({ email }).first();
    const user = profileByEmail ? (await admin.auth.admin.getUserById(profileByEmail.id)).data.user : null;
    assert.equal(signup.status, 201, `signup failed: ${body.error?.code ?? 'unknown'}`);
    assert.equal(body.message, 'Log in again once the admin verifies you');
    assert.deepEqual(Object.keys(body), ['message']);
    assert.ok(user);
    const profile = await db.orm.public.User.where({ id: user.id }).first();
    assert.equal(profile?.isAdmin, false); assert.equal(profile?.fullName, 'Temporary Nuwave QA');
  }
  const pendingLogin = await authPost('signin', { email: emails[0], password });
  assert.equal(pendingLogin.status, 403);
  assert.ok(pendingLogin.headers.getSetCookie().every((cookie) => /Max-Age=0|expires=/i.test(cookie)));
  const pending = await isolated.auth.signInWithPassword({ email: emails[0], password });
  assert.ok(pending.data.session);
  assert.equal((await bearerRequest('/api/admin/menu', pending.data.session.access_token)).status, 403);
  // Sign-in repairs a profile that failed to synchronize, with no privilege escalation.
  await db.orm.public.User.where({ id: createdUsers[0] }).delete();
  assert.equal((await authPost('signin', { email: emails[0], password })).status, 403);
  assert.equal((await db.orm.public.User.where({ id: createdUsers[0] }).first())?.isAdmin, false);
  await db.orm.public.User.where({ id: createdUsers[1] }).update({ isAdmin: true });
  const login = await authPost('signin', { email: emails[1], password });
  assert.equal(login.status, 200);
  cookies = login.headers.getSetCookie().map((cookie) => cookie.split(';')[0]).join('; ');
  assert.ok(cookies);
  assert.equal((await fetch(`${base}/dashboard`, { headers: { Cookie: cookies }, redirect: 'manual' })).status, 200);
  assert.equal((await fetch(`${base}/api/admin/menu`, { headers: { Cookie: cookies } })).status, 200);
  assert.equal((await fetch(`${base}/api/admin/menu`, { headers: { Cookie: cookies, Authorization: 'Bearer forged' } })).status, 401);
  assert.equal((await fetch(`${base}/api/admin/items`, { method: 'POST', headers: { Cookie: cookies, Origin: 'https://other.invalid', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
  // Rejected auth requests with a valid admin cookie never log the admin out.
  for (const endpoint of ['signup', 'signin', 'signout']) {
    const rejected = await fetch(`${base}/api/auth/${endpoint}`, { method: 'POST', headers: { Cookie: cookies, Origin: 'https://other.invalid', 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(rejected.status, 403); assert.equal(rejected.headers.get('set-cookie'), null);
  }
  assert.equal((await fetch(`${base}/api/admin/menu`, { headers: { Cookie: cookies } })).status, 200);
  const approved = await isolated.auth.signInWithPassword({ email: emails[1], password });
  assert.ok(approved.data.session);
  const token = approved.data.session.access_token;
  const category = await bearerRequest('/api/admin/categories', token, 'POST', { id: categoryId, name: 'Temporary test category', sortOrder: 99 });
  assert.equal(category.status, 201); assert.equal((await category.json() as { data: { id: string } }).data.id, categoryId);
  assert.equal((await bearerRequest('/api/admin/categories', token, 'POST', { id: categoryId, name: 'Duplicate' })).status, 409);
  assert.equal((await bearerRequest('/api/admin/items', token, 'POST', { id: itemId, categoryId, itemType: 'beverage', name: 'Temporary test item' })).status, 201);
  assert.equal(await publicContainsItem(), false, 'zero-variant drafts must be hidden');
  assert.equal((await bearerRequest('/api/admin/variants', token, 'POST', { id: variantId, itemId, name: 'Iced', temperature: 'iced', priceCentavos: 12345, priceKind: 'base', available: false })).status, 201);
  assert.equal(await publicContainsItem(), false, 'all-unavailable item must be hidden');
  const patch = await bearerRequest(`/api/admin/variants/${variantId}`, token, 'PATCH', { available: null, priceCentavos: 12500 });
  assert.equal(patch.status, 200); assert.equal((await patch.json() as { data: { priceCentavos: number } }).data.priceCentavos, 12500);
  assert.equal(await publicContainsItem(), true, 'unspecified availability is available');
  const editedMenu = await (await fetch(`${base}/api/menu`)).json() as MenuResponse;
  assert.equal(editedMenu.categories.flatMap((category) => category.items).flatMap((item) => item.variants).find((variant) => variant.id === variantId)?.priceCentavos, 12500);
  assert.equal((await bearerRequest(`/api/admin/items/${itemId}`, token, 'PATCH', { isAdmin: true })).status, 400);
  assert.equal((await bearerRequest(`/api/admin/categories/${categoryId}`, token, 'DELETE')).status, 409);
  assert.equal((await bearerRequest(`/api/admin/items/${itemId}`, token, 'DELETE')).status, 204);
  assert.equal(await db.orm.public.MenuVariant.where({ id: variantId }).first(), null);
  assert.equal((await bearerRequest(`/api/admin/categories/${categoryId}`, token, 'DELETE')).status, 204);
  await db.orm.public.User.where({ id: createdUsers[1] }).update({ isAdmin: false });
  assert.equal((await bearerRequest('/api/admin/menu', token)).status, 403);
  assert.equal((await fetch(`${base}/api/admin/menu`, { headers: { Cookie: cookies } })).status, 403);
  assert.equal((await fetch(`${base}/dashboard`, { headers: { Cookie: cookies }, redirect: 'manual' })).status, 307);
  assert.equal((await authPost('signout', {}, cookies)).status, 200);
  // Browser-facing Data API cannot read/promote profiles or mutate menu tables.
  const tableResponse = await fetch(`${supabaseUrl}/rest/v1/User?select=id`, { headers: { apikey: publicKey, Authorization: `Bearer ${token}` } });
  assert.ok([401, 403, 503].includes(tableResponse.status));
  if (tableResponse.status === 503) console.log('Supabase Data API is unavailable (503); SQL role denial is independently verified by db:secure.');
  console.log('Real signup/profile repair, pending/approved login, cookie/bearer guards, CRUD, draft filtering, CSRF, and revocation passed.');
} finally {
  const cleanupErrors: string[] = [];
  try { await discoverFixtureUsers(); } catch { cleanupErrors.push('Auth fixture discovery failed'); }
  try {
    await db.transaction(async (tx) => {
      await tx.orm.public.MenuVariant.where({ itemId }).delete();
      await tx.orm.public.MenuItem.where({ id: itemId }).delete();
      await tx.orm.public.MenuCategory.where({ id: categoryId }).delete();
      for (const id of createdUsers) await tx.orm.public.User.where({ id }).delete();
    });
  } catch { cleanupErrors.push('Database fixture cleanup failed'); }
  for (const id of createdUsers) {
    try {
      const result = await admin.auth.admin.deleteUser(id);
      if (result.error) cleanupErrors.push(`Auth fixture cleanup failed for ${id}`);
    } catch { cleanupErrors.push(`Auth fixture cleanup failed for ${id}`); }
  }
  try { await db.close(); } catch { cleanupErrors.push('Database client close failed'); }
  if (cleanupErrors.length) throw new Error(cleanupErrors.join('; '));
  console.log(`Removed ${createdUsers.length} temporary profiles/Auth identities and all temporary menu records.`);
}
