# Backup and Rollback Procedures

## Purpose

This document defines how Rhino Lapidary backs up theme code, theme-editor settings, Shopify admin configuration, domain changes, redirects, analytics, and app/pixel settings before risky releases.

A rollback must be executable by a developer who did not perform the original release.

## Backup levels

| Level                   | Use when                                                                        | Backup required                                                          |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Routine theme release   | Theme code or settings change                                                   | Duplicate current published theme; record Git commit                     |
| Admin-impacting release | Products, collections, menus, app embeds, settings, policies                    | Theme backup plus admin register snapshot                                |
| Launch release          | Domain, redirects, analytics, products, policies, checkout/support dependencies | Full launch backup package                                               |
| Emergency hotfix        | Broken production behavior                                                      | Duplicate current state if possible; capture current theme ID and commit |

## Required backup package

Before production launch or major publish, capture:

* Current published theme name and ID
* Backup theme name and ID
* Release Git commit
* Preview theme name and ID
* Current `config/settings_data.json`
* Theme customization inventory
* App register
* App block surface audit
* Theme-editor code register
* Third-party script and pixel register
* Security/privacy checklist, if relevant
* Domain settings screenshot
* DNS records screenshot/export
* Redirect map
* Analytics/pixel configuration notes
* Product import/export snapshot when product data changed
* Collection/navigation notes when changed
* Policy/support content notes when changed

## Theme rollback

If a release breaks storefront theme behavior:

1. Confirm the issue.
2. Determine whether the issue is theme-only or admin/config related.
3. Republish the backup theme through Shopify Admin or approved CLI process.
4. Verify homepage, product page, cart, and checkout transition.
5. Record rollback time and reason.
6. Create follow-up issue.
7. Revert or repair the Git commit.

## Code rollback

Use Git when the issue originated from repository code:

```powershell
git revert <bad_commit>
```

Then:

```powershell
python .\scripts\validate-theme-repository.py
shopify theme check --fail-level warning
npm run check:placeholders
npm run test:ally
```

Deploy to preview before production.

## Settings rollback

If the issue came from theme-editor settings:

1. Compare current `config/settings_data.json` with the release commit.
2. Restore the known-good settings file when appropriate.
3. Push to preview first.
4. Verify the affected page.
5. Publish only after approval.

Do not blindly overwrite production settings if app embeds or admin-owned changes occurred after the backup.

## Admin rollback

Admin rollback can be manual and must be documented.

For changed areas, record:

| Area                   | Backup method                      | Rollback method                              |
| ---------------------- | ---------------------------------- | -------------------------------------------- |
| Products               | CSV export or import file snapshot | Re-import or manually restore changed fields |
| Collections            | Screenshot/export/manual notes     | Manually restore rules, products, or handles |
| Navigation             | Screenshot/manual notes            | Restore menu links                           |
| Policies/pages         | Copy text snapshot                 | Restore content in admin                     |
| Redirects              | CSV export/map                     | Remove or re-import redirects                |
| Apps/app embeds        | Register and screenshots           | Disable app/app embed                        |
| Pixels/customer events | Pixel register/screenshots         | Disable/remove pixel                         |
| Domains/DNS            | DNS screenshot/export              | Restore previous DNS records                 |
| Theme settings         | Git/settings snapshot              | Restore reviewed settings                    |

## Domain rollback

Domain rollback is high-risk.

Before changing DNS or primary domain:

* [ ] Record existing DNS records.
* [ ] Record current primary domain.
* [ ] Record Shopify domain status.
* [ ] Record legacy host behavior.
* [ ] Keep DNS provider access available.
* [ ] Identify who can change DNS.

If launch domain routing fails:

1. Do not repeatedly change DNS without recording each change.
2. Confirm whether failure is DNS, SSL/TLS, Shopify domain verification, Cloudflare/proxy, or theme issue.
3. Restore previous DNS only if Shopify domain routing is confirmed to be the cause.
4. Record TTL and expected propagation window.
5. Keep customers/support informed when appropriate.

## Redirect rollback

If redirects cause loops or wrong targets:

1. Export current Shopify redirects if possible.
2. Remove or correct bad redirect rules.
3. Re-import the last known-good redirect map.
4. Spot-check critical legacy URLs.
5. Check canonical host behavior.

## Analytics rollback

If duplicate or incorrect tracking appears:

1. Disable the newly added pixel/app embed/custom pixel.
2. Preserve evidence before changing configuration.
3. Record affected events.
4. Confirm purchase/add-to-cart event ownership.
5. Re-test with debugger/real-time reports.
6. Update the pixel register.

## App/embed rollback

If an app or app embed breaks production:

1. Disable the app embed first when possible.
2. Remove app blocks from high-risk templates if necessary.
3. Disable or uninstall the app only after documenting data/config consequences.
4. Verify storefront pages affected by the app.
5. Update app register and release notes.

## Rollback decision rules

Rollback immediately if production has:

* Broken add-to-cart
* Broken checkout transition
* Incorrect pricing
* Incorrect product availability
* Missing key product pages
* Severe mobile layout failure
* SSL/domain failure
* Redirect loop on primary domain
* Duplicate purchase tracking
* Privacy/consent regression
* App/script breaking storefront JavaScript

## Release checklist integration

The routine release checklist must require:

* Backup theme name
* Backup theme ID
* Git commit
* Admin-impact summary
* Rollback owner
* Rollback decision window
* Post-publish verification result
