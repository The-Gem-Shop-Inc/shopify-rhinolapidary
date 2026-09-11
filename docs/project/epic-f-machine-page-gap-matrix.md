# Epic F — current machine inventory and module gap matrix

**Observed:** 2026-09-10, current targeted Admin reads plus unpublished preview 158631198917. All 11 Products were selected from approved Epic E classification. This is not a complete Epic E execution snapshot.

Exact Product/Variant/media IDs, native weights, options, raw evidence links and source times are in the [JSON inventory](epic-f-machine-inventory.json). Current native values are observations; historical CSV failures and human approvals remain unchanged.

## Current machine inventory

| Machine / route handle | Status / publication | Template | Native price amount | Customer route | Purchase control | Media / blank alt |
|---|---|---|---:|---|---|---|
| BeadMaster 6" / `beadmaster` | ACTIVE / published | default product | 2350.00 | 200 at all three widths | Sold out | 1 / 1 |
| EM-1 Machine / `em-1` | ACTIVE / published | default product | 4000.00 | 200 at all three widths | Sold out | 1 / 1 |
| JadeMaster, 14" / `jademaster` | ACTIVE / unpublished | default product | 2495.00 | 404 at all three widths | None — 404 | 1 / 1 |
| LapMaster 12" / `lapmaster-12` | ACTIVE / published | default product | 1650.00 | 200 at all three widths | Add to cart | 1 / 1 |
| LapMaster 18" / `lapmaster-18` | ACTIVE / published | default product | 2850.00 | 200 at all three widths | Add to cart | 1 / 1 |
| SawMaster 18" / `sawmaster-18` | ACTIVE / published | default product | 5250.00 | 200 at all three widths | Sold out | 1 / 1 |
| SawMaster 24" / `sawmaster-24` | ACTIVE / published | default product | 6600.00 | 200 at all three widths | Sold out | 1 / 1 |
| SawMaster, 36" / `sawmaster-36` | DRAFT / unpublished | default product | 11950.00 | 404 at all three widths | None — 404 | 1 / 1 |
| ShapeMaster 6" / `shapemaster` | ACTIVE / published | default product | 2750.00 | 200 at all three widths | Sold out | 1 / 1 |
| TrimMaster / `trimmaster` | ACTIVE / published | default product | 1150.00 | 200 at all three widths | Sold out | 1 / 1 |
| TumbleMaster / `tumblemaster` | DRAFT / unpublished | default product | 0.00 | 404 at all three widths | None — 404 | 0 / 0 |

Published preview prices render USD. All Products have one Default Title Variant, blank native SKU/barcode, Vendor Rhino Lapidary, Uncategorized Category and no Product metafield values. JadeMaster is currently 2495 in Admin; its old CSV zero-price failure is deliberately retained. All native Variant inventory policies are DENY; LapMaster 12/18 are untracked. Admin availableForSale alone differs from customer orderability and is not used to enable a button.

## Per-machine module readiness

**B** = approved E architecture but Product values blocked/unmigrated; not safe to render. **P** = proposed/incomplete handling contract and assignments. **R** = no approved canonical resource mapping (a published manual Page is a separate route fact). **S** = native shell possible, but current unsafe copy/media remains cleanup work.

| Machine | Media | Technical/electrical | Measurements | Components | Compatibility | Fulfillment/pickup | Warranty | Resources | Main blocker | Safe interim |
|---|---|---|---|---|---|---|---|---|---|---|
| BeadMaster 6" | 1 image; alt/rights/model review | B | B | B | B | P | B | R | Value/claim approvals and migration | S; omit blocked modules; native Sold out |
| EM-1 Machine | 1 image; alt/rights/model review | B | B | B / C-040 | B | P | B | R | Value/claim approvals and migration | S; omit blocked modules; native Sold out |
| JadeMaster, 14" | 1 image; alt/rights/model review | B | B | B | B | P | B | R | Publication/commercial readiness; no public route | Keep unavailable; internal fixtures only |
| LapMaster 12" | 1 image; alt/rights/model review | B | B | B | B | P | B | R | Value/claim approvals and migration | S; omit blocked modules; native Add to cart |
| LapMaster 18" | 1 image; alt/rights/model review | B | B | B | B | P | B | R | Value/claim approvals and migration | S; omit blocked modules; native Add to cart |
| SawMaster 18" | 1 image; alt/rights/model review | B | B | B | B | P | B | R | Value/claim approvals and migration | S; omit blocked modules; native Sold out |
| SawMaster 24" | 1 image; alt/rights/model review | B | B | B | B | P | B | R | Value/claim approvals and migration | S; omit blocked modules; native Sold out |
| SawMaster, 36" | 1 image; alt/rights/model review | B | B | B | B | P | B | R | Publication/commercial readiness; no public route | Keep unavailable; internal fixtures only |
| ShapeMaster 6" | 1 image; alt/rights/model review | B | B | B | B | P | B | R | Value/claim approvals and migration | S; omit blocked modules; native Sold out |
| TrimMaster | 1 image; alt/rights/model review | B | B | B | B | P | B | R | Value/claim approvals and migration | S; omit blocked modules; native Sold out |
| TumbleMaster | Missing | B | B | B | B | P | B | R | Publication/commercial readiness; no public route | Keep unavailable; internal fixtures only |

Availability/timing: all rows retain B3C-D04. Six published native sold-out states must remain disabled; enabled LapMaster buttons do not establish delivery timing. No machine-family linkage or issued Rhino SKU is ready for customer use. Native shipping weights stay native: positive observations are not approved net/crate/packing weights or corrections.

## Per-machine media review

| Machine | Current visual evidence and gaps |
|---|---|
| BeadMaster 6" | One front/oblique image shows the working area and staged beads; no rear, connection, scale or in-use sequence. Visible marking is not certification evidence. |
| EM-1 Machine | One front image shows wheels/light/magnifier; patent wording is embedded on the machine label. Does not establish the included attachment list; replacement/detail photography requires review. |
| JadeMaster, 14" | One internal source image; unpublished page cannot demonstrate customer crop/gallery behavior. Exact model and rights review precede any release. |
| LapMaster 12" | One oblique top/front image of the lap/control assembly; no rear/power, scale, accessories or packaging views. |
| LapMaster 18" | One front/top image shows the lap and tall control box; small-screen controls/labels need detail images. No dimensions or contents inferred. |
| SawMaster 18" | One open-lid view with a blade; near-identical composition to the other saw image. No closed-lid, clamp/control detail, setup or packing coverage. Blade inclusion remains unapproved. |
| SawMaster 24" | One open-lid image; exact same image GID also attached to draft SawMaster 36. Requires exact-model review, not a filename/size inference. |
| SawMaster, 36" | Draft Product reuses SawMaster 24 image GID. No verified distinct model photography or customer route; do not expose or invent a replacement image. |
| ShapeMaster 6" | One front/oblique image shows mechanism and control housing. No approved accessory layout, scale, connection or operator views. |
| TrimMaster | One front/oblique image stages a stone and blade; no proof those are included. Certification marking is visible; no certification claim is approved. |
| TumbleMaster | No Product media or current customer route. Technical/commercial/price gates remain unresolved; decorative filler is prohibited. |

EM-1 image: 2489×2189. Other attached images: 1440×1440. Nine unique GIDs across ten attachments; SawMaster 24/36 share a GID. Each published gallery has only one image, no Product video, and missing alt. No runtime crop behavior is certified for unpublished Products. Exact-model/rights review and the existing B-018 shot list govern additions.

## Module decision mapping

| Domain | Existing decision dependencies |
|---|---|
| technical | B3B-D03 |
| measurements | B3B-D05 |
| components | B3B-D04 |
| compatibility | B3B-D02, PO-E-012, PO-E-013 |
| fulfillment | B3C-D01, B3C-D02 |
| warranty | B3C-D03 |
| resources | B3B-D06 |
| timing | B3C-D04 |

Do not ask reviewers to repeat these decisions. Use the [existing E handoff](epic-e-deferred-decision-handoff.md). New/narrow F display/media questions and P/U ownership dependencies are in the [F decision packet](epic-f-decision-packet.md).
