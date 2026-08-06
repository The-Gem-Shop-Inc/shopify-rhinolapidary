# Rhino Product Terminology Source Audit

**PBI:** B-022 - Define product naming and technical terminology rules  
**Generated from:** repository source audit  
**Audit date:** 2026-07-31  
**Status:** Source audit complete; approval decisions below remain business or technical decisions where noted.

## Scope

This audit covers recognized Rhino machine families and models found in the repository source set, the current Shopify product export, and the supplied brand and policy evidence. It does not rename Shopify products, does not edit handles, and does not alter specification documents.

The audit inspected 46 repository source documents:

- 36 machine specification, part-list, exploded-picture, dimension, pallet, and pamphlet documents in `docs/product/`
- 1 current Shopify export: `data/product-export/products.csv`
- 5 required B-022 control sources: `docs/brand/rhino-product-naming-and-terminology.md`, `docs/brand/rhino-brand-positioning.md`, `docs/brand/rhino-identity-architecture.md`, `docs/architecture/metafield-metaobject-architecture.md`, and `data/product-data-rules.json`
- 2 brand governance and evidence sources: `docs/brand/rhino-brand-evidence-inventory.md` and `docs/brand/brand-governance-and-approval-workflow.md`
- 2 approved product or policy evidence files outside `docs/product/`: `docs/brand/Rhino_Lapidary_EM-1_copy.jpg` and `docs/policy/Rhino Lapidary Policies - Warranty, Shipping, Returns.pdf`

## Source Hierarchy

1. Machine dimension PDFs are the strongest source for exact customer-facing machine family/type/size labels because they are machine-specific technical drawings with explicit title blocks.
2. Part-list and Turkish-English part-list workbooks are the strongest source for motors, voltage options, speeds, blade/wheel components, part identifiers, and machine-internal names.
3. `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx` is the strongest source for shipping dimensions, crate dimensions, weights, and tank capacities only.
4. `docs/product/Rhino_EM-1_Pamphlet.pdf` and `docs/brand/Rhino_Lapidary_EM-1_copy.jpg` are product evidence for EM-1 marketing language and visible machine-label facts, but they are not structured engineering specification sheets.
5. `data/product-export/products.csv` is current catalog evidence, not a stronger technical source than a machine drawing or part list.
6. Brand and policy documents control approval and claim usage. They do not create machine specifications.

## Naming Rules Applied

- Proposed customer titles follow the B-022 pattern `Rhino {model/family} {size}: {machine type}` where source evidence supports the size and machine type.
- Units are normalized for proposed titles and descriptors: `6 in`, `110 V`, `60 Hz`, `1400 rpm`, `0.55 kW`, and `1 hp`.
- Numeric descriptors in proposed machine titles are used only when the size appears in a repository source.
- Marketing phrases are separated from official names. `Everything Machine` is treated as positioning language unless business approves it as an official product name.
- Performance, warranty, certification, patent, exclusivity, and availability claims are excluded from proposed titles.
- Variant names should describe only the varying attribute. The current export uses `Default Title` for most products and `Size` values for saw blades; no proposed variant repeats a full product title.

## Recognized Families

| Family or model | Recognized machine records | Source basis | Recommendation |
|---|---:|---|---|
| `EM-1` | 1 | EM-1 pamphlet, EM-1 campaign image, Shopify export | needs business review |
| `BeadMaster` | 1 | BeadMaster dimension PDF, part lists, pallet workbook, Shopify export | needs technical review |
| `ShapeMaster` | 1 | ShapeMaster dimension PDF, part lists, pallet workbook, Shopify export | needs technical review |
| `TrimMaster` | 1 | TrimMaster dimension PDF, part lists, pallet workbook, Shopify export | needs technical review |
| `LapMaster` | 2 | LapMaster 12 and 18 source sets, pallet workbook, Shopify export | needs technical review |
| `SawMaster` | 3 | SawMaster 18 and 24 source sets, pallet workbook, Shopify export; SawMaster 36 appears in pallet/export only | needs technical review |
| `Jade` / `JadeMaster` | 1 | Pallet workbook and Shopify export only | needs technical review |
| `TumbleMaster` | 1 | Shopify export only | do not use |

## Machine Audit

### EM-1

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `EM - 1 MACHINE` in the large campaign panel; `EM-1 Machine` in `data/product-export/products.csv`; `EM-1 MACHINE`, `EM - 1 MACHINE`, `THE EVERYTHING MACHINE`, `4 MACHINES IN 1 PLUS HIGH-END SPECIAL FEATURES`, `GRINDING & POLISHING`, `6" TRIM SAW`, `METALSMITHING`, and `CARVING & DRILLING` in visual product sources. |
| Proposed canonical customer-facing name | `Rhino EM-1: Multi-Operation Lapidary Machine` |
| Proposed stable admin identifier | `machine.em_1` |
| Supported machine type | Multi-operation lapidary machine. Source operations are grinding, sanding, polishing, trim saw use, metalsmithing, carving, and drilling. |
| Naming-relevant specifications | Source image/pamphlet evidence supports a 6 in trim saw, 6 in grinding/polishing wheels, 1 in wheel arbor holes, variable-speed motor, 1 hp, 110 V, 50-60 Hz, 0 to 5000 rpm, 4.5 gallon water tank, undermount water filtration/circulation, movable brass sprayer, 80 grit hard wheel, 220 grit hard wheel, 280 grit soft wheel, 600 grit soft wheel, 1200 grit soft wheel, and 3000 grit soft wheel. Current catalog copy also references included 6 in wheels and 6 in magnetic flat-lap accessories. |
| Sources | `docs/product/Rhino_EM-1_Pamphlet.pdf`, pages 1-2; `docs/brand/Rhino_Lapidary_EM-1_copy.jpg`; `docs/brand/rhino-brand-evidence-inventory.md`, rows `BE-008`, `BE-009`, `BE-024`, `BE-025`, `BE-026`; `data/product-export/products.csv`, handle `em-1`. |
| Conflicts | C-001: `Everything Machine` is visible in marketing and current catalog copy, but the B-022 guide says to treat it as positioning until approved as an official name. C-002: EM-1 technical values come from a pamphlet/image and current catalog copy, not a structured machine specification sheet. |
| Missing or ambiguous information | Structured engineering spec sheet, formal official product-name decision, exact saw-blade arbor confirmation from a readable source, inclusion list governance, and legal review for patent or torque claims. |
| Recommendation | needs business review |

### BeadMaster 6

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `BEADMASTER - BEAD  MACHINE` in the dimension drawing title; `BİLYA MAKINASI` in exploded/part-list sources; `BEADMASTER 6''` in the pallet workbook; `BeadMaster 6"` in the Shopify export. |
| Proposed canonical customer-facing name | `Rhino BeadMaster 6: Bead Machine` |
| Proposed stable admin identifier | `machine.beadmaster_6` |
| Supported machine type | Bead Machine. |
| Naming-relevant specifications | 6 in machine size appears in pallet/catalog evidence. Current catalog says 6 in diameter, 1/2 in thick wheels; bead sizes 4, 6, 8, 10, and 12 mm; 110 V, 60 Hz; 0.55 kW motor; 3000 rpm; 6 in wheel diameter; 1 in arbor hole; dimensions 20 in x 24 in x 16 in; weight 70 lb. Part sources say 0.55 kW, 2800 rpm, 110 V, 60 Hz in English rows and 0.55 kW, 2800 rpm, 220 V in Turkish rows. Dimension drawing includes machine dimensions in mm and inches, including 692.5 mm [27.26 in], 462 mm [18.19 in], 453.4 mm [17.85 in], 400.4 mm [15.76 in], and 550.66 mm [21.68 in]. Pallet workbook says machine size 29'' 1/2 x 20'' x 15'' 3/4, crate size 29'' 1/2 x 23'' 1/2 x 22, machine weight 103 lb, total crate weight 145 lb. |
| Sources | `docs/product/BEADMASTER - BEAD  MACHINE DIMENSIONS.pdf`, page 1; `docs/product/BEADMASTER EXPLODED PICTURE.pdf`, pages 1-2; `docs/product/BEADMASTER PART LIST WITH PICTURES.xlsx`, `BOM` row 34; `docs/product/BEADMASTER PART ORDERING LIST.xlsx`, sheet `BİLYA MAKINASI PARÇA LİSTESİ`, row 29; `docs/product/BEADMASTER TURKISH ENGLISH PART LIST.xlsx`, same sheet, row 29; `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx`, sheet `Sayfa1`, row for `BEADMASTER 6''`; `data/product-export/products.csv`, handle `beadmaster`. |
| Conflicts | C-003: motor speed is 2800 rpm in part sources and 3000 rpm in current catalog copy. C-004: voltage is 220 V in Turkish technical rows and 110 V, 60 Hz in English/catalog rows. C-005: dimensions and weights differ between dimension drawing, pallet workbook, and current catalog. C-006: product casing differs across `BEADMASTER` and `BeadMaster`. |
| Missing or ambiguous information | Approved customer casing, authoritative market voltage, whether 6 in is official model size or wheel size only, and current sellable weight/dimension set. |
| Recommendation | needs technical review |

### ShapeMaster 6

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `SHAPEMASTER – SHAPE MACHINE` in the dimension drawing title; `Büyük Kopya Makinası` in exploded/part-list sources; `SHAPEMASTER 6''` in the pallet workbook; `ShapeMaster 6"` in the Shopify export. |
| Proposed canonical customer-facing name | `Rhino ShapeMaster 6: Shape Machine` |
| Proposed stable admin identifier | `machine.shapemaster_6` |
| Supported machine type | Shape Machine. |
| Naming-relevant specifications | 6 in machine size appears in pallet/catalog evidence. Current catalog says 6 in diameter, 1/2 in thick wheels for 3D shapes; 1/4 in wheels for cabs; master-shape sizes 4, 6, 8, 10, and 12 mm; 110 V, 60 Hz; 0.55 kW motor; 3000 rpm; 6 in wheel diameter; 1 in hole diameter; dimensions 20 in x 24 in x 16 in; weight 100 lb. Part sources say 0.55 kW, 2800 rpm, 110 V, 60 Hz in English rows and 0.55 kW, 2800 rpm, 220 V in Turkish rows. Dimension drawing includes 696.5 mm [27.42 in], 343 mm [13.5 in], 531.31 mm [20.92 in], 568 mm [22.36 in], 474 mm [18.66 in], and 461 mm [18.15 in]. Pallet workbook says machine size 29'' 1/2 x 20'' x 15'' 3/4, crate size 29'' 1/2 x 23'' 1/2 x 22, machine weight 135 lb, total crate weight 177 lb. |
| Sources | `docs/product/SHAPEMASTER – SHAPE MACHINE DIMENSIONS.pdf`, page 1; `docs/product/SHAPEMASTER EXPLODED PICTURES.pdf`, pages 1-2; `docs/product/SHAPEMASTER PART LIST WITH PICTURES.xlsx`, `BOM` row 65; `docs/product/SHAPEMASTER PART ORDERING LIST.xlsx`, `PARTS LIST` row 60; `docs/product/SHAPEMASTER TURKISH ENGLISH PART LIST.xlsx`, `PARTS LIST` row 60; `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx`, sheet `Sayfa1`, row for `SHAPEMASTER 6''`; `data/product-export/products.csv`, handle `shapemaster`. |
| Conflicts | C-007: motor speed is 2800 rpm in part sources and 3000 rpm in current catalog copy. C-008: voltage is 220 V in Turkish technical rows and 110 V, 60 Hz in English/catalog rows. C-009: dimensions and weights differ between dimension drawing, pallet workbook, and current catalog. C-010: source type `Shape Machine` differs from Turkish internal term `Büyük Kopya Makinası`. |
| Missing or ambiguous information | Approved customer casing, authoritative market voltage, current sellable weight/dimension set, and whether the current catalog's included-shape list is complete. |
| Recommendation | needs technical review |

### TrimMaster 8

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `TRIMMASTER – TRIM SAW MACHINE` in the dimension drawing title; `İnce Dilimleme Makinası` in exploded/part-list sources; `TRIMMASTER 8''` in the pallet workbook; `TrimMaster` in the Shopify export. |
| Proposed canonical customer-facing name | `Rhino TrimMaster 8: Trim Saw Machine` |
| Proposed stable admin identifier | `machine.trimmaster_8` |
| Supported machine type | Trim Saw Machine. |
| Naming-relevant specifications | 8 in size appears in pallet evidence; part sources support `saw blade 6'' or 8''`; current catalog says compatible with 6 in or 8 in blades with 1 in hole diameter. Current catalog says 110 V, 60 Hz; motor 0.37 kW and more than 3000 rpm; cutting length 5 in; cutting height 2 in; dimensions 14 in x 22 in x 14 in; weight 50 lb. Part sources say motor values of 0.55 kW, 1500 rpm, 230 V in one part-list workbook row; 0.55 kW, 3000 rpm, 230 V in a Turkish-English row; and 0.55 kW, 2800 rpm, 110 V, 60 Hz in English rows. Dimension drawing includes 289.65 mm [11.4 in], 345 mm [13.58 in], 222 mm [8.74 in], 202 mm [7.95 in], 545.3 mm [21.47 in], 378.75 mm [14.91 in], 630.7 mm [24.83 in], 193 mm [7.6 in], and 43.3 mm [1.7 in]. Pallet workbook says machine size 24'' 3/4 x 15'' x 13'', crate size 28'' 3/4 x 33'' 1/2 x 21'' 1/2, machine weight 71 lb, total crate weight 101 lb. |
| Sources | `docs/product/TRIMMASTER – TRIM SAW MACHINE DIMENSIONS.pdf`, page 1; `docs/product/TRIMMASTER EXPLODED PICTURES.pdf`, pages 1-3; `docs/product/TRIMMASTER PART LIST WITH PICTURES.xlsx`, `BOM` rows 37 and 54; `docs/product/TRIMMASTER PART ORDERING LIST.xlsx`, `S1` row 5 and `S2` row 9; `docs/product/TRIMMASTER TURKISH ENGLISH PART LIST.xlsx`, `S1` row 5 and `S2` row 9; `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx`, sheet `Sayfa1`, row for `TRIMMASTER 8''`; `data/product-export/products.csv`, handle `trimmaster`. |
| Conflicts | C-011: current catalog title omits the 8 in size, while pallet says `TRIMMASTER 8''`; part sources also support 6 in or 8 in blade use. C-012: motor power is 0.55 kW in part sources and 0.37 kW in current catalog. C-013: motor speed is 1500 rpm, 2800 rpm, 3000 rpm, or more than 3000 rpm depending on source. C-014: voltage is 230 V in Turkish technical rows and 110 V, 60 Hz in English/catalog rows. C-015: dimensions and weights differ between dimension drawing, pallet workbook, and current catalog. |
| Missing or ambiguous information | Whether the official customer title should include `8`, the current sellable blade configuration, authoritative market voltage, and current sellable weight/dimension set. |
| Recommendation | needs technical review |

### LapMaster 12

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `LAPMASTER 12’’ – LAPPING MACHINE 12’’` in the part-list PDF title; `YATAY LAP-300` in part sources; `LAPMASTER 12''` in the pallet workbook; `LapMaster 12"` in the Shopify export. |
| Proposed canonical customer-facing name | `Rhino LapMaster 12: Lapping Machine` |
| Proposed stable admin identifier | `machine.lapmaster_12` |
| Supported machine type | Lapping Machine. |
| Naming-relevant specifications | 12 in size appears in source titles, pallet, and catalog. Current catalog says 12 in main lap, optional variable speed from 500 rpm to 1500 rpm, motor 0.75 kW, 1400 rpm, 110 V, 60 Hz, dimensions 18 in x 24 in x 20 in, and weight 90 lb. Part sources say 0.75 kW, 1400 rpm, 110 V, 60 Hz in English rows and 0.75 kW, 1400 rpm, 220 V in Turkish rows. Pallet workbook says machine size 26'' 3/8 x 20'' x 16'' 1/2, crate size 29'' 1/2 x 23'' 1/2 x 22, machine weight 122 lb, total crate weight 161 lb. |
| Sources | `docs/product/LAPMASTER 12'' PART LIST WITH PICTURES.xlsx`, `BOM` row 38; `docs/product/LAPMASTER 12’' PART ORDERING LIST.xlsx`, `PARTS LIST` row 30; `docs/product/LAPMASTER 12’’ – LAPPING MACHINE 12’’ PART LIST.pdf`, pages 1-3; `docs/product/LAPMASTER TURKISH ENGLISH PART LIST.xlsx`, `PARTS LIST` row 30; `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx`, sheet `Sayfa1`, row for `LAPMASTER 12''`; `data/product-export/products.csv`, handle `lapmaster-12`. |
| Conflicts | C-016: voltage is 220 V in Turkish technical rows and 110 V, 60 Hz in English/catalog rows. C-017: dimensions and weights differ between pallet workbook and current catalog. C-018: optional variable speed appears in current catalog but not in the part-list rows used for this audit. |
| Missing or ambiguous information | Authoritative market voltage, whether optional variable speed should be represented as a variant/metafield instead of copy, and current sellable weight/dimension set. |
| Recommendation | needs technical review |

### LapMaster 18

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `LAPMASTER 18'' - LAPPING MACHINE 18''` in the dimension drawing and exploded-picture sources; `YATAY LAP-450` in part sources; `LAPMASTER 18''` in the pallet workbook; `LapMaster 18"` in the Shopify export. |
| Proposed canonical customer-facing name | `Rhino LapMaster 18: Lapping Machine` |
| Proposed stable admin identifier | `machine.lapmaster_18` |
| Supported machine type | Lapping Machine. |
| Naming-relevant specifications | 18 in size appears in source titles, pallet, and catalog. Current catalog says 18 in main lap, optional variable speed from 500 rpm to 1500 rpm, motor 0.75 kW, 1400 rpm, 110 V, 60 Hz, dimensions 18 in x 24 in x 20 in, and weight 90 lb. Part sources say 1.1 kW, 1400 rpm, 110 V, 60 Hz in English rows and 1.1 kW, 1400 rpm, 220 V in Turkish rows. Dimension drawing includes 546 mm [21.5 in], 584.5 mm [23.01 in], 360.5 mm [14.19 in], 771.5 mm [30.37 in], and 613.9 mm [24.17 in]. Pallet workbook says machine size 33'' 1/2 x 25'' 1/2 x 21'' 1/2, crate size 25'' 1/2 x 33'' 1/2 x 21'' 1/2, and crate note `kasa 55lb`; machine weight is blank. |
| Sources | `docs/product/LAPMASTER 18'' EXPLODED PICTURES.pdf`, pages 1-3; `docs/product/LAPMASTER 18'' PART LIST WITH PICTURES.xlsx`, `BOM` row 25; `docs/product/LAPMASTER 18'' PART ORDERING LIST.xlsx`, `PARTS LIST` row 17; `docs/product/LAPMASTER 18'' TURKISH ENGLISH PART LIST.xlsx`, `PARTS LIST` row 17; `docs/product/LAPMASTER 18’’ – LAPPING MACHINE 18’’ DIMENSIONS.pdf`, page 1; `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx`, sheet `Sayfa1`, row for `LAPMASTER 18''`; `data/product-export/products.csv`, handle `lapmaster-18`. |
| Conflicts | C-019: motor power is 1.1 kW in technical part sources and 0.75 kW in current catalog copy. C-020: voltage is 220 V in Turkish technical rows and 110 V, 60 Hz in English/catalog rows. C-021: dimensions and weights differ between dimension drawing, pallet workbook, and current catalog; pallet machine weight is missing. C-022: optional variable speed appears in current catalog but not in the part-list rows used for this audit. |
| Missing or ambiguous information | Authoritative market voltage, whether optional variable speed should be represented as a variant/metafield instead of copy, current sellable weight/dimension set, and pallet machine weight. |
| Recommendation | needs technical review |

### SawMaster 18

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `SAWMASTER 18'' - SAW MACHINE 18''` in dimension and exploded-picture sources; `BUYUK KESICI-450` in part sources; `SAWMASTER 18''` in the pallet workbook; `SawMaster 18"` in the Shopify export. |
| Proposed canonical customer-facing name | `Rhino SawMaster 18: Saw Machine` |
| Proposed stable admin identifier | `machine.sawmaster_18` |
| Supported machine type | Saw Machine. |
| Naming-relevant specifications | 18 in size appears in source titles, pallet, and catalog. Part sources support a `Q450mm` saw blade and English `saw blade` part `BK-450-SP-01`. Technical part rows say main motor 1.1 kW, 1500 rpm, 110 V, 60 Hz in English rows and 1.1 kW, 1500 rpm, 230 V in Turkish rows. Feed motor rows say 0.18 kW, 1500 rpm, 110 V, 60 Hz in English rows and 0.18 kW, 1500 rpm, 230 V in Turkish rows. Current catalog says 110 V, 60 Hz; cutting height 6 1/2 in; cutting length 9 7/8 in; cutting speed 7/8 in/min; 1.8 kW, 1700 rpm motor with crossfeed; dimensions 105 cm x 130 cm x 130 cm; weight 287 lb; and fits up to 18 in saw. Dimension drawing includes 1098.97 mm [43.27 in], 980 mm [38.58 in], 768 mm [30.24 in], 740 mm [29.13 in], 1005 mm [39.57 in], 1252.7 mm [49.32 in], 1320.52 mm [51.99 in], 928 mm [36.54 in], 206 mm [8.11 in], and 393.3 mm [15.48 in]. Pallet workbook says machine size 55'' x 37'' 1/2 x 41'' 1/4, crate size 58'' 3/5 x 41'' 1/4 x 47'' 1/4, machine weight 426 lb, total crate weight 536 lb, and tank capacity 11 gal. |
| Sources | `docs/product/SAWMASTER 18’’ - SAW MACHINE 18’’ DIMENSIONS.pdf`, page 1; `docs/product/SAWMASTER 18'' EXPLODED PICTURES.pdf`, pages 1-4; `docs/product/SAWMASTER 18'' PART LIST WITH PICTURES.xlsx`, `BOM` rows 67, 96, and 139; `docs/product/SAWMASTER 18'' PART ORDERING LIST.xlsx`, `S1` row 4, `S2` row 2, and `S4` row 10; `docs/product/SAWMASTER 18'' TURKISH ENGLISH PART LIST.xlsx`, `S1` row 4, `S2` row 2, and `S4` row 10; `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx`, sheet `Sayfa1`, row for `SAWMASTER 18''`; `data/product-export/products.csv`, handle `sawmaster-18`. |
| Conflicts | C-023: motor power/speed is 1.1 kW at 1500 rpm in technical sources and 1.8 kW at 1700 rpm in current catalog. C-024: voltage is 230 V in Turkish technical rows and 110 V, 60 Hz in English/catalog rows. C-025: blade source says `Q450mm` while customer/catalog/title sources use 18 in; both values are preserved and not silently reconciled. C-026: dimensions and weights differ between dimension drawing, pallet workbook, and current catalog. C-027: current catalog includes CE/TSEK, patented, speed, safety, and durability claims that are not approved for titles by B-022. |
| Missing or ambiguous information | Authoritative market voltage, approved customer machine type if `Saw Machine` should become `Slab Saw`, current motor package, current certification/legal status, current sellable weight/dimension set, and title-safe blade size rule. |
| Recommendation | needs technical review |

### SawMaster 24

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `SAWMASTER 24'' - SAW MACHINE 24''` in dimension and exploded-picture sources; `BUYUK KESICI-600` in part sources; `SAWMASTER 24''` in the pallet workbook; `SawMaster 24"` in the Shopify export. |
| Proposed canonical customer-facing name | `Rhino SawMaster 24: Saw Machine` |
| Proposed stable admin identifier | `machine.sawmaster_24` |
| Supported machine type | Saw Machine. |
| Naming-relevant specifications | 24 in size appears in source titles, pallet, and catalog. Part sources support a `Q600mm` saw blade and English `saw blade` part `BK-600-SP-01`. Technical part rows say main motor 1.5 kW, 1500 rpm, 110 V, 60 Hz in English rows and 1.5 kW, 1500 rpm, 230 V in Turkish rows. Feed motor rows say 0.18 kW, 1500 rpm, 110 V, 60 Hz in English rows and 0.18 kW, 1500 rpm, 230 V in Turkish rows. Current catalog says 110 V, 60 Hz; cutting height 7 in; cutting length 11 in; cutting speed 7/8 in/min; 1.8 kW, 1700 rpm motor with crossfeed; dimensions 105 cm x 140 cm x 140 cm; weight 340 lb; and fits up to 24 in saw. Dimension drawing includes 1082 mm [42.6 in], 1348 mm [53.07 in], 1105 mm [43.5 in], 1099 mm [43.27 in], 768 mm [30.24 in], 206 mm [8.11 in], 478 mm [18.82 in], 740 mm [29.13 in], 1418.32 mm [55.84 in], and 928 mm [36.54 in]. Pallet workbook says machine size 57'' x 37'' 1/2 x 41'' 1/4, crate size 60'' 1/4 x 41'' 1/4 x 47'' 1/4, machine weight 454 lb, total crate weight 587 lb, and tank capacity 12 gal. |
| Sources | `docs/product/SAWMASTER 24’’ - SAW MACHINE 24’’ DIMENSIONS.pdf`, page 1; `docs/product/SAWMASTER 24'' EXPLODED PICTURES.pdf`, pages 1-4; `docs/product/SAWMASTER 24'' PART LIST WITH PICTURES.xlsx`, `BOM` rows 67, 96, and 139; `docs/product/SAWMASTER 24'' PART ORDERING LIST.xlsx`, `S1` row 4, `S2` row 2, and `S4` row 10; `docs/product/SAWMASTER 24'' TURKISH ENGLISH PART LIST.xlsx`, `S1` row 4, `S2` row 2, and `S4` row 10; `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx`, sheet `Sayfa1`, row for `SAWMASTER 24''`; `data/product-export/products.csv`, handle `sawmaster-24`. |
| Conflicts | C-028: motor power/speed is 1.5 kW at 1500 rpm in technical sources and 1.8 kW at 1700 rpm in current catalog. C-029: voltage is 230 V in Turkish technical rows and 110 V, 60 Hz in English/catalog rows. C-030: blade source says `Q600mm` while customer/catalog/title sources use 24 in; both values are preserved and not silently reconciled. C-031: dimensions and weights differ between dimension drawing, pallet workbook, and current catalog. C-032: current catalog includes CE/TSEK, patented, speed, safety, and durability claims that are not approved for titles by B-022. |
| Missing or ambiguous information | Authoritative market voltage, approved customer machine type if `Saw Machine` should become `Slab Saw`, current motor package, current certification/legal status, current sellable weight/dimension set, and title-safe blade size rule. |
| Recommendation | needs technical review |

### SawMaster 36

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `SAWMASTER 36''` in the pallet workbook; `SawMaster, 36"` in the Shopify export. |
| Proposed canonical customer-facing name | `Rhino SawMaster 36: Saw Machine` |
| Proposed stable admin identifier | `machine.sawmaster_36` |
| Supported machine type | Saw Machine by family association only. No SawMaster 36 technical drawing or part list was found. |
| Naming-relevant specifications | Pallet workbook says machine size `72' x 44'' x 47''`, crate size 79'' x 51'' x 52'' 1/2, machine weight 662 lb, total crate weight 772 lb, and tank capacity 20 gal. Current catalog title supports 36 in but has no body specifications. |
| Sources | `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx`, sheet `Sayfa1`, row for `SAWMASTER 36''`; `data/product-export/products.csv`, handle `sawmaster-36`. |
| Conflicts | C-033: no machine-specific SawMaster 36 technical drawing, part list, or manual was found. C-034: pallet machine dimension `72' x 44'' x 47''` appears inconsistent with the inch notation used everywhere else and may be a typo. C-035: Shopify export has a current product title but no specification body. |
| Missing or ambiguous information | Machine type source, exact dimensions, blade size, arbor size, motor values, voltage, speed, cutting envelope, tank capacity confirmation, and approved customer title punctuation. |
| Recommendation | needs technical review |

### Jade / JadeMaster 14

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `JADE 14''` in the pallet workbook; `JadeMaster, 14"` in the Shopify export; `JadeMaster` appears in current catalog replacement-part titles. |
| Proposed canonical customer-facing name | No safe canonical customer-facing title proposed. Provisional internal reference only: `Rhino JadeMaster 14`. |
| Proposed stable admin identifier | `machine.jademaster_14` |
| Supported machine type | Not confirmed by technical source. |
| Naming-relevant specifications | Pallet workbook says machine size 40'' 1/2 x 23'' 1/2 x 21, crate size 40'' 1/2 x 27'' x 27, machine weight 154 lb, total crate weight 220 lb, and tank capacity 8 gal. Current catalog title supports 14 in but has no body specifications. |
| Sources | `docs/product/MAKİNA PALET ÖLÇÜLERİ VE AĞIRLIKLARI1.xlsx`, sheet `Sayfa1`, row for `JADE 14''`; `data/product-export/products.csv`, handle `jademaster`; `data/product-export/products.csv`, current model-specific part titles containing `(JadeMaster)`. |
| Conflicts | C-036: pallet source says `JADE 14''`, while current catalog says `JadeMaster, 14"`. C-037: no machine-specific Jade/JadeMaster technical drawing, part list, or manual was found. |
| Missing or ambiguous information | Official family name, machine type, blade or wheel size, arbor size, motor values, voltage, speed, current sellable dimensions/weight, and whether model-specific replacement parts are compatible with `JADE 14''` or `JadeMaster, 14"`. |
| Recommendation | needs technical review |

### TumbleMaster

| Field | Finding |
|---|---|
| Exact spellings and punctuation | `TumbleMaster` in the Shopify export. |
| Proposed canonical customer-facing name | No safe canonical customer-facing title proposed. |
| Proposed stable admin identifier | `machine.tumblemaster` |
| Supported machine type | Not confirmed by technical source. |
| Naming-relevant specifications | None found in machine specification documents. |
| Sources | `data/product-export/products.csv`, handle `tumblemaster`. |
| Conflicts | C-038: no machine-specific TumbleMaster technical drawing, part list, manual, pallet row, or approved product document was found. C-039: current catalog title exists with no source specifications and a zero price in the export. |
| Missing or ambiguous information | Official family name, machine type, size, capacity, motor values, voltage, speed, current sellable dimensions/weight, and whether this is an active product. |
| Recommendation | do not use |

## Conflict Ledger

| ID | Conflict | Review owner |
|---|---|---|
| C-001 | EM-1 uses `Everything Machine` in marketing/catalog sources, but B-022 treats it as positioning until business confirms official name use. | business |
| C-002 | EM-1 specs are visible in image/pamphlet/catalog evidence, not a structured engineering specification sheet. | technical |
| C-003 | BeadMaster motor speed: 2800 rpm in part sources vs 3000 rpm in current catalog. | technical |
| C-004 | BeadMaster voltage: 220 V in Turkish technical rows vs 110 V, 60 Hz in English/catalog rows. | technical |
| C-005 | BeadMaster dimensions and weights differ across dimension drawing, pallet workbook, and catalog. | technical |
| C-006 | BeadMaster casing differs: `BEADMASTER` vs `BeadMaster`. | business |
| C-007 | ShapeMaster motor speed: 2800 rpm in part sources vs 3000 rpm in current catalog. | technical |
| C-008 | ShapeMaster voltage: 220 V in Turkish technical rows vs 110 V, 60 Hz in English/catalog rows. | technical |
| C-009 | ShapeMaster dimensions and weights differ across dimension drawing, pallet workbook, and catalog. | technical |
| C-010 | ShapeMaster machine type/source terms differ: `Shape Machine` vs `Büyük Kopya Makinası`. | technical |
| C-011 | TrimMaster title/size evidence conflicts: dimension title omits size, pallet says 8 in, part sources support 6 in or 8 in blades, catalog title omits size. | technical |
| C-012 | TrimMaster motor power: 0.55 kW in part sources vs 0.37 kW in catalog. | technical |
| C-013 | TrimMaster motor speed: 1500 rpm, 2800 rpm, 3000 rpm, or more than 3000 rpm depending on source. | technical |
| C-014 | TrimMaster voltage: 230 V in Turkish technical rows vs 110 V, 60 Hz in English/catalog rows. | technical |
| C-015 | TrimMaster dimensions and weights differ across dimension drawing, pallet workbook, and catalog. | technical |
| C-016 | LapMaster 12 voltage: 220 V in Turkish technical rows vs 110 V, 60 Hz in English/catalog rows. | technical |
| C-017 | LapMaster 12 dimensions and weights differ between pallet workbook and catalog. | technical |
| C-018 | LapMaster 12 optional variable speed appears in current catalog but not in cited part-list rows. | technical |
| C-019 | LapMaster 18 motor power: 1.1 kW in technical sources vs 0.75 kW in catalog. | technical |
| C-020 | LapMaster 18 voltage: 220 V in Turkish technical rows vs 110 V, 60 Hz in English/catalog rows. | technical |
| C-021 | LapMaster 18 dimensions and weights differ across dimension drawing, pallet workbook, and catalog; pallet machine weight is missing. | technical |
| C-022 | LapMaster 18 optional variable speed appears in current catalog but not in cited part-list rows. | technical |
| C-023 | SawMaster 18 motor power/speed: 1.1 kW at 1500 rpm in technical sources vs 1.8 kW at 1700 rpm in catalog. | technical |
| C-024 | SawMaster 18 voltage: 230 V in Turkish technical rows vs 110 V, 60 Hz in English/catalog rows. | technical |
| C-025 | SawMaster 18 blade size evidence uses `Q450mm`, while title/catalog uses 18 in. | technical |
| C-026 | SawMaster 18 dimensions and weights differ across dimension drawing, pallet workbook, and catalog. | technical |
| C-027 | SawMaster 18 catalog copy contains CE/TSEK, patent, speed, safety, and durability claims not approved for titles. | business/legal |
| C-028 | SawMaster 24 motor power/speed: 1.5 kW at 1500 rpm in technical sources vs 1.8 kW at 1700 rpm in catalog. | technical |
| C-029 | SawMaster 24 voltage: 230 V in Turkish technical rows vs 110 V, 60 Hz in English/catalog rows. | technical |
| C-030 | SawMaster 24 blade size evidence uses `Q600mm`, while title/catalog uses 24 in. | technical |
| C-031 | SawMaster 24 dimensions and weights differ across dimension drawing, pallet workbook, and catalog. | technical |
| C-032 | SawMaster 24 catalog copy contains CE/TSEK, patent, speed, safety, and durability claims not approved for titles. | business/legal |
| C-033 | SawMaster 36 has no machine-specific drawing, part list, or manual in the audited source set. | technical |
| C-034 | SawMaster 36 pallet dimension `72' x 44'' x 47''` appears inconsistent with the workbook's inch notation. | technical |
| C-035 | SawMaster 36 catalog export has a title but no specification body. | business |
| C-036 | Jade/JadeMaster name conflict: pallet says `JADE 14''`, catalog says `JadeMaster, 14"`. | business |
| C-037 | Jade/JadeMaster has no machine-specific drawing, part list, or manual in the audited source set. | technical |
| C-038 | TumbleMaster has no machine-specific technical source, pallet row, or approved product document in the audited source set. | business |
| C-039 | TumbleMaster appears in the export with no specifications and a zero price. | business |

## Current Catalog Normalization Notes

- Machine products whose proposed titles have at least one cited repository source: EM-1, BeadMaster 6, ShapeMaster 6, TrimMaster 8, LapMaster 12, LapMaster 18, SawMaster 18, SawMaster 24, SawMaster 36, and Jade/JadeMaster 14.
- Machine products whose current title cannot be normalized safely without review: EM-1, BeadMaster 6, ShapeMaster 6, TrimMaster, LapMaster 12, LapMaster 18, SawMaster 18, SawMaster 24, SawMaster 36, JadeMaster 14, and TumbleMaster.
- `TumbleMaster` should not receive a normalized customer title from the current repository evidence. It needs a current technical or approved product source first.
- `JadeMaster, 14"` should not be normalized to `Rhino JadeMaster 14: ...` until the official family name and machine type are confirmed.
- `Everything Machine` may be retained as campaign or positioning copy if business approves it, but this audit does not recommend it as the canonical machine title.
- The current catalog contains unsupported title-adjacent claim language in product bodies, especially `SUPER FAST`, `patented`, `CE`, `TSEK`, `safe`, `standard`, and broad durability claims. None are included in proposed titles.

## Validation Checklist

- Every proposed machine title above has at least one cited repository source.
- Every numeric descriptor in a proposed machine title appears in a cited repository source.
- Proposed titles do not include unsupported performance, certification, warranty, exclusivity, or availability claims.
- Current variant names were reviewed. `Default Title` variants do not repeat product titles, and the saw-blade variants use `Size` values rather than full product titles.

## Follow-Up Work

Resolution tracking for C-001 through C-039 now lives in [rhino-machine-specification-resolution-register.md](../product/rhino-machine-specification-resolution-register.md).

1. Product Owner: C-001 is resolved in the register. Use canonical title `Rhino EM-1: Multi-Operation Lapidary Machine` and positioning line `The Everything Machine`.
2. Product Owner: CamelCase family casing is approved in the register for `BeadMaster`, `ShapeMaster`, `TrimMaster`, `LapMaster`, `SawMaster`, and `JadeMaster`.
3. Business and technical owners: TumbleMaster is marked unavailable pending commercial and technical review in the register.
4. Technical owner: reconcile unresolved voltage, motor, speed, blade, wheel, arbor, dimension-state, and weight-state rows in the register without selecting a winning value until explicit evidence is supplied.
5. Technical owner: supply missing machine-specific documents for SawMaster 36 and Jade/JadeMaster 14 before those titles are normalized.
6. Content owner: move confirmed technical specs into structured product metafields/metaobjects instead of titles, per `docs/architecture/metafield-metaobject-architecture.md`.
7. Legal/business owner: review patent, certification, warranty, performance, and durability claims before any customer-facing reuse.

## Validation Results

Validation was run after creating this audit and `data/product-name-normalization-proposal.json`.

- Command: `node -e "const p=require('./package.json'); const keys=Object.keys(p.scripts||{}).filter(k=>/markdown|markdownlint|mdlint|lint:md/i.test(k)); console.log(keys.length?keys.join('\n'):'no markdown script defined')"`  
  Result: No repository Markdown validation script is defined.
- Command: `python -c "from pathlib import Path; p=Path('docs/brand/rhino-product-terminology-source-audit.md'); s=p.read_text(encoding='utf-8'); assert '# Rhino Product Terminology Source Audit' in s and '## Machine Audit' in s and '## Conflict Ledger' in s and '## Validation Results' in s; print('markdown structure check passed')"`  
  Result: Passed: `markdown structure check passed`.
- Command: `python -m json.tool data\product-name-normalization-proposal.json > $null`  
  Result: Passed: JSON parsed successfully.
- Command: `python -c "import json; from pathlib import Path; root=Path('.'); data=json.loads(Path('data/product-name-normalization-proposal.json').read_text(encoding='utf-8')); assert data['schema_version']==1; assert all((root/s).exists() for p in data['products'] for s in p['source_paths']); print('proposal source-path check passed:', len(data['products']), 'products')"`  
  Result: Passed: `proposal source-path check passed: 45 products`.
- Command: `python -c "import re; from pathlib import Path; root=Path('.'); text=Path('docs/brand/rhino-product-terminology-source-audit.md').read_text(encoding='utf-8'); bt=chr(96); paths=[m.group(1) for m in re.finditer(bt+'((?:docs|data|scripts)[^'+bt+']+)'+bt, text) if m.group(1).endswith(('.md','.json','.csv','.pdf','.xlsx','.py'))]; missing=[p for p in paths if not (root/p).exists()]; assert not missing, missing; print('audit path check passed:', len(set(paths)), 'paths')"`  
  Result: Passed: `audit path check passed: 46 paths`.
- Command: `python -c "import csv; rows=list(csv.DictReader(open('data/product-export/products.csv', encoding='utf-8-sig', newline=''))); repeats=[r['Handle'] for r in rows if (r.get('Option1 Value') or '').strip() and r['Option1 Value'].strip()!='Default Title' and r['Option1 Value'].strip().lower()==(r.get('Title') or '').strip().lower()]; assert not repeats, repeats; print('variant title repeat check passed:', len(rows), 'rows')"`  
  Result: Passed: `variant title repeat check passed: 125 rows`.
- Command: `python scripts\validate-theme-repository.py`  
  Result: Passed: `JSON and repository hygiene validation passed.`
- Command: `npm run validate:registers`  
  Result: Passed: all JSON registers reported valid. NPM also printed warning `Unknown env config "min-release-age"`; this did not fail the command.
- Command: `npm run validate:product-data`  
  Result: Failed by usage: repository script requires a CSV path or `PRODUCT_CSV`.
- Command: `npm run validate:product-data -- data/product-export/products.csv`  
  Result: Failed against the current export: 95 handles have image sources without image alt text and 8 handles have prices at or below zero (`arbor-wrench`, `automatic-feed-clamp`, `jademaster`, `lapmaster-bolt`, `mr16`, `saw-vice-plate-set`, `trim-saw-6`, `tumblemaster`). These are existing product-data issues; this audit did not edit Shopify product records.
- Command: `shopify theme check --fail-level warning`  
  Result: Passed: 202 files inspected with no offenses found.

## Product Owner Decisions

**Decision date:** 2026-07-31  
**Decision owner:** Product Owner

### EM-1 naming

The canonical product title is:

`Rhino EM-1: Multi-Operation Lapidary Machine`

`The Everything Machine` is approved as the EM-1 positioning line and product subtitle, not as the canonical catalog title.

This resolves C-001 without forcing a marketing phrase into product-data structures.

### Machine-family casing

The approved customer-facing family names are:

- BeadMaster
- ShapeMaster
- TrimMaster
- LapMaster
- SawMaster
- JadeMaster

All-uppercase forms in drawings and internal documents remain source spellings rather than storefront casing.

### JadeMaster

`JadeMaster` is the approved customer-facing family name instead of `JADE`.

The machine must not receive a complete normalized product title until its machine type and current sellable specification are supported by an approved technical source.

Replacement-part titles may continue to use `JadeMaster` when their existing compatibility is confirmed.

### TumbleMaster

TumbleMaster is not approved for storefront use because no supporting machine specification, pallet record, manual, approved product source, or valid sellable price was found.

The product must remain Draft or Archived in Shopify until:

1. Its current commercial status is confirmed.
2. A technical source is supplied.
3. A valid price is entered.
4. Product ownership approves its return to the catalog.

Do not delete the product solely because of this audit.
