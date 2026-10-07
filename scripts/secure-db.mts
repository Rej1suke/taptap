import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query('BEGIN');
  await client.query(await readFile(new URL('../prisma/security.sql', import.meta.url), 'utf8'));
  const role = await client.query<{ rolbypassrls: boolean }>('SELECT rolbypassrls FROM pg_roles WHERE rolname=current_user');
  if (!role.rows[0]?.rolbypassrls) throw new Error('The server database role must bypass RLS; use the dedicated privileged server connection.');
  const unsafe = await client.query("SELECT table_name FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name IN ('User','MenuCategory','MenuItem','MenuVariant') AND grantee IN ('anon','authenticated')");
  if (unsafe.rows.length) throw new Error('Browser-facing grants still exist.');
  const inherited = await client.query(`SELECT role_name, table_name FROM
    unnest(ARRAY['anon','authenticated']) AS role_name CROSS JOIN
    unnest(ARRAY['User','MenuCategory','MenuItem','MenuVariant']) AS table_name
    WHERE has_table_privilege(role_name, format('public.%I', table_name), 'SELECT,INSERT,UPDATE,DELETE')`);
  if (inherited.rows.length) throw new Error('Browser-facing effective table privileges still exist.');
  for (const browserRole of ['anon', 'authenticated']) {
    for (const query of ['SELECT id FROM public."User" LIMIT 1', 'UPDATE public."User" SET "isAdmin"=true WHERE false']) {
      await client.query('SAVEPOINT permission_test');
      await client.query(`SET LOCAL ROLE ${browserRole}`);
      let denied = false;
      try { await client.query(query); }
      catch (error) { denied = typeof error === 'object' && error !== null && 'code' in error && error.code === '42501'; }
      await client.query('ROLLBACK TO SAVEPOINT permission_test');
      if (!denied) throw new Error(`${browserRole} can read or promote application User records.`);
    }
  }
  await client.query('COMMIT');
  console.log('RLS enabled; browser-facing grants removed; actual anon/authenticated SQL reads and promotion writes denied (42501); server role verified.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  console.error(error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g, '[redacted]') : 'Database security check failed.');
  process.exitCode = 1;
} finally { await client.end(); }
