import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import { requireAdmin } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { SignOutButton } from '@/lib/auth-form';
import styles from '@/lib/auth.module.css';

export default async function DashboardPage(): Promise<ReactElement> {
  let profile: { id: string; fullName: string };
  try { profile = await requireAdmin(); }
  catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) redirect('/login');
    throw error;
  }
  return <main className={styles.shell}><section className={styles.card}>
    <p className={styles.eyebrow}>Nuwave administration</p><h1>Menu workspace</h1>
    <p>Welcome{profile.fullName ? `, ${profile.fullName}` : ''}. Your staff access is approved.</p>
    <p>This protected workspace is ready for the menu management interface. The teammate handoff is documented in <code>docs/specs/admin-side.md</code>.</p>
    <p>Menu categories, items, variants, ordering, and availability are available through the authenticated <code>/api/admin</code> routes.</p>
    <SignOutButton />
  </section></main>;
}
