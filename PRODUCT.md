# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Customers at the café who tap the NFC tag on their table and order from their own phone. Cashiers and approved administrators work on the staff side; a teammate owns the complete administrative interface.

## Product Purpose

Let customers browse the menu, choose options and add-ons, and place an order from their table, then follow its status live, without signing in. The agreed scope (deck "Ñuwave Ordering System — Scope Inclusions", October 2026) covers NFC table ordering, online payments through PayMongo, a cashier dashboard, and Loyverse POS as the source of menu, prices and sales.

## Operating Context

The confirmed source menu is `E:/Downloads/menu.csv`, containing 8 categories, 33 items, and 40 variants. Paired prices mean iced first and hot second. Supabase handles administrative authentication; application User records and menu data use Prisma with PostgreSQL. An operator grants approval manually through `public.User.isAdmin` in the Supabase database dashboard.

## Capabilities and Constraints

- Customer web ordering is in scope: menu by category with search, hot/iced and add-ons, cart, dine-in or takeout, table number from the NFC link (`?table=N`, 1–99), order placement, a live status page, and "My Orders" stored on the device.
- No customer accounts. A customer sees an order only through its private request token, which lives on the ordering device and in the status-page URL.
- Pay at the counter works now. Online payment (GCash, Maya, QR Ph, cards via PayMongo) is shown as coming soon and rejected by the API until the PayMongo integration lands.
- Not yet built: the cashier dashboard and status controls, PayMongo checkout and webhooks, and Loyverse menu sync and sales posting. Until Loyverse sync exists, the database menu seeded from the CSV stays the source.
- No push or SMS notifications; the status page updates live while open, and the cashier presses a standalone table beeper.
- Preserve confirmed identifiers, prices, category ordering, food/beverage/addon distinctions, specialty process/roaster details, and surcharges.
- Administrative signup remains pending approval and discards any signup session. Approved sign-in enters a protected dashboard placeholder. Each protected request verifies identity and the current database admin flag.
- The full admin UI belongs to a teammate; provide documented menu APIs. No admin-user management.

## Brand Commitments

Preserve the Nuwave Specialty Coffee identity, real logo, and warm paper/cream backgrounds. The user's updated color direction uses varied plum centered on `#2f042f`, matching the logo and their recolored transparent mascot. The approved interface direction draws on a vintage coffee-house menu poster while prioritizing menu reading.

## Evidence on Hand

`public/nuwave.png` supplies the real brand image. The confirmed CSV supplies menu truth. CSV source-image filenames record provenance rather than usable product photographs. Do not invent missing photographs, price values, testimonials, or business claims.

## Product Principles

- Make the public menu available without authentication.
- Keep menu content faithful to confirmed source data.
- Make variant labels and prices unambiguous.
- Enforce administrative privilege on the server using the current database record.
- Keep the teammate's UI handoff explicit and narrow.
