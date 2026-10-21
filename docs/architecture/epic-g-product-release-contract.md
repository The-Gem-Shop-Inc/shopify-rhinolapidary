# Epic G ordinary Product and forward-fit release

2026-10-16 · G-PBI-002 / G-PBI-003 · repository implementation; deployment gated.

This extends [ADR-0002](adr-0002-epic-g-default-product-template.md) and the [G1 contract](epic-g-foundation-contract.md). It does not change E/F approvals, G1 eligibility, the machine template or the F relationship renderer.

## Native Product integration

The ordinary templates/product.json still uses sections/main-product.liquid. Its SKU block is a custom_liquid call to rhino-g-product-detail; a second custom_liquid block renders rhino-g-product-fit after the description and before Share. Both use the existing native custom_liquid extension point. The shared section and native Product scripts are unchanged. Machine templates contain neither block.

The detail snippet opts in only the three governed G roles through the existing F role route. Native selected Variant SKU is the sole displayed value. An empty SKU has a hidden, zero-height fragment with no empty accessible label. A populated SKU has the existing translated SKU label and escaped, selectable native value. Trade's existing product-info Sku fragment copy and hidden-class update remains the only SKU updater. No proposed registry value or Shopify ID becomes a SKU.

CSS is scoped by the G detail marker. It gives the existing image modal button actual absolute-overlay geometry inside its native modal-opener. Previously its pseudo-element covered the image while the button itself had zero geometry. The native modal, keyboard controller and focus return remain in use. Machine galleries have no G marker. Missing descriptions/media/resources are handled by the unchanged native/E/F guards; no content is invented.

## Approval to public rendering

1. Existing E GraphQL paginator/authenticated connector reads create a complete G1 Admin envelope, bound to its read transcript.
2. G.loadAuthority verifies current E owner receipt, reconciliation proofs, exact identities/classification and the historical F source binding. G.assess validates the full compatible_machines set, targets and publication. A public reference alone is insufficient.
3. scripts/lib/epic-g-product-release.js builds data/epic-g-product-release.json and snippets/rhino-g-product-fit.liquid from that live, fully reconciled report. Fixture authority cannot enter this build. Definitions, receipt proofs and private provenance are checked here; Liquid cannot execute Node or read private receipts.
4. The public snippet contains exact approved source IDs, class/handle/Variant membership, complete reference membership, target identity contracts, public digest and bounded expiry. It contains no private approval token or credential. The JSON release stays a repository artifact, not a public theme asset.
5. Liquid checks current public field types, source identity/class/Variants, complete reference membership and every target identity/class/Variants before any link. A changed list, duplicate, orphan or invalid target rejects the whole module. The valid complete list is sorted by exact Product ID. Current publication determines whether an otherwise approved target can be linked; this is distinct from technical approval. No empty heading is emitted.
6. A hidden-by-default rhino-g-fit element is revealed only within its presentation interval and matching parent Product identity. It hides at expiry, pageshow and visibility changes. It never creates approval, fetches Admin data or changes purchasing.

Compatible, included, optional, recommended and native Related products remain separate. Only compatible_machines is consumed. No new fit claims enter JSON-LD, metadata, cards, breadcrumbs, analytics or search.

## Freshness and limitations

The E receipt still expires **2026-10-22T20:26:37.102Z**. Nothing in G renews it. The presentation interval ends at the earliest of receipt expiry, G1 observation expiry and **one hour after the actual Admin observation capture**, not one hour after recompilation. Recompiling the same observation cannot extend it. build/verify reject expired intervals; a later presentation requires a fresh actual read and valid existing approval, not a replacement receipt.

Liquid now is evaluated when Shopify renders HTML, which may subsequently be cached. Browser timers provide additional suppression on already open/cached pages. No-JavaScript leaves fit hidden while native purchase remains present. Browser clock errors, suspended execution and Shopify caching prevent an absolute immediate-expiry guarantee. Private approval revocation is not observable by Liquid; it is checked at the next verified build/deployment. Native class/reference/publication edits are checked at the next uncached Liquid render, with the same caching limitation.

Therefore **immediate private revocation/source-removal suppression is PARTIAL**, not guaranteed. The one-hour observation-bound lease limits exposure with a normal browser clock; it is not a new approval system. Sustained release requires an explicitly operated refresh/revalidation cadence or an approved alternative policy. No network service, public Admin proxy or silent approval renewal was introduced.

## Validation and deployment

Use npm.cmd on this Windows workstation:

    npm.cmd run build:epic-g-product-release -- --read <actual-current-G1-envelope.json>
    npm.cmd run test:epic-g-products
    npm.cmd run validate:epic-g-products
    npm.cmd run test:epic-g-products:browser -- --baseline
    npm.cmd run test:epic-g-products:browser -- --overlay --g-only
    npm.cmd run test:epic-g-products:runtime-fixtures

Overlay modes are browser-only tests over read-only preview HTML. LiquidJS fragments and fixture section-response SKUs are explicitly labeled; they do not prove Shopify Liquid or deployed G2 behavior. Running the browser command without these flags requires the materialized release actually deployed to preview.

The repository validator checks the five-file theme allowlist, every untouched theme file, protected E/F/G1 hashes, current source binding and local Liquid projection coverage across all current G Products. The two OrphanedSnippet exceptions in .theme-check.yml apply only to render calls inside Product JSON custom_liquid strings that Theme Check cannot trace; the integration is asserted by this validator. No complexity rule is disabled.

scripts/deploy-epic-g-products-preview.js is restricted to existing unpublished theme **158631198917** and these five files:

- templates/product.json
- snippets/rhino-g-product-detail.liquid
- snippets/rhino-g-product-fit.liquid
- assets/rhino-g-product.css
- assets/rhino-g-fit.js

It requires fresh theme inventory, valid release and passing named recorded gates; uses --only, --nodelete and --strict; has no MAIN, publish or allow-live branch. The initial G2 attempt did not execute it because legacy F template guards failed. The [G2 recovery](../project/implementation-records/g-pbi-002-003-recovery.md) resolved those guards and executed the bounded preview push. Source observation/lease, target identities, rollback source, all eleven machine-route baselines and each required command are independently checked. No production authorization follows from this contract.

## Recovery validation and current preview

Current acceptance uses scripts/lib/epic-g-current-protection.js: the entire native Product JSON fixture is hash-locked to the historical native baseline, then exactly the SKU render call and fit block are applied. Deep equality protects all remaining blocks, order, settings, descriptions, share, Related products, gallery and purchase configuration. Unknown predecessors and unauthorized deltas fail. The existing F final binding and receipt are verified before selecting its already implemented owner/media adapters. Historical zero-grant consumer fixtures remain separately reproducible; current owner release compilation remains exact.

The support validator is itself receipt-bound. Its source stays byte-identical. scripts/validate-epic-f-support-resources-current.js verifies that binding, requires one exact preservation predicate, and adds the strict current-template/recorded-predecessor check in memory. All resource, warranty, isolation and other preservation assertions remain intact. Historical validator sources are archived in tests/fixtures/epic-g-recovery; negative tests reject template and actual bound-renderer changes.

The style validator now recognizes the complete governed native foreground tuple expression instead of truncating its nested parentheses and misclassifying it as a literal color. Hex/RGB/HSL, unknown references, fallbacks and invalid alpha still fail. No CSS or sixth theme file changed.

Remote Liquid/CSS/JS sources must be byte-identical. Shopify preserves its existing generated-file warning and reformats Product JSON; reconciliation permits only that exact pre-existing warning and whitespace, with full parsed JSON equality and the strict native-plus-G2 contract. It never ignores settings or accepts an arbitrary JSON change. Both raw hashes are retained. Unrelated preview files and all MAIN checksums must remain identical. Six readback-negative tests reject mismatches.

All eleven machines are joined from approved exact identities to the actual Admin template/publication state. Eight published machine pages retain their F output. The three default-template machines are currently unpublished and return 404; no claim is made to have tested nonexistent customer forms/headings on those routes. Machine-class Products receive no G fit, marker or asset.

Proposed production operations, **not approved policy**: obtain/reconcile a real Admin read and rebuild/release at least every 20 minutes, with an alert after 30 minutes without success, retaining the one-hour observation-bound lease and unchanged receipt cutoff. On drift, revocation or failed validation, stop renewal. Emergency fit withdrawal should use a separately authorized bounded empty-fit-snippet release, followed by readback and browser checks. Uncached responses can stop immediately after deployment; cached/open pages retain the documented clock/cache limits. No instantaneous private-revocation guarantee or automatic receipt renewal is implied.
