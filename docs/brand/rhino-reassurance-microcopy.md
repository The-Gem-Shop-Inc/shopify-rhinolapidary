# Rhino Warranty, Freight, Support, and Reassurance Microcopy

**PBI:** B-023  
**Status:** Approved rules; customer-facing legal and operational copy remains review-gated  
**Owner:** Business, Legal, Operations, Support, Content, Product, and Shopify Admin  
**Last reviewed:** 2026-07-31

## Purpose

Reassurance microcopy should reduce uncertainty at purchase decision points
without shortening policies into misleading promises.

The source policy describes parcel and freight shipping, possible international
shipment, damage procedures, a 30-day return period, a general one-year limited
warranty with exceptions, and 90-day coverage for some separately purchased
tools and motors.

Those source terms require legal, operational, and editorial approval before
publication.

## Message classes

### Informational

Explains a condition without preventing purchase.

Examples:

- Freight delivery may apply
- Pickup availability
- Review compatibility
- Manual available

### Decision-critical

May change whether or how the customer purchases.

Examples:

- Quote required
- Voltage must be confirmed
- International review required
- Product is not returnable
- Warranty duration differs by product

### Recovery

Explains what to do after a problem.

Examples:

- Shipment arrived damaged
- Product may be defective
- Replacement part is needed
- Order or delivery requires support

Decision-critical and recovery messages must remain visible without opening a
marketing accordion.

## Source-of-truth map

| Message | Primary source | Owner |
|---|---|---|
| Parcel or freight method | Shipping configuration and approved shipping policy | Operations |
| Freight requirement | Product data or freight classification | Operations and Product Data |
| Delivery estimate | Current carrier or approved operating standard | Operations |
| Pickup availability | Shopify location and approved pickup process | Operations |
| International availability | Markets, product restrictions, and approved policy | Operations and Business |
| Brokerage and customs responsibility | Approved international policy | Legal and Operations |
| Return period and condition | Approved return policy | Legal and Business |
| Non-returnable items | Approved return policy and product data | Legal and Product |
| Warranty duration | Product-specific warranty class | Legal and Business |
| Warranty exclusions | Approved warranty policy | Legal |
| Support contact | Approved support identity and current contact details | Support and Business |
| Repair responsibility | Approved service process | Support and Business |
| Replacement parts | Current product relations and inventory | Product Data and Support |
| Shipping damage procedure | Approved shipping damage process | Operations and Support |

## Draft microcopy status model

Every proposed message uses one of:

- Safe neutral
- Needs operations approval
- Needs legal approval
- Needs product data
- Blocked

A message is not publishable merely because it appears in this guide.

## Freight

### Compact label

`Freight delivery`

**Status:** Safe neutral when the product freight flag is confirmed.

### Product-page summary

`This item may require freight delivery. Shipping charges and delivery timing depend on the destination and current fulfillment arrangements.`

**Status:** Needs operations approval.

### Action

`View freight information`

or:

`Ask about freight delivery`

Do not use:

- Free freight
- Flat-rate freight
- Freight included
- Delivered in a specific number of days

unless current product and destination rules support the claim.

### Generalization decision

Do not publish a universal freight cost range.

The source material is not sufficient to support one amount across machines,
destinations, services, and current carrier conditions.

## Parcel shipping

### Summary

`Shipping options and estimates are calculated from the product, destination, and selected delivery method.`

**Status:** Needs operations approval against current Shopify configuration.

Do not promise the legacy 3-to-10-day range until operations confirms that it
still reflects current service.

## Pickup

### Compact label

`Pickup availability`

### Summary

`Contact us to confirm whether pickup is available for this product.`

**Status:** Needs operations approval.

Do not display `Pickup available` merely because a Shopify location exists.
Product eligibility and preparation requirements must also be confirmed.

## International orders

### Compact label

`International review required`

### Summary

`International availability depends on the product, destination, and electrical configuration. Contact us before ordering to confirm eligibility.`

**Status:** Needs operations and technical approval.

### Customs summary

`Brokerage, customs, duties, or other import charges may apply and may be the customer’s responsibility.`

**Status:** Needs legal approval.

Do not use:

`Ships worldwide`

even though the legacy policy describes broad international shipment. Product,
market, voltage, certification, support, and carrier constraints must be
confirmed first.

## Warranty

### Generic trust marker

Heading:

`Warranty details`

Summary:

`Warranty coverage and exclusions vary by product. Review the applicable terms before purchase.`

**Status:** Safe neutral.

### Machine summary

`This machine may qualify for a one-year limited warranty for defects in materials and workmanship. Exclusions, proof-of-purchase requirements, and transportation costs apply.`

**Status:** Needs legal and product-specific approval.

Do not publish the machine summary unless the product warranty class confirms
the one-year term.

### Ninety-day product summary

`This product may qualify for a 90-day limited warranty.`

**Status:** Blocked until the product is assigned the correct warranty class.

### Warranty action

`Review warranty terms`

Avoid:

- Full warranty
- Complete protection
- Guaranteed for one year
- Worry-free warranty
- Lifetime support

## Returns

### Summary

`Eligible products may be returned within 30 days of delivery when they are complete and show no signs of wear or damage. Exclusions and return-shipping costs may apply.`

**Status:** Needs legal and operational approval.

### Action

`Review the return policy`

### Non-returnable condition

`This item may not be eligible for return. Review the return policy or contact support before ordering.`

**Status:** Needs product-specific data and legal approval.

Do not display a general `30-day returns` badge without a link or qualification
because the source policy includes non-returnable categories and condition
requirements.

## Shipping damage

### Compact heading

`Shipment arrived damaged?`

### Recovery copy

`Keep the packaging, receipts, and photographs of the damage. Contact support promptly so the shipment and carrier requirements can be reviewed.`

**Status:** Needs operations approval.

This wording is based on the supplied policy but avoids promising that Rhino or
the carrier will approve a claim.

## Suspected defect

### Heading

`Product problem or suspected defect`

### Recovery copy

`Stop using the product if continued operation could cause damage or create a safety concern. Gather your proof of purchase, product details, and photographs, then contact support.`

**Status:** The first sentence requires technical and legal approval.

A safer neutral version is:

`Gather your proof of purchase, product details, and photographs, then contact support.`

## Support identity

The supplied policy directs customers to:

- `262-377-4666`
- `mail@thegemshop.com`

These details identify The Gem Shop as the current contact in the source
material.

Do not publish the contact block on Rhino surfaces until the identity
architecture confirms:

- Support owner
- Hours
- Geographic scope
- Repair role
- Warranty administration role
- Current phone and email ownership

### Neutral action labels

- Contact support
- Ask a compatibility question
- Report shipping damage
- Request warranty assistance
- Find replacement parts
- View manuals

## Replacement parts

### Trust marker

Heading:

`Replacement parts`

Summary:

`Use the machine family and model to find confirmed compatible parts.`

**Status:** Safe neutral when the destination supports structured compatibility.

### Support fallback

`Compatibility not confirmed? Contact support before ordering.`

Do not say:

`Parts always available`

unless inventory and service policy support that promise.

## Product page placement

Recommended order near the purchase area:

1. Purchase and availability
2. Freight or parcel condition
3. Voltage or regional review
4. Warranty details
5. Compatibility
6. Support action

Do not show five equally prominent reassurance cards. Use a compact list with
dividers and expandable detail where appropriate.

## Cart placement

The cart may repeat only information that remains accurate for the selected
variant and destination.

Suitable cart reminders:

- Freight delivery
- International review required
- Confirmed product-specific return restriction
- Link to warranty or support information

Do not use the cart to introduce a new legal condition that was absent from the
product page.

## Policy placement

Complete legal and operational terms remain in approved Shopify policy pages.

Microcopy links to those pages but does not replace them.

## Notification placement

Notifications may include:

- Support contact
- Delivery preparation
- Damage inspection reminders
- Warranty documentation
- Manuals

Every notification change requires:

- Admin change record
- Preview or test message
- Release note
- Rollback copy
- Identity and legal review where applicable

## Review matrix

| Copy | Required approval |
|---|---|
| Neutral link label | Content |
| Product-specific freight condition | Operations and Product Data |
| Freight amount or timing | Operations |
| Pickup availability | Operations |
| International eligibility | Operations, Business, Technical |
| Customs responsibility | Legal |
| Warranty duration | Legal, Business, Product Data |
| Return period or exclusion | Legal and Business |
| Support contact | Business and Support |
| Repair commitment | Business, Support, Legal |
| Damage process | Operations and Support |

## Follow-up implementation surfaces

Create later PBIs for:

1. Product-specific reassurance data
2. Product-page trust-marker rendering
3. Cart freight and policy reminders
4. Approved Shopify policy migration
5. Notification template review
6. Support page and contact routing
7. Warranty-class data architecture
8. International product eligibility
9. Checkout-entry message review
10. Shipping damage and delivery inspection guidance

## Completion condition

B-023 closes when this guide and source map are approved.

Actual policy changes, product data, notifications, cart messages, and support
routes remain separate implementation work.