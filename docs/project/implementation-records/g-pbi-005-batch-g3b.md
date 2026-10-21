# G-PBI-005 — G3B role index and anonymous reorder

**October 19, 2026. Recommendation: PREVIEW VERIFIED; task acceptance PARTIAL for historical screenshot preservation.** Repository implemented, preview deployed and actually verified. Production deployed: **No**. Customer-visible on MAIN: **No**. G006/G007 are not implemented.

Evidence paths below are relative to `docs/qa/evidence/epic-g/g3b-2026-10-19/`. Original failure reports and deployment receipts remain preserved; the two historical PNG exceptions are detailed in J. [Preview catalog](https://rhino-lapidary.myshopify.com/collections/all?preview_theme_id=158631198917) requires the existing storefront access.

## A. Architecture choice

The existing canonical `/collections/all` hosts a compact text directory: Replacement Parts, Consumables and Accessories. Only this surface replaces the redundant photographic grid. Other collections and explicit sort/filter/tag views retain Trade's native grid, settings, facets and controllers. No Page, collection, search service, account feature, compatibility graph or purchasing controller is created.

The path is existing E approved classification/identity → G1 current authenticated reconciliation and E/F source verification → disposable G3B projection → Liquid exact page and Product checks → native Product URLs. Class is never inferred from names, tags, types, categories, collections or price. Exact ID, handle, governed class definition/value, full Variant membership, publication, complete page membership and source expiry are reconciled before role claims render. Invalid or expired evidence produces neutral native Product links, without role/fit claims or purchasing restrictions. Optional SKU/media/description/resource absence is not an exclusion.

Machine links consume G3A's existing route/fragment contract and current native machine objects. G3B does not invert or reconstruct the reverse projection, add cards or increase `all_products` usage.

## B. Pagination proof

`sections/main-collection-product-grid.liquid` retains exactly **one** `paginate collection.products by rhino_g_page_size` block. The canonical directory selects **150**; all other views use original `section.settings.products_per_page` (20 in preview). Three loops explicitly use offsets **0/50/100**, limit **50**. The sole native parameter is `page`. There is no second pager, competing parameter, duplicate image grid or 111-handle lookup pattern.

150 accommodates the current 119 public Products together with modest room for growth; it was not chosen simply as Shopify's maximum of 250. Actual preview measurement demonstrates reduced total transfer, DOM and images. The original grid baseline traversed six pages containing 119 unique published Products. The directory accounts for that complete membership on one page, including all 111 G Products and their 114 native Variants through Product ownership.

Fixtures cover **20, 21, 50, 51, 122, 150, 151, 250, 251 and 451** identities. A generated release records each page's full membership and each role's first page. Later-page role navigation uses `/collections/all?page=N#role-fragment`; the sole pager targets `#g-catalog`. Empty role headings are omitted. New membership requires a fresh reconciled projection; until then the ordinary native fallback preserves current links instead of claiming stale role coverage. Shopify's 25,000-item traversal boundary requires a separate future decision.

Growth beyond 150 is **fixture evidence**, not a claim that preview contains synthetic Products. Actual Shopify proves complete current coverage, the original six-page baseline and the preserved native sorted 20-card pager. [Pagination contract](../../architecture/epic-g-catalog-index-contract.md) records the official Liquid references and decision made before editing.

## C. Exact file changes

Paths are relative to the repository. `protected-state.json` contains final source hashes and exact changed-existing-file accounting.

| Files | Purpose |
| --- | --- |
| `sections/main-collection-product-grid.liquid` | Exact additive single-pager wrapper; original native branch/schema preserved. |
| `snippets/rhino-g-catalog-authority.liquid` | Generated identity/class/Variant/page/freshness projection, without private tokens. |
| `snippets/rhino-g-catalog-index.liquid` | Three groups, safe native fallback, sole pager and G3A route links. |
| `assets/rhino-g-catalog.css`, `assets/rhino-g-catalog.js` | Scoped text layout, visible focus and progressive fragment/header offset; no cart/search state. |
| `snippets/header-mega-menu.liquid`, `snippets/header-drawer.liquid` | Exactly one native Catalog child; preserve existing children and top-level menu. |
| `scripts/lib/epic-g-catalog.js`, `scripts/validate-epic-g-catalog.js` | Reproduce/validate source projection and exact section successor. |
| `scripts/test-epic-g-catalog.js` | Coverage, pagination, identity/approval drift, expiry and fallback tests. |
| `scripts/deploy-epic-g-catalog-preview.js`, `scripts/test-epic-g-catalog-deployment.js` | Five-file guard, bounded verified-predecessor correction and negative tests. |
| `scripts/lib/epic-g-catalog-entry.js`, `scripts/deploy-epic-g-catalog-entry-preview.js`, `scripts/test-epic-g-catalog-entry.js` | Separately justified two-file menu successor and deployment guard. |
| `scripts/run-epic-g-catalog-validation.js`, `scripts/lib/epic-g-test-evidence.js` | Command/source receipts; redirect historical QA output only, preserving assertions and prior evidence. |
| `scripts/probe-epic-g-catalog-baseline.js`, `scripts/validate-epic-g-catalog-browser.js` | Actual baseline/deployed coverage, keyboard, axe, commerce and performance; no overlay. |
| `scripts/probe-epic-g-anonymous-cart.js` | Isolated native add/remove check, no checkout/order or new commerce implementation. |
| `scripts/register-epic-g-catalog-routes.js`, `scripts/report-epic-g-catalog.js` | Verified route metadata and local/full remote inventory protection. |
| `data/epic-g-catalog-release.json`, `data/epic-g-catalog-routes.json` | Disposable role projection and preview-specific verified destinations. |
| `data/navigation-spec.json`, `data/global-navigation-ia.json` | Three role fragments and one theme-owned Catalog child; preview/MAIN status explicit. |
| `data/epic-g-machine-routes.json` | Reproduce additive navigation provenance only; routes, binding, original observation/browser times and expiry unchanged. |
| `package.json` | Focused validation/test/browser and independently scoped preview commands. |
| `docs/architecture/epic-g-catalog-index-contract.md` | Pagination, authority, fallback and justified navigation boundary. |
| `docs/rhino-lapidary-pbi-tracker-epic-g.md`, `docs/project/epic-g-proposed-backlog.json` | Record G005 preview acceptance; G006/007 unchanged. |
| `docs/project/implementation-records/g-pbi-005-batch-g3b.md` | This report. |
| `docs/qa/evidence/epic-g/g3b-2026-10-19/` | Captures, failures, screenshots, manifests, actual remote bodies, rollback sources and command logs. |

## D. Current catalog reconciliation

Authenticated observation began **2026-10-19T15:11:55.095Z**, completed **15:12:19.206Z**, with complete Product/Variant pagination. Admin: **122 Products / 125 Variants**. G: **111 Products / 114 Variants**, comprising **54 replacement parts / 39 consumables / 18 accessories** (native Variants: **54 / 42 / 18**). Public catalog: **119 Products**, all 111 G Products plus eight published machines. The three unpublished machines remain unavailable. No baseline count, class, identity, publication or compatibility drift was found or normalized.

G1 reports 39 approved compatibility values / 40 edges; 31 customer-eligible edges; nine approved unpublished-JadeMaster edges; 72 G Products without fit; two held Saw Vice edges. All 114 native G Variant SKUs remain blank; 24 G Products lack media and five lack descriptions. Those absences do not remove ordinary links or disable purchasing.

F binding remains **b90bf2089788e77c04fbdd5bd1766bc4d03cfb9e358179884a47b74095be949b**. Role release expiry is **2026-10-22T20:26:37.102Z**, bounded by actual observation and the unchanged governing receipt. No historical observation was relabeled fresh and no approval was renewed.

## E. Customer navigation

Fresh MAIN inspection disproved the assumed aggregate entry: Catalog is a disclosure containing Saws, Laps and Shaping, while the current homepage does not reach `/collections/all`. See `catalog-entry-check.json`, `main-catalog-entry-discovery.json` and `header-entry-preflight.json`.

The smallest necessary extension is one **Parts and supplies** child inside existing Catalog, using preview's configured native mega menu and mobile drawer. It suppresses itself if an existing native child already targets `/collections/all`. There is no top-level menu, Admin menu, header section, homepage or settings change. Both snippets matched remote native predecessors and are outside active F bindings. A separate exact additive guard rejects all other native snippet changes and cannot expand the original five-file allowance.

Verified destinations:

| Label | Route and actual unique fragment | Preview / MAIN |
| --- | --- | --- |
| Parts and supplies | `/collections/all` | Verified Catalog child / absent |
| Replacement Parts | `/collections/all#g-replacement-parts` | Verified / absent |
| Consumables | `/collections/all#g-consumables` | Verified / absent |
| Accessories | `/collections/all#g-accessories` | Verified / absent |

The five machine links use G3A native URLs plus **#OwnerContext-template--24033921695941__main**. Actual expected/observed reverse counts remain EM-1 **12/12**, LapMaster 18 **7/7**, TrimMaster **10/10**, SawMaster 18 **1/1**, SawMaster 24 **1/1**: 31 entries, 30 distinct Products. Automatic Feed Clamp appears under both exact approved SawMaster identities. JadeMaster, SawMaster 36, TumbleMaster and held Saw Vice relationships gain no destination or fit claim. Included/optional/recommended/native Related products are not converted into compatibility.

The four proposed aggregate collection routes remain 404 and unapproved. `/collections/em-1-parts` membership is not fit authority. `data/epic-g-catalog-routes.json` and the C navigation registers record verified preview identity, fragment, owner and MAIN absence after actual resolution.

## F. Anonymous purchasing

Actual preview resolves **111/111 G Product links** to their exact Product IDs, native heading, price, owned Variant, quantity and purchase controls. All blank SKU rows remain hidden and unannounced. Missing media/description Products still have usable native detail. Expired G2 fit remains suppressed rather than being refreshed in this batch.

Saw Blade retains Size **6/8/14/18**, native Variant IDs **46484258652357 / 46484258685125 / 46484258717893 / 46484258750661**, prices **$15/$25/$75/$125**, selection/URL synchronization and quantity +/- behavior. Water Guard remains natively **Sold out**. Native image modal pointer/keyboard open, Escape close and focus return pass on Screw-on Flat Lap.

The actual native form receives a deliberate local **422 fixture** and displays its existing error; changing the native Variant restores its enabled purchase control. That fixture makes no backend cart write and is explicitly separate from successful live commerce evidence.

The isolated anonymous native cart test returns **200** for `/cart/add`, verifies Saw Blade Variant **46484258652357**, quantity **2**, unit price **1500 cents**, then uses the native cart remove control (`/cart/change`, **200**) and confirms an empty cart. No account, history, machine ownership, SKU, subscription, checkout, customer or order is needed or created. No new cart API or commerce controller was implemented.

## G. Commercial exceptions

All six published zero-price G Products remain ordinary named links. The directory displays no prices, promotion/free-gift claim or purchasing restriction. `commercial-exceptions.json` records exact native Product/Variant identities. Catalog reachability does not imply commercial launch readiness.

| Product / exact Product GID suffix | Received decision evidence; Shopify state |
| --- | --- |
| Arbor Wrench / 8905779839173 | $12 received; native zero price unchanged. |
| Automatic Feed Clamp / 8905779871941 | $65.50 received; native zero price unchanged. |
| LapMaster Lap Bolt / 8905781575877 | $5.75 received; native zero price unchanged. |
| MR16 LED Bulb / 8905782558917 | Procurement/exact replacement/resale and selling price unresolved; zero unchanged. |
| Saw Vice Plate Set / 8905784099013 | Four model prices received; exact Product/Variant mapping unresolved; zero and held fit unchanged. |
| 6 in Trim Saw / 8905779282117 | No approved new price; zero unchanged. |

No price-based exclusion or commercial approval was inferred. G006 owns the outstanding decisions and execution.

## H. Validation and browser evidence

All **26 predeployment gates** passed against recorded exact reviewed runtime sources. `predeployment-gates.json` retains command, source hashes, timing, log path and exit. Later browser-harness and verified-register metadata changes do not rewrite that historical receipt. Exact commands/exits, including final metadata reruns and supplemental checks, are listed in [command-results.md](../../qa/evidence/epic-g/g3b-2026-10-19/command-results.md).

Fixture/repository pass counts: G1 **43**; G2 Product **27**; recovery protection **49**; G3A route/deployment **26+16**; G005 catalog **41**, five-file deployment guard **22**, entry successor/guard **14**; machine shell **58**; gallery **32**. Supplemental G3A runtime **8**, F consumer **22**, current final owner release **9**; evidence output-isolation fixtures **2**. No existing E/F test was weakened.

Negative cases reject unknown/changed class, identity/handle/Variant drift, removed/unpublished/future/duplicate Products, incomplete pagination, altered page parameter/membership, revoked/expired source, unauthorized native template changes, stale/missing evidence, failed gates, MAIN, homepage and unrelated-file writes. Relationship/publication drift withholds machine context without disabling ordinary browsing. Optional content absence remains nonblocking. Pagination growth and later-page role reachability are fixture-proven.

Actual final deployed browser: **exit 0**, no overlay, **2 viewport cells / 111 destinations / 0 failures**. Final actual machine rerun after menu deployment: **exit 0**, **22 machine/viewport cells / 33 destinations / 0 failures**. All eleven exact machine identities are covered, including the three default-template unpublished Products remaining 404. Existing F facts, specifications, contents, resources, media, JSON-LD and reverse cards match their protected baseline.

At **390px and 1440px**, all three role memberships and five machine links match exact source identities/URLs; no duplicate/empty group or redundant image grid appears. Pointer and keyboard role activation, focus on target heading, next-Tab Product link, visible focus, direct arrival and no horizontal overflow pass. Actual native Catalog traversal reaches the new child with one Tab after native transitions and follows it to the index at both widths. No-JavaScript output contains all **3 groups / 111 links**; direct and ordinary role fragments resolve. Axe on catalog main content reports **zero violations** at both widths. Native modal interaction is explicitly checked rather than inferred from axe.

200% text checks keep new targets visible and unclipped; the existing mobile header is **558px**, desktop **184.78px**. The global header concern is not fixed. The existing moderate EM-1 contents heading-order issue remains an inherited finding at both viewports, not a new G3B failure. Screenshots: `catalog-390.png`, `catalog-1440.png`, and corresponding `-text200.png`; actual machine screenshots are under `regression-writes/epic-g/g3a-2026-10-19/`.

### Performance

Three independent cold contexts per viewport use the existing median function and unchanged thresholds: LCP ≤2500ms, CLS ≤0.1, TBT ≤200ms. Raw samples remain in `deployed-browser.json`; this is bounded preview measurement, not field certification or reopening F's parked measurement gate.

| Viewport | LCP median | CLS median | TBT median | Initial total transfer, baseline → index | DOM, baseline → index |
| --- | --- | --- | --- | --- | --- |
| 390 | 1516ms | 0.000116 | 88ms | 1,484,826 → 1,243,572 bytes | 1652 → 733 |
| 1440 | 1704ms | 0.000140 | 158ms | 1,484,606 → 1,217,051 bytes | 1652 → 726 |

All medians and governed global-chrome resource/transfer budgets pass. Raw samples include mobile LCP **2584ms** and desktop TBT **418ms**, above their individual thresholds; these are retained, not hidden. The index loads **zero main Product images**, versus 17 in the baseline. Server-rendered HTML is slightly larger because it now supplies 111 readable Product links; total transfer and DOM improve. Exact HTML, TTFB, resource attribution, requests and timing measurements remain in the evidence; total page requests are not mislabeled global-chrome requests.

### Preserved failed or unavailable evidence

- Initial Theme Check rejected excessive generated branching; a compact exact-identity table replaced it without a suppression. Final CLI Theme Check passes.
- First actual deployment correctly fell back to native links because Shopify emitted `"\neligible"` around LiquidDoc snippet output. Diagnostics showed complete 119-Product membership passed. Captured page/role/fragment boundaries now use `strip`; native class values remain exact. A newline regression and changed-class negative fixture pass. Diagnostic and correction deployments remain recorded.
- Early harness checks mixed pointer/keyboard focus modality, raced native drawer transitions, or retained preview context in a MAIN read. Corrections use real settled Tab traversal and explicit MAIN theme identity. These were harness corrections, not hidden runtime exemptions.
- A prior single-sample TBT **237ms** failure remains preserved; final measurement uses three bounded samples, existing median logic and unchanged budgets.
- `npm.cmd run validate:epic-g-products`: **exit 1**, expected separately expired G2 fit lease, retained in `expired-g2-fit-diagnostic.txt`. It is not a role-browsing gate and no new lease was pushed.
- Shopify toolkit Liquid helper: **exit 1**, missing `@shopify/theme-check-common`, retained in `toolkit-liquid-validation.txt`. Actual repository `npm.cmd run theme:check`: **exit 0**, no suppression.

## I. Preview deployment

Target **158631198917** remains **UNPUBLISHED**. MAIN **158579622085** remains **MAIN**. Exact runtime allowance: five catalog files plus the independently justified two native menu snippets in C. Four actual push commands wrote **nine file occurrences / seven unique files**: initial five, diagnostic snippet one, corrected snippet one, then menu snippets two. Every push used explicit `--only`, `--nodelete`, `--strict`, fresh role/inventory/body evidence and required gates. No wholesale sync, G2 refresh or homepage write occurred.

Each changed file was fetched remotely after deployment and compared with intended source. Final five-file SHA-256 readbacks are in `remote-reconciliation-correction-2.json`; both menu readbacks are in `entry-reconciliation.json`. `protected-state.json` combines all seven actual body SHA-256s with final inventory MD5s and before checksums. Preview grows **446→450 files**, only four new assets. All unrelated preview files/settings remain unchanged; all **438 MAIN checksums** remain identical.

Bounded rollback sources are `preview-files-ready.json` (native collection section) and `preview-files-ready-entry.json` (two native menu bodies), with source hashes in their respective manifests. After fresh role checks, restore only these exact predecessors with `--only`/`--nodelete`, then read back inventories. New unused assets can remain inert. Never restore a whole theme. No rollback was needed.

## J. Protected state and lifecycle limits

Task-baseline verification preserves runtime and authority sources, E/F approval sources/receipts, current owner compiler/shards, G1 logic, native Product templates/purchase scripts, F facts/specifications/BOM/gallery/resources/reverse projection, JSON-LD, G2 assets/lease, machine assignments, G3A runtime, homepage and settings. Exact authorized section/menu successors replace wildcard exemptions. The final audit checks **4,165 existing files**, with **4,154 unchanged**, nine authorized source/metadata changes and the two screenshot failures below. **916 runtime/E/F paths** pass their protected-source or exact-successor assertions. Full counts and hashes are in `protected-state.json`.

**Preservation failure:** the historical machine harness uses asynchronous screenshot writes, while the initial evidence preloader redirected only synchronous JSON writes. Two prior untracked PNGs were overwritten: `docs/qa/evidence/epic-g/g3a-2026-10-19/deployed-sawmaster-18-1440.png` and `deployed-trimmaster-1440.png`. Exact original copies were not found among repository QA/test copies or 1,540 candidate Git blobs. `screenshot-preservation-audit.json` retains original baseline SHA-256 values and the recovery search. The preloader now redirects asynchronous writes as well; two isolation fixtures pass and the final machine rerun saves its screenshots under G3B. Historical JSON/failure records and all F approval/runtime sources remain intact. The protection reporter deliberately exits 1 for these two changes, rather than treating their paths as an authorized exception. Restoring exact originals from an external backup remains blocked; this prevents an unqualified task-complete recommendation.

G3A navigation-provenance reproduction preserves routes, source binding, original Admin **14:21:14.570Z** observation/browser timestamp and October 22 expiry; it creates no new grant or observation. EM-1 remains **20 reference occurrences / 18 unique handles**, owing to two overlapping moss pads. G3B adds **zero lookups**.

G2's expired forward-fit presentation lease is unchanged and not counted as active fit. G3B respects G1's governing role receipt while keeping it separate from the G2 presentation lease. Build/deployment validates private approval; Liquid checks exact public identity/class/membership/time at render. Shopify caching and browser clocks cannot guarantee instantaneous private revocation. No service, public Admin proxy or token exposure is introduced. The G003 private-revocation/production-policy criterion remains partial; production revalidation and emergency withdrawal require a separately approved operating/release decision. Native browsing remains available when role claims expire.

## K. Shopify operation accounting

Continuation accounting records **75 authenticated connector reads**: 26 Product/Variant reads and 49 theme identity/inventory/body reads. Of these, 26 catalog operations and 43 cumulative theme entries are individually logged; six initial theme reads are carried forward from the initial capture accounting (four inventory pages, one body read and one identity read). The initial identity timestamp was not retained, and its raw response is only in prior tool history. Initial inventory/body capture timestamps and pagination remain in their `*-before.json` artifacts. This logging limitation is explicit; CLI internal HTTP requests and browser GET totals are not inferred or advertised as counted.

Preview pushes: **4**; file write occurrences **9**, unique runtime files **7**. Admin Product/Variant/metafield/collection/Page/menu/price/SKU/inventory/publication mutations **0**. MAIN writes **0**. Theme publication **0**. Browser password authentication is separate from catalog mutation. The isolated native anonymous cart generated exactly **2 storefront POSTs**, add/remove, both 200, final cart empty; no checkout, customer data or order operation. The 422 error test was intercepted locally and wrote no backend cart state.

## L. PBI status recommendation

| Dimension | G-PBI-005 |
| --- | --- |
| Repository implemented | Yes |
| Preview deployed | Yes — 158631198917, seven bounded files |
| Preview verified | Yes — actual Shopify, no overlay |
| Production deployed | No |
| Customer-visible on MAIN | No |
| Formal recommendation | Preview functionality verified; task acceptance PARTIAL |
| Outstanding functional preview criteria | None |
| Outstanding task preservation criterion | Two historical QA PNG originals need exact backup restoration |

Production release is a separate authorized operation requiring fresh target/source/expiry verification. Commercial G006 readiness, G007 integrated release QA, G003 private revocation and inherited global header/EM-1 concerns remain explicitly separate. This recommendation does not declare production launch readiness.

## M. G4 handoff — no implementation

G006 must confirm exact approved Product/Variant mappings and authorized execution for received Arbor Wrench, Clamp and Lap Bolt prices; resolve MR16 procurement/specification/resale/price, Saw Vice model mapping and 6 in Trim Saw price. None of those values was applied or used to infer fit/restrictions.

G007 can consume verified role/Variant coverage, route/fragment contracts, all machine memberships, seven-file remote reconciliation/rollback, native commerce, accessibility/performance and preserved negative/failure evidence. Later integrated release checks must revalidate current inventory/source/publication/expiry and production target, preserve expired G2 suppression and track inherited concerns. No G4 implementation, parked F gate reopening or production deployment was performed.
