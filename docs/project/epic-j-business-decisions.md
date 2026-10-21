# Epic J decisions — J0 planning record

No business decision blocks the proposed **J1 batch: J-PBI-001 and J-PBI-002**. It corrects two reproduced native engineering defects while retaining the existing notification/cart/checkout flow. None of the records below is an approval or an immediate request to reopen Epic G decisions.

The authoritative planning record is [epic-j-business-decisions.json](../../data/epic-j-business-decisions.json). Existing G006 price/title decisions remain in their original ledger; J does not create a new Product identity or approval system.

| Decision | Blocks only | Required disposition | Owner |
| --- | --- | --- | --- |
| J-DEC-001 | J-PBI-003 | Exact Product logistics mapping and approved freight/oversize/lead-time/pickup/split-shipment copy, with operational K authority | Product Owner + Epic K |
| J-DEC-002 | J-PBI-004 | Whether notes/PO/contact guidance should be offered, optional input, approved wording and handling channel; tax exemption is not promised | Product Owner + Epic L/service |
| J-DEC-003 | J-PBI-005 | Existing G006 MR16 and Saw Vice dispositions, plus any exact Product-level safeguard authority and copy | Product Owner / G commercial owner |
| J-DEC-004 | J-PBI-006 | Any change to current accelerated checkout placement; verified provider eligibility and desired discount workflow | Product Owner + payments/discount operations |
| J-DEC-005 | J-PBI-007 | Whether cart relationship guidance is needed; exact approved meaning, complete sources, copy and G003 operating lifecycle | Technical/Product Owner + Epic G |

MR16 remains $0.00 with specification and selling price unresolved. Saw Vice remains a generic $0.00 Variant: model prices $38/$110/$120/$140 do not approve a Product/Variant structure. Neither has an approved free-sale designation or purchase restriction. J0 introduces no price-threshold rule. A future warning, hold or block requires explicit Product-level authority; the existence of a zero price is insufficient.

Shipping rates/profiles, local pickup, taxes, payment methods, inventory rules and abandoned-checkout recovery are Admin/operational settings. Theme copy cannot configure them. Basic plan availability of an API does not grant checkout deployment entitlement. All future feature implementations remain pending PBI review.

## Pencil-friendly worksheet specification

If these optional features are selected, prepare **two monochrome US Letter pages**, portrait, 0.6 inch margins, 12pt body text, 5mm empty square checkboxes and at least three ruled handwriting lines per decision. Put J-DEC-001/002/003 on page one and J-DEC-004/005 on page two. Each card must include the exact ID, affected PBI, one-sentence question, and these choices: **retain existing behavior**, **defer this feature**, or **approve the attached exact specification**. No choice is preselected.

Provide blank fields for exact Product/Variant GIDs or approved route, approved customer wording/attachment ID, operating owner, effective date and signer initials/date. The approval choice is incomplete without its exact specification. Include a footer stating that this worksheet does not itself authorize catalog writes, shipping/payment configuration, a new app, publication, compatibility grants or receipt renewal. Native J1 reliability fixes require none of these optional selections.
