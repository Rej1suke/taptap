# Nuwave Specialty Coffee

## Product scope and ownership

- Build a distinctive, responsive, one-page public digital menu for Nuwave Specialty Coffee. Keep warm paper/cream backgrounds with the user's approved varied plum palette centered on `#2f042f`, matching the real logo and their recolored transparent mascot. The user replaced the initial brown/burgundy direction; do not revert it.
- The public site is a menu only. Do not add carts, ordering, checkout, payments, or customer account flows.
- Keep the administrative backend separate from the public menu and out of public navigation. Hidden URLs are not an authorization mechanism.
- A teammate owns the full administrative UI. The implemented handoff is a protected `/dashboard` placeholder plus documented menu APIs in `docs/specs/admin-side.md`. Do not expand into an admin-user management UI or API.
- `docs/plans/nuwave-menu.md` records the approved staged plan and verification evidence. `PRODUCT.md` records durable product scope; `DESIGN.md` and `.impeccable/design.json` describe the implemented visual system.

## Current repository state

- Next.js 16.3.6 App Router with TypeScript, React 19, Tailwind CSS 4, Supabase SSR, and Prisma 8. Use npm with the authoritative `package-lock.json`; runtime/setup requirements and exact API examples are in `docs/specs/admin-side.md`.
- `app/page.tsx` reads the live database through `lib/menu/repository.ts`, renders the vintage café menu, and mounts sticky category anchors. `components/MenuItem.tsx` displays single prices, explicit iced/hot labels, specialty process/roaster information, and surcharge prices. Public reads omit inactive content and items without public variants; a database failure produces a visible error rather than stale static data.
- `data/menu.csv` is the checked-in authoritative copy of confirmed `E:/Downloads/menu.csv`: 8 categories, 33 items, and 40 variants. Paired prices are iced first, hot second. Preserve source identifiers, ordering, specialty details, and add-on surcharges. Source-image filenames are internal provenance, not product URLs. Do not guess prices from reference images.
- `public/nuwave.png` supplies the real masthead logo. Other public SVGs are starter assets. Do not represent the logo as a drink photograph.
- Root `proxy.ts` refreshes Supabase sessions through `lib/supabase/proxy.ts` without blocking anonymous menu access. `/signup` and `/login` provide staff forms; `/dashboard` is a server-guarded teammate placeholder. `app/api/auth` owns signup/signin/signout; `GET /api/menu` is public; `app/api/admin` owns guarded menu reads and category/item/variant CRUD.
- `prisma/contract.prisma` defines `User`, `MenuCategory`, `MenuItem`, and `MenuVariant`. User IDs come from verified Supabase UUIDs; `fullName` is the active profile field and nullable `name` is retained only for legacy compatibility. Menu prices are PHP integer centavos and availability may be null. Generated `prisma/contract.json` and `prisma/contract.d.ts` are contract companions kept with source.
- The actual connected PostgreSQL 17 public schema was empty before the initial migration and seed. Do not reuse the initial migration as a reset for another database: inspect/baseline an existing schema and plan additive changes preserving rows and admin flags. Legacy user identity conflicts need operator reconciliation.
- `prisma/security.sql` enables RLS and removes application-table grants from Supabase `anon`/`authenticated`. The server's privileged database connection remains server-only; `scripts/secure-db.mts` verifies its RLS bypass and browser-facing grants. Public menu data is served through this application's API. Auth configuration requirements, environment-variable names, and connection guidance are documented without real secrets.
- Read `prisma-8.md` before changing Prisma code, contracts, or database workflow. Prisma 8 uses the local contract/runtime APIs; do not substitute older Prisma schema/client conventions. Keep this instruction outside the Next-generated block, which development tooling may rewrite.

## Required authentication and authorization

- Use Supabase for sign-up and sign-in. The application-owned `public.User` table is accessed through Prisma. Its `id` must equal the verified Supabase authentication user ID; never generate an unrelated application ID or trust a submitted ID.
- Store the user's `fullName` and retain `isAdmin` with a database default of `false`. New registration must not accept or infer administrative privilege from request fields or Supabase auth/user metadata.
- Approval is manual: the operator edits `isAdmin` in the application's `public.User` table using the Supabase database dashboard. This is not a change to Supabase authentication metadata. Do not implement admin-user management.
- Successful signup returns to the signup screen with: `Log in again once the admin verifies you`. Discard any signup session/token and clear its persisted cookies/storage. Signup must not grant dashboard access, even when Supabase automatically issues a session.
- Successful sign-in for an approved admin redirects to `/dashboard`. Unapproved users receive a clear pending-approval response and cannot access administrative data or actions.
- Every administrative endpoint, Server Action, and dashboard access check must verify the Supabase session on the server, then look up the current application `User` row by that verified ID and require `isAdmin === true`. Fail closed for a missing row or failed verification/query. Use the current database flag on each administrative request so revocation takes effect for existing sessions.
- Client-side checks, hidden links, layouts, and Proxy redirects are insufficient authorization. Centralize a server-only guard and invoke it where protected data is read or changed. Never derive admin access from untrusted metadata or a cached client flag.
- Keep privileged database credentials and server-only queries off the client. Ensure browser-facing Supabase access cannot create/update `isAdmin` or bypass the application guard; configure and verify database permissions/RLS for exposed tables.
- Maintain Supabase SSR cookie propagation when refreshing sessions or redirecting. Restrict redirect targets to intended local paths. Keep the public menu and auth entry routes accessible without an admin session.

## Menu data and teammate handoff

- Keep database-backed menu categories/items/variants with stable identifiers, explicit ordering, descriptions, and precise prices. `npm run db:seed` inserts missing CSV identities transactionally and preserves existing records/administrative edits; it does not run on startup. `--replace` explicitly updates matching CSV identities and never touches users.
- Keep public reads separate from protected menu mutations. Give the teammate documented request/response types, validation rules, errors, authentication requirements, and working usage examples. Verify each added or changed public route end-to-end.
- The dashboard placeholder should prove access control and provide the agreed API handoff without implementing the teammate's full dashboard.

## Repository workflow

- Before planning or editing, identify the repository root and read applicable `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, and `CONTEXT.md`, including scoped copies along the changed path. Surface material conflicts. Root `CLAUDE.md` imports this file; no scoped instruction copies or `CONTEXT.md` were found during the audit.
- If `.codegraph/` exists at the root, use `codegraph_explore` (or `codegraph explore`) before text search or opening source to locate/understand code. It is currently absent; do not index without the user's decision. Otherwise prefer `rg`.
- Preserve existing user edits, staged changes, and local configuration. Do not expose `.env` values in tool output, documentation, or commits.
- In TypeScript, do not use `any`. Prefer precise types, `unknown` plus guards at uncertain boundaries, `const`, explicit return types, no unused declarations, and `satisfies` for typed literals. Use advanced types only when they clarify the model.
- Before conflicting parallel implementation tasks, invoke `using-git-worktrees`, use separate branches/worktrees, and record each parent branch. Avoid nested worktrees when already isolated. Read-only or clearly non-conflicting work does not need isolation.
- After implementation and required checks pass in a worktree, invoke `finishing-a-development-branch` and return its integration choices to the user. Do not choose integration, merge, push, create a PR, or remove the branch/worktree on the user's behalf without their selection. For a GitHub branch based on a nonstandard parent, check the parent's open PR and ask about a stacked target when the user selects PR creation; use standard `gh pr create --base` unless `gh stack --help` verifies stack support.
- Run authorized non-interactive unit, integration, static, and headless checks without extra confirmation: `npm test`, `npm run test:api` against a running app, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. After contract changes, run `npm run contract:emit` and verify generated artifacts. Database setup uses `npm run db:migrate`, `npm run db:secure`, and `npm run db:seed`; inspect target/schema before applying migrations. `npm run test:auth` creates/deletes isolated temporary Supabase accounts and must run only with explicit authorization for those fixtures. Never treat broad test permission as permission to touch existing users or approvals.
- Before interactive QA that controls Chrome, an Android emulator, or a physical device, ask whether the shared resource is available. For web flows use the `computer-use` skill and Chrome; for Android use `android-cli`, with adb for interaction. After confirmation identify the exact session/device, stay within the assigned application, and report exercised flows, evidence, and failures.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
