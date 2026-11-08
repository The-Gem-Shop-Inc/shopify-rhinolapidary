# Epic O authorized account audit and decisions

**Audit ID:** O-EVID-001
**Authority:** O-AUTH-001, Product Owner prompt dated 2026-11-07
**Observation:** 2026-11-08T03:46:23.810Z
**Expiry:** 2026-11-15T03:46:23.810Z
**Store:** `sz5dnk-nf.myshopify.com`
**Operation class:** sanitized read-only Admin GraphQL and schema inspection
**Mutation count:** zero
**Customer/customer-order/address record count:** zero
**Raw response retention:** none

## Outcome

The authorized minimum query succeeded against the canonical Rhino store and returned `NEW_CUSTOMER_ACCOUNTS`. Sign-in links are visible on storefront and checkout, checkout login is optional, and the store is on Basic with neither Plus nor partner-development status. The account root is Shopify-hosted at `shopify.com`; its path and any private components were not retained.

This evidence satisfies the technical prerequisite for native O-PBI-004/005 repository work. It does not establish that Buy again is currently visible, that a particular customer-account menu/configuration is published, that no account extension is installed, or that live authenticated behavior passes acceptance.

## Evidence planes

| Plane | Verified fact | Boundary |
|---|---|---|
| Platform | Current customer accounts support orders/status, profile, addresses, navigation, and Buy again. Buy again is on by default but can be hidden. | Official Shopify documentation, not Rhino configuration. |
| Rhino configuration | `NEW_CUSTOMER_ACCOUNTS`; sign-in links visible; login not required at checkout; Basic/non-Plus/non-development; Shopify-hosted account root. | Fresh read-only Admin evidence. |
| Repository | Header and mobile drawer use `shop.customer_accounts_enabled`, `routes.account_login_url`, and `routes.account_url` with localized Log in/Account names. | Source state, not live account behavior. |
| Synthetic verification | Route, empty/paginated order, address action, error, keyboard, axe, responsive, and Buy again/current-catalog contracts. | Never proof of Shopify-hosted behavior. |

Machine-readable evidence is in `data/epic-o-account-capability-snapshot-2026-11-07.json`; its schema is `schemas/epic-o-account-capability-snapshot.schema.json`. The operation inventory is `data/epic-o-read-only-query-inventory.json`.

## Audit findings

| Item | Finding | Evidence state |
|---|---|---|
| Canonical store | Exact `myshopifyDomain` matched `sz5dnk-nf.myshopify.com`; a Shop GID was returned but not stored. | Verified |
| Account mode | `NEW_CUSTOMER_ACCOUNTS` | Verified |
| Sign-in links | Visible on storefront and checkout | Verified |
| Checkout sign-in | Not required | Verified |
| Plan | Basic; `shopifyPlus=false`; `partnerDevelopment=false` | Verified |
| Account URL | Present; host `shopify.com`; Shopify-hosted; private path/components not retained | Verified/sanitized |
| Admin API version | Connector validated against its pinned Admin schema, but did not expose the exact execution version. Fields were checked against the 2026-07-or-later contract before execution. | Unverified exact version |
| Orders/status | Native platform capability for current accounts | Platform verified; Rhino authenticated behavior pending |
| Profile/addresses | Native platform capability for current accounts | Platform verified; Rhino authenticated behavior pending |
| Buy again | Native, displayed by default, and hideable | Platform verified; Rhino visibility Unverified |
| Saved payment methods | Current help requires Shopify Enterprise; verified Rhino Basic plan is not eligible | Not eligible for this MVP |
| Customer account menu | Supported and created by default for current accounts | Rhino menu contents Unverified |
| Active/draft checkout/accounts configuration | Read method unavailable | Unverified |
| Installed apps/extensions | Paginated query attempted and rejected with `access denied` before any page returned | Inaccessible/incomplete |
| Customer segments | All nine definitions traversed in one page; no members read; no account/login/password signal, three order signals, one subscription signal | Complete aggregate inventory |
| Shopify Flow workflows | No authorized read-only inventory surface was exposed | Unverified |

The snapshot intentionally keeps `oPbi001Complete=false`: missing API-version metadata and inaccessible app/config/Flow inventories cannot be converted into verified values.

## Read-only query and data rules

- The live operation allowlist contained GraphQL `query` operations only. No mutation tool was invoked.
- No customer, order, address, email, phone, payment, serial, registration, ownership, warranty, or service record was queried.
- Segment definitions were reduced in memory to aggregate keyword counts. Names, queries, and members were not retained.
- Raw Shop GID and account URL path were not retained.
- Evidence rejects Shopify tokens, private keys, customer/order/address GIDs, email addresses, credential-bearing URLs, and URLs with private query/fragment components.
- Any store mismatch stops collection and invalidates readiness.
- Pagination can be called complete only after `hasNextPage=false`; access denial remains incomplete.

## Safe manual inspection for inaccessible settings

These procedures are read-only. Do not click Save, Publish, Activate, Install, or change a toggle.

1. **Checkout/accounts configuration:** Shopify Admin → Settings → Checkout → Configurations. Record sanitized configuration names, Active/Draft status, last update, and which configuration owns customer accounts. Open preview only; do not publish.
2. **Buy again:** In the checkout and accounts editor, select Orders/order detail and inspect the Buy again visibility control. Record visible/hidden and configuration state. Shopify deactivates Buy again in the simulated editor, so do not treat clicking it there as a behavior test.
3. **Account navigation:** Shopify Admin → Content → Menus → Customer account main menu. Record built-in Orders/Profile/home destinations, external destinations by host/type only, nesting, and broken/unknown targets. Do not edit.
4. **Apps/extensions:** Shopify Admin → Settings → Apps and sales channels. For every installed app, open About → Extensions and Functions; traverse Active and Inactive lists and record whether Customer accounts is named. Record app name, purpose, active/inactive area, scopes/data category where displayed, cost owner, export/removal owner, and completeness. Do not configure or install.
5. **Flow:** Shopify Admin → Apps → Shopify Flow → Workflows. Traverse every page; identify enabled/disabled workflows using Customer account enabled/disabled, Customer created, order, tag, welcome-message, or segment actions. Record sanitized workflow references and status; do not open customer run data or enable/disable workflows.
6. **Segments:** Shopify Admin → Customers → Segments. Confirm whether any definition uses `customer_account_status`; do not open segment members. Reconcile the total to nine or re-run the authorized aggregate inventory.
7. **Sign-in redirect and custom domain:** Shopify Admin → Settings → Customer accounts and the checkout/accounts editor Sign-in page. Record return strategy and account domain host only. Do not retain authenticated URLs.

## O-DEC-001 — Account configuration

**Disposition:** Resolved for the MVP implementation path.

Rhino is already using new customer accounts. No migration or account-mode mutation is required or authorized. Native pages, not legacy customer Liquid templates, own authentication, orders, profile/addresses, and Buy again. The theme may provide entry links through Shopify route objects; it must not recreate those pages.

The 30-day legacy-account reversal window is therefore not an action item for this batch. If a future operator changes account mode, the release checklist must capture the pre-change state, review legacy template/app/Flow/segment dependencies, test redirects and sign-in behavior, and document Shopify's then-current reversal window before any mutation.

## O-DEC-002 — Approved MVP

**Disposition:** Approved by the Product Owner on 2026-11-07.

> The Rhino Lapidary Epic O MVP uses native Shopify accounts for orders, account/profile/addresses, navigation, accessibility/mobile usability, and Buy again. Machine ownership, registration, service, resource personalization, and optional retention capabilities remain available for future development but are excluded from this MVP.

This decision authorizes bounded repository work and nonproduction verification. It does not authorize Admin mutation, app installation, publication, deployment, customer access, or production release.

## O-PBI-003 — Architecture selection

**Disposition for approved MVP:** Native Shopify functionality with no new application.

| Option | MVP fit | Scopes/data | Privacy/security | Accessibility/performance | Maintenance/export/removal | Grounded 3-year external cost |
|---|---|---|---|---|---|---|
| Native customer accounts | Selected | No new app scope or Rhino-held customer store | Shopify owns account authentication and customer-scoped authorization | Shopify-hosted; still requires manual AT/responsive acceptance | No new vendor/data export or uninstall path | $0 incremental app/backend subscription; existing Shopify plan and staff time excluded |
| Customer account UI extension | Future conditional option | Least-privilege Customer Account API/metafield scopes; protected-data review where applicable | Adds app lifecycle, purpose, retention, incident, and access obligations | Shopify components/targets, but extension QA and bundle budgets required | Requires manifest/version support, export where data persists, and clean extension removal | Unpriced/TBD; no selected vendor, scope, hosting plan, or funded operator |
| UI extension plus private backend | Future conditional option for richer private records | Customer/order/company scopes plus private storage and server authorization | Highest IDOR, encryption, logging, retention, deletion/export, backup, incident burden | Adds network/outage/loading/error/performance surfaces | Requires hosting, monitoring, backups, migrations, kill switch, export, and data deletion | Unpriced/TBD; no approved ownership/service model or grounded estimate |

No three-year estimate is fabricated for future options. A later selection must price license, usage, hosting, protected-data review, engineering, monitoring, support, privacy requests, export, and exit before approval.

## O-PBI-002 and deferred boundaries

O-PBI-002 is a post-MVP policy dependency, not a gate for native orders and addresses. The following remain distinct and unresolved: purchaser, saved machine interest, registration claimant, verified current owner, authorized viewer, and warranty claimant. Orders do not establish ownership, compatibility, registration, warranty eligibility, or access to private service history.

Saved machines, registration/serials, compatible-part persistence, personalized resources, warranty status, service history, commercial accounts, wishlist, alerts, comparisons, recommendations, and reminders remain deferred or future-conditional under their existing PBI identifiers. H, I, M, and N remain deferred.

## Revalidation

Evidence expires at the timestamp above and must also be re-collected after account-mode/sign-in changes, checkout/accounts publication, app/extension changes, plan changes, Buy again visibility changes, or immediately before release acceptance.

## Official interpretation sources

- [CustomerAccountsV2 Admin GraphQL object](https://shopify.dev/docs/api/admin-graphql/latest/objects/CustomerAccountsV2)
- [Customer accounts and legacy customer accounts](https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features)
- [Customization options for upgrading customer accounts](https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/customization-options)
- [Customizing customer accounts pages](https://help.shopify.com/en/manual/customers/customer-accounts/customize-customer-accounts/customize)
- [Setting up and managing customer accounts](https://help.shopify.com/en/manual/customers/customer-accounts/manage)
