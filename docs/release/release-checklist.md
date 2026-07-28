# Rhino Lapidary Theme Release Checklist

**Publish authority:** Store owner or designated production publisher
**Required environment:** Persistent unpublished preview theme
**Last reviewed:** 2026-07-03

A release is not approved until every applicable item is complete.

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
```

* [ ] Repository validation passes.
* [ ] Theme Check passes.
* [ ] JSON files are valid.
* [ ] Theme Check suppressions are documented.
* [ ] No new unexplained warnings exist.

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

## 9. Accessibility

```sh
npm run test:a11y
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

## 13. Publish

* [ ] Final approval has been recorded.
* [ ] Production backup exists.
* [ ] Support or operations stakeholders have been notified when necessary.
* [ ] Release notes are ready.

Publish the reviewed preview theme through the Shopify admin or approved CLI workflow.

Do not push unreviewed local files directly into the currently published theme.

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
