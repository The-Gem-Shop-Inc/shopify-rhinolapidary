# Epic L Policy 2.0 B06 Technical Architecture

Date: 2026-11-25

Status: engineering alignment complete, synthetic/private only

Authority: Revision 3 Product Owner business direction; not legal clearance or customer issuance authority

## Scope

B06 amends the existing B01–B05 domains. It does not create a parallel registration service, support case engine, or warranty decision engine.

| Work item | Implemented boundary |
|---|---|
| R3-001 | Registration contract 2.2.0, additive historical adapter, purchase/first-use evidence, exception paths, and removal of physical serial authority |
| R3-002 | Support/safety contract 2.2.0, Central business-hours evaluator, assigned-owner resolution, Kevin-bound reopening and safety disposition, and external notification boundaries |
| R3-003 | Warranty review contract 1.1.0 with internal business intent and seven independent authority dimensions |
| R3-004 | Deterministic projection and worksheet for exactly 31 unresolved Active Products |

## Registration compatibility

`registrationId` remains the authoritative Rhino reference and keeps at least 128 bits of entropy. The service accepts registration without a physical serial. `serialNumber` remains readable for B02 historical records and is projected into nullable `legacyPhysicalSerialEvidence`, but neither field participates in duplicate detection.

The 2.1-to-2.2 adapter:

- preserves the registration ID and every historical field;
- adds typed purchase and first-use evidence collections;
- adds distinct new, prior-purchase-exception, and prior-registration-exception paths;
- is idempotent and records one migration event;
- does not infer first use from registration time;
- routes missing purchase evidence to exception review without denial.

Shared purchase evidence and a shared customer reference do not identify one physical machine. Only explicit prior-registration evidence or governed ownership review opens duplicate handling.

## Support and safety

Business hours are Monday–Friday, 09:00–17:00 in `America/Chicago`. The evaluator converts an instant through the IANA timezone and correctly handles Central standard/daylight offsets. No holiday calendar, continuous staffing, or response guarantee is inferred. Outside hours produce an internal acknowledgement intent only; no message wording or send occurs.

Resolution requires a verified per-case assigned-owner proof and reconciled notifications. Reopening preserves the same case and audit history and requires Kevin's verified identity binding. A name or role label alone is insufficient. `SAFETY_HOLD` stays private and blocks ordinary transitions and reopening. Kevin-bound disposition evidence is required before the service can leave the hold; Warehouse is a notification fallback only.

Silica-Gem referral remains proposed, never automatic, and retains Rhino ownership/follow-up. Refund allocation and the handoff protocol remain blocked on the operating agreement and Silica-Gem management confirmation. Discord remains a possible notification signal only; it is not implemented, cannot store the case, and cannot carry customer or private evidence.

## Warranty intent

The B04 warranty review engine is unchanged. Its contract now records the Product Owner's one-year business intent, affected-part-first preference, arrival-only wear-component scope, intended registration start event, responsibility split, and prior-purchaser transition intent.

Only `BUSINESS_INTENT` is established. Legal applicability, manufacturer agreement compatibility, exact Product coverage, customer copy, operational decision authority, and customer issuance authorization remain blocking. The issuance gate still has no operational or customer-notification path, including in test mode.

## Coverage projection

The projection is generated from the unmodified 2.1 coverage matrix by selecting Active Products whose disposition is `HUMAN_REVIEW_REQUIRED`. Validation enforces exactly 31 unique Product GIDs, exact Variant membership, source title/priority/approval states, and zero customer-promise authorizations. The remaining 47 Active Products retain their eventual business/legal review requirement.

Manufacturer evidence is not a new approval role. It answers who produced the relevant machine or component—Rhino or an external manufacturer—and which source supports that conclusion.

## Non-activation guarantees

All eight readiness blockers remain. B06 performs no Shopify, Forms, Flow, Discord, customer, manufacturer, insurance, publication, or notification operation. The 39 unrelated local paths are governed by a checked SHA-256 preservation manifest.

## B07 readiness

The recommended next batch is the resource administration interface described in the Revision 3 architecture: manage exact document/video revision identity and Product/Variant/machine-version applicability, reuse the B05 inventory and approval queue, retain revision history, and keep publication disabled. Shopify/private case integration, insurance feasibility, staff identity binding, and publication should remain separate batches.
