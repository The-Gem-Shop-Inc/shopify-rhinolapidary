# Epic L Policy 2.0 B04 technical architecture

Date: 2026-11-23

Status: **ENGINEERING WARRANTY REVIEW GOVERNANCE IMPLEMENTED — SYNTHETIC DATA ONLY**

Operational decision issuance: **BLOCKED**

Customer notification: **BLOCKED**

## Purpose and authorization

B04 implements the synthetic engineering portion of L-PBI-013. It organizes private human review evidence and permits an explicitly synthetic assessment, but it cannot issue an operational approval or denial and cannot notify a customer.

The original `firstImplementationBatch.allowedPbis` list remains unchanged and does not include L-PBI-013. B04 is authorized separately by `EPIC-L-POLICY2-B04-AUTHORIZATION-2026-11-23`, recorded in the versioned warranty-review contract and backlog. That authorization is limited to private synthetic engineering.

## Authority model

The contract separates nine roles: customer or submitter, support operator, evidence preparer, human warranty reviewer, policy authority, coverage approval authority, legal authority, safety disposition authority, and system automation.

Permissions are necessary to call a service method but are not proof of real authority. The normal authority resolver always returns `UNRESOLVED` and denies assessment. A synthetic resolver may be injected only with `testMode`; it requires an exact reviewer identity binding, authority role, scope, authorization evidence, validity period, and assessment type. It rejects identity spoofing, self-asserted roles, missing evidence, expired grants, and out-of-scope use.

Evidence preparation and assessment are separate permissions. A preparer cannot record an assessment. A support operator does not become a warranty reviewer through case ownership. No role in the B04 contract may issue a customer decision.

## Private review record

Each warranty review is an `APPROVAL_EVIDENCE` record in the B01 private store. It contains:

- opaque review and private record identities;
- exact B03 case reference and original customer reference;
- exact Product GID, ProductVariant GID, and machine version;
- minimized ownership, purchase, policy, coverage, obligation, and supporting evidence references;
- requested reviewer, role, scope, resolved synthetic authority evidence, and timestamps;
- B03 safety, notification-recovery, registration-context, and Rhino-responsibility snapshots;
- missing-evidence codes, evidence revisions, synthetic assessments, reconsiderations, and supersession history;
- explicit false values for customer effect, operational decision, customer notification, and issued warranty finding.

Records use B01 optimistic concurrency, idempotent commands, private authorization, immutable audit events, and proposed retention metadata. Evidence corrections append revisions instead of replacing prior evidence. Reconsideration and supersession retain earlier assessments.

The public handle exposes only the opaque review reference, a generic internal-review status, and false issuance, notification, and activation flags. It excludes customer, Product, reviewer, evidence, authority, and potential outcome information.

## Review lifecycle

The contract defines 11 internal states and 47 explicit transitions:

`REVIEW_REQUESTED`, `EVIDENCE_INCOMPLETE`, `AUTHORITY_UNRESOLVED`, `POLICY_APPLICABILITY_UNRESOLVED`, `COVERAGE_UNRESOLVED`, `READY_FOR_HUMAN_REVIEW`, `HUMAN_REVIEW_UNDERWAY`, `SYNTHETIC_ASSESSMENT_RECORDED`, `FURTHER_EVIDENCE_REQUIRED`, `REVIEW_BLOCKED`, and `REVIEW_WITHDRAWN_OR_SUPERSEDED`.

These states describe internal review readiness, not customer outcomes. There is no `WARRANTY_APPROVED` or `WARRANTY_DENIED` state. Unknown states and unauthorized transitions fail closed. Reaching `SYNTHETIC_ASSESSMENT_RECORDED` never creates operational authority.

## Policy applicability

Readiness requires an immutable policy identity and version, approved effective period, purchase or event applicability evidence, approved customer legal-language evidence, resolved provenance, and separate evidence for legally required rights and Rhino voluntary obligations.

The current Policy 2.0 decision receipt has unresolved provenance, no approved effective dates, and no approved customer copy. Normal reviews therefore cannot become ready for an operational determination. Registration time, first use, current date, and the historical warranty never infer applicability. Synthetic policy evidence is accepted only in isolated test mode and remains non-operational.

## Coverage evidence

The review preserves exact Product and Variant GIDs and treats the committed coverage matrix as evidence only. All 78 Active Products remain under human review with zero customer-promise authorizations.

Vendor, product type, technical class, title, publication state, registration completion, ownership verification alone, tentative component class, and catalog compatibility are prohibited coverage-authority signals. Draft status does not automatically remove legal protections. Synthetic coverage fixtures are test-only and do not mutate the real matrix.

Manufacturer obligations, Rhino voluntary obligations, and legally required protections must be evidenced separately. Silica-Gem's escalation destination does not grant authority over Rhino obligations or legal rights.

## B03 case and safety integration

A review references an existing authorized B03 case. `WARRANTY_DECISION` is the direct category; another category requires an explicit, evidenced referral without changing the original classification.

B04 reads the case and registration context but never mutates either. Registration does not prove eligibility. Synthetic assessment does not resolve or close the support case, send a notification, surrender Rhino ownership, or alter communication responsibility.

The B01 safety service remains authoritative. An active `SAFETY_HOLD` or unresolved warning delivery blocks review. B04 cannot clear the hold, authorize equipment use, or substitute an assessment for serious-incident handling.

## Synthetic assessment and reconsideration

The only assessment types are synthetic supportability, synthetic non-supportability, and synthetic further-evidence assessment. Each requires a bound reviewer grant, exact scope, authorization evidence, review time, reasoning code, and supporting evidence.

Every assessment records `SYNTHETIC_ASSESSMENT_ONLY`, no customer effect, no operational decision, no promise, no remedy, and no notification authority. Further evidence, corrected evidence, authority disputes, policy disputes, coverage disputes, and manufacturer evidence can reopen review without deleting the earlier assessment.

## Issuance gate

Internal evidence and synthetic assessment are permitted. Operational decision issuance and customer notification have dedicated methods that always reject with activation errors. Test mode, synthetic grants, lifecycle state, and temporary evidence cannot bypass these methods.

The gate also carries all eight Policy 2.0 readiness blockers. A future operational design requires separately approved policy provenance and applicability, customer legal language, complete coverage approvals, real human authority binding, production identity and processors, security review, decision copy, notification delivery, and operational acceptance.

## Production limitations

The in-memory store and authority fixtures do not provide durable identity assurance, employment verification, role administration, encryption, retention, backups, deletion, access review, or transaction guarantees. B04 performs no Shopify read or write, external processor call, manufacturer submission, carrier claim, refund, replacement, payment action, public API, or real notification.
