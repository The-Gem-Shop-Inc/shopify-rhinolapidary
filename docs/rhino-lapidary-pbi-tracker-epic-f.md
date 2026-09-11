# Rhino Lapidary Epic F PBI Handoff Package

**Epic:** Epic F — Machine Product Pages  
**Prepared:** 2026-09-10  
**Status:** Discovery complete; all 18 PBIs below are Proposed / not implemented.  
**Branch:** dev  
**Authority:** Planning only. No implementation, preview push/publication or production/Admin mutation is authorized by this tracker.

**Discovery:** [Machine Product-page discovery](architecture/epic-f-machine-product-page-discovery.md) · [Machine inventory/gap matrix](project/epic-f-machine-page-gap-matrix.md) · [Decision packet](project/epic-f-decision-packet.md) · [Machine-readable backlog](project/epic-f-proposed-backlog.json)

## Continuation and source hierarchy

Continue Trade 15.5.0 and existing Epic B/C/D/E work. Consume approved Epic E classification/identity, typed data, exact references and owner states. The [Epic E tracker](rhino-lapidary-pbi-tracker-epic-e.md) remains authoritative; E-PBI-025 is not complete and none of the 22 migration plans is executable. The current targeted September 10 reads do not replace complete E reconciliation. The September 3 execution snapshot is expired and incomplete.

Planning and shell readiness are distinct from live fact readiness. No Product description, title, tag, collection, family string, historical document or photograph may fill a blocked structured fact. No new facts/governance fields are introduced by F. Current approved class values and three Category decisions remain prepared inputs, not live migration.

## Safety and scope rules

1. Read the assigned PBI, discovery evidence and E dependencies before work. Product assignments/data and Files are store-level even when the theme is unpublished.
2. Use existing native Product controls and Rhino section/token/locale contracts; extend rather than duplicate Trade.
3. Preserve standard purchase behavior unless a concrete separately approved exception changes it. Price is not a quote/preorder rule.
4. Unknown/proposed/conflicting/expired or unverified facts suppress rows/modules. Internal positive fixtures never approve live facts.
5. Maintain exact Product/Variant/File identity, permitted audience and current canonical state. No inferred compatibility or reciprocal copy.
6. No change to native shipping weight ownership, warranty responsibility, pickup/region authority or timing freshness.
7. No production publication or Admin mutation without separately authorized bounded scope and existing read/before/dry-run/rollback/after/GO requirements.
8. G owns broader parts discovery; J/K operational checkout/delivery; L support directory; P Forms; U analytics. I/M/N comparison/content/reviews remain post-MVP.
9. Preserve existing Product CSV failures and launch-fixture ownership findings until their own evidence changes.

## Current discovery baseline

- 11 approved machine-class Products; eight published; JadeMaster active/unpublished; SawMaster 36 and TumbleMaster draft.
- One default Product template, one Variant per machine, zero live Product metafields and zero current Product/metaobject definitions in the targeted read.
- LapMaster 12/18 expose Add to cart; six other published machines expose Sold out. Admin aggregate availability is not storefront purchasability.
- All ten media attachments lack alt; nine unique images, no Product videos, TumbleMaster no image.
- Eight published descriptions match blocked claims; 37 overlapping matches from unchanged rules; native JSON-LD includes description text.
- Manuals hub has seven linked 404 Pages; three individual manual Pages work but are not thereby canonical approved Files.
- 33 route/viewport observations; 24 Product-scope axe runs without violations. Root-text enlargement requires document/global-chrome follow-up.
- Existing Product template/purchase, brand and static performance checks pass at their current scope. CSV: 103 findings. Launch fixture ownership: three failures.

## Proposed PBI index

| PBI | Title | Priority | Effort | Batch | Status |
|---|---|---|---|---|---|
| F-PBI-001 | Establish the machine consumer eligibility and fixture contract | P0 | L | F1 | Proposed |
| F-PBI-002 | Extend one shared machine template and first-screen hierarchy | P0 | L | F2 | Proposed |
| F-PBI-003 | Preserve native purchase and availability behavior across machine states | P0 | L | F2 | Proposed |
| F-PBI-004 | Improve the machine gallery with approved useful media | P1 | L | F2 | Proposed |
| F-PBI-005 | Contain unsupported machine claims across prose, media and structured data | P0 | L | F1 | Proposed |
| F-PBI-006 | Render approved key specifications and workshop requirements from typed fields | P1 | L | F3 | Proposed |
| F-PBI-007 | Present included and optional contents without merging meanings | P1 | L | F3 | Proposed |
| F-PBI-008 | Add contextual machine items through exact approved references | P1 | L | F3 | Proposed |
| F-PBI-009 | Handle delivery, pickup and timing as conditional native and approved states | P1 | L | F3 | Proposed |
| F-PBI-010 | Provide neutral support and approved warranty information | P1 | M | F3 | Proposed |
| F-PBI-011 | Expose only current approved manuals, diagrams and videos | P1 | L | F3 | Proposed |
| F-PBI-012 | Reuse Contact and define the Product-context handoff to Forms | P1 | M | F2 | Proposed |
| F-PBI-013 | Resolve existing native financing visibility without changing purchase policy | P1 | M | F1 | Proposed |
| F-PBI-014 | Validate responsive, keyboard and accessible machine journeys | P0 | L | F4 | Proposed |
| F-PBI-015 | Add machine-page performance measurement under the existing budget | P1 | L | F4 | Proposed |
| F-PBI-016 | Define machine decision measurement in the existing analytics model | P1 | M | F4 | Proposed |
| F-PBI-017 | Prepare and execute only separately authorized machine-template rollout | P0 | L | F5 | Proposed |
| F-PBI-018 | Run aggregate machine-page QA and record shell versus fact readiness | P0 | L | F5 | Proposed |

## Dependency-first implementation batches

| Batch | PBIs | Coherent scope | Readiness / boundary |
|---|---|---|---|
| F1 | 001,005,013 | Consumer/fixture boundary, claim containment and native-financing decision packet | Repository contracts and internal fixtures can proceed; human widget decision may remain deferred. |
| F2 | 002,003,004,012 | Shared shell, native purchase, gallery and Contact boundary | Depends on F1 contracts; approved assets and P context enhancement activate independently. |
| F3 | 006,007,008,009,010,011 | Conditional suitability, contents, contextual items, delivery/support and resources | Build against explicit fixtures; live facts remain blocked by applicable E approvals/migrations. |
| F4 | 014,015,016 | Integrated accessibility/responsiveness, performance and measurement contract | Run continuously during F2/F3 and finalize on selected shell/module scope; U instrumentation stays independently gated. |
| F5 | 017,018 | Authorized assignment rollout and aggregate handoff | Separate Product Owner/Admin GO, applicable E class migrations and current after-state evidence; no automatic production publication. |

These are proposed implementation batches, not authorization to execute them. The human-blocked parts of 013/media/P/U can stay deferred while unrelated shell and conditional rendering work proceeds. F3 value activation can occur per domain; there is no all-facts-populated prerequisite for shell QA. F5 live assignment and release decisions remain separately gated.

## Cross-Epic handoffs

| Owner | Handoff | F boundary |
|---|---|---|
| E | Fifteen inherited owner decisions, approved-only migration and current complete audit | Consume states; never resolve them through UI copy |
| G | Exact approved reverse-reference delivery and broad parts/consumables discovery | Contextual cards only; suppress fit if runtime reverse data is unavailable |
| J/K | Profile/location mismatch, general rates, native orderability, timing and delivery process | Native controls and neutral routing; no operational configuration |
| L | Seven broken manual destinations, canonical resources, warranty/service routes | Conditional Product resources and neutral Contact |
| P | Product-context intake, consent/routing/retention/follow-up; specialized quote if later approved | Reuse Contact; no new form architecture |
| U | Event owner/consent/dedup and analytics system authority | Measurement contract first; no new pixel/tool |
| C | Text-enlargement document overflow/global chrome | Integrate and report; do not redesign global chrome in F |
| I/M/N | Comparison, education, reviews/customer projects | Explicitly post-MVP, no F implementation |
| O | Later ownership/reorder/approved resource consumers | Preserve stable IDs and source contracts |

## Detailed proposed PBIs

## F-PBI-001 Establish the machine consumer eligibility and fixture contract

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Data consumption / QA  
**Type:** Architecture  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F1 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p0`, `batch: f1`

### Problem or opportunity

There is no Liquid-accessible approval boundary for future nonblank facts, and the machine fixture expects a template that does not exist.

### Evidence

E readiness permits shells but blocks fact rendering; current 11-machine read has no metafields; TrimMaster fixture expects product.machine; machineProduct ownership is missing.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A tested F consumer contract accepts only exact, approved, reconciled E data and makes shell-only readiness explicit.

### Scope

Define an E-owned, versioned eligibility input and F adapter/expiry/revocation boundary without new approval authority; establish explicit internal fixtures for approved, missing, proposed, conflicting, stale and wrong-target cases; record exact Product/Variant identities and machine fixture ownership.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Fixture identity comes from approved classification and exact GIDs, never title/tag/collection inference.
- [ ] Approved internal fixture facts render; missing/proposed/conflicting/expired/unauthorized values remain absent, including when a nonblank live value exists.
- [ ] A machine shell can pass with all fact modules suppressed; a release report distinguishes architecture, migrated values and authorization.
- [ ] Repository-only fixtures do not change live Product facts; E authority is consumed unchanged.
- [ ] Resolve machineProduct ownership in its existing register; retain search/consumableProduct gaps as explicit cross-Epic dependencies.

### Implementation handoff

Data consumption / QA owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A tested F consumer contract accepts only exact, approved, reconciled E data and makes shell-only readiness explicit. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- E-PBI-004/006/009/019/024 architecture
- Current E downstream readiness and plan inputs

### Risks/cautions

Repository JSON cannot be read directly by Liquid. Shipping an always-true feature flag or a second facts registry would bypass E.

### Testing/validation expectations

Semantic fixture matrix plus negative tests for raw HTML/tag/title fallback, stale eligibility, missing approval, wrong class/GID and accidental customer publication of fixtures.

### Human/Admin dependencies

QA/Admin assign the machine fixture owner; existing E value approvals remain external dependencies.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-002 Extend one shared machine template and first-screen hierarchy

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Theme / information architecture  
**Type:** Feature  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F2 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p0`, `batch: f2`

### Problem or opportunity

Every machine currently uses the generic template; mobile gallery and native messaging push the action to the first-screen boundary.

### Evidence

Only product.json exists. Default order is main/disclosures/related; buttons begin at y=742–786 on mobile. ADR-0001 remains Proposed.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

One maintainable product.machine template reuses Trade purchase/media and works with zero approved technical facts.

### Scope

Implement shared class template and conditional module ordering; retain one primary heading/native price/Variant form; prioritize compact useful media and action; document ADR adoption through existing architecture process.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] One shared machine JSON template serves current structures; no per-family/Product copies without a documented structural reason.
- [ ] Default Product template remains functional and non-machine classes are unchanged.
- [ ] Use native controls/snippets and existing Rhino section/token/locale conventions; no duplicate Product form/gallery JS.
- [ ] Empty fact groups and links to absent groups are suppressed; no mandatory placeholder specs.
- [ ] Mobile reading/focus order matches the visual hierarchy; no dense first-screen spec dump.

### Implementation handoff

Theme / information architecture owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

One maintainable product.machine template reuses Trade purchase/media and works with zero approved technical facts. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001
- F-PBI-005 claim containment contract

### Risks/cautions

A machine suffix is routing, not canonical classification or value approval. A Product-specific template must not become a fact store.

### Testing/validation expectations

Template structure/section order, one H1, form IDs and default-template regression; local missing-data rendering and representative preview snapshots after separate preview authorization.

### Human/Admin dependencies

Existing Brand/Engineering review of the concrete layout; no new machine specification decisions.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-003 Preserve native purchase and availability behavior across machine states

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Product purchase / J-K integration  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F2 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p0`, `batch: f2`

### Problem or opportunity

Aggregate Admin availability is not customer orderability; six published machines are sold out while two untracked LapMasters allow Add to cart.

### Evidence

Current native preview controls and exact Variant IDs; all 11 Admin availableForSale flags true, including drafts; inventory/profile reads show location differences.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

The machine shell preserves selected-Variant, quantity, price and native unavailable behavior without inventing a commercial policy.

### Scope

Reuse product-info/product-form/price/quantity/buy-buttons and live context; retain state announcements/errors; document J/K diagnostic handoff for location/profile/rate eligibility; isolate payment-terms visibility dependency.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Exact selected Variant is submitted once; quantity rules and no-JS/basic form behavior remain intact.
- [ ] Enabled, sold-out, untracked and unavailable/draft scenarios are distinct; Admin aggregate stock never forcibly enables a disabled native button.
- [ ] Price or machine size never selects quote/preorder/reserve behavior.
- [ ] No timing, preorder or backorder copy appears without existing owner authority.
- [ ] No mobile sticky purchase controller duplicates cart requests; adding sticky behavior requires measured need and focus coverage.

### Implementation handoff

Product purchase / J-K integration owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

The machine shell preserves selected-Variant, quantity, price and native unavailable behavior without inventing a commercial policy. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001
- F-PBI-002
- F-PBI-013 for native payment-terms visibility only

### Risks/cautions

A global stock count or General profile name does not prove delivery eligibility. Current inventory must not be changed to satisfy a test.

### Testing/validation expectations

Fixture tests for tracked/untracked/zero stock/DENY, invalid quantities, selected Variant and native error state; later separately authorized session-cart smoke without order placement.

### Human/Admin dependencies

J/K/Admin resolve current checkout eligibility through read evidence and existing operational governance; alternative purchase paths only if explicitly requested later.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-004 Improve the machine gallery with approved useful media

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Media / theme gallery  
**Type:** Improvement  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F2 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f2`

### Problem or opportunity

Each published machine has one image with blank alt; rear/setup/scale/contents inspection is impossible, and the mobile image consumes much of the first screen.

### Evidence

Ten image attachments/nine GIDs across 11 machines; TumbleMaster has none; SawMaster 24/36 share an image; current visual audit and B-018 photography brief.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A responsive Trade gallery presents exact-model, approved inspection media with meaningful alt and bounded initial load.

### Scope

Retain gallery/modal/thumbnail behavior; implement layout and lazy loading; prepare exact asset/alt/rights/shot requirements under B media governance; handle no approved media without decorative filler.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Every activated asset has exact model/use permission and approved descriptive alt; product imagery is not silently treated as decorative.
- [ ] The whole machine remains visible; staged blades/tools are not labeled included without E approval.
- [ ] Hero dimensions and responsive sources are explicit; secondary assets are lazy and zoom is usable.
- [ ] No draft Product is published or supplied fabricated media; embedded claims and duplicate model imagery receive owner review.
- [ ] Gallery layout is tested with zero/one/multiple images and video fixtures without immediately loading a video provider.

### Implementation handoff

Media / theme gallery owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A responsive Trade gallery presents exact-model, approved inspection media with meaningful alt and bounded initial load. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-002
- F-DEC-002
- B-018/B media governance

### Risks/cautions

An image can convey patent/certification/inclusion claims even when text scanning passes.

### Testing/validation expectations

Alt/dimension checks, aspect/crop and keyboard-modal tests, request/lazy-load checks, no immediate video/autoplay; approved fixture coverage independent of asset delivery.

### Human/Admin dependencies

Media/Brand approve actual assets, rights and exact-model mapping; BOM dependencies remain with E.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

F-DEC-002 exact-asset/rights/model review blocks live media activation; gallery shell work is independent.

## F-PBI-005 Contain unsupported machine claims across prose, media and structured data

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Content / legal claims / SEO  
**Type:** Fix  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F1 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p0`, `batch: f1`

### Problem or opportunity

All eight published descriptions match blocked claim rules; the normal validator omits Product HTML and JSON-LD republishes it.

### Evidence

37 overlapping unchanged-rule matches; patent/certification/performance/packing wording; three supplemental JSON-LD samples include description content.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

Machine-page visible and machine-readable content use only governed statements while technical and BOM conflicts remain suppressed.

### Scope

Extend existing claims enforcement to scoped Product source inputs, rendered HTML/meta/JSON-LD and media requirements; prepare concise approved narrative and separately reviewable Product/SEO cleanup scope; contain legacy HTML in the new template.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] No raw description becomes a fallback for specs/BOM/fit/warranty/freight/timing.
- [ ] Blocked wording is absent from activated visible and structured/social/SEO outputs; hiding one DOM block alone cannot pass.
- [ ] Existing approved naming/EM-1 positioning is reused without reopening it; new unsupported assertions are omitted, not softened.
- [ ] Source IDs, reviewer states and affected exact Product/fields remain reviewable; any native Product/SEO update uses separate mutation governance.
- [ ] Historical CSV/claim evidence is retained and no validator rule is weakened.

### Implementation handoff

Content / legal claims / SEO owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

Machine-page visible and machine-readable content use only governed statements while technical and BOM conflicts remain suppressed. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- Existing brand claims register
- E technical/BOM/source hierarchy
- F-PBI-001 consumer boundary

### Risks/cautions

Shopify native structured_data consumes Product description; a template-only fix may need coordinated approved content migration to close all exposure.

### Testing/validation expectations

Apply existing rules to current and negative Product fixtures; scan rendered DOM, JSON-LD and metadata; verify disputed values never reappear through stripped HTML or alternate strings.

### Human/Admin dependencies

Content/Brand review concrete replacement narrative; Legal/Technical decisions already blocked remain with existing owners. No broad approval request for hypothetical copy.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-006 Render approved key specifications and workshop requirements from typed fields

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Structured Product information  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F3 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f3`

### Problem or opportunity

Specs, electrical and dimensions currently live in conflicting prose; no typed machine values are migrated.

### Evidence

Approved E atomic technical and measurement contracts, B3B-D03/D05, zero live metafields; obsolete machine_specs JSON is deprecated.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

One formatter powers a short key summary and grouped full/setup specifications with correct physical and unit semantics.

### Scope

Typed electrical/drive, blade/wheel/mount, water/fluid and net/assembled/crate display; optional native shipping-weight presentation only with applicable authority and customer relevance.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Only approved/current typed fields render; zero qualifying facts suppress the summary and group headings.
- [ ] Key Specs is a small applicable subset; full details use semantic grouped definition lists or correctly headed tables when relationships require them.
- [ ] Motor/wheel/flex speed, blade/wheel arbor and net/crate/shipping states cannot be conflated.
- [ ] Range endpoints share units/source/configuration; horsepower/gallon ambiguity is blocked; no unsupported operating footprint or package count is fabricated.
- [ ] Long values wrap at mobile/zoom; unknown does not become zero or N/A; native Variant shipping weight is never duplicated into a metafield.

### Implementation handoff

Structured Product information owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

One formatter powers a short key summary and grouped full/setup specifications with correct physical and unit semantics. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001
- F-PBI-002
- E-PBI-010/011 architecture; E-PBI-022A–G approvals/migration for live activation

### Risks/cautions

An attractive formatter can hide uncertainty or make a converted source appear approved.

### Testing/validation expectations

Valid typed values, absent/wrong types, mixed-unit ranges, conflicting values, unknown physical state, long labels, 320 px and semantic accessibility; no description parsing.

### Human/Admin dependencies

Existing B3B-D03/D05 reviewers only for live facts; shell/formatter tests do not wait for them.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-007 Present included and optional contents without merging meanings

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Components / merchandising  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F3 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f3`

### Problem or opportunity

EM-1 current contents conflict across sources; images and old lists cannot establish included Products or quantities.

### Evidence

E component list/quantity-map/noncatalog contract; C-040; all current component migration sets empty.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A conditional contents module distinguishes included catalog items, noncatalog lines, explicit exclusions and optional items.

### Scope

Reuse Product cards for valid catalog references; join quantities by exact GID; render approved noncatalog meanings separately; provide no replacement identity by name.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Included quantities use exact-GID positive-integer companion map; invalid/missing joins fail eligibility rather than default to one.
- [ ] Included/not_included/optional/recommended labels remain distinct.
- [ ] Unpublished/deleted targets are suppressed without substituting an inferred successor.
- [ ] No descriptions/manuals/photos establish a BOM; C-040 remains blocked until its E decision closes.
- [ ] Empty approved sets hide the module; useful shell tests still pass.

### Implementation handoff

Components / merchandising owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A conditional contents module distinguishes included catalog items, noncatalog lines, explicit exclusions and optional items. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001
- F-PBI-002
- E-PBI-014; E-PBI-023B/C activation

### Risks/cautions

An optional attachment may require a future commerce configuration; F must not create a Variant or bundle.

### Testing/validation expectations

Quantity joins, semantic exclusions, unpublished/orphan references, missing BOM, no compatibility inference and component fixture accessibility.

### Human/Admin dependencies

Existing B3B-D04 Product/Technical approval; no duplicate BOM questionnaire.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-008 Add contextual machine items through exact approved references

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Related Products / F-G boundary  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F3 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f3`

### Problem or opportunity

Native recommendations are not compatibility authority, and the E relation points from dependent Product to machine rather than the reverse.

### Evidence

Trade recommendations endpoint; no configured complementary block; E matrix has no approved edges and four blocked SawMaster edges.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

Contextual approved items help a machine customer without duplicating G discovery or making inferred fit claims.

### Scope

Direct optional/recommended references and a documented F/G interface for E-approved reverse projections; existing cards; visible labels separating generic recommendation from fit.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Compatibility views use only approved positive dependent-to-machine edges; no stored reciprocal inventions or family/title/tag/collection matching.
- [ ] If no runtime approved reverse resolver exists, the fit module remains suppressed; Liquid cannot scan the catalog as a substitute.
- [ ] Recommendations do not imply fit or inclusion; variants with size-specific fit do not become a Product-level union.
- [ ] Four blocked SawMaster edges never render or become actionable.
- [ ] No broader filter/search/diagram parts finder is built in F; route to approved G destinations only.

### Implementation handoff

Related Products / F-G boundary owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

Contextual approved items help a machine customer without duplicating G discovery or making inferred fit claims. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001
- F-PBI-002
- E-PBI-012/013 and E-PBI-023A/C/D activation
- G shared exact-reference consumer interface

### Risks/cautions

Rendering every card from a generic recommendation endpoint can misrepresent a technical relationship.

### Testing/validation expectations

Wrong class/self/duplicate/orphan/deleted/blocked edges, false reverse inference, variant scope, exact link IDs and independent recommendation labels.

### Human/Admin dependencies

Existing compatibility/identity approvals; Engineering owns runtime projection choice, not human fact collection.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine customers; G exact-reference and broader discovery; O ownership/reorder.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-009 Handle delivery, pickup and timing as conditional native and approved states

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Product delivery / K integration  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F3 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f3`

### Problem or opportunity

Descriptions promise seasonal pickup while native pickup settings are null; general shipping rates and policy prose cannot establish machine freight or timing.

### Evidence

Current location/profile/pickup reads; seven description pickup claims; working native shipping-policy route; E-PBI-015/017 blockers.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A concise delivery area provides approved facts or neutral routing without inventing costs, restrictions or dates.

### Scope

Reuse native pickup availability and verified shipping-policy/contact links; separately gate future fulfillment, crate/shipping and timing display; send configuration/rate risks to K/J.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Unknown handling/region/timing suppresses factual text, not an invented free-shipping/lead-time label.
- [ ] Profile membership/name/price threshold never authorizes a freight or free-shipping claim.
- [ ] Native pickup unavailable/empty/error states remain truthful; seasonal HTML is never a fallback.
- [ ] Any future timing source obeys E authority, event/unit meaning and expiry; stale timing disappears.
- [ ] Policy link presence never copies its broad promises into Product facts; no shipping configuration is changed by the renderer.

### Implementation handoff

Product delivery / K integration owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A concise delivery area provides approved facts or neutral routing without inventing costs, restrictions or dates. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001
- F-PBI-003
- E-PBI-015/017; applicable E-PBI-022H/023H activation
- K policy/configuration ownership

### Risks/cautions

A general free-over-70 rate can be mistaken for an approved heavy-machine offer. Discovery did not test checkout rates.

### Testing/validation expectations

Unknown/null pickup, expired timing, missing region authority, invalid native weight mapping, link 404 and no copied delivery-policy claims.

### Human/Admin dependencies

Existing Operations decisions only; K/Admin owns operational corrections and their authorization.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine customers; J/K checkout/delivery; O ownership; P related inquiry context.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-010 Provide neutral support and approved warranty information

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Support / L integration  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F3 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f3`

### Problem or opportunity

No Product warranty mappings exist; the generic warranty route is absent and support_files is Admin-only.

### Evidence

E-PBI-016 evidence/roles; zero approved mappings; /pages/warranty 404; Contact 200; support_files storefront access restriction.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

Machine customers can reach existing Contact while warranty/service facts render only after the owning contracts are ready.

### Scope

Verified neutral support routing and conditional future warranty/service information; reuse L policy/resource destinations; preserve issuer/administrator/repair-provider distinctions.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Vendor never establishes legal manufacturer or warranty/service responsibility.
- [ ] No universal warranty/repair/spare-parts promise appears without exact mapping/evidence.
- [ ] Admin-only support_files is never exposed to customers.
- [ ] A missing approved warranty destination suppresses its CTA; Contact remains neutral and does not imply response time or service coverage.
- [ ] No new warranty metaobject/field or duplicate support portal is created in F.

### Implementation handoff

Support / L integration owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

Machine customers can reach existing Contact while warranty/service facts render only after the owning contracts are ready. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001
- F-PBI-002
- E-PBI-016 / applicable E-PBI-023G
- L customer-safe contract/destinations

### Risks/cautions

A live return policy is not an approved Product warranty; technical support material may be internal.

### Testing/validation expectations

Vendor-only mapping rejection, third-party fixture, missing/obsolete policy, staff-resource suppression and neutral fallback semantics.

### Human/Admin dependencies

Existing B3C-D03 owners; Support maintains route ownership under L.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine customers; L support/resources; O ownership; P inquiries.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-011 Expose only current approved manuals, diagrams and videos

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Resources / L integration  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F3 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f3`

### Problem or opportunity

No canonical Product File references are approved; the current Manuals hub links to seven 404 Pages despite three published manual Pages.

### Evidence

E resource catalog, exact Page read, 11 manual-route probes and existing approved click-to-load EM-1 homepage video pattern.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A compact resource module shows only exact-model current customer resources and preserves performance/accessibility.

### Scope

Manual/download cards, useful diagrams and click-to-load video using existing patterns; route verification and L handoff for directory repair; no technical fact extraction from a manual.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Exact Product/File identity, current version, language, audience and rights/publication approval are required.
- [ ] Evidence-only, support-only, internal, obsolete and superseded Files are absent; upload date or filename cannot select canonical content.
- [ ] A live legacy Page is not silently promoted to approved canonical File; broken directory links remain an L handoff.
- [ ] Video has approved poster/dimensions, no initial provider request/autoplay, keyboard operation and applicable captions/transcript; homepage approval is not blanket Product-surface approval.
- [ ] Downloads have useful names/type information and mobile wrap/focus behavior; empty resource groups are suppressed.

### Implementation handoff

Resources / L integration owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A compact resource module shows only exact-model current customer resources and preserves performance/accessibility. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001
- F-PBI-002
- E-PBI-018B / E-PBI-023E/F activation
- L directory and resource ownership

### Risks/cautions

Publication and canonical technical accuracy are different states; a click-to-load player can still embed unapproved claims.

### Testing/validation expectations

Current versus obsolete resource fixtures, missing target/rights, audience checks, actual route identity, no upload-date canonical inference, video network/keyboard/layout tests.

### Human/Admin dependencies

Existing B3B-D06 reviewers; Product-surface reuse of an existing promotional asset uses existing Media/Brand workflow.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine customers; L support/resources; O ownership; P inquiries.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-012 Reuse Contact and define the Product-context handoff to Forms

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Contact / P integration  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F2 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f2`

### Problem or opportunity

The live native contact form has no Product/Variant context, and no owned quote process is evidenced.

### Evidence

Contact route/form read; Name/Email/Phone/Comment only; D-PBI-025 and navigation quote route remain blocked.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A neutral Contact action is available, with a bounded context adapter ready only when P owns its intake.

### Scope

Reuse existing destination/form; propose allowlisted Product GID, optional selected Variant GID and relative route context with visible/editable context; P owns routing, consent, retention, spam and follow-up.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] No competing quote form/app/backend or assumed reserve/preorder workflow is introduced.
- [ ] Neutral Contact works without context enhancement and promises no response time.
- [ ] Context parameters are validated/escaped, never establish price/fit/identity authority, and cannot redirect outside approved routes.
- [ ] Native form is not assumed to consume query parameters until its handler exists and is tested.
- [ ] No new customer-data submission/collection launches before existing P ownership requirements are satisfied.

### Implementation handoff

Contact / P integration owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A neutral Contact action is available, with a bounded context adapter ready only when P owns its intake. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001
- F-PBI-002
- Existing Contact route
- P context/intake ownership for enhancement only

### Risks/cautions

A prefilled query string may be tampered with or contain PII; context is lead context, not authoritative Product data.

### Testing/validation expectations

Neutral link route, exact selected Variant context, malformed/unknown GID and redirect/XSS input; later owned form success/error tests with explicit submission scope.

### Human/Admin dependencies

Existing P/Product/Support/privacy owners; no repeated E fact decisions.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Existing P intake ownership blocks context enhancement; neutral Contact is already available.

## F-PBI-013 Resolve existing native financing visibility without changing purchase policy

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Commercial governance  
**Type:** Decision  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium — owner decision pending  
**Suggested milestone:** F1 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f1`

### Problem or opportunity

Native Shop Pay installment amounts render today while the repository has no approved custom financing destination or CTA.

### Evidence

Eight current Product screenshots, payment_terms in Trade and F-DEC-001; standard purchase architecture already approved.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

An exact owner decision governs the native widget; custom financing and alternative commercial paths stay deferred unless independently justified.

### Scope

Record retain/suppress decision for provider-owned messaging, affected surface and authority; identify any explicitly requested exception to existing purchase policy as separate future scope.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Dated Business/Admin decision distinguishes native provider terms from Rhino-authored financing claims.
- [ ] No static installment amount, universal eligibility statement or invented financing CTA.
- [ ] High price and sold-out inventory are not reasons to change Add to cart into quote/preorder/reserve.
- [ ] No payment configuration, app installation or Product mutation occurs as part of recording the decision.
- [ ] Unresolved native widget visibility does not block technical shell/conditional renderer development.

### Implementation handoff

Business/Admin governance owner with Engineering support; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

An exact owner decision governs the native widget; custom financing and alternative commercial paths stay deferred unless independently justified. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-DEC-001
- Existing native purchase architecture and blocked financing route

### Risks/cautions

Observed native messaging proves rendering, not business approval for new marketing or eligibility promises.

### Testing/validation expectations

Decision-state/schema validation in the proposed consumer contract; fixtures for retained provider-owned widget versus suppressed optional messaging; no duplicate CTA.

### Human/Admin dependencies

Business/Product Owner and Admin; Legal for additional claims.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

F-DEC-001 requires a real Business/Admin decision on native financing visibility. This does not reopen the already documented standard purchase model.

## F-PBI-014 Validate responsive, keyboard and accessible machine journeys

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** QA / accessibility / responsive  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F4 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p0`, `batch: f4`

### Problem or opportunity

Existing smoke/axe checks do not cover new fact modules, enlarged text, long values or machine purchase states.

### Evidence

24 Product-scope axe runs pass, gallery keyboard probes pass; 320 px doubled text produces 355 px document width with main content still 320 px.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

Executable checks cover the shared shell and conditional modules, with global-chrome issues assigned to C.

### Scope

320/360/390/768/1024/1440/1920 representative coverage, actual browser zoom/reflow, mobile controls, long specs/resources, modal/details focus and touch targets; reuse existing Playwright/axe.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] One logical heading/focus order and no inaccessible empty controls; detail/table semantics match the data.
- [ ] Supported narrow widths and zoom do not require horizontal page scrolling for ordinary content.
- [ ] Modal Enter/Escape/focus return and disclosure keyboard behavior hold with one/multiple media and populated/empty modules.
- [ ] Touch targets, visible focus and screen-reader labels cover purchase, resource and contextual links.
- [ ] Preview toolbar/cross-origin limitations are recorded; root text simulation is not mislabeled as full zoom certification.

### Implementation handoff

QA / accessibility / responsive owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

Executable checks cover the shared shell and conditional modules, with global-chrome issues assigned to C. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-002–012 applicable shell/modules

### Risks/cautions

Zero axe findings does not certify media alt usefulness, all focus paths or cross-origin widgets.

### Testing/validation expectations

Dedicated machine Playwright suites with internal positive/negative data states, axe, keyboard, long translations/text resize and real-browser zoom; screenshot evidence supplements assertions.

### Human/Admin dependencies

QA/accessibility acceptance and existing C ownership for global defects; no new Product facts.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-015 Add machine-page performance measurement under the existing budget

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Performance / QA  
**Type:** Improvement  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F4 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f4`

### Problem or opportunity

Discovery samples are fast but unthrottled/single-run, and request totals/native widget traffic exceed parts of the existing budget model.

### Evidence

Published LCP samples 440–1052 ms; 190–220 requests including preview/native widgets; shop.app host; existing brand budget and three-run policy.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A reproducible Product harness separates discovery diagnostics, regression checks and release measurements without weakening budgets.

### Scope

Extend existing measurement tooling for machine routes/states, three-run mobile medians, image/video/recommendation costs, native/payment/preview attribution and larger-gallery fixtures.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] Existing byte/LCP/CLS/TBT and no-immediate-video rules remain enforced; absent/unsupported metrics are not passed as zero.
- [ ] 404/password/error pages cannot count as Product performance samples.
- [ ] Record route, actual theme identity, environment, throttling, cache/settle policy, samples and medians.
- [ ] Explain preview/native host/request costs before proposing any owner-reviewed exception; no speculative savings or library replacement.
- [ ] No added sticky/carousel/video JS without demonstrated need and measured budget impact.

### Implementation handoff

Performance / QA owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A reproducible Product harness separates discovery diagnostics, regression checks and release measurements without weakening budgets. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-002–012 applicable modules
- F-PBI-013 widget outcome
- B-030 performance governance

### Risks/cautions

Lighthouse TBT proxy is not field INP; a single fast preview run is not release acceptance.

### Testing/validation expectations

Budget runner regression tests for missing data, route identity, eager video, oversized media and duplicate scripts; at least three representative mobile samples and recorded median.

### Human/Admin dependencies

Existing Performance/Engineering owners approve any concrete measured exception; no unapproved budget increase.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## F-PBI-016 Define machine decision measurement in the existing analytics model

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Analytics / U integration  
**Type:** Architecture  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F4 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p1`, `batch: f4`

### Problem or opportunity

Product event owners are unassigned; adding custom purchase tracking risks duplicate events and unowned consent behavior.

### Evidence

Analytics migration plan, D measurement plan and storefront-event-contracts with only proposed section event.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A minimal owner-bound measurement contract covers machine actions without a new analytics stack.

### Scope

Map native Product/purchase events and optional contact/resource/contextual-item/spec interactions to existing U ownership, payload and consent rules; separate reporting from instrumentation.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] One owner for native view/add-to-cart/checkout/purchase; custom F code cannot duplicate them.
- [ ] Optional event payload uses exact Product/Variant/module/resource IDs and relative destination; no PII/free-text inquiry data.
- [ ] No tooling/pixel/consent configuration is invented or enabled before existing U decisions.
- [ ] Track actions tied to customer decisions, not arbitrary per-section events; expansion alone is not success.
- [ ] Baseline/review cadence and accountable role are defined without fabricated conversion targets.

### Implementation handoff

Analytics / U integration owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A minimal owner-bound measurement contract covers machine actions without a new analytics stack. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-002–012 action contracts
- Existing U analytics ownership and consent process

### Risks/cautions

Native payment/contact widgets and app pixels can create duplicate or cross-origin events.

### Testing/validation expectations

Contract payload checks and later consent/dedup debugger verification; no discovery emission or custom instrumentation activation.

### Human/Admin dependencies

Existing Analytics/Product owner assignment and consent authority under U.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F Product measurement; U analytics governance; J/P native purchase/contact event owners.

### Blockers/open questions

Existing U event-owner/consent decisions block instrumentation; contract preparation is independent.

## F-PBI-017 Prepare and execute only separately authorized machine-template rollout

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** Admin / release governance  
**Type:** Migration  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F5 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p0`, `batch: f5`

### Problem or opportunity

All machines use default template, but assignment is store-level and cannot be isolated merely by pushing an unpublished theme.

### Evidence

Current exact machine assignments, missing class metafield population, E-PBI-019 requirements and current stale/incomplete E execution gate.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A bounded rollout can assign verified eligible published machines without accidentally publishing drafts or enabling unapproved facts.

### Scope

Prepare exact Product/template assignment plan, before/after state and rollback; fixture-first rollout after the required class/definition migration and separate Product Owner/Admin GO; independently govern any approved content/media edits.

### Out of scope

Unreviewed value/definition/price/SKU/shipping mutations, publishing drafts or production theme publication. Execution is a future separately authorized step.

### Acceptance criteria

- [ ] Current complete E reconciliation and applicable class-definition/class-value prerequisites are satisfied for live classification-based assignment.
- [ ] Exact published machine GIDs and intended template suffix are reviewed; JadeMaster/SawMaster 36/TumbleMaster remain excluded unless separately authorized.
- [ ] Before-state hashes, drift/preconditions, deterministic dry run, rollback and separate GO are recorded before any future Admin action.
- [ ] Template assignment does not mutate specifications, prices, SKU, availability, profile, Category or Vendor incidentally.
- [ ] After verification proves intended template and state; no production theme publication is bundled into this PBI.

### Implementation handoff

Shopify Admin Owner and Engineering; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A bounded rollout can assign verified eligible published machines without accidentally publishing drafts or enabling unapproved facts. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001–005
- F-PBI-014/015 shell validation
- Applicable E-PBI-020/021A execution
- Existing E-PBI-019 authorization process

### Risks/cautions

A preview theme is not a sandbox for Product assignments or values. Missing dependencies keep this PBI planned.

### Testing/validation expectations

Plan scope/hash/staleness/rollback/unauthorized-field negatives; exact-ID before/after comparisons and assigned-template preview smoke after authorized execution.

### Human/Admin dependencies

Explicit bounded Product Owner/Admin GO at execution time; later release publication remains separate.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Dry-run and before/after comparison are automatic; GO is never generated.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Current complete E audit, applicable class migration, validated shell and exact domain GO are unsatisfied. No rollout is authorized now.

## F-PBI-018 Run aggregate machine-page QA and record shell versus fact readiness

**Status:** Proposed / not implemented  
**Epic:** Epic F — Machine Product Pages  
**Work area:** QA / release handoff  
**Type:** Validation  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High for repository scope; live facts retain external gates  
**Suggested milestone:** F5 — Machine Product Pages  
**Suggested GitHub labels:** `epic: f`, `area: product-pages`, `priority: p0`, `batch: f5`

### Problem or opportunity

A single green Product-page result could conceal suppressed modules, stale Admin evidence, unapproved facts or unresolved data-quality findings.

### Evidence

E aggregate separates architecture and execution; current CSV has 103 findings and launch fixtures have three ownership gaps; F modules are not implemented.

See the [source-bound discovery](architecture/epic-f-machine-product-page-discovery.md) and [per-machine inventory](project/epic-f-machine-inventory.json) for exact paths/IDs and current observations.

### Proposed outcome

A release packet reports every machine and domain honestly, with executable evidence and explicit deferred activation.

### Scope

Aggregate static/fixture/preview/accessibility/performance/claims/reference/route/assignment checks; update inventory/gap matrix; collect applicable human signoff without marking blocked facts complete.

### Out of scope

Epic E fact decisions or migrations; shipping/payment configuration; production publication; broader G discovery; post-MVP comparison/reviews/content features.

### Acceptance criteria

- [ ] All 11 governed machines remain in audit scope, including unavailable/draft routes; no sampled-only green claim.
- [ ] Shell-ready, fact-ready, value-blocked, Admin-stale and mutation-unauthorized states are distinct.
- [ ] The 95 CSV alt and eight price findings remain unchanged until their separately owned data work actually resolves them; fixture ownership gaps remain visible by owner.
- [ ] No blocked fact leaks into prose, JSON-LD, media-derived captions, related-item labels or fallback settings.
- [ ] Current read/after-state evidence and every relevant check are linked; production release and E-PBI-025 completion are not implied by F QA.

### Implementation handoff

QA / release handoff owner and Engineering/QA; extend the existing project contracts. Produce concrete reviewable artifacts before requesting any later external-action GO.

### Success measure

A release packet reports every machine and domain honestly, with executable evidence and explicit deferred activation. Acceptance is demonstrated by the named tests and domain states; no invented conversion target or all-values-populated green flag.

### Dependencies

- F-PBI-001–017 as applicable to selected release scope
- E-PBI-024 / current consumer eligibility
- Applicable owner acceptance

### Risks/cautions

Suppression is a successful safe behavior, but cannot be represented as an approved/populated fact module.

### Testing/validation expectations

One aggregate runner extending existing validators; negative cases for readiness conflation, unauthorized populated facts, CSV suppression, missing assignment, stale resources and incorrect route/price/native state.

### Human/Admin dependencies

Product Owner/QA and affected Media/Brand/Operations/Support/Legal reviewers accept only their concrete release scope.

### Automation opportunities

Automate the executable checks above using existing Node validators/Playwright, exact IDs and source-bound fixtures. Record missing inputs and explicit skips/blocks rather than approving facts or mutating the store to make tests pass.

### Downstream consumers

F machine Product pages; G/J/K/L/O/P at the explicitly bounded interfaces in this tracker.

### Blockers/open questions

Applicable E value approval/migration and current evidence may remain blocked. Build only the safe shell/fixture scope until its own dependencies close; do not re-ask the fifteen inherited decisions.

## Discovery stopping point

Only discovery evidence, inventory/matrices, decision packet and this proposed backlog were created. Targeted read-only Admin queries and unpublished-preview navigation occurred; no Epic F Product-page implementation, Product/Variant/definition/File change, template assignment, app/pixel/form installation, cart/contact submission, theme push or production mutation/publication occurred.
