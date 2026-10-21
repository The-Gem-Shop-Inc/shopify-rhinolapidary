# Epic F Batch F4 — typed specifications and contents architecture

Scope: F-PBI-006A and F-PBI-007A only. Both are complete for repository/local-fixture scope when the aggregate gate passes. Their parent PBIs remain partial. 006B and 007B are open and not ready. No Admin, Product/Variant/metafield/metaobject/Files, description/media/alt/SEO/inventory/delivery/SKU/classification/publication mutation, template assignment, theme push or publication occurred.

## Evidence and reproducibility

- [Exact file manifest](../epic-f-batch-f4-file-manifest.json), relative to the completed F3 workspace, including pre-existing uncommitted work.
- [Aggregate validation](../../qa/evidence/epic-f/batch-f4-validation.json): exact commands/exit codes, 67 contract checks, 27 browser checks, F1/F2/F3 results and unchanged historical diagnostics.
- [Performance observations](../../qa/evidence/epic-f/batch-f4-performance-runtime.json): ten actual local runs, full request attribution and unchanged budgets.
- [Supplemental validation record](../../qa/evidence/epic-f/batch-f4-development-validation.json): build/test commands and the optional skill validator dependency failure. The repository Theme Check passes; the installed skill wrapper cannot start because `@shopify/theme-check-common` is missing from its package.

Run `npm run validate:epic-f-batch-f4`. It runs architecture/schema checks, negative and local Liquid tests, responsive/axe/zoom checks and the existing 015A collector against five F4 states, then the complete F3 aggregate (including F2 and F1) and `git diff --check`. Historical launch/CSV failures retain their own exit codes and are compared with established signatures. No live request or preview certification command is included.

`npm run build:epic-f-fact-projection` deterministically regenerates the empty deployment projection using the established consumer. Validation compares its exact output; adding fixture facts to a theme file cannot make the gate pass.

## Consumer and publication boundary

Customer fact grants before/after: **0 / 0**. The existing release artifact and its upstream provenance remain unchanged. No alternate fact registry was added. `data/epic-f-field-roles.json` is presentation configuration: field names, groups, key-summary selection and quantity requirements; it contains no Product values or Product GIDs.

The shared projection queries `evaluate` in the existing F consumer. Its normal value adapter still approves only the established Product-class path; E technical/BOM value adapters and activation remain B-scope work. The new fixture approval helper stores exact row digests in a WeakMap, accepts only fixture contexts and never serializes them. The consumer still checks classification, correct E domain/field/definition, source value/approval/conflicts, public audience, current inputs/receipts, completed migration, exact after-state type/value reconciliation and activation. Setting `fixtureOnly` false removes the simulation path, and the release builder refuses fixture contexts.

Fixture rows use explicitly synthetic `fixture:` sources/approval IDs and synthetic measurements/components. They are not approvals for the exact real Product IDs used to exercise routing. The generated production snippet supplies `nil`, while in-memory fixture overrides feed the same renderer with a schema-validated projection. Renderer entry points require the fixture host and fixture-only marker. No live asset, specification or BOM value is activated merely by adding these snippets.

## Specifications

`formatTyped` is the single formatter for compact and detailed rows. Both views reuse `rhino-machine-specification-row` for `<dt>`/`<dd>` output. Key Specifications has at most three configured field roles (voltage, wheel diameter, blade-diameter range), selects only eligible values and disappears when none are eligible. Detailed groups disappear independently. There are no empty headings/lists, placeholder values or module navigation anchors.

The renderer preserves E's distinct motor, wheel and flex-shaft speeds; wheel/blade/arbor dimensions; electrical supply; water/fluid state; assembled dimensions; net machine weight; and outer crate dimensions. Labels do not turn wheel speed into blade speed, arbor diameter into a thread designation, or an assembled dimension into package/operating clearance.

Blade speed, mount/thread text, separate net-machine dimensions, packaged dimensions, footprint/clearance, package counts and native shipping weight have no applicable F-readable typed definition in this E contract. They therefore remain absent. No deprecated `machine_specs` JSON, duplicate shipping-weight metafield or inferred value was introduced.

Typed numeric values must match their preserved source decimal and canonical E unit. Formatting uses the source decimal string, preserving fractions and meaningful trailing precision without padding values or floating-point arithmetic. Explicit zero is supported where the field meaning allows it (the wheel-speed minimum fixture); absence never becomes zero. Positive physical/electrical quantities reject zero. Range endpoints must both exist, be correctly typed, share source/configuration/physical state/unit and be ordered. Decimal comparison uses scaled integers. A list of explicit supply frequencies remains a list, not an inferred range.

No display conversion is implemented: the current upstream policy supplies no named approved conversion rule. Conversion requests, mixed units and ambiguous `gal` are rejected. Horsepower requires explicit standard qualification in the simulated approved source provenance; ambiguous historical horsepower remains blocked. Neither current nor electrical power is inferred from another quantity.

Every projected row retains exact Product/field/domain, source row, source value/unit, approval identifier, configuration ID/label, physical state and conversion-rule identity (null). Distinct source configurations cannot be unioned into a universal value. Duplicate field rows fail the consumer rather than silently selecting one.

The real E crate definitions currently deny customer audience. Positive crate tests explicitly simulate a future customer-authorized review in a cloned fixture registry; the real E registry is unchanged. Public crate activation therefore needs that applicable E audience decision as well as value/migration/reconciliation eligibility.

New labels use the existing locale lookup conventions. Non-English locale files contain explicit English fallback strings for these inactive new surfaces, preserving locale-key parity without claiming reviewed translations. Any later customer activation must review the intended storefront language output.

## Contents and exact quantity joins

Separate headings preserve included catalog items, included plain component lines, not-included lines, optional items and recommendations. Optional/recommended roles explicitly omit quantities because their E native reference-list contracts have no inclusion quantity companion. Included catalog membership always joins the exact `included_quantities` map; no default quantity exists.

The map must contain exactly the membership GIDs and positive safe integers. Missing, zero, negative, decimal, duplicate or conflicting entries reject inclusion. Duplicate keys in raw JSON are detected before parsing can discard them. Neither number of images nor names such as “pair” supply quantity. A reference repeated across competing semantic sets is suppressed in both sets.

Catalog targets require an exact registered GID, allowed existing Product class, exact identity/handle binding, active/published and explicitly customer-visible state. Missing/deleted/unpublished/wrong-class/unauthorized targets produce suppressed-reference diagnostics and no inferred successor. Tests prove another eligible included item survives isolated target suppression. The renderer never looks up Products by title, SKU, family or image.

Eligible referenced Products reuse `card-product` with a contents context: native accessible link/card markup, subordinate headings, no commerce information, no quick-add, no extra form and no compatibility copy. The default card still uses its native heading, price and purchase behavior. The fixture projection supplies no invented price or availability. Native machine purchasing is unchanged.

Noncatalog lines require the E `{label, quantity, meaning}` shape. They remain plain escaped text, even when a label exactly matches a catalog Product name. They gain no URL, SKU, replacement identity or independent purchase meaning. Exclusions are labeled “Not included”; an empty approved set does not imply that nothing is included. Zero eligible contents suppresses the entire module.

C-040 is unchanged and blocked. Synthetic fixture component sets do not reproduce the current EM-1 disputed BOM. Current descriptions, photos, manuals or historical lists supply no renderer authority.

## Negative and accessibility evidence

The contract matrix covers zero/one/multiple fields, all supported groups, scalar integers/decimals, valid ranges and explicit zero; wrong types/fields/domains/Product IDs/physical states; malformed numbers; missing or incompatible range endpoints; mixed units/configurations/sources; conflicting/proposed/stale/unauthorized values; unsupported conversions; and long/context-specific values.

Contents tests cover single/multiple included Products, all quantity failures, semantic conflicts, exact-GID joins, noncatalog name collisions, exclusions/options/recommendations, missing/deleted/unpublished/wrong-class/audience-denied targets, C-040 and stale eligibility. Adversarial descriptions, tags, titles, media alt/captions, manuals/resources and Custom Liquid-like content cannot populate either module. Structured data gains no specifications, `additionalProperty`, BOM or `hasPart` facts.

Browser tests cover 320/390/768/1440px with zero modules, specifications, long values/names, contents and larger contents. They assert `<dl>` relationships, heading structure, source/keyboard order after Contact, useful native card names, associated quantities, semantic group headings, absence of empty focusable shells, no ordinary page overflow and zero axe serious/critical findings. No table is used because the facts are independent name/value relationships.

Four widths have 200% text-enlargement evidence. A separate Chromium extension uses the established F2 `chrome.tabs.setZoom(2)` approach and verifies layout viewport and device-pixel-ratio changes. Root-font simulation is explicitly not treated as browser zoom.

These results are partial **014B** evidence only. Remaining coverage includes approved live media parity; contextual items; delivery/pickup; warranty/support; resources/downloads/video; and later disclosure/details journeys. Global chrome remains Epic C ownership.

## Performance and remaining activation

F4 reuses F3's collector, schema, strict evaluator, host attribution and budgets against zero modules, populated specifications, long specifications/contents, populated contents and a larger 12-included-Product fixture, each on mobile and desktop. These are single local observations, with cold/no-store cache, no throttling and the existing 1500ms settle policy. They are not release medians. Actual resources/bytes and any failures are retained; no savings are projected. Threshold changes: **No**. No component images, video providers, new browser controllers or payment/provider output are fabricated by these fixtures. Native `payment_terms` remains unchanged.

- **006B open/not ready:** applicable E technical/measurement approvals and value adapters, explicit unit/configuration/physical-state provenance, applicable customer audience, authorized migration, fresh complete reconciliation and F consumer eligibility; then separately authorized activation.
- **007B open/not ready:** E component/BOM approval (C-040 remains unresolved), exact catalog identities/quantities and noncatalog meanings, visibility, value adapters, authorized migration, fresh reconciliation and F eligibility; then separately authorized activation.
- **004B open:** F-DEC-002 real media approvals and separately authorized activation.
- **013/F-DEC-001 open:** no financing decision, authored financing copy or provider changes.
- **015B deferred:** actual Shopify renderer/theme/environment, representative approved release states, governed throttling/cache/settle, at least three mobile samples/median, provider attribution and owner exception review.
- **Epic P open:** Contact routing/privacy/retention/intake ownership; existing Contact and dormant adapter unchanged.
- **Inherited Epic E:** existing approvals, migrations and reconciliation remain with their owners. No questions reopened.

Historical findings remain separately visible: search and consumableProduct fixture ownership gaps, 103 Product CSV findings, and 37 historical Product-description claim matches. None became approved or resolved through this work. F-PBI-008–011 and later modules were not implemented. Stop after F4.
