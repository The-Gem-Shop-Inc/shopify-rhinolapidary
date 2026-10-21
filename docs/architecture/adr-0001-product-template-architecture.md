# ADR-0001: Product Template Architecture

## Status

Accepted for the shared machine shell in Epic F Batch F2 (2026-09-17).
Other specialized templates remain proposed. No Admin assignment or theme release is authorized by this ADR.

## Context

Rhino Lapidary products are not one uniform product type.

The storefront needs different product-page structures for:

* Machines
* Consumables
* Accessories
* Replacement parts
* Manuals and support content

The default Shopify Trade product template should support the normal purchase path. Specialized templates may add machine specifications, compatibility tables, manuals, video, freight/warranty messaging, or quick-order behavior.

## Decision

Use explicit product templates for major product classes.

| Product class    | Template                          | Purchase model                                                                    | Required data                                                                   |
| ---------------- | --------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Standard product | `product.json`                    | Standard variant picker, quantity selector, buy buttons                           | title, price, description, media, SKU                                           |
| Machine          | `product.machine.json`            | Native Trade purchase controls plus secondary neutral Contact | Native identity and commerce state; zero eligible facts/media is valid |
| Consumable       | `product.consumable.json`         | Standard purchase, possibly quick reorder later                                   | grit, diameter, arbor, material, compatibility, pack size                       |
| Accessory        | `product.accessory.json`          | Standard purchase                                                                 | compatibility, dimensions, related machine, support notes                       |
| Replacement part | `product.replacement-part.json`   | Standard purchase or inquiry path                                                 | compatibility, diagram/manual reference, part number                            |
| Manual/support   | page or metaobject-driven content | No purchase                                                                       | file, associated product, version/date                                          |

## Data ownership

| Data                                 | Location                                              |
| ------------------------------------ | ----------------------------------------------------- |
| Product title, handle, price, status | Shopify product/variant admin                         |
| Long description                     | Product description or product-specific sections      |
| SKU                                  | Variant admin                                         |
| Compatibility                        | Product metafields or metaobjects                     |
| Machine specifications               | Product metafields                                    |
| Manual/download links                | Shopify Files, product metafields, or support pages   |
| Video                                | Shopify media or approved video embed                 |
| Freight/warranty/support copy        | Product metafields, page content, or reusable section |
| Template assignment                  | Shopify product admin                                 |

## Rules

* The default product template must keep a working purchase path.
* Machine pages preserve native Variant, quantity, buy-button, pickup, payment-terms and error/announcement behavior. No quote, reserve, preorder, backorder, freight or timing policy is inferred.
* Quick-order should not be the only purchase path for normal products unless deliberately approved.
* Product-class templates must be tested through fixture products.
* Template changes require `npm run validate:product-templates`.

## Consequences

This creates more upfront structure, but it prevents machinery, consumables, and support content from being forced into one generic product page.

## Accepted F2 machine decision

One shared `product.machine.json` routes to the existing `main-product`; there is no cloned Product section, form, gallery controller, Variant logic or cart logic. The template contains presentation settings only, never classification or Product facts. F1's governed consumer route remains the classification/containment boundary independently of template suffix. Unknown Products remain contained.

The current template orders native title/H1, native price (including Sold out badge and unchanged payment terms), Variant picker, quantity, buy buttons/native pickup, then neutral Contact. A separate inventory block is omitted to avoid duplicating native purchase state or introducing stock/timing copy. Media and descriptions stay suppressed under F1; Trade's no-media layout collapses to one column. Rhino styles are scoped to the machine presentation class for wrapping and sizing. No future empty groups or anchor navigation are emitted.

`product.json` and native purchase assets/snippets remain unchanged against the F2 baseline. Template existence and the repository fixture expectation are not proof of a live Product assignment. F-PBI-013/F-DEC-001 remain open: native `payment_terms` is preserved without authored financing copy or provider changes.

The dormant Product-context validator lives only in repository tooling. Contact links remain `/pages/contact`, with no query parameters, new fields or intake. Epic P owns any later routing/privacy/retention approval.

Verification: `npm run validate:epic-f-batch-f2`. Local Liquid platform adapters and intercepted responses are explicitly fixture evidence; preview snapshots and Shopify-renderer parity require separate authorization. See [F2 implementation record](../project/implementation-records/f-pbi-002-003-012-014a-batch-f2.md).

## Accepted F3 gallery and performance extension

The shared shell projects eligible media into Trade's existing gallery and modal. One release boundary, `rhino-product-media-eligibility`, currently emits nothing for every asset. `data/epic-f-media-release.json` is pinned to zero grants under F-DEC-002. Nonblank attachments, filenames, model resemblance and template settings cannot grant eligibility. F1 fact grants and description containment remain unchanged.

Only repository tooling can substitute an in-memory synthetic eligibility snippet, requiring fixture asset identities, synthetic media IDs, exact governed Product binding and the fixture host. That substitution never writes a deployable snippet. Real Shopify media IDs cannot be compiled by it. Review references are fixtures demonstrating consumption of existing B/F-DEC-002 ownership, not a second rights register. Future 004B needs separately approved release construction and activation.

Trade's gallery/modal/thumbnail/zoom/deferred-media controllers remain byte-identical. Eligible fixture inspection images use contain sizing, native responsive sources and dimensions, bounded hero sources and lazy secondary images. Machine video templates prohibit autoplay and remain inert until native interaction. Default Product templates and native purchasing remain unchanged. The zero-media case retains F2's collapsed layout.

Machine performance uses the existing brand observer, network recorder, host accounting and median utility. Machine thresholds reference the strictest applicable existing policy values, without exceptions or increases. A strict measurement schema and evaluator separate static/local regression from preview diagnostics and release certification. Missing or unsupported observations, invalid route/environment identity, incomplete requests and error pages cannot pass. Native payment/provider attribution is distinct from Rhino, Trade and preview tooling; local adapters do not invent provider output.

Verification: `npm run validate:epic-f-batch-f3`. [F3 implementation record](../project/implementation-records/f-pbi-004a-015a-batch-f3.md). 004B and 015B remain incomplete; 014B and 013 remain open.

## Accepted F4 specification and contents extension

The existing F consumer remains the only eligibility decision path. F4 adds a deterministic, schema-validated presentation projection after the native purchase and Contact blocks. The generated deployable snippet explicitly supplies `nil`: the real release still has zero fact grants. The specification/contents snippets additionally accept only the fixture host and fixture-only projection in this batch. No template setting, Product description, metafield nonblank check, media or Custom Liquid value supplies authority.

Positive tests simulate E approvals in an in-memory WeakMap tied to the exact context and row digest. They still pass through F's existing classification, domain/definition, approval, audience, currentness, migration/reconciliation and activation checks. Simulation is accepted only when `fixtureOnly` is true, remains suppressed for customers, cannot survive serialization, and is rejected by the release builder. This extends the existing consumer's fixture support; it is not a specification or BOM approval register.

One typed formatter supplies both a maximum-three-field Key Specifications view and detailed semantic definition lists. Presentation roles identify fields and groups, never machine-specific values. Units, physical states, source identity and configuration remain explicit. Range endpoints require matching source, unit, physical state and configuration. No conversion rule is approved by F4; unsupported/ambiguous inputs disappear. Unmodeled blade speed, mount/thread, net dimensions and package states are not aliases for existing E fields. Native Variant shipping weight remains operational Shopify data.

Contents preserve included catalog items, plain noncatalog included lines, explicit exclusions, optional items and recommendations. Included quantities require the E exact-GID companion map with positive integers and exact membership. Optional/recommended lists have explicit quantity-free presentation roles matching their E field contracts. Missing, duplicate, conflicting or unauthorized joins are suppressed. Referenced Products require exact governed identity/class and customer visibility; no successor/name matching occurs. C-040 remains blocked.

The existing `card-product` is reused with a contents-only option that hides its commerce information and sets card headings below the contents group heading. Other card calls preserve native headings, prices and purchase behavior. No component card controller, bundle or cart combination is introduced.

Verification: `npm run validate:epic-f-batch-f4`; [F4 implementation record](../project/implementation-records/f-pbi-006a-007a-batch-f4.md). F-PBI-006/007 remain partial, 006B/007B not ready, 014B open and 015B deferred.

## Accepted F5 contextual and delivery extension

F5 adds a bounded, render-ready reverse view of explicitly supplied dependent-to-machine relationships. It preserves the original edge identity, source, approval, audience, lifecycle and scope. The existing F consumer evaluates compatibility on the dependent Product class allowed by E's `compatible_machines` definition; its approval, migration, reconciliation and activation checks remain intact. No reciprocal metafield, catalog scan, recommendations controller or Epic G discovery feature is introduced.

F4 contents semantics take precedence by exact target Product GID, including exclusions, options and recommendations. F5 suppresses duplicate edges/targets and reuses the native card with F4's non-commerce context. Generic recommendations are not compatibility authority; their network attribution has a separate category when observed.

Supplemental delivery is a separate conditional surface. E's owner-input schema and timing/freshness functions remain authoritative. Region records retain permission and regulatory/commercial/temporary/policy meaning; timing retains event, units, source and expiry. Native pickup and purchase files remain byte-identical. Handling vocabulary is still proposed and no customer pickup-scope adapter exists, so these inputs remain suppressed pending 009B rather than copying native configuration. Variant/configuration operational timing without a truthful native update path also remains suppressed.

F5 fixture approvals reuse F's existing context-bound ephemeral digest mechanism. They cannot build release artifacts. The generated customer snippet supplies `nil`, and fixture renderers require the local fixture host. No real relationship or operational grants are activated. The schema and compiler interface are reusable by future Epic G; actual runtime delivery requires separately approved 008B/009B work.

Verification: `npm run validate:epic-f-batch-f5`. See [F5 implementation record](../project/implementation-records/f-pbi-008a-009a-batch-f5.md). 008/009 remain partial; 013/014B/015B and all earlier live activation gates remain open.

## Accepted F6 support and resources extension

F6 retains the manually established contract and policy/class/exact-Product mapping projection. It reuses F's context-bound ephemeral approval mechanism for synthetic records. The generated customer projection passes `nil`; both snippets additionally require the local fixture host. No warranty register, Shopify definition, resource approval store or support portal is introduced. B3C-D03 remains blocked and B3B-D06 pending.

Warranty fixtures also pass E's existing owner-input schema and validator. Policy, class and Product mapping retain their distinct subject-bound approval identities, role evidence and exact source content hash; the presentation envelope is not a substitute for those approvals. Omitting a duration row does not modify the upstream class or assert unlimited coverage.

Marketed brand, manufacturer, warranty issuer, administrator and repair provider remain separate evidenced roles. Vendor and general legal policies supply no responsibility. Missing or invalid warranty destinations suppress only the warranty CTA; independently eligible facts remain. Contact stays the original neutral F2 action with no context submission.

Resources require exact Product/File identity, canonical/current/customer state, owner/rights/publication approval, explicit language/version review and fresh route identity. Configuration-specific resources require matching presentation scope. Duplicate identities and conflicting canonical versions fail closed; filename, upload date, hash, Page existence and HTTP 200 cannot choose a canonical File. `support_files` remains structurally excluded from customer output. Resource content supplies no facts to other modules or JSON-LD.

Resource video uses Trade's existing `deferred-media` controller and an inert iframe template. F6 supports a text activation button without a poster; supplied posters are suppressed until a separately governed media adapter can prove eligibility. Fixture provider URLs cannot serialize into the release projection. No image, video provider or document binary is fetched by adding resource links. No additional browser controller is introduced.

Verification: `npm run validate:epic-f-batch-f6`; [F6 implementation record](../project/implementation-records/f-pbi-010a-011a-batch-f6.md). 010/011 remain partial, 010B/011B not ready, 014B open for live/Shopify-rendered parity, 015B deferred. F6 neither assigns templates nor publishes a theme.
