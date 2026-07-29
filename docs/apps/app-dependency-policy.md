# Rhino Lapidary App Dependency Policy

## Purpose

Rhino Lapidary should stay as Shopify-native as practical.

Apps, app blocks, app embeds, custom pixels, and third-party scripts can add storefront value, but they also add cost, maintenance risk, performance risk, privacy risk, and rollback complexity.

No app should be installed, enabled, or relied on without an owner, purpose, verification plan, and removal path.

## Default position

Use the lowest-risk solution that satisfies the business need.

Preference order:

1. Shopify-native feature
2. Shopify first-party/free app
3. Small theme implementation controlled in this repository
4. Reputable third-party app with clear uninstall path
5. Custom third-party script or Custom Liquid only when no safer option is practical

## Required before adding an app

Before installing or enabling an app, document:

* App name
* Vendor
* Owner
* Business purpose
* Cost
* Data access requested
* Storefront injection behavior
* Theme app blocks
* App embed blocks
* Customer events or pixels
* Pages affected
* Performance impact
* Accessibility impact
* Privacy/consent impact
* Configuration location
* Test plan
* Removal plan
* Rollback plan

## Approval requirements

An app requires explicit approval when it:

* Adds storefront JavaScript
* Adds app blocks to product, cart, header, footer, or checkout-adjacent pages
* Adds pixels or customer-event tracking
* Collects customer data
* Changes product, order, customer, or checkout behavior
* Adds recurring cost
* Creates lock-in for content, reviews, subscriptions, forms, search, analytics, or merchandising
* Review `docs/privacy/security-privacy-review-checklist.md`.

## App blocks

App blocks must be documented by:

* Section
* Template
* Page type
* Business purpose
* Owner
* Screenshots
* Preview URL
* Accessibility check
* Performance check
* Rollback process

Product pages, cart-adjacent areas, header, footer, and global app sections are high-risk surfaces.

## App embeds

App embeds must be documented even when they do not appear in repository files.

Every enabled app embed must have:

* Owner
* App/vendor
* Purpose
* Pages affected
* Script behavior
* Consent/privacy behavior
* Disable steps
* Last reviewed date

## Shopify admin source of truth

The repository cannot prove which apps or app embeds are enabled in Shopify admin.

For each release, review changed app behavior in:

* Shopify Admin → Apps
* Shopify Admin → Online Store → Themes → Customize → App embeds
* Shopify Admin → Settings → Customer events
* Shopify Admin → Settings → Customer privacy
* Shopify Admin → Sales channels

## No blind migration

Do not copy scripts or app behavior from:

* Legacy Rhino/Weebly pages
* The Gem Shop pages
* Prior theme snippets
* Third-party install guides

without reviewing duplication risk, consent behavior, event ownership, performance, and rollback.

## Register requirement

All approved apps must be recorded in:

* `docs/apps/app-register.md`

All custom Liquid/app embed bypasses must be recorded in:

* `docs/apps/theme-editor-code-register.md`

All analytics, marketing, and customer-event scripts must be recorded in:

* `docs/privacy/third-party-script-and-pixel-register.md`

## Release rule

No production publish should include a new or changed app, app block, app embed, Custom Liquid block, script, or pixel unless the relevant register has been updated.
