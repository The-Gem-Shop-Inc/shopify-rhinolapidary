# Epic O discovery and context

> **Historical planning snapshot:** O-AUTH-001 subsequently authorized the bounded read-only audit and conditional native O-PBI-004/005 repository work. The original findings below remain accurate for what had and had not occurred when this document was prepared; current audit evidence is recorded separately in `docs/project/epic-o-account-audit-and-decisions.md`.

**Prepared:** 2026-11-07
**Research date:** 2026-11-07
**Canonical scope:** `docs/Rhino Lapidary Storefront Backlog and Epics.md`, Epic O
**Branch:** `epic-o/o0-discovery-and-planning`
**Base:** `origin/feat/epic-l-l1a-foundation` at `414288a16fe7123b06c3433f0063ba402fc35e83`
**Worktree:** `C:\Users\dajem\WebstormProjects\shopify-rhinolapidary-epic-o`
**Shopify Admin state: Unverified**
**Boundary:** Planning and repository discovery only. No Admin access, customer login/record access, app operation, mutation, publication, message, commit, push, or deployment occurred.

## Outcome

Epic O should begin with evidence, not custom account features. The minimum useful returning-customer target is Shopify-native orders, order status, profile/addresses, clear account navigation, accessible/mobile behavior, and native **Buy again** if the current account configuration supports it. Saved machines can be assessed next as a public-interest bookmark plus a separately authorized ownership model; it must not be derived from orders. Registration, warranty status, private support history, dealer access, personalized recommendations, wishlist/comparison history, and automated reminders remain conditional or deferred.

The repository is a Shopify Trade-derived theme with classic customer templates. It is not evidence of the active account mode, and it is not a customer-account application or private service-record system.

## Source hierarchy

1. The canonical Epic O section and approved MVP sequencing decision define scope and the explicit H/I/M/N deferral.
2. Current official Shopify Help/Developer documentation defines platform capability as of the research date.
3. Fresh, authorized, sanitized Shopify Admin/API evidence would establish Rhino configuration; none was collected in this batch.
4. Current repository Liquid/JSON, contracts, validators, and implementation records establish repository behavior only.
5. Epic E/F/G/J/K/L approved evidence governs Product identity, compatibility, cart, delivery, warranty/support, and privacy boundaries.
6. Older proposals, candidate metafields, app references, screenshots, and route existence are evidence or intent, never automatic live configuration or approval.

## Branch and repository safety record

Before mutation, the original worktree was inspected with `git status --short`, `git branch --show-current`, `git worktree list`, and `git log -1`. It was on `feat/epic-l-l1a-foundation` at `414288a` and contained unrelated tracked/untracked Epic J/K work and browser evidence. After `git fetch origin`, `origin/feat/epic-l-l1a-foundation` resolved to exact commit `414288a16fe7123b06c3433f0063ba402fc35e83`; no local/remote `epic-o/o0-discovery-and-planning` branch and no Epic O worktree existed. The isolated worktree/branch was then created from that remote ref. Parent commit is `ef76e02aa023616b0f7e70ed05f59f9bd16b4cf3`. The original worktree was not edited, staged, stashed, cleaned, reset, switched, or otherwise disturbed.

## Evidence-state vocabulary

| State | Meaning |
|---|---|
| Existing repository functionality | Code/configuration exists locally; no live claim. |
| Repository implementation without live verification | A fuller behavior exists in code or historical evidence, but current deployed/Admin behavior is not proven. |
| Verified Shopify configuration | Requires current authorized Admin/API evidence. No Epic O finding has this state. |
| Proposed enhancement | Planned capability that is neither approved nor implemented. |
| External dependency | Needs Admin, app/backend, policy, operations, or another Epic. |
| Deferred capability | Intentionally outside the active milestone. |
| Unapproved business/privacy decision | Humans must decide; validation cannot approve it. |

## Repository account architecture audit

| Surface | Repository finding | What it proves | What it does not prove |
|---|---|---|---|
| `sections/main-account.liquid` | Paginates `customer.orders` by 20, links order detail, shows payment/fulfillment/total, default address, address count, logout | Classic Liquid account implementation exists | Active account mode, live access, native new-account behavior, ownership, reorder, warranty, or service history |
| `sections/main-login.liquid` | Email/password login, password recovery, optional Shop login, registration link, guest login | Legacy login templates exist | That legacy accounts are enabled or customers use this page |
| `sections/main-order.liquid` | Historic line items, variants, quantities, prices, discounts, tracking, billing/shipping addresses | Legacy order detail renderer exists | Reorder action, current availability/price, ownership, compatibility, or warranty |
| `sections/main-addresses.liquid` | Add/edit/delete/default addresses with pagination and native forms | Legacy saved-address UI exists | New-account profile configuration or current live behavior |
| `templates/customers/*.json` | Classic account/login/order/address/register/reset templates reference the above sections | Theme contains legacy routes | Shopify routing mode; new accounts redirect legacy URLs outside the theme |
| `sections/header.liquid` | Account icon renders only when `shop.customer_accounts_enabled`; routes signed-in users to account and others to login | Theme has a conditional account entry | Whether sign-in links are enabled in Admin or which account version serves the route |
| `assets/customer.css/js` | Trade customer styling/address behaviors exist | Repository support for legacy templates | Accessibility conformance or live responsive quality |
| Product/account integration | No account extension project, customer-account TOML, customer backend, or Customer owner-type definition | Theme alone has no saved-machine/service system | Installed apps or Admin-created extensions outside the repository |
| `config/shopify.app.epic-k-draft-order*.toml` and `server/epic-k-draft-order` | Epic K-specific app/backend surfaces exist | A bounded K draft-order integration exists in repository | Authorization to reuse it for Epic O, account identity, B2B, PO, ownership, or service records |

`package.json` contains theme/QA tooling (`@playwright/test`, axe, AJV, LiquidJS, Wrangler, etc.) but no general customer-account application dependency. The repository does not contain reorder controls in customer order pages, a saved-machine store, registration/serial UI, customer metafields, warranty-status calculator, service-history viewer, dealer role UI, wishlist, saved comparison, recently-viewed tracking, back-in-stock subscription, or lifecycle automation.

## Official Shopify findings

Research date: 2026-11-07. These sources establish platform behavior, not Rhino configuration. Revalidate them at implementation because plans, prices, APIs, and deprecation schedules change.

| Topic | Current official finding | Source |
|---|---|---|
| Account versions | Legacy customer accounts are deprecated. Current customer accounts use email one-time codes; legacy uses email/password. New accounts add self-serve features and app-based customization. | [Compare customer accounts](https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features), [upgrade guidance](https://help.shopify.com/en/manual/customers/customer-accounts/upgrade) |
| Native account capabilities | Both modes show order history/status and addresses; current accounts add Buy again, profile editing, saved payment methods, returns, B2B, and other capabilities. | [Compare customer accounts](https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features), [customizing accounts](https://help.shopify.com/en/manual/customers/customer-accounts/customize-customer-accounts) |
| Theme boundary | Current customer accounts are managed separately from the theme; legacy account URLs redirect after upgrade. | [Upgrade guidance](https://help.shopify.com/en/manual/customers/customer-accounts/upgrade) |
| Mode verification | Apps can determine merchant account version using the Admin GraphQL `CustomerAccountsV2` object. Epic O did not query it. | [Building apps for customer accounts](https://shopify.dev/docs/apps/build/customer-accounts) |
| UI extensions | Customer account UI extensions work only with current/new accounts, not legacy accounts. They can extend order index/status/profile or create full pages such as wishlists. | [Building apps for customer accounts](https://shopify.dev/docs/apps/build/customer-accounts), [full-page extensions](https://shopify.dev/docs/apps/build/customer-accounts/full-page-extensions) |
| Authentication | Shopify handles UI-extension account authentication. Customer Account API authenticates a buyer accessing their own account. Backend calls use session tokens and server verification. | [Customer Account API](https://shopify.dev/docs/api/customer/latest), [session token API](https://shopify.dev/docs/api/customer-account-ui-extensions/2026-01/target-apis/platform-apis/session-token-api) |
| Custom identity provider | Connecting an external identity provider with OpenID Connect is Shopify Plus-only. | [Customer authentication](https://shopify.dev/docs/api/customer-authentication) |
| Customer metafields | Extensions may read/write supported customer/order/company metafields through the Customer Account API when definitions, scopes, and protected-data approvals are satisfied. Metafields do not remove the need for authorization and privacy design. | [Metafields in customer accounts](https://shopify.dev/docs/apps/build/customer-accounts/metafields-in-customer-accounts), [extension capabilities](https://shopify.dev/docs/apps/build/customer-accounts/capabilities) |
| Protected data | Customer, order, shipping, fulfillment, and related metafields are protected customer data. Public apps request access; identifying fields can require level 2 review. Data minimization, purpose limitation, retention, encryption, access controls, logging, and incident response apply. | [Protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data) |
| App requirements | Customer-account UI uses extension configuration/targets and Shopify CLI; network access/backends require capabilities, authentication, CORS handling, scopes, and deployment. Merchant placement/configuration is a separate step. | [Start building](https://shopify.dev/docs/apps/build/customer-accounts/start-building), [UI extension reference](https://shopify.dev/docs/api/customer-account-ui-extensions/latest), [capabilities](https://shopify.dev/docs/apps/build/customer-accounts/capabilities) |
| B2B and plan limits | Current official guidance says Shopify B2B is available on Basic, Grow, Advanced, and Plus, not Starter/Retail, with plan-specific limits; direct company catalogs and certain advanced behavior remain Plus-specific. Rhino plan is unknown. | [B2B features by plan](https://help.shopify.com/en/manual/b2b/getting-started/plan-features), [B2B considerations](https://help.shopify.com/en/manual/b2b/getting-started/considerations) |
| B2B/PO operations | Companies, locations, contacts, catalogs, pricing, terms, tax settings, and permissions create the B2B model. Draft orders can carry PO numbers and payment terms. | [Companies and customers](https://help.shopify.com/en/manual/b2b/companies-and-customers), [B2B draft orders](https://help.shopify.com/en/manual/b2b/checkout-and-orders/draft-orders) |
| Tax exemption | Shopify supports tax-exempt customers and, on B2B-supporting plans, company-location tax exemptions; merchants must validate legal/tax treatment. | [Tax overrides and exemptions](https://help.shopify.com/en/manual/taxes/tax-overrides/) |
| Platform cost | Official US pricing observed on the research date lists monthly/yearly plan prices and plan feature differences. Actual Rhino plan, region, contract, apps, hosting, staff time, data review, and maintenance costs are unverified and must be costed before selection. | [Shopify pricing](https://www.shopify.com/pricing), [Plus pricing](https://www.shopify.com/plus/pricing) |

No official source found here makes a public Product metafield an appropriate store for private ownership, serial, warranty eligibility, or service records. Do not store private machine or service records on public Product metafields. Product metafields describe a Product; customer/order/company metafields or a private backend may store scoped customer-linked state only after purpose, authorization, access, retention, deletion/export, security, and operational ownership are approved.

## Canonical 24-area coverage matrix

| Area | Canonical investigation | Current classification | Finding / boundary | Proposed owner PBI |
|---|---|---|---|---|
| O-AREA-001 | New versus legacy customer accounts | Repository implementation without live verification | Classic templates exist; actual mode/plan/sign-in/configuration require authorized Admin evidence | O-PBI-001 |
| O-AREA-002 | Order history | Existing repository functionality | Legacy table/detail exist; both Shopify modes support history, but Rhino live state is unverified | O-PBI-004 |
| O-AREA-003 | Quick reorder | External dependency / proposed enhancement | No legacy control; current accounts document native Buy again; validate native behavior before custom work | O-PBI-005 |
| O-AREA-004 | Saved addresses | Existing repository functionality | Legacy CRUD exists; current accounts have profile/addresses; live behavior unverified | O-PBI-004 |
| O-AREA-005 | Saved machines | Proposed enhancement | No persistence/ownership system; save-interest must remain distinct from verified ownership | O-PBI-006 |
| O-AREA-006 | Machine registration | Deferred capability / unapproved decision | No form/system; Epic L policy and registration effect unresolved | O-PBI-007 |
| O-AREA-007 | Serial numbers | Deferred capability / unapproved privacy decision | No formats, purpose, processor, access, retention, or storage approved | O-PBI-007 |
| O-AREA-008 | Saved compatible parts | Proposed enhancement / external dependency | Exact G edges can be consumed; saving requires governed persistence and revocation | O-PBI-008 |
| O-AREA-009 | Downloadable manuals | Repository data contract without current approval | Routes/candidates exist; zero canonical publication-approved resource records | O-PBI-009 |
| O-AREA-010 | Warranty status | Deferred capability / unapproved policy | Zero approved warranty policies/mappings; no eligibility inference allowed | O-PBI-010 |
| O-AREA-011 | Support history feasibility | Deferred capability / likely custom system | Native order history is not a service record; private backend/operations would be required | O-PBI-011 |
| O-AREA-012 | Wholesale or dealer access | Deferred capability / business and plan dependency | Official B2B exists on supported plans; Rhino program and configuration unknown | O-PBI-012 |
| O-AREA-013 | Tax-exempt workflows | Deferred capability / regulated operations | Native settings exist; evidence, authority, review, and current state unknown | O-PBI-013 |
| O-AREA-014 | Purchase-order workflows | Deferred capability / commercial operations | Native B2B/draft PO options exist; Rhino process/terms/plan unknown | O-PBI-014 |
| O-AREA-015 | Account-specific product recommendations | Deferred optional enhancement | No approved rules/app/purpose; related products do not prove fit | O-PBI-015 |
| O-AREA-016 | Back-in-stock subscriptions | Proposed optional enhancement / app dependency | No repository capability or selected provider; consent/lifecycle unresolved | O-PBI-016 |
| O-AREA-017 | Wishlist | Deferred optional enhancement / app dependency | Feasible through extensions/apps; no MVP evidence or portability model | O-PBI-017 |
| O-AREA-018 | Saved comparisons | Deferred skipped-Epic interface | Epic I owns comparison and remains post-O; preserve interface only | O-PBI-018 |
| O-AREA-019 | Recently viewed items | Deferred optional enhancement / privacy dependency | No tracker/pixel/purpose/consent/retention; no hidden tracking | O-PBI-018 |
| O-AREA-020 | Consumable reorder reminders | Deferred Epic X/U interface | Public reorder works; no approved cadence, audience, consent, or messaging system | O-PBI-019 |
| O-AREA-021 | Account onboarding | Deferred Epic X interface | No approved content/purpose/sequence; core account must work without messaging | O-PBI-019 |
| O-AREA-022 | Account navigation | Existing partial repository functionality / Admin dependency | Header entry and legacy returns exist; current-account menu/configuration unverified | O-PBI-004 |
| O-AREA-023 | Account accessibility | Repository implementation without acceptance | Basic semantics exist; no integrated current-account/manual AT evidence | O-PBI-004, O-PBI-020 |
| O-AREA-024 | Account mobile usability | Repository implementation without acceptance | Trade CSS/templates exist; no authenticated current-mode mobile matrix | O-PBI-004, O-PBI-020 |

All 24 canonical investigations are covered. Coverage is not an assertion that all 24 are MVP release requirements.

## Cross-Epic dependency boundaries

| Epic | Epic O may consume | Epic O must not take over or infer |
|---|---|---|
| E | Exact Product/Variant identity, `rhino.product_class`, manufacturer/family/resource/warranty contracts when approved | Titles/tags as identity; family as ownership; candidate definition as live value; warranty decision |
| F | Approved machine Product presentation and approved resource projection | Replacement machine page, unapproved resource/content activation, owner identity |
| G | Exact current compatible-machine edges, reverse links, public consumable/reorder paths, current Product/Variant links | Compatibility from purchases/saves; recommendations from fit; stale/revoked edges |
| J | Native cart quantity, availability, partial-failure, and synchronization behavior | Treating historical quantity/price as current or bypassing cart reconciliation |
| K | Order/delivery status and bounded draft-order evidence patterns | Ownership, warranty, repair eligibility, or silent reuse of K app/backend for PO/account work |
| L | Approved registration/warranty/resource/privacy/service interfaces when available | Approving registration effect, warranty eligibility, serial policy, or private service disclosure; L remains constrained |
| P | Storewide form/intake/spam/routing/consent architecture | Creating registration/tax/dealer forms without P-compatible review |
| Q | App inventory, permissions, cost, performance, accessibility, ownership, export, and removal governance | Installing or selecting an app by implication |
| U | Consent-safe aggregate measurement and event governance | Putting customer/order/serial/ownership/service details in analytics |
| X | Account onboarding, transactional/marketing classification, audience, cadence, stop rules, content ownership | Activating messages or treating account creation as marketing consent |

H, I, M, and N remain deferred. O may preserve future identifiers/interfaces only. In particular, saved comparisons do not reactivate Epic I; manual links do not start Epic M; no review/social-proof work restarts N; and account entry does not start H search/filter work.

## Ownership and disclosure rules

- A purchaser may be a gift giver, institution contact, dealer, prior owner, or different account; purchase alone is not current ownership.
- A saved machine is a bookmark or interest state unless a separately approved verification process upgrades it.
- Registration is an intake fact; warranty eligibility depends on approved policy and evidence, not registration alone.
- A compatible Product edge answers an approved fit relation only. It does not authorize personalization or a recommendation.
- Account order history is Shopify commerce history. Private service history needs a system of record and field-level disclosure authority.
- Authentication proves a session identity, not the right to see every record associated with an email, order, serial, machine, household, company, or former owner.

## Product and custom-data implications

The canonical custom-data registry contains Product-owned facts/relations such as `product_class`, `machine_family`, `compatible_machines`, included/optional/recommended Products, and manual/support File references. It contains no CUSTOMER owner type. This is correct for public Product facts. Do not add serials, owners, registration, purchase evidence, warranty decisions, or service history to Product metafields.

If selected after O-PBI-002/003, customer/account state could use properly defined customer/order/company metafields for small scoped values or a private backend for richer records. Either choice requires definitions, Customer Account API scopes, protected-data approval where applicable, authorization, retention, deletion/export, audit, security, operational ownership, and Q governance. A metafield is storage, not an authorization model.

## App, plan, and operational cost assessment

Native account capability is preferred because it minimizes injected storefront code and separate identity handling. Cost analysis for any optional capability must include:

- current Shopify plan/contract and required upgrade delta;
- app subscription, usage, transaction, message, storage, and overage charges;
- custom development, protected-data review, hosting, monitoring, backups, security, incident response, and API maintenance;
- content/data operations, customer support, privacy requests, access reviews, vendor management, and accessibility QA;
- export/migration, uninstall, data deletion, rollback, and replacement cost.

Official list prices are dated observations, not a Rhino cost commitment. No external application is silently required: each PBI explicitly states whether native Shopify may suffice, an app/backend is conditional/likely, or no system is selected.

## Validation and evidence strategy

Planning validation should enforce unique IDs, allowed transitions, dependency integrity, 24-area coverage, explicit H/I/M/N deferral, ownership/warranty/disclosure invariants, false Admin/implementation authorization flags, named external-system requirements, and accountable blocking authorities. Negative fixtures should prove these guards fail.

Later implementation evidence should use synthetic/dev customer accounts, never real customer records in repository artifacts. It should cover cross-account denial, redirect/authentication, orders/addresses/reorder, exact Product/Variant drift, revoked compatibility, private record access, consent/stop rules, deletion/export, app outage/uninstall, accessibility, responsive/zoom, performance, readback, rollback, and monitoring. Live Shopify configuration can only be claimed after a current authorized read.

## Recommended Product Owner sequence

1. Review and accept or amend O-DEC-001–016 and the native-first MVP boundary.
2. Separately authorize O-PBI-001's exact read-only Admin audit if desired.
3. Resolve account mode/plan and decide whether native orders/addresses/Buy again are sufficient for MVP.
4. Prepare a separate implementation prompt for O-PBI-004/005 only; do not bundle ownership.
5. Evaluate saved machines/resources as a later conditional batch after O-PBI-002/003 and Epic L approvals.
6. Keep commercial and retention capabilities Deferred unless business evidence changes priority.

The smallest first implementation candidate is O-PBI-004 and O-PBI-005 after their gates. This is a proposal for Product Owner review, not implementation authorization.
