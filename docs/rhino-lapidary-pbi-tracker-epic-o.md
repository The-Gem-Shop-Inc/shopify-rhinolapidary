# Rhino Lapidary Epic O PBI tracker

**Epic:** O — Accounts, Ownership, and Reordering
**Prepared:** 2026-11-07
**Authority:** `docs/Rhino Lapidary Storefront Backlog and Epics.md`
**Status:** Proposed planning package; no implementation, Shopify Admin access or mutation, customer authentication/record access, app installation, publication, deployment, email, commit, or push is authorized
**Discovery:** `docs/project/epic-o-discovery-and-context.md`
**Decisions:** `docs/project/epic-o-decision-and-dependency-register.md`
**Registry:** `docs/project/epic-o-proposed-backlog.json`

## Tracker summary

Epic O has 20 proposed PBIs across six dependency-first batches. The first implementation candidate is deliberately small: after a separately authorized read-only account-mode audit and Product Owner decision, preserve or configure orders, addresses, navigation, accessible/mobile behavior, and native **Buy again**. Saved ownership, registration, warranty/service status, commercial accounts, and retention features are not automatically MVP requirements.

## Authorized execution update — 2026-11-07

The original tables and machine-readable planning registry remain a dated proposal. Product Owner authority later approved the native MVP, the bounded read-only audit, and conditional O-PBI-004/005 repository implementation. This later record does not change the historical `planningOnly` or false authorization flags in `docs/project/epic-o-proposed-backlog.json`.

| PBI | Current execution evidence | Disposition |
|---|---|---|
| O-PBI-001 | Canonical minimum Admin query succeeded with fresh sanitized evidence; new accounts, visible sign-in links, optional checkout login, Basic/non-Plus plan, and Shopify-hosted account root verified. Exact API version and additional app/config/Flow inventory remain incomplete. | Evidence collected; implementation path verified; not Complete |
| O-PBI-002 | Ownership/private-data policy remains unresolved and outside native MVP. | Post-MVP policy dependency; not a prerequisite for native orders/profile/addresses |
| O-PBI-003 | Native Shopify with no new application selected for the approved MVP; future extension/backend choices remain unapproved. | MVP architecture decided |
| O-PBI-004 | Existing header/drawer route delegation validated; no production Liquid change is necessary. Synthetic route, orders, address, keyboard, axe, zoom, and responsive contracts implemented. | Repository implementation verified; Shopify-hosted integration pending |
| O-PBI-005 | Eleven deterministic current-catalog/cart scenarios implemented and passing without adding a custom reorder engine. | Synthetic contract verified; native Buy again integration pending |
| O-PBI-020 | Scoped acceptance packet created with automated/simulated/manual/blocked classification. | Release acceptance incomplete; production publication not authorized |

Evidence: `docs/project/epic-o-account-audit-and-decisions.md`, `docs/project/epic-o-native-mvp-acceptance.md`, and O-EVID-001. Deferred PBIs retain their identifiers and remain architecturally possible.

| PBI | Title | Priority | Impact | Effort | Confidence | Batch | Proposed status |
|---|---|---:|:---:|:---:|:---:|:---:|---|
| O-PBI-001 | Verify account mode, plan, configuration, and native capability state | P0 | High | M | High | O1 | Proposed |
| O-PBI-002 | Approve ownership, identity, authorization, and private-data boundaries | P0 | High | L | Medium | O1 | Proposed |
| O-PBI-003 | Select native, app, or custom account architecture with total cost and exit plan | P0 | High | M | Medium | O1 | Proposed |
| O-PBI-004 | Deliver the minimum accessible account shell for orders, addresses, and navigation | P0 | High | M | High | O2 | Proposed |
| O-PBI-005 | Validate native Buy again and safe cart reconciliation | P0 | High | M | High | O2 | Proposed |
| O-PBI-006 | Define saved-machine claims without treating purchases as ownership | P1 | High | L | Low | O3 | Proposed |
| O-PBI-007 | Define registration and serial-number handling as separate private claims | P1 | High | L | Low | O3 | Deferred |
| O-PBI-008 | Expose saved compatible parts only from current approved compatibility edges | P1 | Medium | M | Medium | O3 | Proposed |
| O-PBI-009 | Link owned-machine context to approved downloadable manuals | P1 | Medium | M | Medium | O3 | Proposed |
| O-PBI-010 | Define warranty-status presentation without deciding eligibility | P1 | High | L | Low | O3 | Deferred |
| O-PBI-011 | Assess private support-history feasibility and disclosure authority | P2 | Medium | XL | Low | O3 | Deferred |
| O-PBI-012 | Assess dealer and wholesale account access against the approved program | P2 | Medium | L | Low | O4 | Deferred |
| O-PBI-013 | Define evidence-backed tax-exempt customer and company workflows | P2 | High | M | Low | O4 | Deferred |
| O-PBI-014 | Define purchase-order and payment-term workflows | P2 | Medium | L | Low | O4 | Deferred |
| O-PBI-015 | Evaluate account-specific recommendations without inventing fit | P3 | Low | L | Low | O5 | Deferred |
| O-PBI-016 | Evaluate back-in-stock subscriptions and consent-safe recovery | P2 | Medium | M | Medium | O5 | Proposed |
| O-PBI-017 | Evaluate a portable wishlist with guest-to-account merge | P3 | Low | L | Low | O5 | Deferred |
| O-PBI-018 | Preserve saved-comparison and recently-viewed interfaces without restarting Epic I | P3 | Low | L | Low | O5 | Deferred |
| O-PBI-019 | Define consumable reminders and account onboarding with Epic X | P2 | Medium | L | Low | O5 | Deferred |
| O-PBI-020 | Run integrated account, privacy, accessibility, responsive, and release acceptance | P0 | High | XL | Medium | O6 | Proposed |

## Status rules

- **Proposed** means ready to discuss, not authorized.
- **Ready for Product Owner review** means evidence is assembled, but approval and implementation authorization are still separate.
- **Approved** accepts scope and priority only.
- **Ready for implementation** requires every named evidence and human gate plus an explicit implementation prompt.
- **Implemented, awaiting verification** and **Complete** require scoped evidence; repository code is not proof of live Admin state.
- **Blocked** names a missing dependency after work was authorized; **Deferred** intentionally excludes a capability from the active milestone; **Rejected** records a durable no-go.

## Dependency-first batches

### Batch 1 — Authority, account-mode, privacy, and cost decisions

PBIs 001–003. Produce sanitized evidence and decisions only. A connected Admin read, app installation, customer login, or customer-record query requires separate authorization.

### Batch 2 — Minimum useful returning-customer experience

PBIs 004–005. Recommended smallest implementation batch only after O-PBI-001 and O-DEC-001/002 are accepted. Target native orders, addresses, navigation, accessibility/mobile behavior, and Buy again; do not create ownership.

### Batch 3 — Conditional owned-machine and resource interfaces

PBIs 006–011. Define or implement only capabilities justified after Epic L privacy/policy gates. Private records must never be public Product metafields.

### Batch 4 — Conditional commercial-account workflows

PBIs 012–014. Keep dealer/wholesale, tax-exempt, and PO work deferred until the business program, plan, legal/tax rules, and operating owners are verified.

### Batch 5 — Optional retention and lifecycle capabilities

PBIs 015–019. Treat recommendations, alerts, wishlist, saved comparisons/recently viewed, reminders, and onboarding as optional investments with Q/U/X governance.

### Batch 6 — Integrated acceptance and release readiness

PBI 020. Prove only the Product Owner-selected scope and keep repository, Admin, app, customer-data, communication, and production evidence distinct.

## Common boundaries

- An order purchaser is not automatically the current owner.
- A saved machine is not an authorized ownership record.
- Registration does not establish warranty eligibility.
- Compatibility is an approved Product relationship, not permission to recommend.
- Account order history is not private service history.
- Authentication or account visibility does not authorize disclosure.
- H, I, M, and N remain deferred. Epic O may define interfaces but must not restart them.
- Every app/backend requirement must be named, costed, permissioned, governed by Epic Q, and removable.

## O-PBI-001 — Verify account mode, plan, configuration, and native capability state

**Status:** Proposed
**Evidence state:** Repository legacy templates exist; current Shopify Admin mode, plan, sign-in, account configuration, apps, B2B, and publication are unverified
**Implementation owner / responsibility class:** Shopify Admin owner, Engineering, and Product Owner / mixed read-only audit
**Work area:** Account architecture and governance
**Implementation mode:** Sanitized read-only audit under separate authorization
**Type:** Discovery
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** High
**Proposed batch / milestone:** O1 / O0 Product Owner planning
**Repository work:** Maintain the query/evidence contract, source date, zero-mutation assertions, pagination, and secret/PII exclusions.
**Shopify Admin / configuration work:** Later read `CustomerAccountsV2`, plan, sign-in links, checkout/accounts configuration, relevant apps, B2B limits, and saved-payment settings; change nothing.

### Customer or business problem

Account design depends on the actual account mode and plan, but Liquid files and old snapshots cannot prove either.

### Evidence and current state

`main-account`, login, registration, order, and address templates implement a classic password-based surface. Official current docs say legacy accounts are deprecated and new accounts supply passwordless identity, native Buy again, and app extensions. No authorized Admin read occurred.

### Proposed outcome

A dated, sanitized capability snapshot that separates repository capability, verified Admin configuration, official platform feasibility, and proposed work.

### Scope and exclusions

Include exact read-only fields, store identity binding, pagination, app/config inventory, plan limits, and expiry. Exclude authentication as a customer, customer data, configuration changes, installs, or publication.

### Functional and privacy acceptance criteria

- [ ] Account mode and plan are either verified with current authorized evidence or remain explicitly Unverified.
- [ ] Query inventory proves zero mutations and records redaction rules.
- [ ] No customer, order, address, session, credential, or private URL enters evidence.
- [ ] Feature existence is not inferred from theme code, definitions, or app references.

### Accessibility and responsive requirements

The audit records which native pages/configurations will require later keyboard, screen-reader, zoom, and 320–1440 px checks; it makes no conformance claim.

### Automated validation opportunities

Schema, store/theme binding, pagination completeness, observation expiry, zero-mutation allowlist, secret/PII scan, and false-verified negative fixtures.

### Dependencies, approvals, and human decisions

O-DEC-001/002; O-DEP-001/012. Product Owner must authorize the bounded read-only audit separately.

### Risk, rollback, and evidence expectations

Risk is accidental Admin mutation or invented current state. Rollback is not applicable to read-only work; stop on scope/store mismatch and retain only sanitized evidence.

## O-PBI-002 — Approve ownership, identity, authorization, and private-data boundaries

**Status:** Proposed
**Evidence state:** No ownership record or approved private system exists; Epic L privacy elements are unresolved and collection is forbidden
**Implementation owner / responsibility class:** Product Owner, Legal, Privacy, Security, and Support / policy and data governance
**Work area:** Ownership and private records
**Implementation mode:** Decision and interface contract
**Type:** Enabler
**Priority:** P0
**Impact:** High
**Effort:** L
**Confidence:** Medium
**Proposed batch / milestone:** O1 / O0 Product Owner planning
**Repository work:** Define purchaser, registrant, claimed owner, verified current owner, requester, and authorized viewer plus provenance, correction, transfer, revocation, deletion/export, and audit states.
**Shopify Admin / configuration work:** None until policy, processor, permissions, retention, and operators are approved.

### Customer or business problem

Customers may need machine-specific resources, but a wrong identity shortcut can expose serials or service data to the wrong person.

### Evidence and current state

Orders prove a purchase relationship only. No customer-owned-machine definition exists. Epic L lists serials, purchase evidence, and service records as not collected and unapproved.

### Proposed outcome

One fail-closed authorization contract that downstream features can consume without conflating purchase, ownership, registration, or warranty.

### Scope and exclusions

Include claim provenance, staff verification, gifts/used/transfers, disputes, unlinking, household/dealer access, account deletion, and no-account fallback. Exclude actual records, eligibility decisions, and customer UI.

### Functional and privacy acceptance criteria

- [ ] Purchaser and current owner are distinct roles; orders never auto-create ownership.
- [ ] Saved machine and verified ownership are distinct states.
- [ ] Every private read/write identifies subject, actor, purpose, authority, and audit expectation.
- [ ] Retention, deletion/export, incident response, and least-privilege staff access have accountable owners.
- [ ] Private machine/service data is forbidden on public Product metafields.

### Accessibility and responsive requirements

Future claim/correction/transfer flows must expose status without color alone, preserve focus, give recoverable errors, and work at mobile widths and 200% zoom.

### Automated validation opportunities

Authorization/IDOR fixtures, cross-customer access denial, transfer/revocation race cases, duplicate claims, deleted accounts, missing products, audit immutability, and public-metafield prohibition.

### Dependencies, approvals, and human decisions

O-DEC-003/004/005; O-DEP-002/007. Legal, Privacy, Security, Support, and Product Owner approval is mandatory.

### Risk, rollback, and evidence expectations

Primary risk is unauthorized disclosure or false ownership. No implementation should begin; future rollback must revoke access without deleting required audit evidence.

## O-PBI-003 — Select native, app, or custom account architecture with total cost and exit plan

**Status:** Proposed
**Evidence state:** Official extension feasibility is documented; Rhino apps, plan, backend, budget, operator, and protected-data approvals are unverified
**Implementation owner / responsibility class:** Product Owner, Engineering, Epic Q, Privacy, and Finance / architecture and governance
**Work area:** App and integration architecture
**Implementation mode:** Options/decision record
**Type:** Enabler
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Proposed batch / milestone:** O1 / O0 Product Owner planning
**Repository work:** Compare native accounts, account UI extension plus customer metafields, and extension plus private backend across permissions, security, cost, accessibility, performance, operations, export, and removal.
**Shopify Admin / configuration work:** None; an install, capability request, checkout/accounts editor change, or app publication needs a separate prompt.

### Customer or business problem

Speculative account features can create recurring cost, vendor lock-in, protected-data exposure, and an unsupported backend before basic value is proven.

### Evidence and current state

The repository is a theme, not a general customer-account app. The app register lists only Search & Discovery as an unaudited candidate. Official docs support new-account extensions, but protected customer data and backend calls have explicit requirements.

### Proposed outcome

A Product Owner-approved architecture choice for each selected capability, including no-build, with three-year total cost and a tested exit path.

### Scope and exclusions

Include app type/distribution, scopes, protected-data level, hosting/storage, support, monitoring, accessibility, performance, migration/export, deletion, and uninstall. Exclude scaffolding, installation, API access requests, or deployment.

### Functional and privacy acceptance criteria

- [ ] Every non-native capability names the required application/system or explicitly says none.
- [ ] Least-privilege scopes and protected-data fields are justified by purpose.
- [ ] Fixed, usage, hosting, maintenance, review, and exit costs are documented.
- [ ] Q app register/privacy checklist and removal/data-export plan are complete before selection.

### Accessibility and responsive requirements

Architecture requires Shopify-supported components where applicable, keyboard/focus/error behavior, reflow at 320 px, 200% zoom, and manual assistive-technology review.

### Automated validation opportunities

Manifest/scopes allowlist, forbidden scope and secret tests, bundle/performance budget, dependency inventory, uninstall/no-backend failure fixtures, and data deletion/export contract tests.

### Dependencies, approvals, and human decisions

O-DEC-012/015; O-DEP-001/009/012. Product Owner, Q, Privacy, Finance, and Engineering decide per capability.

### Risk, rollback, and evidence expectations

Do not let a proof of concept become an installed dependency. Preserve native fallback and require export/removal evidence before production approval.

## O-PBI-004 — Deliver the minimum accessible account shell for orders, addresses, and navigation

**Status:** Proposed
**Evidence state:** Legacy repository order/address pages exist; new-account native experience and live configuration are unverified
**Implementation owner / responsibility class:** Engineering, Shopify Admin, Accessibility QA / bounded customer experience
**Work area:** Orders, addresses, account navigation, accessibility, mobile
**Implementation mode:** Native configuration and verification first; theme fallback only if justified
**Type:** Feature
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** High
**Proposed batch / milestone:** O2 / O1 returning-customer MVP
**Repository work:** Preserve account entry and validate applicable legacy fallback without duplicating new-account pages.
**Shopify Admin / configuration work:** Configure sign-in, branding, navigation, and draft/publish state only after account-mode decision and implementation authorization.

### Customer or business problem

Returning customers need a reliable path to orders, statuses, profile, and addresses before Rhino invests in ownership or personalization.

### Evidence and current state

`main-account.liquid` paginates orders and links order details/addresses; `main-addresses.liquid` manages saved addresses; the header conditionally links account/login. New customer accounts are managed outside the theme.

### Proposed outcome

One coherent, native-first account entry with usable orders, addresses/profile, logout, navigation, empty/error states, and mobile accessibility.

### Scope and exclusions

Include entry redirects, return paths, navigation labels, address actions, empty/pagination states, and branding. Exclude ownership, warranty, service records, recommendations, tracking pixels, and marketing.

### Functional and privacy acceptance criteria

- [ ] Signed-out entry reaches the configured Shopify sign-in without redirect loops.
- [ ] Signed-in users reach only their own orders/profile/addresses through Shopify authorization.
- [ ] Empty, paginated, unavailable, and error states are clear and recoverable.
- [ ] No order/customer detail appears in URLs, analytics artifacts, screenshots, or repository evidence.

### Accessibility and responsive requirements

Keyboard-only, visible focus, headings/landmarks, table/card semantics, status not color-only, 200%/400% zoom as applicable, and 320/360/390/768/1024/1440 px without horizontal loss.

### Automated validation opportunities

Static route checks, redirect-loop fixtures, Playwright anonymous/authenticated fixtures without real customers, axe, keyboard focus, mobile/reflow, long localized strings, pagination, and safe screenshot redaction.

### Dependencies, approvals, and human decisions

O-DEC-001/002; O-DEP-001. Requires Product Owner review and later bounded implementation authorization.

### Risk, rollback, and evidence expectations

Risk is breaking sign-in or editing obsolete Liquid while new accounts ignore it. Keep Admin configuration draftable; record exact pre-change state and revert within the documented Shopify window if needed.

## O-PBI-005 — Validate native Buy again and safe cart reconciliation

**Status:** Proposed
**Evidence state:** Official new-account Buy again capability documented; no Rhino live verification and no legacy reorder control in repository
**Implementation owner / responsibility class:** Engineering, Shopify Admin, Epic J, and QA / native journey verification
**Work area:** Order history and reorder
**Implementation mode:** Native-first validation; no custom reorder until a proven gap
**Type:** Feature
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** High
**Proposed batch / milestone:** O2 / O1 returning-customer MVP
**Repository work:** Specify deterministic catalog/cart fixtures and reuse Epic J quantity/error recovery.
**Shopify Admin / configuration work:** Later verify Buy again with authorized test data only; do not access real customer orders.

### Customer or business problem

Repeat buyers need a quick path back to purchasable variants without silently adding unavailable, replaced, or changed items.

### Evidence and current state

Legacy order detail renders historic line items but no reorder action. Official current customer accounts support Buy again. Epic G provides public reorder paths; Epic J owns cart reconciliation.

### Proposed outcome

Accept native Buy again when it handles current variants safely; document gaps before considering a custom control.

### Scope and exclusions

Include current/deleted/unpublished/sold-out/changed variants, quantities, pricing, availability, cart errors, and back navigation. Exclude recurring subscriptions, recommendations, ownership, and warranty.

### Functional and privacy acceptance criteria

- [ ] Reorder uses current catalog/variant/price/availability and never promises historic terms.
- [ ] Unavailable or missing items fail visibly without losing successful additions.
- [ ] Cart quantity reconciliation follows Epic J and remains editable.
- [ ] Order access never implies ownership, compatibility, or warranty eligibility.

### Accessibility and responsive requirements

Buy again and failure summaries need accessible names, keyboard operation, announced status, focus recovery, touch targets, and narrow-screen reflow.

### Automated validation opportunities

Fixtures for mixed available/unavailable lines, deleted variants, quantity limits, network failure, partial add, duplicate activation, price change, axe, keyboard, and mobile.

### Dependencies, approvals, and human decisions

O-DEC-001/002; O-DEP-001/004/005. Product Owner decides whether native behavior is sufficient.

### Risk, rollback, and evidence expectations

Custom reorder can duplicate Shopify or Epic J and mishandle partial failure. Prefer no custom code; any later enhancement must be removable and fall back to Product links.

## O-PBI-006 — Define saved-machine claims without treating purchases as ownership

**Status:** Proposed
**Evidence state:** Exact machine Products exist; no saved-machine or authorized ownership record exists
**Implementation owner / responsibility class:** Product Owner, Engineering, Privacy, Support, and Product Data / cross-Epic interface
**Work area:** Saved machines and ownership
**Implementation mode:** Contract/feasibility before feature
**Type:** Enabler
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Low
**Proposed batch / milestone:** O3 / O2 conditional owner resources
**Repository work:** Define saved interest versus claimed/verified ownership, exact Product identity, provenance, authorization, transfer, and safe resource projection.
**Shopify Admin / configuration work:** No customer metafields, app pages, or private records until O-PBI-002/003 approvals.

### Customer or business problem

Machine-specific parts and manuals are useful, but a bookmark is not proof that the account owns or may view private history for a machine.

### Evidence and current state

Epic E provides Product identity/class; machine family values are incomplete. Epic F/G provide approved presentation/compatibility. No account persistence or ownership source exists.

### Proposed outcome

A model where anyone may save public machine interest, while verified ownership is a distinct private claim with explicit authority.

### Scope and exclusions

Include save/unsave, Product deletion/unpublication, duplicates, gifts/used machines, transfer/dispute, no-account fallback, and public/private resource distinction. Exclude auto-linking orders and service/warranty claims.

### Functional and privacy acceptance criteria

- [ ] Saved, claimed, and verified-owned states are visibly and structurally distinct.
- [ ] Order history never creates or upgrades ownership.
- [ ] Only exact approved Product identity is used; titles/handles/tags are not authority.
- [ ] Unauthorized viewers receive no existence leak about private records.

### Accessibility and responsive requirements

Stateful controls expose name/state, work by keyboard/touch, announce results without focus loss, and remain usable at 320 px and 200% zoom.

### Automated validation opportunities

Authorization matrix, save/unsave idempotency, transfer/revocation, deleted/unpublished Product, cross-account denial, stale identity, missing family, and public-resource fallback.

### Dependencies, approvals, and human decisions

O-DEC-003/005/015; O-DEP-002/003/007/009. Product Owner must justify app/backend cost before implementation.

### Risk, rollback, and evidence expectations

Highest risk is false authority. Rollback must remove account UI and revoke access while retaining approved audit/legal records and allowing export/deletion obligations.

## O-PBI-007 — Define registration and serial-number handling as separate private claims

**Status:** Deferred
**Evidence state:** Epic L registration effect, serial formats, privacy purpose, processor, access, retention, and warranty rules are unresolved
**Implementation owner / responsibility class:** Epic L, Product Owner, Legal, Privacy, Support, and Engineering / policy-bound interface
**Work area:** Registration and serial numbers
**Implementation mode:** Deferred interface definition
**Type:** Enabler
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Low
**Proposed batch / milestone:** O3 / deferred until Epic L approval
**Repository work:** Later define validation levels, duplicate/dispute states, provenance, correction, and no-warranty-effect default.
**Shopify Admin / configuration work:** No form, customer metafield, serial storage, or account block is authorized.

### Customer or business problem

Registration can help support identify machines, but ambiguous serial rules and warranty wording could mislead customers or expose sensitive identifiers.

### Evidence and current state

There is no approved serial format or registry. Epic L explicitly marks serial collection disallowed and registration effect unresolved.

### Proposed outcome

If later approved, registration records a bounded claim and serial under private controls; it never creates warranty eligibility by itself.

### Scope and exclusions

Include optional/required rationale, legacy/unknown serials, duplicates, validation authority, corrections, transfers, retention, deletion/export, and recovery. Exclude warranty decisions and public metafields.

### Functional and privacy acceptance criteria

- [ ] Registration and warranty eligibility remain independent.
- [ ] Serial purpose, necessity, processor, access, retention, deletion/export, and recovery are approved before collection.
- [ ] Raw serials never enter URLs, analytics, screenshots, logs, or public Product data.
- [ ] Duplicate or disputed serials fail closed to staff review without revealing another account.

### Accessibility and responsive requirements

Future forms need explicit labels/help/errors, retained non-sensitive input, summary focus, autocomplete only where appropriate, touch targets, reflow, and no timeout barrier.

### Automated validation opportunities

Sanitized serial-format fixtures, duplicate/collision, cross-account disclosure, malformed/legacy states, retry/uncertain submission, privacy scan, and no-warranty-claim test.

### Dependencies, approvals, and human decisions

O-DEC-004/005/007; O-DEP-007/008; L-DEC-003/009/010. Remain Deferred until Legal/Privacy/Support approve.

### Risk, rollback, and evidence expectations

Risk is collecting unnecessary persistent identifiers or implying coverage. No activation exists to roll back; a future system needs purge/revocation and manual recovery plans.

## O-PBI-008 — Expose saved compatible parts only from current approved compatibility edges

**Status:** Proposed
**Evidence state:** Epic G has exact compatibility contracts and partial preview evidence; no saved account list exists
**Implementation owner / responsibility class:** Epic G, Product Data, Engineering, and Privacy / contract consumer
**Work area:** Saved compatible parts
**Implementation mode:** Conditional account persistence
**Type:** Feature
**Priority:** P1
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Proposed batch / milestone:** O3 / O2 conditional owner resources
**Repository work:** Consume `rhino.compatible_machines` exact references, freshness/revocation, current Variant availability, and saved-list states.
**Shopify Admin / configuration work:** No customer metafield, extension, or saved-list activation without O-PBI-003/Q approval.

### Customer or business problem

Owners want a repeat path to parts, but stale fit or a generic “recommended” list can cause costly mistakes.

### Evidence and current state

Epic G treats absence as unknown, not incompatible, and separates fit, included, optional, and recommended relations. Thirty-nine Product rows carried approved edges in its discovery evidence; current production/revocation status is partial.

### Proposed outcome

Let an authorized customer save current Product/Variant links while deriving the “compatible” label only from a fresh approved edge.

### Scope and exclusions

Include save/unsave, current price/availability, revoked/missing fit, deleted Product/Variant, machine-context label, and public anonymous fallback. Exclude inferred recommendations and automatic replenishment.

### Functional and privacy acceptance criteria

- [ ] A compatibility label requires a current exact approved edge.
- [ ] Saving an item never creates compatibility, ownership, or recommendation authority.
- [ ] Revoked, stale, missing, or unpublished relations suppress the claim and offer a neutral path.
- [ ] Saved data has retention, deletion/export, and account authorization rules.

### Accessibility and responsive requirements

Saved state, fit context, price/availability changes, and errors are programmatically exposed; cards/actions reflow and remain keyboard/touch usable.

### Automated validation opportunities

Approved/revoked/stale/absent edges, multi-machine fit, deleted products, changed variants, sold out, cross-account denial, axe, keyboard, and 320 px reflow.

### Dependencies, approvals, and human decisions

O-DEC-003/013/015; O-DEP-002/004/009. G/Product Data own fit; O owns saved state only.

### Risk, rollback, and evidence expectations

Risk is presenting cached fit as current. Roll back account persistence/UI without changing G source data; retain a public Product-link fallback.

## O-PBI-009 — Link owned-machine context to approved downloadable manuals

**Status:** Proposed
**Evidence state:** Three manual routes were route-approved and more candidates exist, but the canonical resource catalog has zero publication-approved records
**Implementation owner / responsibility class:** Epic L, Technical, Content, Product Data, and Engineering / approved-resource consumer
**Work area:** Downloadable manuals
**Implementation mode:** Conditional public-resource projection
**Type:** Feature
**Priority:** P1
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Proposed batch / milestone:** O3 / O2 conditional owner resources
**Repository work:** Link exact Product identity to approved current public resources with revision/language/accessibility metadata and safe missing state.
**Shopify Admin / configuration work:** File/Page publication and Product resource values require separate Epic L/E mutation plans.

### Customer or business problem

Returning customers need the right current manual without navigating a large library or receiving an obsolete/private file.

### Evidence and current state

`manual_files` is an approved Product definition concept, while `support_files` is Admin-only. Route existence and candidate Files do not approve version, rights, accessibility, or Product mapping.

### Proposed outcome

Show approved public manuals in machine context, regardless of whether machine interest or ownership is saved; fail neutrally when no approved resource exists.

### Scope and exclusions

Include exact mapping, current/superseded revision, language, file type/size, rights, accessible alternative, link integrity, and no-account public fallback. Exclude service records and private support files.

### Functional and privacy acceptance criteria

- [ ] Only current publication-approved resources render.
- [ ] Product mapping is exact and does not depend on title, family, order, or serial inference.
- [ ] Superseded/missing/inaccessible resources suppress or provide an approved alternative.
- [ ] Public manuals remain public resources; account presence does not create disclosure authority.

### Accessibility and responsive requirements

Links name format/size/language where useful, PDFs have an approved accessibility disposition, focus remains visible, and list/card layouts reflow.

### Automated validation opportunities

File/reference/link/revision/language/rights/mapping checks, orphan/duplicate/superseded cases, inaccessible-PDF gate, deleted Product, mobile/keyboard/axe tests.

### Dependencies, approvals, and human decisions

O-DEC-006/015; O-DEP-002/003/007. Epic L/Technical/Content approve resources; O only presents them.

### Risk, rollback, and evidence expectations

Risk is publishing stale or inaccessible instructions. Rollback removes the projection/link while preserving the canonical resource record and version history.

## O-PBI-010 — Define warranty-status presentation without deciding eligibility

**Status:** Deferred
**Evidence state:** Zero approved warranty policies/mappings; registration effect and proof rules unresolved
**Implementation owner / responsibility class:** Epic L, Legal, Business, Product Data, Support, and Engineering / policy consumer
**Work area:** Warranty status
**Implementation mode:** Deferred interface contract only
**Type:** Enabler
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Low
**Proposed batch / milestone:** O3 / deferred until Epic L warranty approval
**Repository work:** Later define exact policy/version/mapping/eligibility evidence and safe unknown/needs-review states.
**Shopify Admin / configuration work:** No warranty values, status display, or customer claim is authorized.

### Customer or business problem

Customers want clarity, but a calculated date or “covered” label without authoritative policy can create a false legal promise.

### Evidence and current state

Epic L decision packets contain no approved policy or Product mapping. An order date, registration, serial, or saved machine is insufficient by itself.

### Proposed outcome

If policy is approved, expose a versioned status derived by the authorized system; otherwise show no status or neutral contact guidance.

### Scope and exclusions

Include issuer, policy version, Product mapping, coverage trigger, transfer, proof, geography, effective dates, manual review, corrections, and audit. Exclude deciding those rules in code.

### Functional and privacy acceptance criteria

- [ ] No eligibility is inferred from purchase, registration, serial, or ownership alone.
- [ ] Every visible status binds to an approved policy version, evidence, calculation owner, and effective period.
- [ ] Unknown/conflicting/stale data fails closed without a coverage or denial claim.
- [ ] Reasons reveal only what the authenticated viewer is authorized to see.

### Accessibility and responsive requirements

Future status/reason/action must be textually clear, not color-only, screen-reader ordered, zoom/reflow safe, and operable without hover.

### Automated validation opportunities

Missing/revoked/stale policy, transfer, conflicting dates, unknown owner, registration-only, order-only, unauthorized viewer, time-zone boundary, and no-claim fixtures.

### Dependencies, approvals, and human decisions

O-DEC-004/007; O-DEP-002/007; L-DEC-001–004/010. Legal and business approval is mandatory.

### Risk, rollback, and evidence expectations

Warranty overclaim is critical. Keep Deferred; future rollback must suppress status immediately while preserving audit and correction channels.

## O-PBI-011 — Assess private support-history feasibility and disclosure authority

**Status:** Deferred
**Evidence state:** No service system of record, approved lifecycle, disclosure policy, or funded account backend exists
**Implementation owner / responsibility class:** Epic L, Support Operations, Privacy, Security, Engineering, and Product Owner / feasibility
**Work area:** Support history
**Implementation mode:** Deferred security and value assessment
**Type:** Discovery
**Priority:** P2
**Impact:** Medium
**Effort:** XL
**Confidence:** Low
**Proposed batch / milestone:** O3 / post-MVP candidate
**Repository work:** Model only record ownership, authorized views, redaction, corrections, retention, export/deletion, audit, outage, and incident response.
**Shopify Admin / configuration work:** No customer/service queries, imports, extension pages, or staff workflow changes.

### Customer or business problem

Visible service history could reduce support friction, but private notes, uploads, diagnoses, and third-party ownership make it the highest-risk account capability.

### Evidence and current state

Epic L service-record data is unapproved and not collected by its foundation. Native account order history is not a service-history platform.

### Proposed outcome

A go/no-go assessment based on customer value, operational maturity, privacy/security exposure, app/backend cost, and safe partial disclosure.

### Scope and exclusions

Include request/status timeline boundaries, private staff notes, attachments, machine transfer, requester versus owner, redaction, disputes, retention, audit, export/deletion, and no-account service. Exclude implementing a CRM or exposing raw records.

### Functional and privacy acceptance criteria

- [ ] Account history and service history remain separate domains.
- [ ] Authentication alone never authorizes a service record.
- [ ] Field-level disclosure, staff/private notes, attachments, and transfer rules are approved.
- [ ] A no-build option and operational cost are evaluated honestly.

### Accessibility and responsive requirements

Any future timeline/status must use semantic structure, readable dates, accessible attachments, keyboard actions, clear errors, narrow-screen reflow, and reduced-motion support.

### Automated validation opportunities

IDOR/authorization matrix, redaction, attachment access, transfer/revocation, deleted account, staff-note exclusion, audit integrity, outage/stale status, export/deletion, axe, and mobile tests.

### Dependencies, approvals, and human decisions

O-DEC-005/008/015; O-DEP-007/009. Support Operations and Product Owner must prove value/capacity; Privacy/Security approve the design.

### Risk, rollback, and evidence expectations

Risk includes severe disclosure and operational misrepresentation. Keep Deferred; future release requires staged access, kill switch, revocation, and incident playbook.

## O-PBI-012 — Assess dealer and wholesale account access against the approved program

**Status:** Deferred
**Evidence state:** Official Shopify B2B capability documented; Rhino plan, program, companies, catalogs, pricing, roles, and live configuration unverified
**Implementation owner / responsibility class:** Business, Sales Operations, Finance, Legal, and Shopify Admin / commercial program
**Work area:** Wholesale and dealer access
**Implementation mode:** Deferred business and plan assessment
**Type:** Discovery
**Priority:** P2
**Impact:** Medium
**Effort:** L
**Confidence:** Low
**Proposed batch / milestone:** O4 / post-MVP commercial accounts
**Repository work:** Later define role/permission/price/content isolation, approval, suspension, and test contracts.
**Shopify Admin / configuration work:** No company, catalog, customer, payment-term, or B2B configuration is authorized.

### Customer or business problem

Dealers or institutions may need negotiated access, but an account role without a real program, contracts, pricing, and operators creates commercial and privacy risk.

### Evidence and current state

Current official docs say B2B is available on supported plans with feature limits, but Rhino plan and program are unknown. Repository legacy accounts do not prove B2B.

### Proposed outcome

Decide whether native Shopify B2B satisfies an approved program, with exact plan limits and operating ownership, or keep the capability deferred.

### Scope and exclusions

Include company/location/contact roles, eligibility, catalogs, pricing, terms, orders, suspension, staff access, blended-store behavior, and audit. Exclude inventing a dealer program or exposing D2C customers to B2B data.

### Functional and privacy acceptance criteria

- [ ] Program, eligibility, contracts, pricing, payment terms, and owners are approved first.
- [ ] Current plan/features and B2B account mode are verified from authorized Admin evidence.
- [ ] Company/location/contact permissions prevent cross-company access.
- [ ] Suspension/removal and price/content fallback behavior are defined.

### Accessibility and responsive requirements

Company/location selectors, balances, catalogs, and errors must be keyboard/screen-reader/touch accessible and mobile usable in the native account surface.

### Automated validation opportunities

Role/company/location authorization, catalog isolation, inactive contacts, suspended company, mixed D2C/B2B, price/term changes, 500-line limits where relevant, axe, and mobile.

### Dependencies, approvals, and human decisions

O-DEC-001/009; O-DEP-001/012. Business/Finance/Legal approve program; Shopify Admin verifies plan and configuration.

### Risk, rollback, and evidence expectations

Risk is wrong pricing or cross-company disclosure. Remain Deferred; future rollout needs bounded companies, configuration backup, readback, and suspension/rollback tests.

## O-PBI-013 — Define evidence-backed tax-exempt customer and company workflows

**Status:** Deferred
**Evidence state:** Shopify supports customer/company tax settings; Rhino certificate, jurisdiction, approval, review, and owner process are absent
**Implementation owner / responsibility class:** Finance/Tax, Legal, Operations, and Shopify Admin / regulated operations
**Work area:** Tax-exempt workflows
**Implementation mode:** Deferred policy and operating design
**Type:** Enabler
**Priority:** P2
**Impact:** High
**Effort:** M
**Confidence:** Low
**Proposed batch / milestone:** O4 / post-MVP commercial accounts
**Repository work:** Define intake evidence references, approval state, expiry/review, audit, rejection/correction, and test expectations without storing certificates publicly.
**Shopify Admin / configuration work:** No customer/company tax setting may change without authorized Finance/Tax procedure.

### Customer or business problem

Eligible organizations need correct tax treatment, but incorrect exemptions can create financial and legal exposure.

### Evidence and current state

Official docs describe tax-exempt customer and company-location settings and advise consulting tax authority. No Rhino process or current settings are verified.

### Proposed outcome

A Finance/Tax-owned workflow for evidence, approval, Admin application, periodic review, correction, and audit.

### Scope and exclusions

Include jurisdiction, evidence location, reviewer, effective/expiry dates, customer/company location binding, tax-inclusive caveats, denial/correction, and privacy. Exclude legal advice and automated approval.

### Functional and privacy acceptance criteria

- [ ] Finance/Tax authority approves criteria and each operating role.
- [ ] Evidence documents remain private and are not stored in theme settings or public metafields.
- [ ] Admin changes bind to the correct customer/company location and are read back.
- [ ] Expiry, revocation, checkout correction, and customer communication are defined.

### Accessibility and responsive requirements

Any future submission/status flow must have accessible document instructions, errors, status, keyboard/touch operation, and mobile reflow.

### Automated validation opportunities

Wrong customer/location, expired/revoked evidence, tax-inclusive pricing, duplicate submissions, readback mismatch, unauthorized staff, audit, and privacy-scan fixtures.

### Dependencies, approvals, and human decisions

O-DEC-001/010; O-DEP-001/012. Finance/Tax and Legal are accountable; Product Owner cannot substitute for tax authority.

### Risk, rollback, and evidence expectations

Risk is under/overcollection. Remain Deferred; future rollback follows Finance/Tax direction and must preserve audit evidence rather than silently toggling settings.

## O-PBI-014 — Define purchase-order and payment-term workflows

**Status:** Deferred
**Evidence state:** Native B2B/draft-order PO fields are documented; Rhino plan, approval limits, payment terms, reconciliation, and operating owner are unverified
**Implementation owner / responsibility class:** Finance, Sales Operations, Shopify Admin, and Engineering / commercial operations
**Work area:** Purchase orders
**Implementation mode:** Deferred operating and configuration design
**Type:** Feature
**Priority:** P2
**Impact:** Medium
**Effort:** L
**Confidence:** Low
**Proposed batch / milestone:** O4 / post-MVP commercial accounts
**Repository work:** Later define state machine, idempotency, duplicate/expiry/correction, payment-term and reconciliation tests.
**Shopify Admin / configuration work:** No B2B, draft-order, invoice, payment-term, deposit, or PO configuration/action is authorized.

### Customer or business problem

Institutional buyers may require POs and terms, but an account field alone does not establish credit approval, order acceptance, or reconciliation.

### Evidence and current state

Epic K has draft-order infrastructure for a different delivery/quote purpose and must not be repurposed silently. Official B2B draft orders support PO numbers and terms under plan/config rules.

### Proposed outcome

A Finance-owned workflow choosing native B2B/draft orders when sufficient and naming any ERP/accounting integration only if required.

### Scope and exclusions

Include company/contact authority, PO format/uniqueness, limits, approvals, terms, deposits, draft acceptance, invoice, cancellation, reconciliation, audit, and failure recovery. Exclude granting credit or reusing K quote data without approval.

### Functional and privacy acceptance criteria

- [ ] Approved company/contact and payment-term authority precedes PO use.
- [ ] PO receipt is not order acceptance until the approved state transition occurs.
- [ ] Duplicate/retry/uncertain and correction paths are idempotent and auditable.
- [ ] Any external accounting/ERP dependency is explicit, scoped, secured, and removable.

### Accessibility and responsive requirements

PO entry, approval status, invoices, errors, and outstanding-payment actions must be keyboard/screen-reader/mobile accessible.

### Automated validation opportunities

Duplicate PO, wrong company, expired terms, approval limit, retry/uncertain state, draft-to-order transition, invoice failure, reconciliation mismatch, authorization, axe, and mobile.

### Dependencies, approvals, and human decisions

O-DEC-001/011; O-DEP-001/006/012. Finance/Sales Operations approve process; Epic K boundary review is required.

### Risk, rollback, and evidence expectations

Risk is unauthorized credit/order creation or duplicate commitments. Remain Deferred; future rollback stops intake safely and reconciles in-flight drafts rather than deleting evidence.

## O-PBI-015 — Evaluate account-specific recommendations without inventing fit

**Status:** Deferred
**Evidence state:** Native/product recommendation surfaces exist generally; no approved account-specific rule, purpose, app, or measurement plan exists
**Implementation owner / responsibility class:** Product Owner, Product Data, Epic Q, Privacy, and Engineering / optional personalization
**Work area:** Account-specific product recommendations
**Implementation mode:** Deferred value and governance assessment
**Type:** Discovery
**Priority:** P3
**Impact:** Low
**Effort:** L
**Confidence:** Low
**Proposed batch / milestone:** O5 / post-MVP optional retention
**Repository work:** If prioritized, define evidence, eligibility, explanation, suppression, and no-fit-inference contracts.
**Shopify Admin / configuration work:** No Search & Discovery/app/account block/pixel configuration is authorized.

### Customer or business problem

Personalization could aid repeat purchase, but irrelevant or unsafe suggestions damage trust and can be mistaken for machine compatibility.

### Evidence and current state

The app register lists Search & Discovery only as an unaudited candidate. Epic G states native related products are not proof of fit or approval.

### Proposed outcome

A go/no-go decision using measurable customer value and explicit recommendation sources, never ownership or compatibility inference.

### Scope and exclusions

Include purpose, eligible source data, explanation, suppression, unavailable items, frequency, consent/measurement, app cost, and manual override. Exclude compatibility, warranty, safety, or individualized professional advice.

### Functional and privacy acceptance criteria

- [ ] Every recommendation identifies its authorized rule/source and current eligibility.
- [ ] Compatibility language appears only with an approved exact G edge.
- [ ] Private ownership/order/service data use has approved purpose and minimization.
- [ ] A no-personalization state is useful and never blocks account tasks.

### Accessibility and responsive requirements

Recommendations follow account reading order, have descriptive links, avoid carousels unless fully accessible, and work with keyboard, zoom, reduced motion, and mobile.

### Automated validation opportunities

Unknown/stale/revoked source, absent fit, unavailable/deleted products, explanation/suppression, privacy consent, cross-account isolation, performance, axe, and mobile.

### Dependencies, approvals, and human decisions

O-DEC-012/013/015; O-DEP-002/004/009/010. Keep Deferred unless Product Owner demonstrates value.

### Risk, rollback, and evidence expectations

Risk is false fit, profiling, and app overhead. Rollback removes the block/service and tracking while preserving core account navigation.

## O-PBI-016 — Evaluate back-in-stock subscriptions and consent-safe recovery

**Status:** Proposed
**Evidence state:** No repository implementation; current Admin/app/messaging capability and consent configuration unverified
**Implementation owner / responsibility class:** Product Owner, Marketing, Privacy, Epic Q, and Engineering / optional notification
**Work area:** Back-in-stock subscriptions
**Implementation mode:** Native/app capability assessment
**Type:** Feature
**Priority:** P2
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Proposed batch / milestone:** O5 / post-MVP optional retention
**Repository work:** Define subscription identity, Variant binding, consent, deduplication, delivery, unsubscribe, expiry, failure, and deletion/export tests.
**Shopify Admin / configuration work:** No app, flow, segment, form, or message activation is authorized.

### Customer or business problem

Customers want notification when a specific item returns, but duplicate or consentless messages create frustration and compliance risk.

### Evidence and current state

No Rhino theme capability or approved app is recorded. Account presence is neither consent nor a reason to subscribe every saved item.

### Proposed outcome

Select no-build, a governed app, or native capability after current audit; bind explicit subscription to exact Product/Variant and customer-approved channel.

### Scope and exclusions

Include subscribe/confirm/unsubscribe, exact Variant, channel, consent evidence, duplicate requests, stock flapping, deletion, expiry, failed delivery, and app removal/export. Exclude marketing enrollment by default.

### Functional and privacy acceptance criteria

- [ ] Subscription is explicit, Variant-specific where relevant, and not inferred from save/order/account.
- [ ] Purpose, consent, retention, unsubscribe, deletion/export, processor, and owner are approved.
- [ ] Repeated stock changes and duplicate events cannot spam customers.
- [ ] Unavailable communication service does not block Product purchase paths.

### Accessibility and responsive requirements

Forms/status/errors have labels, announced confirmation, focus recovery, touch targets, reflow, and no CAPTCHA barrier without accessible alternative.

### Automated validation opportunities

Duplicate subscribe, wrong Variant, consent withdrawal, stock flapping, retry/duplicate send, expired request, deletion, provider outage, secret/PII logs, axe, and mobile.

### Dependencies, approvals, and human decisions

O-DEC-012/014/015; O-DEP-009/010/011. Q and Privacy approval precede any provider selection.

### Risk, rollback, and evidence expectations

Risk is spam, stale subscriptions, or vendor lock-in. Future rollback disables capture/sending, exports/deletes required data, and removes injected storefront assets.

## O-PBI-017 — Evaluate a portable wishlist with guest-to-account merge

**Status:** Deferred
**Evidence state:** No wishlist implementation, selected app, portability model, or demonstrated MVP value
**Implementation owner / responsibility class:** Product Owner, Epic Q, Privacy, and Engineering / optional persistence
**Work area:** Wishlist
**Implementation mode:** Deferred value and app assessment
**Type:** Feature
**Priority:** P3
**Impact:** Low
**Effort:** L
**Confidence:** Low
**Proposed batch / milestone:** O5 / post-MVP optional retention
**Repository work:** If prioritized, define guest storage, authenticated merge, Product/Variant identity, deletion/export, availability, and portability.
**Shopify Admin / configuration work:** No app installation, account page, app block, embed, or script is authorized.

### Customer or business problem

A wishlist may help long-consideration purchases, but it is not necessary for basic order/address/reorder value and often adds app lock-in.

### Evidence and current state

Official full-page account extensions can host wishlists; this establishes feasibility only. No Rhino need or current system is verified.

### Proposed outcome

Keep Deferred until evidence supports investment; if selected, require portable, deletable saved Product/Variant references and a safe guest merge.

### Scope and exclusions

Include save/unsave, guest/account merge/conflict, duplicate, unavailable/deleted products, export/delete, sharing decision, privacy, and uninstall. Exclude ownership, fit, reservations, and price guarantees.

### Functional and privacy acceptance criteria

- [ ] Saved item is not ownership, compatibility, reservation, or price protection.
- [ ] Guest data merge is explicit and cannot expose another browser/account's list.
- [ ] Export, deletion, vendor exit, and deleted Product handling are proven.
- [ ] Core shopping/account tasks work with the app unavailable.

### Accessibility and responsive requirements

Save state and feedback are named/announced, keyboard/touch operable, visible at zoom, and lists reflow without drag-only interactions.

### Automated validation opportunities

Guest/account merge conflicts, duplicate saves, cross-account/session isolation, deleted/sold-out variants, provider outage, export/delete, uninstall remnants, performance, axe, and mobile.

### Dependencies, approvals, and human decisions

O-DEC-012/015; O-DEP-009/010. Product Owner must justify post-MVP value and Q must approve any app.

### Risk, rollback, and evidence expectations

Risk is script/performance/privacy cost for low value. Rollback removes all blocks/scripts and preserves a documented export before vendor removal.

## O-PBI-018 — Preserve saved-comparison and recently-viewed interfaces without restarting Epic I

**Status:** Deferred
**Evidence state:** Epic I is explicitly post-O; no approved comparison dataset, persistence, behavioral tracking, consent, or app exists
**Implementation owner / responsibility class:** Epic I, Product Owner, Privacy, Epic Q, and Engineering / deferred interface
**Work area:** Saved comparisons and recently viewed
**Implementation mode:** Interface definition only
**Type:** Enabler
**Priority:** P3
**Impact:** Low
**Effort:** L
**Confidence:** Low
**Proposed batch / milestone:** O5 / post-MVP after Epic I
**Repository work:** Preserve stable Product identity and optional future list interfaces; implement neither comparison logic nor behavioral history.
**Shopify Admin / configuration work:** No app, pixel, storage, account page, or comparison configuration is authorized.

### Customer or business problem

Customers may want to resume research, but building comparison/tracking in O would restart deferred Epic I and create privacy/performance cost.

### Evidence and current state

The approved roadmap explicitly defers I. D's comparison handoff requires approved structured facts. No recently-viewed tracker is registered.

### Proposed outcome

Document future IDs, consent and deletion boundaries while keeping both experiences Deferred and non-rendered.

### Scope and exclusions

Include future stable Product/Variant references, guest/account choice, expiry/delete, unavailable products, consent classification, and I handoff. Exclude comparison criteria, ranking, recommendations, or tracking code.

### Functional and privacy acceptance criteria

- [ ] Epic I remains Deferred and owns comparison meaning/data/UI.
- [ ] Recently viewed is not collected until purpose, consent, retention, processor, and deletion are approved.
- [ ] Future saved state cannot imply ownership, fit, recommendation, availability, or price.
- [ ] No hidden app/pixel/runtime requirement is introduced.

### Accessibility and responsive requirements

Future lists/comparisons require semantic tables/cards, keyboard operation, zoom/reflow, status text, and non-drag alternatives; no current conformance claim is made.

### Automated validation opportunities

Validator requires explicit H/I/M/N deferral; future tests cover consent, expiry/delete, cross-account isolation, missing/stale facts, reflow, keyboard, and performance.

### Dependencies, approvals, and human decisions

O-DEC-012/015/016; O-DEP-009/010. Epic I must be reactivated by a later Product Owner decision, not by Epic O.

### Risk, rollback, and evidence expectations

Risk is roadmap drift and covert behavioral tracking. Current rollback is no implementation; any future tool needs kill switch, data purge/export, and asset removal.

## O-PBI-019 — Define consumable reminders and account onboarding with Epic X

**Status:** Deferred
**Evidence state:** No approved cadence, consumption model, audience, consent, content, messaging processor, or Epic X acceptance
**Implementation owner / responsibility class:** Epic X, Marketing, Privacy, Product Owner, Support, and Engineering / lifecycle interface
**Work area:** Reorder reminders and onboarding
**Implementation mode:** Deferred cross-Epic contract
**Type:** Enabler
**Priority:** P2
**Impact:** Medium
**Effort:** L
**Confidence:** Low
**Proposed batch / milestone:** O5 / post-MVP optional lifecycle
**Repository work:** Define purpose, data inputs, audience, cadence, suppression/stop, consent, content authority, and aggregate measures.
**Shopify Admin / configuration work:** No Flow/Messaging/email segment, automation, or send is authorized.

### Customer or business problem

Relevant onboarding and replenishment can help, but machine use varies and guessed timing can become spam or an unsafe recommendation.

### Evidence and current state

Epic G provides public repeat-purchase paths, not consumption rates. Epic X owns follow-up; Epic L resources/policies are approval-constrained.

### Proposed outcome

Define a future opt-in, explainable lifecycle interface; retain anonymous/public reorder and account self-service without messages as the baseline.

### Scope and exclusions

Include transactional versus marketing purpose, explicit/derived audience, machine/product evidence, cadence, quiet/stop rules, consent withdrawal, bounce/failure, support onboarding resources, and deletion. Exclude guessed replacement intervals and automatic sends.

### Functional and privacy acceptance criteria

- [ ] No reminder is inferred solely from ownership, order age, or generic consumption assumptions.
- [ ] Purpose, audience, consent, content, cadence, suppression, stop, and owner are approved.
- [ ] Product compatibility/recommendation and resource claims use current approved sources.
- [ ] Customers can opt out without losing account/order/service access.

### Accessibility and responsive requirements

Email/account content must use semantic headings/links, plain-language alternatives, readable mobile layout, accessible preference controls, and non-color status.

### Automated validation opportunities

Wrong audience, missing consent, withdrawal, duplicate sends, stale fit/resource, unavailable item, frequency cap, bounce/provider outage, stop rule, PII analytics, and accessible email fixtures.

### Dependencies, approvals, and human decisions

O-DEC-013/014/016; O-DEP-004/010/011. Epic X, Privacy, Legal, Marketing, and Product Owner must accept the interface.

### Risk, rollback, and evidence expectations

Risk is spam, unsafe timing, and marketing/service confusion. Remain Deferred; future rollback halts sends, reconciles queues, preserves consent audit, and keeps account usable.

## O-PBI-020 — Run integrated account, privacy, accessibility, responsive, and release acceptance

**Status:** Proposed
**Evidence state:** Planning gate only; no selected Epic O implementation or live account evidence exists
**Implementation owner / responsibility class:** QA, Accessibility, Privacy, Security, Engineering, Operations, and Product Owner / final acceptance
**Work area:** Integrated quality and release governance
**Implementation mode:** Evidence aggregation and separately authorized release gate
**Type:** QA / release
**Priority:** P0
**Impact:** High
**Effort:** XL
**Confidence:** Medium
**Proposed batch / milestone:** O6 / selected-scope release gate
**Repository work:** Aggregate only selected PBIs across static, fixture, browser, authorization, privacy, security, performance, rollback, and evidence validators.
**Shopify Admin / configuration work:** Later use sanitized test accounts and exact readbacks only under separate authorization; production action remains separate.

### Customer or business problem

Account features span theme, Shopify-hosted pages, apps, private data, operations, and messages; a green repository test alone cannot prove a safe release.

### Evidence and current state

Existing QA covers parts of header/account entry and legacy templates. There is no Epic O live test matrix, authorized customer fixture, Admin snapshot, or release scope.

### Proposed outcome

One release packet that distinguishes repository, Admin/configuration, app/backend, privacy/security, operations, communication, and production evidence for the bounded approved scope.

### Scope and exclusions

Include anonymous/authenticated authorization, account mode, orders/addresses/reorder, selected optional features, failures, accessibility, mobile/zoom, performance, data lifecycle, rollback, monitoring, and deferred inventory. Exclude real customer data and unselected PBIs.

### Functional and privacy acceptance criteria

- [ ] Every released capability has current authority, implementation, verification, operator, rollback, and monitoring evidence.
- [ ] Cross-account/IDOR, ownership, warranty, service disclosure, consent, and secret/PII gates pass.
- [ ] Deferred/rejected PBIs remain absent and H/I/M/N remain deferred.
- [ ] Planning or test approval is never treated as production authorization.
- [ ] Exact Admin/app/theme/backend readback is separate from repository results.

### Accessibility and responsive requirements

Keyboard, focus, screen reader, automated axe, 200% and applicable 400% zoom, reduced motion, touch, long text, and 320/360/390/768/1024/1440 px coverage; document native/app limitations and human review.

### Automated validation opportunities

Run the Epic O validator plus selected repository validators, authorization/security fixtures, app/backend contract tests, Playwright account matrices with synthetic data, performance budgets, privacy scans, and rollback/readback comparators.

### Dependencies, approvals, and human decisions

O-DEC-001/005/015/016; O-DEP-001–012; all selected PBI gates. Product Owner chooses scope and later authorizes release separately.

### Risk, rollback, and evidence expectations

Risk is collapsing different evidence planes or leaking synthetic/real customer information. Stop on any identity/store/scope mismatch; require executable rollback, app kill switch where relevant, reconciled in-flight work, and sanitized immutable evidence.
