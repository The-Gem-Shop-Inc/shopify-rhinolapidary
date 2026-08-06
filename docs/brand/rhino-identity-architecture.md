# Rhino, The Gem Shop, and Silica-Gem Identity Architecture

**PBI:** B-003  
**Status:** Proposed; not approved for storefront use  
**Evidence basis:** Epic B discovery dated 2026-07-30  
**Required reviewers:** Business Owner, Legal or Claims Reviewer, Content Owner, SEO owner, Shopify Admin Owner, Product Owner

This document depends on the approved positioning and voice boundary in `docs/brand/rhino-brand-positioning.md`.

## Identity architecture
### Entity model

| Entity | Proposed role | Current evidence         | Approval status |
|---|---|--------------------------|----------|
| Rhino Lapidary | Customer-facing equipment brand, product ecosystem, and dedicated storefront identity | Current public Rhino site and product presence | Approved |
| Silica-Gem | Manufacturing and sourcing role described by current Rhino material | Current Rhino About page | Approved |
| The Gem Shop | Customer service, website management, fulfillment, and exclusive American supplier roles described by current public material | Current Rhino About page and The Gem Shop collection | Approved |
| Legal seller of record | Entity responsible for the Shopify transaction, receipts, taxes, terms, and applicable consumer obligations | This role is fulfilled by The Gem Shop | Approved |
| Warranty provider | Entity responsible for warranty promises, administration, repair authorization, parts, and exclusions | Not established with sufficient precision | Unresolved |
| Repair and service provider | Entity responsible for troubleshooting, repair intake, parts, turnaround, and geographic limits | This role is fulfilled by The Gem Shop | Approved |

### Required business decisions

Before B-003 is approved, record:

1. The legal seller of record for `rhinolapidary.com`.
2. The owner of the Rhino brand and marks.
3. The current manufacturer and sourcing responsibilities for each machine family.
4. The United States and international distributor or supplier responsibilities.
5. The fulfillment entity and return address.
6. The customer support entity and contact channels.
7. The warranty issuer and administrator.
8. The repair and service process owner.
9. The entity that should appear in Organization structured data.
10. The authoritative social accounts and whether The Gem Shop channels appear with explicit labels.

## 5. Proposed identity language

The following copy is draft language for review. Do not publish until the entity model is approved.

### Compact storefront description

Rhino Lapidary provides specialized lapidary machines, compatible parts, accessories, and consumables with practical product information and ownership support.

### Compact partner explanation

Rhino equipment is supported through defined manufacturing, supply, fulfillment, and customer-service partners. See About Rhino and Support for the current responsibilities and contact paths.

This version is deliberately neutral until the named roles are approved.

### Medium About or product trust description

Rhino Lapidary is built around specialized lapidary machinery and the equipment ecosystem that supports it. The storefront is intended to help customers evaluate machine capability, understand setup and delivery requirements, locate compatible parts and consumables, and reach the correct support contact throughout ownership. The roles of Rhino, Silica-Gem, The Gem Shop, and the legal seller of record must be stated explicitly in the approved version of this description.

### Full identity statement template

Rhino Lapidary is the customer-facing brand for Turkish lapidary equipment manufacturing company: Silica-Gem. The Gem Shop, Inc. operates the storefront and is responsible for [transaction, tax, terms, and fulfillment responsibilities] [approved supplier, service, fulfillment, showroom, or support responsibilities]. Silica-Gem is responsible for [approved manufacturing or sourcing responsibilities]. Warranty and repair requests are handled by [approved entity] according to the published warranty and service terms.

Replace every bracketed field with approved facts before use.

## 6. Placement rules

| Surface | Required identity treatment |
|---|---|
| Header | Rhino identity only; do not crowd navigation with partner explanation |
| Footer | Compact legal seller and support responsibility, plus clearly labeled partner or social links |
| Homepage | Rhino promise and customer journey; partner explanation only where it builds trust |
| Product page | Seller, fulfillment, support, warranty, and freight responsibility near the relevant decision |
| About page | Full entity history and current responsibilities |
| Contact or support page | Clear routing by sales, order, warranty, repair, parts, and technical question |
| Policies | Legal seller and policy owner consistent with checkout and notifications |
| Structured data | Legal and brand entities must match visible content and verified business facts |
| Social metadata | Rhino title and imagery; partner naming only when context requires it |
| Order and shipping notifications | The entity responsible for the transaction and fulfillment must be unmistakable |

## 7. Claims requiring verification

Create or link claim records for:

- EM-1 “Everything Machine.”
- Four-machine or multi-machine equivalence.
- Manufacturing origin and manufacturing entity.
- Silica-Gem responsibilities.
- The Gem Shop exclusive supplier wording and territory.
- CE Mark or other certification.
- Patent or patent-pending language.
- Warranty duration and provider.
- Parts availability.
- Service and repair availability.
- International availability.
- Performance, torque, speed, filtration, capacity, or durability claims.

Each record needs a source, owner, approval status, approved wording, review date, and expiration condition.

## 8. Approval checklist

- [ ] Business Owner completes the entity model.
- [ ] Legal or Claims Reviewer approves the named roles and compact, medium, and full descriptions.
- [ ] Shopify Admin Owner confirms store details, policies, notifications, and social settings do not contradict the document.
- [ ] SEO owner confirms structured-data implications.
- [ ] Product Owner records final approval and review date.
- [ ] The implementation record links the approved identity language and unresolved claim records.