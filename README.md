# Nuwave Specialty Coffee

Responsive cafe welcome page and table-ordering menu with pay-at-counter checkout and a live order status page, plus a protected administrative API. Online payments, the cashier dashboard, and Loyverse sync are agreed scope but not built yet.

Use Node >=22.18 and npm. package-lock.json is the authoritative lockfile. Prisma preview runtime and CLI are pinned: CLI 8.0.0-rc.21 ships ORM toolchain 8.0.0-rc.16.

```bash
npm ci
npm run dev
```

The cafe landing page at `/` runs without Supabase credentials. To use `/menu`, staff sign-in, or the database-backed features, copy `.env.example` to `.env`, add your real Supabase project URL and publishable key plus PostgreSQL `DATABASE_URL`, then run `npm run contract:emit`, `npm run db:migrate`, and `npm run db:seed`. Database migration creates the private kiosk order tables; checkout validates current menu availability and prices on the server.

Read [the admin/API specification](docs/specs/admin-side.md) before migrating an existing database. The initial migration was verified against this project's empty public schema. db:migrate also enables RLS and removes browser-facing table privileges. Normal seed inserts missing CSV IDs and preserves edits, and never runs on startup.

Open `/` for the cafe welcome page and `/menu` for the menu and checkout. NFC table tags should point at `/menu?table=N` (or `/?table=N` to show the house rules first). Orders are submitted for payment at the counter; after placing one, the customer lands on `/order/<token>`, which polls `GET /api/orders/<token>` for status. Online payment is not enabled. Staff register at `/signup` and sign in at `/login`. Disable Supabase email confirmation for the agreed signup flow. Approval is a manual edit of public.User.isAdmin in the Supabase database dashboard. `/dashboard` is a protected teammate placeholder; every administrative API verifies the current role independently.

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
# With the app running:
npm run test:api
```

npm run test:auth creates and removes two isolated real Auth accounts and temporary menu records. Run it only with explicit authorization and a server-only SUPABASE_SECRET_KEY. [Verification evidence](docs/specs/backend-verification.md) includes the external Data API limitation.
