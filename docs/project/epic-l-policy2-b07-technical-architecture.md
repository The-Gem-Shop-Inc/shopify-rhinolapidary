# Epic L Policy 2.0 B07 technical architecture

Date: 2026-11-27

Status: engineering implementation complete, private synthetic only

Authorization: `EPIC-L-POLICY2-B07-AUTHORIZATION-2026-11-27`

## Placement and reuse

B07 extends the repository's Node-based Policy 2.0 domain rather than adding a production application stack. `ResourceRevisionGovernance` remains the canonical authority for exact applicability, technical internal approval, and the disabled customer-release gate. `ResourceAdministrationService` is the richer administrative registry: it retains logical resources, immutable administrative revisions, evidence dispositions, optimistic versions, command receipts, and append-only audit events. It can record an internal approval only by successfully invoking the canonical governance commands.

The accepted 2026-11-23 Product/Variant snapshot supplies exact identities and human titles. B05's queue is imported without modification. Its nine observed relationships remain `OBSERVED_NOT_APPROVED`; deterministic B05 revision IDs are derived from the queue and candidate identities.

## Interface and persistence decision

The smallest repository-compatible interface is a dependency-free Node HTTP server with accessible native HTML, CSS, and JavaScript. It binds to `127.0.0.1`, refuses startup without `--synthetic`, validates loopback Host and exact write Origin, requires an isolated session header, limits JSON bodies to 1 MB, and serves only an explicit static-file allowlist. Server-selected synthetic actors and path resource IDs override any caller body fields.

Runtime persistence is deliberately the existing in-memory demonstration model. A digest-validated, restricted-data-screened registry export/restore preserves logical identities, revision and applicability history, approval evidence, retirement/supersession, and audit evidence for business-managed isolated backup. This is not production durability, privacy retention, or backup readiness. Selecting production identity and persistence remains a later authorized batch.

## Approval interpretation

The Product Owner's historical assertion is anchored to `data/epic-l-policy2-decision-receipt-r3.json#OPEN-09`. It records Kevin as the asserted historical authority, the current Product Owner synthetic actor and recording time, exact immutable revision identity, exact approved applicability, and explicit limitations. It records no invented Kevin timestamp or verified production staff identity. New or changed content must receive a fresh synthetic technical disposition before internal approval.

An administrative internal approval is not customer release. The canonical historical assertion shape intentionally lacks the fresh technical actor identity required by `releaseForCustomer`, customer-copy approval remains false, and the eight-blocker activation gate always rejects release. Direct storefront mutation is absent and explicitly rejected.

## Evidence and lifecycle

Rights, language, accessibility, and availability remain independent. B07 availability is deterministic synthetic evidence and always records future provider verification as required. Ordinary administration cannot overwrite or delete history. Revision updates clone prior metadata/applicability, clear approval inheritance, and require reason/evidence. Supersession and retirement are append-only events.

Incoming archives are fully validated before a new registry map replaces the old one, so malformed, inconsistent, authority-escalating, or restricted-data archives cannot partially mutate the registry.

## Launch

```powershell
npm run start:epic-l-policy2-b07
```

Open `http://127.0.0.1:4177`. The server imports the exact nine B05 candidates into isolated memory on each normal start. No provider or Shopify request occurs.

## Independent decisions

- Keep R3's historical backlog immutable and record R3-005 progress in `data/epic-l-policy2-r3-engineering-progress.json`.
- Use the R3 OPEN-09 receipt as the only accepted historical-assertion reference; arbitrary strings are not approval evidence.
- Permit incomplete drafts while requiring an Active Product snapshot identity for explicitly approved applicability.
- Permit multiple assignments per revision and reject duplicate category/Product/Variant/machine-version ownership among active internal revisions.
- Keep in-memory demonstration persistence plus validated export/restore instead of selecting unauthorized production infrastructure.

All eight readiness blockers remain active. The 31-Product coverage projection, private `SAFETY_HOLD`, registration, support, warranty issuance, notifications, publication, storefront, Shopify, Forms, Flow, Discord, insurance, manufacturer, and refund boundaries are unchanged.
