# Backend verification record

Verified October 8, 2026 against the configured existing Supabase project and local Next.js app at `http://localhost:3000`. No credentials are recorded here.

- Read-only preflight: PostgreSQL 17.11, server role `postgres` with RLS bypass, empty public schema. Session pool port 5432 connected; only that port was changed in local untracked `.env` after the transaction pool timed out.
- Initial migration: 10 additive operations, no reset/deletion; 1 migration applied.
- `npm run db:secure`: RLS on all application tables, no anon/authenticated grants. Actual SET LOCAL ROLE checks reject User reads and promotion writes with SQL42501 for both roles; privileged server queries still succeed.
- `npm run db:seed`: 8 categories, 33 items, 40 variants, stable CSV identities, transactional default preserve-existing mode.
- `npm test`: 3 tests pass for complete CSV identities/counts, exact hot/iced prices, specialty details, add-on size, quoting, duplicates, invalid prices, and privilege/enum/price validation.
- `npm run test:api`: real public HTTP DTO exactly matches all 40 CSV variants/prices, anonymous/forged admin denial, dashboard redirect, rejected cross-origin auth requests emit no cookies.
- `npm run test:auth`: explicitly authorized temporary accounts pass signup/session discard and profile identity checks, pending login/bearer denial, missing-profile repair, temporary-account manual approval, cookie/bearer login/dashboard, no invalid-bearer cookie fallback, CSRF cannot log out existing staff, real CRUD response shapes, duplicate/nonempty-category409, zero-variant/all-unavailable item hiding, null availability publishing, correct price PATCH response and public item visibility, deletion cascade, and immediate cookie/bearer role revocation. Finally removed both temporary Auth identities/profiles and all temporary menu records. The repeatable script additionally asserts the patched public price; that added assertion has not triggered another live fixture run.
- Supabase's separate Data API returned503 PGRST002 (schema cache database unavailable). Its HTTP authorization denial is not claimed as verified. Actual SQL role/grant checks independently prove browser roles cannot read/promote users; the application works through verified Prisma/Auth services.
- Full ESLint/TypeScript checks pass. Generated contract declarations are excluded from lint and checked in unchanged.
- Production Next16.3.6 build passes with all public/Auth/admin routes. Compatible sharp0.35.5 is locked after the final security patch. `npm audit --omit=dev` reports zero vulnerabilities. Full audit retains 19 development-tool findings (5 moderate, 14 high) in Prisma CLI's Composer/Hono/glob dependencies and ESLint's dependency chain; no broad forced major-version downgrade was applied.
- Final cleanup read-only proof: application User profiles0; menu categories8/items33/variants40; all four tables have RLS enabled; zero remaining `nuwave-test-` Auth accounts.

Repeatable scripts: `scripts/menu.test.ts`, `scripts/verify-api.mts`, `scripts/verify-auth.mts`, `scripts/secure-db.mts`. Live Auth tests require explicit human authorization and the `--allow-temporary-accounts` flag; they are excluded from default tests. No QA accounts or menu records remain. Chrome UI results are reported by the coordinating task.
