# Epic L Policy 2.0 B05 technical architecture

Date: 2026-11-24

Status: **ENGINEERING TECHNICAL GUIDANCE IMPLEMENTED — SYNTHETIC DATA ONLY**

Customer guidance, resource publication, and machine-operation authorization: **BLOCKED**

## Purpose and authorization

B05 implements the private synthetic engineering portion of the Policy 2.0 successor definition of L-PBI-009. It records an authorized human's exact selection of a governed resource revision for an existing support case. It does not return resource content, diagnose equipment, invent instructions, determine warranty coverage, clear safety restrictions, publish a resource, or notify a customer.

The historical `firstImplementationBatch.allowedPbis` list is unchanged. B05 uses `EPIC-L-POLICY2-B05-AUTHORIZATION-2026-11-24`, a separate authorization limited to private synthetic L-PBI-009 engineering.

## Domain and record boundary

`TechnicalGuidanceService` is composed from the existing B01 private-record store, activation gate, exact Product/Variant catalog, `ResourceRevisionGovernance`, and `SupportSafetyService`, plus the B03 support-intake service. It does not create a parallel store, resource registry, support lifecycle, safety transition table, notification system, or permission framework.

Each guidance session is a private `RESOURCE_DELIVERY` record containing an opaque guidance ID, authorized support-case reference, minimized customer boundary reference, exact machine identity when known, operator reference and scope, registration and warranty non-authority snapshots, safety state, exact resource/revision candidates, preserved selections, revision requests, reconsiderations, recovery obligations, and audit events. B01 optimistic concurrency and immutable audit events apply.

The public handle exposes only an opaque guidance reference, a generic internal-processing state, and false delivery and activation flags. It does not expose case, customer, Product, resource, operator, approval, or evidence data.

## Lifecycle

The contract defines nine states and 32 explicit transitions:

`REQUESTED`, `MACHINE_IDENTIFICATION_REQUIRED`, `SAFETY_REVIEW_REQUIRED`, `RESOURCE_REVIEW_REQUIRED`, `AWAITING_HUMAN_SELECTION`, `SYNTHETIC_GUIDANCE_RECORDED`, `FOLLOW_UP_REQUIRED`, `RECOVERY_REQUIRED`, and `WITHDRAWN_OR_SUPERSEDED`.

These states describe private engineering workflow, not customer delivery. `SYNTHETIC_GUIDANCE_RECORDED` means a synthetic operator recorded an exact governed reference in a test context. It explicitly records that no resource content was returned or rewritten, no diagnosis or repair instruction was generated, no customer delivery occurred, and no machine operation was authorized.

## Exact resource resolution

Normal resolution delegates to `ResourceRevisionGovernance.resolveApprovedCustomerRevision()`. The committed Policy 2.0 registry is empty, so normal requests enter `RESOURCE_REVIEW_REQUIRED`.

Tests use `SyntheticGuidanceResourceResolver`, which reads internally approved revisions from an isolated B01 `ResourceRevisionGovernance` instance. It requires unmistakably synthetic resource identities and synthetic Kevin approval evidence. It marks every result `SYNTHETIC_TEST_ONLY` and `customerReleaseAuthorized: false`; it neither mutates the committed registry nor calls the disabled customer-release path.

Selection requires exact Product GID, ProductVariant GID, machine version, resource ID, revision ID, category, source identity, applicability, technical approval evidence, and current revision status. Title or filename matching, public availability, Google Docs, YouTube, Shopify Files, and publication status never establish approval.

Retired revisions cannot be selected for new guidance. Prior selections stay in the guidance audit history when a revision is reconsidered or superseded.

## Human and technical authority

Permission to operate the service is distinct from authority to approve technical content. The normal operator authority resolver is unresolved and denied. Test grants require an exact synthetic operator identity, scope, authorization evidence, and validity period; spoofing, expired grants, and out-of-scope use fail closed.

Kevin's production identity binding remains unresolved. `ResourceRevisionGovernance` remains the technical approval boundary. A support operator can record a revision request but cannot edit or approve the resource. Safety disposition, warranty review, technical approval, support operation, and customer release remain separate authorities.

## Safety precedence

Every request reads the live B03 case through its authorization boundary. `SAFETY_HOLD`, unresolved warning delivery, and ambiguous safety disclosure block ordinary guidance. A resource cannot clear a hold or authorize operation.

New hazardous information invokes the existing B01 `SupportSafetyService.interruptForHazard()` path. The static stop-use event remains independent of resource availability. Failed or uncertain warning delivery leaves recovery work and the hold active. If orchestration stops after the support case enters the hold, a retry detects the existing hold and completes the guidance-side safety record without duplicating the interruption.

Recovery after a hold requires the existing authorized human safety disposition and reconciled warning delivery. Even then, B05 records `machineOperationAuthorized: false`.

## B02–B04 integration

- Registration is optional and provides machine context only after B03 authorization. It does not prove ownership, coverage, eligibility, or guidance authority.
- Guidance requires an authorized B03 support case. `TECHNICAL_GUIDANCE` is the direct category; another category needs an explicit human referral without changing the original classification.
- Guidance never routes, resolves, or closes the parent case.
- A warranty-review reference has no authority effect. Guidance cannot change a B04 assessment, and a review status cannot authorize guidance.
- B05 queues no notification and invokes no external provider.

## Resource approval queue

The evidence-only queue contains nine existing candidates from the versioned Epic E catalog: three manuals and six diagrams with observed Product identities. Variant identities are copied from the accepted snapshot solely as observed Product relationships; they are not approved applicability.

All nine lack an approved immutable revision and approved Variant/machine-version applicability. They also lack confirmed rights, Kevin production approval evidence, and customer-release approval. The queue authorizes zero revisions and recommends a bounded first human review of the three machine instruction candidates.

## Production limitations

The in-memory service and test authorities provide no production identity assurance, employment binding, durable storage, encryption, retention, backup, deletion, access review, or atomic multi-service transaction guarantee. There is no public endpoint, customer data, content-generation engine, search index, notification provider, resource publisher, Shopify mutation, or production processor.

All eight Policy 2.0 readiness blockers remain in force.
