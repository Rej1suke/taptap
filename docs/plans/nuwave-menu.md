# Nuwave digital menu implementation plan

Status: implemented and verified at the scopes recorded below. The stages preserve the approved intended behavior; actual evidence and limits appear separately in the verification record.

## Scope

Deliver one responsive public menu at `/`, a hidden administrative authentication flow, protected menu APIs, and a protected `/dashboard` placeholder for the teammate who will build the full admin UI. No cart, orders, checkout, payment, customer accounts, or admin-user management.

The confirmed source is `E:/Downloads/menu.csv`: 8 categories, 33 items, and 40 variants. Paired source prices mean **iced first, hot second**. Preserve exact source IDs, category/item/variant ordering, nullable availability, food/beverage/addon types, coffee process and roaster details, and add-on surcharges. Source-image filenames are provenance; they are not usable product-image URLs.

## Stage 1 — Data contract and safe database setup

Owner: backend worker. Model `MenuCategory`, `MenuItem`, and `MenuVariant` separately. Represent PHP prices as integer centavos and keep availability nullable where the CSV leaves it unspecified. Replace the unrelated generated application user ID with the verified Supabase authentication UUID; store `fullName` and `isAdmin` defaulting to false.

Read `prisma-8.md` and installed Next.js documentation before implementation. Make dependency declarations and generated Prisma contract artifacts reproducible. Apply an additive migration preserving existing User records and admin flags; do not reset the database. Implement CSV validation and a seed that adds missing data without overwriting later administrative edits on routine reruns. Diagnose the initially timed-out database connection before claiming migration or seed success.

Acceptance: all 33 source items and 40 variants map faithfully to 8 categories; prices, iced/hot meanings, ordering, and specialty details match the source; seed reruns preserve edited records; existing users and privileges survive the migration.

## Stage 2 — Authentication and authorization

Owner: backend worker. Use Supabase sign-up/sign-in with Prisma application profiles. Sign-up must verify the returned identity before creating the application User, persist `isAdmin: false`, discard the signup token/session, and remain on the signup screen displaying `Log in again once the admin verifies you`. Sign-in may recover a missing application profile without overwriting an existing role. Approved admin sign-in redirects to `/dashboard`; pending users receive an explicit approval message and are signed out.

Approval happens manually in Supabase's database dashboard by editing the application's `public.User.isAdmin`, never auth metadata. Every protected route and dashboard access verifies the session and then queries the current database admin flag. Missing profiles, expired/invalid tokens, failed queries, and non-admin users fail closed. No user-management endpoint is included. Keep SSR cookie refresh intact and public/auth routes accessible anonymously.

Acceptance: signup never leaves an administrative session; submitted metadata cannot elevate access; approved admins enter the dashboard; anonymous and pending users are denied; revocation denies an existing session's next administrative request; recovery never grants or overwrites privileges.

## Stage 3 — Public and administrative menu API handoff

Owner: backend worker. Add public `GET /api/menu` and protected menu listing plus category/item/variant CRUD, ordering, and availability updates. Validate bodies strictly and return stable typed responses and errors. Require same-origin checks for cookie-authenticated mutations; support explicit verified bearer authentication. Keep role checks at each protected data operation, independent of client controls or Proxy redirects.

Document the final API contract, authentication, errors, and working request examples in `docs/specs/admin-side.md`. Build only the protected dashboard placeholder needed to prove the handoff; the teammate owns the complete administrative UI.

Acceptance: public reads work anonymously and expose intended menu data; administrative endpoints enforce identity plus the live database role; invalid or cross-origin cookie mutations fail; route examples run end-to-end; availability and ordering edits are reflected by public reads.

## Stage 4 — Distinctive one-page public menu

### Direction contract for `/`

THESIS: A vintage coffee-house menu poster organized for reading. Visitors compare real menu entries directly; the layout avoids a marketing hero and repeated product-card grid.

OWN-WORLD: Cream paper, dark-plum type and display lettering, mauve rules, condensed headings, restrained rounded section labels, and original coffee-cup linework. The user updated the initial brown/burgundy direction to match the real logo and recolored transparent mascot.

STORY: Visitors recognize Nuwave, find a category, read ingredients or coffee details, and compare clearly labeled PHP prices. Every category remains on the page.

FIRST VIEWPORT: A compact brand/masthead composition places tall THE MENU lettering centrally on desktop and beside the small cup artwork on mobile. The address and price currency precede sticky category anchors; menu rows follow immediately.

FORM: Read mode; user-pinned vintage café menu reference, direct code-first implementation for this session. No random seed or standing build-path preference was selected.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Owner: design worker. Build a compact vintage coffee-house menu poster using paper `#f5efe6` / `#f1e2d2`, dark plum `#2f042f`, muted plum `#654765`, mauve rules `#c9b5c6`, a specialty panel `#452045`, and its divider `#91718c`. Use the real logo, tall MENU typography, and original small coffee-cup linework mascot. The user's latest direction replaces the initial brown/burgundy palette and requests the full logo remain visible with less zoom. Use rows and fine rules rather than repeated product cards. Do not treat the logo as a drink photograph.

Keep all menu content on one page. Add sticky anchor navigation for all 8 categories; navigation scrolls to sections and never hides items. Show iced then hot columns for paired variants and clear single-variant prices. Use two desktop columns in CSV category order, a full-width specialty section with process/roaster details, an add-on strip, and a single mobile column. Update brand metadata and maintain keyboard focus, readable contrast, semantic headings, and accessible navigation.

Motion: use brief 100–160ms press/index feedback and rare 250ms artwork entrances, using transform/opacity with `cubic-bezier(.23,1,.32,1)`. Never delay menu text. Reduced motion uses static/opacity presentation without travel.

Acceptance: every CSV item is visible with correct PHP price labels; specialty information and surcharges are clear; categories remain usable while scrolling; the page fits narrow screens and desktop; keyboard navigation and reduced motion remain usable; no public administrative navigation is introduced.

## Stage 5 — Independent verification and documentation

Owner: documentation/QA worker, coordinated with backend and design readiness. Work ownership is exclusive: backend owns routes, libraries, Prisma, data, scripts, packages, README, and API specification; design owns the public page/layout/styles/menu components/assets; documentation owns this plan and `AGENTS.md`. These non-conflicting assignments do not require worktrees. Preserve unrelated user edits and do not commit, merge, push, or create a PR without the user's selection.

Run focused CSV/validator/auth-guard checks, actual API end-to-end checks, `npm run lint`, `npx tsc --noEmit`, and `npm run build` after dependent artifacts stabilize. Regenerate/check the Prisma contract after contract changes. Separate mock/unit evidence from actual Supabase/database proof.

Use the computer-use skill and a dedicated Chrome session for authorized UI QA. The user has confirmed Chrome availability. Exercise the public menu, category navigation, responsive layout, price readability, auth forms, and dashboard denial; collect screenshots and record failures. Do not create live test accounts or change privileges in browser QA without the necessary authorization. Update `AGENTS.md` to describe the completed architecture only after inspecting the resulting source.

Acceptance: checks report exact outcomes and material limitations; Chrome flows have observable evidence; documentation matches implemented routes/data rather than planned claims; any unavailable database or auth proof is explicitly reported.

## Verification record

- Backend worker reports the actual PostgreSQL 17 public schema was empty before migration; migration and security setup completed, and real database seed contains 8 categories, 33 items, and 40 variants. Browser-facing table privileges were removed and the privileged server role verified. This is actual database work, separate from unit evidence.
- Backend worker reports `npm test`, full ESLint, TypeScript, real HTTP public/denied API checks, and authorized temporary-account signup/profile recovery/pending-versus-approved login/cookie-and-bearer CRUD/CSRF/revocation checks passed. Both temporary Auth identities/profiles and all temporary menu records were removed afterward. The documentation worker independently inspected the guards, auth cleanup, validation, transactional seed, security SQL, and test assertions. The discovered cross-origin logout issue and password trimming issue were corrected before the reported passing checks.
- Supabase's external REST Data API returned 503 `PGRST002`, so its HTTP response cannot prove permission denial. Direct SQL role/privilege verification is separate evidence; do not present the REST outage as a successful access-control test.
- Chrome QA used dedicated browser 2/session `☕ Nuwave QA`, tab 1347438267, on `http://localhost:3000`. Observed 33 item rows, 40 price variants, and 8 categories. At widths 320, 390, 800, and 1440, document width did not exceed client width. Iced/hot labels, single prices, specialty process/roaster details, surcharges, original logo framing, and the user's recolored transparent mascot were visible.
- Native category anchors kept all content visible. Desktop Black/Classics selection remained correct despite paired section tops; Add On became current at the end. Keyboard Enter on Milk-based focused its target section. Anonymous dashboard access redirected to login. Empty sign-in and signup submissions focused their first required field without creating an account.
- The Chrome provider returned navigation-wait timeouts on some auth/public navigations; subsequent DOM observations verified the intended `/signup` and `/` pages. No application console errors were observed. Reduced-motion behavior was checked in source only: the browser API advertises no runtime media-emulation capability. No runtime reduced-motion screenshot result is claimed.
- Final visual evidence: `.impeccable/review/desktop.jpg`, `.impeccable/review/mobile.jpg`, and `.impeccable/review/signup.jpg`. Viewport overrides were reset after QA. The source-derived visual system is recorded in `DESIGN.md` and `.impeccable/design.json`, with confirmed product context in `PRODUCT.md`.
- A targeted production Chrome pass after the user's palette/logo revision verified dark-plum ink/emphasis `#2f042f`, specialty background `#452045`, and the full uncropped logo at 1440, 390, and 320px. No horizontal document overflow occurred; the narrow heading wraps cleanly. The desktop/mobile screenshots were refreshed and `.impeccable/review/mobile-320.jpg` added. User-owned logo/mascot pixels were preserved.
- Next.js and its ESLint configuration were patched to 16.3.6 and sharp to compatible 0.35.5. The backend worker reports the final production build passed, including TypeScript and all 11 routes, and full ESLint passed. Production restarted at `http://localhost:3000`; final smoke checks returned home/public menu 200 with 8 categories, 33 items, and 40 variants, anonymous admin 401, and forged-token admin 401. Direct SQL denial for browser roles on all four application tables was verified separately from the unavailable REST API.
- `npm audit --omit=dev` reports zero production vulnerabilities. The full audit still reports 19 development-only findings; details and final backend evidence are in `docs/specs/backend-verification.md`. These are reported limits, not a claim that every dependency is vulnerability-free. No live temporary test accounts remain. No commits, pushes, or PRs were created by this work.
