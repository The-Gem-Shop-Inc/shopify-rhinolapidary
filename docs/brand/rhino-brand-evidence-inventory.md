# Rhino Brand Evidence Inventory

**PBI:** B-001  
**Status:** Draft evidence baseline  
**Evidence date:** 2026-07-30  
**Purpose:** Separate observed source material, Trade defaults, approved decisions, proposals, and unresolved questions before Rhino brand implementation begins.

## Status vocabulary

- **Observed:** Present in a cited repository, Shopify admin, Rhino, The Gem Shop, or Silica-Gem source.
- **Trade default:** Present in the Shopify Trade theme and not yet approved as Rhino direction.
- **Proposed:** A future direction that requires approval.
- **Needs review:** Evidence exists, but ownership, accuracy, currency, or usage permission is unresolved.
- **Rejected:** Reviewed and explicitly excluded from Rhino direction.
- **Approved:** Signed off by the designated brand owner and any required legal or business reviewer.

## Evidence inventory

| ID | Category | Evidence | Entity | Source                                               | Owner | Status        | Usage rights | Journey relevance | Notes |
|---|---|---|---|------------------------------------------------------|---|---------------|---|---|---|
| BE-001 | Theme baseline | Shopify Trade 15.5.0 is the repository baseline. | Shopify / Rhino theme fork | `config/settings_schema.json`                        | Engineering | Trade default | Shopify theme license and project repository terms | All storefront journeys | Treat as platform evidence, not Rhino brand approval. |
| BE-002 | Logo | No Rhino logo value is committed in current theme settings. | Rhino Lapidary | `docs/brand/rhino.png`                               | Brand owner | Approved      |  | Trust, navigation, browser recognition | Locate authoritative vector and raster variants before implementation. |
| BE-003 | Typography | DM Sans headings and Jost body text are configured. | Rhino theme fork | `config/settings_data.json`                          | Brand owner / Engineering | Trade default | Shopify font availability applies | All reading and technical comparison journeys | Readable starting point, but not yet an approved Rhino hierarchy. |
| BE-004 | Color | Current schemes use light gray, white, taupe, charcoal, and dark gray-blue. | Rhino theme fork | `config/settings_data.json`                          | Brand owner / Engineering | Trade default | Project-owned configuration | All storefront journeys | These values suggest an industrial direction but are not a Rhino system. |
| BE-005 | Design tokens | Only a primary brand color token and section spacing token are currently proposed. | Rhino theme fork | `data/design-token-inventory.json`                   | Engineering | Proposed      | Project-owned | Maintainability and consistency | Inventory is insufficient for launch implementation. |
| BE-006 | Homepage copy | Generic Trade copy remains, including “Welcome industry insiders” and “Grow your business with us.” | Shopify Trade | `templates/index.json`                               | Content owner | Trade default | Shopify theme content | New buyers, returning buyers, wholesale visitors | Must not be treated as Rhino messaging. |
| BE-007 | Product template copy | Generic tabs remain, including product features, materials and care, and merchandising tips. | Shopify Trade | `templates/product.json`                             | Content owner | Trade default | Shopify theme content | Product evaluation | Replace only after product information architecture and copy rules exist. |
| BE-008 | Flagship positioning | The EM-1 is presented as an “Everything Machine” with four-machine utility. | Rhino Lapidary | Current Rhino public site                            | Brand owner | Observed      | Needs confirmation for reuse | New buyers, comparison shoppers, workshop buyers | Preserve as source evidence; verify exact approved wording. |
| BE-009 | Product proof points | Current public materials reference grinding, sanding, polishing, trim saw use, flexible shaft, variable speed, torque, and water circulation or filtration. | Rhino Lapidary | Current Rhino public site and The Gem Shop EM-1 page | Product owner / Legal reviewer | Needs review  | Content reuse permission and technical accuracy require confirmation | Machine evaluation | Each claim needs a current technical source and owner. |
| BE-010 | Partnership identity | Current Rhino material describes Rhino as a partnership between Silica-Gem and The Gem Shop. | Rhino / Silica-Gem / The Gem Shop | Current Rhino About page                             | Business owner / Legal reviewer | Needs review  | Business wording requires approval | Trust, support, About, structured data | The legal entity and seller of record remain unresolved. |
| BE-011 | Manufacturing and sourcing role | Current Rhino material associates Silica-Gem with manufacturing and sourcing. | Silica-Gem | Current Rhino About page                             | Business owner / Legal reviewer | Needs review  | Business wording requires approval | Technical credibility, About, warranty context | Do not repeat as an approved claim until confirmed. |
| BE-012 | Service and fulfillment role | Current Rhino material associates The Gem Shop with customer service, website management, and fulfillment. | The Gem Shop | Current Rhino About page                             | Business owner / Support owner | Needs review  | Business wording requires approval | Purchase reassurance and post-purchase support | Confirm current operating responsibility and geographic scope. |
| BE-013 | Supplier claim | The Gem Shop collection describes The Gem Shop as the exclusive American supplier of Rhino equipment. | The Gem Shop | The Gem Shop Rhino collection                        | Business owner / Legal reviewer | Needs review  | Claim currency and territory require confirmation | United States purchase confidence | Record approval and review date before storefront use. |
| BE-014 | Product media | The Gem Shop product media provides practical EM-1 setup and accessory imagery. | The Gem Shop / Rhino | The Gem Shop Rhino collection and product pages      | Media owner | Needs review  | Reuse permission unresolved | Product evaluation, setup, accessories | Keep product catalog media in Shopify product media or Files, not theme assets. |
| BE-015 | Legacy visual style | Current Rhino public pages use legacy Weebly styling. | Rhino Lapidary | Current Rhino public site                            | Brand owner | Observed      | Existing site rights may apply | Historical reference only | Use as source evidence, not as a design system to copy. |
| BE-016 | Stock icon set | Trade contains many food, apparel, beauty, and other icons unrelated to lapidary machinery. | Shopify Trade | Theme assets and stock asset ledgers                 | Engineering / Design | Trade default | Shopify theme license | Product cards, benefits, support modules | Inventory before replacing; avoid deleting upstream assets without a documented strategy. |
| BE-017 | Social profiles | Current committed social theme settings are blank. | Rhino theme fork | `config/settings_data.json`                          | Marketing / Brand owner | Needs review  | Account ownership unknown | Social proof and footer navigation | Confirm which Rhino or The Gem Shop channels are authoritative. |
| BE-018 | Warranty and policy language | Legacy Rhino sources contain shipping, damage, return, and warranty language. | Rhino / The Gem Shop | Current Rhino policy pages                           | Business owner / Legal reviewer | Needs review  | Accuracy, ownership, and currency unresolved | High-value purchase reassurance | Compare against Shopify policies and current operations before migration. |
| BE-019 | Video | Current Rhino public pages include YouTube embeds. | Rhino / channel owner | Current Rhino public pages                           | Content owner | Needs review  | Channel ownership and embed approval unresolved | Education, setup, trust | Inventory titles, URLs, thumbnails, age, captions, and privacy implications. |
| BE-020 | Repository media records | `data/media-manifest.json`, `data/stock-asset-ledger.json`, and `data/stock-trade-remnants.json` are starter records. | Rhino theme fork | Repository data files                                | Engineering / Design | Observed      | Project-owned | Governance and maintainability | Extend later; do not duplicate their responsibilities in this document. |
| BE-020 | Logo master | Full horizontal Rhino Lapidary logo with striped black wordmark, red rhino mark, black rounded rectangular frame, and white field | `Rhino Lapidary Banner.psd` | 12900 x 4425 px, CMYK Photoshop source | Authoritative source evidence | Use as the production export source. Do not use the large PSD directly in the storefront. |
| BE-021 | Logo print export | Full horizontal logo matching the Photoshop master | `Rhino Lapidary Banner.pdf` | 1 page, 3096 x 1062 pt, Photoshop image-conversion export | Approved source evidence | Keep as print/reference evidence. It is not a substitute for a clean web export. |
| BE-022 | Logo raster reference | Full horizontal logo on white | `rhino.png` | 800 x 274 px, RGB raster | Approved reference | Useful for visual confirmation and prototypes. Re-export production PNG or WebP assets from the PSD. |
| BE-023 | Core brand colors | Black, white, and a vivid Rhino red | Logo sources above | Exact raster red sampled as `#ED1C24`; black `#000000`; white `#FFFFFF` | Approved brand evidence | These are the only historically consistent core colors and govern the launch palette. |
| BE-024 | Legacy campaign palette | Black background, white type, dark burgundy framing, vivid red accents, and ochre gold feature bars/gears | `Rhino_Lapidary_EM-1_copy.jpg` | 2048 x 735 px; dominant campaign values approximately `#040001`, `#791716`, `#EA2D35`, and `#B6830D` | Approved historical evidence | Burgundy and gold may become subordinate website accents. Gradients, gear decoration, and dense advertising composition are not launch UI patterns. |
| BE-025 | Legacy campaign composition | Heavy all-caps type, prominent product photograph, red connector lines, bordered title modules, and capability callouts | `Rhino_Lapidary_EM-1_copy.jpg` | Landscape advertising composite | Historical evidence | Preserve the direct capability hierarchy and connector-line idea. Reject the density, gradient bars, and decorative gears for ordinary storefront use. |
| BE-026 | EM-1 product photograph | Front-facing machine photograph shown inside the advertising composite | `Rhino_Lapidary_EM-1_copy.jpg` | Machine photographed against a stucco wall and blue cloth | Existing product evidence; reshoot recommended | May support historical/editorial content. It should not be the sole launch product hero because the setting, crop, and composite treatment reduce technical clarity. |
| BE-027 | Shipping policy | USPS, UPS, or freight; typical delivery described as 3–10 days; freight may take up to 4 weeks; other carriers may be possible | `Rhino Lapidary Policies - Warranty, Shipping, Returns.pdf`, page 1 | Source contains editorial errors and requires operational review | Current policy source; needs legal/operations approval | Use as the source for B-023 and B-024. Do not silently publish corrected wording without approval. |
| BE-028 | International shipping policy | International shipping is described as broadly available after customer contact; brokerage and customs fees are assigned to the customer | Same policy PDF, page 1 | Country, market, voltage, and warranty limitations are not fully defined | Needs legal/operations review | Must be reconciled with Shopify Markets and actual product eligibility before storefront use. |
| BE-029 | Damage and return policy | Customers are instructed to retain packing material, receipts, and damage photos; returns are described as eligible within 30 days when complete and unworn; later returns may incur a 50% restocking fee | Same policy PDF, page 1 | Source wording contains ambiguity and typographical errors | Needs legal/editorial review | Preserve the operational facts while creating approved customer-facing copy later. |
| BE-030 | Support contact | Defective product inquiries direct customers to `262-377-4666` and `mail@thegemshop.com` | Same policy PDF, page 1 | The Gem Shop contact identity is explicit | Needs business identity confirmation | Supports the current The Gem Shop service role but must agree with B-003 identity architecture. |
| BE-031 | General warranty | Machines, polishers, diamond blades, flex shafts, bits, and motors are described as warranted to the original purchaser for one year except where separately noted | Same policy PDF, pages 1–2 | Coverage, exclusions, proof of purchase, repair or replacement discretion, and transportation-cost exclusions are stated | Needs legal approval before publication | Use as the controlling source for future warranty summaries, but do not compress exclusions into misleading trust badges. |
| BE-032 | Limited warranty exceptions | Wet grinding and polishing tools and motors purchased separately are described as having 90-day limited warranties; diamond blades, flex shafts, and bits have specific exclusions | Same policy PDF, page 2 | The source distinguishes normal wear and misuse from manufacturing defects | Needs legal approval before publication | Later product data must support product-specific warranty summaries instead of a universal “1 year warranty” label. |


## Required Shopify admin inspection

Record evidence without changing settings or content.

| Area | Inspect | Capture |
|---|---|---|
| Content > Files | Rhino logos, product diagrams, manuals, social graphics, videos, old exports | File name, URL, dimensions, type, apparent owner, usage, last modified, duplicate status |
| Products | Rhino products and variants | Product names, vendor, type, tags, media, descriptions, claims, specs, warranty and shipping statements |
| Online Store > Themes > Customize | Logo, favicon, colors, typography, social links, section media and copy | Preview theme name, setting path, current value, source classification |
| Content > Menus | Main and footer menus | Rhino, The Gem Shop, support, warranty, social, policy, and external identity references |
| Online Store > Pages and blog posts | About, support, manuals, education, contact | Identity claims, voice, images, embeds, outdated content |
| Settings > Policies | Refund, privacy, terms, shipping and purchase options policies | Current approved text, responsible owner, last review date |
| Settings > General / Brand | Store identity and reusable brand assets | Business name, logo variants, cover image, social links, unresolved legal entity questions |

## Missing evidence and decision log

| ID | Missing item or decision | Required owner | Blocks | Notes |
|---|---|---|---|---|
| MD-001 | Authoritative Rhino logo package and permitted variants | Brand owner | B-004, B-015, B-016, B-017 | **Resolved for source evidence:** PSD, PDF, and raster reference supplied. Production exports are still required.
| MD-002 | Media reuse permission for The Gem Shop product imagery | Business / media owner | B-018, B-017, B-019 |
| MD-003 | Legal seller of record and Organization structured-data entity | Business / legal owner | B-003, B-033 |
| MD-004 | Current manufacturer, supplier, fulfillment, service, repair, and warranty responsibilities | Business / legal owner | B-003, B-023, B-033 |
| MD-005 | Approved technical source for EM-1 and other machine claims | Product owner | B-002, B-021, B-023 | **Still Open:** machine specification documents exist in the repository and must by audited by the development-environment agent.
| MD-006 | Current warranty, returns, freight, damage, international, and lead-time policies | Operations / legal owner | B-023, B-024, B-033 | **Partially resolved:** a current policy source was supplied. Publication approval and operational reconciliation remain required.
| MD-007 | Authoritative Rhino social accounts and channel ownership | Marketing / brand owner | B-003, B-016, B-017 |
| MD-008 | Final brand approver and substitute approver | Product owner / business owner | B-032 and all approval-gated PBIs |

## Completion evidence

B-001 can close when:

1. The repository and public evidence above are reviewed for accuracy.
2. The Shopify admin inspection is completed and appended without changing admin state.
3. Every external asset has an owner and usage-rights status.
4. Missing evidence is converted into tracked blockers or follow-up PBIs.
5. The implementation record links this inventory and records its evidence date.