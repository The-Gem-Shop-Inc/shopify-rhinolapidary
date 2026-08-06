# Rhino Product Naming and Technical Terminology Rules

**PBI:** B-022  
**Status:** Baseline approved; source audit required before closure  
**Constraint:** Do not infer machine specifications that are not supported by repository documents

## 1. Naming principles

- Lead with the product identity customers recognize.
- Include the technical differentiator needed for search and comparison.
- Keep product titles stable enough for support and reorder workflows.
- Put structured specifications in metafields, not increasingly long titles.
- Do not repeat the complete product title in every variant.
- Preserve official model punctuation such as `EM-1`.
- Avoid promotional claims inside product names.

## 2. Product-title patterns

These patterns establish structure. Exact machine descriptors must come from approved specification documents.

### Machines

`Rhino {model or family} {size when part of the recognized model}: {machine type}`

Examples requiring source confirmation:

- `Rhino EM-1: Everything Machine`
- `Rhino Sawmaster 18: Slab Saw`
- `Rhino Lapmaster 12: Flat Lap Machine`

Do not publish the examples until the development-environment audit confirms the machine type and official model naming.

### Replacement parts

`{Component name} for Rhino {compatible model or family}`

Add a dimensional differentiator only when needed:

`{Size} {component name} for Rhino {model}`

### Accessories

`{Accessory name} for Rhino {compatible model or family}`

### Consumables

`{Size} {material or construction} {product type}, {grit} grit`

Example based on existing catalog evidence:

`6 in Resin Bond Diamond Wheel, 3000 grit`

### Kits and bundles

`{Primary use} Kit for Rhino {model}`

The title must not imply included items that differ by variant. Bundle contents belong in structured data and description.

## 3. Variant naming

Variant titles contain only the selection difference.

Approved:

- `80 grit`
- `120 V`
- `6 in`
- `Left side`
- `Machine only`
- `Machine with accessory kit`

Avoid:

- Repeating the complete product title
- `Default Title` on products that need customer selection
- Internal codes without a customer explanation
- Combining unrelated dimensions in one ambiguous value

## 4. Units and notation

| Quantity | Format | Example |
|---|---|---|
| Inches | number + `in` | `6 in` |
| Fractional inches | decimal when operationally accepted, otherwise approved fraction | `1.5 in` |
| Millimeters | number + `mm` | `25 mm` |
| Pounds | number + `lb` | `48 lb` |
| Kilograms | number + `kg` | `21.8 kg` |
| Voltage | number + `V` | `120 V` |
| Frequency | number + `Hz` | `60 Hz` |
| Speed | comma-separated number + `rpm` | `1,725 rpm` |
| Horsepower | approved number + `hp` | `1/3 hp` |
| Grit | number + `grit` | `280 grit` |
| Diameter | value + `diameter` in prose; store structured value separately | `6 in diameter` |
| Arbor | value + `arbor` | `1 in arbor` |
| Warranty period | number + full time unit | `90 days`, `1 year` |

Rules:

- Do not use the inch quotation mark in product titles.
- Add a space between the number and unit.
- Keep units singular as symbols.
- Use a leading zero for values below one: `0.5 in`.
- Use one system consistently in a field. When both systems are needed, show US customary first and metric in parentheses unless market requirements decide otherwise.
- Do not use `#80` for grit.
- Do not uppercase `RPM`; use `rpm`.

## 5. Capitalization and punctuation

- Product titles: title case
- Variant names: sentence case except proper models
- Specifications and filter labels: sentence case
- Model names: preserve official capitalization
- Use a colon between model identity and explanatory machine type
- Use commas to separate grit or another short trailing specification
- Avoid slashes when “and” or a structured field is clearer
- Avoid ampersands except in official source names

## 6. Compatibility language

Use only one of these statuses:

- `Compatible with`
- `Required for`
- `Optional for`
- `Included with`
- `Not compatible with`
- `Compatibility not confirmed`

Compatibility must not be inferred from similar dimensions alone.

## 7. Customer-facing and admin terminology

| Concept | Customer-facing language | Admin or structured value |
|---|---|---|
| Machine family | Recognized family or model name | Stable controlled identifier |
| Compatibility | Plain model names and status | Product-reference metafield or controlled relation |
| Grit | `280 grit` | Numeric grit plus normalized type |
| Diameter | `6 in diameter` | Numeric value plus unit |
| Warranty | Approved short summary with link | Product-specific warranty class/reference |
| Freight | Plain delivery expectation and action | Freight flag, class, and operational note |
| Included item | “Included” only when confirmed | Structured included-component record |
| Replacement part | Clear component name and compatible machine | Product relation and part identifier |

## 8. Prohibited naming patterns

- “Best,” “ultimate,” “professional grade,” or other unsupported superiority claims
- “Universal” without documented compatibility
- “Complete kit” without a maintained contents list
- “One size fits all”
- Warranty duration in a product title
- Freight or lead-time promises in a product title
- Vendor and store name repeated unnecessarily
- HTML fragments or old-site formatting in titles
- Unexplained internal abbreviations

## 9. Shopify admin implementation rules

B-022 does not rename products.

Before any title, variant, or handle change:

1. Export the current products.
2. Run the repository source audit described below.
3. Review search, filters, product cards, cart lines, notifications, and support documents.
4. Preserve handles unless SEO and redirect review explicitly approves a change.
5. Record the admin change and rollback source.
6. Retest product links and search suggestions.
7. Update redirects if any handle changes are approved.

## 10. Development-environment audit dependency

B-022 remains open until the development-environment agent inventories the machine specification documents and reports conflicts, official model names, and supported descriptors.

Use the companion prompt:

`docs/brand/prompts/b-022-machine-specification-terminology-audit.md`