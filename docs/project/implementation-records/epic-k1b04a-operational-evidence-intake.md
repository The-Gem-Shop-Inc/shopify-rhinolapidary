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

The intake validator checks the manifest, its requirements fingerprint, the generated report, the current authoritative receipt register through `verifyEvidence`, mapping design acceptance, and authority boundaries. Manifest version `1.1.0` preserves the October 24 empty-register and eight-blocked preparation state as a historical fingerprint without requiring the reusable request manifest to remain permanently coupled to an empty register:

```powershell
npm run validate:epic-k-evidence-intake
```

A sanitized candidate receipt set can be checked without attaching it:

```powershell
npm run validate:epic-k-evidence-intake -- --submission <sanitized-candidate.json> --as-of <ISO-8601 timestamp>
```

Candidate validation reuses `schemas/epic-k-evidence-receipts.schema.json` and `verifyEvidence`. It additionally rejects missing owner identity, unsupported roles, missing subject scope, absent provenance digest, invalid collection or validity data, missing mandatory assertions, duplicate or conflicting evidence, synthetic authority claims, repository observations presented as approvals, expired or unconfirmed Epic E/F evidence, unverified values, and checkout or payment inferences.

## K1B-04A-R corrections

Requirement-specific semantic checks now enforce the meaning of the submitted values:

- `K-EVID-003` requires a finite positive packed weight, a positive integer package count, one complete positive length-by-width-by-height set per package, recognized weight and dimension units, a nonplaceholder inclusion description, and Product plus Variant identity. Shopify Variant weight remains insufficient.
- `K-EVID-005` requires separate positive numeric Alaska and Hawaii charges, explicit currency, explicit state-specific service availability, and distinct state approval references. Numeric strings, zero amounts, and a single general approval reference fail.
- `K-EVID-006` permits a documented numeric zero insurance cost while rejecting absent, unknown, string, and negative costs. Currency, coverage option, applicable service, selection acceptance, artifact reference, and source digest remain required.
- `K-EVID-001` accepts an explicit `false` eligibility assertion as evidence of ineligibility while keeping ordinary pickup unauthorized.

Candidate output now separates structural and semantic validation from source authenticity, departmental acceptance, authoritative-register attachment, operational readiness, and live checkout enforcement. A self-declared `verificationStatus: accepted` can satisfy the bounded candidate comparison, but source authenticity and departmental acceptance remain `UNVERIFIED`, register attachment remains `NOT_ATTACHED`, operational readiness remains `BLOCKED`, and checkout enforcement remains `UNVERIFIED`.

Reusable manifest validation no longer requires the live receipt register to contain zero entries. A future valid partial register can coexist with the same eight requests. `verifyEvidence` still rejects expired, conflicting, duplicate, unsupported, and incorrectly scoped receipts, and every evaluation requires an explicit assessment timestamp. The committed October 24 receipt register remains empty and all eight current requirements remain blocked.

Focused regression coverage contains 53 deterministic cases, including numeric zero and string bypasses, package completeness and unit validation, state-specific rates and services, documented zero-cost insurance, candidate authority boundaries, explicit pickup ineligibility, future partial receipt registers, and expired or conflicting future receipts.

## K1B-04A-R verification

All requested commands completed with exit code `0` on October 24, 2026.

| Command | Result |
|---|---|
| `npm run test:epic-k-evidence-intake` | 53/53 tests passed |
| `npm run validate:epic-k-evidence-intake` | 8 requests valid; current 8/8 requirements blocked; 0 register entries |
| `npm run generate:epic-k-evidence-requests` | 8 requests generated; 0 accepted receipts created |
| `npm run test:epic-k-evidence` | 62/62 tests passed |
| `npm run validate:epic-k-evidence` | Contracts valid; 8 requirements blocked; checkout unverified |
| `npm run test:epic-k-mapping-acceptance` | 31/31 tests passed |
| `npm run validate:epic-k-mapping-acceptance` | 24 definitions accepted; 11 evidence limitations retained |
| `npm run validate:epic-k-k1b02` | Policy 73/73, evidence 62/62, and collector 43/43 nested tests passed |
| `npm run validate:epic-k-k1b01` | Policy 73/73 and evidence 62/62 nested tests passed |
| `npm run validate:epic-k-k1a` | Policy 73/73 tests passed |
| `npm run validate:epic-k-remediation-preflight` | 2 proposal-only candidates valid; 0 Shopify operations |
| `npm run validate:registers` | All registered JSON contracts valid |
| `npm run validate:cart-config` | Cart configuration valid |
| `npm run validate:product-purchase` | Product purchase architecture valid |
| `npm run validate:theme-architecture` | Navigation, 102 design tokens, CSS, one storefront event, and Rhino sections valid |

## Human submission readiness

Each request states the authority roles, exact required facts, scope, acceptable sources, provenance, validity, sanitization, repository context, and facts that only a human authority can provide. Human authorities can prepare sanitized candidate receipt sets for validation. A passing candidate remains subject to source authentication, departmental acceptance, and explicit attachment; the validator never writes to the accepted receipt register.

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
