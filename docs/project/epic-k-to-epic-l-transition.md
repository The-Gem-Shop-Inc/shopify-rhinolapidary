# Epic K to Epic L transition record

**Prepared:** 2026-11-05
**Repository baseline:** `ef76e02aa023616b0f7e70ed05f59f9bd16b4cf3` on `epic-k/k1d02p-provision-quotation-infrastructure`
**Disposition:** K1D-04 production deployment is externally reported and locally packaged, but repository release evidence is not reconciled; Epic K is not closed.

## Verified and reported K1D-04 state

The Product Owner supplied the following production facts for the November 5, 2026 K1D-04 selective release to MAIN theme `158579622085`:

- Product Owner and Software Developer authorized the deployment;
- all 11 approved files were read back;
- eight JavaScript/CSS/Liquid files matched exact hashes;
- three JSON files matched semantically;
- `rhino_quote_draft_automation_enabled` read back as `true`;
- unrelated theme settings were preserved;
- shipping configuration had zero shipping methods/rates and retained Grafton pickup;
- the internal technical explanation was absent after a refreshed cart and a fresh server response.

This transition record treats those facts as Product Owner-provided release evidence. They are not independently reproduced by the repository validator in this session.

The local archive named by the Product Owner exists at `%LOCALAPPDATA%\RhinoLapidary\Releases\k1d04-20261105-173203`. It contains:

- `preparation.json` with the 11 candidate paths and candidate hashes;
- six exact pre-release backups for files that existed before release;
- 11 candidate files;
- rollback lists for six restores and five deletions.

`preparation.json` says `productionMutationPerformed: false`, which is correct for package preparation but cannot serve as the later deployment record.

## Committed evidence that predates deployment

Commit `9d7acf28686fd03dc813b9b688629552e9d0ab85` closed release-readiness gates and `ef76e02aa023616b0f7e70ed05f59f9bd16b4cf3` removed customer-visible internal fallback language from the candidate. The committed evidence covers:

- canonical store and theme identities;
- two delivery profiles, three zones, 125 assigned Variants, one active US Market, zero configured discounts, and zero methods/participants/rate definitions at the recorded read;
- representative accessory/machine/mixed/Alaska/Canada checkout enforcement;
- Grafton pickup behavior;
- exact candidate/rollback preparation;
- K1D backend, app proxy, D1 idempotency, controlled Draft Orders `#D2`/`#D3`, and preview storefront acceptance.

Those are valid readiness and earlier acceptance records. They do not record the later MAIN deployment.

## Missing repository release records

The repository currently lacks a committed, source-bound K1D-04 execution packet containing:

1. the exact authorization statement, approvers, timestamp, scope, and confirmation that no broader mutation was authorized;
2. the same-window connected Admin refresh required by K1D04-A02;
3. the immediate pre-deploy MAIN pull, existing-file hashes, and five prior-absence checks required by K1D04-A03;
4. the second-person candidate/destination/rollback verification required by K1D04-A04;
5. deployment start/end timestamps, operator, exact selective command/result, target store/theme, and uploaded path list;
6. post-deploy readback for all 11 files, distinguishing eight exact byte hashes from three semantic JSON comparisons;
7. the semantic comparison method/results for `locales/en.default.json`, `config/settings_schema.json`, and `config/settings_data.json`;
8. readback proving `current.rhino_quote_draft_automation_enabled=true` and preservation of unrelated settings;
9. fresh post-release shipping configuration evidence showing zero methods/rates and retained Grafton pickup;
10. refreshed-cart and fresh-server evidence proving the internal explanation is absent;
11. a production smoke/recovery result, rollback-not-triggered statement, and any monitoring window/incident outcome;
12. the final deployed commit/manifest binding and reconciliation of candidate hashes that differ from the earlier manifest's pre-merge expectations.

The local archive contains preparation, backup, and candidate material only; it does not contain these execution/readback records. Do not fabricate them from file timestamps or the Product Owner summary.

## Safe reconciliation recommendation

Create a dedicated K1D-04 production execution record and a machine-readable sanitized deployment receipt from the actual operator logs/readbacks. Update, in one narrowly reviewed change:

- `docs/rhino-lapidary-pbi-tracker-epic-k.md`;
- `data/epic-k-k1d04p-release-readiness.json` or a successor immutable release receipt;
- `data/epic-k-k1d04p-release-manifest.json` only through a clearly versioned post-release successor, not by rewriting historical preparation facts;
- `docs/project/implementation-records/epic-k1d04p-production-release-readiness.md` with an addendum or a separate execution record;
- `scripts/validate-epic-k-k1d04.js` and focused tests so they validate both historical preparation and the real execution receipt instead of asserting zero production mutations forever.

Copy only sanitized evidence into the repository. Keep credentials, authenticated URLs, customer data, and raw secrets out. Preserve the local backup archive unchanged. The reconciliation commit must exclude the unrelated Epic J/K screenshot work already present in the tree.

## Outstanding Epic K operational evidence

`npm run validate:epic-k-evidence` and `npm run validate:epic-k-evidence-intake` pass structurally but report zero receipts and 8/8 requirements blocked.

| Evidence | Current repository state | Why production deployment does not close it | Epic L relationship |
|---|---|---|---|
| K-EVID-001 | Blocked | Checkout observation does not replace explicit owner-approved Product/Variant pickup eligibility and effective period. | L may expose support guidance only after E/F/Grafton owners approve it. |
| K-EVID-002 | Blocked | An active pickup location does not establish location readiness, inventory ownership, or operating procedure. | L needs the customer escalation/contact interface but does not own inventory operations. |
| K-EVID-003 | Blocked | Zero payable rates do not establish packed weights, package counts/dimensions, or measurement inclusions. | Repair shipment guidance must not reuse unknown outbound package facts. |
| K-EVID-004 | Blocked | Zero configured rates is enforcement evidence, not an approved future paid service/region/product policy. | Service/repair shipping promises remain blocked. |
| K-EVID-005 | Blocked | No Alaska/Hawaii rate is not approval to invoice or promise service. | L must not promise repair shipment eligibility. |
| K-EVID-006 | Blocked | The quote form can ask about insurance, but carrier option/cost/applicability evidence is absent. | L repair intake must not promise coverage. |
| K-EVID-007 | Blocked | No accepted receipt establishes the Rhino contact process, carrier filing responsibility, or internal delivery-claims process. | Direct Epic L dependency; resolve in L-PBI-003 and support routing work. |
| K-EVID-008 | Blocked | Draft automation exists, but named operational approval, exact cart/destination scope, insurance selection, and expiration remain absent. | L service workflows should reuse the approval/audit pattern, not the quote payload. |

All provisional K decisions remain provisional unless separately approved. Production code activation does not approve carrier, packaging, insurance, response-time, claims, or repair-shipment policy.

## Epic K closure disposition

Epic K closure is **not supported** at this time.

Supported statements:

- K1D-01 through K1D-03A have substantial committed implementation and acceptance evidence.
- K1D-04 readiness gates were committed.
- K1D-04 production deployment is reported as authorized and verified by the Product Owner, with the local package/backup archive present.
- Current production enforcement reportedly has no payable shipping methods/rates and preserves Grafton pickup.

Unsupported closure statements:

- the repository has a complete committed production release receipt;
- `scripts/validate-epic-k-k1d04.js` validates the deployed state;
- K-PBI-002 is complete;
- K-EVID-001 through K-EVID-008 are accepted;
- operational carrier/packaging/insurance/claims procedures are approved;
- all customer-experience and monitoring evidence is committed.

Epic L may begin repository-only planning while K evidence remains open. L must explicitly inherit K-EVID-007 and the repair-shipment policy dependency without changing production shipping configuration.
