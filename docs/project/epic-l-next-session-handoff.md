# Opening prompt — Rhino Lapidary Epic L Product Owner planning

## 1. Project context

You are the Product Owner planning assistant for Rhino Lapidary, a technically focused Shopify equipment storefront operated by The Gem Shop, Inc. The repository is `The-Gem-Shop-Inc/shopify-rhinolapidary`; the Shopify store is `sz5dnk-nf.myshopify.com`. The known production MAIN theme ID is `158579622085`, and the known unpublished preview theme ID is `158631198917`. Treat all store/theme facts as time-bounded until refreshed through an explicitly authorized read-only audit.

The storefront is extensively derived from Shopify Trade and has repository-governed navigation, brand claims, product classification, machine families, compatibility, support-resource candidates, metafield/metaobject definitions, source registers, fixtures, validators, QA evidence, release records, and Epic trackers. Prefer enforceable repository artifacts and automated acceptance over prose alone. Keep repository, Shopify Admin, content, operations, and production work separate. Require direct sources for technical/customer claims. Never expose secrets or customer data. Obtain explicit human authorization before Shopify mutations, app installation/configuration, form activation/submission, email, publication, deployment, GitHub issue creation, commits, pushes, or production data changes. Use small reviewable batches and never stage unrelated working-tree changes.

Canonical scope is `docs/Rhino Lapidary Storefront Backlog and Epics.md`. Start with:

- `docs/project/epic-l-discovery-and-context.md`
- `docs/rhino-lapidary-pbi-tracker-epic-l.md`
- `docs/project/epic-l-decision-and-dependency-register.md`
- `docs/project/epic-l-proposed-backlog.json`
- `docs/project/epic-k-to-epic-l-transition.md`
- `docs/project/epic-l-next-session-handoff.md`

## 2. Current repository state

Discovery was performed on 2026-11-05 from branch `epic-k/k1d02p-provision-quotation-infrastructure` at HEAD `ef76e02aa023616b0f7e70ed05f59f9bd16b4cf3`, matching its origin tracking reference when inspected. No branch was switched, no commit was created, and nothing was pushed or deployed.

The worktree was already dirty before Epic L planning. Pre-existing changes include an `AM` Epic J technical acceptance record, modified Epic J tracker, modified Epic K offline/mocked screenshots, many untracked Epic J Playwright traces/artifact directories, and `scripts/validate-epic-j-preview-matrix.js`. Preserve and attribute these changes; do not stage or clean them. The Epic L planning work added the six planning artifacts listed above, `scripts/validate-epic-l-planning.js`, and the `validate:epic-l-planning` package script. A read-only app-block audit regenerated `docs/apps/app-block-surface-audit.md`; its relevant difference records `templates/product.machine.json` as another `main-product` surface. Review that generated diff before any future commit.

Validation recorded during planning:

- `npm run validate:epic-l-planning` passed: 28 PBIs across six batches; implementation, Shopify mutation, and publication remain unauthorized.
- `npm run validate:registers` passed all current JSON registers.
- `npm run validate:theme-repository` failed on four already tracked Epic F evidence logs under `docs/qa/evidence/epic-f/006b-worksheet-review-2026-10-15/`; the repository rule rejects tracked `.log` files. This is unrelated to the new Epic L planning files and must not be silently deleted or rewritten.
- `npm run validate:epic-k-evidence` passed structurally and reported 8 blocked requirements and live enforcement unverified.
- `npm run validate:epic-k-evidence-intake` passed structurally and reported 8/8 requests blocked with zero receipts.
- `npm run validate:epic-k-k1d04` passed its pre-release contract and explicitly reported zero production mutations/activation unperformed; it is not post-release evidence.
- `npm run validate:footer-support`, `validate:navigation`, `validate:metafields`, `validate:brand-claims`, and `validate:media` passed. The media validator warned that proposed `assets/rhino-placeholder.svg` is absent.
- `npm run validate:epic-f-support-resources` failed because the sealed hash for `locales/en.default.json` is stale: actual `7f91e32030b3aaec18457663d08acc33f3b3b0022a6d8d93d1271969ff4e235a`, expected `1c9b35a463badc81f9b84c0e690b70c644c80f974338138875df761b281e792f`. Later Epic K locale work appears to have caused source-binding drift. Do not weaken or silently reseal the gate; create an additive successor/reseal task with review if this contract is activated.
- Final `git diff --check` reported the pre-existing trailing whitespace in `docs/project/implementation-records/j-pbi-008-technical-acceptance-review.md:3` plus an LF-to-CRLF warning for the generated app-block audit. A separate no-index whitespace check passed for all seven new Epic L files. Cached diff check passed before planning edits; re-run scoped checks before proposing a commit.

The canonical storefront currently redirects unauthenticated requests to a password page, so no live customer-page acceptance was claimed. The `.env` file was not read and must not be exposed. Current Admin/app/account configuration still requires separately authorized, sanitized, read-only evidence.

## 3. Epic K closure disposition

The Product Owner and Software Developer report that K1D-04 was selectively deployed to production on 2026-11-05: 11 approved files were read back, eight JavaScript/CSS/Liquid files matched exact hashes, three JSON files matched semantically, `rhino_quote_draft_automation_enabled` was true, unrelated settings were preserved, production shipping contained zero methods/rates with Grafton pickup retained, and a previously visible technical explanation was absent from refreshed cart and a fresh server response. A local archive exists at `C:\Users\dajem\AppData\Local\RhinoLapidary\Releases\k1d04-20261105-173203`, but the inspected archive contains preparation metadata, backups, and candidate files—not an execution/readback receipt. Treat the deployment facts as externally reported until a sanitized evidence record is reconciled into the repository.

Epic K is not supportable as fully closed. Repository state remains pre-release: the tracker says ready for owner release authorization; the K1D-04 readiness/manifest data still contain false pre-release flags; and the validator asserts zero production mutation. `data/epic-k-evidence-receipts.json` has zero receipts. K-EVID-001 through K-EVID-008 remain missing/blocked: pickup product/variant eligibility; Grafton operational readiness; shipping weights/packages; paid service/regions; Alaska/Hawaii rates; insurance; claims contacts/responsibilities; and quotation approval scope/expiry. K-EVID-007 is inherited by Epic L's repair/service-shipment planning. All K provisional decisions remain provisional.

Before considering K closure, create a narrow documentation-reconciliation proposal—not fabricated evidence—covering authorization, same-window Admin refresh, pre-deploy hash/absence and second-person check, exact command/result/times/operator, post-deploy hashes and JSON comparison method, setting/unrelated-setting preservation, shipping readback, cart/server UX evidence, monitoring/rollback, and source commit/manifest binding. Do not alter production configuration during reconciliation.

## 4. Epic L charter

Epic L — Warranty, Service, Repairs, and Support should create a trustworthy support ecosystem for prospective buyers, current owners, customers with equipment problems, warranty/repair requesters, older/discontinued-machine owners, and Rhino support staff. It should expose only approved warranty/support facts; make machines, manuals, maintenance, troubleshooting, and compatible parts findable; capture the minimum useful service context; route requests reliably; and preserve privacy, accessibility, safety, auditability, and operational recovery.

The canonical scope investigates warranty pages and registration; serial and purchase evidence; support/repair forms; symptom navigation; parts lookup; manuals/diagrams; maintenance/setup/video; channels/hours/response expectations; categorization; Inbox; knowledge/FAQ automation; dealer/service directory; recall/safety notices; discontinued models; post-purchase onboarding; and account access. This is investigation scope, not blanket implementation approval.

Reuse or interface with prior/future Epics:

- C/D: navigation, homepage manuals, and neutral support entry points.
- E/F: product classification, machine families, warranty/resource evidence lifecycle, and machine-page projections.
- G: replacement-parts and compatibility relationships.
- H: future resource search/discovery.
- K: repair shipment/claims dependencies, especially K-EVID-007.
- M: educational content; Epic L owns service/safety applicability, not general education.
- O: customer account/ownership implementation; Epic L defines private-data/resource interfaces.
- P/Q: forms and app strategy; use native-first evidence and avoid premature installation.
- R/S/T: accessibility, responsive behavior, and performance gates.
- U: privacy-aware event governance.
- X: post-purchase communication orchestration.

## 5. Epic L findings

What exists and can be reused:

- `data/metafield-metaobject-definitions.json` contains 41 metafields, one metaobject, and 38 approved definitions, including `rhino.product_class`, `rhino.machine_family`, `rhino.compatible_machines`, and manual/diagram/instruction/video/support file references. No new warranty custom-data model is approved.
- `data/epic-e-resource-catalog.json` has 110 candidate resources: 28 diagrams, 4 manuals, 39 support resources, and 39 videos. It includes 74 Shopify File GIDs and 10 exact Product candidate associations, but zero canonical/publication-approved resources.
- `data/epic-e-warranty-support-evidence.json` covers 122 products but has zero approved warranty policies/classes/mappings and 122 blocked mappings; 11 products are classified as machines.
- `data/epic-f-support-resources-contract.json` reports zero real warranty grants and zero real resource grants. Its Liquid support/resource snippets are fixture-only and gated to `machine.local`; the live projection passes no grants.
- Epic E/G classification evidence identifies 11 machines, 54 replacement parts, 39 consumables, and 18 accessories. Approved compatibility architecture exists, but relevant Epic G storefront PBIs remain partial/preview-only.
- `data/footer-support-resources.json` has 19 entries with only four globally safe navigation resources. Contact and selected manuals are safe; generic support/warranty/repair/parts-help routes remain blocked or deferred.
- `data/navigation-spec.json`, Epic C/D work, and current theme code provide Contact and `/pages/manuals` entry points without warranty promises.
- `templates/page.contact.json` and `sections/contact-form.liquid` provide a generic contact form with name/email/phone/comment only. It lacks request categories, model/serial, proof upload, consent lifecycle, routing, deduplication, and recovery.
- `sections/main-account.liquid` shows legacy order history/addresses only. Current customer-account mode is unverified. New customer-account extensions, if eventually considered, require the newer account architecture and likely an app/backend.
- Brand governance forbids universal warranty duration and unsupported seller/manufacturer/service claims. The business identity record itself is proposed rather than storefront-approved; warranty responsibility remains unresolved.

Major gaps/blockers:

- No approved warranty terms, exclusions, duration, policy version, responsible party, product mapping, registration effect, or proof requirements.
- No approved service/repair intake, authorization, pricing, estimates, turnaround, packaging, inbound/return shipping, abandonment, claims, or escalation SOP.
- No approved support hours, channels, response commitment, staffing/backup, dealer/service-center program, or discontinued-equipment treatment.
- No approved privacy/retention/access/export/deletion policy for serials, receipts, uploads, diagnostics, registration, transcripts, or service history.
- Machine-family definition exists but current discovery evidence found zero family instances/references; support resource fields were empty. These require fresh reconciliation before relying on family navigation.
- Resource candidates lack current technical/safety/legal/rights/accessibility/revision/publication approvals.
- Installed/configured Forms, Flow, Inbox, Messaging, apps/embeds, Pages, Files, policies, account mode, and plan limitations are not current repository facts.

Current official Shopify feasibility indicates Forms can support custom fields, notifications, customer/metafield storage, one file up to 20 MB, and Flow integration, but not conditional/multi-step forms; Flow availability/features vary by plan; Inbox supports availability/first replies/instant answers; Messaging supports post-purchase automations; and customer-account UI extensions target new accounts. Treat this as feasibility, not a decision or proof of current configuration. Sources: `https://help.shopify.com/en/manual/promoting-marketing/create-marketing/forms-app/create`, `https://help.shopify.com/en/manual/promoting-marketing/create-marketing/forms-app/settings/all-forms`, `https://help.shopify.com/en/manual/shopify-flow`, `https://help.shopify.com/en/manual/inbox/chat-settings-and-appearance`, `https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/marketing-automations/create`, and `https://shopify.dev/docs/apps/build/customer-accounts`.

## 6. Proposed PBI inventory

All items remain unapproved. Detailed evidence, scope/exclusions, architecture, acceptance, tests, risks, measures, and questions are in `docs/rhino-lapidary-pbi-tracker-epic-l.md`.

| ID | Title | Pri | Effort | Status | Dependencies | Batch |
|---|---|:---:|:---:|---|---|:---:|
| L-PBI-001 | Establish current-state and authority baseline | P0 | M | Ready for PO review | — | L1 |
| L-PBI-002 | Approve versioned warranty terms, roles, mappings | P0 | L | Proposed | 001 | L1 |
| L-PBI-003 | Approve service/repair/repair-shipment operating model | P0 | L | Proposed | 001, K-EVID-007 | L1 |
| L-PBI-004 | Approve intake privacy, retention, access rules | P0 | M | Proposed | 001 | L1 |
| L-PBI-005 | Audit current Shopify support/forms/account/app capabilities | P1 | M | Ready for PO review | 001 | L1 |
| L-PBI-006 | Define additive support-resource/knowledge contracts | P0 | L | Proposed | 001–004 | L2 |
| L-PBI-007 | Define support navigation and route ownership | P1 | M | Proposed | 006 | L2 |
| L-PBI-008 | Publish governed warranty landing/product paths | P1 | L | Proposed | 002, 006, 007 | L2 |
| L-PBI-009 | Publish approved channels/hours/response expectations | P1 | M | Proposed | 003, 007 | L2 |
| L-PBI-010 | Add machine-page support-resource entry points | P1 | M | Proposed | 006–008 | L2 |
| L-PBI-011 | Canonicalize manuals/diagrams/setup inventory | P0 | L | Proposed | 006 | L3 |
| L-PBI-012 | Deliver accessible machine-resource library | P1 | L | Proposed | 007, 011 | L3 |
| L-PBI-013 | Publish maintenance/cleaning/setup guidance | P1 | L | Proposed | 011, 012 | L3 |
| L-PBI-014 | Deliver symptom troubleshooting/safety escalation | P0 | XL | Proposed | 003, 006, 011 | L3 |
| L-PBI-015 | Integrate parts lookup with approved compatibility | P1 | M | Proposed | 006, 007, G-003/G-005 | L3 |
| L-PBI-016 | Define legacy/discontinued machine support | P2 | L | Proposed | 003, 006, 011 | L3 |
| L-PBI-017 | Select/prove native-first service intake | P0 | M | Proposed | 004–006 | L4 |
| L-PBI-018 | Implement structured warranty/repair/support intake | P1 | L | Proposed | 002–004, 017 | L4 |
| L-PBI-019 | Implement secure evidence/diagnostic uploads | P0 | L | Proposed | 004, 017, 018 | L4 |
| L-PBI-020 | Implement routing/deduplication/recovery | P1 | L | Proposed | 003, 017–019 | L4 |
| L-PBI-021 | Implement registration after policy approval | P2 | L | Proposed | 002, 004, 017, 019 | L4 |
| L-PBI-022 | Evaluate/govern Inbox and FAQ automation | P2 | M | Proposed | 005, 009, 020 | L5 |
| L-PBI-023 | Define owned-machine/account interface | P3 | XL | Deferred | 005, 006, 017, 021 | L5 |
| L-PBI-024 | Deliver approved post-purchase onboarding | P2 | L | Proposed | 009, 011, 013 | L5 |
| L-PBI-025 | Evaluate dealer/service-center directory | P3 | L | Deferred | 003, 006 | L5 |
| L-PBI-026 | Establish recall/safety-notice capability | P1 | L | Proposed | 003, 006, 009 | L5 |
| L-PBI-027 | Define privacy-aware measurement/events | P2 | M | Proposed | 007, 017, 020 | L6 |
| L-PBI-028 | Run integrated acceptance/release readiness | P0 | XL | Proposed | Selected release PBIs | L6 |

Batch sequence:

1. L1 — Discovery, policies, and source governance (001–005)
2. L2 — Support information architecture (006–010)
3. L3 — Machine resources and troubleshooting (011–016)
4. L4 — Service and warranty intake (017–021)
5. L5 — Ownership support and operational extensions (022–026)
6. L6 — Acceptance, measurement, and release (027–028)

## 7. Product Owner decisions

Ask only for unresolved consequential decisions, grouped and sequenced. Do not ask for information already established by approved evidence.

Blocking foundation decisions:

- Name accountable Business/Legal, Technical/Safety, Support Operations, Privacy/Security, Product Data/Content, Admin, QA/Release, and incident owners.
- Approve the source hierarchy and what evidence can change a fact from candidate/proposed to approved/current.
- Supply/approve versioned warranty terms: seller/manufacturer responsibility, covered products/components, duration/start event, exclusions, remedy, geography, transfer, registration effect, proof, and supersession.
- Approve service/repair SOP: triage, authorization/RMA, estimates/approval, fees, turnaround language, packaging, inbound/return shipping, loss/damage/insurance/claims, refusal/abandonment, and escalation. Resolve K-EVID-007 rather than duplicating it.
- Approve the private-data contract: minimum fields, serial sensitivity, upload necessity, processors, access, retention, deletion/export, logs/analytics prohibition, breach/escalation, and record system of truth.
- Decide whether to authorize a separately bounded read-only Admin audit and who owns app/configuration cost and evidence.

Blocking publication/operations decisions:

- Which support channels are actually staffed, by whom, during which verified hours, with what non-promissory response language and backup/escalation path?
- Who approves each manual, diagram, maintenance instruction, diagnostic step, compatibility relationship, and discontinued-model disposition; what revisions/rights/accessibility evidence are required?
- Which intake categories launch first, which fields are mandatory, where records route, who monitors delivery failures, and what customer acknowledgement is supportable?
- Whether receipt/photo/video upload is necessary at initial intake or can be replaced by order lookup/later secure request.
- Whether warranty registration is required/optional, its exact effect/benefit, and correction/transfer owner.
- Who can initiate/approve/update/close a recall or safety notice and operate the after-hours path?

Nonblocking/defer-capable decisions:

- Whether Inbox/instant answers merit a controlled pilot and whether generative capability is ever permitted.
- Whether account-owned machine/service access justifies an app/backend and Epic O capacity.
- Which onboarding messages are operational versus marketing and whether Epic X accepts them.
- Whether a verified dealer/service-center program exists; keep L-PBI-025 Deferred otherwise.
- Which aggregate decisions require measurement; keep PII/service data out of storefront analytics.

## 8. Recommended first batch

Refine and approve a bounded L1 planning batch: L-PBI-001 through L-PBI-005. This is the smallest safe useful batch because it can establish authority, prepare warranty/service/privacy decision packets, and design a sanitized read-only Admin audit without publishing claims, configuring Shopify, installing an app, or collecting customer data. L-PBI-001 and the repository portion of L-PBI-005 are ready for Product Owner review; L-PBI-002 through L-PBI-004 require named human owners and evidence, not guessed answers.

Expected repository artifacts after approval:

- additive authority/evidence-state registry extending current Epic E/F/G conventions;
- warranty decision packet and policy-version/product-mapping schema with all values unresolved until approved;
- service/repair/repair-shipment SOP decision packet linked to K-EVID-007;
- privacy data inventory/flow/retention/access contract;
- sanitized Admin audit plan, operation inventory, fixtures, and capability report;
- tracker/decision-register updates with explicit evidence links.

Minimum validation for that batch:

- `npm run validate:epic-l-planning`
- the new L1 contract/decision validators and negative fixtures;
- `npm run validate:epic-k-evidence`
- `npm run validate:epic-k-evidence-intake`
- `npm run validate:metafields`
- `npm run validate:brand-claims`
- `npm run validate:footer-support`
- `npm run validate:navigation`
- secret/customer-data scan appropriate to generated evidence;
- `git diff --check` plus a scoped diff/status review proving unrelated J/K changes are excluded.

L1 exit requires approved decisions or explicit unresolved dispositions, named owners, current evidence/freshness, and zero invented warranty/service/privacy commitments. A read-only Admin audit requires separate authorization; no Shopify write belongs in L1.

## 9. Coding agent implementation guidance

After Product Owner approval, prepare one bounded coding-agent prompt per reviewable batch or PBI set. Each prompt must state exact allowed files, forbidden mutations, source authorities, acceptance criteria, negative fixtures, commands, evidence output, and stop conditions. Inspect current Git state first and never stage/commit unrelated Epic J/K work.

Separate work classes:

- Repository/code: schemas, registries, validators, deterministic fixtures, theme rendering, accessible states, tests, and sanitized evidence. Extend existing Epic E/F/G/C/D/K/U patterns; do not create competing Product, machine, compatibility, resource, or evidence models.
- Shopify Admin: read-only audit, then separately authorized metafield/metaobject/Page/File/navigation/Form/Flow/Inbox/Messaging/app settings. Every mutation needs an exact plan, before/after readback, rollback/removal, and explicit authorization. Do not install apps by default.
- Content: warranty terms, contact copy, manuals, diagrams, maintenance, troubleshooting, FAQ, onboarding, directory, and safety notices require named source/rights/technical/legal/accessibility/revision approvals. A document's existence is not publication approval.
- Operations: staffed channels, routing, notifications, repair authorization, shipping/claims, retention/deletion, failure monitoring, training, safety incident response, and service records require human drills and evidence. Tests cannot approve policy.

For any future release, bind artifacts to the source commit, use a clean dedicated branch only with Product Owner direction, keep changes minimal, validate preview behavior, distinguish mocked/fixture/Admin/live evidence, obtain explicit production authorization, capture readback and monitoring/rollback evidence, and update the tracker only to the evidence-supported status.

## 10. Explicit first instructions

1. Read the Epic L findings, detailed tracker, decision/dependency register, machine-readable registry, Epic K transition record, and canonical backlog.
2. Reconcile the proposal with the canonical Epic L scope and current repository state; report discrepancies instead of silently changing scope.
3. Present the Product Owner with the proposed 28-PBI inventory, priority rationale, six batches, two Deferred items, and inherited dependencies.
4. Elicit only unresolved consequential decisions, beginning with authority, warranty, service/repair/shipping, privacy, and permission for a read-only Admin audit.
5. Refine and obtain Product Owner approval for the smallest initial L1 batch; approval of planning is not authorization to publish, mutate Shopify, install apps, send email, deploy, commit, push, or implement all Epic L PBIs.
6. Only after approval, generate a precise bounded coding-agent implementation prompt with allowed files, source/evidence inputs, negative cases, automated commands, human acceptance gates, and stop conditions.
7. Maintain `docs/rhino-lapidary-pbi-tracker-epic-l.md`, the decision/dependency register, and machine-readable registry as evidence changes. Never mark an item Complete because similar code exists, a validator passes, or a related file was deployed.

Do not immediately implement every proposed PBI. The Product Owner retains authority over scope, priority, business/legal/technical policy, Shopify/Admin/content/operations mutations, publication, release, GitHub issues, commits, and pushes.
