# Epic L Policy 2.0 dependency and readiness report — Revision 3

Recorded: 2026-11-25

Baseline/B05 HEAD: `51f97c566943de4bdd893d93fbab9d09ccb39c1e`

B05 completion: `data/epic-l-policy2-b05-progress.json`, SHA-256 `364F59E58DBA1A0F4C5A0FD956B4843C7CD6F7F2CA20ECC97132425E14BBC0B0`

## Readiness result

The November 25 packet materially advances business readiness but does not authorize activation. It resolves warranty intent, registration identity, exact hours, review authorities, notification/recovery roles, safety routing, cart placement, and resource-administration priority. It does not resolve legal compatibility, operating-agreement obligations, exact staff accounts and permissions, durable case history, processor lifecycle, carrier insurance terms, exact resource revision bindings, operational acceptance, or final release.

The earlier `DECISION_PROVENANCE_UNRESOLVED` blocker is narrowed: the exact November 25 packet is now available and is sufficient authority for internal implementation. Missing November 19 wording remains a historical provenance limitation and must not be reconstructed, but it is not a reason to demand another signature or repeat the November 25 decisions. Customer release still needs exact versioned customer artifacts and compatibility evidence.

## Dependency state

| Dependency | State after Revision 3 | Evidence / next action |
| --- | --- | --- |
| Product Owner operational direction | ACCEPTED | Revision 3 receipt; no signature required |
| Exact catalog identity accounting | PRESERVED | 122 Products / 125 Variants; 78 Active / 44 Draft; all exact GIDs remain in the coverage matrix |
| First coverage review | READY FOR HUMAN REVIEW | Exactly 31 unresolved physical classifications; Avery or Veronica; no coverage authorization inferred |
| Warranty implementation rules | READY FOR SYNTHETIC CONTRACT UPDATE | One-year and remedy intent known; legal/applicability/customer copy still blocked |
| Registration model | REQUIRES ADDITIVE MIGRATION | Physical serial assumptions obsolete; preserve legacy field/tests; add purchase/first-use evidence and multi-machine customer relation |
| Support hours and governance | READY FOR SYNTHETIC CONTRACT UPDATE | Mon–Fri 09:00–17:00 America/Chicago; Stephanie recovery; staff-owner resolution; Kevin reopen |
| Safety authority | READY FOR SYNTHETIC CONTRACT UPDATE | Kevin primary/disposition; Warehouse fallback; private `SAFETY_HOLD` retained |
| Manufacturer handoff | EXTERNALLY BLOCKED | Silica-Gem acknowledgement, communication, non-response, follow-up, and agreement allocation |
| Native Shopify intake | PARTIALLY FEASIBLE | Forms/metaobject intake and Flow email are native; governed case workflow is not entirely native |
| Private case system/history | BLOCKED | Small private extension and append-only event model required; no durable seven-year native history established |
| Staff identities and permissions | BLOCKED | Exact current accounts/roles were not available in repository evidence; read-only live verification required before configuration |
| Privacy/retention/export | BLOCKED | Seven-year business direction accepted; processor, deletion, backup, restore, export, legal holds, and incident controls unverified |
| Discord alerts | BLOCKED | Basic lacks Flow Send HTTP Request; app relay required; case must exist first; payload must be redacted |
| Resource administration | READY FOR NEXT UI BATCH AFTER B06 | B05 has nine exact candidates; interface requirements are versioned; customer release remains disabled |
| Insurance | BLOCKED SEPARATE FEATURE | Cart placement known; provider, terms, charge, order persistence, legal treatment, and regression design pending |
| Operating agreement | EXTERNALLY BLOCKED | Pending; must confirm publication and proposed manufacturer/refund allocation |
| Exact customer copy and effective date | BLOCKED | Business-level messaging approval is not an exact versioned release artifact |
| Operational acceptance / final release | BLOCKED | Owner and authorization remain TBD |

## Contracts requiring revision

These are next-batch changes, not changes made during this documentation reconciliation:

- `epic-l-policy2-registration-contract` 2.1.0 → additive 2.2.0: retain `serialNumber` as legacy-only evidence; remove it from normal duplicate signals; add purchase-order, remote-inspection, first-use, prior-purchase, prior-registration, and customer-to-many-registration relationships.
- `epic-l-policy2-support-safety-contract` 2.1.0 → 2.2.0: exact hours, hours-only acknowledgement, role assignments, staff-owner resolution, Kevin reopen authorization, Kevin serious-incident authority, Warehouse fallback, restricted manufacturer route, and Discord-as-alert-only boundary.
- `epic-l-policy2-warranty-review-contract` 1.0.0 → 1.1.0: internal duration, trigger, remedy, and transition intent; legal and issuance gates remain false.
- `epic-l-policy2-capability-privacy-audit` 2.0.0 → future live-verified successor: Forms metaobject behavior, scalar metafield overwrite, Basic Flow limits, Forms/app API visibility, exact staff permissions, file lifecycle, export/deletion, and retention proof.
- `epic-l-policy2-resource-governance` 2.1.0 → administration successor: simple link assignment, immutable revision identity, exact applicability, historical supersession, and no default re-review of unchanged content.
- Coverage matrix: no classification mutation in B06. Add a separate exact 31-row review projection and evidence intake so GIDs cannot drift.

## Activation blockers retained

1. Exact legally compatible Policy 2.0 customer copy, version, effective date, and prior-purchase applicability.
2. Exact business and legal coverage approval for applicable Products; the first 31 business reviews are not yet recorded.
3. Operating-agreement confirmation for publication and Silica-Gem allocation.
4. A durable private support/registration system with enforced state transitions, access restrictions, append-only history, notification recovery, export, backup/restore, deletion, and retention controls.
5. Exact staff identities, roles, permissions, primary/fallback destinations, and operational acceptance evidence.
6. Exact resource revision and applicability records plus separate customer-release authorization. Existing content does not need a blanket second review.
7. Exact customer message artifacts and final Product Owner release authorization.
8. All existing M1 activation guards. `customerFacingAuthority`, `releaseAuthorized`, and real-customer activation remain false.

Insurance is a separately blocked feature and must not silently become a global Policy 2.0 promise. If it is not ready at policy launch, customer copy must omit it.

## Recommended next implementation batch

Run `EPIC-L-POLICY2-B06` from `data/epic-l-policy2-next-engineering-backlog-r3.json`:

- additive registration evidence migration;
- support/safety/notification contract amendment;
- non-publishable warranty intent contract;
- exact 31-Product review projection.

B06 is contract-and-synthetic-data only. It permits no Shopify mutation, live processor, real customer data, email/Discord destination, resource publication, warranty issuance, insurance change, or customer activation. Resource administration is the next UI batch after B06 because it is the owner's stated engineering priority.
