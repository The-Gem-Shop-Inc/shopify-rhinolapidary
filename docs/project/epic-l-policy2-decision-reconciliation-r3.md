# Epic L Policy 2.0 Product Owner decision reconciliation — Revision 3

Recorded: 2026-11-25

Source: `Rhino Lapidary — Epic L Policy 2.0 Outstanding Product Owner Decision Packet, Revision 2`, completed November 25, 2026

Machine-readable receipt: `data/epic-l-policy2-decision-receipt-r3.json`

## Outcome

The completed packet is accepted as Product Owner business direction. No signature, duplicate approval form, or repeat decision is required. Business authorization does not prove Shopify capability, operating-agreement compatibility, legal or regulatory clearance, staff readiness, or customer-release authority.

The source packet is preserved at `docs/policy/Epic L Policy 2.0 Decision Worksheet.md` with SHA-256 `62ED74B0729C998AB4A09B2DACDF86E9E0B3A0B95842C267D3CCA4E7FCC289CF`. It was supplied by the owner and was not independently verified. The November 19 receipt remains unchanged at `data/epic-l-policy2-decision-receipt.json`; unavailable November 19 wording is not reconstructed or retroactively confirmed.

No Forms, Flow, Discord, registration, support intake, warranty, insurance, resource publication, Shopify write, or production action is authorized by this receipt.

## Reconciliation matrix

`ANSWERED` means the owner's requested business choice is clear. It does not mean the related feature is ready to activate. `PARTLY_RESOLVED` means one bounded business or implementation choice remains. `EXTERNALLY_BLOCKED` means the remaining answer belongs to a third party or agreement rather than another owner workshop.

| Packet item | Decision state | Accepted business direction | Implementation consequence | External/legal/activation boundary |
| --- | --- | --- | --- | --- |
| OPEN-01 Warranty | ANSWERED | One-year machines and durable parts; parts-first remedy; wear limited to arrival defects; registration start; Rhino parts/inspection; Silica-Gem other repair; prior-user exception | Version internal intent separately; preserve shipping-damage route and human review for missing evidence | Consumer-law review, agreement, applicability, exact policy copy, and release still blocked |
| OPEN-02 Registration | ANSWERED | No physical serials; opaque registration ID is authoritative; The Gem Shop PO accepted; remote inspection can evidence first use; prior exceptions separate | Add purchase/first-use evidence collections; one machine per registration; customer may have many registrations; deprecate serial additively | Missing-receipt exclusion and registration-start effect need legal review; Forms/storage proof still required |
| OPEN-03 Product coverage | PARTLY_RESOLVED | Avery and Veronica review first 31 unresolved classifications using exact GIDs | Project the existing 31 rows; record evidence and business mapping; do not create a new approver role | Exact mapping and legal coverage approval remain incomplete; zero Products gain customer coverage |
| OPEN-04 Manufacturer escalation | EXTERNALLY BLOCKED | Owner supplied an internal email route and requires damage/misuse reports plus testimony; proposed Silica-Gem refund allocation | Restricted secret/config only; Rhino retains case ownership and follow-up; no auto-referral or refund | Silica-Gem acknowledgement/customer communication and operating-agreement allocation remain external |
| OPEN-05 Support | ANSWERED | Mon–Fri 9–5 Central; hours-only acknowledgement; Forms/native preferred; email required; Discord preferred; Stephanie recovery; staff owner resolution; Kevin reopen | Add hours and reopen contracts; case must exist before alerts; Discord payload is opaque and minimal | Exact staff identities/permissions and Basic-plan end-to-end proof remain blocked |
| OPEN-06 Safety | ANSWERED | Kevin primary; Warehouse fallback; preserve listed evidence; manual public notices; Kevin may advise resumption after review | Retain private `SAFETY_HOLD`; bind disposition to authority and evidence; no customer hold product | Exact identities/routes and any public/regulatory procedure remain blocked |
| OPEN-07 Privacy/retention | PARTLY_RESOLVED | Forms preferred; customer association; proposed staff roles; Warehouse deletion; seven years; open cases retained; export; Stephanie fallback | Use multi-record registration/case models; build export/restore/deletion/notification history; separate marketing consent | Exact permissions, Forms lifecycle, processor behavior, legal retention, and breach controls remain blocked |
| OPEN-08 Insurance | PARTLY_RESOLVED | Choice belongs on cart; Stephanie handles carrier matters; Kevin handles functionality disputes | Preserve current request flag as non-binding; assess cart attribute/app/quote/product only after terms | Provider, price, terms, legal review, persistence, and request-vs-paid mechanism remain unresolved |
| OPEN-09 Resources | ANSWERED | Existing resources were already reviewed by Kevin; priority is a simple admin assignment interface | Import B05 queue; bind links to exact immutable revisions and machine applicability; retain history; no blanket re-review | Exact revision/applicability evidence and release gate still required; no publication now |
| OPEN-10 Publication | PARTLY_RESOLVED | Complete infrastructure first; agreement authorizes publication rather than rewriting terms; messaging approved at business level | Version exact copy, policy version/effective date, acceptance evidence, and release separately | Agreement pending; no external legal reviewer named; acceptance owner, exact messages, and final authorization TBD |

## What manufacturer evidence is actually needed

No new approval role is needed. Avery or Veronica can approve a Product mapping, but they need enough evidence to know what the exact Product or Variant physically is and, where responsibility depends on origin, whether Silica-Gem made or supplied it. Useful evidence is a manufacturer catalog or part list, manual, purchase/vendor record, or written manufacturer confirmation tied to the exact Product/Variant GID. A Shopify title, Product type, Vendor value, or current publication alone is insufficient.

The existing coverage matrix already preserves all 122 Product and 125 Variant identities. The first review is the 31 Active rows whose `coverageProposal.disposition` is `HUMAN_REVIEW_REQUIRED`. This changes review order and reviewer authority only. It does not change any coverage status or `customerPromiseAuthorized: false` value.

## B01–B05 reconciliation

| Batch | Preserved behavior | Revision required next |
| --- | --- | --- |
| B01 | Opaque IDs, private records, access boundary, notification recovery, immutable events, resource revisions, safety interruption | No destructive change. Production processor, identities, access, export, and durability remain external to the in-memory foundation. |
| B02 | Opaque registration ID, human ownership review, no automatic warranty decision, additive corrections, delivery recovery | `serialNumber` and `PHYSICAL_SERIAL_SIGNAL` are obsolete normal-path assumptions. Retain them as legacy evidence, add purchase/first-use evidence collections, and support many per-machine records per customer. |
| B03 | Forms-agnostic support intake, private cases, exact registration lookup, safety interruption, no autonomous diagnosis | Add approved hours, staff-owner resolution, Kevin-authorized reopen, and role-based routes. Do not encode private destinations in contracts. |
| B04 | Human warranty evidence preparation and assessment; no decision issuance | Add non-publishable duration/trigger/remedy/prior-purchase intent while retaining legal, coverage, authority, and customer-notification gates. |
| B05 | Exact resource revision/applicability model, nine-candidate inventory, no publication | Build the owner-facing administration interface. Treat the owner's Kevin-approval statement as business direction, then bind it to exact revisions during data entry without repeating a comprehensive review. |

The obsolete serial assumption is present in the B02 contract, schema-adjacent documentation, implementation, and synthetic duplicate tests. Revision 3 deliberately does not delete or reinterpret those historical records. B06 must add a legacy field/status and new evidence paths, migrate in memory/test fixtures additively, and keep B01–B05 regression behavior green.

## Remaining Product Owner decisions

Only three direct owner choices remain:

1. Name the final operational acceptance owner before live configuration.
2. Approve the exact versioned customer messages, effective date, and final release event before publication.
3. After Stephanie's carrier assessment, choose whether the cart insurance control is a non-binding request for a quotation or an approved paid protection selection.

Silica-Gem procedures, operating-agreement verification, staff-account permission evidence, legal compatibility, and platform capability proof are confirmations—not reasons to repeat the owner's business decisions.
