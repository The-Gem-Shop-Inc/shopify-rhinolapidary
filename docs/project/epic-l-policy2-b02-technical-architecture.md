# Epic L Policy 2.0 B02 technical architecture

Date: 2026-11-23

Status: **ENGINEERING REGISTRATION IMPLEMENTED — SYNTHETIC DATA ONLY**

Customer activation: **BLOCKED**

## Purpose and authority

B02 implements the synthetic engineering portion of L-PBI-004 and L-PBI-005. It extends the B01 composition root and uses the B01 private record store, authorization callback, exact Product/Variant catalog, notification outbox, resource resolver, audit boundary, opaque identifier helper, and disabled activation gate.

The registration contract remains proposed internal architecture. Registration state never determines warranty eligibility, Product coverage, legal remedies, or customer-facing policy authority.

## Registration record

Each private `REGISTRATION` record contains:

- an opaque registration ID generated from at least 16 random bytes in non-test use;
- an independently stored opaque customer reference and notification destination reference;
- exact Product GID, ProductVariant GID, and machine/Product version;
- registration time and a policy version reference whose applicability is not evaluated;
- first-use declaration and optional physical serial number;
- ownership verification, duplicate investigation, acknowledgement, instruction delivery, recovery, and correction records;
- an explicit warranty-eligibility object fixed to not determined, no automatic denial, and no authorized promise;
- B01 record version, timestamps, proposed retention metadata, and immutable audit events.

The physical serial, customer reference, and registration ID are distinct. Knowing a registration ID grants no read or write permission.

## Lifecycle

The service uses the eight states from registration contract 2.1.0:

`RECEIVED`, `IDENTITY_VERIFICATION_REQUIRED`, `DUPLICATE_REVIEW`, `ACKNOWLEDGED`, `RESOURCE_DELIVERY_PENDING`, `COMPLETE`, `RECOVERY_REQUIRED`, and `REJECTED_INVALID_INPUT`.

Twenty-two supported state transitions are exported as `REGISTRATION_TRANSITIONS`. Every state change performed by the registration service is checked against that table and its destination guards. `COMPLETE` additionally requires verified ownership, confirmed acknowledgement delivery evidence, confirmed instruction delivery evidence, and no unresolved recovery obligation. Unknown states and transitions fail closed.

Structurally malformed commands are rejected before persistence. `REJECTED_INVALID_INPUT` remains available for a received record only when a governed validation-rejection record exists; missing serial, first-use date, or historical order is not itself rejection evidence.

## Public and private identities

Private access requires an authenticated actor with an explicit registration permission. Owner access also requires exact equality with the record's opaque customer reference. Operator-only reads can inspect conflict identities and evidence; owner views redact those details.

The public handle contains only registration ID, a generic processing status, and the false customer-activation flag. Duplicate review, identity review, and recovery all appear as the generic `REVIEW_REQUIRED` status. It does not expose customer, Product, Variant, serial, evidence, conflict, destination, or notification identities.

## Ownership and duplicate review

Initial receipt records ownership as `UNVERIFIED`. Only an actor with the ownership-approval permission can record `VERIFIED`, `INCONCLUSIVE`, or `CONFLICTING` with evidence references.

Serial, verified-order-line, and existing-registration evidence are duplicate signals, not ownership authority. A match opens private human review and returns only `REVIEW_REQUIRED` to the submitter. Same-owner duplicates are not auto-merged, competing claims do not overwrite the existing owner, and B02 implements no autonomous ownership transfer.

Authorized corrections are version checked, evidence backed, limited to machine identity, version, first-use declaration, or serial, and append prior values to correction history. They preserve the registration ID and audit trail.

## Acknowledgement lifecycle

Acknowledgements contain the registration ID, exact machine identity, registration time, verification state, resource-delivery state, opaque support route, acknowledgement event ID, and notification ID. The synthetic message class explicitly carries no policy promise.

The lifecycle distinguishes event creation, notification queueing, delivery attempts, confirmed delivery, failure, uncertainty, and recovery. Queueing never counts as delivery. The B01 outbox supplies attempt identity, idempotent retry, provider evidence, and reconciliation.

Multi-step commands use a synthetic in-memory orchestration receipt ledger plus stable B01 subcommand IDs. Interruption after record persistence, acknowledgement creation, or outbox queueing can resume without creating a second registration, acknowledgement, or notification. This demonstrates command boundaries but does not claim production transaction durability.

## Governed instruction delivery

The registration service queries the B01 resource resolver with exact Product GID, Variant GID, and machine version. It independently checks returned applicability before recording a resource and revision identity.

The production registry remains empty. With no approved applicable revision, the registration remains preserved in `RESOURCE_DELIVERY_PENDING`, records `BLOCKED_NO_APPROVED_RESOURCE`, and retains a recovery obligation. No substitute resource is invented.

Synthetic tests may inject an explicitly synthetic resolver only when `testMode` is enabled. This does not modify the real resource registry or the disabled customer release gate. Revision refresh preserves earlier resolution and delivery evidence.

## Recovery and audit boundaries

Recovery covers incomplete acknowledgement steps, failed or uncertain delivery, missing or ambiguous resources, resource delivery failure, ownership conflict, explicit review dispositions, interrupted commands, and record version conflicts.

Recovery commands are idempotent and version checked. They do not silently change Product identity, customer ownership, first-use declaration, or policy applicability. Original records and audit events remain intact. Unavailable authority is represented by an unresolved review obligation.

## Future durable infrastructure

A production design still needs an approved identity provider, encrypted durable record store, durable idempotency receipts, atomic/outbox transaction strategy, provider reconciliation, role and tenant enforcement, key management, backup and restore validation, seven-year lifecycle approval, export/deletion rules, incident response, monitoring, and operational recovery ownership.

The in-memory adapter provides none of those guarantees and accepts synthetic data only.

## B03 dependency surface

B03 support intake may reference a registration through the private registration port after explicit authorization. It must treat registration identity as context—not proof of customer identity, ownership, coverage, eligibility, or warranty approval. B03 must retain its own support authorization, safety interruption, notification recovery, and Rhino case ownership controls.
