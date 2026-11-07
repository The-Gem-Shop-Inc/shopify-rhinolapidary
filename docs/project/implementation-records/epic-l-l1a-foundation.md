# Epic L L1A repository foundation implementation record

**Prepared:** 2026-11-07

**Branch:** `epic-k/k1d02p-provision-quotation-infrastructure`

**HEAD:** `ef76e02aa023616b0f7e70ed05f59f9bd16b4cf3`

**Authorization boundary:** repository contracts, schemas, validators, deterministic fixtures, sanitized reporting, and scoped tracker updates only

**Shopify Admin audit:** not authorized and not executed

**Customer data:** none collected or created

**Customer-facing change, publication, deployment, commit, or push:** none

## Outcome

L1A implements a fail-closed repository foundation for L-PBI-001 and prepares, without approving, the decision and audit artifacts required by L-PBI-002 through L-PBI-005. The contracts reuse Epic E Product/Variant, machine, compatibility, and resource identities plus Epic K operational evidence. They do not create a competing identity registry.

Only L-PBI-001 is now `Implemented, awaiting verification`. Product Owner acceptance of the authority hierarchy and named owners remains outstanding. L-PBI-002, L-PBI-003, L-PBI-004, and L-PBI-005 remain incomplete.

## Artifacts

| Area | Data/plan | Schema |
|---|---|---|
| Authority and current state | `data/epic-l-authority-evidence.json` | `schemas/epic-l-authority-evidence.schema.json` |
| Warranty preparation | `data/epic-l-warranty-decision-packet.json` | `schemas/epic-l-warranty-decision-packet.schema.json` |
| Service/repair preparation | `data/epic-l-service-decision-packet.json` | `schemas/epic-l-service-decision-packet.schema.json` |
| Privacy/data-flow preparation | `data/epic-l-privacy-data-contract.json` | `schemas/epic-l-privacy-data-contract.schema.json` |
| Read-only Admin audit preparation | `data/epic-l-admin-audit-plan.json` | `schemas/epic-l-admin-audit-plan.schema.json` |

Validation is implemented in `scripts/validate-epic-l-l1a.js`; deterministic fixtures are in `scripts/test-epic-l-l1a.js`. `package.json` registers `validate:epic-l-l1a` and `test:epic-l-l1a`. The Epic L tracker, decision/dependency register, and proposed backlog registry contain scoped L1A state updates.

## PBI coverage and remaining acceptance

### L-PBI-001

Implemented repository acceptance:

- 12 authority domains identify responsible role classes, source identity/revision/observation, approval evidence, freshness, dependencies, and a disabled public-claim gate.
- Observed, proposed, approved, implemented, verified, released, and retired states are distinct from evidence states.
- Missing, conflicting, stale, expired, and revoked evidence fails closed.
- Existing Epic E/F/G/K identities and evidence contracts are referenced rather than duplicated.
- The read-only audit plan is deterministic and rejects write operations, unsafe evidence, identity mismatch, incomplete pagination, and missing evidence.

Remaining verification: Product Owner acceptance of the source hierarchy and assignment of accountable individuals for the named role classes; any fresh Admin/current-state observation requires separate authorization.

### L-PBI-002

Prepared but not approved:

- 15 warranty decision slots cover issuer, administrator, manufacturer/seller roles, scope, trigger, duration, effective dates, remedies, exclusions, transferability, geography, proof, registration effect, transport responsibility, and supersession/review.
- The packet has zero approved policy versions and zero Product mappings.
- Business, Legal, Product Data, Support, and Product Owner approvals are all `missing`.
- Historical text is explicitly not approved. Unmapped Products remain blocked from customer claims.

### L-PBI-003

Prepared but not approved:

- Nine lifecycle states and 18 responsibility decisions cover intake through recovery, pricing/authorization/communication, shipment, packaging, insurance, loss/damage, and carrier claims.
- Every operational value and lifecycle owner/rule/message/recovery path remains unresolved.
- Support, Operations, Finance, Legal, and Product Owner approvals are all `missing`.
- Repair-shipment claims are explicitly bound to `K-EVID-007`; `data/epic-k-evidence-receipts.json` still has zero receipts, so the binding remains `missing`.

### L-PBI-004

Prepared but not approved:

- Twelve proposed data elements and four proposed flows are inventoried.
- Collection is unauthorized and no private record or customer datum exists in the artifact.
- Purpose, necessity, processor, owner, access, retention, deletion/export, and recovery remain unresolved for every element.
- Privacy, Security, Legal, Support Operations, and Product Owner approvals are all `missing`.

### L-PBI-005

Preparation ready for Product Owner review; audit not performed:

- Twelve planned operations cover permissions, shop/account/plan identity, Pages, Files, policies, applications, themes, app embeds, Forms, Flow, Inbox, and Messaging.
- GraphQL operations are queries only; manual operations have exact read-only Admin paths and prohibition rules.
- Required permissions, identity checks, pagination, redaction, evidence fields, and failure dispositions are explicit.
- API version and query fields must be reverified against current official Shopify documentation immediately before any separately authorized execution.
- No connected query, Admin login, app review, or manual observation occurred in L1A.

## Automated acceptance

`npm run validate:epic-l-l1a` passed:

- 5 schemas
- 12 authority domains
- 15 warranty decisions
- 9 service lifecycle states
- 18 service responsibilities
- 12 privacy data elements
- 12 planned audit operations

`npm run test:epic-l-l1a` passed 26 deterministic scenarios:

- 1 valid unresolved baseline
- 21 artifact rejection fixtures
- 3 audit-result rejection fixtures
- 1 valid synthetic audit-result shape fixture

The negative fixtures reject missing/conflicting/expired/revoked authority, stale observations, unapproved durations and universal coverage, invalid Product/Variant/policy mappings, overlapping mappings, missing service responsibility, repair-shipment claims without accepted `K-EVID-007`, incomplete private-data decisions, secrets/serials/order identifiers/contact data in evidence, Shopify writes/mutations, incomplete pagination, missing audit evidence, and wrong-store identity.

All audit-result fixtures are synthetic shapes. They are not Shopify observations.

## Validation results

| Command | Result | Disposition |
|---|---|---|
| `npm run validate:epic-l-planning` | Pass: 28 PBIs / 6 batches | L1A statuses remain planning-safe |
| `npm run validate:epic-l-l1a` | Pass | Includes sanitized evidence scan |
| `npm run test:epic-l-l1a` | Pass | 26 deterministic scenarios |
| `npm run validate:epic-k-evidence` | Pass with explicit blocked state | 8 requirements blocked; live compliance unverified |
| `npm run validate:epic-k-evidence-intake` | Pass with explicit blocked state | 8/8 requirements blocked; zero receipts |
| `npm run validate:metafields` | Pass | 41 metafields, 1 metaobject, no authorized mutation |
| `npm run validate:brand-claims` | Pass | 16 claims; 332 files scanned |
| `npm run validate:footer-support` | Pass | 19 resources; 4 safe for global navigation |
| `npm run validate:navigation` | Pass | 31 routes; 3 rendered customer paths |
| Scoped Git whitespace check | Pass | 17 L1A files checked, including no-index checks for untracked artifacts |
| Sanitized evidence scan | Pass | No secrets, private order/customer GIDs, email addresses, or serial-like values in L1A evidence/report artifacts |
| Full `git diff --check` | Known unrelated failure | Pre-existing trailing whitespace at `docs/project/implementation-records/j-pbi-008-technical-acceptance-review.md:3`; unrelated line-ending warning for `docs/apps/app-block-surface-audit.md` |
| `npm run validate:epic-f-support-resources` | Known unrelated failure | `locales/en.default.json` actual hash `7f91e320...` differs from sealed expected `1c9b35a4...`; gate was not weakened |
| `npm run validate:theme-repository` | Known unrelated failure | Four tracked Epic F `.log` files violate repository policy; files were not changed or removed |

The npm warning about the unknown `min-release-age` configuration is environmental and did not change command outcomes.

## Owners and decisions still required

No individual decision owner is named in approved evidence. The Product Owner must assign accountable individuals for:

- Business and Legal warranty authority
- Product Data mapping authority
- Support policy and operating ownership
- Operations/Shipping responsibility, including `K-EVID-007`
- Finance pricing responsibility
- Technical and Safety diagnostic/packaging authority
- Privacy and Security lifecycle authority
- Shopify Admin/Engineering audit execution
- Product Owner approval and release acceptance

No warranty issuer, administrator, duration, coverage, remedy, exclusion, geography, proof rule, registration effect, or Product applicability is approved. No service eligibility, price, turnaround, repair authorization, shipment responsibility, insurance, loss/damage, or claim-filing rule is approved. No processor, access rule, retention period, deletion/export path, or recovery owner is approved.

## Architecture observations and backlog refinements

- L-PBI-005 should preserve two evidence gates: plan readiness and separately authorized execution. The prepared plan does not satisfy the current-state audit acceptance criteria.
- Forms, Flow, Inbox, app-embed, and Messaging configuration require bounded read-only Admin review; generic Admin GraphQL alone is not treated as proof of those configurations.
- L-PBI-002 should continue using exact Epic E Product/Variant GIDs. It must not create warranty classes or mappings from titles, handles, historical filenames, or family inference.
- L-PBI-003 cannot approve repair shipment or carrier-claim language until `K-EVID-007` has an accepted receipt.
- L-PBI-004 should remain a prerequisite to architecture selection. A processor or retention period must not be selected merely to fill the contract.
- The Epic F locale binding and tracked-log policy conflicts need additive repair outside L1A; neither gate should be weakened.

## Recommended L1B handoff

1. Product Owner reviews the authority hierarchy and assigns accountable individuals to the unresolved role classes.
2. Business/Legal/Product Data/Support complete only evidenced warranty fields and exact mappings; unresolved fields stay null.
3. Support/Operations/Finance/Legal complete the service lifecycle and coordinate an authoritative `K-EVID-007` receipt without changing Epic K configuration.
4. Privacy/Security/Legal/Support decide minimum data, processors, access, retention, deletion/export, and recovery before any intake implementation.
5. If desired, authorize the exact read-only Admin audit as a separate bounded action. Revalidate the API plan first, verify store identity before retaining evidence, execute complete pagination, and record inaccessible capabilities as failures—not empty successes.
6. Re-run L1A, planning, Epic K, metafield, brand, footer, and navigation gates. Preserve the known Epic F and repository-log failures until separately reconciled.

Do not begin customer-facing Epic L work, collect customer data, configure Shopify, install an app, publish, deploy, commit, or push as part of this handoff.
