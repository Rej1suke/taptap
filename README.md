# Nuwave Specialty Coffee

Responsive public digital menu with a separate protected administrative API. No cart, ordering, or payments.

Use Node >=22.18 and npm. package-lock.json is the authoritative lockfile. Prisma preview runtime and CLI are pinned: CLI 8.0.0-rc.21 ships ORM toolchain 8.0.0-rc.16.

```bash
npm ci
# Configure .env from .env.example with the real database and Supabase project.
npm run contract:emit
npm run db:migrate
npm run db:seed
npm run dev
```

Read [the admin/API specification](docs/specs/admin-side.md) before migrating an existing database. The initial migration was verified against this project's empty public schema. db:migrate also enables RLS and removes browser-facing table privileges. Normal seed inserts missing CSV IDs and preserves edits, and never runs on startup.

Open / for the menu. Staff register at /signup and sign in at /login. Disable Supabase email confirmation for the agreed signup flow. Approval is a manual edit of public.User.isAdmin in the Supabase database dashboard. /dashboard is a protected teammate placeholder; every administrative API verifies the current role independently.

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
# With the app running:
npm run test:api
```

npm run test:auth creates and removes two isolated real Auth accounts and temporary menu records. Run it only with explicit authorization and a server-only SUPABASE_SECRET_KEY. [Verification evidence](docs/specs/backend-verification.md) includes the external Data API limitation.
