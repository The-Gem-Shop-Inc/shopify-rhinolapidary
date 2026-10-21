# Rhino Lapidary Epic G PBI Handoff Package

**Epic:** Epic G — Parts, Accessories, and Consumables  
**Prepared:** 2026-10-15  
**Status:** G-PBI-001 COMPLETE; G-PBI-002 and G-PBI-004 COMPLETE within approved preview scope. G-PBI-003 remains PARTIAL for private revocation/production operations; G-PBI-005 remains preview verified/PARTIAL for two historical PNGs. G-PBI-006 remains PARTIAL. G-PBI-007 is recommended COMPLETE within bounded technical preview QA after targeted recovery (2026-10-20); four approved prices/title and 31 eligible links are verified. Fit expires October 20 at 17:06:42.312 UTC. MAIN is unchanged; production remains unauthorized.
**Authority:** [Master Epic G backlog](Rhino%20Lapidary%20Storefront%20Backlog%20and%20Epics.md#epic-g--parts-accessories-and-consumables), [current discovery and capability gap matrix](project/epic-g-discovery.md), [small required decision packet](project/epic-g-required-decisions.md).

Continue the existing E/F data architecture and Trade theme. F is parked at working MVP machine-page handoff; formal closure is unnecessary. **Epic O is the MVP boundary. After G, proceed to J and applicable K/L/O work; H/I/M/N remain post-O.** Source binding verified: `b90bf2089788e77c04fbdd5bd1766bc4d03cfb9e358179884a47b74095be949b`.

## Evidence and planning rules

Fresh reads reconcile 122 Products / 125 Variants; G has 111 Products / 114 Variants. Classes: machine 11, replacement_part 54, consumable 39, accessory 18. Forty approved directed fit edges cover 39 G Products; 31 edges have published machine destinations. F already supplies the reverse cards. All G pages use the ordinary template. No G SKUs or optional attribute/resource/family values exist. The original six zero-price exceptions now have four approved/applied prices and two native zero-price Variants. The attachment's $75 price and exact title are explicitly approved in the October 20 successor. MR16 and Saw Vice remain the two commercial launch blockers; see the current G006 ledger. Exact identities and current observations are preserved in G4 evidence.

Use exact approved Product references; titles/tags/types/collections/families never prove fit. Reuse native purchase state, current grants and expiry. Existing Products suffice; omit unsupported optional data. Keep safe no-media/no-SKU/no-resource states. Preserve unrelated workspace work and historical receipts. New implementation must be separately undertaken; this document does not mark observational audit scripts as G-PBI-001/007 completion.

## Proposed PBI index

| PBI | Title | Priority | Effort | Batch | Disposition | Status |
|---|---|---|---|---|---|---|
| G-PBI-001 | Bind Epic G consumers to current E/F approvals and catalog roles | P0 | M | G1 foundation | IMPLEMENT_PRE_MVP | COMPLETE — G1 repository foundation, current read verified |
| G-PBI-002 | Keep ordinary Product detail safe and show SKU only when useful | P1 | M | G2 Product experience | IMPLEMENT_PRE_MVP | COMPLETE — bounded current-catalog preview scope |
| G-PBI-003 | Render approved Fits these machines on existing G Product pages | P0 | M | G2 compatibility | IMPLEMENT_PRE_MVP | PARTIAL — preview deployed/verified; private revocation and production operations outstanding |
| G-PBI-004 | Expose existing machine-to-products paths through the F reverse projection | P1 | M | G3 relationship navigation | IMPLEMENT_PRE_MVP | COMPLETE — approved preview scope |
| G-PBI-005 | Provide a small role index and anonymous consumable reorder entry | P1 | M | G3 reorder/navigation | IMPLEMENT_PRE_MVP | Preview verified — task PARTIAL: two historical QA PNGs overwritten |
| G-PBI-006 | Resolve commercial readiness of the six published zero-price G Products | P0 | S | G1 parallel decision; G4 affected-item closure | IMPLEMENT_PRE_MVP | PARTIAL — four applied prices verified; two launch blockers remain |
| G-PBI-007 | Validate the integrated G journeys, accessibility and current-state drift | P0 | M | G4 integrated handoff | IMPLEMENT_PRE_MVP | COMPLETE recommendation — bounded technical preview QA; commercial and production gates separate |
| G-PBI-008 | Prepare the minimum future item-attribute contract without blocking G | P2 | S | Optional contract preparation | PREPARE_CONTRACT_ONLY | Proposed — not implemented |
| G-PBI-009 | Preserve approved-resource and downstream ownership/reorder interfaces | P2 | S | Optional contract preparation | PREPARE_CONTRACT_ONLY | Proposed — not implemented |
| G-PBI-010 | Retain the Saw Vice split and two fit edges as deferred catalog work | P2 | M | Post-MVP or separately authorized catalog maintenance | DEFER_POST_MVP | Proposed — not implemented |

## Dependency-first batches

| Batch | PBIs | Outcome / dependencies |
|---|---|---|
| G1 | 001 | Current role/approval/drift/readiness contract. Recommended first implementation batch. |
| G2 | 002,003 | After 001: safe ordinary Product detail and approved forward fit. |
| G3 | 004,005 | Reuse F reverse paths, then bounded existing-route role/reorder links. |
| G4 | 006,007 | 006 decision work starts in parallel from G1; resolve affected-item readiness, then integrated G validation. |
| Optional contract preparation | 008,009 | E/H attributes and L/O interfaces; do not block G1–G4. |
| Deferred catalog | 010 | Saw Vice split and two blocked edges; only under future explicit scope. |

**Count:** 10 PBIs: seven IMPLEMENT_PRE_MVP, two PREPARE_CONTRACT_ONLY, one DEFER_POST_MVP. Subscriptions, bundles/multipacks, frequently bought together, alerts, kits, QR, global filters, comparison and account features are recorded in the discovery matrix rather than inflated into pre-MVP tickets. Highest risks: 003 false-fit claims; 005 scope/pagination; 006 owner-dependent commercial readiness; 007 source/native-state/accessibility validity. 004 must preserve F projection and lookup budget.

The core sequence is 001 → (002,003) → 004 → 005 → 007, with 006 parallel and required only at its affected-item commercial boundary before 007 handoff. 008/009/010 are not hidden dependencies.

## Common implementation boundaries

- No new Product, Variant, collection, Page, metaobject, subscription, bundle, account or QR architecture merely to satisfy a backlog bullet.
- Shopify/API/theming changes, deployment and release are future execution tasks with then-current scope and evidence; discovery authorization does not authorize them.
- Preserve Saw Vice's two blocked edges; unpublished JadeMaster is not a customer link. No LapMaster variable-speed or 40-gallon TumbleMaster prerequisite.
- F-PBI-015B stays PARKED_RELEASE_GATE / BLOCKED_MEASUREMENT_INTEGRITY; F-PBI-018B stays deferred NOT_READY; future F media/resources remain conditional.
- 006 is the only immediate owner packet; unanswered does not mean approved. SKU allocation, grit, drawings, kits and split questions can wait.
- O receives exact identities/fit/current availability contracts, not account implementation; H receives future platform/attribute filters after O.

## G-PBI-001 — Bind Epic G consumers to current E/F approvals and catalog roles

**Status:** COMPLETE — G1 repository foundation, 2026-10-16. [Implementation record](project/implementation-records/g-pbi-001-batch-g1.md) · [Consumer contract](architecture/epic-g-foundation-contract.md) · [Current readiness evidence](qa/evidence/epic-g/g1-2026-10-16/readiness.json). Approval/observation expiry still applies; this is not perpetual eligibility or a G release signoff.  
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** Data contracts and discovery evidence  
**Type:** Enabler  
**Priority:** P0  
**Impact:** Prevents false fit and competing catalog authority  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** G1 foundation  
**Suggested GitHub labels:** `epic:g`, `priority:p0`, `status:proposed`, `mvp`  
**Disposition:** IMPLEMENT_PRE_MVP

### Problem / opportunity

Historical E/F registers preserve candidate or superseded states. G needs current class, relationship, publication and freshness checks before extending customer surfaces.

### Evidence

Fresh 122/125 Product/Variant read; all classes reconciled; 39 compatibility values/40 edges; all 45 MAIN runtime files match b90bf…; no family instances; default Product JSON semantically matches. Discovery summary and Admin artifacts are the baseline, not perpetual truth. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

One additive G eligibility/readiness contract consuming E approval and F reconciliation, with automated current-state evidence. Document continued default-template use and proposed route ownership.

### Scope

- Reuse rhino.product_class, compatible_machines, E exact identities, granted values and receipt lifecycle; keep fit/included/optional/recommended meanings distinct.
- Produce read-only per-class/Variant SKU, price, inventory, media, resource and attribute-readiness reports. Include all 111 G Products, including the 72 with no fit.
- Compare exact full reference lists and source/target visibility, schema/type, source digest and time; reject orphan, duplicate, unknown-class, unsupported/inferred or stale edges.
- Record ADR-0001's nonmachine template proposals as unnecessary for the evidenced MVP, in a bounded follow-up decision; do not require a new template or registry.

### Out of scope

- Creating definitions/values/Products; F signoff; approval renewal by reading; consumer feature implementation; catalog normalization.

### Acceptance criteria

- [x] Current live read reconciles all Product/Variant GIDs and class values without title/tag/type inference; complete pagination and failures are explicit.
- [x] Every eligible fit value matches an approved current exact set; JadeMaster nine edges remain data-approved but customer-link ineligible; Saw Vice two edges absent.
- [x] Unknown/changed/expired references fail closed with a reason; missing SKU/media/resources are reported separately from fit eligibility.
- [x] Evidence validates current-source digests and read-only operation inventory; freshness cannot be extended merely by regenerating a report.

### Implementation handoff

Extend existing scripts/lib/epic-e-readiness.js, epic-f-consumer.js and owner-release conventions only where appropriate; create G-specific adapters/assertions rather than modifying immutable F receipts. Add meaningful negative fixtures. Discovery harnesses are observational inputs, not a completed contract.

### Success measure

122 Products and 125 Variants accounted for; zero unsupported eligibility grants; deterministic failure reasons.

### Dependencies

Current E classifications/identities, exact owner release and F binding; no formal F closure.

### Risks / cautions

Treating historical candidates or public metafield existence as approval; silently renewing receipt; making optional missing data universal blockers.

### Testing / validation

Unit checks for exact multi-machine lists, revoked/expired grants, unpublished targets, class drift and orphan handles; schema/read-only query checks; compare current Admin against approved source.

### Human / Admin dependencies

None for architecture/current read. E owner approval remains mandatory for future new values, outside this PBI.

### Automation opportunities

Read-only drift refresh, classification coverage, SKU/media gap reports, exact reference-set and no-inferred-fit assertions.

### Downstream consumers

G-002–007; E/F; H later; J/K/L/O.

### Blockers / open questions

No blocking owner question for G1. F historical stale prose must not override the current bound release.

## G-PBI-002 — Keep ordinary Product detail safe and show SKU only when useful

**Status:** COMPLETE — bounded current-catalog preview scope. [Recovery and actual preview evidence](project/implementation-records/g-pbi-002-003-recovery.md). Production deployed: No; public customer visible on MAIN: No.
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** Default Product template and native commerce  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Preserves buying and improves identity without a new template  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** G2 Product experience  
**Suggested GitHub labels:** `epic:g`, `priority:p1`, `status:complete`, `mvp`  
**Disposition:** IMPLEMENT_PRE_MVP

### Problem / opportunity

The existing default template works, but empty SKU containers announce no useful identifier; missing image/description pages have little context. Cloning machine templates would add complexity.

### Evidence

111 G Products use default template; all 114 SKUs blank; five descriptions and 24 Product galleries absent. Four Saw Blade native Size Variants already work. Water Guard is visibly Sold out despite aggregate availability. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

One default Product experience retains native identity, price, Variant/quantity/purchase and availability; blank content collapses, real approved SKUs display and update by selection.

### Scope

- Use templates/product.json and shared main-product with governed class conditions; no machine-page layout transplant.
- Suppress the whole SKU row when native SKU is blank; show a named/copyable selectable value when an approved issued SKU exists; never display registry proposals as native values.
- Preserve native current-market purchase state, errors, price, quantity and Variant URL; retain four Size options as native commerce data.
- Keep existing permissible images/prose; collapse missing modules; use neutral Contact/product URL for support when facts/resources are unavailable. Target identity media alt behavior only where useful, without wholesale new content.
- Address the observed zero-size native lightbox toggle: provide a usable native image affordance or intentional plain-image presentation, preserving machine gallery containment.

### Out of scope

- New class templates, SKU assignment/allocation, pricing changes, marketing rewrite, stock policy, parsed dimensions, new images or unapproved instructions.

### Acceptance criteria

- [x] Available item remains orderable through existing controls; sold-out item stays disabled; do not override native state with Admin aggregate quantities.
- [x] Blank SKU produces no empty visible/accessibility announcement; populated approved fixture updates exact SKU with selected Variant.
- [x] Saw Blade 6/8/14/18 selections retain exact Variant IDs and $15/$25/$75/$125 baseline prices unless current Admin changes legitimately.
- [x] No-media/no-description/no-fit pages have no empty headings or broken controls; approved native media remains available.
- [x] Configured image interaction is keyboard/pointer usable, or an explicit plain-image presentation omits inaccessible empty lightbox controls; no new gallery system is introduced.
- [x] Machine template behavior, existing F fact/media containment and native Related products semantics remain intact.

### Implementation handoff

Reuse main-product block implementation and native product-info update lifecycle; guard classes with the current role contract. Preserve original SKU issuer and E registry. Do not turn anonymous Shopify IDs or legacy aliases into displayed SKUs.

### Success measure

All three G roles pass native purchase/empty-content checks; zero empty SKU rows; no Product template assignment writes.

### Dependencies

G-PBI-001. Price decisions in 006 are independent per Product; no SKU population prerequisite.

### Risks / cautions

A shared-section edit can regress F or Variant updates; hiding whole Product information because optional content is absent.

### Testing / validation

Browser available/unavailable, native Variant/quantity, empty/populated SKU, missing media/description fixtures; run product-template and current F guard checks appropriate to changed shared files.

### Human / Admin dependencies

No new data decision required for blank-safe behavior. Real SKU values remain E-approved allocation work; targeted $0 decisions in 006.

### Automation opportunities

Product-role page assertions, native control regression, SKU update/blank assertions and media inventory report.

### Downstream consumers

G-003/005/007; J checkout; L support; O future reorder.

### Blockers / open questions

No template/business question blocks safe page behavior. Commercial readiness of six zero-priced items is explicitly separate.

## G-PBI-003 — Render approved Fits these machines on existing G Product pages

**Status:** PARTIAL — preview deployed/verified; private revocation and production operations outstanding. [Recovery and actual preview evidence](project/implementation-records/g-pbi-002-003-recovery.md). Production deployed: No; public customer visible on MAIN: No.
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** Forward compatibility  
**Type:** Feature  
**Priority:** P0  
**Impact:** Lets a buyer confirm an exact approved machine match  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** G2 compatibility  
**Suggested GitHub labels:** `epic:g`, `priority:p0`, `status:partial`, `mvp`  
**Disposition:** IMPLEMENT_PRE_MVP

### Problem / opportunity

Ordinary Product pages do not surface their approved compatible_machines references, even when exact fit has been reconciled.

### Evidence

40 edges on 39 Products; 31 edges point to five published machines; nine point to unpublished JadeMaster. Automatic Feed Clamp has two approved SawMaster targets. Saw Vice has zero live edges. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

A small conditional forward-fit module on the default Product template links only current eligible exact machines.

### Scope

- Consume approved full Product-reference lists directly, with E/F eligibility, current source/target identity, class, visibility and freshness checks.
- Allow one-to-many matches; preserve the clamp's two targets; distinguish unavailable targets from unknown fit internally.
- Withhold unknown, removed, unapproved, unpublished or expired relationships; do not emit an empty fit heading. A neutral Contact link may provide recovery.
- Label links as approved fit only; keep Related products and included/optional/recommended information semantically separate.

### Out of scope

- New compatibility assertions, family-derived matches, negative-fit claims, dimension matching, Saw Vice split, approval of JadeMaster publication, a general selector/filter service.

### Acceptance criteria

- [x] All eligible current published-target edges render once in deterministic order; exact list/value comparison is enforced before any claim.
- [x] The clamp links SawMaster 18 and 24; the JadeMaster-only belt guard has no dead machine/fit link; Saw Vice has no fit claim.
- [x] Missing fit on the other 72 Products does not imply incompatible or hide purchase controls.
- [ ] Expired/revoked/source-drifted approval suppresses output; source removal is reflected without stale static links.
- [x] Native link names, headings and focus order work on mobile/desktop; structured data/metadata do not introduce unsupported fit claims.

### Implementation handoff

Use native product.metafields.rhino.compatible_machines.value plus an E/F approval-bound G consumer. A public reference is data access, not approval. Add a conditional shared snippet rather than another Product section/controller.

### Success measure

Zero false/dead fit links; all 31 currently eligible edges representable; no false claim for nine unpublished-target edges or two blocked Saw Vice edges.

### Dependencies

G-PBI-001 and shared page integration with G-PBI-002; current E approval/receipt and publication.

### Risks / cautions

Highest risk: false technical compatibility from stale grants, partial-list matching or unapproved catalog observations.

### Testing / validation

Positive single/two-machine, missing, unpublished, orphan, class mismatch, changed full set, expiry/revocation, Saw Vice suppression and keyboard/axe tests.

### Human / Admin dependencies

None for the current 40 approved edges; no extra owner worksheet. Any newly proposed relationship remains E-owned.

### Automation opportunities

Exact-edge renderer assertions and no-inferred-compatibility checks across DOM, metadata and generated projection.

### Downstream consumers

G-004/007; O future ownership; H exact fit later.

### Blockers / open questions

Nine JadeMaster links unavailable today, not a global blocker. Two Saw Vice edges explicitly deferred.

Current G2 residual: immediate private revocation/absolute expiry remains PARTIAL under Shopify cache/browser-clock limitations. Production revalidation cadence and emergency withdrawal are recommendations, not approved operating policy. Preview link coverage is verified; this is not a G3 implementation blocker.

## G-PBI-004 — Expose existing machine-to-products paths through the F reverse projection

**Status:** COMPLETE — approved preview scope; repository implemented, preview deployed and verified. Production deployed/customer-visible on MAIN: No. [G3A implementation and evidence](project/implementation-records/g-pbi-004-batch-g3a.md).  
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** Machine-context discovery  
**Type:** Feature  
**Priority:** P1  
**Impact:** Find parts for a known machine with minimal new runtime  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** G3 relationship navigation  
**Suggested GitHub labels:** `epic:g`, `priority:p1`, `status:complete`, `mvp`  
**Disposition:** IMPLEMENT_PRE_MVP

### Problem / opportunity

Usable machine cards already exist, but buyers lack a clear parts journey; legacy named parts collections can be empty or contain unapproved matches.

### Evidence

F already renders 12/7/1/1/10 cards on EM-1/LapMaster18/SawMaster18/SawMaster24/TrimMaster. Three existing machine-parts collections are empty; EM-1 Parts has 49 members, only 12 approved fit Products. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

A narrow machine-context entry routes buyers to the existing published machine Product and its exact compatible-items section.

### Scope

- Reuse F dependent→machine reverse output; add only necessary anchors/entry semantics and approved exact machine navigation.
- Offer published machines with results; for no-known-match machines use a clear neutral state/contact and do not imply no parts exist.
- Preserve current source/target grants and F lookup budget; make G indexes projection consumers, not additional relationship authorities.
- Record any native named collection as general browse only unless each shown fit claim is independently edge-approved.

### Out of scope

- Standalone parts landing Page creation, new relationship metaobjects, collection membership rewrite, unpublished machine exposure, broad filters or comparison.

### Acceptance criteria

- [x] Machine entry reaches an actual existing machine route/section with exactly the approved products for that machine.
- [x] Existing five reverse outputs remain complete and deduplicated; no second source of fit data is created.
- [x] JadeMaster and no-edge targets produce no dead/false fit destination; absent edges never mean no replacement exists.
- [x] EM-1 included catalog references plus reverse cards stay within the shared all_products unique-handle budget; membership expansion is bounded/tested.
- [x] Saw Vice is omitted and missing images do not prevent approved text links; ordinary Product destination remains the purchase route.

### Implementation handoff

Reuse scripts/lib/epic-f-customer-release.js and rhino-owner-approved-context shards. Preserve immutable receipts/bindings; any source extension must use established bounded successor evidence. Prefer existing sections/anchors and the current navigation registers.

### Success measure

Five currently usable machine journeys; 31 reverse entries to 30 distinct Products; zero new collections/metaobjects/Pages required.

### Dependencies

G-PBI-001/003; existing F owner context compiler/shards and current bound runtime. Does not depend on F closure.

### Risks / cautions

Duplicating existing F behavior; interpreting EM-1 collection's 49 members as fit; unbounded all_products calls.

### Testing / validation

Exact reverse-forward parity from one source; existing machine card membership regression; empty/unpublished/deleted target tests; anchor/focus and lookup-budget checks.

### Human / Admin dependencies

None for existing exact machine routes. Additional machine publication or fit approvals are separate optional dependencies.

### Automation opportunities

Reverse projection parity, target visibility/drift, link/anchor and lookup budget assertions.

### Downstream consumers

G-005/007; O; C/D entry links.

### Blockers / open questions

No Saw Vice split, variable-speed LapMaster, 40-gallon TumbleMaster, F-015B or F-018B dependency.

## G-PBI-005 — Provide a small role index and anonymous consumable reorder entry

**Status:** PREVIEW VERIFIED; task acceptance PARTIAL for two historical QA PNG preservation failures — repository implemented; preview deployed and verified on 158631198917; production not deployed; MAIN customer visibility: No.  
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** Existing-route navigation and reorder  
**Type:** Feature  
**Priority:** P1  
**Impact:** Makes existing sellable Products reachable without catalog jargon  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** G3 reorder/navigation  
**Suggested GitHub labels:** `epic:g`, `priority:p1`, `status:partial`, `mvp`  
**Disposition:** IMPLEMENT_PRE_MVP

### Problem / opportunity

No aggregate G destination exists; the MAIN homepage/menu offers generic Catalog/Contact. Consumables beyond narrow collections are hard to reach without internal names.

### Evidence

Parts/accessories/consumables candidate collections and parts-for-my-machine Page return 404. /collections/all is live; 39 governed consumables include 42 Variants. MAIN homepage differs from local D fallback state. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

A compact class-grouped existing-Product link index hosted on verified /collections/all, plus bounded named entry links and existing machine-context paths.

### Scope

- Use existing /collections/all as the preferred host; three simple Product-role groups, current exact identity/class guards and native Product URLs. No invented collection/Page handles.
- Integrate a single bounded collection traversal/pagination strategy; cover all current eligible items beyond the normal 50-item iteration limit; avoid 111 all_products lookups or duplicate image grids.
- Connect the index and machine-context links to C/D route records, menu/theme surfaces only as needed; refresh MAIN/preview parity before a later deployment.
- Keep anonymous reorder at Product/Variant/quantity level. Preserve legitimate native option selection and optional Variant URLs; maintain safe empty/changed/unpublished states.

### Out of scope

- Search & Discovery changes, predictive search, faceted search, full collection taxonomy, global sorting/merchandising, account history, new Page/collection creation, unrelated D homepage rollout.

### Acceptance criteria

- [x] Each G role has a named working existing-route entry; links reach existing eligible Products without requiring SKUs, internal catalog names or account state.
- [x] Current eligible 111-Product/114-Variant inventory is fully accounted for, with any six-item commercial exclusions explicitly owner-disposed rather than silently omitted.
- [x] Role grouping uses approved class, never title/tag/type/collection inference; no group claims machine fit without a separately approved edge.
- [x] No duplicate conflicting pagers, silent truncation at 20/50, or stale links after publication/handle drift; growth beyond current count has explicit pagination behavior.
- [x] New fragments/anchors resolve before route approval; native generic catalog behavior is preserved outside the narrow surface; keyboard/mobile and no-JS link use work.

### Implementation handoff

Read data/navigation-spec.json, global-navigation-ia.json, homepage-section-outcomes.json and D-PBI-016 record. Select bounded collection.products traversal and native pagination; verify official Liquid limits. If a new Page would become necessary, report that explicit dependency rather than creating it under this PBI. Do not claim this discovery approved new handles.

### Success measure

A returning buyer can reach every currently eligible consumable and select/purchase its existing Variant via an anonymous journey; no H platform introduced.

### Dependencies

G-PBI-001/004; G-PBI-002 native Product path; existing C/D route/navigation contracts. 006 controls affected-item commercial readiness.

### Risks / cautions

Highest scope risk: absorbing H. Technical risks: collection pagination/20-lookup limits, duplicate grids, MAIN/local homepage drift and promoting unresolved zero prices.

### Testing / validation

Route contract gates; complete class membership across pages; no title parsing/inferred fit; links/anchors/mobile/keyboard; native catalog behavior and source parity checks.

### Human / Admin dependencies

No business decision required to use the observed route. Six-item prices/holds in 006 affect those items, not host architecture. New Admin destination would require explicit later scope if proven necessary.

### Automation opportunities

Route/role coverage, pagination boundary, current identity/publication, anonymous reorder and homepage entry assertions.

### Downstream consumers

C/D; G-007; O later; H later receives bounded route/role contract.

### Blockers / open questions

All functional G005 preview criteria pass. Task-level preservation remains partial: two older machine PNGs were overwritten by the historical harness before asynchronous output isolation was corrected; exact backup originals were unavailable. See the implementation report and strict protection reporter failure. Production rollout requires separately authorized target-specific revalidation; source receipt expires October 22, 2026. Six-item commercial readiness remains G006; expired G2 fit presentation and private revocation remain separate.

### Verified implementation

[October 19 G3B report](project/implementation-records/g-pbi-005-batch-g3b.md): actual Shopify coverage of all 111 G Products/114 Variants, all five G3A machine routes, single 150-item pager with 20/50/150/250 growth fixtures, keyboard/no-JS/axe at 390px and 1440px, native Variant/quantity/gallery/cart behavior, seven scoped preview files reconciled and all 438 MAIN checksums unchanged. Fresh MAIN inspection proved Catalog was a disclosure without an aggregate link; one Parts and supplies child was separately guarded and deployed in native mega menu/drawer. No Admin menu or homepage mutation.

## G-PBI-006 — Resolve commercial readiness of the six published zero-price G Products

**Status:** PARTIAL — four approved/applied prices freshly verified: attachment $75, Arbor Wrench $12, Automatic Feed Clamp $65.50, LapMaster Lap Bolt $5.75. The exact attachment title is approved/applied as 6 in Trim Saw Attachment (EM-1); handle trim-saw-6 and both identifiers are preserved. MR16 price/replacement specification is deferred; Saw Vice Product/Variant structure and mapping remain unapproved. Both generic native prices remain $0.00 and commercial launch blockers. No purchase mitigation is inferred.  
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** Targeted catalog commercial readiness  
**Type:** Dependency / business decision  
**Priority:** P0  
**Impact:** Prevents silently treating unresolved $0 items as commercially ready  
**Effort:** S  
**Confidence:** High evidence; owner-dependent outcome  
**Suggested milestone:** G1 parallel decision; G4 affected-item closure  
**Suggested GitHub labels:** `epic:g`, `priority:p0`, `status:proposed`, `mvp`  
**Disposition:** IMPLEMENT_PRE_MVP

### Problem / opportunity

Six active published G Products have $0 Variants, and sampled native pages allow Add to cart. Discovery cannot decide whether these are intentional free items or missing prices.

### Evidence

6 in Trim Saw, Arbor Wrench, Automatic Feed Clamp, LapMaster Lap Bolt, MR16 LED Bulb and Saw Vice Plate Set; exact Product/Variant GIDs and current prices in docs/project/epic-g-required-decisions.md. No free-sale authority was found. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

An explicit per-Product or whole-group disposition: intentional free sale with evidence, approved price, or scoped defer/hold. Other G work proceeds.

### Scope

- Obtain only the six-item decision; permit explicit defer. Prefill all identities/prices; do not add catalog normalization, SKU, grit or split questions.
- Bind any approved price/status/promotion disposition to exact Product and Variant IDs; keep Saw Vice price separate from compatibility split.
- Prepare a bounded implementation/read-before/after validation handoff for any later required commerce or routing change; do not infer an automatic theme-wide zero-price rule.
- Record affected-item readiness honestly; if owner defers an item, specify the launch boundary that implements that exclusion and verify it later.

### Out of scope

- Automatic repricing, blanket disabling of all $0 Products, assumed holds, inferred free gifts, creating Products or Variants, fixing unrelated prices/inventory.

### Acceptance criteria

- [x] Every one of six current rows has an explicit owner disposition or remains visibly blocked; no unanswered row is treated as approved.
- [ ] Intentional-free decisions record evidence; approved-price decisions specify exact Variant and value/currency; defers specify actual affected-item publication/purchase/promotion boundary.
- [ ] A mere omission from new G navigation is not represented as disabling an already live Product purchase path.
- [ ] Any subsequent authorized mutation has immediate exact before-read and after evidence; planning alone is not readiness closure.
- [x] All unrelated G PBIs can progress independently; Saw Vice split and two fit edges stay deferred.

### Implementation handoff

Use the decision packet, native price/publication authority and J commercial handoff. Keep any execution separate from discovery. If no response, retain Product-scoped blocker and do not invent an action or certify all items ready.

### Success measure

Six of six rows explicitly resolved or explicitly deferred with a concrete launch boundary; no accidental free-sale readiness claim.

### Dependencies

G-PBI-001 exact inventory; Product Owner response in the small decision packet. Later Admin writes require separately bounded authorization.

### Risks / cautions

Blocking all G for six rows; assuming default answer/elapsed time is approval; falsely equating promotion suppression with a real purchase hold.

### Testing / validation

Exact price/status/publication drift checks; later authorized change reconciliation and native page state. No checkout transaction required in discovery; J owns checkout.

### Human / Admin dependencies

Latest owner disposition is recorded in [the current commercial ledger](project/epic-g-required-decisions.md): four exact applied prices and the attachment title are now approved and verified. MR16 procurement/replacement specification/price remains deferred; Saw Vice model prices lack approved Product/Variant structure and mapping. These two native zero-price entries remain commercial launch blockers. No mitigation or compatibility grant is inferred.

### Automation opportunities

Read-only zero-price exception audit keyed to exact Variant GIDs; owner-decision coverage and later before/after reconciliation.

### Downstream consumers

G-005/007; J pricing/checkout; E catalog owner.

### Blockers / open questions

G-DEC-001 remains PARTIAL for commercial launch: deferred MR16 replacement/price and Saw Vice exact commerce mapping. Owner-authorized development proceeds. Deferral does not implement a purchase hold or approve zero-price sale.

## G-PBI-007 — Validate the integrated G journeys, accessibility and current-state drift

**Status:** COMPLETE recommendation for bounded technical preview QA — exact approved native successor, 31 current eligible links at 390/1440, twelve responsive cases and four real zoom cases verified. One generated fit snippet was refreshed on unpublished preview; lease expires 2026-10-20T17:06:42.312Z. G006 remains PARTIAL with two commercial exceptions; G003/G005 and inherited C/F defects remain open. [Targeted recovery](project/implementation-records/g-pbi-007-targeted-recovery.md) · [Historical G4 record](project/implementation-records/g-pbi-007-batch-g4.md) · [Integrated contract](architecture/epic-g-integrated-qa-contract.md)  
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** Automation and MVP handoff  
**Type:** Validation  
**Priority:** P0  
**Impact:** Proves G customer paths without claiming deferred work complete  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** G4 integrated handoff  
**Suggested GitHub labels:** `epic:g`, `priority:p0`, `status:proposed`, `mvp`  
**Disposition:** IMPLEMENT_PRE_MVP

### Problem / opportunity

F machine QA does not certify new ordinary-page fit, anonymous reorder, role coverage or native sold-out behavior. Automated no-overflow alone missed heavy header wrapping under text enlargement.

### Evidence

Discovery: 35 route cells/20 main axe runs plus interaction follow-up; no baseline overflow/axe defects observed; global header grows from 63 to 558px at 360px under 200% root text. Water Guard native availability differs from Admin aggregate. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

Reproducible Product-role, fit/reverse, route/reorder, mobile/keyboard/accessibility and drift evidence, with inherited F release gates kept parked.

### Scope

- Meaningful positive/negative tests for three G roles, zero/missing/multiple fit, unpublished target, stale grant, missing image/description/SKU, and exact inverse projection.
- Real available/unavailable and native Saw Blade Variant/price/quantity state; selected approved-SKU fixture; no inferred inventory claims.
- Validate 360/390/desktop, 200% text and browser zoom, heading/link names, visible focus, reflow/readability and safe empty states; coordinate the specific shared-chrome C issue.
- Run current-source Admin/MAIN parity checks and bounded local/authorized preview checks; report evidence age and actual surface. Keep F performance-integrity and final signoff separate.

### Out of scope

- F-015B certification, F-018B final signoff, full-site WCAG certification, paid apps, performance recorder redesign, running real purchase transactions, post-O features.

### Acceptance criteria

- [ ] All implemented G acceptance paths have passing automated evidence, complete class/edge coverage, and no serious/critical storefront-owned accessibility issues.
- [ ] Native availability tests use rendered state; no test treats Admin availableForSale or hidden Sold out labels as actual button state.
- [ ] 200% text/zoom checks assess readability, focus and header obstruction as well as horizontal overflow; shared C issue is resolved or explicitly scoped with evidence before G handoff.
- [ ] Current source drift or expired fit receipt fails eligibility; ignored failures cannot be regenerated away.
- [ ] H/I/M/N/O and parked F work are correctly handed off; 008/009/010 omissions do not falsely fail the defined G scope; commercial exceptions are explicit.

### Implementation handoff

Reuse Playwright/axe and current F guards; avoid writing mirror tests for markup. Include all class inventory in static checks and representative real states in browser checks. Do not reuse discovery's partial first/second interaction attempts as passing certification.

### Success measure

Zero broken new routes, false fit claims or native-control regressions; complete G role/edge accounting and a bounded handoff ready for Epic J.

### Dependencies

G-PBI-001–006 at their explicit scope. Optional 008/009 and deferred 010 are not gates; price defers require explicit bounded disposition.

### Risks / cautions

Overstating a sample/axe pass; root-text header usability; relying on aggregate inventory; conflating test evidence with deployment permission or F closure.

### Testing / validation

Run targeted unit/schema/drift/route/browser suites, shared template/native controls, keyboard/axe/reflow and protected machine regression. Deployment validation only in later authorized scope.

### Human / Admin dependencies

Only unresolved 006 dispositions or an actual discovered release-blocking defect; no broad worksheet.

### Automation opportunities

Integrated role/edge route coverage, invalid inferred-fit detection, Admin drift, native selected-Variant, accessible names/empty rows and mobile assertions.

### Downstream consumers

Epic J onward; C accessibility; E/F current-source consumers; launch gate later.

### Blockers / open questions

No F closure prerequisite. The header text-enlargement observation is a specific QA concern, not silently marked passed.

## G-PBI-008 — Prepare the minimum future item-attribute contract without blocking G

**Status:** Proposed — not implemented  
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** E attribute readiness / H handoff  
**Type:** Contract  
**Priority:** P2  
**Impact:** Avoids false selectors and preserves optional future work  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Optional contract preparation  
**Suggested GitHub labels:** `epic:g`, `priority:p2`, `status:proposed`, `contract-only`  
**Disposition:** PREPARE_CONTRACT_ONLY

### Problem / opportunity

The backlog mentions grit/diameter/arbor/type selectors, but G item fields/values do not exist. Machine specifications and title tokens cannot supply them.

### Evidence

G Rhino values are only product_class and compatible_machines; G Variant metafields empty. B3B-D07 affects nine abrasives plus EM-1 and remains pending. Saw Blade has an existing native Size option. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

A short upstream E contract handoff for optional item attributes and future H consumers, with no new definitions/values/filter UI.

### Scope

- Describe exact item Product/Variant scope, units/geometry/type vocabulary, provenance and approval requirements; preserve machine vs sellable-item distinctions.
- List B3B-D07 grading standard/mixed-grit/pack semantics and exact affected IDs; allow defer without immediate owner questions.
- Keep native Size behavior as existing commerce; require separate governed measurements for cross-Product filters.
- Hand broad filtering to H after O; no second attributes registry.

### Out of scope

- Parsing titles/descriptions, new metafields/metaobjects, population, selectors, family inference, Variant restructuring, required owner worksheet.

### Acceptance criteria

- [ ] Readiness states explicitly say zero approved G item grit/diameter/arbor/blade-type/wheel-type values.
- [ ] B3B-D07 remains unresolved and blocks only the optional attribute consumer; all ten exact affected identities recorded.
- [ ] Minimal E authority/scope/unit/value requirements and H interface are clear; no customer-visible claim or definition is created.
- [ ] Native Saw Blade option is preserved without making it a complete structured diameter contract.

### Implementation handoff

Consume E batch-3b-contracts/decision-packet, technical evidence, identity/Variant architecture; write only a bounded contract note for E/H.

### Success measure

Future selector implementation cannot proceed using title parsing or machine facts; G core proceeds independently.

### Dependencies

G-PBI-001 discovery; E B3B-D07 and typed measurement/Variant architecture. Does not block G-002–007.

### Risks / cautions

Turning preparatory schemas into a new architecture; asking optional questions as launch blockers.

### Testing / validation

Contract review against current definitions/values and exact B3B-D07 rows; documentation consistency checks.

### Human / Admin dependencies

None now. Technical/Product Owner approvals are future E activation dependencies and may be explicitly deferred.

### Automation opportunities

Future attribute-readiness/no-title-parsing gates and exact Product/Variant value approval checks.

### Downstream consumers

E; H after O; G later; O if later useful.

### Blockers / open questions

Optional upstream grading/interface/type decisions unresolved; intentionally not a G MVP blocker.

## G-PBI-009 — Preserve approved-resource and downstream ownership/reorder interfaces

**Status:** Proposed — not implemented  
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** L resources and O identity handoff  
**Type:** Contract  
**Priority:** P2  
**Impact:** Keeps installation/reorder extensions compatible with current data  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Optional contract preparation  
**Suggested GitHub labels:** `epic:g`, `priority:p2`, `status:proposed`, `contract-only`  
**Disposition:** PREPARE_CONTRACT_ONLY

### Problem / opportunity

G lists drawings/instructions, QR, saved ownership and history reorder, but no G resource references or account ownership exist; these should not enlarge the core implementation.

### Evidence

G manual/diagram/instruction/video/support fields unpopulated; no live family instances. E resource canonical approval remains absent; O is the account/reorder owner. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

Small L/O handoff referencing existing contracts: exact Product/Variant/machine IDs, stable verified routes, current approved resources and availability/unknown behavior.

### Scope

- Use E/F canonical resource eligibility (exact File/Product, current revision, customer audience, rights/publication approval); withhold unapproved/support-only content.
- Describe future ordinary-page resource slot conditional on actual approved values; no empty resources section today.
- Hand O Product/Variant identity, fit eligibility/expiry, visibility/availability and deleted/unpublished/no-match behavior; history reorder must use current selected Variant state.
- Record QR/manual lifecycle and resource activation as later work; no ownership schema or account feature in G.

### Out of scope

- File upload/approval, instructions authoring, technical drawings, QR generation, account state, ownership capture, history API, personalized recommendations or resource publication.

### Acceptance criteria

- [ ] Resource handoff reuses existing field meanings/contracts; support_files are not exposed as customer instructions.
- [ ] No resource is considered approved because a legacy manual Page exists; zero current G customer resource slots render without authority.
- [ ] O contract preserves exact IDs, current Variant orderability and approved-fit gating, with missing/deleted/unpublished handling.
- [ ] No new definitions, app, QR, account feature or required owner worksheet results.

### Implementation handoff

Reference data/epic-f-support-resources-contract.json, E resource catalog/definitions and current Product identities; send planning artifacts only, not external messages. L/O implementation remains downstream.

### Success measure

One concise reusable L/O handoff; zero competing resource/account models or unapproved links.

### Dependencies

G-PBI-001; existing E/F/L resource contract and stable Product/Variant identities.

### Risks / cautions

Treating historical 74 File identities as current canonical approvals; implementing O early; conflating included parts with ownership.

### Testing / validation

Contract consistency and no-live-reference assertions; future activation gets real resource accessibility/link checks under L.

### Human / Admin dependencies

No immediate decision. Canonical File/rights and O account rules are future owners' dependencies.

### Automation opportunities

Future resource eligibility/drift/dead-link and exact identity/current-Variant checks.

### Downstream consumers

L/E resources; O accounts/history; H and G later.

### Blockers / open questions

B3B-D06/current resource approval absent; ownership design intentionally downstream, not G core blockers.

## G-PBI-010 — Retain the Saw Vice split and two fit edges as deferred catalog work

**Status:** Proposed — not implemented  
**Epic:** G — Parts, Accessories, and Consumables  
**Work area:** Explicit F-to-G catalog handoff  
**Type:** Deferred dependency  
**Priority:** P2  
**Impact:** Preserves exact future identities without delaying current fit journeys  
**Effort:** M  
**Confidence:** High on deferral; implementation depends on new identity  
**Suggested milestone:** Post-MVP or separately authorized catalog maintenance  
**Suggested GitHub labels:** `epic:g`, `priority:p2`, `status:proposed`, `post-mvp`  
**Disposition:** DEFER_POST_MVP

### Problem / opportunity

One unsplit Saw Vice Product cannot safely represent two distinct approved machine-specific identities. Two edges remain blocked.

### Evidence

Existing gid://shopify/Product/8905784099013; future SawMaster24 Product GID null; BK-450-24/BK-600-24 historical identities in F split preparation; both edges blocked. Current Product also has a separate zero-price decision in 006. See [discovery](project/epic-g-discovery.md) and [machine-readable evidence](qa/evidence/epic-g/2026-10-15-discovery-summary.json).

### Proposed outcome

Keep the two relationships suppressed now; later implement a separately approved exact split and then reconcile the two relationships.

### Scope

- Preserve existing identity, proposed final titles, historical aliases and two blocked edges in a named handoff.
- Require exact technical/commercial identity, price/SKU/media/stock and redirect/route implications before later catalog mutation.
- After an independently authorized split, reconcile exact source GIDs and approved machine references using E/F/G contracts.

### Out of scope

- Any Product/Variant creation now, guessing the new GID, activating either edge early, making the split a G MVP dependency, reopening F signoff.

### Acceptance criteria

- [ ] Current G runtime/tests render neither Saw Vice fit edge while the split is unavailable.
- [ ] Deferred record has exact existing GID, null future GID, named missing authority and owner; never fabricates a handle or assigns proposed SKU.
- [ ] Later activation requires an approved exact split and fresh complete reconciliation; unknown technical differences remain explicit.
- [ ] Price disposition remains separately tracked in 006 and cannot implicitly approve fit.

### Implementation handoff

Consume data/epic-f-saw-vice-catalog-split-preparation.json and docs/project/epic-f-saw-vice-split-preparation.md; do not execute their catalog preparation during G discovery or core MVP work.

### Success measure

Both blocked edges remain unavailable with a clear future path; no delay to the 40 approved edges.

### Dependencies

PO-E-013 split preparation; exact technical differences and new Product GID; explicit Product/commerce creation authorization if later needed.

### Risks / cautions

Silent fit inference from final proposed names; accidental new Product creation; confusing price confirmation with identity split.

### Testing / validation

Negative current Saw Vice forward/reverse assertions; later exact-identity, price/SKU and two-edge reconciliation under authorized maintenance.

### Human / Admin dependencies

Future Technical/Product Owner split identity/commercial approval; explicit defer accepted for core G. No immediate split question.

### Automation opportunities

Blocked-edge suppression, null-new-identity and later exact split/reference reconciliation.

### Downstream consumers

E/G catalog maintenance; F contextual output; O/H later.

### Blockers / open questions

New identity and technical differences absent. Deferred; not a pre-MVP G blocker.
