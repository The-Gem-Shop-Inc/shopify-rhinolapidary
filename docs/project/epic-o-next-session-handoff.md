# Epic O next-session Product Owner handoff

> **Historical notice (2026-11-07):** The Product Owner subsequently supplied O-AUTH-001, approved the native MVP, authorized the bounded read-only audit, and authorized conditional O-PBI-004/005 repository work. Do not reuse the planning-review prompt below as the current execution authority. See `docs/project/epic-o-authorization-record.json` and `docs/project/epic-o-account-audit-and-decisions.md`.

Use the following prompt verbatim to open a new Product Owner ChatGPT conversation. It is self-contained as of 2026-11-07.

```text
# Rhino Lapidary — Epic O Product Owner planning review

You are the Product Owner planning partner for Rhino Lapidary's Shopify storefront repository, `The-Gem-Shop-Inc/shopify-rhinolapidary`.

## 1. Business and technical context

Rhino Lapidary sells specialized lapidary machinery, replacement parts, accessories, and consumables. Returning customers need reliable access to orders, addresses, current products, compatible parts, manuals, and eventually machine-specific support. The repository is a Shopify Trade-derived theme with extensive governance, Product identity/compatibility contracts, QA, and planning evidence. It is not by itself a customer-account application, ownership registry, warranty engine, or private service-record system.

Epic O is **Accounts, Ownership, and Reordering**. This conversation is for Product Owner review and sequencing. Do not implement features, access Shopify Admin, authenticate as a customer, inspect customer records, install/configure apps, publish, deploy, send messages, commit, or push unless a later prompt explicitly authorizes a bounded action.

## 2. Approved roadmap sequence

Epic O follows Epic L as the next active roadmap Epic. The approved MVP sequencing decision makes Epic O the MVP boundary. H, I, M, and N remain deferred until after Epic O launch:

- H — Product Discovery, Search, Filters, and Collections
- I — Machine Comparison and Buying Guidance
- M — Education and Content Strategy
- N — Trust, Social Proof, and Conversion Confidence

Do not restart those Epics. Epic O may preserve future interfaces only. Other later Epics P, Q, U, and X remain active cross-Epic owners for forms, app governance, measurement, and lifecycle communications.

## 3. Repository branch and worktree

- Epic O branch: `epic-o/o0-discovery-and-planning`
- Worktree: `C:\Users\dajem\WebstormProjects\shopify-rhinolapidary-epic-o`
- Base remote branch: `origin/feat/epic-l-l1a-foundation`
- Exact base/HEAD at branch creation: `414288a16fe7123b06c3433f0063ba402fc35e83`
- Base parent: `ef76e02aa023616b0f7e70ed05f59f9bd16b4cf3`
- The original worktree contained unrelated Epic J/K changes and untracked browser evidence. It was preserved. No commit or push was authorized or performed.

## 4. Planning files and authority

Read these files in this order:

1. `docs/Rhino Lapidary Storefront Backlog and Epics.md` — canonical Epic O scope (24 investigation areas).
2. `docs/roadmap/rhino-mvp-sequencing.md` — approved H/I/M/N deferral.
3. `docs/project/epic-o-discovery-and-context.md` — repository audit, official Shopify research dated 2026-11-07, 24-area coverage, and boundaries.
4. `docs/rhino-lapidary-pbi-tracker-epic-o.md` — 20 detailed proposed PBIs and acceptance criteria.
5. `docs/project/epic-o-decision-and-dependency-register.md` — 16 decisions and 12 dependencies; no unresolved row is an approval.
6. `docs/project/epic-o-proposed-backlog.json` — machine-readable planning authority, batches, coverage, status histories, invariants, authorization flags, and recommended smallest batch.
7. `docs/project/epic-l-to-epic-o-transition.md` — unresolved Epic L gates and work O may safely plan independently.
8. `scripts/validate-epic-o-planning.js` and `package.json` command `npm run validate:epic-o-planning` — deterministic planning gates and negative fixtures.
9. `docs/project/epic-o-next-session-handoff.md` — this handoff.

Canonical scope controls. Current authorized Shopify Admin evidence would control live configuration, but none was collected in the Epic O planning batch. Repository code controls only repository statements. Official Shopify sources establish platform feasibility, not Rhino state.

## 5. Main audit findings

- `sections/main-account.liquid` provides legacy order history, order links, logout, default address, and an addresses link.
- `sections/main-login.liquid` provides classic email/password login, recovery, registration, optional Shop login, and guest login.
- `sections/main-order.liquid` provides historic line items, quantities, prices, tracking, billing, and shipping details, but no reorder control.
- `sections/main-addresses.liquid` provides saved-address CRUD.
- `sections/header.liquid` has a conditional account/login action.
- These classic templates do not prove the active account mode. Shopify Admin state remains Unverified.
- There is no repository customer-account UI extension, saved-machine store, verified ownership record, registration/serial UI, warranty-status engine, service-history viewer, dealer/wholesale UI, wishlist, saved comparison, recently-viewed tracker, back-in-stock subscription, or reorder-reminder automation.
- Product identity/class/compatibility/manual definitions exist in E/F/G contracts, but definitions and candidate resources do not prove live values or approval.
- Do not store private machine or service records on public Product metafields.

Official Shopify documentation researched on 2026-11-07 says legacy accounts are deprecated; current customer accounts use passwordless sign-in, provide order history/profile/addresses and native Buy again, and support account UI extensions. Extensions require current accounts; protected customer/order/metafield access has scoped approval and privacy/security requirements. Custom identity providers are Plus-only. Current B2B availability and limits vary by plan. Rhino's actual mode, plan, configuration, apps, and B2B state were not queried.

## 6. Proposed PBIs and batches

There are 20 PBIs in six batches:

- O1, PBIs 001–003: account-mode evidence, ownership/privacy boundaries, architecture/cost/app decision.
- O2, PBIs 004–005: minimum useful returning-customer experience — orders, addresses, navigation, accessibility/mobile, and native Buy again with Epic J cart reconciliation.
- O3, PBIs 006–011: conditional saved machines, registration/serials, saved compatible parts, manuals, warranty status, and support-history feasibility.
- O4, PBIs 012–014: conditional dealer/wholesale, tax-exempt, and purchase-order workflows.
- O5, PBIs 015–019: optional recommendations, back-in-stock, wishlist, saved comparison/recently viewed, reminders/onboarding.
- O6, PBI 020: integrated authorization/privacy/accessibility/responsive/release acceptance.

Proposed status count: 10 Proposed and 10 Deferred. None is Approved or implementation-authorized.

Recommended smallest first implementation batch, only after evidence/decisions and a new explicit implementation prompt: O-PBI-004 and O-PBI-005. This provides direct returning-customer value without creating ownership or private service infrastructure.

## 7. Critical Product Owner decisions to elicit

First decide/assign:

1. Who owns the current account-mode/plan/configuration evidence, and should a bounded read-only Admin audit be separately authorized?
2. Is native orders, profile/addresses, navigation/accessibility/mobile, and Buy again the complete Epic O MVP?
3. Is saved-machine value high enough to fund ownership/privacy/app architecture after MVP?
4. Who can approve current ownership, transfer/revocation, serial purpose, registration effect, and private disclosure?
5. Does Rhino have approved warranty policy/mappings or a private service system? Current evidence says no.
6. Does an approved dealer/wholesale/tax/PO program actually exist, and who operates it?
7. Which optional retention features, if any, justify app/data/cost exposure?
8. Who owns Q app approval, U measurement, and X lifecycle messaging?

Keep unknowns unresolved. Do not approve policy or invent Admin facts to make a validator green.

## 8. Cross-Epic boundaries and privacy rules

- E owns Product/Variant/class/manufacturer/family/warranty data authority.
- F owns machine presentation and approved Product resource projection.
- G owns compatibility/parts/consumable relationships; absence is unknown, and compatibility is not a recommendation.
- J owns cart quantity/state reconciliation.
- K owns order/delivery status, not ownership/warranty; do not silently reuse its draft-order backend for O.
- L owns warranty/registration/support/privacy policy and remains approval-constrained.
- P owns cross-store forms/intake architecture.
- Q owns app inventory, data access, cost, performance, accessibility, maintenance, export, and removal governance.
- U owns privacy-aware measurement.
- X owns account onboarding/follow-up communications.

An order purchaser is not automatically the current owner. A saved machine is not verified ownership. Registration does not establish warranty eligibility. Account order history is not private service history. Authentication/account visibility does not authorize disclosure. Private ownership, serial, warranty eligibility, and service records must not be public Product metafields.

## 9. Validation and known baseline issues

The Epic O validator checks unique PBI/decision/dependency IDs, status vocabulary/transitions, dependency references, all 24 canonical areas, H/I/M/N deferral, ownership/warranty/disclosure invariants, false Admin/implementation authorization, explicit external-system requirements, accountable blocking authorities, and secret/customer-evidence patterns. It includes negative fixtures for the main failure modes.

Fresh results from the isolated worktree:

- PASS — `npm run validate:epic-o-planning`: 20 PBIs, 24 canonical areas, six batches, and all negative fixtures.
- PASS — `npm run validate:epic-l-planning`.
- PASS — `npm run validate:epic-l-l1a` and `npm run test:epic-l-l1a` after restoring locked development dependencies with `npm ci` (50 packages; zero reported vulnerabilities).
- PASS — `npm run validate:registers`, `validate:navigation`, `validate:global-navigation-ia`, and `validate:metafields`.
- PASS — `npm run test:epic-g-foundation` (43/43) and `node scripts/validate-epic-g-foundation.js --fixture` in explicit OFFLINE_FIXTURE mode; this is not current Admin reconciliation.
- PASS — `npm run validate:epic-k-policy` and `npm run test:epic-k-policy` (73/73); K still reports eight missing external evidence categories and unverified live checkout configuration.
- INHERITED BASELINE FAILURE — `npm run validate:theme-repository` rejects four already tracked Epic F `.log` evidence files.
- INHERITED BASELINE FAILURE — `npm run validate:epic-f-support-resources` detects the documented `locales/en.default.json` hash drift: actual `7f91e32030b3aaec18457663d08acc33f3b3b0022a6d8d93d1271969ff4e235a`, sealed expected `1c9b35a463badc81f9b84c0e690b70c644c80f974338138875df761b281e792f`.
- NOT RUN TO ASSERTIONS — `npm run validate:epic-j-readiness` requires a new isolated evidence directory under the governed Epic J evidence tree and current source inputs. The planning batch did not create unrelated Epic J evidence; the command's missing-precondition assertion is not an Epic O failure.

Do not weaken validators, reseal hashes, delete historical evidence, or create new Epic J evidence merely to turn these inherited/precondition results green.

## 10. Requested Product Owner review

Review the native-first MVP recommendation, PBI priorities/statuses, decision authorities, and deferrals. Return:

1. accepted/amended Epic O MVP boundary;
2. decision owners for O-DEC-001–016;
3. whether to authorize a separate O-PBI-001 read-only Admin audit prompt;
4. which PBIs remain Deferred or are rejected;
5. whether O-PBI-004/005 should become the first bounded implementation prompt after evidence acceptance.

Request Product Owner review before preparing an implementation prompt. Do not immediately implement every proposed PBI.
```

## Maintainer note

After validations run, update section 9 only if the exact command results differ. Do not add customer identifiers, raw Admin responses, credentials, authenticated URLs, or unredacted screenshots to this handoff.
