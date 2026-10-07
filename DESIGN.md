---
name: Nuwave Specialty Coffee
description: Warm paper, condensed menu headings, and ruled rows for clear menu reading.
colors:
  paper: "#f5efe6"
  cream: "#f1e2d2"
  plum-ink: "#2f042f"
  plum-accent: "#2f042f"
  muted-ink: "#654765"
  mauve-rule: "#c9b5c6"
  specialty-plum: "#452045"
  specialty-rule: "#91718c"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(3.6rem, 7.5vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1.05
  title:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.35
  body:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.76rem"
    lineHeight: 1.6
  price:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 650
    lineHeight: 1.35
rounded:
  category-label: "50px"
  specialty: "22px"
  specialty-mobile: "18px"
  action: "24px"
spacing:
  page: "24px"
  content: "40px"
  mobile-content: "22px"
components:
  menu-action:
    backgroundColor: "{colors.plum-accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.action}"
    padding: "10px 24px"
    height: "44px"
  category-label:
    textColor: "{colors.plum-accent}"
    typography: "{typography.headline}"
    rounded: "{rounded.category-label}"
    padding: "6px 22px 8px"
  specialty-panel:
    backgroundColor: "{colors.specialty-plum}"
    textColor: "{colors.paper}"
    rounded: "{rounded.specialty}"
    padding: "28px 30px 30px"
---

# Design System: Nuwave Specialty Coffee

## Overview

**Creative North Star: "Vintage coffee-house menu poster"**

Warm paper, condensed lettering, and fine rules establish the café identity. Readable item names and prices carry the interface; the original coffee-cup ink artwork supplies a small, memorable detail without delaying menu content.

The system uses a compact composition and flat rows. Color groups related information and distinguishes the specialty section while retaining the existing brand palette.

**Key Characteristics:**

- Condensed display lettering with readable Geist menu text.
- Ruled rows and clear variant labels.
- Cream paper with dark-plum emphasis and text.
- Brief input feedback and reduced-motion support.

## Colors

Dark plum is the primary emphasis color for headings, active navigation, actions, item text, and the footer. A lighter deep-plum panel groups specialty coffee. Muted plum carries descriptions and supporting labels; mauve rules separate rows, with a stronger mauve divider within the specialty panel. Paper is the reading surface; cream forms the outer field and supporting text on plum.

**The Readable Price Rule.** Prices inherit the section's readable foreground and use tabular figures; color never replaces a variant label.

## Typography

Barlow Condensed provides the large menu heading, category labels, and footer brand text. The original logo image supplies the masthead identity. Geist supplies menu names, descriptions, navigation, and prices. Fonts are loaded through `next/font`; local CSS fallbacks remain available.

The display heading scales with viewport width. At the mobile breakpoint it uses `clamp(3.55rem, 15vw, 5.15rem)` and a 0.95 line height. Item names wrap naturally. Price figures remain on one line, with small uppercase Iced/Hot or size labels above them.

## Layout

The paper container has a maximum width of 1180px. Desktop menu content uses two equal columns with 42px vertical and 52px horizontal gaps. Specialty coffee and add-ons span the content width; specialty rows use two columns and add-ons use three.

At 800px and below, padding and gaps tighten. At 600px and below, the outer frame disappears and menu, specialty rows, and add-ons become single-column. Sticky navigation scrolls horizontally within its own area. Sections offset anchor scroll by 80px on desktop and 72px on mobile.

## Elevation & Depth

The public menu has no shadow vocabulary. Paper/cream layering, mauve rules, and the contrasting specialty/foot regions create hierarchy. The original GPT Image2 mascot was subsequently recolored and made transparent by the user; render the replacement's color and transparency directly.

## Shapes

The main paper frame is rectangular with a fine border. Category labels use rounded outlines. Specialty coffee uses a rounded contrasting region, and retry actions use a pill shape. Menu rows stay flat and are divided by fine rules.

## Components

Category navigation uses native anchors, an active underline, `aria-current="location"`, and visible keyboard focus. Anchor activation keeps every menu section available. Fine-pointer hover also reveals the underline.

Menu rows pair flexible content with right-aligned definition-list prices. Single variants have an accessible Price label; paired temperatures and sizes have visible labels. Surcharges include a plus sign. Optional descriptions, process, and roaster information remain below item names.

The specialty region changes foregrounds to paper/cream and uses a softer contrasting divider. Retry actions have a minimum 44px height. Public links use a 2px dark-plum focus outline, changing to paper in the footer.

Press feedback scales to 0.97 over 160ms. Active underline changes over 150ms. The cup artwork enters over 250ms; menu rows do not animate in. Reduced motion removes transform feedback and artwork animation and limits the underline to a brief opacity change.

## Do's and Don'ts

### Do:

- Do use clear variant names and tabular price figures.
- Do keep menu rows flat and separate them with fine rules.
- Do preserve keyboard focus, horizontal category navigation, and reduced-motion behavior.
- Do document actual source tokens when extending this system.

### Don't:

- Don't use the brand logo as a product photograph.
- Don't delay menu text behind entrance animation.
- Don't introduce cart, ordering, or public administrative navigation into the menu.
