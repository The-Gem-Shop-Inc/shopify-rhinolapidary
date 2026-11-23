# Epic L Policy 2.0 B01 technical architecture

Date: 2026-11-23

Status: **ENGINEERING FOUNDATION IMPLEMENTED — SYNTHETIC DATA ONLY**

Customer activation: **BLOCKED**

## Purpose and authority

B01 implements portable private-domain foundations for L-PBI-006, L-PBI-014, L-PBI-016, and L-PBI-012. The committed Policy 2.0 contracts remain the business-rule authority. These modules do not approve policy language, Product coverage, processors, operational routes, or customer activation.

## Source modules

- `scripts/lib/epic-l-policy2/common.js` — domain errors, opaque identifiers, exact Shopify identity validation, and the disabled activation gate.
- `scripts/lib/epic-l-policy2/private-records.js` — authorization, private records, optimistic concurrency, idempotent commands, retention metadata, and immutable audit events.
- `scripts/lib/epic-l-policy2/resource-governance.js` — resource identities, immutable revisions, exact applicability, technical approval, supersession, and release blocking.
- `scripts/lib/epic-l-policy2/notifications.js` — outbox lifecycle, opaque destinations, attempts, evidence, retries, uncertain outcomes, and recovery.
- `scripts/lib/epic-l-policy2/support-safety.js` — contract-driven ordinary transitions, global safety interruption, warning delivery, locked safety holds, and authorized human disposition.
- `scripts/lib/epic-l-policy2/foundation.js` — composition root and B02/B03 integration ports.
- `scripts/lib/epic-l-policy2/index.js` — stable CommonJS export surface.

## Domain boundaries

Private record contents are available only through an explicit authorization callback. Public handles expose only an opaque reference and record category. Five record categories are supported: registration, support case, approval evidence, notification, and resource delivery.

Every record has an internal identity, opaque public reference, version, creation and modification times, proposed retention metadata, and audit trail. Updates require an expected version. Repeated commands return the original result only when the command payload matches; key reuse with different input fails closed.

The in-memory adapter is deliberately non-durable. Its seven-year metadata records a proposal and explicitly denies durable-retention, backup, and deletion guarantees.

## Resource governance

The component accepts only the six categories in the committed resource contract. Every revision requires an immutable revision identity, editing source identity, exact Product/Variant relationship, and machine-version applicability. Publication or URL existence is never approval.

Technical approval requires the configured Kevin authority and evidence. A synthetic authority can be configured only with explicit test mode. Customer release additionally requires customer-copy approval and the operational activation gate; B01's gate always rejects release. The approved customer registry therefore remains empty.

## Notification lifecycle

The implementation maps the contract's notification requirements to `PENDING`, `DELIVERY_ATTEMPTED`, `DELIVERY_CONFIRMED`, `DELIVERY_FAILED`, `RECOVERY_REQUIRED`, and `TERMINAL_DISPOSITION`.

A queue or attempt is not confirmation. Confirmation requires delivery evidence. Failed and uncertain outcomes remain visible, retry commands are idempotent, and uncertain outcomes require reconciliation. The transport is a port; B01 supplies only a deterministic synthetic transport and selects no production provider or queue.

## Safety state machine

The service loads `data/epic-l-policy2-support-safety-contract.json` and does not maintain a second transition table. It executes all 23 ordinary transitions and the safety interruption from all ten relevant states.

Hazard receipt first enters `SAFETY_HOLD` and generates a static stop-use warning event. Delivery confirmation is recorded only with evidence. Failure or uncertainty retains the hold and creates notification recovery. Ordinary transitions and recovery cannot bypass the hold. Exit is limited to the two contract-authorized destinations and requires an authorized human plus the complete disposition record.

Manufacturer escalation records Silica-Gem as the destination while retaining Rhino case ownership and communication responsibility. It never closes the case automatically. Staff handling remains pending approved business hours; no continuous monitoring is implied.

## Integration ports for B02 and B03

The composition root exposes ports for registration record storage, registration acknowledgement events, resource revision resolution, support case creation, safety interruption, notification delivery and reconciliation, authorized human disposition, audit recording, and the operational activation gate.

B02/B03 must use these ports or a contract-compatible durable adapter. They must not bypass the activation gate or duplicate transition, resource, or notification rules.

## Security and privacy limits

- No real customer data, contact details, credentials, or secrets are present.
- Destinations are opaque references; transports receive no raw contact value.
- Registration-style identifiers use at least 16 cryptographically secure random bytes. UUIDv4 is not treated as satisfying a strict 128-bit random-entropy requirement.
- No production storage, backup, deletion, recovery, access-review, or incident guarantee is made.
- No Shopify Forms, Flow, metafield, checkout, account, theme, or Admin integration is present.
- A full security review remains incomplete.

## Required production decisions

Processor selection, seven-year lifecycle approval, access roles, backup/export/deletion behavior, notification providers and channels, approved warning copy, incident authority, exact routes and hours, real Kevin authority binding, resource releases, and the Silica-Gem handoff procedure remain unresolved.

## B02 and B03 dependencies

B02 can build registration and acknowledgement behavior with synthetic data against the record, resource, notification, and activation ports. B03 can build governed support intake against the support and safety ports. Neither batch may accept real customer data or activate a public workflow until the backlog activation dependencies and eight readiness blockers are resolved.
