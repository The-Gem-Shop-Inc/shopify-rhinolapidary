# Epic G foundation consumer contract

**Owner:** G-PBI-001. **Implementation:** scripts/lib/epic-g-foundation.js. This is an E/F consumer, not a new approval system or compatibility graph.

## Calling the consumer

Call loadAuthority() to obtain an opaque E/F authority token, then assess(token, readEnvelope, {asOf, baseline}). Tokens cannot be serialized or forged. fixtureAuthority() is restricted to explicit fixture approval identifiers and cannot authorize live Admin data.

The loader verifies the existing F source binding, current E approval/reconciliation chain, source digests and reproduced F release/compiler output. Historical-time receipt verification only establishes immutable integrity after expiry; sourceState always evaluates present-time receipt and observation validity separately. During the valid receipt interval the existing F binding verifier also runs. No read rewrites or renews a receipt.

baseline is an optional historical observation used solely to report count differences. It does not approve Product identities, class values or edges. The CLI uses October 15 discovery as this observation; changing counts is not inherently an approval.

## Product and relationship outputs

- approvedClass comes from Epic F's existing classification() applied to E's governed mappings, identities and decisions. A matching live rhino.product_class value/type/definition and current exact identity/handle are required.
- gRoleEligible concerns the G data consumer. customerProductEligible additionally requires current Online Store publication.
- Exact Product/Variant identities and Variant membership come from E. New or removed membership cannot silently inherit fit.
- compatibility.sourceApproved says a current E source row matches the F grant; compatibility.dataEligible additionally requires the complete current reference set, proof, type/definition/identity, source integrity, receipt and complete read.
- compatibility.targets separately reports approved, published, eligible and deterministic reasons. Unpublished JadeMaster can remain sourceApproved/dataEligible while customerEligible is false.
- The full list is a set: reordering is harmless; duplicates and adding/removing one target reject the entire list. No surviving subset renders when the multi-machine list drifts.
- Blocked Saw Vice relationships are derived from existing E holds. Absence is expected; an unexpected populated reference is drift. No special duplicate graph or new owner decision exists in G.
- compatible, included, optional and recommended are separate field meanings. Observed included/optional/recommended values do not grant fit authority.
- nativeCommerce.action is always PRESERVE_NATIVE_SHOPIFY and disabledByG is always false. Aggregate stock/availability is an observation, never a purchase, delivery or urgency policy.

optionalAbsences reports missing native SKUs, media, descriptions, candidate item-attribute keys and resource fields. The item-attribute names are readiness categories, not new Shopify definitions or approved customer attributes. Field absence is not a Product purchase block. No values are parsed from titles, tags, types, family, collection membership or prose.

## Reasons and expiry

Reasons are sorted unique stable uppercase codes. Examples: CLASS_CHANGED, PRODUCT_HANDLE_CHANGED, VARIANT_MEMBERSHIP_CHANGED, APPROVAL_REVOKED, REFERENCE_LIST_CHANGED, REFERENCE_DUPLICATE, REFERENCE_UNKNOWN, REFERENCE_ORPHAN, TARGET_NOT_PUBLISHED, RELATIONSHIP_BLOCKED_BY_SOURCE, RECONCILIATION_PROOF_MISMATCH, SOURCE_DRIFT, RECEIPT_EXPIRED, ADMIN_OBSERVATION_STALE and ADMIN_PAGINATION_INCOMPLETE.

Receipt validity uses reconciledAt ≤ asOf < expiresAt. Admin observation freshness uses the existing E seven-day model with an exclusive expiry boundary. Eligibility lasts no longer than either existing receipt or observation. Re-running a report or importing a recorded connector log preserves the original capturedAt; it cannot create a new observation or approval.

## Read infrastructure and operation accounting

epic-g-admin-read reuses E's runAdminAudit paginator, error handling and authenticated fetch infrastructure. The only E helper extension is optional read-only operation overrides and bounded pageSize; defaults are unchanged. G uses two narrow, enriched existing Product/Variant query shapes and ten records per page.

Record every outer page/cursor/result and nested completion. Reject missing/repeated/unconsumed pages, partial nested connections, mismatched shop, GraphQL/HTTP errors and records differing from the page evidence. Imported connector logs are digest-bound to their normalized envelope. apiVersion is null when the connector does not expose it.

With an existing authorized environment credential:

    npm run audit:epic-g-admin -- --output <read-envelope.json>

Without that credential the command reports ADMIN_READ_UNAVAILABLE and exit 2, making zero requests; it never silently substitutes a fixture. Connected-tool reads can instead be captured in a transcript and normalized locally:

    npm run audit:epic-g-admin -- --connector-log <connector-reads.json> --output <read-envelope.json>

This replay makes zero additional Shopify requests. A successful read can be evaluated with:

    npm run validate:epic-g-foundation -- --read <read-envelope.json> --output <readiness.json>

Offline fixture validation is explicit:

    npm run validate:epic-g-foundation -- --fixture --output <fixture-readiness.json>
    npm run test:epic-g-foundation

Reports expose mode OFFLINE_FIXTURE versus CAPTURED_ADMIN_READ, liveAdmin, capture time, source/receipt expiry, per-class coverage, missing/unknown identities, full relationship results, optional gaps, native/source/publication drift and baseline differences. Fixture success is never current Admin reconciliation.

## Remaining architecture

Retain the [ordinary Product template decision](adr-0002-epic-g-default-product-template.md). This batch creates no Liquid, forward-fit UI, route/index, price/SKU mutation or account/resource implementation. G2 consumes this contract; existing F renderer and parked F gates stay unchanged.

