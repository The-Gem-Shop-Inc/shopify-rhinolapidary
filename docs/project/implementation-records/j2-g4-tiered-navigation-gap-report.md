# J2/G4 tiered photographic navigation gap report

**Fresh observation:** November 16, 2026, Admin GraphQL `2026-10`, canonical shop `gid://shopify/Shop/79279947973`. No collection, menu, publication, Product, or theme mutation was performed.

The integrated catalog still supplies a safe temporary hierarchy, but Shopify now contains more usable collection identities than the historical G4 report recorded. Existence and Online Store publication do not approve Product classification, machine compatibility, fit, or complete membership.

## Existing photographic destinations

| Collection | GID | Count | Active / draft observed | Online Store | Disposition |
| --- | --- | ---: | ---: | --- | --- |
| Machines | `gid://shopify/Collection/355080962245` | 11 | 8 / 3 | Published | Approved G4 photographic destination; membership is not compatibility authority |
| Saws | `gid://shopify/Collection/364020531397` | 6 | 4 / 2 | Published | Existing current-menu photographic route; do not infer saw compatibility |
| Flat Laps | `gid://shopify/Collection/364020564165` | 2 | 2 / 0 | Published | Existing current-menu photographic route |
| Shaping Machines | `gid://shopify/Collection/364020596933` | 4 | 3 / 1 | Published | Existing current-menu photographic route; role boundaries remain unapproved |
| EM-1 Parts | `gid://shopify/Collection/355081584837` | 49 | 45 / 4 | Published | Nonempty, but machine compatibility and complete membership remain unapproved |
| Blades & Wheels | `gid://shopify/Collection/355082010821` | 11 | 10 / 1 | Published | Nonempty photographic route; broad G4 category membership is unapproved |
| Nuts & Screws | `gid://shopify/Collection/355082207429` | 18 | 11 / 7 | Published | Nonempty; category and machine-compatibility membership require approval |
| Flexible Shaft Accessories | `gid://shopify/Collection/366292107461` | 24 | 24 / 0 | Published | Nonempty photographic route, but not approval for the broad Accessories taxonomy |

All membership connections were paginated to completion. Counts include draft Products; the active/draft split is retained so an Admin count is not mistaken for the customer-visible count.

## Empty destinations that must stay suppressed

| Collection | GID | Count | Online Store |
| --- | --- | ---: | --- |
| TrimMaster Parts | `gid://shopify/Collection/355081224389` | 0 | Published |
| JadeMaster Parts | `gid://shopify/Collection/355081355461` | 0 | Published |
| 18" LapMaster Parts | `gid://shopify/Collection/355081486533` | 0 | Published |

Publication does not make an empty collection promotable. These routes must remain absent from photographic navigation until membership and Product Owner approval exist.

## Category gaps and safe fallbacks

Fresh handle reads returned no collection for `/collections/replacement-parts`, `/collections/parts`, `/collections/consumables`, or `/collections/accessories`. The approved preparation therefore keeps these directory-only fallbacks:

- Replacement Parts → `/collections/all?view=directory#g-replacement-parts`
- Consumables → `/collections/all?view=directory#g-consumables`
- Accessories → `/collections/all?view=directory#g-accessories`

`/collections/em-1-parts`, `/collections/blades-wheels`, `/collections/nuts-screws`, and `/collections/flexible-shaft-accessories` are real nonempty photographic pages. They cannot silently substitute for the missing broad categories because their scope and relationships differ.

## Authority boundary

The historical G2/G3 receipts remain expired and fail closed. This fresh read records collection identity, publication, count, and Product status membership only. It does not renew Product roles, machine context, fit, compatibility, or Product Owner approval. Any relationship between a part and a machine still requires current classification or compatibility authority.

## Remaining completion criteria

The desired tiered hierarchy is complete only when each promoted category has an approved, published, nonempty photographic collection; its exact membership and exclusions are approved; empty and duplicate destinations remain suppressed; desktop and mobile disclosure pass live preview acceptance; and no directory fallback is represented as stronger authority than it has.
