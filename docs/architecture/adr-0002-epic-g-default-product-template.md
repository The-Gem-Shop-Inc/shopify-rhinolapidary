# ADR-0002: Retain the ordinary Product template for Epic G MVP

**Status:** Accepted for G-PBI-001 repository scope, 2026-10-16.
**Supersedes:** Only ADR-0001's proposed consumable/accessory/replacement-part template split. Its implemented machine-template decision is unchanged.

## Evidence and decision

Current G Products use templates/product.json and sections/main-product.liquid. They already provide native identity, price, Variant selection, quantity, inventory/purchase state, media, description and an optional SKU block. No evidenced G MVP requirement needs three specialized templates.

Retain the existing default template and shared section. Future G batches may add conditional approved fit/empty-state presentation within that architecture. This ADR does not implement those features or authorize Shopify template assignments, settings, pushes or publication.

G1 is a repository consumer contract. It consumes E's approved class/identity/owner rows and F's current reconciliation/release evidence. It does not introduce a relationship graph, an approval registry, a new native-commerce policy or a template renderer.

## Authority and freshness

Verify the historical F binding and source/receipt hashes. Reading them does not renew them. Current fit requires a complete current Admin observation, exact approved full reference set, class/identity and receipt checks. Relationship approval and a currently published customer destination are separate outcomes. Keep compatible, included, optional and recommended meanings distinct.

Missing SKU/media/description/optional item attributes/resources are readiness observations. They do not disable native commerce or fabricate values. Product availability remains the native Shopify decision.

## Consequences and boundaries

- No product.consumable.json, product.accessory.json or product.replacement-part.json is required for G MVP.
- Preserve templates/product.machine.json, F relationship/compiler output and all historical receipts unchanged.
- Use the G foundation contract for later forward fit and route consumers; do not infer class or fit from titles, tags, types, descriptions, family names or collections.
- G2 is the next customer-experience batch. H/I/M/N remain post-O; account ownership and history reorder remain O work.

