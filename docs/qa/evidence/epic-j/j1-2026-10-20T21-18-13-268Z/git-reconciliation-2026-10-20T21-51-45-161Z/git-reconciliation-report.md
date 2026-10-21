# Epic J1 Git foundation reconciliation

**BLOCKED at a confirmed data-security and source-integrity boundary. No files staged, committed or pushed.**

## 1. Starting state

Branch `epic-j/j1-native-cart-recovery`, HEAD `c803d44697de39c0b12b939ec9b03580d867cb03`. Current start: **749 collapsed entries / 3854 detailed paths**, comprising 102 tracked modifications, 12 existing index additions and 3740 untracked paths; no deletions. Earlier J1 recorded 741 entries. Full state is in starting-git.json. Fetch succeeded; origin/dev remains the recorded base, and the dedicated J1 remote branch is absent. Only origin/main advanced during fetch; no merge, rebase, reset or working-tree switch occurred.

## 2. Dependency inventory and selection

The inventory covers every original changed path with Epic, Git state, purpose/dependency reason, tentative commit, size and sensitivity classification. Literal imports resolve 85 dependencies; dynamic file reads/governance add more. The approved verifier requires **all 5518 predecessor paths**, including 3282 changed/untracked paths. Many are integrity-only, rather than functional dependencies; these are not automatically approved for Git.

**No foundation files were selected for staging.** proposed-commit-plan.json contains tentative E/F/G, J0 and J1 lists. Six overlapping J1 successor paths have exact predecessor copies; explicit index blobs can separate their versions without changing current bytes or reapplying the patch.

## 3. Confirmed security conflict

Ten untracked J0 trace archives contain **nonempty plaintext password-authentication POST bodies and session headers**. Metadata-only scans report presence, paths and field names; no secret value was printed, staged or uploaded. All ten are absent from HEAD and match the immutable predecessor hashes.

- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/browser-live-03/artifacts/epic-j-cart-actual-preview-isolated-native-cart-390-desktop-chromium/trace.zip`
- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/browser-live-03/artifacts/epic-j-cart-actual-preview-isolated-native-cart-360-desktop-chromium/trace.zip`
- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/browser-live-02/artifacts/epic-j-cart-actual-preview-isolated-native-cart-390-desktop-chromium/trace.zip`
- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/browser-live-02/artifacts/epic-j-cart-actual-preview-isolated-native-cart-360-desktop-chromium/trace.zip`
- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/browser-live-02/artifacts/epic-j-cart-actual-preview-isolated-native-cart-1440-desktop-chromium/trace.zip`
- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/browser-live-01/artifacts/epic-j-cart-actual-preview-isolated-native-cart-390-desktop-chromium/trace.zip`
- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/browser-live-01/artifacts/epic-j-cart-actual-preview-isolated-native-cart-360-desktop-chromium/trace.zip`
- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/integrated-01/artifacts/epic-j-cart-actual-preview-isolated-native-cart-390-desktop-chromium/trace.zip`
- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/integrated-01/artifacts/epic-j-cart-actual-preview-isolated-native-cart-360-desktop-chromium/trace.zip`
- `docs/qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/browser-live-01/artifacts/epic-j-cart-actual-preview-isolated-native-cart-1440-desktop-chromium/trace.zip`

The conflict is in scripts/lib/epic-j-j1-protection.js: verify() requires each predecessor path and its exact hash. Two deterministic in-memory tests prove that exclusion fails “Starting source removed” and sanitization fails “Unrelated or unreviewed source change”. Original files were untouched. The verifier itself is pinned by the required J1 manifest. Committing originals violates credential exclusions; omission/sanitization violates current integrity expectations. A reviewed evidence-portability successor is needed. This is a reproducibility design defect in the overly broad J1 protection I added, not new compatibility or business authority.

## 4. Explicit exclusions

excluded-paths.json lists the ten DO_NOT_COMMIT archives and disposable J1 run output. Local environment files, node_modules, .shopify, IDE state and ignored test output remain excluded. Other owner/Admin evidence, PDFs, spreadsheets and binaries are flagged for purpose/privacy review; metadata classification is not full security clearance. No blanket staging, deletion, sanitization or historical hash rewrite occurred.

## 5. Commits and clean-checkout verification

**No commit sequence or new SHA exists.** Staging stopped at the explicit boundary; an incomplete foundation commit is not represented as reproducible. Clean-checkout verification is BLOCKED / NOT RUN.

Current-workspace `node scripts/test-epic-j-j1-readiness.js` exited **0**, **15/15** (seven positive/eight negative); RHINO_J_EVIDENCE_DIR points to current-workspace-readiness below this report. This verifies preservation only, not clean committed-source acceptance. Two additional private-evidence conflict tests pass while observing expected guard FAIL outcomes. Remaining required cart, native, static, Theme Check and machine-browser commands must run against the eventual clean committed closure. Prior J1 timeouts and successful focused reruns remain untouched. Exact commands/results are in git-reconciliation-report.json.

## 6. Exact J1 identities

Successor **J1-2026-10-20-NATIVE-CART** remains unchanged.

| File | SHA-256 | Result |
| --- | --- | --- |
| `data/epic-j-j1-source-successor.json` | `6656356c225ee086c611381152d196b19e79782ba6dbe9a2ef07d14ad4f868db` | PASS |
| `assets/product-form.js` | `da08afa153574f787a24ba5575c8e62cc5c40f344c3e84dadb66edee722b5ce7` | PASS |
| `assets/component-cart-items.css` | `a2765fd6ba70f84801291b2b8615b6e099568b690a22b758baacde021b1a3e9c` | PASS |

Historical J0 protection retains its expected successor rejection; current J1 readiness passes. No runtime source, receipt, grant, approval, historical hash or test expectation changed.

## 7. Preservation and tracker

HEAD, branch, semantic index and original path/status entries remain unchanged. All runtime/manifest identities match the owner-provided hashes, and private trace hashes remain original. Only this new nested evidence directory and Git fetch/metadata state were added. No stash, reset, discard, normalization, patch application or force checkout.

The tracker itself is pinned by the required J1 manifest; appending a note would break its identity. It remains unchanged, with verified BLOCKED status supplied in tracker-git-status.md. J008 remains PROPOSED.

## 8. Remote and operation accounting

Push **NOT ATTEMPTED — security/dependency blocker**. No final commit or remote SHA. Planned branch URL (currently absent): https://github.com/The-Gem-Shop-Inc/shopify-rhinolapidary/tree/epic-j/j1-native-cart-recovery. Remote dev is unchanged; no merge, force push, release or publication. Shopify accounting: **zero** Admin/theme reads or writes, real cart POSTs, checkout submissions and orders. No credential/configuration mutation attempted.

## 9. Smallest unblock and preview readiness

Review an explicit evidence-portability successor preserving original private archives, existing J1 manifest/runtime identities and owner/historical authority, while keeping private authentication artifacts outside Git and publishing separately identified sanitized evidence. This cannot be a broad ignore or silent change to historical tests. Then review exact foundation/J0/J1 staging lists and predecessor blobs, construct commits, validate a credential-free clean checkout with environment prerequisites clearly separated, and non-force push/verify final remote hashes.

Git publication and clean-checkout readiness remain BLOCKED. Changed-preview acceptance remains NOT VERIFIED. Future preview deployment still needs separate authorization for only the two J1 assets, fresh MAIN/preview inventories and remote rollback/readback. G003/G005/G006 and optional J003–J007 are unchanged.
