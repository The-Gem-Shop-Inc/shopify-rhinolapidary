# Rhino Lapidary Theme Release Checklist

**Publish authority:** Store owner or designated production publisher
**Required environment:** Persistent unpublished preview theme
**Last reviewed:** 2026-07-03

A release is not approved until every applicable item is complete.

## Epic D Homepage Technical Gate

Target only unpublished preview theme `158631198917`. Production theme `158579622085` must remain unchanged until a separate human D-PBI-032 GO.

```powershell
npm run qa:epic-d:static
npm run qa:epic-d:preview
npm run qa:epic-d:all
npm run validate:epic-d-finalization
```

Required Epic D evidence:

* [ ] Homepage route QA passes.
* [ ] Eight-width responsive evidence passes and screenshots are reviewed.
* [ ] Homepage accessibility and global accessibility regression pass.
* [ ] Homepage and brand release performance pass without raising the 130-request homepage ceiling.
* [ ] EM-1 video proves click-to-load, zero initial YouTube requests, no autoplay, accessible activation, and stable layout.
* [ ] Media and customer-facing claim validators pass.
* [ ] Product Owner manual visual, zoom, hero crop, and content/CTA review is recorded.
* [ ] Clean-preview keyboard/focus retest passes.
* [ ] Product Owner manually checks video poster, play focus, activation, layout stability, and no unexpected autoplay.
* [ ] D-PBI-032 records an explicit GO before any production publish.

Epic D rollback:

1. Revert the repository change that introduced the affected homepage section/settings.
2. Push the reviewed rollback only to preview `158631198917` with `shopify theme push --store rhino-lapidary.myshopify.com --theme 158631198917 --strict --nodelete`.
3. Rerun Epic D static and preview QA.
4. Use the established Epic A/C theme backup and rollback references for any later production release.
5. Never publish production before D-PBI-032 explicit GO.

---

## 1. Release identification

* [ ] Release date:
* [ ] Release owner:
* [ ] Approver:
* [ ] Git branch:
* [ ] Git commit:
* [ ] Preview theme name:
* [ ] Preview theme ID:
* [ ] Current production theme name:
* [ ] Current production theme ID:
* [ ] Production backup theme name:
* [ ] Production backup date:

Backup and rollback procedure: `docs/release/backup-and-rollback-procedures.md`

- [ ] Backup procedure followed.
- [ ] Backup theme ID recorded.
- [ ] Admin-impacting changes have rollback notes.
- [ ] Domain/redirect/analytics rollback owner is identified when applicable.

## 2. Repository state

```sh
git status --short
git log -1 --oneline
```

* [ ] Working tree is clean.
* [ ] Release commit is pushed.
* [ ] Pull request is approved.
* [ ] CI passes.
* [ ] Theme customization inventory is current.
* [ ] No unresolved merge conflicts exist.
* [ ] No secrets or local files are tracked.

## 3. Static validation

```sh
python scripts/validate-theme-repository.py
shopify theme check --fail-level warning
npm run qa:epic-c:static
```

* [ ] Repository validation passes.
* [ ] Theme Check passes.
* [ ] JSON files are valid.
* [ ] Theme Check suppressions are documented.
* [ ] No new unexplained warnings exist.
* [ ] Epic C static global chrome QA passes when header, navigation, breadcrumbs, footer, localization, policy, support, or measurement artifacts changed.

Epic C finalization command:

```sh
npm run validate:epic-c-finalization
```

## 4. Settings safety

* [ ] Review all changes to `config/settings_data.json`.
* [ ] Confirm settings changes are intentional.
* [ ] Confirm production theme-editor changes will not be overwritten.
* [ ] Back up or duplicate the currently published theme.
* [ ] Record the backup name and date above.
* [ ] Review app blocks.
* [ ] Review app embeds.
* [ ] Review Custom Liquid blocks.
* [ ] Review navigation or template changes made through the Shopify admin.
* [ ] Review `docs/privacy/security-privacy-review-checklist.md`.

### Custom Liquid and app embeds

- [ ] Review `docs/apps/theme-editor-code-register.md`.
- [ ] Confirm no unregistered Custom Liquid blocks are present.
- [ ] Confirm no unregistered app embeds are enabled.
- [ ] Confirm app embeds have owner, purpose, privacy notes, and rollback path.

## 5. Preview deployment

```sh
shopify theme push --environment preview --strict
shopify theme open --environment preview
```

* [ ] Preview push succeeds.
* [ ] Preview points to the release commit.
* [ ] Preview is not the published theme.
* [ ] Theme editor loads without errors.
* [ ] Changed sections remain editable.
* [ ] No required settings were reset.

## 6. Browser and responsive testing

Follow `docs/qa/storefront-quality-baseline.md`.

For global chrome changes, also run:

```sh
npm run qa:epic-c:preview
```

* [ ] Desktop Chrome
* [ ] Desktop Edge
* [ ] Desktop Safari, when available
* [ ] Desktop Firefox
* [ ] Mobile Safari or WebKit
* [ ] Mobile Chrome
* [ ] Tablet-width layout
* [ ] 360-pixel layout
* [ ] 1440-pixel layout
* [ ] No unintended horizontal scrolling
* [ ] Sticky elements do not obscure controls
* [ ] Required Epic C responsive evidence has no width overlap, clipping, overflow, or sticky-focus obstruction failures.

## 7. Purchase-path testing

* [ ] Simple product can be added to cart.
* [ ] Multi-variant product selects and adds the correct variant.
* [ ] Sold-out product cannot be purchased.
* [ ] Quantity changes are correct.
* [ ] Cart notification or drawer displays the correct item.
* [ ] Full cart displays the correct item, price, and quantity.
* [ ] Cart quantity update works.
* [ ] Cart removal works.
* [ ] Quick order works where enabled.
* [ ] Machine product purchase behavior is intentional.
* [ ] Mobile purchase controls are usable.
* [ ] Checkout can be reached.

## 8. Search and discovery

* [ ] Predictive search opens and returns results.
* [ ] Full search works.
* [ ] Empty search results are understandable.
* [ ] Collection filters work.
* [ ] Active filters can be cleared.
* [ ] Mobile filter drawer works.
* [ ] Sorting works.
* [ ] Product cards link to the correct products.
* [ ] Header search, primary navigation, mobile drawer, breadcrumbs, and footer links match the Epic C route and IA contracts.

## 9. Accessibility

```sh
npm run test:ally
npm run test:global-chrome-accessibility
```

* [ ] Automated accessibility tests pass.
* [ ] No unapproved serious or critical axe violations exist.
* [ ] Keyboard-only navigation has been tested.
* [ ] Visible focus is present.
* [ ] Menus, dialogs, drawers, and accordions restore focus correctly.
* [ ] Product and collection imagery has appropriate alternative text.
* [ ] Form errors are understandable.
* [ ] The storefront remains usable at 200% zoom.
* [ ] Reduced-motion behavior has been reviewed.

## 10. Performance

Follow the budgets in `docs/qa/storefront-quality-baseline.md`.

For global chrome changes, run:

```sh
npm run validate:global-chrome-performance
```

* [ ] Homepage measured.
* [ ] Collection measured.
* [ ] Search measured.
* [ ] Machine product measured.
* [ ] Consumable product measured.
* [ ] Cart measured.
* [ ] Contact page measured.
* [ ] Three mobile Lighthouse runs were taken for critical pages.
* [ ] Median results were recorded.
* [ ] No unexplained material regression exists.
* [ ] New scripts and app embeds were reviewed.
* [ ] Hero and product images are appropriately sized.
* [ ] Noncritical media is lazy loaded.
* [ ] Header/footer assets, global chrome icons, Rhino CSS/JS, runtime resource count, third-party resources, and blocking media remain within the machine-readable global chrome budget.

## 11. Content and merchandising

* [ ] No stock Trade placeholder copy is exposed.
* [ ] Product names and prices are correct.
* [ ] Variant names are correct.
* [ ] Collection assignments are correct.
* [ ] Links do not lead to drafts or missing pages.
* [ ] Contact information is correct.
* [ ] Freight, lead-time, warranty, and support statements are accurate where displayed.
* [ ] Product media is appropriate for the product.
* [ ] Mobile image crops have been reviewed.
* [ ] Navigation/menu changes require release notes that list menu handles, label changes, route changes, admin evidence, validation, rollback, and unresolved destinations.

## 12. Shopify admin dependencies

Only review areas changed by this release.

* [ ] Products
* [ ] Collections
* [ ] Navigation
* [ ] Metafields or metaobjects
* [ ] Search and Discovery
* [ ] App blocks or embeds
* [ ] Policies
* [ ] Shipping
* [ ] Markets
* [ ] Customer accounts
* [ ] Pixels or customer events
* [ ] Notifications

For each changed area:

* [ ] Change owner is known.
* [ ] Preview verification is complete.
* [ ] Rollback procedure is known.
* [ ] Release notes identify the dependency.

Global chrome changes affect every storefront page. Treat header, mobile drawer,
mega menu, breadcrumbs, footer, policy, localization, support, search, cart,
account, and navigation Admin changes as broad storefront-impact changes.

## 13. Publish

* [ ] Final approval has been recorded.
* [ ] Production backup exists.
* [ ] Support or operations stakeholders have been notified when necessary.
* [ ] Release notes are ready.

Publish the reviewed preview theme through the Shopify admin or approved CLI workflow.

Do not push unreviewed local files directly into the currently published theme.

Use `docs/release/release-notes-template.md` for every production publish.

## 14. Post-publish verification

Immediately verify production:

* [ ] Homepage loads.
* [ ] Navigation works.
* [ ] Search works.
* [ ] Collection works.
* [ ] Product page works.
* [ ] Add to cart works.
* [ ] Cart works.
* [ ] Checkout can be reached.
* [ ] Contact page works.
* [ ] No obvious console errors appear.
* [ ] Analytics or pixels changed by the release fire once.
* [ ] Domain and HTTPS behavior are correct.

## 15. Rollback criteria

Rollback when production has:

* A broken purchase path
* Incorrect pricing
* Incorrect products or variants
* Broken navigation across major journeys
* Severe mobile breakage
* Serious accessibility regression blocking use
* Repeated storefront JavaScript errors
* Missing required settings
* Incorrect app or pixel behavior
* Any security or privacy concern

## 16. Release result

* [ ] Release successful
* [ ] Release rolled back
* [ ] Follow-up work required

Notes:
