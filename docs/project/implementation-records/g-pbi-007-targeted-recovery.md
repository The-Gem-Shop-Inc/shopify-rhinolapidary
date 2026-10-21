# G-PBI-007 targeted reconciliation and QA recovery — October 20, 2026

Recommend **COMPLETE for the bounded technical preview QA scope**, subject to the time-bounded authority stated below. G-PBI-006 remains **PARTIAL**. Commercial launch remains **BLOCKED**; production deployment remains unauthorized. Epic J implementation has not begun.

This successor records new direct Product Owner authority. It preserves the [original G4 report](g-pbi-007-batch-g4.md), the original commercial failure, and every failed recovery execution. A passing corrective report does not change those executions' exit codes.

## Current Shopify reconciliation

Authenticated opening observation: **2026-10-20T16:06:42.312Z–16:07:11.461Z**. Closing observation: **2026-10-20T16:43:42.839Z–16:44:05.270Z**. All captured Product and Variant fields match between opening and closing; see [closing reconciliation](../../qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/closing-catalog-reconciliation.json).

| Existing Product | Product GID suffix | Variant GID suffix | Verified native USD / decision |
| --- | --- | --- | --- |
| 6 in Trim Saw Attachment (EM-1) | 8905779282117 | 46484253278405 | 75.00; title and selling price approved/applied by owner |
| Arbor Wrench | 8905779839173 | 46484253835461 | 12.00; approved/applied |
| Automatic Feed Clamp | 8905779871941 | 46484253966533 | 65.50; approved/applied |
| LapMaster Lap Bolt | 8905781575877 | 46484255867077 | 5.75; approved/applied |
| MR16 LED Bulb | 8905782558917 | 46484256948421 | 0.00; price and exact replacement specification DEFERRED |
| Saw Vice Plate Set | 8905784099013 | 46484258881733 | 0.00; model prices received, Product/Variant mapping BLOCKED |

Attachment handle **trim-saw-6**, native URL **/products/trim-saw-6**, Product and Variant identifiers are unchanged. The exact approved title appears in its catalog role, Product heading, native breadcrumb/structured Product name and machine reverse card. Its existing E/F-approved EM-1 reference remains unchanged; the title supplies no new compatibility authority. Separate TrimMaster Product 8905785344197 / Variant 46484260290757 remains **1150.00**, handle **trimmaster**.

MR16 and Saw Vice render native **$0.00**, selected exact Variants, and enabled **Add to cart**. Neither was added to a real cart. No free-sale authority, purchase restriction or publication mitigation was inferred. Saw Vice prices are preserved separately: JadeMaster 14 inch $38, SawMaster 18 inch $110, 24 inch $120, 36 inch $140. No generic price or model applicability was assigned.

Coverage remains **122 Products / 125 Variants**, including **111 G Products / 114 G Variants**. Roles: 54 replacement parts, 39 consumables / 42 Variants, 18 accessories; 11 machines, eight published. There are 39 approved source values, 40 directed approved edges, **31 eligible published-target edges**, nine unpublished-target edges, and 72 G Products without approved fit. Two native zero-price G Variants remain. All 114 G SKUs remain empty; 24 G Products lack media and five lack descriptions. Native empty-state behavior is verified without inventing data.

## Strict native successor and source lifecycle

[Native successor manifest](../../../data/epic-g-native-successor.json) pins predecessor and fresh observation SHA-256 values. Its exact 14 field deltas comprise four Variant prices, one Product title, its derived Variant display name, and eight observed updatedAt fields. Every other Product and Variant field must equal the immutable predecessor. Handle, identity, membership, class, reference set and publication changes receive no waiver. Historical receipts and snapshots remain unchanged.

The E/F receipt remains **2026-10-22T20:26:37.102Z**; no renewal or private approval was created. Current source binding and all relevant E/F owner-source suites pass. Closing observation confirms zero relationship/class/publication drift. The native successor independently passes against both observations. The successor proves authorized native changes; it does not approve compatibility.

## Bounded fit recovery and rollback

The previous October 16 fit lease was expired and remains historical. Existing G2 build and preview deployment contracts were reused, with a strict **one-file** refresh mode, complete current-source checks, all required preflight suites, fresh remote inventories/body reads, a single-use write reservation, exact rollback bytes and post-push readback. G3B protection accepts only the separately verified G2 compiled successor; its own deployment allowance still rejects fit files.

Only **snippets/rhino-g-product-fit.liquid** was pushed to **158631198917 / UNPUBLISHED**. Exact command and rollback command are in [deployment plan](../../qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/fit-deployment-plan.json); CLI exit **0**. The lease ends **2026-10-20T17:06:42.312Z**, bounded by the genuinely fresh opening observation plus one hour. It is not extended by deployment, the closing read or report generation. After expiry the client must suppress fit while preserving native commerce.

Remote fit MD5 changed **af993a572add6e5806df93928890a667 → ac723ec30b0f443fb4f265ad6e0cc489**. Final body SHA-256 is **89b9f2fe417bd90f21b3e78d73ac68309eb77bbff000ceac58ece601bebaef82**. Exact original rollback source is retained under the new evidence directory's `rollback-theme`. No rollback was necessary. Readback confirms **438 MAIN files unchanged**, **450 preview files present**, exactly one authorized preview checksum change and zero unrelated changes. Closing inventories match this readback.

All **31 unique eligible directed links** were verified in actual preview at both **390px and 1440px**. Final coverage has **150 passed observations**: 137 actual earlier passes from the same exact projection plus 13 paced corrective reads. Two earlier HTTP failures (503 and 429) remain in the prior report. No failed sample was reused as a pass. Eligibility is recomputed from current approval; unpublished JadeMaster, held Saw Vice and missing fit remain suppressed. Automatic Feed Clamp retains its two approved SawMaster destinations. Exact complete-set mismatch, expiry, invalid-source and client-visibility guards fail closed; native purchase remains operable.

## Integrated executions and failures retained

Use the existing command for a new full/targeted run. This recovery's final reconciliation command consumes separately recorded executions and rechecks current source/lease/inventory and file protection:

```powershell
npm.cmd run validate:epic-g-integrated -- --reconcile-recovery --recovery docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z --evidence docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/g4-final-verified
```

It refuses to overwrite a completed report. It does not rerun cart operations or silently renew fit. After lease/receipt expiry the current reconciliation fails closed; historical passing observations retain their original timestamps.

The first reconciliation attempt also failed closed when its report verifier incorrectly required no-fit Products to occur in the 39-source projection. Its correction checks those suppressed sources against the existing complete G1 report. That failed log remains preserved. The earlier passing reconciliation is retained separately; the final report corrects its aggregate execution counter. Repeated suite executions are explicitly counted as executions, not unique acceptance cases.

| Execution | Result / exit | Demonstrated coverage |
| --- | --- | --- |
| Canonical predeployment gates | PASS / 0 each | 31 commands, exact logs and source pins; G1, G2, G3A/B, E/F, architecture, navigation, Theme Check |
| G1 foundation tests | PASS / 0 | 43 cases |
| G2 Product / recovery protection | PASS / 0 each | 27 / 49 cases |
| G3A routes | PASS / 0 | 26 and 16 reported cases; actual 22 machine viewport cases and 33 native destinations |
| G3B catalog / deployment / entry | PASS / 0 each | 41 / 23 / 14 cases; pagination/growth and strict deployment negatives |
| Machine / gallery fixtures | PASS / 0 each | 58 / 32 cases |
| Final owner receipt tests / source chain | PASS / 0 each | nine receipt cases; six owner-source suites |
| Fit-only pre-push / readback negatives | PASS / 0 each | 23 (2 positive, 21 negative) / four (1 positive, 3 negative) |
| Initial targeted integrated QA | **FAIL / 1**, retained | HTTP 503/429 and focus-test setup failures; no theme rendering defect inferred |
| Paced fit resume | PASS / 0 | All 31 directed links at both widths, 150 final observations |
| First responsive correction | **FAIL / 1**, retained | Attachment focus passed; two catalog tests raced pending hashchange focus |
| Final responsive resume | PASS / 0 | 12/12 cells, 10 prior actual passes + two corrected cases; four real 200% zoom cases |
| Final drift/recovery/isolation matrix | PASS / 0 | **54 cases: 12 positive, 42 negative** |
| Final registers / diff whitespace | PASS / 0 each | Current JSON registers and changed-line whitespace |

The final matrix rejects unrelated title, approved-title alteration, handle, price, Variant ownership, class and relationship drift; invalid native Variant/quantity/structured offers; wrong theme, missing/duplicate fit cells, projection mismatch, unresolved failed samples and rendered link mismatch. It also verifies synchronous, asynchronous, callback, stream and traversal output isolation. Its initial new-directory attempt lacked copied read prerequisites; the next exposed an incorrect nested-path test assumption. Both failures remain recorded. The corrected traversal test targets the exact historical path from any evidence depth; no historical bytes changed.

Installed repository Shopify Theme Check passed. The auxiliary skill-bundled Liquid validator was **BLOCKED / exit 1** by a missing bundled `@shopify/theme-check-common` dependency. This is recorded independently; no silent dependency installation or replacement of the governed Theme Check result occurred.

## Native commerce, responsive QA and inherited issues

Catalog role membership and all 111 current Product names pass at 390/1440; nine affected/representative native Product destinations are revisited. Five published machine context routes remain intact; the current title successor is applied to native comparison and machine reverse labels without changing relationships. Native collections outside the special role index retain their original behavior.

Native selected Variant, URL synchronization, price/structured offer, quantity, available/sold-out state, empty SKU, no-media/no-description and keyboard/pointer gallery behavior pass. Saw Blade retains its four existing Size options. Eight runtime fixtures cover SKU transitions, mocked 422 recovery, unavailable Variant, invalid/valid lease and expiry guards. Actual isolated cart adds Saw Blade Variant **46484258652357**, quantity two, unit price **1500 cents**; add and remove return HTTP 200 and final cart emptiness is verified. Exactly two real cart POSTs; no checkout or order.

Twelve route/viewport cases cover 360, 390 and 1440 widths, 200% root text, headings, link names, focus visibility/order, fragments, clipping and native controls. Four actual browser-zoom cases verify CSS viewport halving and devicePixelRatio doubling, plus operable purchase/contact/fit controls. Native modal focus return passes.

Open defects remain separate from current G regression acceptance:

- **Epic C, high usability:** inherited header height **558px** at 200% root text; reproduced on unchanged MAIN. Fragment visibility and focused controls pass, but this is not a global navigation redesign or a closure of the inherited issue.
- **Epic F, moderate:** EM-1 contents heading-order finding reproduced on unchanged MAIN, retained at all three widths.
- **Shopify preview provider:** serious/critical axe findings are isolated to the verified CDN preview toolbar iframe and remain reported. The toolbar can cover a centered fit link at 200% text; focus diagnostic proves ownership and repositions the target into the unobstructed viewport while still asserting real hit-testing and painted focus. No storefront-owned serious/critical finding is waived.
- **G-PBI-003:** immediate private revocation and production operating policy remain architectural/operating-policy limitations.
- **G-PBI-005:** two overwritten historical G3A screenshots remain unrecoverable; original expected hashes and exception stay intact. New evidence isolation passes; historical recovery remains open.

## Performance and accounting

Existing catalog measurement functions/budgets were reused. Three cold samples per width are all retained: mobile LCP **716, 944, 624ms**, median **716ms**; TBT **18, 15, 40ms**, median **18ms**; CLS **0.0001163**. Desktop LCP **632, 640, 620ms**, median **632ms**; TBT **19, 25, 15ms**, median **19ms**; CLS **0.0001404**. All governed catalog thresholds pass. Native comparison has 1,652 DOM nodes/17 images versus index 728 mobile or 725 desktop/zero images. Raw baseline transfers, HTML delta and samples remain in deployed catalog evidence. Full Product/machine performance recertification is **NOT APPLICABLE to this targeted recovery**; previous G4 measurements remain historical, and parked F integrity/final release gates remain parked. These bounded measurements do not establish a full release performance claim.

Captured authenticated Admin **data queries: 75** (26 opening catalog, eight initial theme/shop/currency, five pre-push theme, six post-push theme, 26 closing catalog, four closing inventories). Four schema discovery calls and one query-validator invocation are separate. CLI auxiliary reads are not individually instrumented and are excluded from 75. **Catalog writes 0; preview asset writes 1; MAIN writes 0; publication actions 0; real cart POSTs 2; checkout/orders 0.** Mocked fixture writes are separately labeled.

## Deliverables and status

[Final JSON](../../qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/g4-final-verified/integrated-report.json), [concise Markdown and exact command table](../../qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/g4-final-verified/integrated-report.md), and [exact changed/new repository paths with hashes](../../qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/g4-final-verified/protected-source-manifest.json) form the reviewable handoff. All new evidence is beneath the uniquely named recovery directory. Historical screenshot and approval evidence is unchanged. Only the generated fit snippet changes customer-facing theme bytes.

| Recommendation field | Result |
| --- | --- |
| G-PBI-006 | PARTIAL: four approved/applied prices; MR16 deferred; Saw Vice mapping unresolved |
| G-PBI-007 repository implemented | Yes |
| Automated integration acceptance | PASS after separately recorded corrections; original failed executions retained |
| Actual unpublished preview verified | Yes, during the recorded fit lease |
| Current owner authority | Valid at final reconciliation; expires October 22, 20:26:37.102 UTC |
| Current fit presentation | Valid only until October 20, 17:06:42.312 UTC |
| Production deployable / commercial launch ready | No / No |
| G-PBI-007 formal recommendation | COMPLETE for bounded technical QA; does not close other PBIs or authorize production |
| Blocked acceptance outside that scope | Two commercial exceptions, private revocation/operating policy, historical PNG recovery, inherited C/F defects, production release/performance gates |

The smallest next step toward Epic J is a scoped handoff of the two commercial exceptions and native cart/Variant evidence, with a fresh authority/fit-lifecycle check when current links are needed. Do not implement Epic J here, infer zero-price mitigation, close G003/G005/G006, or add a production deployment.
