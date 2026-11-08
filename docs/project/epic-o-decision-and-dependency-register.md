# Epic O decision and dependency register

**Prepared:** 2026-11-07
**Status:** Proposed; unresolved means unknown, not declined or approved
**Authority boundary:** This register does not authorize implementation, Shopify Admin access/mutation, customer access, app installation, publication, messaging, deployment, commit, or push.

## Subsequent authorized decision record — 2026-11-07

The table below records later Product Owner authority without rewriting this register's dated proposal state. Full evidence and rationale are in `docs/project/epic-o-account-audit-and-decisions.md`; machine-readable authority is `docs/project/epic-o-authorization-record.json`.

| ID | Subsequent disposition | Evidence / boundary |
|---|---|---|
| O-DEC-001 | Resolved for the MVP implementation path: the canonical store returned `NEW_CUSTOMER_ACCOUNTS`, visible sign-in links, optional checkout login, and Basic/non-Plus plan state. | O-EVID-001; exact API version, active/draft configuration, Buy again visibility, account menu, apps/extensions, and Flow remain partly or wholly Unverified. No Admin mutation occurred. |
| O-DEC-002 | Approved: native Shopify orders, profile/addresses, account navigation/accessibility/mobile behavior, and Buy again are the Epic O MVP. | O-AUTH-001; this is not publication or production authorization. |
| O-PBI-003 architecture | Native Shopify functionality with no new application selected for the approved MVP. | Future UI-extension/backend options remain unapproved and require separate policy, privacy, cost, scope, operator, export, and removal decisions. |

O-DEC-003–016 remain unresolved or deferred except where the approved native MVP makes them non-blocking. In particular, no ownership, registration, serial, warranty, service, commercial-account, personalization, retention, measurement, or messaging policy was approved.

## Severity and evidence rules

- **Critical:** customer access, regulated/commercial behavior, privacy, warranty, or safe release cannot proceed.
- **High:** repository contracts may proceed, but activation/publication remains blocked.
- **Medium:** optional capability can remain Deferred without blocking the native MVP.
- A responsible role is an accountable decision authority, not proof that the role has approved the decision.
- Current official documentation establishes feasibility only. Current Rhino configuration requires authorized, dated, sanitized evidence.

## Product, policy, privacy, and architecture decisions

| ID | Decision / unknown | Affected PBIs | Required evidence | Responsible decision authority | Current disposition | Consequence while unresolved | Severity |
|---|---|---|---|---|---|---|---|
| O-DEC-001 | Which customer-account mode, sign-in state, accounts configuration, apps, B2B capability, and plan are active? | 001, 004, 005, 012–014, 020 | Current sanitized `CustomerAccountsV2`, plan/config/app read with store identity, pagination, timestamp, and zero mutations | Shopify Admin owner + Product Owner | Unresolved; repository has legacy templates only | Do not choose legacy/new implementation or claim native/B2B availability | Critical |
| O-DEC-002 | Is MVP limited to native orders, profile/addresses, navigation/accessibility/mobile, and Buy again? | 001, 004, 005 | Product Owner outcome/priority decision after O-PBI-001 | Product Owner | Unresolved; native-first recommendation proposed | No implementation batch may be prepared as approved | High |
| O-DEC-003 | What establishes current machine ownership, correction, transfer, revocation, dispute, and authorized viewing? | 002, 006, 008, 020 | Approved role/provenance/authorization policy and operating procedure | Product Owner + Legal + Privacy + Support | Unresolved; no ownership system | Saved/ordered machines cannot become verified ownership | Critical |
| O-DEC-004 | Are registration and serial collection necessary, and what effect, if any, do they have on warranty? | 002, 007, 010 | Approved policy, purpose/necessity, serial authority, and exact no-effect/effect wording | Legal + Business + Privacy + Support | Unresolved in Epic L | Registration/serial collection and warranty linkage remain Deferred | Critical |
| O-DEC-005 | What private system of record, field access, retention, deletion/export, audit, incident response, and operator govern ownership/service data? | 002, 006–008, 010, 011, 020 | Approved data-flow/security/privacy assessment and RACI | Privacy + Security + Legal + Support Operations | Unresolved; Epic L collection forbidden | No private data storage or disclosure implementation | Critical |
| O-DEC-006 | Which manuals/resources are current, rights-cleared, accessible, Product-mapped, and publication-approved? | 009 | Canonical resource/version approvals and Product mapping | Technical + Content + Product Data | 110 Epic L candidates; zero canonical publication approvals | Account may not label candidate files as approved manuals | High |
| O-DEC-007 | Which warranty policy/version/mapping and eligibility authority may produce customer status? | 007, 010 | Approved issuer/policy/mappings/triggers/transfer/proof/effective period | Legal + Business + Product Data + Support | Zero approved policies/mappings | Warranty status remains Deferred and fail-closed | Critical |
| O-DEC-008 | Is private support history valuable enough for a custom app/backend and mature operating process? | 011 | Customer/business value, support RACI, disclosure design, security/privacy review, three-year cost | Product Owner + Support + Privacy + Engineering | No system or value evidence | Keep support history Deferred | High |
| O-DEC-009 | Is there an approved dealer/wholesale program with eligibility, contracts, catalogs, pricing, terms, and owner? | 012 | Program charter, contracts, catalog/price/term ownership, suspension and support process | Business + Finance + Sales Operations + Legal | No approved program evidence | Keep B2B/dealer access Deferred even if plan supports it | High |
| O-DEC-010 | Who approves tax exemption evidence, jurisdictional rules, expiry/review, and corrections? | 013 | Finance/Tax procedure reviewed by Legal and Operations | Finance/Tax + Legal + Operations | Unknown | No customer/company tax setting changes | Critical |
| O-DEC-011 | Which PO intake, authority limits, payment terms, acceptance, invoice, and reconciliation workflow is approved? | 014 | Finance/Sales SOP and system boundary, including Epic K non-reuse decision | Finance + Sales Operations + Product Owner | Unknown | No PO/credit/draft-order workflow | High |
| O-DEC-012 | Which optional retention capabilities justify cost, data, privacy, accessibility, performance, and lock-in? | 003, 015–018 | Per-feature value hypothesis, no-build comparison, total cost, Q/U review | Product Owner + Privacy + Engineering + Marketing | No selection | Optional features stay Proposed/Deferred and outside MVP | Medium |
| O-DEC-013 | Which recommendation/reminder rules are approved and how are fit/warranty inferences prevented? | 008, 015, 019 | Source/eligibility/explanation/suppression contract with Product Data/Legal approval | Product Owner + Product Data + Legal | Unknown | No personalized recommendation or timing claim | High |
| O-DEC-014 | Which onboarding/reminder/stock message is transactional or marketing, and what consent, audience, cadence, and stop rules apply? | 016, 019 | Legal/privacy assessment, content/owner approval, Epic X interface | Privacy + Legal + Marketing + Epic X owner | Unknown | No subscription automation or send | Critical |
| O-DEC-015 | Which account app/custom service, if any, passes Q governance and has a funded operator/removal plan? | 003, 006, 008, 009, 011, 015–018, 020 | App/backend comparison, scopes, data review, costs, owner, export/uninstall/rollback proof | Product Owner + Epic Q owner + Engineering + Privacy | No app selected | No installation, extension, backend, or hidden dependency | High |
| O-DEC-016 | Which account events may be measured without exposing customer/order/serial/ownership/service data? | 018–020 | Epic U measurement plan, data classification, consent, aggregation, retention | Epic U owner + Privacy + Product Owner | Unknown | No account instrumentation or behavioral tracking | High |

## Technical, cross-Epic, and external dependencies

| ID | Dependency | Affected PBIs | Required evidence | Accountable authority | Current disposition | Safe next action | Severity |
|---|---|---|---|---|---|---|---|
| O-DEP-001 | Fresh sanitized read-only Shopify Admin evidence for account mode, plan, sign-in, configurations, apps, saved payment settings, and B2B availability | 001, 003–005, 012–014, 020 | Authorized bounded read with exact store identity, version, pagination, timestamp, redaction, and zero mutations | Shopify Admin owner + Engineering | Unverified; no Admin access authorized | Product Owner may separately authorize O-PBI-001 read-only plan | Critical |
| O-DEP-002 | Epic E exact Product/Variant/class/manufacturer/family/resource/warranty identity and approval evidence | 002, 006, 008–010, 015, 020 | Current E registry/readback/approval lifecycle | Epic E + Product Data | Partial; identity/class stronger than family/resource/warranty | Consume exact approved rows only; unknown fails closed | High |
| O-DEP-003 | Epic F machine presentation and approved Product resource projection | 006, 009, 020 | Current approved F projection and resource acceptance | Epic F + Product Data + Content | Partial; resource projections approval-constrained | Keep account presentation additive and conditional | High |
| O-DEP-004 | Epic G compatibility, parts/consumables, reverse links, reorder paths, and revocation evidence | 005, 008, 015, 019, 020 | Current eligible/revoked edge and Product/Variant state | Epic G + Product Data | Partial; some preview/revocation/production work remains | Reuse exact current edges and neutral fallback | High |
| O-DEP-005 | Epic J native cart quantity, availability, failure, and synchronization behavior | 005, 020 | Accepted J cart contracts and current regression evidence | Epic J + Engineering | Partial/proposed tracker state | Reuse J semantics; do not create second cart | High |
| O-DEP-006 | Epic K order/delivery status and draft-order boundary | 014, 020 | K scope/production reconciliation and explicit non-reuse decision | Epic K + Operations | Partial; K production record/evidence gaps remain | Do not infer ownership/warranty or repurpose K backend | High |
| O-DEP-007 | Epic L registration, warranty, privacy, resource, and service-record approvals | 002, 006, 007, 009–011, 020 | Approved L-DEC-001–010/015 and accepted data/resource contracts | Epic L + Legal + Privacy + Support | Blocked/approval-constrained | Proceed with interface planning only | Critical |
| O-DEP-008 | Epic P form/intake architecture | 007, 013, 020 | Approved fields, spam, routing, consent, retention, errors, success, accessibility, analytics, follow-up | Epic P + Privacy + Engineering | Not scheduled | Avoid creating isolated registration/tax forms | Medium |
| O-DEP-009 | Epic Q app governance | 003, 006, 008, 011, 015–018, 020 | Current app/Admin inventory, data/scopes, cost, performance, accessibility, ownership, export, uninstall | Epic Q + Product Owner + Engineering | Unverified | Complete Q review before any app choice/install | High |
| O-DEP-010 | Epic U privacy-aware measurement | 015–020 | Approved events/consent/data minimization/retention and no-PII tests | Epic U + Privacy | Unverified | Define outcomes first; no tracking code | High |
| O-DEP-011 | Epic X onboarding/follow-up | 016, 019, 020 | Approved purpose/content/audience/cadence/consent/stop/owner | Epic X + Privacy + Marketing | Unverified | Preserve interface only; no sends | High |
| O-DEP-012 | Official Shopify documentation and price/plan/API behavior remain current at implementation | 001, 003, 005, 012–014, 020 | Revalidated official sources and current API version/plan terms | Engineering + Shopify Admin owner | Documented 2026-11-07 only | Recheck immediately before implementation/plan decision | Medium |

## Epic L constraints carried into O

The following Epic L decisions remain unresolved and directly constrain Epic O:

- `L-DEC-003`: registration effect on warranty;
- `L-DEC-004`: proof-of-purchase rules and order-lookup authority;
- `L-DEC-009`: serial format, legacy handling, and duplicates;
- `L-DEC-010`: purpose, processor, access, retention, deletion/export, and recovery for private data;
- `L-DEC-015`: account mode and the value/cost of an owned-machine/service extension;
- `K-EVID-007`: contact/carrier-claims responsibility remains unresolved and must not become an account service promise.

Epic O can independently plan/verify native orders, addresses, navigation, accessibility/mobile behavior, and Buy again. It cannot independently approve warranty, registration, serial collection, private service history, or repair/shipping promises.

## Skipped-Epic deferral register

| Epic | Status in Epic O | Interface treatment |
|---|---|---|
| H | Deferred | No search/filter/collection implementation; future account discovery links consume existing routes only. |
| I | Deferred | O-PBI-018 preserves identifiers only; saved comparison meaning, facts, and UI stay with I post-O. |
| M | Deferred | O may link approved manuals/resources but does not start an education/content program. |
| N | Deferred | No reviews, ratings, testimonials, or social-proof work is planned in O. |

## Product Owner decision sequence

1. Confirm the native-first MVP hypothesis and assign authorities for O-DEC-001–016.
2. Decide whether to authorize the exact read-only O-PBI-001 Admin audit.
3. Review the resulting account-mode/plan evidence and approve or defer O-PBI-004/005.
4. Decide whether saved machines deserve a second funded architecture/privacy batch.
5. Leave all other capabilities Deferred unless their decision evidence and operating owner are ready.

No unresolved row should be changed to approved merely to satisfy a validator.
