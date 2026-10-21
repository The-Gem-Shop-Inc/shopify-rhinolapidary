# Epic G2 recovery and actual preview verification

2026-10-16. **The five-file G2 implementation is deployed and verified on unpublished preview 158631198917. MAIN was untouched.** Recommend G-PBI-002 COMPLETE for the bounded current-catalog preview scope; G-PBI-003 remains PARTIAL solely for immediate private revocation/absolute expiry and the unapproved production operating policy. No G3 implementation occurred.

Evidence: [g2-recovery-2026-10-16](../../qa/evidence/epic-g/g2-recovery-2026-10-16). The initial [G2 report](g-pbi-002-003-batch-g2.md) and its original failures remain unchanged. Machine accessibility has a separately reported, reproduced baseline finding; this report does not claim every audit passed.

## A. Root cause review

| Command | Original failure and classification | Exact current correction / protection | Before → after |
|---|---|---|---|
| validate:epic-f-machine | Historical native template byte pin rejects the authorized G2 JSON delta. Native commerce protection is legitimate; representation alone is stale. | Keep every other native hash and all machine architecture assertions. For Product JSON, require hash-locked native fixture plus exactly the SKU render call and fit block, with full-object equality. Removal, reordering or any extra setting/block still fails. | 1 → 0 |
| validate:epic-f-context-delivery | F5 preservation hashes pin the prior default template; current owner adapter is not selected by the standalone command. | Same exact template contract; other preserved paths remain hash checked. Verify final F binding, select its existing owner/media adapters, and compare current compiler output. Historical empty contextual/delivery fixtures still assert zero. | 1 → 0 |
| validate:epic-f-facts | Missing current owner-binding selector makes compiler comparison expect the historical zero-only wrapper, despite the approved owner renderer. The legacy zero-grant fixture itself is valid. | Verify the unchanged final F binding and current owner release before selecting the existing adapter. Preserve the zero consumer/fixture assertions separately; require exact compiled current wrapper/shards and release. | 1 → 0 |
| validate:epic-f-gallery | Missing media-binding selector treats the current six governed media grants as inactive; native template byte pin also predates G2. | Verify existing media binding and final owner chain, compare exact media compiler output, retain synthetic-media isolation and all native controller hashes; default template uses the strict two-extension contract. | 1 → 0 |
| validate:epic-f-support-resources | Historical preserved default template and activated F projection predecessors. The validator itself is receipt-bound. | Leave that source byte-identical. Current entry point verifies the binding and adapts one exact preservation predicate in memory to admit only the strict template delta or a verified recorded predecessor. All warranty/resource/schema/isolation assertions remain. No resource grants are introduced. | 1 → 0 |
| validate:rhino-style-contract | Regex truncates nested parentheses, misclassifying `rgba(var(--color-foreground), .2)` as a literal color. It reproduces in the pre-G2 bound CSS. | Recognize the complete governed native foreground tuple with valid alpha. Literal hex/RGB/HSL, unknown variables, fallbacks and invalid alpha remain rejected. No CSS changed. | 1 → 0 |

original-validator-failures.json reproduces all six exits 1. corrected-validator-commands.json and final-validation-commands.json record exits 0. **No path was simply ignored.** Forty-nine protection tests include unauthorized template removal/reordering/settings, current F grant/renderer corruption, historical zero-state reproduction, style negatives and preview guard rejection. Six additional readback negatives reject altered JSON settings, Liquid, warning text, target identity, publication or missing assets.

## B. Exact code changes

| Files | Reason |
|---|---|
| scripts/lib/epic-g-current-protection.js | New strict native-plus-two-extension template invariant; existing binding activation; exact recorded predecessor/current-source verification. |
| scripts/validate-epic-f-machine.js | Narrow template predecessor acceptance; all other architecture/native assertions retained. |
| scripts/validate-epic-f-context-delivery.js | Current binding selection and exact template/current projection checks. |
| scripts/validate-epic-f-facts.js | Current binding selection, current release proof and distinct historical fixture assertions. |
| scripts/validate-epic-f-gallery.js | Current media/owner binding selection and exact template delta; existing controller isolation retained. |
| scripts/validate-epic-f-support-resources-current.js | New current adapter for the unchanged receipt-bound support validator; one checked preservation predicate only. |
| scripts/validate-rhino-style-contract.js | Correct dynamic-color parsing; export parser for negative tests. |
| scripts/test-epic-g-recovery-protection.js | Forty-nine template, authority, style and deployment guard checks. |
| tests/fixtures/epic-g-recovery/native-product.json | Historical native Product JSON, hash locked to the existing native baseline. |
| tests/fixtures/epic-g-recovery/validate-epic-f-{machine,context-delivery,facts,gallery,support-resources}.historical.cjs | Five exact original validator source archives. These are historical source fixtures, not current release acceptance. |
| tests/fixtures/epic-g-recovery/validate-rhino-style-contract.historical.cjs | Exact original style validator archive, matched to the before hash. |
| scripts/validate-epic-g-products.js | Preserve old QA outputs; enforce the strict whole-template invariant alongside existing source/allowlist checks. |
| scripts/deploy-epic-g-products-preview.js | Replace stale arbitrary-count/old-log guard with named successful current gates, eleven-machine baselines, fresh MAIN/preview identity and rollback-source checks. Record exact hashes and rollback source. Target and five-file allowlist remain fixed. |
| scripts/reconcile-epic-g-preview.js | Exact remote source/inventory reconciliation; explicitly limited Shopify Product JSON serialization handling. |
| scripts/test-epic-g-preview-readback.js | Six negative tests for remote reconciliation. |
| scripts/validate-epic-g-products-browser.js | Current exact eleven-machine identity/assignment join; explicit unpublished 404s; baseline comparison and optional supplemental machine axe run. Current evidence directory, no old output overwrite. |
| scripts/validate-epic-g-fit-preview.js | Actual rendered all-G fit coverage by exact source/destination GID, titles and URLs; sequential requests, no retries or overlays. |
| scripts/test-epic-g-product-runtime-overlay.js | Deployed mode uses the actual fit element; only permitted SKU/422/unavailable/clock fixtures are local. Tests valid, invalid and expired lease states. |
| data/epic-g-product-release.json; snippets/rhino-g-product-fit.liquid | Regenerated from the fresh actual Admin capture, retaining original receipt expiration. |
| package.json | Current support validator entry point and focused recovery/fit-preview test scripts. |
| docs/architecture/epic-g-product-release-contract.md | Current verification, serialization, preview state and proposed production operations. |
| docs/rhino-lapidary-pbi-tracker-epic-g.md; docs/project/epic-g-proposed-backlog.json | Separate current repository, preview, production and partial statuses. |
| docs/project/implementation-records/g-pbi-002-003-recovery.md | This report. |

Exact source/evidence file paths and SHA256s are in files-manifest.json. The four non-generated G2 theme files retain their prior implementation bytes; only the fit projection needed fresh generation. No new theme asset beyond the approved five was deployed.

## C. Protected state and eleven machine identities

Historical F binding **b90bf2089788e77c04fbdd5bd1766bc4d03cfb9e358179884a47b74095be949b** still verifies. Existing owner release compiler, G1 authority, receipt, approved facts/specifications/BOM/media/reverse cards, native purchase scripts and machine templates were not changed. The receipt-bound support validator remains byte-identical. Original validator archives match the recovery before hashes. repository-before.json / repository-after.json and protected-state.json enumerate before/after proof.

| Approved Product GID | Current handle | Actual templateSuffix | Current storefront state |
|---|---|---|---|
| gid://shopify/Product/8905779937477 | beadmaster | machine | Published, native/F UI verified |
| gid://shopify/Product/8905780756677 | em-1 | machine | Published, native/F UI verified |
| gid://shopify/Product/8905781248197 | jademaster | default/null | ACTIVE but unpublished; 404 verified |
| gid://shopify/Product/8905781412037 | lapmaster-12 | machine | Published, native/F UI verified |
| gid://shopify/Product/8905781477573 | lapmaster-18 | machine | Published, native/F UI verified |
| gid://shopify/Product/8905784131781 | sawmaster-18 | machine | Published, native/F UI verified |
| gid://shopify/Product/8905784197317 | sawmaster-24 | machine | Published, native/F UI verified |
| gid://shopify/Product/8905784262853 | sawmaster-36 | default/null | DRAFT/unpublished; 404 verified |
| gid://shopify/Product/8905784328389 | shapemaster | machine | Published, native/F UI verified |
| gid://shopify/Product/8905785344197 | trimmaster | machine | Published, native/F UI verified |
| gid://shopify/Product/8905785868485 | tumblemaster | default/null | DRAFT/unpublished; 404 verified |

These identities come from approved classification/identity joined to fresh Admin records, not names or tags. Baseline and deployed checks cover all eleven at 390/1440. Eight published pages match exact prior headings/prices/selected Variant IDs/quantity/availability/schema/media and F specification/contents/reverse-card output. No machine page has a G marker, fit module or G script/style. The existing shared section's G-only custom_liquid guard prevents machine execution of the G extensions.

**Qualification:** no customer heading, cart form or gallery can be tested on the three unavailable routes. Their actual 404s and exact Admin assignment/publication states are the demonstrated behavior. No draft/unpublished Product was exposed or newly assigned a template, and no private preview was substituted for a customer route. Future publication remains its existing separate F/catalog state work.

All 438 MAIN file checksums match both the new before inventory and the original initial-G2 inventory. Preview changed exactly the intended five files; all other 441 pre-existing preview files remained unchanged. Config/settings and homepage/navigation files were not synchronized. Parked F release/performance gates remain parked.

## D. Fresh evidence

- Shop: gid://shopify/Shop/79279947973, sz5dnk-nf.myshopify.com.
- Actual authenticated capture: **2026-10-16T21:01:24.463Z–21:01:45.507Z**.
- Complete pagination: 13 Product pages and 13 Variant pages, 122 Products / 125 Variants; G 111 / 114.
- Classes: 11 machines, 54 replacement parts, 39 consumables, 18 accessories.
- Approved values/edges: 39 / 40; customer-eligible edges 31; approved unpublished-target edges nine. No class/reference/publication/baseline drift.
- Owner receipt unchanged: **expires 2026-10-22T20:26:37.102Z**.
- New presentation lease: **expires 2026-10-16T22:01:24.463Z**, one hour after the actual observation capture, bounded additionally by the receipt. Recompiling an old observation cannot extend it.
- 114 G Variant SKUs remain blank; 24 G Products lack media, five lack descriptions, six prices remain zero. No optional values were invented or applied.

See connector-reads.json, admin-read.json and foundation-report.json/.md. Normalization reuses the E/G1 paginator and adds no network calls. No historical approval was regenerated or renewed.

## E. Preview deployment and remote readback

Target **158631198917**, Rhino Lapidary - Preview, UNPUBLISHED; MAIN **158579622085**, shopify-rhinolapidary/main, MAIN. Actual identities were read before writing. All corrected gates passed. One guarded CLI 4.8.3 push started **21:09:03.021 UTC** with --only for exactly five paths, --nodelete, --strict and no publish/allow-live flag. Rollback source and its hash were saved before the push.

| Theme file | Before remote SHA256 | After remote SHA256 |
|---|---|---|
| templates/product.json | 7c82a849e091ed77e5986e48381ba76f10374bbf09e21660487abc97c9c4d6d0 | bda2a8ac9521016b743e5675cfabd35ecaffde8c69da5d6320b8b47b9385a4fe |
| snippets/rhino-g-product-detail.liquid | Absent | 779d1be42f83b70de01abc011990e6b3f2fe30fecaac514768882cc407ea5218 |
| snippets/rhino-g-product-fit.liquid | Absent | 5222ffd9d3e39aba51355df2b12985ae7c8514366827deaab7da0529da79d8d3 |
| assets/rhino-g-product.css | Absent | 14a7c09a79424eeb73e9498531d8a07dd02fd6d524f5f55b2aa16cad08e4cb36 |
| assets/rhino-g-fit.js | Absent | ccbcc3628453b612561939f52c83bf061cc8b56a6969df9439128e72643084d2 |

Four files are byte-identical to intended local sources. Product JSON's intended local SHA is f979369720afa2e4ddddaf4e6112e0b88326b73fc2f4c2183b7ab1f7f925e8a2. Shopify preserves its exact existing generated-file warning and changes whitespace, so remote bytes differ. The initial strict byte comparison returned 1 and browser work stopped. Investigation proved complete parsed JSON equality, then the strict whole-template contract verified every block/setting/order. Only the existing warning and serialization are accepted; six negative tests prove actual content changes still fail. No rollback was required.

readback-proof.json binds actual fetched bodies to the intended release; preview inventories are **442 → 446 files**, exactly one changed existing template plus four new assets. MAIN remains 438 unchanged files. Roles remain UNPUBLISHED/MAIN respectively. preview-deployment-plan.json contains intended hashes, old remote MD5/SHA, rollback source/hash and exact command. preview-push.json preserves CLI result; no wholesale sync or settings write occurred.

**Accounting:** 37 connected read-only Admin data queries; five schema calls; two documentation calls (one rejected argument before execution); two validation-helper calls (helper skipped, actual execution validated queries). Zero mutation-tool calls and zero Product/Variant/metafield/collection/Page/price/SKU/inventory/publication writes. **One preview push, five reconciled theme-file writes, zero MAIN writes, zero theme publications.** CLI internal request counts and browser/CDN/password-auth HTTP totals were not instrumented and are not misreported as complete. One cart POST was intercepted locally and fulfilled with a synthetic 422; actual cart writes zero. See shopify-operations.json.

## F. Actual browser evidence and command results

Preview example: [Automatic Feed Clamp](https://sz5dnk-nf.myshopify.com/products/automatic-feed-clamp?preview_theme_id=158631198917). Fit is time-bounded; after the recorded lease expires it intentionally suppresses until another verified fresh release. The SKU/gallery changes do not expire.

| Execution | Exit | Evidence / result |
|---|---:|---|
| node scripts/validate-epic-g-products-browser.js --baseline | 0 | baseline-browser.json; 40/40 before-deployment cells |
| npm.cmd run test:epic-g-products:browser | 0 | preview-browser.json; **40/40 actual deployed cells**, no --overlay |
| node scripts/validate-epic-g-fit-preview.js | 0 | deployed-fit-coverage.json; **150/150 actual cells**, all 111 G Products mobile plus all 39 approved-source Products desktop |
| node scripts/validate-epic-g-products-browser.js --machines-only --machine-axe | **1** | preview-machines-axe-browser.json; 20/22 cells pass; EM-1 moderate heading-order at both widths, reproduced on unchanged MAIN |
| Read-only unchanged MAIN EM-1 axe comparison | 0 | em1-unchanged-main-axe.json; identical normalized finding/target at both widths |
| node scripts/test-epic-g-product-runtime-overlay.js --deployed | 0 | runtime-overlay.json; **8/8 permitted SKU/cart/unavailable/clock fixture checks** over deployed Product behavior |

No injected LiquidJS fit fragment counts as deployed acceptance. Old overlay evidence remains supplemental in the initial G2 folder; this recovery's live fit coverage uses real Shopify output. Populated SKUs are fixture response fields because all live native G SKUs are blank. The deployed runtime test does not inject a fit module.

predeployment-gates.json records 21 successful commands including both existing browser suites. final-validation-commands.json records **24 successful final commands**:

| Exact command | Exit | Checks where counted |
|---|---:|---|
| npm.cmd run test:epic-g-foundation | 0 | 43 |
| npm.cmd run test:epic-g-products | 0 | 27 |
| npm.cmd run test:epic-g-recovery-protection | 0 | 49 |
| node scripts/test-epic-g-preview-readback.js | 0 | Six |
| npm.cmd run validate:epic-g-products | 0 | Full local projection/source/allowlist invariant |
| npm.cmd run validate:product-templates | 0 | Product architecture |
| npm.cmd run validate:product-purchase | 0 | Native purchase |
| npm.cmd run validate:registers | 0 | Registers |
| npm.cmd run validate:metafields | 0 | Metafields |
| npm.cmd run validate:theme-architecture | 0 | Architecture/CSS/JS/sections |
| npm.cmd run theme:check | 0 | Zero offenses |
| npm.cmd run validate:epic-f-machine | 0 | Current/historical protection |
| npm.cmd run validate:epic-f-context-delivery | 0 | Current/historical protection |
| npm.cmd run validate:epic-f-facts | 0 | Current/historical protection |
| npm.cmd run validate:epic-f-gallery | 0 | Current/historical protection |
| npm.cmd run validate:epic-f-support-resources | 0 | Current adapter plus original assertions |
| npm.cmd run validate:rhino-style-contract | 0 | Correct color classification |
| npm.cmd run test:epic-f-facts | 0 | 67 |
| npm.cmd run test:epic-f-context-delivery | 0 | 88 |
| npm.cmd run test:epic-f-media | 0 | 38 |
| npm.cmd run test:epic-f-support-resources | 0 | 177 |
| node scripts/test-epic-e-owner-response-adapter.js | 0 | 32 |
| node scripts/test-epic-f-final-owner-delta.js | 0 | 13 |
| node scripts/test-epic-f-final-owner-release.js | 0 | Nine; current bound release |

Also executed successfully in predeployment-gates.json: `npm.cmd run test:epic-f-consumer` (22), `npm.cmd run validate:epic-f-consumer`, `npm.cmd exec playwright test -- --config=playwright.machine.config.js` (**58/58**), and `npm.cmd exec playwright test -- --config=playwright.machine-gallery.config.js` (**32/32**). Fresh audit/build/normalization commands are enumerated with exits in fresh-evidence-commands.json. Final scoped whitespace and handoff checks are recorded separately.

The bundled skill Liquid validator still cannot load @shopify/theme-check-common (exit 1, skill-validator-result.json); it is not counted as passed. Installed Shopify CLI Theme Check ran and passed, and Shopify executed the actual compiled Liquid successfully. No dependency or execution policy was silently changed.

## G. Compatibility coverage

G1 enumerates expected exact GIDs, titles and native URLs. Actual observed output matches **31/31 directed links at 390 and again 1440**, across 30 source Products. All 39 approved source values were exercised at both widths; the remaining 72 were exercised mobile. Zero mismatches, empty fit headings or unsupported links. Traversal was sequential, with zero retries and no 429 responses.

- Automatic Feed Clamp gid://shopify/Product/8905779871941 → exact SawMaster 18 and SawMaster 24 links, separately named.
- Trim Saw 6 → exact approved EM-1 link.
- All nine approved JadeMaster edges remain data eligible and unpublished/customer ineligible; no heading/link for their unavailable destinations.
- Saw Vice held edges remain absent and ineligible; no Product creation or price-based fit inference.
- All 72 without approved relationships keep ordinary Product detail/purchase and emit no fit claim.
- Native Related products, included/optional/recommended semantics, JSON-LD, metadata and breadcrumbs are unchanged. Actual schema observations contain no new fit claim.

Changed sets, duplicate/orphan/unknown references, wrong classes, removed/revoked/expired approval and altered target identities/Variants fail in deterministic G1/G2 negative tests. Those invalid states were not written to Admin, and are not falsely described as mutated-live-Admin tests. Actual currently unauthorized/unassociated Products fail closed in the real storefront.

## H. Native Product behavior

All three G classes render actual native Product information. Blank SKU has zero-height hidden row and no empty label; local populated A/empty/B/C transitions use the unchanged native fragment updater, preserve exact selectable values and correct Variant IDs/URL. No live SKU was generated/populated.

Saw Blade 6/8/14/18 retains IDs **46484258652357 / 46484258685125 / 46484258717893 / 46484258750661** and observed **$15/$25/$75/$125**, with actual native price/URL changes and enabled purchasing. Water Guard remains natively Sold out/disabled. Six zero prices remain unchanged and unrestricted. Quantity plus/minus, native unavailable state and synthetic 422 alert/button recovery pass; no real cart mutation was made.

Missing media, description, resources or fit does not hide purchasing or fabricate content. The native Screw-on Flat Lap image button has real geometry, pointer/Enter opens the original modal, Escape closes it and returns focus. No gallery controller, machine renderer or purchase script changed.

## I. Accessibility and responsive results

390px and 1440px: 18 actual G page axe analyses have **zero violations**. Fit heading/link names, visible focus outlines, keyboard traversal, native media keyboard/pointer behavior and focus return are demonstrated. Blank SKU is hidden with no accessible empty label. No horizontal overflow occurs in the core route matrix or enlarged-text samples; fit does not clip those tested layouts.

At 200% root text enlargement on the three G samples, the existing header is still **558px** high at 390px, matching the prior observation; no horizontal overflow. This global concern was not fixed or silently waived. Existing machine browser suite also retains actual Chromium zoom checks.

Supplemental actual-machine axe analyses found one moderate EM-1 heading-order issue at both widths, on contents card Product 8905778430149. The same normalized target `#title-SECTION-contents-0-8905778430149`, rule and severity reproduce on unchanged MAIN. Fourteen other published-machine analyses have zero violations; the three unavailable routes have no Product UI to audit. The failing supplemental command remains exit 1. This is an existing F contents-card observation, not a newly introduced G2 regression; no F runtime was changed to make it pass. Serious/critical machine violations were not observed.

Screenshots: preview-automatic-feed-clamp-390.png, preview-screw-on-flat-lap-390.png and preview-water-guard-390.png in the recovery folder. These are actual deployed Shopify pages, distinct from the old local-overlay screenshots.

## J. Remaining constraints

Immediate private revocation remains **PARTIAL**, as required. Build verifies private approval; uncached Liquid checks current public full sets/identity/type/publication/time; client guard additionally hides expired/invalid cached/open markup. Valid/invalid/expired states passed on the deployed element with browser-only clock/attribute fixtures. Browser clocks, suspended execution and Shopify caching still prevent an instantaneous guarantee. No public Admin proxy, service or token exposure was added.

Proposed production policy, **not approved**: real Admin reconciliation and bounded verified release every 20 minutes, alert after 30 minutes without success, never extend the one-hour capture-bound lease or the owner receipt. Stop renewal on drift/revocation/expiry. Emergency withdrawal should be a separately authorized empty-fit-snippet release with readback; uncached output can stop after deployment while cached/open-page limitations remain. Sustained production operating policy and production deployment remain future work.

The three unpublished machine UIs are not certified for future publication. Existing global text enlargement and EM-1 moderate heading order remain recorded observations, without reopening parked F performance/final-release gates. No new owner worksheet or catalog mutation is needed for the currently approved G2 scope.

## K. PBI status recommendations

| State | G-PBI-002 | G-PBI-003 |
|---|---|---|
| Repository implemented | Yes | Yes |
| Preview deployed | Yes, five-file bounded release | Yes |
| Preview verified | Yes, current published G catalog and actual machine route states | Yes, all 31 eligible links and all suppression cases |
| Production deployed | No | No |
| Public customer visible on MAIN | No | No |
| Preview visible | Yes | Yes while the recorded presentation interval is valid |
| Formally complete, recommended | **COMPLETE — bounded current-catalog preview scope** | **No — PARTIAL** |
| Partial/blocked acceptance | No new G2 native Product blocker; unpublished UI qualification and existing F/global observations recorded | Immediate private revocation/absolute expiry and production operating policy remain PARTIAL |

This does not certify production checkout or authorize a MAIN release. G-PBI-006 commercial execution remains unimplemented.

## L. Next action

**G3 planning/implementation is safe to begin when separately assigned**, using the verified current contracts and retaining G-PBI-003's explicit residual operating-policy criterion. No further G2 functional correction is demonstrated for current published Products. G3 remains bounded G-PBI-004/005 reverse-path and anonymous role/reorder entry work; neither was started here. Production remains a separate authorized release step with fresh observation/lease and the proposed operating policy resolved. No H/I or account/ownership scope was added.
