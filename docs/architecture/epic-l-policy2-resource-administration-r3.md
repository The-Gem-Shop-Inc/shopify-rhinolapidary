# Epic L Policy 2.0 resource administration requirements — Revision 3

Recorded: 2026-11-25

Source inventory: `data/epic-l-policy2-resource-approval-queue.json`

B05 queue identity: SHA-256 `C5A3196BCF2BAB4FA09F0C702A5A0148DD173D263D32F47FA9D52157DF6CED2A`

## Product Owner direction

Build a straightforward private administration interface that lets the Product Owner assign document and video links to applicable machine versions. Accept the owner's statement that existing resources have already been reviewed and approved by Kevin as business direction. Do not demand a second comprehensive review unless a resource has changed.

That direction does not supply the missing machine-readable binding between approval, immutable revision, and exact applicability. The interface must capture that binding while the owner performs ordinary administration. It must not publish resources in its first batch.

## Initial data set

Import all nine B05 candidates with their exact current evidence:

- 3 high-priority instruction candidates;
- 6 medium-priority diagram candidates;
- exact source identity/reference;
- exact observed Product and Variant GIDs;
- candidate machine version;
- current revision/rights/approval gaps;
- zero customer-release authorizations.

Import is evidence migration only. It must not convert observed Variant relationships, filenames, URLs, repository presence, Shopify publication, or the owner's general approval statement into customer-release status.

## Required record model

Each logical resource has a stable `resourceId`. Each update creates an immutable revision with:

- `revisionId`, content hash or provider revision identity, creation time, and superseded revision;
- category and language;
- editable source identity and customer-delivery link kept distinct;
- exact applicable Product GIDs, Variant GIDs, and machine-version identifiers;
- link/provider type, availability-check result, and last verified time;
- rights/source status and accessibility disposition;
- technical approval actor/evidence/time, including a way to record that an unchanged existing revision was previously approved by Kevin;
- customer-copy approval when relevant;
- internal status and separate customer-release status;
- actor, reason, and evidence for every revision, applicability, retirement, and supersession event.

Product/Variant identity must resolve against the accepted catalog snapshot or an explicitly versioned successor. Machine-version text is not a substitute for exact Product/Variant identity.

## Administration workflow

1. Select an existing resource or create a draft logical resource.
2. Enter or select the document/video source and customer-delivery link.
3. Resolve exact Product, Variant, and machine-version applicability.
4. If the content is unchanged and already reviewed, record the existing Kevin approval assertion against the exact revision; do not restart content review.
5. If content changed, create a new revision and require fresh technical disposition for that revision.
6. Validate link availability, identity, rights, language, and accessibility disposition.
7. Save as internal draft/approved evidence. Retain the prior revision and assignments.
8. Customer release remains disabled until the separate resource and policy release gates are satisfied.

Normal updates should be short: clone the prior applicability, replace the source/link, compute or enter the new immutable revision identity, explain the change, and route only the changed revision for the necessary review. Historical rows are never overwritten or deleted by ordinary updates.

## Interface requirements

- List/filter by machine version, Product/Variant GID, category, status, missing evidence, and changed/unchanged revision.
- Show source, release link, immutable revision, applicability, approval, availability, and supersession on one detail screen.
- Search exact Shopify GIDs and display human titles without using titles as identity.
- Warn on unknown/stale GIDs, empty applicability, mutable-only links, missing revision identity, duplicate active assignment, broken link, or changed content hash.
- Provide revision comparison and full history.
- Allow retirement/supersession without erasing old evidence.
- Export the resource registry and revision history for business-managed backup.
- Never expose private case evidence, staff secrets, or manufacturer contact destinations.
- Keep publication and storefront mutation absent from the initial interface.

## Roles and safeguards

- Product Owner: assigns links and applicability and records existing approval evidence.
- Kevin: technical authority for a changed revision or when exact existing approval evidence cannot be bound.
- Engineering system: validates identity, revision immutability, link availability, state transitions, and audit completeness; it does not judge content.
- Customer-release authority: remains a separate later release gate. Do not invent a new content approver.

Authorization must use exact production identities before live use. A role label or repository permission alone is not sufficient. Every write requires optimistic concurrency/idempotency and an append-only audit event.

## Acceptance criteria for the UI batch

- The nine B05 candidates import exactly and zero become published.
- An owner can assign a document and a video to exact machine versions and Product/Variant GIDs using synthetic data.
- An unchanged existing revision can record prior Kevin approval without a blanket review ceremony.
- Changed content always creates a new revision and does not inherit approval silently.
- Superseding or retiring a revision preserves historical applicability and approval evidence.
- Invalid GIDs, missing revisions, mutable-only links, missing applicability, and publication attempts fail closed.
- Export/import round-trip preserves exact identities and history.
- B01–B05 resource, safety, notification, registration, and activation-guard regressions remain green.

No resource is published by this reconciliation or by the recommended B06 contract batch.
