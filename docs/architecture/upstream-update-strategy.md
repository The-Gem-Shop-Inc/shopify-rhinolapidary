# Shopify Trade Upstream Update Strategy

## Purpose

Rhino Lapidary is built as a customized fork of Shopify Trade.

This document defines how future Trade updates are reviewed and incorporated without overwriting Rhino-specific code, storefront configuration, or theme-editor settings.

## Repository references

The repository uses the following references:

* `main`: active Rhino Lapidary development
* `upstream/trade`: clean Shopify Trade source only
* `trade-15.5.0-baseline`: the original clean Trade 15.5.0 import
* `trade-<version>-baseline`: future clean Trade release tags

The `upstream/trade` branch must never contain Rhino-specific changes.

## Update cadence

Check for Trade updates:

* Before major feature development
* Before a major Rhino storefront release
* When Shopify announces a security, compatibility, or platform update
* At least quarterly while the storefront is actively maintained

An available update does not need to be applied immediately. Its changes and risks must be reviewed first.

## Obtaining a new Trade version

1. Add or download a clean copy of the new Trade version through Shopify.
2. Keep it outside the Rhino working directory initially.
3. Confirm the declared theme name and version in `config/settings_schema.json`.
4. Do not use a production Rhino theme as the source for the clean copy.
5. Do not copy Rhino `settings_data.json` into the upstream copy.

## Updating the upstream branch

Create a temporary worktree:

```sh
git worktree add ../rhino-trade-upstream upstream/trade
```

In that worktree:

1. Remove the previous clean Trade theme directories.
2. Copy in the new clean Trade theme.
3. Confirm that repository documentation, Rhino files, and local tooling were not copied into the upstream branch.
4. Commit the new clean release.
5. Tag the commit.

Example:

```sh
git add assets blocks config layout locales sections snippets templates
git commit -m "Update clean Shopify Trade baseline to 15.6.0"
git tag -a trade-15.6.0-baseline -m "Clean Shopify Trade 15.6.0 baseline"
git push origin upstream/trade
git push origin trade-15.6.0-baseline
```

Use the actual version number reported by the new theme.

## Reviewing an update

Create a maintenance branch from `main`:

```sh
git switch main
git pull
git switch -c maintenance/trade-15.6.0
git merge upstream/trade
```

Do not resolve conflicts automatically.

For every conflict, determine whether the file is:

* Unmodified inherited Trade code
* Modified inherited Trade code
* Rhino-specific code
* Shopify-admin or theme-editor configuration
* App-generated configuration

Use the customization inventory to guide this review.

## `settings_data.json`

The clean upstream version of `config/settings_data.json` must not replace Rhino's configured version.

During an upstream merge:

* Keep Rhino's current `settings_data.json`
* Review new settings added by Trade
* Add required new setting values deliberately
* Test the resulting theme in an unpublished preview
* Record any intentional settings changes separately

## Required regression testing

Every Trade update must test:

* Homepage
* Header and navigation
* Predictive search
* Collection filters and sorting
* Product cards
* Simple products
* Multi-variant products
* Machine products
* Add to cart
* Cart notification
* Cart drawer, if enabled
* Cart page
* Quick-order behavior
* Product recommendations
* Contact page
* Customer login
* Desktop and mobile layouts
* Keyboard navigation
* Theme-editor section editing

Cart and quick-order behavior are considered high-risk because they depend on custom elements, section rendering, and Shopify event behavior.

## Approval

An upstream update may only be merged into `main` after:

* Theme Check passes
* CI passes
* The customization inventory is updated
* Conflict decisions are documented
* Preview testing passes
* A rollback theme exists
* The person responsible for storefront publishing approves the update

## Emergency updates

For urgent security or compatibility changes:

1. Create a focused maintenance branch.
2. Apply only the required upstream patch where practical.
3. Test the affected customer journey.
4. Publish through the normal preview and rollback process.
5. Reconcile the complete upstream release afterward.

## Rollback

Before publishing an upstream update:

* Duplicate the currently published Shopify theme
* Record its theme name and ID
* Record the currently deployed Git commit
* Keep the previous release available until post-release verification passes

If a serious regression is found, republish the rollback theme and revert or repair the corresponding repository change.
