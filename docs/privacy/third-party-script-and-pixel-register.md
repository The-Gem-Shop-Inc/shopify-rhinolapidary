# Third-Party Script and Pixel Register

## Purpose

This register owns analytics, marketing pixels, customer events, app pixels, custom pixels, tag managers, embedded forms, video embeds, chat widgets, review widgets, and any third-party script that can affect storefront behavior or customer data.

## Policy

No production launch should include unowned tracking or duplicate customer-event reporting.

Every event should have one owner.

## Event ownership

| Event | Owner | Source | Destination | Notes |
|---|---|---|---|---|
| Page view | TBD | Shopify / analytics platform | TBD | Define before launch |
| Product view | TBD | Shopify / analytics platform | TBD | Define before launch |
| Search submitted | TBD | Shopify / analytics platform | TBD | Define before launch |
| Add to cart | TBD | Shopify / analytics platform | TBD | Define before launch |
| Begin checkout | Shopify checkout / analytics platform | TBD | TBD | Verify before launch |
| Purchase | Shopify checkout / analytics platform | TBD | TBD | Must not be duplicated |
| Contact/lead | TBD | Form or app | TBD | Define before launch |

## Script and pixel register

| ID | Type | Source/vendor | Owner | Business purpose | Location | Data collected | Consent behavior | Pages affected | Events emitted | Test method | Removal process | Status | Last reviewed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PIX-001 | App pixel / custom pixel / sales channel | TBD | TBD | TBD | Shopify Admin → Settings → Customer events | TBD | TBD | TBD | TBD | Shopify Pixel Helper / browser devtools / test order | Disable/remove pixel | Proposed | 2026-07-29 |

## Admin locations to inspect

- Shopify Admin → Settings → Customer events
- Shopify Admin → Settings → Customer privacy
- Shopify Admin → Online Store → Preferences
- Shopify Admin → Online Store → Themes → Customize → App embeds
- Shopify Admin → Apps
- Shopify Admin → Sales channels
- Google & YouTube app
- Meta/Facebook app
- Shop channel
- Any form, review, chat, video, or marketing app

## Legacy migration checks

Before launch, inspect legacy Rhino and The Gem Shop sources for:

- GA4 IDs
- Google Ads tags
- Google Tag Manager containers
- Meta pixels
- Pinterest/TikTok pixels
- Email marketing scripts
- Review widgets
- Chat widgets
- Embedded forms
- YouTube/Vimeo embeds
- Duplicate purchase or add-to-cart tracking

Do not copy legacy scripts into the Shopify theme by default.

## Production launch rule

Production launch is blocked until:

- [ ] Purchase tracking has exactly one owner.
- [ ] Add-to-cart tracking has exactly one owner.
- [ ] Product-view tracking has exactly one owner.
- [ ] Legacy analytics IDs are retired, migrated, or intentionally mapped.
- [ ] Customer consent behavior is documented.
- [ ] App/custom pixels are tested.
- [ ] Duplicate purchase events are ruled out.
- [ ] Review `docs/privacy/security-privacy-review-checklist.md`.