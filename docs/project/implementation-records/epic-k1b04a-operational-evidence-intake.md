# Epic K1B-04A — Operational Evidence Intake

Date: 2026-10-24
Branch: `epic-k/k1b04a-operational-evidence-intake`
Baseline: `a171ce992092da0a332442ef9d8b67f4b48a95f8`
Parent PBI: `K-PBI-002` (`partial`)

## Delivered intake process

K1B-04A adds a versioned intake manifest for the eight existing `K-EVID-*` requirements. Requirement IDs, categories, allowed owner roles, and mandatory facts continue to come from `data/epic-k-operational-evidence-requirements.json`; the manifest adds only request-specific subject scope, acceptable artifacts, provenance, validity, sanitization, required assertions, repository leads, human inputs, and prohibited inferences.

The generated departmental handoff is `docs/project/epic-k-operational-evidence-request-report.md`. Regeneration is deterministic:

```powershell
npm run generate:epic-k-evidence-requests
```

The intake validator checks the manifest, its requirements fingerprint, the generated report, the empty authoritative receipt register, the eight blocked evidence gates, mapping design acceptance, and authority boundaries:

```powershell
npm run validate:epic-k-evidence-intake
```

A sanitized candidate receipt set can be checked without attaching it:

```powershell
npm run validate:epic-k-evidence-intake -- --submission <sanitized-candidate.json> --as-of <ISO-8601 timestamp>
```

Candidate validation reuses `schemas/epic-k-evidence-receipts.schema.json` and `verifyEvidence`. It additionally rejects missing owner identity, unsupported roles, missing subject scope, absent provenance digest, invalid collection or validity data, missing mandatory assertions, duplicate or conflicting evidence, synthetic authority claims, repository observations presented as approvals, expired or unconfirmed Epic E/F evidence, unverified values, and checkout or payment inferences.

## Human submission readiness

Each request now states the authority roles, exact required facts, scope, acceptable sources, provenance, validity, sanitization, repository context, and facts that only a human authority can provide. Human authorities can prepare sanitized candidate receipt sets for validation. A passing candidate remains subject to authoritative review and explicit attachment; the validator never writes to the accepted receipt register.

## Preserved authority and history

- All 24 mapping definitions remain Product Owner accepted in source mapping version `1.2.0`.
- Approved Epic K business decisions remain authoritative and were not reopened.
- Eleven source mapping evidence limitations remain.
- `data/epic-k-evidence-receipts.json` remains empty.
- `data/epic-k-evidence-gap-report.json` retains eight blocked requirements.
- The October 24 snapshot, provenance, drift report, K1B-03A proposal/projection, and K1B-03B receipt are unchanged.
- K1B-03A remains proposal only.
- Operational readiness remains `BLOCKED`; checkout enforcement remains `UNVERIFIED`.
- No Shopify access, mutation, external contact, order, payment, theme operation, evidence renewal, or new `K-DEC-*` decision occurred.

## Status

The repository can systematically request all eight evidence packages and reject invalid submission candidates. Receipt acquisition and authoritative acceptance remain external work. `K-PBI-002` remains partial.
