# Remaining owner answers after the completed worksheet

The completed answers are retained. Only the questions below need another answer; unknown/defer is acceptable and keeps the corresponding fact hidden. These lanes can be answered independently.

## Technical / measurements — Kevin or Vejdi, with Operations for physical measurements

| Product | Remaining answer | Response |
|---|---|---|
| EM-1 | Input frequency in Hz. No frequency was supplied. | ___ / unknown |
| EM-1 | Exact rated primary-motor rpm, if known. The approved “≤5000” bound cannot populate an exact scalar. It is separate from the approved wheel and flexible-shaft ranges. | ___ / unknown |
| EM-1 | Does the stated 3.5 gal reservoir mean U.S. liquid gallons? | Yes / other convention: ___ / unknown |
| EM-1 | Does water return to the reservoir through filtration and circulate again? “Reservoir filtration with adjustable outlets” alone does not establish the existing recirculating/filtered vocabulary. | Yes, describe: ___ / no, describe: ___ / unknown |
| SawMaster 18 and SawMaster 24 | Current manufacturer-nameplate horsepower for each exact machine, if independently known. The answered 1.8 kW is retained as evidence, with no conversion to hp. | 18: ___ hp; 24: ___ hp / unknown |
| SawMaster 18 and SawMaster 24 | Minimum supported nominal blade diameter, if the customer-facing range is desired. The approved 18 in / 24 in maxima are stored; no minimum was answered. | 18: ___ in; 24: ___ in / unknown |
| LapMaster 18 | For the answered NET 105 lb, what fluid-fill state and installed accessories were included? Keep the separate 200 lb packing/shipping observation separate. | ___ / unknown |
| SawMaster 36 | The first dimension is corrected to 72 in. Identify its axis, the other assembled length/width/height axes and included assemblies. | ___ / unknown |
| Other unanswered assembled dimensions | Supply only values important to customers, with explicit length/width/height axes and included assemblies/accessories. Existing source candidates remain in the original technical packet. | ___ / defer |
| Crated measurements | Operations: explicitly identify packed/crated state, length/width/height axes, included items and packing revision. These dimensions are Admin-only. | ___ / defer |

No native Variant shipping-weight decision is requested or executed here. Remaining fields in the original packet are still unapproved; there is no requirement to answer every machine/field before an exact supported row can activate.

## EM-1 box contents — quantities only

The 80-grit exact catalog candidate and the prior checklist's inclusion decisions are retained. Moss Filtration Pads have an explicit approved quantity of **2**, already activated. For the other **20 included lines**, enter a positive integer quantity or unknown in the existing BOM packet. Do not re-answer inclusion merely to establish quantity. A numeral in an old candidate label is not a new quantity approval.

Reference: `data/epic-e-completed-owner-responses.json` → `contents`; friendly checklist: `docs/project/epic-f-007b-bom-owner-review.md`.

Optional variable-speed contents and merchandising recommendations remain separate unanswered lanes. Their approval cannot be inferred from technical compatibility or included status.

## Saw Vice Plate Set — smallest catalog identity decision

Current combined Product: **gid://shopify/Product/8905784099013**. The worksheet confirms two physically different sets, so neither fit edge is approved for this combined identity.

1. Select which exact physical set keeps the current Product GID: SawMaster 18 / SawMaster 24 / neither (retain as non-selling legacy record).
2. Authorize a separate Product identity for the other set, with its exact SKU/part identity, title, selling/publication state, Variant/inventory and existing-media association reviewed separately.
3. Confirm the exact Product-GID → machine-GID mapping after the split. Then approve only those directed fit edges and reconcile E-MUT-034.

No split, Product creation, assignment change or speculative fit edge occurs in this task. The Automatic Feed Clamp identity is already resolved as one physical Product fitting both machines; no clamp split is needed.

## Files & Media worksheet — independent publication decision

Keep the four duplicate-document choices (LapMaster 12.pdf, LapMaster 18.pdf, BeadMaster.pdf, TrimMaster.pdf) and the two video equivalences (003=004; 017=018). They approve duplicate identity only. The Files & Media worksheet must still answer publication rights, language, current-version suitability, canonical resource activation and intended Product association. Video equivalence does not select a canonical video or authorize immediate provider loading.

## Abrasive grit — ready handoff

Owner policy is CAMI, manufacturer's printed grit number, and every included grit value for mixed-grit packs. Preserve this evidence for the owning Epic E grit work. No approved abrasive-grit Product definition/value migration is added to this bounded machine activation.

## Refresh / execution handoff

Ingest only explicit answers; validate exact Product/field/type/unit and range/measurement state; generate only exact owning-plan rows; perform a fresh before-read and compare-before-write; preserve receipts; after-read and reconcile protected state; compile only public-readable, reconciled customer grants. Unknown rows remain hidden. Native measurement-unit enum casing is normalized without unit conversion.

The current compiled release intentionally expires with its reconciliation freshness window. Refresh from a new complete Admin read and verify protected state before recompiling/redeploying a renewal. Never extend freshness merely by editing a timestamp. Existing photos and F-DEC-002-DEV stay unchanged. Performance remains a parked release gate; final signoff is not authorized by these factual answers.
