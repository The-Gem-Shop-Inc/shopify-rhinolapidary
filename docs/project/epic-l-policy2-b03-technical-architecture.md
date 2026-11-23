# Epic L Policy 2.0 B03 technical architecture

Date: 2026-11-23

Status: **ENGINEERING SUPPORT INTAKE IMPLEMENTED — SYNTHETIC DATA ONLY**

Customer activation: **BLOCKED**

## Purpose and authority

B03 implements the synthetic engineering portion of the Policy 2.0 successor definition of L-PBI-008. It composes the B01 private-record, audit, notification, safety, authorization, and activation ports with the B02 registration boundary. It does not create a second transition table, record store, queue, registration model, or activation gate.

The service accepts only the five contract categories: `WARRANTY_DECISION`, `TECHNICAL_GUIDANCE`, `PARTS_QUESTION`, `MANUFACTURER_REFERRAL`, and `SHIPPING_CLAIM`. Classification records routing intent only. It performs no warranty finding, autonomous diagnosis, repair instruction, carrier claim, manufacturer submission, or customer promise.

## Private case record

Each `SUPPORT_CASE` record contains an opaque case reference, private record identity, opaque synthetic customer and destination references, category, submission time, synthetic source channel, optional exact Product and Variant identity, optional authorized registration context, minimized synthetic summary or evidence references, safety disclosure and assessment, routing state, acknowledgement state, recovery obligations, external-service boundaries, record version, and immutable audit events.

The public handle contains only the opaque case reference, a generic processing status, and the false customer-activation flag. Case and registration references are locators, not credentials. Customer reads require exact owner-reference equality; operator, reviewer, safety, routing, and warranty authorities remain separate permissions.

## Registration context

Registration is optional. When supplied, B03 reads it through the B02 authorization boundary and never mutates it. An authorized context may identify the exact recorded machine and current verification state, but never establishes identity, current ownership, coverage, eligibility, manufacturer obligations, or remedy rights.

An inaccessible, disputed, or other-customer registration produces only a generic review result. B03 neither confirms nor denies that another registration exists. Intake can continue without registration, serial number, account history, or a coverage decision.

## Safety precedence

Explicit hazardous information creates or resumes the case idempotently and invokes the B01 `SupportSafetyService`. That service owns the committed 23 ordinary transitions, ten global safety-interruption entry states, `SAFETY_HOLD` lock, stop-use warning event, notification evidence, recovery, and authorized human disposition.

Warning generation and warning delivery are independent. Failed or uncertain delivery leaves the hold active and records recovery. An interruption after case persistence resumes with the same case and restores safety priority before ordinary processing. Ambiguous safety information records human review and never produces an automatic safe finding. System warning generation does not imply continuous staffing.

## Routing intent

Normal architecture uses the unresolved contract routes. It records category, intended destination, eligibility, primary and backup references, routing attempt, acknowledged handoff, failure, and recovery. It cannot claim assignment without an approved route and explicit handoff evidence. Queueing is not staff acceptance.

Synthetic route fixtures and routing outcomes require explicit test mode. They do not approve Avery, Kevin, Warehouse, Stephanie, business hours, backup coverage, or operational ownership. A safety hold blocks routing. Quotations remain outside the support domain.

## Acknowledgement and notification recovery

Acknowledgement distinguishes case persistence, event creation, outbox queueing, attempt, confirmation, failure or uncertainty, reconciliation, and recovery. Stable command and subcommand identities prevent duplicate cases and notification obligations during retries. Queueing never counts as delivery.

The synthetic message class carries no warranty coverage, duration, remedy, repair-service, staff-assignment, response-time, or continuous-monitoring promise. A safety warning remains a separate notification obligation. Unresolved notification evidence prevents prohibited resolution or closure through the B01 state guards.

## External service boundaries

Warranty cases record a future human-decision requirement only. Technical questions produce no diagnostic content and remain dependent on Kevin-approved governed resources. Manufacturer referral may record a proposed private intent to Silica-Gem, evidence-package reference, and Rhino follow-up responsibility; it performs no submission and cannot close Rhino's case. Shipping claims remain classified only, with no carrier API, insurance purchase, checkout change, or compensation decision.

## Recovery and durability limits

Every state-changing operation is version checked and idempotent. The in-memory orchestration ledger and stable subcommands demonstrate recovery after case persistence, acknowledgement creation, queueing, safety interruption, routing failure, and uncertain delivery. Audit events are append-only through the ordinary service boundary.

This is not production durability. A future implementation still requires an approved identity provider, encrypted durable processor, transaction/outbox strategy, durable idempotency receipts, access enforcement, retention approval, backup and restore evidence, monitoring, provider reconciliation, incident authority, and operational recovery ownership.

## Subsequent dependencies

Later support work may consume the private case, safety, notification, registration-context, routing-intent, audit, and activation ports. L-PBI-010, L-PBI-011, and L-PBI-013 remain incomplete. No later batch may interpret the B03 synthetic completion as staff-route, hours, manufacturer-handoff, warranty, legal, privacy, security, or customer-activation approval.
