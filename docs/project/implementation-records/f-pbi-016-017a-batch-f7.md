# Epic F Batch F7 — measurement contract and template rollout planning

F-PBI-016 is complete for repository measurement-contract scope; actual instrumentation is blocked. F-PBI-017A is complete for repository planning/dry-run scope. F-PBI-017 remains partial and F-PBI-017B is open/blocked/not authorized. This record does not implement F-PBI-018 or prepare its aggregate release packet.

## Scope and authorities

User-authorized scope is repository contracts, fixtures, schemas, validators, dry runs and handoff artifacts only. The completed F6 working tree was captured before F7 edits. [Exact F7 file manifest](../epic-f-batch-f7-file-manifest.json) records before/after hashes relative to that state, independently of the earlier uncommitted F1–F6 changes. No earlier source, validator, runtime, performance budget or safety gate was weakened.

Measurement extends the [shared storefront event registry](../../../data/storefront-event-contracts.json), referencing the [F measurement contract](../../../data/epic-f-machine-measurement-contract.json). Authorities are the [analytics migration plan](../../analytics/analytics-migration-verification-plan.md), [script/pixel register](../../privacy/third-party-script-and-pixel-register.md), and existing C/D measurement plans. The proposed `rhino:section:ready` lifecycle event remains separate from decision/success measurement.

Rollout consumes exact approved E classification and Product/Variant identity, E Admin/downstream readiness, the F consumer release, the historical September 10 read and the discovery inventory. [Rollout policy](../../../data/epic-f-machine-template-rollout-policy.json) hashes these authorities. The intended suffix is exactly `machine` and template exactly `templates/product.machine.json`; existing F template contracts and runtime hashes validate it. No label, title, Vendor, tag, collection, family or handle pattern selects targets.

The E mutation-plan validator was inspected. It exports only an E-domain validator bound to E mutation-plan schemas, PBI/domain rules and full E snapshots. F does not import it or couple to an executable E migration. F uses the same E-PBI-019 human-role/exact-plan/input/time evidence boundary; its local pure canonical hash and approval checks are bounded to template assignment. No mutation client exists.

## Measurement ownership and readiness

| Native action | Singular reserved owner slot | Actual owner assignment | F emission |
|---|---|---|---|
| Product view | U/native/product_view | Unresolved in existing U authority | Forbidden |
| Add to cart | U/native/add_to_cart | Unresolved in existing U authority | Forbidden |
| Begin checkout | U/native/begin_checkout | Unresolved; actual collector support must be verified | Forbidden |
| Purchase | U/native/purchase | Unresolved in existing U authority | Forbidden |

There are four unique reservations and zero newly assigned owners. The existing U documents still say TBD; F cannot truthfully appoint an owner. This distinction is encoded as `owner: null`, `ownerAssignment: unresolved`, `contract_ready`, `instrumentation_blocked`. Logical native action IDs are not claims about wire event names or installed collectors. Validators reject duplicate owner rows, F ownership, custom/native reclassification, native aliases in the shared registry and F emission requests. Full runtime hashes prevent buy-button wrappers, listeners, analytics beacons and new assets from being added by F7. Native commerce and pickup remain authoritative.

| Optional event | Question ID and accountable Product Owner question |
|---|---|
| `rhino:machine:contact-activate` | F-MQ-CONTACT — Are machine shoppers using neutral Contact during evaluation? |
| `rhino:machine:resource-activate` | F-MQ-RESOURCE — Are approved Product resources used during evaluation? |
| `rhino:machine:context-navigate` | F-MQ-CONTEXT — Do shoppers navigate to exact contextual Products? |
| `rhino:machine:delivery-navigate` | F-MQ-DELIVERY — Are shoppers seeking delivery-policy information? |

Contact activation is neither inquiry submission nor purchase attribution. No event is defined for impression, scroll, expansion, details state, rendering, suppressed modules, page height or fixture presence. Video/warranty instrumentation remains deferred; specifications have no demonstrated distinct decision boundary. No conversion targets, KPI thresholds or historical baseline values are invented.

Payload schemas use a closed per-event object: exact governed machine Product GID, fixed event/module identity and approved relative destination. Resources additionally require exact scoped resource identity and may use Variant GID only for an exact Variant-scoped resource. Context navigation requires an exact Product GID plus relationship identity and its canonical route. Product/Variant pairs are checked against E identity. The schema forbids every unlisted property, including customer/account/contact data, form contents, notes, free text, descriptions, DOM text and referrers. F6's `safeRelativeRoute` is reused and combined with exact destination identity; external/protocol-relative/query/fragment/encoded/traversal/token/customer-context routes cannot be substituted. Fixture authority cannot authorize release instrumentation.

Definition, emission, collection, storage, reporting and analysis are separate fields. Analytics Owner owns reporting and baseline review, as in C/D. Native aggregate Shopify sources may answer some questions; placement attribution must not be inferred. Baseline is the first 28 days after separately approved collection, with monthly Analytics Owner/Product Owner review. No external dashboard/service/store is created. U / Analytics Owner and Privacy Owner must decide actual event owner, consent, collector and deduplication identity. No assumption transfers Shopify-native consent to a new tool or between pixels and theme code. Custom instrumentation is blocked until a separate reviewed implementation. Contract validation itself has no publisher and emits zero events.

## Exact rollout assessment

All values below are historical planning fixtures, not current Admin facts. Historical null suffixes remain null for rollback; they are never rewritten as `product.json`.

| Machine label (display only) | Exact Product GID | Historical status/publication | Prior suffix | Assessment |
|---|---|---|---|---|
| BeadMaster 6" | `gid://shopify/Product/8905779937477` | ACTIVE / published historically | `null` | Conditional future candidate; blocked by E/read/GO |
| EM-1 Machine | `gid://shopify/Product/8905780756677` | ACTIVE / published historically | `null` | Conditional future candidate; blocked by E/read/GO |
| JadeMaster, 14" | `gid://shopify/Product/8905781248197` | ACTIVE / unpublished | `null` | Excluded: JadeMaster: explicit F-PBI-017 exclusion; historically unpublished; separate authorization required |
| LapMaster 12" | `gid://shopify/Product/8905781412037` | ACTIVE / published historically | `null` | Conditional future candidate; blocked by E/read/GO |
| LapMaster 18" | `gid://shopify/Product/8905781477573` | ACTIVE / published historically | `null` | Conditional future candidate; blocked by E/read/GO |
| SawMaster 18" | `gid://shopify/Product/8905784131781` | ACTIVE / published historically | `null` | Conditional future candidate; blocked by E/read/GO |
| SawMaster 24" | `gid://shopify/Product/8905784197317` | ACTIVE / published historically | `null` | Conditional future candidate; blocked by E/read/GO |
| SawMaster, 36" | `gid://shopify/Product/8905784262853` | DRAFT / unpublished | `null` | Excluded: SawMaster 36: explicit F-PBI-017 exclusion; historically draft/unpublished; separate authorization required |
| ShapeMaster 6" | `gid://shopify/Product/8905784328389` | ACTIVE / published historically | `null` | Conditional future candidate; blocked by E/read/GO |
| TrimMaster | `gid://shopify/Product/8905785344197` | ACTIVE / published historically | `null` | Conditional future candidate; blocked by E/read/GO |
| TumbleMaster | `gid://shopify/Product/8905785868485` | DRAFT / unpublished | `null` | Excluded: TumbleMaster: explicit F-PBI-017 exclusion; historically draft/unpublished; separate authorization required |

The exact conditional future candidate set is the eight nonexcluded rows above and is serialized as `futureCandidateGids` in the [dry-run plan](../../../data/epic-f-machine-template-rollout-plan.json). These are potential future field changes, not authorized mutations. `eligibleTargetGids` is empty; current executable mutation set is empty. All 11 have classification readiness blocked. Explicit exclusions persist independently of future status changes; changing an exclusion demands separately approved evidence and review.

Complete current E reconciliation, applicable definition migration (E-MUT-020), applicable product_class migration/value (E-MUT-021), fresh exact identity and consumer eligibility are all false/not verified. Historical repository class proposals/approvals are not live assignment authorization. No Product class was populated. Real customer grants and current F6 support/resource output remain zero.

## Before-read, drift, dry run and rollback

The before-read schema requires exact 11-GID scope, shop/environment, observation time, source/hash, status, publication and customer visibility, exact suffix including null, governed classification identity and live value, exact repository template/hash and Admin theme/template existence, updatedAt/resource version, and protected-field digests. Future reads must be complete, bounded and immediately before execution. The plan uses a conservative 900-second maximum age as a repository gate, not a claimed Shopify standard. If the approval/read window expires, re-read and re-review; elapsed time cannot grant approval. Historical evidence lacks complete publication/field/version/theme coverage and cannot become an execution read by changing its timestamp.

Protected fields cover identity/copy, variants/options (price, compare-at price, SKU, barcode, inventory, policy, availability, weight and configuration), Vendor, Category, tags, metafields, media, SEO, shipping profile, status and publications. Future before/after reads must cover these fully; missing fields are explicit null digests and block verification. A source hash cannot substitute for coverage.

Any status, publication, template, classification, target, exclusion, shop/environment, template-file or hash drift blocks and requires re-review. Missing/extra/duplicate targets, wrong class, stale/future reads and missing before-state fail closed. No auto-reconciliation exists. Snapshot source values are checked against the historical read, not merely a self-reported digest.

The dry-run builder writes only the repository JSON artifact and schema-validates output. Semantic hashes sort object keys; repeated identical inputs produce identical output. Each assessment includes current fixture suffix, intended suffix, classification readiness, status/publication, eligibility and reasons, conditional mutation necessity, exact allowed change and rollback value. The plan contains eight conditional proposals and zero mutations. Plan hash: `e69138cf06cdab34f7560058d156dfe0f4f042cc94d395582dd55fde1cfd7146`.

The write-set allowlist contains only `templateSuffix`; Product GID is the target identity, not a mutable field. No API operation or executor is generated. A later Shopify API adapter must use the narrowest supported input and validate unchanged values if additional fields are required. Price, SKU, Vendor, metafield, status/publication and any incidental property are rejected. Content migration, Product publication, theme push/publish and all other actions are forbidden.

Rollback is prepared independently for every conditional proposal and validated against its exact before-state. Null, empty and custom suffixes remain distinct. Missing or ambiguous prior values block; rollback never assumes `product.json`. Before any actual future rollback, re-read and ensure the expected assigned suffix still matches, then use separate bounded execution authorization.

## Human GO and after-state boundary

Product Owner and Shopify Admin Owner approval slots are both `granted: false`, with null time, plan hash, before digest and evidence, and empty exact target sets. No code generates GO. Later human decision records belong in a separate execution envelope referencing the reviewed plan; do not rewrite hashed planning slots to store approval evidence. Future evidence must bind both roles to exact plan identity/hash, ordered exact target set, fresh before digest and recorded time after the read. Missing either role, wrong hash/set/time or absent human evidence blocks. A green CI run or broad Epic F approval cannot authorize execution. The F7 policy and its schema freeze all execution permissions off. F-PBI-017B must review a separate policy/implementation; this library has no execution entry point.

Future post-mutation reads compare every exact GID, intended suffix, unchanged status/publication/classification and complete protected-field digests. Resource version/timestamp may advance as mutation metadata, but unrelated data must not change. Excluded/nonmutated rows must retain their suffix. Local after-state unit fixtures prove comparisons only; no live after verification ran. Later Shopify-rendered preview/storefront smoke needs separate authorization. Product assignment is store-level; unpublished themes are not sandboxes for assignments.

`productionThemePublicationAuthorized = false`. Template assignment and theme publication remain different approvals/actions.

## Commands and evidence

Validation results are recorded after the aggregate run in [F7 evidence](../../qa/evidence/epic-f/batch-f7-validation.json). Required F7 checks include measurement validator/tests, rollout validator/tests, hardcoded strings, JSON registers, recursive F6 regression, Theme Check and `git diff --check`. F6 recursively runs F5, F4, F3, F2 and F1; their exact nested commands and exit codes are retained. F-PBI-015A local performance regressions run only as inherited checks. F7 adds no runtime fixture and does not run F-PBI-015B release certification. No performance thresholds change.

Initial development diagnostics: the new F7 runner initially looked for F2 evidence in the wrong directory; its lookup was corrected to `test-results/epic-f/f2/batch-f2-validation.json`. Initial environment diagnostic: installed Playwright expected Chromium revision 1228, which was absent locally. `npx playwright install chromium` installs the required local test browser. The initial aggregate attempt and repair results are retained separately; failed checks are not treated as passing evidence. No test requirements were weakened.

## Retained blockers and safety outcome

F-PBI-004B/006B/007B/008B/009B/010B/011B remain open/not ready; 013/F-DEC-001 remains unresolved; remaining 014B stays open/partial; 015B remains deferred; 017B remains open/blocked; 018 remains not started. Measurement work adds no accessibility evidence and planning adds no live Shopify parity. F1–F6 architecture passing does not authorize fact activation.

Historical diagnostics remain separate from required batch success: search fixture ownership gap; consumableProduct fixture ownership gap; 103 historical Product CSV findings; 37 description claim matches; seven broken Manuals-hub destinations; B3C-D03 blocked; B3B-D06 pending; all inherited B-scope activation blockers. No unrelated diagnostic was resolved.

Shopify Admin mutations: **No**. Product template assignment: **No**. Product/Variant/metafield/metaobject/File/Page/policy/media/SKU/Category/Vendor/inventory/delivery/location/publication mutations: **No**. Analytics/pixel/app/Customer Event/consent/tracking/cookie/integration configuration changes: **No**. Browser instrumentation or new storefront external requests: **No**. Checkout/order/contact submissions for measurement: **No**. Preview/production theme push/publication: **No**. Production-theme publication authorization: **No**. Performance threshold changes: **No**. F7 stops here; no rollout execution or F-PBI-018 work follows.

## Final validation results

The final `npm run validate:epic-f-batch-f7` exited **0**. Measurement tests: **54 passed**; rollout tests: **67 passed**; zero emitted events and zero mutations. Theme Check inspected **415 files with no offenses**.

| Exact command | Exit |
|---|---:|
| `npm run validate:epic-f-machine-measurement` | 0 |
| `npm run test:epic-f-machine-measurement` | 0 |
| `npm run validate:epic-f-machine-template-rollout` | 0 |
| `npm run test:epic-f-machine-template-rollout` | 0 |
| `npm run validate:hardcoded-strings` | 0 |
| `npm run validate:registers` | 0 |
| `npm run validate:epic-f-batch-f6` | 0 |
| `npm run theme:check` | 0 |
| `git diff --check` | 0 |
| `npm run validate:epic-f-batch-f1` (nested regression) | 0 |
| `npm run validate:epic-f-batch-f2` (nested regression) | 0 |
| `npm run validate:epic-f-batch-f3` (nested regression) | 0 |
| `npm run validate:epic-f-batch-f4` (nested regression) | 0 |
| `npm run validate:epic-f-batch-f5` (nested regression) | 0 |
| `npm run validate:epic-f-batch-f6` (nested regression) | 0 |
| `npm run validate:epic-f-batch-f7` | 0 |
| `npm run build:epic-f-machine-template-rollout` (each of two identical CLI runs) | 0 |
| `npx playwright install chromium` (local environment repair) | 0 |

The two builder runs preserved file SHA-256 `f49f60e57303fa6e227aea66744e2510529e51930fd894ccdec0e87e95d0a2d8`. Nested historical diagnostic commands `npm run validate:launch-fixtures` and `npm run validate:product-data -- data/product-export/products.csv` each retain exit **1**, with unchanged finding signatures (2 ownership gaps and 103 CSV findings). They are not required-success checks and are not release approval. The first aggregate attempt exited **1**; [development evidence](../../qa/evidence/epic-f/batch-f7-development-validation.json) preserves the missing-browser failures and F2 reporting-path correction separately.

The manifest lists every F7-created/modified repository file with its exact SHA-256 relative to the starting F6 workspace. Its own hash is omitted to avoid circular hashing. Final artifact verification compares the current path set and each after-hash to the manifest and reruns `git diff --check`; no theme/rendering file appears in the F7 delta.
