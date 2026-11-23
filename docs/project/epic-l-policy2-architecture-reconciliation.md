# Epic L Policy 2.0 architecture reconciliation

Recorded: 2026-11-23
Corrective review: 2026-11-23
Branch: `feat/epic-l-policy2-reconciliation`
Authoritative worktree: `C:\rlcc`
Base: `5b786d2d1ab7603817c8cab578bf4a3339d06bfa`

## Outcome

This is a validated local architecture correction consolidated into the authoritative IDE-connected workspace. It creates no customer policy, registration service, support service, checkout customization, Shopify write, theme publication, commit, or push.

The corrective batch separates authority from readiness, replaces implicit coverage translations with a full approval register, moves mandatory safeguards into M1, hardens safety interruption, and tests real artifact mutations and state transitions.

## Authority model

The decision receipt now has three independent dimensions:

1. Product Owner internal business-intent approval.
2. Technical and operational implementation readiness.
3. Customer-facing legal approval.

The task brief states that L-DEC-001 through L-DEC-020 were approved, but the repository does not contain the original versioned decision document or exact approved per-decision wording. Each intent is therefore recorded as `APPROVED_INTENT_ASSERTED`, with `confirmedAuthority: false` and unresolved provenance. This preserves the commission without retroactively confirming an unavailable source.

Implementation statuses such as `PROPOSED`, `BLOCKED`, and `HUMAN_REVIEW_REQUIRED` describe readiness only. They do not negate or confer business approval. All customer-facing legal approvals remain `NOT_APPROVED`.

## Status summary

| Area | Engineering status | Business/legal readiness |
|---|---|---|
| Repository reconciliation | COMPLETE recorded observation | Live Git checks still required before reliance or promotion |
| Decision authority model | COMPLETE | Original versioned approval source unresolved; customer copy not approved |
| Shopify Product/Variant snapshot | COMPLETE | Technical evidence only |
| Active coverage register | COMPLETE | 78/78 require business and legal review |
| Registration contract | PROPOSED | Real-customer activation blocked |
| Support and safety state machine | COMPLETE architecture | Hours, assignments, handoff, and incident authority unresolved |
| Resource governance | COMPLETE architecture | Zero approved resource revisions |
| M1 dependency model | COMPLETE architecture | Activation gate blocked |
| Capability/privacy audit | COMPLETE read-only audit | Processor and seven-year lifecycle approval blocked |
| Artifact-driven negative tests | COMPLETE | 20 invalid configurations rejected |

## Coverage methodology

The snapshot remains 122 Products and 125 Variants: 78 Active and 44 Draft. Every exact Product and Variant GID remains accounted for.

The Active Product register records six separate dimensions:

- Shopify technical classification.
- Observed physical function and exact evidence.
- Manufacturing source, which remains unverified unless independently evidenced.
- Tentative or undetermined coverage proposal.
- Business approval.
- Legal approval.

The current tentative grouping is:

- 8 `MACHINE`
- 30 `WEAR_COMPONENT`
- 9 `DURABLE_COMPONENT`
- 0 `THIRD_PARTY_COMPONENT`
- 0 `EXCLUDED_SUPPLY`
- 31 `HUMAN_REVIEW_REQUIRED`

These are proposals, not coverage approvals. There are zero business-approved, zero legal-approved, and zero customer-promise-authorized Products. All 78 Active Products remain in the approval register. Thirty-one critical/high-uncertainty Products are in the priority queue, including the 6 in Trim Saw Attachment, polishing pastes, protective moss pads, replaceable hardware, accessories, and the insufficiently described TrimMaster Splash Guard.

The historical count of 79 Active Products retained no exact GID list. Current evidence proves 78 Active Products, but the changed GID cannot be identified without reconstructing unsupported history. The delta remains explicitly unresolved.

All 44 Draft Products remain separately accounted for. MR16 LED Bulb and Saw Vice Plate Set retain their J/G Draft commercial exclusions without acquiring a warranty disposition.

## M1 critical path

M1 contains sixteen minimum operational PBIs. The following reviewed deficiencies are now explicit activation blockers:

- L-PBI-003 — coverage human review.
- L-PBI-005 — registration acknowledgement, duplicate handling, and recovery.
- L-PBI-006 — private seven-year retention architecture.
- L-PBI-012 — immediate stop-use and serious-incident response.
- L-PBI-014 — resource revision governance.
- L-PBI-016 — notification delivery reconciliation.

Registration and support PBIs include explicit blocking-dependency arrays. They cannot be marked operationally ready while coverage, privacy, safety, resources, decision controls, or notification recovery are absent.

A first engineering batch may build private infrastructure using synthetic data. It may not collect real customer information, publish customer promises, or claim operational activation.

Epic O account history, dealer publication, analytics, and comprehensive recall infrastructure remain deferred. Serious safety handling is M1-required.

## Safety transition model

Hazardous information is a global interruption from ten relevant nonterminal states, including guidance, parts support, manufacturer escalation, recovery, and resolved-but-not-closed cases.

On a hazard report:

- The case enters `SAFETY_HOLD`.
- An immediate static stop-use warning is delivered without diagnosis or a response-time promise.
- Ordinary transitions lock.
- Notification failure retains the hold and enters notification recovery.
- Recovery cannot clear or bypass the hold.
- Leaving the hold requires an authorized human disposition recording authority, role, reason, evidence, disposition, and time.
- Direct transition from `SAFETY_HOLD` to resolved, closed, or recovery is prohibited.
- Unknown transitions fail closed.

Silica-Gem escalation retains Rhino case ownership and communication responsibility. Exact staff assignments, hours, incident authority, and manufacturer handoff procedures remain unresolved.

## Resource and release gates

The governed resource registry is currently empty and therefore `BLOCKED_NO_APPROVED_RESOURCES`. Customer release requires an exact revision, Product/Variant and machine applicability, Kevin technical approval, customer-copy approval where relevant, and availability validation.

Policy version `2.0-draft` has no approved applicability period and cannot authorize customer copy.

## Reproducible validation

The validator now resolves Ajv only through the package's declared dependency. A fresh checkout must run:

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run validate:epic-l-policy2-architecture
```

There is no fallback to `C:\rlcc\node_modules` or another worktree.

The validator reports schema conformity, governance errors, and business-readiness blockers separately. A conforming architecture is expected to retain readiness blockers until human approvals exist.

The negative suite mutates isolated in-memory copies of the actual artifacts and exercises real transition validation. It rejects missing/conflicting decision authority, unverified coverage approval, invalid identities, technical-class-only coverage, expired policy, registration overwrite/privacy failures, resource/Kevin approval failures, safety interruption gaps, unauthorized hold exit, notification closure, recovery bypass, invalid transitions, missing M1 dependencies, and unapproved customer copy.

## Remaining blockers

- Original versioned Product Owner L-DEC source and exact approved wording.
- Customer-facing legal terms, applicability dates, duration, eligibility, remedies, and disclosures.
- Business and legal review of all 78 Active Product mappings.
- Independent manufacturing-source evidence where relevant.
- Approved private processors, staff access, deletion/export, backups, notifications, and seven-year lifecycle.
- Exact support hours, route owners/backups, incident authority, and Silica-Gem handoff.
- Approved resource revisions and Kevin evidence.
- Carrier-claims procedure and any future insurance design.

## Repository maintenance

`C:\rlcc` is the authoritative Epic L development workspace on `feat/epic-l-policy2-reconciliation`. The original `C:\rlcc-epic-l-policy2` worktree is detached at the same base and retained only as a temporary recovery reference.

The branch-maintenance manifest preserves both the historical reconciliation state and the consolidation event, including source and destination hashes, three compatible common-base paths, 25 new paths, and proof that all 39 pre-existing destination paths survived unchanged. It remains a point-in-time record, not a substitute for live Git checks.

Future promotion remains: inspect and preserve local changes, live-check Git and remote state, obtain Product Owner approval, commit only on the feature branch, review through integration, and keep production synchronization separate. Never merge `shopify/live` into development. Additional worktrees are exceptional and require explicit isolation need.
