# J2/G4 tiered photographic navigation gap report

**Assessment:** the integrated catalog supplies a safe temporary hierarchy, but it does not yet satisfy the Product Owner's complete hierarchy of distinct photographic collection pages. No collection, menu, publication, or other Shopify Admin mutation was performed.

## Existing and approved destinations

| Desired category | Current safe destination | Photographic collection page | Evidence status |
| --- | --- | --- | --- |
| All Products | `/collections/all` | Yes | Native Shopify all-products collection; G4 default photographic grid |
| Machines | `/collections/machines` | Yes | Verified published collection identity in the navigation contract |
| Replacement Parts | `/collections/all?view=directory#g-replacement-parts` | No | Governed G role-directory anchor only |
| Consumables | `/collections/all?view=directory#g-consumables` | No | Governed G role-directory anchor only |
| Accessories | `/collections/all?view=directory#g-accessories` | No | Governed G role-directory anchor only |

Repository evidence records `/collections/replacement-parts`, `/collections/parts`, `/collections/consumables`, and `/collections/accessories` as missing or unapproved after preview route probes returned 404. `/collections/em-1-parts` is not approved as complete compatibility or role-membership authority and cannot substitute for Replacement Parts.

## Classification capability and limits

The existing Epic G authority can safely group governed Products in the secondary directory by approved role and can expose approved machine-context links. It does not make Shopify navigation hierarchy equivalent to Product classification, does not prove complete collection membership, and does not authorize compatibility claims.

The current classification can be used as a reviewed input to future collection planning, but each photographic category page still needs an explicit collection identity, membership rule or curated membership, publication decision, and ownership approval. Products with missing or ambiguous authority must remain excluded or neutrally presented rather than inferred into a category.

## Safe navigation now

- Expose All Products and Machines as photographic collection destinations.
- Expose Replacement Parts, Consumables, and Accessories only as clearly governed directory anchors.
- Keep Catalog as a disclosure parent with an explicit All Products child.
- Suppress nonexistent handles, empty destinations, duplicated machine-type links, and unapproved subgroups.
- Do not expose Saws, Laps, Shaping, blade type, grinding accessories, or polishing supplies as separate collection pages until distinct identities and memberships are verified.

## Shopify Admin work requiring separate approval

1. Decide whether Replacement Parts, Consumables, and Accessories should be automated or manual collections.
2. Approve exact handles, titles, membership criteria, exclusions, and publication state.
3. Create or approve the collections and verify their Product membership without inferring compatibility.
4. Publish them to the intended preview sales channel and verify nonempty routes.
5. Update only the verified preview menu `preview-primary-navigation-menu` from directory anchors to approved photographic destinations.
6. Re-run route, filtering, pagination, mobile, keyboard, zoom, accessibility, empty-state, and J2 cart/toast acceptance.

Production `main-menu`, production theme `158579622085`, and all collection mutations remain out of scope.

## Remaining completion criteria

The original tiered-navigation requirement is complete only when every desired top-level category has an approved, published, nonempty photographic collection page; any authorized subgroup has its own verified identity and membership; desktop and mobile navigation use those destinations without duplicates or dead links; and the full catalog/cart acceptance matrix passes on the unpublished preview theme.
