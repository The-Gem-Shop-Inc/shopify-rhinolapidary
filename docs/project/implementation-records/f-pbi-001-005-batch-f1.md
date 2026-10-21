# Epic F Batch F1 — consumer boundary and claims containment

F-PBI-001 and F-PBI-005 are complete for the authorized repository scope.
Architecture is complete; live fact activation and release approval remain blocked.
F-PBI-002, `product.machine.json`, F-PBI-013 and all later Epic F implementation
remain outside this batch. No Shopify Admin mutation, Product template assignment,
preview push, production push or publication occurred.

## Consumer contract

`scripts/lib/epic-f-consumer.js` consumes Epic E classification, exact Product
identity, owner decisions, definitions, downstream readiness, domain plans and
their hashed inputs. It reuses Epic E identity validation and after-state
comparison. Classification is an exact GID join, never a title, tag, collection,
Vendor, Product Type, description, filename or visual match.

`data/epic-f-consumer-release.json` is generated, schema validated and contains
75 upstream source paths with versions/hashes, routing for 122 governed Products,
and zero fact grants. Eleven routes are approved machine identities. The matching
Liquid snippet contains routing only. Unknown Products receive `unclassified`
and remain contained. Non-machine routes retain their existing content paths;
this does not grant them Epic F technical fact approval.

The state schema and evaluator distinguish architecture support, value presence,
approval, migration/reconciliation, freshness, audience, activation authorization,
fixture origin and suppression. They retain missing, proposed, conflicting and
unauthorized-live states. Every required predicate must pass. The currently
approved Epic E Product-metafield population adapter is `product_class`; technical
population adapters and approvals are absent, so those domains cannot be enabled
by editing an F file or setting a nonblank live metafield. This dependency remains
owned by Epic E. Extending the release format to emit customer fact grants needs
the applicable E-owned adapter/approval closure and a tested contract revision.

The last complete audit candidate expired at **2026-09-10T17:52:28.268Z** and also
lacks required datasets. Its date is retained as evidence, not refreshed by the
F builder. No after-migration evidence exists. Classification routing is used to
contain content and does not claim migrated classification or current technical
eligibility. No customer fact renderer was introduced in F1.

Release validation rebuilds expected artifacts in memory, rejects changed inputs
and generated output, and validates approval bindings and expiry. It does not
silently regenerate artifacts during validation. The existing production-readiness
runner now includes the F1 gate. Request-time Liquid cannot inspect repository
hashes or revoke an already deployed theme; these are predeployment checks.
The zero-grant F1 artifact remains safe when fact eligibility expires because it
cannot render technical values at all.

The 22-case adversarial fixture matrix covers approval, missing/proposed/conflicting
values, stale approval/reconciliation, wrong GID/class/field/domain/type, nonblank
unauthorized values, audience/activation denial, live drift, exclusive expiry,
classification/description fallbacks, revocation and artifact drift. Its positive
case simulates an approved and reconciled class value entirely in memory. It can
exercise an internal fixture formatter, but remains suppressed for customer use
and cannot generate a release artifact. Test, data, schema and script directories
are explicitly excluded from theme upload.

Machine fixture ownership now belongs to `Storefront engineering / Epic F` in the
existing ownership register. Its current template expectation is `product`, matching
the saved observation and repository template. `product.machine` is recorded only
as a future fixture identity. Search and consumable ownership gaps are unchanged.

## Claims containment

Machine and unknown Product HTML descriptions are omitted. No technical fallback,
replacement assertion or invented SEO description was added. Product SEO title
overrides are bypassed in favor of native Product identity; meta description,
Open Graph description and Twitter description are absent for contained Products.
Configured arbitrary narrative, Custom Liquid, app blocks, ratings and unapproved
native disclosure text cannot reopen the machine narrative path.

The native Product structured-data filter exposes description content; the narrow
alternative emits native Product GID, title, URL and Variant offer identifiers,
URLs, prices, currency and availability. It emits no description, technical data
or Vendor-derived responsibility. Featured Product sections cannot duplicate
Product JSON-LD on a Product page. Native structured data, including safe image
information, remains available on existing non-machine paths. See Shopify's
[structured-data reference](https://shopify.dev/docs/api/liquid/filters/structured_data)
and [Variant reference](https://shopify.dev/docs/api/liquid/objects/variant).

Current machine media has unresolved use/model review; the discovery documents
embedded patent/certification wording. F1 suppresses that unreviewed media in the
gallery, modal, model JSON, social image selection, cards, predictive search,
quick-order images and cart surfaces. Existing no-media layout behavior avoids an
empty gallery column. No Shopify media or alt field was edited. Media activation
remains with F-DEC-002 and subsequent gallery work. Native standard-event filters
are preserved; Shopify's documented [event payload](https://shopify.dev/docs/api/liquid/filters/standard_event_data)
uses native identity rather than the Product description.

Existing blocked patterns and prohibited wording in `legal-claims-register.json`
are unchanged. The existing claims validator additionally scans assets and the
F fixture source. Its reusable rendered scanner examines raw/decoded strings,
HTML-stripped alternatives, attributes and JSON escapes. All 11 saved machine
description inputs still produce **37 overlapping historical claim matches**;
they are recorded rather than reclassified as approved.

`data/epic-f-content-cleanup-plan.json` proposes omission of exact
`Product.descriptionHtml`, `Product.seo.description` and `Product.seo.title` fields
for the 11 GIDs. It preserves dated description hashes, identifies SEO before
states as not queried, and lists exact media review IDs without proposing media
mutations. It is explicitly non-executable. A current before-state read, bounded
dry run/rollback/after verification and separately recorded Product Owner/Admin
GO are required before any future mutation.

Theme containment cannot change Shopify-hosted Product APIs, feeds, app output or
already deployed themes. Those copies and any external duplicate structured data
still require separately governed cleanup and live release verification.

## Validation and limits

Run `npm run validate:epic-f-batch-f1` after `npm ci`; install the existing
Playwright Chromium browser if it is not present. The runner executes the new
contracts and applicable existing checks, retains each exit code, and writes
`test-results/epic-f/batch-f1-validation.json`. Historical cross-Epic diagnostics
remain failures and are reported separately from F1 architecture acceptance.

The local rendered suite executes the repository Liquid using LiquidJS and loads
its output into Playwright Chromium with network requests blocked. It checks the
Product body, head/social metadata, galleries, cards/search/cart/disclosures and
JSON-LD for all 11 saved machine identities, including adversarial strings and
nonblank unauthorized values. It verifies one Product JSON-LD object, native
identity/offer fields and both availability branches. Seven hidden/encoded attack
strings and source fallback attacks are rejected. Shopify-only platform tags and
filters are emulated; this is not Shopify renderer parity or a live preview
certification. Actual conditional/capture/loop/render logic runs from repository
files. Generated HTML and per-command output remain in ignored `test-results`.

The unchanged social metadata contract runs, and actual local head/social output
is covered by the F1 rendered suite. The remote social-preview suite and the full
production-readiness runner were not run: a pushed preview does not contain these
changes, and production-readiness can run cart-writing tests when configured.
No push was authorized or performed.

The final command/exit ledger is saved in
`docs/qa/evidence/epic-f/batch-f1-validation.json`. The file manifest below records
every changed or created repository file. Generated artifacts can be deliberately
rebuilt with `npm run build:epic-f-consumer` and `npm run build:epic-f-cleanup`;
both builders perform repository writes only.

Unresolved historical diagnostics: launch fixture ownership for `search` and
`consumableProduct`; CSV has 95 missing-alt findings and eight nonpositive-price
findings. The dated JadeMaster CSV finding remains despite its different saved
Admin price. An incidental `npm audit --json` returned exit 1 for existing
`fast-uri` and `sharp` advisories; those dependencies were not changed in F1.

## Remaining decisions and boundaries

All 15 existing Epic E deferred groups, domain-specific migration GO, a complete
fresh read audit and after-state verification remain with their documented owners.
No prior question was reopened. F-DEC-002 governs media rights/model/embedded-mark
review; any native Product/SEO cleanup needs the separately documented approvals.
F-DEC-001/native financing is still deferred and its current widget was preserved.
No replacement technical narrative requires review because none was authored.

**Admin mutation: No. Production or preview theme pushed/published: No.**

## Final command results

The aggregate `npm run validate:epic-f-batch-f1` returned **exit 0**. All 19 required checks passed; the two unchanged release diagnostics retain exit 1.

| Command | Exit | Scope |
|---|---:|---|
| `npm run validate:epic-f-consumer` | 0 | Required F1 check |
| `npm run test:epic-f-consumer` | 0 | Required F1 check |
| `npm run validate:epic-f-claims` | 0 | Required F1 check |
| `npm run test:epic-f-claims` | 0 | Required F1 check |
| `npm run validate:registers` | 0 | Required F1 check |
| `npm run validate:product-templates` | 0 | Required F1 check |
| `npm run validate:product-purchase` | 0 | Required F1 check |
| `npm run validate:brand-claims` | 0 | Required F1 check |
| `npm run test:brand-claims-validator` | 0 | Required F1 check |
| `npm run validate:metafields` | 0 | Required F1 check |
| `npm run validate:epic-e-batch-2b1-registers` | 0 | Required F1 check |
| `npm run validate:epic-e-batch-4a-contracts` | 0 | Required F1 check |
| `npm run validate:theme-repository` | 0 | Required F1 check |
| `npm run validate:theme-architecture` | 0 | Required F1 check |
| `npm run validate:storefront-js` | 0 | Required F1 check |
| `npm run validate:settings-data` | 0 | Required F1 check |
| `npm run validate:fixtures` | 0 | Required F1 check |
| `npm run theme:check` | 0 | Required F1 check |
| `npm run validate:launch-fixtures` | 1 | Unresolved historical release diagnostic |
| `npm run validate:product-data -- data/product-export/products.csv` | 1 | Unresolved historical release diagnostic |
| `node scripts/validate-social-metadata-contract.js` | 0 | Required F1 check |

Both explicit F builders returned exit 0. `git diff --check` and the unchanged-authority comparison returned exit 0. The initial Theme Check warning for an undefined placeholder variable was fixed; the final Theme Check has no offenses.

## Exact file manifest

Machine-readable copy: [Batch F1 file manifest](../epic-f-batch-f1-file-manifest.json).

| File | Change |
|---|---|
| `.shopifyignore` | modified |
| `data/launch-fixture-ownership.json` | modified |
| `docs/release/production-launch-readiness-gate.md` | modified |
| `docs/rhino-lapidary-pbi-tracker-epic-f.md` | modified |
| `layout/theme.liquid` | modified |
| `package-lock.json` | modified |
| `package.json` | modified |
| `scripts/validate-brand-claims.js` | modified |
| `scripts/validate-json-registers.js` | modified |
| `scripts/validate-production-readiness.js` | modified |
| `sections/cart-notification-product.liquid` | modified |
| `sections/featured-product.liquid` | modified |
| `sections/main-cart-items.liquid` | modified |
| `sections/main-product.liquid` | modified |
| `sections/predictive-search.liquid` | modified |
| `snippets/card-product.liquid` | modified |
| `snippets/cart-disclosure-indicator.liquid` | modified |
| `snippets/cart-drawer.liquid` | modified |
| `snippets/meta-tags.liquid` | modified |
| `snippets/product-disclosures.liquid` | modified |
| `snippets/product-media-gallery.liquid` | modified |
| `snippets/product-media-modal.liquid` | modified |
| `snippets/quick-order-list-row.liquid` | modified |
| `tests/fixtures/storefront-fixtures.json` | modified |
| `data/epic-f-consumer-release.json` | created |
| `data/epic-f-content-cleanup-plan.json` | created |
| `docs/project/epic-f-batch-f1-file-manifest.json` | created |
| `docs/project/implementation-records/f-pbi-001-005-batch-f1.md` | created |
| `docs/qa/evidence/epic-f/batch-f1-validation.json` | created |
| `schemas/epic-f-consumer-fixtures.schema.json` | created |
| `schemas/epic-f-consumer-release.schema.json` | created |
| `schemas/epic-f-consumer-state.schema.json` | created |
| `schemas/epic-f-content-cleanup-plan.schema.json` | created |
| `scripts/build-epic-f-consumer.js` | created |
| `scripts/build-epic-f-content-cleanup.js` | created |
| `scripts/lib/epic-f-consumer.js` | created |
| `scripts/lib/epic-f-liquid-fixtures.js` | created |
| `scripts/run-epic-f-batch-f1.js` | created |
| `scripts/test-epic-f-claims.js` | created |
| `scripts/test-epic-f-consumer.js` | created |
| `scripts/validate-epic-f-claims.js` | created |
| `scripts/validate-epic-f-consumer.js` | created |
| `snippets/rhino-product-consumer-route.liquid` | created |
| `snippets/rhino-product-description.liquid` | created |
| `snippets/rhino-product-structured-data.liquid` | created |
| `tests/fixtures/epic-f-consumer.json` | created |

The requested backlog path `data/epic-f-proposed-backlog.json` does not exist; the existing source consumed was `docs/project/epic-f-proposed-backlog.json`. It and the discovery evidence remain historical planning records. The attached name-normalization proposal was inspected and left unchanged; it is not a Product identity or approval authority.
