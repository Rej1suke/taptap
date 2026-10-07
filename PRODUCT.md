# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Visitors browsing Nuwave Specialty Coffee's menu. Approved administrators maintain menu content; a teammate owns the complete administrative interface.

## Product Purpose

Present the café's current menu clearly on one responsive public page. Visitors should be able to find categories, compare drink variants, and read prices and specialty coffee details without signing in.

## Operating Context

The confirmed source menu is `E:/Downloads/menu.csv`, containing 8 categories, 33 items, and 40 variants. Paired prices mean iced first and hot second. Supabase handles administrative authentication; application User records and menu data use Prisma with PostgreSQL. An operator grants approval manually through `public.User.isAdmin` in the Supabase database dashboard.

## Capabilities and Constraints

- Public digital menu only: no cart, ordering, checkout, payment, or customer account flows.
- Keep all menu categories visible on a single page, with category anchors for navigation.
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
