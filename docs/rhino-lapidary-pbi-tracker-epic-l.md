# Rhino Lapidary Epic L PBI tracker

**Epic:** L — Warranty, Service, Repairs, and Support
**Prepared:** 2026-11-05
**Authority:** `docs/Rhino Lapidary Storefront Backlog and Epics.md`
**Status:** Proposed planning package; no implementation, Shopify mutation, app installation, email, publication, or production work authorized
**Discovery:** `docs/project/epic-l-discovery-and-context.md`
**Decisions:** `docs/project/epic-l-decision-and-dependency-register.md`
**Machine-readable registry:** `docs/project/epic-l-proposed-backlog.json`

## Tracker summary

Epic L contains 28 PBIs in six dependency-first batches. L1A has implemented the repository authority/evidence foundation for L-PBI-001 and prepared unresolved decision and audit packets for L-PBI-002 through L-PBI-005; none of those packets approves policy or proves current Shopify Admin state. Two long-term capabilities are explicitly Deferred.

| PBI | Title | Priority | Effort | Status | Evidence state | Batch | Primary responsibility |
|---|---|---:|:---:|---|---|:---:|---|
| L-PBI-001 | Establish the Epic L current-state and authority baseline | P0 | M | Implemented, awaiting verification | L1A contract and negative fixtures implemented; owner acceptance pending | L1 | Engineering/data governance |
| L-PBI-002 | Approve versioned warranty terms, roles, and product mappings | P0 | L | Proposed | Unresolved packet prepared; all owner approvals and mappings missing | L1 | Business/Legal/Product Data/Support |
| L-PBI-003 | Approve the service, repair, and repair-shipment operating model | P0 | L | Proposed | Unresolved packet prepared; K-EVID-007 and owner approvals missing | L1 | Support/Operations/Finance/Legal |
| L-PBI-004 | Approve support-intake privacy, retention, and access rules | P0 | M | Proposed | Unresolved data contract prepared; processors, owners, and lifecycle decisions missing | L1 | Privacy/Security/Support/Legal |
| L-PBI-005 | Audit current Shopify support, forms, account, and app capabilities | P1 | M | Ready for Product Owner review | Read-only plan prepared; connected audit not authorized or executed | L1 | Shopify Admin/Engineering |
| L-PBI-006 | Define additive support-resource and knowledge contracts | P0 | L | Proposed | Existing contract extension | L2 | Engineering/Product Data/Technical/Content |
| L-PBI-007 | Define support navigation and route ownership | P1 | M | Proposed | Partial routes exist | L2 | Content/Support/Admin/Engineering |
| L-PBI-008 | Publish governed warranty landing and product-specific warranty paths | P1 | L | Proposed | Blocked on warranty authority | L2 | Content/Legal/Product Data/Admin/Engineering |
| L-PBI-009 | Publish approved support channels, hours, and response expectations | P1 | M | Proposed | Blocked on staffing decisions | L2 | Support/Business/Content/Admin |
| L-PBI-010 | Add machine-page support-resource entry points | P1 | M | Proposed | Fixture-only renderer exists | L2 | Engineering/Content/Product Data |
| L-PBI-011 | Canonicalize manuals, diagrams, and setup-resource inventory | P0 | L | Proposed | 110 candidates; zero approved | L3 | Technical/Media/Content/Product Data/Support |
| L-PBI-012 | Deliver an accessible machine-resource library and identification path | P1 | L | Proposed | Partial manual Pages exist | L3 | Engineering/Content/Admin/Technical |
| L-PBI-013 | Publish governed maintenance, cleaning, and setup guidance | P1 | L | Proposed | Approved content absent | L3 | Technical/Safety/Content/Support |
| L-PBI-014 | Deliver symptom-based troubleshooting with safety escalation | P0 | XL | Proposed | Approved diagnostics absent | L3 | Technical/Safety/Legal/Support/Engineering |
| L-PBI-015 | Integrate replacement-parts lookup with approved compatibility | P1 | M | Proposed | Reuse Epic G contracts | L3 | Product Data/Support/Engineering |
| L-PBI-016 | Define support treatment for legacy and discontinued machines | P2 | L | Proposed | Lifecycle policy absent | L3 | Business/Product Data/Technical/Support |
| L-PBI-017 | Select and prove a native-first service-intake architecture | P0 | M | Proposed | Feasible; Admin audit required | L4 | Engineering/Admin/Privacy/Support |
| L-PBI-018 | Implement structured warranty, repair, and technical-support intake | P1 | L | Proposed | Blocked on policy/architecture | L4 | Engineering/Admin/Support/Privacy |
| L-PBI-019 | Implement secure purchase-evidence and diagnostic uploads | P0 | L | Proposed | Privacy/storage decisions required | L4 | Privacy/Security/Support/Admin/Engineering |
| L-PBI-020 | Implement staff categorization, routing, deduplication, and recovery | P1 | L | Proposed | Workflow owner required | L4 | Support Operations/Admin/Engineering |
| L-PBI-021 | Implement warranty registration after policy approval | P2 | L | Proposed | Registration policy unapproved | L4 | Business/Legal/Support/Privacy/Admin |
| L-PBI-022 | Evaluate and govern Shopify Inbox and common-question automation | P2 | M | Proposed | Current configuration unverified | L5 | Support/Content/Admin/Privacy |
| L-PBI-023 | Define the customer-account owned-machine and service-resource interface | P3 | XL | Deferred | Epic O interface; custom app likely | L5 | Epic O/Engineering/Privacy/Support |
| L-PBI-024 | Deliver approved post-purchase support onboarding | P2 | L | Proposed | Epic X interface/content/consent needed | L5 | Epic X/Content/Support/Privacy/Admin |
| L-PBI-025 | Evaluate a dealer and service-center directory | P3 | L | Deferred | Program/eligibility unapproved | L5 | Business/Support/Legal/Content |
| L-PBI-026 | Establish recall and safety-notice capability | P1 | L | Proposed | Ownership/process absent | L5 | Safety/Legal/Business/Product Data/Support |
| L-PBI-027 | Define privacy-aware support measurement and event governance | P2 | M | Proposed | Epic U interface required | L6 | Epic U/Privacy/Support/Product |
| L-PBI-028 | Run integrated Epic L acceptance and release readiness | P0 | XL | Proposed | Final gate not started | L6 | QA/Security/Accessibility/Performance/Operations |

## Status rules

- **Proposed:** sufficiently described for review but not authorized.
- **Ready for Product Owner review:** discovery evidence is assembled; approval is still required.
- **Approved:** Product Owner accepts scope/priority, not implementation or publication by itself.
- **Ready for implementation:** all named evidence and human gates for the bounded PBI are satisfied.
- **Implemented, awaiting verification:** code/Admin/content/operations work exists but acceptance is incomplete.
- **Complete:** all acceptance evidence, including human gates, is linked.
- **Blocked:** an approved/in-progress PBI cannot proceed because a named dependency is missing.
- **Deferred:** intentionally outside the active milestone.

## Implementation batches

### Batch 1 — Discovery, policies, and source governance

- **Goal:** establish current authority, warranty/service decisions, privacy boundaries, and native capability evidence without customer-facing work.
- **PBIs:** 001–005.
- **Prerequisites:** current repository; no warranty/service answer is assumed.
- **Product Owner decisions:** name decision owners; authorize only a read-only Admin audit if desired.
- **Deliverables:** authority/current-state contract, warranty/service decision packets, privacy data-flow/retention contract, sanitized capability audit.
- **Automated validation:** unique source/decision IDs, stale-evidence rejection, zero unsupported approvals, read-only operation inventory, secret scan.
- **Admin/operations work:** read-only queries only under separate authorization; human policy/SOP review.
- **Exit:** decisions are Approved or explicitly unresolved; no unknown is converted to a promise.
- **Risk:** legacy policy and app/channel observations may be mistaken for current approval.

#### L1A repository foundation record

- **Implemented artifacts:** five data contracts with paired schemas, `scripts/validate-epic-l-l1a.js`, deterministic fixtures in `scripts/test-epic-l-l1a.js`, and `docs/project/implementation-records/epic-l-l1a-foundation.md`.
- **Boundary:** repository contracts and preparation only. No Shopify query, customer record, policy approval, customer-facing feature, publication, deployment, commit, or push is evidenced.
- **Remaining gate:** Product Owner acceptance of the authority hierarchy and named decision owners; approved warranty/service/privacy evidence; accepted `K-EVID-007`; and separate authorization for any connected read-only Admin audit.

### Batch 2 — Support information architecture

- **Goal:** define one reusable support model and governed entry points.
- **PBIs:** 006–010.
- **Prerequisites:** applicable L1 authority/privacy decisions.
- **Product Owner decisions:** route ownership, warranty publication scope, contact/SLA copy.
- **Deliverables:** additive data contract, route/navigation contract, approved page/content plans, machine-page projection plan.
- **Automated validation:** schema/reference validation, blocked-claim detection, route/link tests, safe missing-data suppression.
- **Admin/operations work:** Page/navigation/content creation only after separate approval.
- **Exit:** every rendered route/resource/claim has a current owner and source; fallback remains neutral.
- **Risk:** duplicating Epic E/F/C/D or presenting a route as policy approval.

### Batch 3 — Machine resources and troubleshooting

- **Goal:** approve and expose practical, versioned resources and safe diagnostic pathways.
- **PBIs:** 011–016.
- **Prerequisites:** L-PBI-006 contract; technical/media owners; relevant Epic G scope.
- **Product Owner decisions:** resource review batches, technical/safety approvals, discontinued support levels.
- **Deliverables:** canonical resource register, accessible library, approved guides, symptom taxonomy, parts integration, lifecycle status contract.
- **Automated validation:** File/revision/language/rights/mapping checks; broken/duplicate/orphan detection; compatibility validation; accessibility tests.
- **Admin/operations work:** File/Page/article publication and Product value population require separate mutation plans and readback.
- **Exit:** resources are current, approved, accessible, mapped, recoverable, and do not imply unsupported fit/service.
- **Risk:** unsafe instructions, stale manuals, inaccessible PDFs, and false parts compatibility.

### Batch 4 — Service and warranty intake

- **Goal:** capture only necessary structured requests and route them reliably.
- **PBIs:** 017–021.
- **Prerequisites:** approved policy/SOP/privacy contract and fresh native-capability audit.
- **Product Owner decisions:** architecture, fields, upload necessity, registration effect, owners/notifications.
- **Deliverables:** proven intake architecture, form contracts, upload controls, workflow/recovery contract, optional registration.
- **Automated validation:** field/schema tests; consent/data-minimization checks; spam/duplicate/retry/uncertain/upload/routing failure fixtures; accessibility/mobile.
- **Admin/operations work:** Forms/Flow/app configuration and staff workflow training only after explicit authorization.
- **Exit:** submissions are categorized, private, recoverable, traceable, and never promise eligibility or turnaround.
- **Risk:** PII leakage, duplicate tickets, orphan uploads, silent routing failures, customer-record side effects.

### Batch 5 — Ownership support and operational extensions

- **Goal:** assess higher-maturity chat, account, onboarding, directory, and safety capabilities.
- **PBIs:** 022–026.
- **Prerequisites:** stable L2–L4 foundations and cross-Epic owners.
- **Product Owner decisions:** which optional capabilities enter the milestone; app/backend cost and ownership.
- **Deliverables:** feasibility/decision records or bounded implementation plans; safety-notice contract.
- **Automated validation:** prohibited-answer tests, account authorization, email audience/stop rules, directory expiry, safety-notice coverage/audit tests.
- **Admin/operations work:** Inbox/account/Messaging configuration requires separate approval; directory and recall require named operators.
- **Exit:** optional capabilities are Approved, Deferred, or Rejected with evidence; safety ownership is explicit.
- **Risk:** AI overclaim, unauthorized service-record access, marketing-consent error, stale partner listings.

### Batch 6 — Acceptance, measurement, and release

- **Goal:** define success measures and prove the bounded release across repository, Admin, content, operations, and customer experience.
- **PBIs:** 027–028.
- **Prerequisites:** selected implementation scope complete; operational owners trained; rollback ready.
- **Product Owner decisions:** event approval, release scope, production authorization.
- **Deliverables:** measurement plan, integrated evidence packet, release manifest/readback, rollback and monitoring plan.
- **Automated validation:** all applicable validators, Playwright matrices, claims/privacy/security/performance checks, exact Admin/theme readback.
- **Admin/operations work:** human workflow drill, privacy/legal acceptance, release-window read-only refresh, separately authorized production actions.
- **Exit:** all selected PBIs have evidence; deferred items remain explicit; rollback is executable; no live mutation inferred from tests.
- **Risk:** collapsing repository pass, operational readiness, and production release into one green status.

## L-PBI-001 — Establish the Epic L current-state and authority baseline

**Status:** Implemented, awaiting verification
**Evidence state:** L1A contract and negative fixtures implemented; Product Owner authority acceptance and fresh Admin evidence pending
**Implementation owner / responsibility class:** Engineering and data governance / repository
**Epic:** L
**Work area:** Repository
**Implementation mode:** Contract and read-only audit
**Type:** Discovery
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:governance`, `status:proposed`

### Problem or opportunity

Epic L spans older plans, current contracts, Shopify state, operational policy, and private customer data. Without one source hierarchy, historical documents or route existence could be mistaken for approval.

### Evidence

`data/epic-e-warranty-support-evidence.json` has 122 blocked mappings and zero approvals; `data/epic-e-resource-catalog.json` has 110 candidates and zero canonical approvals; the machine projection is fixture-only. See `docs/project/epic-l-discovery-and-context.md`.

### Proposed outcome

Create an executable Epic L authority/current-state contract that binds sources, observation dates, approval states, owner roles, and safe suppression rules.

### Scope / exclusions

Include source hierarchy, exact identity references, drift/freshness policy, ownership, and downstream interfaces. Exclude policy approval, content publication, Shopify mutation, and customer feature work.

### Acceptance criteria

- [x] Every Epic L domain has one authority or an explicit unknown owner/evidence state.
- [x] Observed, proposed, approved, implemented, verified, released, and retired states cannot be conflated.
- [x] Unknown/stale/conflicting data fails closed without inventing a customer claim.
- [x] A read-only current-state refresh plan lists every query and proves zero mutations/secrets.

### Architecture / implementation considerations

Extend Epic E/F/G registry and evidence lifecycle conventions. Do not create a second Product, compatibility, or resource registry.

### Dependencies and external decisions

Product Owner accepts the source hierarchy and names missing business/technical owners.

### Risks and cautions

Regenerating evidence must not silently renew an expired approval.

### Testing requirements

Negative fixtures for stale sources, revoked approvals, orphan references, partial pagination, and accidental authorization flags.

### Success measure

Every later PBI can deterministically explain why a fact may render, must suppress, or needs human approval.

### Open Product Owner questions

Who is accountable for Epic L policy, technical content, support operations, privacy, and release acceptance?

## L-PBI-002 — Approve versioned warranty terms, roles, and product mappings

**Status:** Proposed
**Evidence state:** Unresolved versioned packet prepared; all owner approvals, policy versions, and Product mappings remain missing
**Implementation owner / responsibility class:** Business, Legal, Product Data, Support / policy and content
**Epic:** L
**Work area:** Content / Operations / Repository
**Implementation mode:** Human decision and governed data
**Type:** Discovery
**Priority:** P0
**Impact:** Transformative
**Effort:** L
**Confidence:** High in gap; Low in final terms
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:warranty`, `needs:legal`

### Problem or opportunity

Customers cannot receive reliable warranty information because current issuer, administrator, coverage, duration, exclusions, remedies, and Product mappings are unapproved.

### Evidence

Epic E records four historical class candidates, zero approved policy versions/classes/mappings, and 122 blocked Products. `docs/brand/rhino-legal-claims-rules.md` forbids a universal duration.

### Proposed outcome

Approve a versioned policy/role/class/mapping package sufficient for safe pre-purchase and intake use.

### Scope / exclusions

Include entity roles, effective dates, covered scope, trigger, duration, exclusions, proof requirements, remedies, transport responsibility, geography, transferability, registration effect, review/retirement. Exclude page/theme/form implementation.

### Acceptance criteria

- [ ] Required Business, Legal, Product Data, Support, and Product Owner approvals are recorded.
- [ ] Each approved Product/class mapping references one current policy version and effective period.
- [x] Exceptions and unmapped Products remain explicit and customer-safe.
- [x] Historical PDF text is never promoted by filename or age alone.
- [x] Machine checks reject universal, expired, contradictory, or unmapped warranty claims.

### Architecture / implementation considerations

Reuse the Epic E policy/class/mapping model. Add Shopify custom data only after approved use and simpler Page/Product reference options are assessed.

### Dependencies and external decisions

L-DEC-001 through L-DEC-004.

### Risks and cautions

Warranty copy is a Class 3 customer promise; omission is safer than unsupported reassurance.

### Testing requirements

Policy schema, coverage completeness, mapping uniqueness, version/effective-date, role, exception, and prohibited-copy tests.

### Success measure

Every published warranty statement resolves to current approved terms and exact applicability.

### Open Product Owner questions

Who issues/administers coverage, and does registration affect coverage?

## L-PBI-003 — Approve the service, repair, and repair-shipment operating model

**Status:** Proposed
**Evidence state:** Unresolved lifecycle/responsibility packet prepared; owner approvals and K-EVID-007 remain blocked
**Implementation owner / responsibility class:** Support, Operations, Finance, Legal / operations
**Epic:** L
**Work area:** Operations / Content
**Implementation mode:** SOP and responsibility approval
**Type:** Discovery
**Priority:** P0
**Impact:** Transformative
**Effort:** L
**Confidence:** High in gap
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:service`, `needs:operations`

### Problem or opportunity

A form cannot compensate for an undefined service lifecycle. Staff and customers need approved eligibility, diagnosis, authorization, pricing, shipment, status, and closure rules.

### Evidence

`data/footer-support-resources.json#repair-service-destination` is blocked. `K-EVID-007` lacks designated contact, carrier filing responsibility, and internal process. Support hours/response promises are unapproved.

### Proposed outcome

Approve one service/repair lifecycle and RACI, including a bounded interface to Epic K for shipment/claims responsibility.

### Scope / exclusions

Include intake eligibility, remote diagnostics, safety stop/escalation, authorization/RMA if used, estimates, customer approval, labor/parts, packaging, freight/insurance, received/diagnosis/awaiting approval/repair/return/closed states, communication and record retention. Exclude configuring shipping rates and implementing a ticket system.

### Acceptance criteria

- [ ] Every lifecycle state has owner, entry/exit rule, customer message, and recovery path.
- [x] Repair shipment and carrier claim responsibilities satisfy or explicitly block K-EVID-007.
- [x] No turnaround, eligibility, price, coverage, or parts promise exists without evidence.
- [ ] Safety-critical cases have an approved escalation and do not rely on ordinary response targets.

### Architecture / implementation considerations

Model operations before selecting Forms/Flow/app architecture. Keep quotation Draft Orders separate from service records.

### Dependencies and external decisions

L-DEC-005 through L-DEC-008; K evidence owners.

### Risks and cautions

Publishing packing/diagnostic instructions without technical approval could cause damage or injury.

### Testing requirements

Tabletop scenarios for eligible/ineligible/unknown, safety, shipping damage, no-response, declined estimate, lost shipment, and closure.

### Success measure

Staff can process a representative request without reconstructing policy or inventing a commitment.

### Open Product Owner questions

Which entity repairs, prices, authorizes, and owns inbound/outbound shipment risk?

## L-PBI-004 — Approve support-intake privacy, retention, and access rules

**Status:** Proposed
**Evidence state:** Unresolved data inventory/flow contract prepared; purposes, processors, owners, access, retention, deletion/export, and recovery remain unapproved
**Implementation owner / responsibility class:** Privacy, Security, Support, Legal / governance
**Epic:** L
**Work area:** Operations / App / Repository
**Implementation mode:** Data-flow and retention approval
**Type:** Discovery
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:privacy`, `security`

### Problem or opportunity

Serials, order details, photos, proof of purchase, and service history can expose personal or commercially sensitive information if collected without a minimum-data and lifecycle policy.

### Evidence

`docs/brand/rhino-form-and-state-patterns.md` requires purpose/recipient/storage/retention disclosure; `docs/privacy/security-privacy-review-checklist.md` applies to forms, chat, apps, accounts, and uploads.

### Proposed outcome

Approve a data inventory, lawful/operational purpose, access model, processor map, retention/deletion/export schedule, logging/redaction rules, and recovery owner.

### Scope / exclusions

Include every proposed field/file/status/notification/log/metric and anonymous/authenticated behavior. Exclude selecting or enabling a vendor before requirements are approved.

### Acceptance criteria

- [ ] Every data element is required/optional with purpose, system, recipient, access, retention, deletion/export, and failure behavior.
- [x] Public Product/resource data is separated from private customer/service data.
- [x] Secrets, documents, serials, contact data, and authenticated URLs are prohibited from logs, analytics, screenshots, and theme settings.
- [ ] Upload necessity and safer order-lookup alternatives are evaluated.

### Architecture / implementation considerations

Account/service data should use authorized server-side systems; public metafields/metaobjects are inappropriate for private records.

### Dependencies and external decisions

Privacy/Security/Legal owners and actual processors.

### Risks and cautions

Forms may create/match customer profiles; deletion of a form is not necessarily deletion of all submitted data.

### Testing requirements

Data-minimization assertions, log/URL redaction, staff authorization, retention/deletion/export drills, and failure artifact review.

### Success measure

No proposed field exists without a documented need and lifecycle.

### Open Product Owner questions

How long must service records and uploaded evidence be retained, and who may access them?

## L-PBI-005 — Audit current Shopify support, forms, account, and app capabilities

**Status:** Ready for Product Owner review
**Evidence state:** Deterministic read-only audit plan prepared; connected audit remains unauthorized and unexecuted
**Implementation owner / responsibility class:** Shopify Admin and Engineering / read-only configuration audit
**Epic:** L
**Work area:** Shopify Admin / App / Repository
**Implementation mode:** Read-only audit
**Type:** Research
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:shopify-admin`, `read-only`

### Problem or opportunity

Repository code cannot prove enabled Apps, Forms, Flow workflows, Inbox, Messaging, app embeds, Files/Pages, policies, customer-account mode, or plan-limited features.

### Evidence

`docs/apps/app-register.md` lists only Search & Discovery as an unaudited candidate. Older fixtures show an Inbox publication but no current configuration. Theme code contains legacy customer templates.

### Proposed outcome

Produce a sanitized, complete, current, read-only capability and dependency audit with cost, permissions, data, injection, limits, export, accessibility, performance, ownership, and removal path.

### Scope / exclusions

Include Forms, Flow, Inbox, Messaging, customer accounts, apps/embeds, Pages, Files, policies, notifications, plan/version. Exclude install, enable, edit, send, submit, or mutation actions.

### Acceptance criteria

- [ ] Canonical store identity, account mode, plan-relevant limits, pagination, timestamps, and query failures are explicit.
- [ ] Every installed/enabled/inferred capability is reconciled with app/editor/privacy registers.
- [x] Operation inventory proves zero writes and sanitized output contains no secrets/customer data.
- [ ] Feasibility conclusions distinguish available, configured, active, tested, and approved.

### Architecture / implementation considerations

Use official current Shopify documentation and least-privilege read-only queries. Store app/editor state outside theme assumptions.

### Dependencies and external decisions

Separate Product Owner/Admin authorization for connected read-only access.

### Risks and cautions

Publication channels and installed apps do not prove a widget/workflow is enabled or suitable.

### Testing requirements

Fixture tests for pagination, access denied, missing app, plan limit, redaction, and no mutation operations.

### Success measure

Architecture selection relies on current facts rather than app assumptions.

### Open Product Owner questions

May a separately bounded read-only Admin audit be scheduled, and who owns app costs/configuration?

## L-PBI-006 — Define additive support-resource and knowledge contracts

**Status:** Proposed
**Evidence state:** Existing contract extension
**Implementation owner / responsibility class:** Engineering, Product Data, Technical, Content / repository architecture
**Epic:** L
**Work area:** Repository
**Implementation mode:** Data and content contract
**Type:** Improvement
**Priority:** P0
**Impact:** Transformative
**Effort:** L
**Confidence:** High
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:data`, `area:support`

### Problem or opportunity

Epic E/F model Files and fixture projections, but L also needs policy versions, resource lifecycle, knowledge article/procedure semantics, symptoms, support status, and private request interfaces without redundant models.

### Evidence

`CD-MF-041`–`045`, `CD-MO-001`, `CD-MF-034`, and `data/epic-f-support-resources-contract.json` are reusable. Warranty custom data is deliberately not justified yet.

### Proposed outcome

An additive contract maps exact Products/families/resources/articles/policies and distinguishes public knowledge, internal support files, private requests, and service status.

### Scope / exclusions

Define identity, lifecycle, revision/effective dates, audience, language, accessibility, approval, supersession, and relationships. Exclude real values, Shopify definition creation, content authoring, and service backend implementation.

### Acceptance criteria

- [ ] Existing E/F/G authorities remain canonical and unchanged.
- [ ] Serial, purchase evidence, request, and service records are explicitly private and outside public Product data.
- [ ] Pages/blogs/Files/metaobjects are selected by actual reuse/lifecycle need, not preference.
- [ ] Unknown, obsolete, superseded, internal, or unapproved records cannot render.
- [ ] The contract represents current/legacy/discontinued/unknown without promising support.

### Architecture / implementation considerations

Prefer references over copied names/URLs. `support_files` remains Admin-only. A new metaobject requires a concrete reusable entity and owner.

### Dependencies and external decisions

001–004; L-DEC-009/011–013.

### Risks and cautions

Over-modeling creates Admin burden; under-modeling loses version/audit safety.

### Testing requirements

Schema, uniqueness, referential integrity, lifecycle transition, audience, version, orphan, duplicate, and safe-suppression fixtures.

### Success measure

Later features consume one contract and cannot bypass approval/lifecycle rules.

### Open Product Owner questions

Which knowledge resources need structured reuse versus ordinary governed Pages/articles?

## L-PBI-007 — Define support navigation and route ownership

**Status:** Proposed
**Evidence state:** Partial routes exist
**Implementation owner / responsibility class:** Content, Support, Shopify Admin, Engineering / IA
**Epic:** L
**Work area:** Repository / Shopify Admin / Content
**Implementation mode:** Route contract before Admin changes
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:navigation`, `area:support`

### Problem or opportunity

Customers can reach Contact and Manuals, but no approved Support/Warranty/Repair IA exists and older planned routes must not be treated as live.

### Evidence

`data/navigation-spec.json`, `data/global-navigation-ia.json`, and `data/footer-support-resources.json` govern Contact/manual routes and block Support/Warranty/Repair/parts-help destinations.

### Proposed outcome

Define a minimal support IA for prospective buyers, current owners, problems, requests, legacy equipment, and safety notices, with one owner per destination.

### Scope / exclusions

Include route identity, labels, entry points, breadcrumbs, fallback, missing/retired behavior, search ownership, mobile/desktop/footer/product/homepage relationships. Exclude Admin menu/Page creation and general Epic H/M search/content work.

### Acceptance criteria

- [ ] Every route has destination identity, purpose, owner, state, prerequisites, and rollback.
- [ ] Contact/Manuals are reused; no duplicate destination competes.
- [ ] Blocked routes cannot render in header/footer/homepage/product surfaces.
- [ ] Retired/renamed routes have approved redirects and no broken links.

### Architecture / implementation considerations

Extend C/D registers and validators. Keep labels neutral until policy/content is approved.

### Dependencies and external decisions

006 plus content/Support/Admin ownership.

### Risks and cautions

A Support label can imply service availability even when its destination is only generic contact.

### Testing requirements

Static route validation, anonymous/password/404 checks, keyboard/mobile navigation, breadcrumbs, sitemap/canonical/broken-link checks.

### Success measure

Customers reach the right approved path without dead ends or false promises.

### Open Product Owner questions

Should the initial hub be one Support Page, Manuals plus Contact, or another minimal approved structure?

## L-PBI-008 — Publish governed warranty landing and product-specific warranty paths

**Status:** Proposed
**Evidence state:** Blocked on warranty authority
**Implementation owner / responsibility class:** Content, Legal, Product Data, Admin, Engineering / mixed
**Epic:** L
**Work area:** Content / Shopify Admin / Repository
**Implementation mode:** Page/content plus conditional Product projection
**Type:** Feature
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Medium
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:warranty`, `needs:legal`

### Problem or opportunity

Prospective and current owners lack an approved warranty destination and Product-specific applicability.

### Evidence

`/pages/warranty` is blocked; the machine support renderer is fixture-only; Product mapping approvals are zero.

### Proposed outcome

Publish a versioned warranty landing experience and show Product-specific summaries/actions only when exact approved mappings exist.

### Scope / exclusions

Include full terms, effective/version metadata, entity roles, accessible summary, applicable Product path, exceptions, proof/transport disclosures, contact action, superseded policy handling. Exclude registration/intake and invented terms for unmapped Products.

### Acceptance criteria

- [ ] All customer wording matches L-PBI-002 approved policy/version/mapping.
- [ ] Unmapped/expired/conflicting Products show no duration or eligibility claim and retain a neutral contact path.
- [ ] Summary does not replace full terms; policy version/effective date is discoverable.
- [ ] Product page, page, metadata, structured data, cart, and locale scans contain no unapproved claims.

### Architecture / implementation considerations

Reuse Page/policy content and F projection; create custom data only when the approved mapping contract requires it.

### Dependencies and external decisions

002, 006, 007; Legal/Content/Admin release approvals.

### Risks and cautions

Highest risk is compressing exceptions into a misleading trust badge.

### Testing requirements

Mapped/unmapped/expired/exception fixtures; content diff; links; accessibility/zoom/mobile; claims validator; Admin readback.

### Success measure

Every supported Product exposes accurate terms; unsupported Products make no warranty promise.

### Open Product Owner questions

Which Products/classes enter the first publication batch?

## L-PBI-009 — Publish approved support channels, hours, and response expectations

**Status:** Proposed
**Evidence state:** Blocked on staffing decisions
**Implementation owner / responsibility class:** Support, Business, Content, Shopify Admin / operations-content
**Epic:** L
**Work area:** Content / Operations / Shopify Admin
**Implementation mode:** Operational approval then content
**Type:** Content
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:support`, `needs:operations`

### Problem or opportunity

Customers need a real contact path and expectations, but publishing unstaffed hours or an unsupported response SLA creates more harm.

### Evidence

Contact is approved only as a neutral route. Historical phone/email and “respond quickly” wording remain review-gated. Inbox hours/configuration are unknown.

### Proposed outcome

Publish only approved channels, staffed hours/time zone/holiday behavior, category scope, response wording, accessibility alternatives, and safety escalation.

### Scope / exclusions

Include human ownership and stale-contact review. Exclude chat enablement, ticket backend, and a guaranteed resolution time unless explicitly approved.

### Acceptance criteria

- [ ] Every channel has owner, staffing coverage, escalation, and review date.
- [ ] Response wording is evidence-backed and distinguishes receipt from resolution.
- [ ] Safety/emergency copy does not imply continuous monitoring.
- [ ] Contact data is consistent across support, footer, policies, Inbox, emails, and structured data.

### Architecture / implementation considerations

Keep editable operational content in an appropriate governed Admin/Page setting; avoid duplicating phone/email in many Liquid files.

### Dependencies and external decisions

003, 007; L-DEC-007.

### Risks and cautions

Default Inbox “always available” must not be presented as staffed availability without review.

### Testing requirements

Cross-surface consistency, timezone/holiday review, link/tel/mail tests, screen-reader labels, offline/closed state.

### Success measure

Customers can choose a current channel and understand what happens next.

### Open Product Owner questions

Which channels are actually staffed, when, and what response statement can operations meet?

## L-PBI-010 — Add machine-page support-resource entry points

**Status:** Proposed
**Evidence state:** Fixture-only renderer exists
**Implementation owner / responsibility class:** Engineering, Content, Product Data / theme
**Epic:** L
**Work area:** Repository / Content
**Implementation mode:** Extend existing F projection
**Type:** Feature
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:product-page`, `area:support`

### Problem or opportunity

Machine pages have a neutral Contact block but cannot expose approved warranty/manual/service resources on a real host.

### Evidence

`snippets/rhino-product-support-resources-projection.liquid` supplies `nil`; both resource/support snippets require `machine.local` and fixture grants.

### Proposed outcome

Activate a safe, conditional Product support entry that consumes approved L/E resources and routes while preserving F machine behavior.

### Scope / exclusions

Include support hub/manual/warranty actions, selected Variant/Product context where safe, empty/blocked suppression, accessibility, and optional current-resource list. Exclude unapproved resources, private `support_files`, form submission, or new machine template.

### Acceptance criteria

- [ ] Only exact, current, customer-visible, approved resources/routes render.
- [ ] Missing/blocked data emits no empty heading, false claim, or broken link.
- [ ] Native Product identity/purchase/gallery/cart behavior and F/G projections do not regress.
- [ ] Context passed to later intake is allowlisted, visible/editable, escaped, and not authority.

### Architecture / implementation considerations

Extend the existing projection/snippets and locale/style contracts. Repair the Epic F sealed-source drift additively first.

### Dependencies and external decisions

006–009; L-DEP-003.

### Risks and cautions

Shared product changes can affect non-machine pages and live commerce.

### Testing requirements

Fixture and actual preview tests for positive/missing/expired/private resources; F/G regressions; 320–1440, keyboard, zoom, axe, performance.

### Success measure

Supported machines expose useful approved paths; unsupported states remain clean and honest.

### Open Product Owner questions

Which resource/action is the first independently useful machine-page release?

## L-PBI-011 — Canonicalize manuals, diagrams, and setup-resource inventory

**Status:** Proposed
**Evidence state:** 110 candidates; zero canonical/publication approvals
**Implementation owner / responsibility class:** Technical, Media, Content, Product Data, Support / evidence-content
**Epic:** L
**Work area:** Repository / Content / Shopify Admin
**Implementation mode:** Review and migration plan
**Type:** Content
**Priority:** P0
**Impact:** High
**Effort:** L
**Confidence:** High
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:resources`, `needs:technical-review`

### Problem or opportunity

Rhino owns a substantial document corpus, but no candidate is proven canonical, current, correctly mapped, publishable, or accessible.

### Evidence

`data/epic-e-resource-catalog.json`: 28 diagrams, 4 manuals, 39 support files, 39 videos; 74 File GIDs; 106 support-only, 4 internal; zero canonical/publication approvals.

### Proposed outcome

Approve a bounded canonical resource set with exact identity, revision, Product/model, audience, rights, language, accessibility, and replacement state.

### Scope / exclusions

Include duplicate comparison, hidden manual Pages, Shopify Files, repo documents, source digests, revision dates, owner review, supersession, accessible alternative/remediation. Exclude publication/upload/value population until a mutation plan is approved.

### Acceptance criteria

- [ ] Every reviewed resource is Approved, Rejected, Superseded, Internal, or Needs review with rationale.
- [ ] Canonical selection never relies only on filename, upload date, HTTP 200, hash, or candidate model label.
- [ ] Exact Product/model mapping and rights/publication/language/version/accessibility decisions are recorded.
- [ ] Missing manuals remain explicit rather than filled from a similar model.

### Architecture / implementation considerations

Reuse E resource catalog and file-reference definitions; preserve File GID/binary identity and before-state.

### Dependencies and external decisions

006; L-DEC-011/012; named technical/media owners.

### Risks and cautions

Legacy technical content may be unsafe or apply to a different revision.

### Testing requirements

Duplicate/orphan/version/language/rights/accessibility/reference validation and negative mapping fixtures.

### Success measure

A first resource batch can be published without guessing applicability or version.

### Open Product Owner questions

Which machine families/models should be reviewed first, and who signs technical accuracy?

## L-PBI-012 — Deliver an accessible machine-resource library and identification path

**Status:** Proposed
**Evidence state:** Partial manual Pages exist
**Implementation owner / responsibility class:** Engineering, Content, Admin, Technical / mixed
**Epic:** L
**Work area:** Repository / Shopify Admin / Content
**Implementation mode:** Page/library after resource approval
**Type:** Feature
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Medium
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:manuals`, `accessibility`

### Problem or opportunity

Owners need to identify their machine and locate the correct current resources without guessing by a filename or broad family label.

### Evidence

`/pages/manuals` was previously preview-verified; three manual routes are approved at route level and seven are hidden. Family instances are absent.

### Proposed outcome

Provide a responsive, searchable/browsable library organized by exact model/Product with explicit current/legacy status and accessible resource delivery.

### Scope / exclusions

Include model identification cues from approved Product data, resource type/version/language/format, HTML alternatives or remediation status, missing-resource contact fallback, print/download behavior. Exclude unsupported family inference, general education search, and interactive diagrams.

### Acceptance criteria

- [ ] Every link resolves to an L-PBI-011 approved current customer resource.
- [ ] Current/legacy/superseded status and applicable model are unambiguous.
- [ ] PDFs/documents meet accessibility acceptance or have a documented equivalent/exception.
- [ ] No-resource and unknown-model states lead to neutral help without an availability promise.

### Architecture / implementation considerations

Prefer native Page/article + governed File links; add structure only for sustainable filtering/version needs.

### Dependencies and external decisions

007, 011; H/M interface for later search/content.

### Risks and cautions

Accessible page chrome does not make an inaccessible PDF acceptable.

### Testing requirements

Broken links, content-type/download, keyboard, screen reader, zoom, mobile, long labels, print, superseded link suppression.

### Success measure

Owners can reach the correct approved resource from model or Product in a small number of clear steps.

### Open Product Owner questions

What minimum accessible-document standard and remediation exception process applies?

## L-PBI-013 — Publish governed maintenance, cleaning, and setup guidance

**Status:** Proposed
**Evidence state:** Approved content absent
**Implementation owner / responsibility class:** Technical, Safety, Content, Support / content
**Epic:** L
**Work area:** Content / Repository
**Implementation mode:** Reviewed task content
**Type:** Content
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Low until review
**Suggested milestone:** Post-Launch
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:maintenance`, `needs:safety-review`

### Problem or opportunity

Customers need safe setup and care instructions, while outdated or overgeneralized steps can damage equipment or create hazards.

### Evidence

Candidate manuals/videos and content-system guidance exist, but `setup-documentation-gap` is blocked and no approved procedure set exists.

### Proposed outcome

Publish versioned, model-specific setup, inspection, cleaning, and maintenance tasks with tools/materials, intervals/conditions, warnings, stop/escalate rules, and parts links where approved.

### Scope / exclusions

Include a bounded first machine/resource batch, printable/accessibility-friendly format, revision owner, and supersession. Exclude generic educational technique content owned by M and any unapproved repair instruction.

### Acceptance criteria

- [ ] Technical/Safety owners approve every procedural and interval claim.
- [ ] Applicability is exact; unknown model/revision never inherits instructions.
- [ ] Hazards, prerequisite shutdown/isolation, and stop/escalate conditions are clear and accessible.
- [ ] Related parts use approved compatibility and do not promise inventory.

### Architecture / implementation considerations

Use Pages/articles for maintained prose; reference approved Files/videos rather than duplicating their content without a version plan.

### Dependencies and external decisions

011–012; L-DEC-012; Epic M/X interfaces.

### Risks and cautions

Do not turn source documents into customer instructions without technical review.

### Testing requirements

Claims review, applicability fixtures, link/resource revision tests, accessibility, reduced motion/captions/transcripts, print/mobile.

### Success measure

Customers complete approved routine tasks with fewer avoidable support escalations and no safety regression.

### Open Product Owner questions

Which routine tasks and machine model form the smallest high-value first release?

## L-PBI-014 — Deliver symptom-based troubleshooting with safety escalation

**Status:** Proposed
**Evidence state:** Approved diagnostics absent
**Implementation owner / responsibility class:** Technical, Safety, Legal, Support, Content, Engineering / mixed
**Epic:** L
**Work area:** Content / Repository / Operations
**Implementation mode:** Safety-reviewed decision paths
**Type:** Feature
**Priority:** P0
**Impact:** Transformative
**Effort:** XL
**Confidence:** Low
**Suggested milestone:** Post-Launch
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:troubleshooting`, `needs:safety-review`

### Problem or opportunity

Customers with equipment problems need practical next steps, but unreviewed diagnosis can worsen damage, void coverage, or create injury risk.

### Evidence

No symptom taxonomy or approved diagnostic content exists. Brand pattern documents are design guidance, not technical authority.

### Proposed outcome

Provide bounded symptom-based paths that identify model/context, present only approved low-risk checks, identify stop-use/escalation conditions, and generate structured context for support.

### Scope / exclusions

Include symptom taxonomy, prerequisite checks, safe action, result branch, escalation, linked resources/parts, revision/audit. Exclude autonomous diagnosis, warranty determination, destructive/disassembly steps, and AI-generated technical advice.

### Acceptance criteria

- [ ] Every branch has exact applicability, technical/safety/legal approval, revision, and escalation owner.
- [ ] Safety-critical or unknown states stop and route to approved help.
- [ ] Troubleshooting never decides warranty coverage or guarantees repair/parts.
- [ ] No answer can be generated from unapproved documents, chat AI, or Product prose.
- [ ] Submitted escalation context follows L-PBI-004 minimization rules.

### Architecture / implementation considerations

Start with static governed decision trees/articles. Add structured metaobjects or search only when reuse/maintenance justifies them.

### Dependencies and external decisions

003, 006, 011, 013; L-DEC-012.

### Risks and cautions

Highest Epic L customer-safety risk; a content pass is insufficient without technical acceptance.

### Testing requirements

Positive/negative/unknown/safety fixtures; loop/dead-end detection; accessibility; mobile; stale revision; escalation failure; prohibited-claim scan.

### Success measure

Approved simple issues are resolved or escalated with better context and no unsupported unsafe instruction.

### Open Product Owner questions

Which symptoms are safe for self-service, and who has final stop-use authority?

## L-PBI-015 — Integrate replacement-parts lookup with approved compatibility

**Status:** Proposed
**Evidence state:** Reuse Epic G contracts
**Implementation owner / responsibility class:** Product Data, Support, and Engineering / repository and storefront
**Epic:** L
**Work area:** Product data / Storefront
**Implementation mode:** Contract extension and theme integration
**Type:** Feature
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Machine resources
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:product-data`, `area:storefront`

### Problem or opportunity

Owners need eligible replacement parts without Rhino inferring fit, availability, or support from titles, tags, or product prose.

### Evidence

`docs/rhino-lapidary-pbi-tracker-epic-g.md` leaves G-PBI-003 and G-PBI-005 partial/preview-only. `rhino.compatible_machines` is approved in `data/metafield-metaobject-definitions.json`; Epic F/G reverse projections and validators already establish the safer reuse path.

### Proposed outcome

Expose parts lookup only from approved, bidirectional compatibility relationships, with a useful unknown/no-approved-match escalation path.

### Scope / exclusions

Include model/family entry, eligible part results, reverse machine links, revocation, and staff-help fallback. Exclude inferred fit, stock promises, substitutions, repair eligibility, or completion of Epic G's merchandising scope.

### Acceptance criteria

- [ ] Every shown relationship is backed by the canonical approved compatibility contract.
- [ ] Missing, duplicate, contradictory, unpublished, revoked, and multi-machine relationships fail closed.
- [ ] Unknown machines and zero approved results offer a governed support path without claiming no part exists.
- [ ] Product publication and inventory state are not represented as compatibility or availability evidence.

### Architecture / implementation considerations

Extend Epic G/F validators and projections instead of introducing an Epic L compatibility model.

### Dependencies and external decisions

L-PBI-006, L-PBI-007, G-PBI-003, and G-PBI-005; Product Data owns relationship approval.

### Risks and cautions

A plausible but wrong part can damage equipment or create a safety issue.

### Testing requirements

Approved/revoked/unpublished/duplicate/reverse-edge fixtures, broken-link checks, accessibility, responsive results, and no-results behavior.

### Success measure

Customers can reach approved eligible parts from a known machine without unsupported compatibility claims.

### Open Product Owner questions

Which Epic owns closing G-PBI-003/G-PBI-005, and who approves compatibility evidence?

## L-PBI-016 — Define support treatment for legacy and discontinued machines

**Status:** Proposed
**Evidence state:** Lifecycle policy absent
**Implementation owner / responsibility class:** Business, Product Data, Technical, Support, and Content / policy and data governance
**Epic:** L
**Work area:** Policy / Product data / Content
**Implementation mode:** Discovery and contract definition
**Type:** Enabler
**Priority:** P2
**Impact:** Medium
**Effort:** L
**Confidence:** Low
**Suggested milestone:** Machine resources
**Suggested GitHub labels:** `epic:l`, `priority:p2`, `area:governance`, `area:product-data`

### Problem or opportunity

Older owners need honest resource and escalation paths, but the repository has no approved lifecycle status or commitment policy.

### Evidence

The canonical backlog requires discontinued-machine support. `data/epic-e-warranty-support-evidence.json` has zero approved warranty mappings, and the current resource/catalog contracts do not encode supported, legacy, discontinued, or unknown service treatment.

### Proposed outcome

Define governed lifecycle states and the permitted warranty, document, parts, service, and escalation behavior for each state.

### Scope / exclusions

Include current, legacy, discontinued, and unresolved status; alias/model identification; resource retention; replacement guidance; and redirects. Exclude promises of parts, repair, or service-center availability.

### Acceptance criteria

- [ ] Lifecycle status has evidence, effective date, approver, permitted claims, and review cadence.
- [ ] Unknown is distinct from discontinued and never implies unsupported.
- [ ] Retained manuals remain versioned and accessible; removed routes have governed redirects.
- [ ] No lifecycle state automatically determines warranty eligibility.

### Architecture / implementation considerations

Extend machine-family/product governance only after the need for a new field is demonstrated; avoid duplicating Shopify publication status.

### Dependencies and external decisions

L-PBI-003, L-PBI-006, and L-PBI-011; Business and Technical owners must supply lifecycle evidence.

### Risks and cautions

Incorrect labels can deny assistance or imply ongoing obligations.

### Testing requirements

State-transition fixtures, unknown-state handling, alias/redirect checks, stale-review detection, and prohibited-claim validation.

### Success measure

Every known machine has an evidence-backed lifecycle disposition or an explicit unresolved state.

### Open Product Owner questions

Who authorizes lifecycle changes, and what assistance remains available for each state?

## L-PBI-017 — Select and prove a native-first service-intake architecture

**Status:** Proposed
**Evidence state:** Native feasibility supported; Admin audit required
**Implementation owner / responsibility class:** Engineering, Shopify Admin, Privacy, and Support / architecture
**Epic:** L
**Work area:** Architecture / Shopify Admin / Forms
**Implementation mode:** Repository proof of concept and decision
**Type:** Spike
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Service intake
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:architecture`, `area:forms`

### Problem or opportunity

The generic theme contact form cannot meet structured intake needs, while app/custom choices introduce privacy, cost, permission, lifecycle, and failure implications.

### Evidence

`templates/page.contact.json` and `sections/contact-form.liquid` capture only generic contact fields. Official Shopify Forms documentation supports custom fields, customer/metafield storage, one file up to 20 MB, notifications, and Flow integration, but not conditional or multi-step forms; actual store configuration is unverified.

### Proposed outcome

Choose the smallest viable architecture through repository-only fixtures and a scored decision record covering native contact, Forms/Flow, approved app, and custom backend options.

### Scope / exclusions

Include fields, data flow, identity, spam, files, routing, export, accessibility, failure/retry, observability, cost, permissions, and removal. Exclude installing, enabling, configuring, or submitting any live form.

### Acceptance criteria

- [ ] Requirements and rejection criteria are approved before scoring candidates.
- [ ] The decision proves data locations, recipients, retention controls, failure modes, accessibility, plan limits, and reversible removal.
- [ ] Deterministic fixtures exercise success, validation, abuse, duplicate, timeout, and uncertain-submission states.
- [ ] Any non-native recommendation documents why native capability is insufficient.

### Architecture / implementation considerations

Prefer native capability when it meets requirements, but keep private service records out of public theme settings and storefront metafields.

### Dependencies and external decisions

L-PBI-004, L-PBI-005, and L-PBI-006; read-only Admin evidence and Support workflow requirements.

### Risks and cautions

Forms can create or match customer profiles; Flow features vary by plan; upload support alone does not establish safe document handling.

### Testing requirements

Architecture fixtures, no-mutation operation inventory, plan/capability matrix, redaction tests, keyboard/screen-reader review, and recovery drills.

### Success measure

One approved, reversible architecture satisfies the minimum intake contract with known operational cost and risk.

### Open Product Owner questions

What system should be the service record of truth, and what monthly/operational cost is acceptable?

## L-PBI-018 — Implement structured warranty, repair, and technical-support intake

**Status:** Proposed
**Evidence state:** Blocked on policy and architecture
**Implementation owner / responsibility class:** Engineering, Shopify Admin, Support, Content, and Privacy / coordinated implementation
**Epic:** L
**Work area:** Forms / Workflow / Storefront
**Implementation mode:** Theme plus authorized Admin configuration
**Type:** Feature
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Low
**Suggested milestone:** Service intake
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:forms`, `area:support-operations`

### Problem or opportunity

Staff need consistent information to triage requests; customers need a clear submission path that does not diagnose equipment or promise coverage.

### Evidence

The current contact form is unstructured. The backlog requires serial/proof capture, request categories, routing, and repair/warranty pathways; L-PBI-002 through L-PBI-004 are not yet approved.

### Proposed outcome

Implement an accessible intake with approved categories, minimum customer/contact/machine/problem fields, consent notices, submission receipt, and safe alternate contact path.

### Scope / exclusions

Include warranty question, repair request, technical support, parts help, and safety escalation where approved. Exclude automated warranty eligibility, diagnosis, price, turnaround, shipping authorization, or repair acceptance.

### Acceptance criteria

- [ ] Required and optional fields match the approved data-minimization contract.
- [ ] Model/product, serial/order/purchase context, symptom, current safe state, contact preference, and consent have explicit purposes and unknown options.
- [ ] Validation preserves user input and exposes accessible field/summary errors.
- [ ] Success, duplicate, timeout, uncertain, notification-failure, and alternate-channel states are distinct.
- [ ] Copy makes no coverage, response-time, repair, parts, or safety promise beyond approved policy.

### Architecture / implementation considerations

Use L-PBI-017's selected system and separate public form presentation from private records and routing configuration.

### Dependencies and external decisions

L-PBI-002, L-PBI-003, L-PBI-004, and L-PBI-017; approved taxonomy and staffed recipient.

### Risks and cautions

Overcollection increases privacy burden; ambiguous success can create duplicate submissions; serial numbers may be mistyped or sensitive.

### Testing requirements

Contract/unit tests, deterministic browser fixtures, spam/rate-limit checks, keyboard/screen-reader/mobile tests, redaction, routing assertions, and no-JavaScript fallback where supported.

### Success measure

Staff receive the approved minimum triage data and customers receive an unambiguous, recoverable outcome.

### Open Product Owner questions

Which categories are staffed at launch, and what information is truly required before first contact?

## L-PBI-019 — Implement secure purchase-evidence and diagnostic uploads

**Status:** Proposed
**Evidence state:** Privacy and storage decisions required
**Implementation owner / responsibility class:** Privacy, Security, Support, Shopify Admin, and Engineering / security-sensitive implementation
**Epic:** L
**Work area:** Security / Privacy / Forms
**Implementation mode:** Controlled upload workflow
**Type:** Feature
**Priority:** P0
**Impact:** High
**Effort:** L
**Confidence:** Low
**Suggested milestone:** Service intake
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:security`, `area:privacy`, `area:forms`

### Problem or opportunity

Receipts, photos, and videos can aid triage but can expose personal, payment, location, or device metadata and malicious content.

### Evidence

Official Shopify Forms documentation currently permits a single file up to 20 MB, but repository evidence does not establish storage, scanning, access, retention, deletion, or export controls for this store.

### Proposed outcome

Provide only approved, necessary upload types through a private, access-controlled lifecycle, with safer order lookup or later staff-request alternatives.

### Scope / exclusions

Include type/size/count rules, metadata guidance, malware/content handling, access logging, retention/deletion, export, failure, and private retrieval. Exclude public Files URLs, theme storage, unrestricted formats, or treating a document as coverage proof without review.

### Acceptance criteria

- [ ] Each requested artifact has a documented necessity and safer alternative analysis.
- [ ] Allowed types, size/count limits, scanning/handling, encryption/access, retention, deletion, and audit owner are approved.
- [ ] Upload URLs and artifacts never enter analytics, logs, screenshots, public metafields, or customer-visible shared locations.
- [ ] Rejected, interrupted, orphaned, duplicate, and deletion/export cases are recoverable and tested.

### Architecture / implementation considerations

If the selected native capability cannot meet the lifecycle, defer uploads and request evidence later through an approved secure channel.

### Dependencies and external decisions

L-PBI-004, L-PBI-017, and L-PBI-018; Privacy/Security threat review and processor terms.

### Risks and cautions

This is the highest privacy/security implementation risk in the intake batch.

### Testing requirements

Threat model, type/size boundary tests, malicious/renamed file fixtures, authorization tests, URL/log redaction, orphan cleanup, retention/deletion/export drills, and accessible errors.

### Success measure

Necessary evidence reaches only authorized staff with a tested lifecycle and no public exposure.

### Open Product Owner questions

Can order lookup replace receipt upload for Shopify purchases, and are videos required at initial intake?

## L-PBI-020 — Implement staff categorization, routing, deduplication, and recovery

**Status:** Proposed
**Evidence state:** Workflow owner required
**Implementation owner / responsibility class:** Support Operations, Shopify Admin, and Engineering / operations and automation
**Epic:** L
**Work area:** Workflow / Operations / Automation
**Implementation mode:** Authorized configuration plus repository contracts
**Type:** Feature
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Low
**Suggested milestone:** Service intake
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:workflow`, `area:support-operations`

### Problem or opportunity

Structured fields do not create a dependable service process unless receipt, ownership, categorization, duplicate handling, failure recovery, and escalation are explicit.

### Evidence

No current Flow, Forms, Inbox, queue, ticket taxonomy, service record, or notification configuration has been verified. The canonical backlog requires ticket categorization and operational follow-up.

### Proposed outcome

Create an approved workflow with a stable request identifier, queue ownership, deduplication policy, customer/staff notifications, escalation, reconciliation, and audit trail.

### Scope / exclusions

Include routing rules, queue states, retry/uncertain outcomes, notification ownership, manual override, reconciliation, export, and outage runbook. Exclude auto-diagnosis, auto-eligibility, autonomous customer commitments, or silent deletion.

### Acceptance criteria

- [ ] Every category has an active owner, destination, permitted priority, backup, and escalation path.
- [ ] Stable request IDs and approved deduplication distinguish retry from a genuinely new incident.
- [ ] Customer and staff notifications have monitored failure/retry/reconciliation behavior.
- [ ] A manual recovery path works when any app, Flow, email, or integration is unavailable.
- [ ] State changes and overrides are auditable without exposing private data in theme/analytics logs.

### Architecture / implementation considerations

Flow may assist routing after current-plan verification; the queue/system of record must remain explicit and exportable.

### Dependencies and external decisions

L-PBI-003, L-PBI-017, L-PBI-018, and L-PBI-019; named Support owner and escalation roster.

### Risks and cautions

A successful storefront message does not prove staff receipt; automation can duplicate or lose requests.

### Testing requirements

End-to-end synthetic requests in an authorized nonproduction context; duplicate/retry/outage/notification-failure/misroute/override drills; audit and privacy review.

### Success measure

Every accepted request is traceable to a staffed queue or a detected recoverable failure.

### Open Product Owner questions

Which system is authoritative, who monitors failures, and what escalation states are required?

## L-PBI-021 — Implement warranty registration after policy approval

**Status:** Proposed
**Evidence state:** Registration policy unapproved
**Implementation owner / responsibility class:** Business, Legal, Support, Privacy, Shopify Admin, and Engineering / policy-dependent workflow
**Epic:** L
**Work area:** Warranty / Forms / Customer data
**Implementation mode:** Authorized configuration and integration
**Type:** Feature
**Priority:** P2
**Impact:** Medium
**Effort:** L
**Confidence:** Low
**Suggested milestone:** Service intake
**Suggested GitHub labels:** `epic:l`, `priority:p2`, `area:warranty`, `area:forms`

### Problem or opportunity

The backlog proposes registration, but Rhino has not approved whether registration is required, what it accomplishes, or how transfers/non-Shopify purchases are handled.

### Evidence

`data/epic-e-warranty-support-evidence.json` has zero approved warranty policies or mappings. No registration record model, legal text, consent, ownership rule, or operating workflow exists.

### Proposed outcome

If approved and useful, implement minimal registration with clear legal effect, machine/purchase identity, deduplication, confirmation, correction, transfer, deletion, and staff workflow.

### Scope / exclusions

Include serial/model, purchase source/date/order reference, owner/contact, consent, outcome, duplicates, correction, transfer, and unknowns. Exclude implying coverage, extension, eligibility, ownership, or service priority unless the approved policy explicitly grants it.

### Acceptance criteria

- [ ] Approved policy states whether registration is optional/required and exactly what it changes.
- [ ] The record contract distinguishes registration, product ownership, purchase evidence, warranty eligibility, and service history.
- [ ] Duplicate serial/order/customer, transfer, correction, deletion/export, and unsupported purchase source are governed.
- [ ] Confirmation copy cannot be read as a warranty eligibility decision unless one was actually authorized.

### Architecture / implementation considerations

Reuse the intake architecture only if its data lifecycle and record identity fit; do not place private registration records in public product data.

### Dependencies and external decisions

L-PBI-002, L-PBI-004, L-PBI-017, and L-PBI-019; legal effect and record owner.

### Risks and cautions

Registration can create misleading expectations and long-lived personal data with little customer value.

### Testing requirements

Duplicate/transfer/correction/deletion fixtures, copy claim scans, identity/authorization tests, retention/export drills, and notification failure cases.

### Success measure

Registration, if launched, has a clear customer benefit and never becomes an unsupported coverage claim.

### Open Product Owner questions

Is registration required or optional, what benefit does it provide, and who owns corrections/transfers?

## L-PBI-022 — Evaluate and govern Shopify Inbox and common-question automation

**Status:** Proposed
**Evidence state:** Current configuration unverified
**Implementation owner / responsibility class:** Support, Content, Shopify Admin, Privacy, and Engineering / feasibility and operations
**Epic:** L
**Work area:** Chat / Automation / Support operations
**Implementation mode:** Read-only audit, controlled pilot, and governance
**Type:** Spike
**Priority:** P2
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Operational extensions
**Suggested GitHub labels:** `epic:l`, `priority:p2`, `area:shopify-inbox`, `area:support-operations`

### Problem or opportunity

Chat and instant answers can shorten simple journeys, but unstaffed or generative responses can make unsafe technical, warranty, availability, or response promises.

### Evidence

Official Shopify Inbox documentation supports chat availability, first replies, and instant answers. Repository fixtures only imply an Inbox publication channel and do not prove present installation, configuration, staffing, transcript handling, or suitability.

### Proposed outcome

Audit and, only after approval, pilot a bounded FAQ/chat channel with approved answer sources, hours, handoff, privacy, transcript, failure, and removal rules.

### Scope / exclusions

Include availability, first reply, approved instant answers, human handoff, offline behavior, transcripts, consent, monitoring, and rollback. Exclude autonomous diagnosis, warranty decisions, parts promises, repair authorization, or invented response times.

### Acceptance criteria

- [ ] Current configuration, data processors, permissions, staffing, and plan constraints are verified before a pilot.
- [ ] Every automated answer has an approved source, owner, revision, expiry/review date, and prohibited-claim boundary.
- [ ] Safety, uncertainty, warranty, repair, and account-specific topics escalate to a human path.
- [ ] Offline, no-agent, transcript access/deletion, delivery failure, and disable/removal behavior are tested.

### Architecture / implementation considerations

Reuse governed knowledge from L-PBI-006; chat must not become a second unversioned knowledge base.

### Dependencies and external decisions

L-PBI-005, L-PBI-009, and L-PBI-020; staffed hours and channel owner.

### Risks and cautions

An enabled widget can imply real-time support even when no one is available.

### Testing requirements

Approved/unknown/safety prompts, hours/offline cases, human handoff, transcript privacy, keyboard/screen-reader/mobile behavior, and disable rollback.

### Success measure

Common approved questions are resolved or handed off without unsupported commitments or dead ends.

### Open Product Owner questions

Will Rhino staff chat, during what verified hours, and may any generative feature be enabled?

## L-PBI-023 — Define the customer-account owned-machine and service-resource interface

**Status:** Deferred
**Evidence state:** Epic O interface; custom app likely
**Implementation owner / responsibility class:** Epic O, Engineering, Privacy, Support, and Product Data / cross-Epic interface
**Epic:** L
**Work area:** Customer accounts / Architecture
**Implementation mode:** Interface definition only
**Type:** Enabler
**Priority:** P3
**Impact:** Medium
**Effort:** XL
**Confidence:** Low
**Suggested milestone:** Operational extensions
**Suggested GitHub labels:** `epic:l`, `priority:p3`, `area:customer-accounts`, `status:deferred`

### Problem or opportunity

Owners may benefit from machine-specific resources and service history, but identity, ownership, account mode, authorization, and private record systems are unresolved.

### Evidence

`sections/main-account.liquid` provides legacy order history and addresses only. Official Shopify developer documentation says customer-account UI extensions apply to new customer accounts, not legacy accounts; this store's current account mode is unverified.

### Proposed outcome

Define an Epic L-to-Epic O interface for owned-machine claims, approved resources, registrations, requests, and service status without implementing the account experience.

### Scope / exclusions

Include record IDs, ownership provenance, authorization, linking/unlinking, correction, transfer, privacy, revocation, account deletion, and no-account fallback. Exclude account migration, extensions/apps, order ownership inference, or service-status promises.

### Acceptance criteria

- [ ] Account mode and feasible extension surface are verified from current Admin evidence.
- [ ] The interface distinguishes purchaser, registrant, current owner, requester, and authorized viewer.
- [ ] Order history alone never proves current equipment ownership or warranty eligibility.
- [ ] Access, transfer, revocation, deletion/export, and missing-record behavior are specified.
- [ ] Epic O accepts ownership of implementation before this item leaves Deferred.

### Architecture / implementation considerations

Authenticated private data requires an authorized server-side app/service; Liquid account templates are not a service-record system.

### Dependencies and external decisions

L-PBI-005, L-PBI-006, L-PBI-017, and L-PBI-021; Epic O roadmap and account-mode decision.

### Risks and cautions

Incorrect linkage can expose service records or equipment identity to the wrong customer.

### Testing requirements

Interface-schema validation, authorization/IDOR tests, transfer/revocation/deletion cases, no-account fallback, and accessibility requirements for future implementation.

### Success measure

Epic O can implement a bounded account experience without reconstructing Epic L policy or private-data rules.

### Open Product Owner questions

Is an authenticated ownership experience valuable enough to justify app/backend cost, and which Epic funds it?

## L-PBI-024 — Deliver approved post-purchase support onboarding

**Status:** Proposed
**Evidence state:** Epic X interface; content and consent required
**Implementation owner / responsibility class:** Epic X, Content, Support, Legal, Privacy, and Shopify Admin / cross-Epic communication
**Epic:** L
**Work area:** Post-purchase / Messaging / Content
**Implementation mode:** Governed content and authorized automation
**Type:** Feature
**Priority:** P2
**Impact:** Medium
**Effort:** L
**Confidence:** Low
**Suggested milestone:** Operational extensions
**Suggested GitHub labels:** `epic:l`, `priority:p2`, `area:post-purchase`, `area:content`

### Problem or opportunity

Machine buyers should receive approved setup, maintenance, manual, and support paths at useful moments without unsolicited marketing or mismatched product advice.

### Evidence

The backlog assigns broader post-purchase experience to Epic X. Official Shopify Messaging documentation supports post-purchase automations, but no current automation, consent basis, machine segmentation, deliverability, or content approval is verified.

### Proposed outcome

Provide Epic X with a versioned, machine-specific onboarding sequence and, if separately authorized, configure and verify the minimum approved automation.

### Scope / exclusions

Include transactional/marketing classification, consent, machine mapping, send timing, approved resources, stop/suppression, unsubscribe where required, bounce/failure, and ownership. Exclude sales promises, unsafe setup advice, universal sequences, or sending during this planning work.

### Acceptance criteria

- [ ] Each message has purpose, lawful/consent basis, audience, trigger, timing, source revision, owner, and suppression rules.
- [ ] Machine/resources use approved mappings and fail closed when classification is missing.
- [ ] Marketing and operational communications are separated correctly.
- [ ] Bounce, duplicate order, refund/cancel, opt-out, missing email, and automation outage behavior are governed.

### Architecture / implementation considerations

Keep canonical resources in Epic L contracts and communication orchestration in Epic X/approved Shopify tooling.

### Dependencies and external decisions

L-PBI-009, L-PBI-011, and L-PBI-013; Epic X ownership, consent/legal review, and Messaging audit.

### Risks and cautions

Incorrect segmentation can deliver unsafe or irrelevant machine instructions.

### Testing requirements

Fixture-based segmentation, suppression/consent cases, link/revision checks, rendering/accessibility, delivery failure, duplicate prevention, and no-live-send proof before authorization.

### Success measure

Eligible owners receive the correct approved resources without unauthorized or duplicate communication.

### Open Product Owner questions

Which messages are operational versus marketing, and which order states should trigger or suppress them?

## L-PBI-025 — Evaluate a dealer and service-center directory

**Status:** Deferred
**Evidence state:** Program and eligibility unapproved
**Implementation owner / responsibility class:** Business, Support, Legal, Content, and Shopify Admin / program feasibility
**Epic:** L
**Work area:** Service network / Content / Data
**Implementation mode:** Feasibility and data contract
**Type:** Spike
**Priority:** P3
**Impact:** Low
**Effort:** L
**Confidence:** Low
**Suggested milestone:** Operational extensions
**Suggested GitHub labels:** `epic:l`, `priority:p3`, `area:service-network`, `status:deferred`

### Problem or opportunity

A directory is useful only if Rhino operates a verified eligibility, geographic, capability, and maintenance program.

### Evidence

The canonical backlog lists a dealer/service-center directory as investigation scope. No approved network, certification, contract, coverage, referral, availability, or directory owner appears in the audited repository.

### Proposed outcome

Decide whether a directory program exists; if approved, define verified entries, services, geographic scope, expiry/review, disclosures, accessible lookup, and removal.

### Scope / exclusions

Include eligibility evidence, contact/location, capabilities, machine coverage, current status, review date, disclaimers, corrections, and removal. Exclude scraping listings, implied endorsement, availability/price guarantees, or a map-only experience.

### Acceptance criteria

- [ ] Business/Legal approve program purpose, eligibility, responsibilities, disclosures, and owner.
- [ ] Every entry has direct verification, effective/review dates, supported scope, and revocation path.
- [ ] Search/list alternatives remain accessible without a map or geolocation permission.
- [ ] Stale, missing, closed, conflicting, and zero-result states are governed.

### Architecture / implementation considerations

Select Pages/metaobjects/app only after entry count, maintenance workflow, filtering, and privacy needs are known.

### Dependencies and external decisions

L-PBI-003 and L-PBI-006; Business approval of a real service network.

### Risks and cautions

Stale directories misdirect customers and can imply authorization or guaranteed service.

### Testing requirements

Schema and expiry validation, duplicate/geographic fixtures, accessibility without map, broken links, revocation, and claim scans.

### Success measure

No listing is published without current direct evidence and an accountable maintainer.

### Open Product Owner questions

Does an approved dealer/service network exist today, and who verifies it over time?

## L-PBI-026 — Establish recall and safety-notice capability

**Status:** Proposed
**Evidence state:** Ownership and process absent
**Implementation owner / responsibility class:** Safety, Legal, Business, Product Data, Support, and Engineering / safety governance
**Epic:** L
**Work area:** Safety / Product data / Communications
**Implementation mode:** Procedure, contract, and gated publication capability
**Type:** Enabler
**Priority:** P1
**Impact:** Critical
**Effort:** L
**Confidence:** Low
**Suggested milestone:** Operational extensions
**Suggested GitHub labels:** `epic:l`, `priority:p1`, `area:safety`, `area:governance`

### Problem or opportunity

Rhino needs a controlled way to issue urgent, model/serial-specific notices, preserve history, contact affected customers where lawful, and avoid accidental recall claims.

### Evidence

The canonical backlog requires recall/safety capability. No approved owner, legal procedure, affected-unit model, notice template, distribution workflow, supersession/archive rule, or active recall evidence was found.

### Proposed outcome

Create an approved incident/notice procedure and dormant tested capability for public notices, storefront escalation, customer communication, acknowledgement, archive, correction, and rollback.

### Scope / exclusions

Include authority, severity, affected model/serial/order criteria, stop-use copy, channels, contact rules, audit, supersession, archive, correction, and drills. Exclude declaring an active recall or publishing/sending a notice without incident-specific authorization.

### Acceptance criteria

- [ ] Safety/Legal authority, incident roles, approval sequence, after-hours escalation, and evidence custody are named.
- [ ] Affected-unit criteria are versioned and validated against model/serial/order data without broad overnotification.
- [ ] Templates support accessible public notice, prominent storefront state, direct communication where lawful, correction, supersession, archive, and removal.
- [ ] A no-send/nonproduction drill proves readiness, audit trail, and rollback without representing a real incident.

### Architecture / implementation considerations

Use a minimal dormant contract and runbook; do not create public recall records or banners absent an authorized event.

### Dependencies and external decisions

L-PBI-003, L-PBI-006, and L-PBI-009; Safety/Legal incident owner and emergency channel.

### Risks and cautions

False, late, inaccessible, or overbroad notices can create severe safety and legal harm.

### Testing requirements

No-send incident drill; model/serial boundary fixtures; stale/superseded notice checks; accessibility/mobile/performance; authorization, audit, delivery-failure, correction, and rollback tests.

### Success measure

An authorized incident can be communicated accurately and recoverably without inventing an active event.

### Open Product Owner questions

Who has authority to initiate, approve, update, and close a safety notice or recall?

## L-PBI-027 — Define privacy-aware support measurement and event governance

**Status:** Proposed
**Evidence state:** Epic U interface required
**Implementation owner / responsibility class:** Epic U, Privacy, Support, Product, and Engineering / analytics governance
**Epic:** L
**Work area:** Measurement / Privacy / Analytics
**Implementation mode:** Event contract and validation
**Type:** Enabler
**Priority:** P2
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Acceptance and release
**Suggested GitHub labels:** `epic:l`, `priority:p2`, `area:analytics`, `area:privacy`

### Problem or opportunity

Rhino needs to know whether customers find resources and complete support journeys without leaking serials, symptoms, uploads, identities, or authenticated URLs into analytics.

### Evidence

Epic U owns broader measurement. Epic L introduces high-risk private fields and operational outcomes not represented in the current public storefront event contracts.

### Proposed outcome

Define a minimal aggregate event and success-measure interface for resource discovery, form state, routing outcome, and self-service escalation, with explicit prohibited data.

### Scope / exclusions

Include event purpose, trigger, allowed enums, consent, retention, ownership, sampling, validation, monitoring, and deletion. Exclude serial/order/contact/symptom text, file metadata/URLs, service-record IDs, warranty outcome, or staff performance surveillance unless separately authorized.

### Acceptance criteria

- [ ] Every event maps to an approved decision and contains only allow-listed non-sensitive values.
- [ ] Serial, order, contact, free text, files, account/service identifiers, query strings, and authenticated URLs are rejected.
- [ ] Consent, retention, processor, access, deletion, and Epic U ownership are documented.
- [ ] Metrics distinguish storefront submission attempt, accepted record, routed record, and failed/unknown state.

### Architecture / implementation considerations

Extend Epic U's event governance rather than embedding analytics logic in support content or private systems.

### Dependencies and external decisions

L-PBI-007, L-PBI-017, and L-PBI-020; Epic U and Privacy acceptance.

### Risks and cautions

Support telemetry can accidentally become a shadow service-record database.

### Testing requirements

Event schema/allow-list tests, forbidden-value fixtures, URL/log redaction, consent cases, duplicate suppression, and processor payload inspection.

### Success measure

Product decisions can use aggregate journey evidence without exposing customer/service data.

### Open Product Owner questions

Which decisions require measurement, and which operational metrics must remain outside storefront analytics?

## L-PBI-028 — Run integrated Epic L acceptance and release readiness

**Status:** Proposed
**Evidence state:** Final gate not started
**Implementation owner / responsibility class:** QA, Security, Accessibility, Performance, Operations, and Product Owner / release governance
**Epic:** L
**Work area:** QA / Release / Operations
**Implementation mode:** Integrated verification and separately authorized release
**Type:** Quality
**Priority:** P0
**Impact:** Critical
**Effort:** XL
**Confidence:** Medium
**Suggested milestone:** Acceptance and release
**Suggested GitHub labels:** `epic:l`, `priority:p0`, `area:qa`, `area:release`

### Problem or opportunity

Individually implemented artifacts do not prove the customer journey, staff workflow, privacy controls, content authority, rollback, or production state.

### Evidence

Epic K demonstrates the need to separate code deployment, operational evidence, production readback, and closure. Existing repository validators, Playwright fixtures, release manifests, evidence receipts, and source registers provide reusable patterns.

### Proposed outcome

Gate the selected Epic L release with repository, preview, Admin/configuration, content, operations, privacy/security, accessibility, responsive, performance, monitoring, rollback, and production-readback evidence.

### Scope / exclusions

Include only Product Owner-approved PBIs and exact artifacts. Exclude treating implementation, preview, deployment, or a passing validator as equivalent to operational acceptance or Epic closure.

### Acceptance criteria

- [ ] Release scope and source commit are exact, minimal, reviewable, and free of unrelated working-tree changes.
- [ ] Claims/resources/policies have authority and revision evidence; private data controls pass Security/Privacy review.
- [ ] Critical customer and staff paths pass deterministic automated tests plus named human operational drills.
- [ ] Accessibility, responsive behavior, performance, broken links/documents, failures, retries, and rollback are verified.
- [ ] Any Shopify mutation, app/configuration change, publication, email, or production deploy has separate explicit authorization and before/after evidence.
- [ ] Production readback, monitoring, incident owner, and closure disposition are committed without secrets/customer data.

### Architecture / implementation considerations

Extend current validators and release/evidence patterns. Keep repository, Admin, content, operations, and production assertions distinct.

### Dependencies and external decisions

L-PBI-008, 009, 010, 012, 014, 015, 018, 019, 020, 026, and 027, limited to the approved release scope.

### Risks and cautions

The gate can produce false confidence if mocked fixtures, stale seals, or externally reported production claims are presented as live evidence.

### Testing requirements

Selected PBI validators, full relevant regression suite, preview E2E, authorized Admin readback, security/privacy threat cases, WCAG/responsive/performance checks, operations drills, release manifest, rollback, and post-release monitoring.

### Success measure

Every released Epic L behavior is traceable from approved source through implementation and current readback, with known residual risk.

### Open Product Owner questions

Which PBIs comprise the first release, who accepts each evidence class, and what residual risks are acceptable?
