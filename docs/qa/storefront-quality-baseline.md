# Rhino Lapidary Storefront Quality Baseline

**Owner:** Rhino Lapidary engineering
**Applies to:** Theme code, theme-editor configuration, app blocks, app embeds, product media, and storefront content
**Last reviewed:** 2026-07-03

## Purpose

This document defines the minimum browser support, accessibility requirements, and performance expectations for the Rhino Lapidary Shopify storefront.

These requirements apply to inherited Shopify Trade behavior as well as Rhino-specific changes.

A feature is not complete merely because it works in one desktop browser.

---

# 1. Browser and Device Support

## Supported desktop browsers

The storefront supports the current and previous major releases of:

* Google Chrome
* Microsoft Edge
* Apple Safari
* Mozilla Firefox

Internet Explorer is not supported.

## Supported mobile browsers

The storefront supports:

* Safari on the current and previous major iOS releases
* Chrome on the current and previous major Android releases
* Safari on current iPadOS
* Chrome on current Android tablets

## Automated browser coverage

Automated storefront checks should cover:

* Chromium desktop
* Chromium mobile emulation
* WebKit desktop
* WebKit mobile emulation

Automated emulation does not replace testing on at least one real iPhone and one real Android device before a major release.

## Required viewport matrix

| Class            |    Viewport | Primary purpose                         |
| ---------------- | ----------: | --------------------------------------- |
| Small mobile     |   360 × 800 | Narrow Android and older mobile layouts |
| Standard mobile  |   390 × 844 | Common modern phone layout              |
| Large mobile     |   430 × 932 | Large phone layout                      |
| Tablet portrait  |  768 × 1024 | iPad and tablet navigation              |
| Tablet landscape |  1024 × 768 | Intermediate navigation and grids       |
| Small desktop    |  1280 × 720 | Laptop layout and vertical constraints  |
| Standard desktop |  1440 × 900 | Primary desktop review                  |
| Wide desktop     | 1920 × 1080 | Maximum-width and whitespace review     |

## Required customer journeys

The following journeys must be tested at mobile and desktop sizes:

1. Open the homepage.
2. Open and navigate the primary menu.
3. Use predictive search.
4. Submit a full search.
5. Open a collection.
6. Apply and clear collection filters.
7. Change collection sorting.
8. Open a simple product.
9. Open a multi-variant product.
10. Select a variant.
11. Change quantity.
12. Add a product to cart.
13. Review the cart notification or drawer.
14. Open the full cart.
15. Update a cart quantity.
16. Remove a cart line.
17. Open a machine product.
18. Open an accessory or consumable product.
19. Use quick order where enabled.
20. Open the contact page.
21. Open customer login.
22. Open policy and support pages.

## Responsive acceptance rules

* No unintended horizontal page scrolling.
* No clipped purchase controls.
* No inaccessible off-screen dialogs or drawers.
* Navigation remains usable at every supported width.
* Product names and variant labels may wrap without overlapping controls.
* Specification and comparison data remain understandable on mobile.
* Tap targets do not overlap.
* Sticky elements do not hide focused controls.
* Modals and drawers remain usable in landscape orientation.
* Images use an appropriate crop and do not conceal essential machine details.

---

# 2. Accessibility Baseline

## Target

The project targets WCAG 2.2 Level AA.

Automated testing is a regression aid and does not replace manual review.

## General requirements

* Every page has one clear main landmark.
* Heading levels form a logical hierarchy.
* Interactive elements use native controls wherever possible.
* Every control has an accessible name.
* All functionality is operable by keyboard.
* Keyboard focus is visible.
* Focus order follows the visual and logical order.
* Opening a dialog moves focus into it.
* Closing a dialog returns focus to the invoking control.
* Status changes are announced when necessary.
* Text and controls meet AA contrast requirements.
* Meaning is not communicated by color alone.
* Content remains usable at 200% browser zoom.
* Layout remains usable when text spacing is increased.
* Motion respects reduced-motion preferences.
* Informative images have useful alternative text.
* Decorative images use empty alternative text.
* Videos have captions.
* Instructional videos have transcripts or equivalent written guidance.
* Forms identify required fields.
* Form errors explain what failed and how to correct it.
* Error messages are programmatically associated with their fields.

## Component-specific checks

### Header and navigation

* Skip link becomes visible on focus.
* Logo has an appropriate accessible name.
* Menu buttons expose expanded and collapsed state.
* Mega-menu content is keyboard reachable.
* Escape closes open navigation surfaces.
* Focus is not lost after closing a menu.
* Account, search, and cart icons have accessible names.

### Predictive search

* Search input has a persistent accessible label.
* Loading and result changes are announced.
* Arrow-key and Tab behavior is predictable.
* Search results can be reached without a pointer.
* Closing search returns focus appropriately.

### Collection filters

* Filter groups have understandable names.
* Checkbox states are announced.
* Disabled values are actually disabled.
* Active filters can be removed by keyboard.
* Mobile filter drawers trap focus correctly.
* Applying or clearing filters announces updated result counts.
* Price ranges have associated labels.

### Product page

* Product title is the primary page heading.
* Price and availability changes are announced.
* Variant controls expose their selected state.
* Unavailable variants are communicated accessibly.
* Quantity controls have accessible names.
* Add-to-cart state and errors are announced.
* Product gallery thumbnails have useful names.
* Image zoom and media dialogs trap and restore focus.
* Collapsible content exposes expanded state.

### Quick order

* The table has an understandable structure.
* Variant names, SKUs, quantities, and prices remain associated.
* Quantity validation errors are announced.
* Keyboard users can move between quantity controls.
* Sticky headers and total bars do not obscure focused inputs.
* Loading and cart updates are announced.

### Cart notification and drawer

* The cart surface has dialog semantics where appropriate.
* Focus moves into the surface when opened.
* Focus remains contained while open.
* Escape closes the surface.
* Focus returns to the invoking control.
* Added product, quantity, and variant are announced.
* Remove and quantity controls have specific accessible names.

### Forms

* Visible labels are used wherever practical.
* Placeholder text is not the only label.
* Errors are summarized or announced.
* Success messages are announced.
* Autocomplete attributes are used for customer information.
* Required fields are identified visually and programmatically.

## Automated accessibility gate

Automated tests must report no unapproved `serious` or `critical` axe violations on representative pages.

Representative pages include:

* Homepage
* Collection
* Search
* Simple product
* Multi-variant product
* Cart
* Contact page

A suppression requires:

* The exact axe rule
* The affected page or component
* The reason it cannot yet be fixed
* A tracking issue
* An owner
* A review date

## Shopify preview UI exclusion

Automated accessibility scans exclude Shopify's injected unpublished-theme preview bar:

- `#PBarNextFrame`

This iframe is Shopify-owned preview UI, not Rhino Lapidary storefront code. Accessibility failures inside this frame are not actionable in this repository.

The exclusion must not be expanded to Rhino-owned theme elements without a documented issue and owner.

## Manual release check

Before publishing:

* [ ] Navigate the primary journeys using only the keyboard.
* [ ] Confirm visible focus on every interactive control.
* [ ] Test menus, drawers, dialogs, accordions, filters, and media overlays.
* [ ] Confirm focus restoration after closing overlays.
* [ ] Test at 200% zoom.
* [ ] Test at 360 pixels wide.
* [ ] Enable reduced motion and review animated components.
* [ ] Inspect heading order and landmarks.
* [ ] Review product and editorial image alternative text.
* [ ] Verify form labels and error handling.
* [ ] Verify video captions and instructional alternatives.
* [ ] Review automated axe results.

---

# 3. Performance Budget

## Measurement model

Use both:

* Lab measurements during development and release review
* Field measurements after meaningful production traffic exists

Lab measurements are diagnostic and can vary between runs. Record at least three mobile runs and use the median result.

## Core Web Vitals goals

The production storefront targets:

| Metric                    |                     Goal |
| ------------------------- | -----------------------: |
| Largest Contentful Paint  |      2.5 seconds or less |
| Interaction to Next Paint | 200 milliseconds or less |
| Cumulative Layout Shift   |              0.1 or less |

Field performance should be evaluated at the 75th percentile separately for mobile and desktop when enough data exists.

## Lighthouse development goals

| Category       | Development warning | Launch target |
| -------------- | ------------------: | ------------: |
| Performance    |            Below 80 |  90 or higher |
| Accessibility  |            Below 90 |  95 or higher |
| Best Practices |            Below 90 |  95 or higher |
| SEO            |            Below 90 |  95 or higher |

A Lighthouse score does not override a known usability, accessibility, or correctness defect.

## Resource budgets

These are project budgets, not platform guarantees.

### Initial page load

| Resource                | Target | Hard review threshold |
| ----------------------- | -----: | --------------------: |
| Total transferred data  | 1.8 MB |                2.5 MB |
| JavaScript              | 300 KB |                400 KB |
| CSS                     | 200 KB |                300 KB |
| Images loaded initially | 1.0 MB |                1.5 MB |
| Fonts                   | 150 KB |                250 KB |
| Total requests          |     70 |                    90 |
| Third-party requests    |     10 |                    20 |

Exceeding a target requires investigation. Exceeding a hard threshold requires explicit approval and a documented reason.

## Media rules

* Hero images use responsive Shopify image URLs.
* Above-the-fold imagery is appropriately sized.
* Noncritical images are lazy loaded.
* Product galleries do not load every full-resolution asset immediately.
* Videos use deferred loading or preview images.
* Autoplay video is avoided unless it has a clear business purpose and respects user preferences.
* Decorative animated GIFs are not introduced when a lighter format can provide the same effect.
* Product diagrams prioritize legibility without serving unnecessarily large source files.

## JavaScript rules

* Prefer native HTML and CSS behavior.
* Prefer existing Trade custom elements before adding new frameworks.
* New JavaScript is loaded only on pages that require it.
* New scripts use `defer` or modules where appropriate.
* Avoid repeated global listeners.
* Avoid polling.
* Avoid layout thrashing.
* Avoid dependencies for behavior that can be implemented safely in a small local module.
* Every app or third-party script requires before-and-after performance review.

## Font rules

* Prefer Shopify-hosted fonts or system fonts.
* Limit active font families and weights.
* Do not load weights that are not used.
* Preserve `font-display: swap`.
* Brand decisions should not require excessive font payloads.

## App and third-party rules

Before enabling an app embed, pixel, chat widget, review widget, or video provider:

1. Record its purpose.
2. Record pages affected.
3. Measure the storefront before enabling it.
4. Measure the same pages after enabling it.
5. Record added requests and transferred data.
6. Check accessibility.
7. Confirm consent and privacy behavior.
8. Document how to disable or remove it.

## Required performance pages

Measure:

* Homepage
* Main product collection
* Search results
* Representative machine product
* Representative consumable product
* Cart
* Contact page

## Release performance check

* [ ] Run Lighthouse mobile three times for each critical page.
* [ ] Record median scores and key metrics.
* [ ] Compare results with the previous release.
* [ ] Review transferred data and request counts.
* [ ] Review newly introduced scripts.
* [ ] Review app embed changes.
* [ ] Confirm hero and product images are appropriately sized.
* [ ] Confirm noncritical media is lazy loaded.
* [ ] Investigate any material regression.
* [ ] Record approved exceptions in the release notes.
