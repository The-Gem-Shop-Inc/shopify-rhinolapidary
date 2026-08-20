# C-PBI-010 Implementation Record

## Summary

- Extended `data/global-navigation-ia.json` with the Batch 2 desktop mega-menu content model.
- Modeled candidate groups: `Shop by machine`, `Shop by product role`, `Parts and consumables`, and `Support`.
- Kept only preview-verified, approved route candidates marked as launch-ready, and kept unresolved destinations blocked or planned.
- Did not invent route handles, Shopify IDs, variant IDs, metafield keys, support destinations, social URLs, manuals, ownership, or international availability.

## Active Route Candidates

- `Machines`: `/collections/machines`
- `Contact`: `/pages/contact`

These remain unpublished in rendered mega-menu/drawer output until a preview-isolated menu is approved.

## Blockers

- `dep-preview-menu-isolation`: live theme `158579622085` and preview theme `158631198917` both reference `main-menu`.
- `dep-machine-family-route-strategy`: family/model destinations need verified routes and Product Owner approval.
- `dep-parts-by-machine-route`: compatibility route and ownership are unresolved.
- Existing unresolved support, manuals, warranty, shipping, accessories, consumables, and replacement-parts dependencies remain unresolved.

## Validation

- `npm run validate:global-navigation-ia`: passed
- `npm run test:global-navigation-ia-validator`: passed
- `npm run validate:registers`: passed

## Rollback

Revert the `desktop-mega-menu-model` and added dependencies from `data/global-navigation-ia.json`, then rerun the IA validator and register validator.

