# Nuwave administrative backend

Implemented with Next.js 16 Route Handlers, Supabase Auth, and Prisma 8/Postgres. The public menu is `/`; staff entry points are `/signup` and `/login`; `/dashboard` is a protected teammate placeholder. No public navigation points to these staff routes. There is no ordering, payment, cart, or admin-user management API.

## Setup and database safety

Use Node >=22.18 and npm (`package-lock.json` is authoritative). Run `npm ci`, copy `.env.example` to `.env`, set the real existing Supabase project's values, then `npm run contract:emit`, `npm run db:migrate`, and `npm run db:seed`. Supabase PostgreSQL session-pool port 5432 is supported; the originally configured transaction-pool connection timed out in this environment. Keep the password and connection URL server-only. The verified server role is `postgres` with RLS bypass. The migration wrapper enables RLS and revokes ALL table privileges from `anon` and `authenticated`; those browser roles cannot read/write application tables through the Supabase Data API. All menu reads go through this application. Run `npm run db:secure` after any manual permission changes.

The checked-in initial migration creates tables on an empty public schema (the actual project's public schema was empty before apply). It must not be used to reset or replace an existing database. For an existing schema, inspect and baseline it before planning an additive migration. Retained nullable `User.name` is an unused compatibility field; `fullName` is the application field. Existing legacy IDs must be reconciled by an operator with verified Supabase identities, never rewritten or matched by a client-supplied ID. Never reset user approval flags in a seed/migration.

The exact authoritative `data/menu.csv` contains 8 categories, 33 items, and 40 variants. Seed uses CSV identities transactionally, inserts missing IDs, and preserves every existing row/administrative edit by default. `npm run db:seed -- --replace` explicitly replaces fields on matching CSV IDs; it never removes unrelated records or touches users. Seeding does not run on startup. Source image filenames and original price text remain internal variant provenance; unavailable photo URLs remain null.

## Authentication and approval

Disable email confirmation in Supabase Auth for the agreed signup flow. Registration accepts only `{ "fullName": "Staff Name", "email": "staff@example.com", "password": "your password" }`. `POST /api/auth/signup` returns 201 `{ "message": "Log in again once the admin verifies you" }`; the page stays on signup. Its temporary session is server-only, verified with Supabase `getUser`, discarded/revoked, and never returned. Existing SSR cookies are cleared. Auth metadata can hold a display name but cannot set privileges. `User.id` comes exclusively from the verified Supabase UUID; `fullName` is stored, and new `isAdmin` is false.

If email confirmation is enabled, signup returns 503 `CONFIRMATION_SETTING_REQUIRED`, synchronizes no unverified identity, and grants no access. An Auth account may already have been created; the operator must resolve the project setting/account before retrying. A database outage after Auth creation returns 503 and signs out; identity creation is not destructively rolled back. The next successful sign-in reconciles a missing application profile with `isAdmin:false`. An email collision with a different application ID returns 409 `PROFILE_CONFLICT` and needs manual operator reconciliation. Existing profiles/approval are never overwritten by reconciliation.

Approval: in Supabase's database Table Editor open `public.User`, identify the staff member by verified UUID/email, and change `isAdmin` to true. Do not edit Auth metadata. No UI or HTTP route can promote users. Set false to revoke; every protected request reads the current flag.

`POST /api/auth/signin` accepts `{ "email": "staff@example.com", "password": "your password" }`. Approved staff receive 200 `{ "user": { "id": "uuid", "fullName": "Staff Name" }, "redirectTo": "/dashboard" }` plus Supabase SSR cookies. Nonadmins receive 403 `PENDING_APPROVAL` with the exact pending message, and are signed out. Invalid credentials receive 401 `INVALID_CREDENTIALS`. `POST /api/auth/signout` returns 200 `{ "redirectTo": "/login" }` and clears the session. Auth routes require a same-origin `Origin` header; rejected origins do not modify cookies.

All admin routes independently verify Supabase `getUser` then look up current `User.isAdmin`; dashboard performs the same check and redirects denied visitors to `/login`. Missing profiles fail closed. Explicit `Authorization: Bearer <Supabase access token>` is supported; an invalid explicit bearer never falls back to cookies. Tokens acquired directly through Supabase signup still cannot bypass the database role check. Cookie-auth mutations additionally require `Origin` exactly matching the request's origin. Bearer mutations don't require that header. Cross-origin browser requests are not enabled.

## Menu DTO and validation

The exported contracts are in `lib/menu/types.ts`. `MenuResponse` is `{ currency: "PHP", categories: MenuCategory[] }`.

| Entity | Fields |
| --- | --- |
| Category | `id`, `name`, `sortOrder`, `active`, nested `items` |
| Item | `id`, `categoryId`, `itemType` (`beverage`, `food`, `addon`), `name`, nullable `description`, `process`, `roaster`, `pictureUrl`, `sortOrder`, `active`, nested `variants` |
| Variant | `id`, `itemId`, `name`, nullable `temperature` (`iced`, `hot`), nullable `sizeOz`, `priceCentavos`, `currency` (`PHP`), `priceKind` (`base`, `surcharge`), `sortOrder`, nullable `available` |

All amounts are nonnegative integer centavos: 17500 means ₱175.00. A null temperature is an unqualified Standard variant; it must not be shown as hot/iced. Missing variants must not be invented. Explicit iced/hot CSV prices are used directly (iced precedes hot in the source). Null availability means unspecified, not unavailable. Add-ons are ordinary items in the Add On category, using `itemType:addon` and surcharge variants; Upsize preserves `sizeOz:16`.

`GET /api/menu` needs no authentication and returns available public data: active categories/items, and variants whose availability is not false. Items without any public variant (including zero-variant drafts) and categories without public items are omitted. `GET /api/admin/menu` returns all categories/items/variants including inactive records and drafts. Both return `Cache-Control:no-store`; public reads never silently fall back to stale static data if the DB fails.

IDs are stable case-sensitive strings (1–120 characters: letters/digits/underscores/hyphens). POST can supply a stable ID or omit it for a UUID. PATCH cannot change IDs. Names are trimmed nonempty strings <=200 characters; optional text is null or nonempty trimmed text <=2000 characters. `pictureUrl` accepts a local absolute path or HTTPS URL. Sort order, sizes, and amounts are nonnegative 32-bit integers. Booleans/enums are strict. Bodies must be JSON objects <=16 KiB; unknown keys including `isAdmin` are rejected. Ordering is ascending `sortOrder` then `id`; use PATCH to reorder.

## Administrative CRUD

| Route | Methods | Result |
| --- | --- | --- |
| `/api/admin/categories` | GET, POST | `{data:[categories]}` / 201 `{data:category}` |
| `/api/admin/items` | GET, POST | `{data:[items with variants]}` / 201 `{data:item}` |
| `/api/admin/variants` | GET, POST | `{data:[variants]}` / 201 `{data:variant}` |
| `/api/admin/{categories,items,variants}/{id}` | PATCH, DELETE | 200 `{data:updated record}` / 204 empty |

Create category requires `name`. Create item requires `categoryId`, `name`, and `itemType`. Create variant requires `itemId`, `name`, `priceCentavos`, and `priceKind`. Omitted `sortOrder` is 0; categories/items default active; optional item fields default null; variant temperature/size/availability default null and currency defaults PHP. PATCH accepts any nonempty subset of the writable entity fields. References must exist. Deleting a nonempty category returns 409; move/delete its items first. Deleting an item transactionally deletes its variants; deleting a variant affects only it. POST/PATCH records may include internal source provenance fields on returned stored variants; reads use the documented DTO.

Errors use `{ "error": { "code": "VALIDATION_ERROR", "message": "priceCentavos must be a nonnegative 32-bit integer." } }`. Statuses: 400 validation/invalid JSON/reference, 401 missing/invalid identity, 403 pending approval/invalid origin, 404 missing record/resource, 409 duplicate/reference conflict/nonempty category/profile conflict, 413 oversized body, 415 wrong content type, 503 provider/database failure. No raw database errors or credentials are returned. Unsupported HTTP methods receive Next.js 405.

## Working examples

Start the app with `npm run dev`. The browser's same-origin fetch sends SSR cookies automatically:

```ts
const response = await fetch('/api/admin/items/item-americano', {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ active: false }),
});
const result: unknown = await response.json();
```

Shell examples (Bash; use your actual URL and credentials):

```bash
curl http://localhost:3000/api/menu
curl -c cookies.txt -H 'Origin: http://localhost:3000' -H 'Content-Type: application/json' \
  -d '{"email":"approved@example.com","password":"your password"}' http://localhost:3000/api/auth/signin
curl -b cookies.txt http://localhost:3000/api/admin/menu
curl -b cookies.txt -H 'Origin: http://localhost:3000' -H 'Content-Type: application/json' \
  -X PATCH -d '{"priceCentavos":17500}' http://localhost:3000/api/admin/variants/var-americano-iced
curl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Guest beans","sortOrder":9}' http://localhost:3000/api/admin/categories
```

Bearer tokens must come from the configured Supabase project for an approved user; the application does not issue custom tokens. Avoid putting tokens/passwords in shared logs or committing cookie files.

## Teammate UI tasks

Replace the protected `/dashboard` placeholder with category/item/variant editors consuming these APIs. Add ordering controls that PATCH sortOrder, active/availability switches, centavo-safe amount inputs, and category moves. Render explicit variant names/temperature/size and optional specialty process/roaster. Preserve null variant availability and photos; don't turn absent values into fake data. Handle 401 by returning to login, 403 by showing pending/revoked access, and 409 by refreshing the current menu. Keep authenticated response data out of shared caches. Do not add privilege management, customer accounts, or ordering flows. The server guards are mandatory even if the UI hides controls.

## Verification

`npm test` covers CSV identities/quantities, prices and variants, quote handling, provenance/size, duplicate input, and mutation validation. `npm run test:api` against a running app compares real database HTTP data to the CSV, verifies anonymous/forged-token denial and dashboard redirect, and checks rejected cross-origin auth requests emit no cookies. `npm run lint`, `npx tsc --noEmit`, and `npm run build` check integration. After explicit authorization, `npm run test:auth -- --allow-temporary-accounts` uses only isolated temporary accounts for real Auth/CRUD/revocation tests and independently attempts all database/Auth cleanup even if one fails. It requires the server-only secret key and disabled email confirmation, and refuses to run without the explicit flag. It is excluded from `npm test`.
