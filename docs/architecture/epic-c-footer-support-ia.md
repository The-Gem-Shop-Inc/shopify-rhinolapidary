# Epic C Footer and Support IA

**Epic:** C - Global Header, Navigation, and Footer  
**PBIs:** C-PBI-015 through C-PBI-020  
**Status:** Batch 4 governed model; Admin footer configuration blocked by shared menu isolation  
**Created:** 2026-08-17  
**Governing tracker:** [rhino-lapidary-pbi-tracker-epic-c.md](../rhino-lapidary-pbi-tracker-epic-c.md)

## Purpose

This document defines the governed footer, support, policy, and localization
rules for Rhino Lapidary global chrome.

The footer must help customers find shopping, policy, support, and utility
destinations without creating legal, operational, international, warranty,
freight, repair, dealer, financing, certification, manufacturer, or social
claims that are not approved.

## Source Authority

| Decision | Source | Validation |
|---|---|---|
| Current footer rendering | `sections/footer.liquid`, `sections/footer-group.json` | `npm run test:global-chrome-links` |
| Footer IA model | `data/global-navigation-ia.json` | `npm run validate:global-navigation-ia` |
| Footer-sensitive claims | `data/legal-claims-register.json` | `npm run validate:brand-claims`, `npm run test:brand-claims-validator` |
| Manuals/downloads/support readiness | `data/footer-support-resources.json` | `npm run validate:footer-support`, `npm run test:footer-support-validator` |
| Policy and sitemap discovery | `tests/global-chrome-links.spec.js` focused policy/sitemap test | `npm run test:footer-policy-sitemap` |
| Localization and market-safe labels | `data/localization-market-decision.json` | `npm run validate:localization-market-safety` |

## Current Footer State

The current footer is inherited from Trade and renders:

- One Shopify Navigation link-list block headed `Quick links`.
- The shared Shopify Navigation handle `footer`.
- Current menu content observed in Batch 1: `Search`.
- Dynamic Shopify policy links from `shop.policies`.
- Current published policy evidence: `Privacy policy`.
- Optional localization selectors when Shopify exposes multiple countries or
  languages.
- Payment icons, Follow on Shop, social icon rendering, and the Shopify platform
  link according to theme settings and global theme settings.

The current preview and production theme footer group files both bind the
link-list block to menu handle `footer`.

Therefore, the existing `footer` Shopify Navigation menu is shared by
production theme `158579622085` and preview theme `158631198917`. Do not edit
that menu as a preview-only change.

## Governed Footer Groups

The repository model defines these groups in
`data/global-navigation-ia.json` under `footer-governed-model`.

| Group | Status | Notes |
|---|---|---|
| Shop | Planned | Contains verified Machines route and blocked consumables/accessories/replacement-parts dependencies. Parent is not clickable. |
| Support | Planned with blockers | Contact is a limited-safe route. Support center, manuals/downloads, warranty, repairs/service, shipping, and parts help are blocked. Parent is not clickable. |
| Company | Planned | Plain `Rhino Lapidary` home link is allowed. Social links remain unresolved until official account ownership is approved. Parent is not clickable. |
| Policies | Planned with blockers | Privacy policy is currently published. Refund, terms, shipping, contact-information, and accessibility destinations are blocked until legal/Admin evidence exists. Parent is not clickable. |
| Utility | Planned | Search is route-backed. Account is optional and account-strategy dependent. Localization is conditional and market-safety dependent. Parent is not clickable. |

No group heading may be implemented as an empty placeholder link.

## Active and Blocked Footer Destinations

Current active footer destinations:

| ID | Label | Source | Destination |
|---|---|---|---|
| `footer-search` | Search | Shared Shopify `footer` menu | `/search` |
| `footer-home` | Rhino Lapidary | Theme copyright link | `/` |
| `footer-powered-by-shopify` | Powered by Shopify | Shopify platform link | `https://www.shopify.com` |
| `footer-privacy-policy` | Privacy policy | Shopify policy object | `/policies/privacy-policy` |

Approved for a future isolated preview footer menu, but not currently rendered:

| ID | Label | Destination | Constraint |
|---|---|---|---|
| `footer-model-machines` | Machines | `/collections/machines` | Requires preview footer menu isolation before Admin use. |
| `footer-model-contact` | Contact | `/pages/contact` | Neutral route only; does not approve support-hours, warranty, or repair copy. |
| `footer-model-home` | Rhino Lapidary | `/` | Plain brand-name use only. |
| `footer-model-privacy-policy` | Privacy policy | `/policies/privacy-policy` | Dynamic Shopify policy object remains source. |
| `footer-model-search` | Search | `/search` | Current shared menu already renders Search. |

Blocked or unresolved destinations:

- Consumables
- Accessories
- Replacement parts
- Support center
- Manuals and downloads
- Warranty
- Repairs and service
- Shipping/freight help
- Parts help
- Social links
- Refund policy
- Terms of service
- Shipping policy
- Contact information policy
- Accessibility statement or policy
- Footer account strategy
- Footer localization strategy beyond Shopify-rendered selector labels

## Claim Governance

Footer copy repeats across the storefront and is governed by the legal claims
register.

Allowed without special claim approval:

- Plain navigation labels such as `Search`, `Machines`, `Contact`, and
  `Privacy policy`.
- Plain operating brand name `Rhino Lapidary`.
- Shopify-rendered country, region, currency, and language labels.

Blocked without explicit evidence and approval:

- Warranty duration or warranty provider claims.
- Freight timing, freight pricing, free shipping, or delivery promises.
- Financing availability.
- Dealer program, dealer status, or dealer pricing claims.
- Certification, patent, exclusivity, manufacturer, supplier, factory-direct,
  or role assertions.
- Support hours, response-time, service, repair, warranty-administration, or
  worldwide-support promises.
- International availability, voltage compatibility, customs responsibility,
  warranty scope, or regional support claims.
- Social account links without official account ownership.

The validator scans `sections/footer.liquid`, `sections/footer-group.json`,
theme/customer-facing files, and governed source registers.

## Support and Download Readiness

`data/footer-support-resources.json` is the support/manual/download readiness
register.

Only `support-contact-current-page` is currently safe for global navigation,
and only as a neutral Contact route.

Manuals, setup documentation, technical downloads, machine specifications,
warranty, repairs/service, shipping/freight help, and parts-help destinations
remain blocked or dependent because at least one of these is unresolved:

- Public route.
- Publication rights.
- Technical approval.
- Legal/content approval.
- Support owner.
- Product/family applicability.
- Machine specification conflicts.
- Compatibility data.

The machine specification resolution register is an internal evidence artifact;
it must not be linked as an authoritative public download.

## Policy and Sitemap Discoverability

Current Admin policy evidence shows only `Privacy policy` published.

Missing policy routes are legal/Admin dependencies:

- Refund policy
- Terms of service
- Shipping policy
- Contact information
- Accessibility statement or policy, if required for launch

Rendered footer policy links must resolve to non-password, non-404, same-route
policy pages. `/sitemap.xml` must resolve as XML sitemap content, not ordinary
storefront HTML.

## Localization and Market-Safe Labels

Read-only Admin evidence captured on 2026-08-17 shows:

- Store currency: USD.
- Enabled presentment currencies: USD only.
- Published language: English only.
- Shipping-zone countries include multiple countries.
- Web presences publish English only.
- Header and footer selector settings are enabled in theme settings.

Shipping-zone country configuration is not approval to claim international
availability. The launch decision is:

- Let Shopify conditionally render selectors according to available market and
  language state.
- Use only Shopify-rendered country, currency, region, and language labels.
- Do not add custom international, voltage, freight, warranty, customs, or
  support wording until business, operations, technical, legal, and Shopify
  Admin owners approve it.

## Admin Safety Gate

C-PBI-016 must not edit Shopify Navigation handle `footer` while production and
preview both reference it.

Allowed future path:

1. Product Owner approves a preview-isolated footer menu plan.
2. Shopify Admin creates a distinct footer menu resource.
3. The actual generated handle is recorded.
4. Production theme `158579622085` is confirmed not to reference it.
5. Only preview theme `158631198917` is pointed at the isolated menu.
6. Rollback instructions are captured.
7. Footer link, policy, sitemap, accessibility, and claims validations pass.

Until then, C-PBI-016 Admin configuration remains blocked.

## Future C-PBI-025 Inputs

C-PBI-025 must require:

- This architecture document.
- `data/global-navigation-ia.json`.
- `data/footer-support-resources.json`.
- `data/localization-market-decision.json`.
- `scripts/validate-global-navigation-ia.js`.
- `scripts/validate-footer-support-resources.js`.
- `scripts/validate-localization-market-safety.js`.
- `scripts/validate-brand-claims.js`.
- `tests/global-chrome-links.spec.js` policy/sitemap coverage.
