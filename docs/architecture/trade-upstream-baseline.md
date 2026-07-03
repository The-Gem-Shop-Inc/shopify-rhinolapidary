# Trade Upstream Baseline

**Owner:** Rhino Lapidary software engineering  
**Last reviewed:** 2026-07-02

## Baseline

- Theme: Shopify Trade
- Theme version: 15.5.0
- Theme author: Shopify
- Baseline repository commit: `f978a65`
- Baseline recorded: 2026-07-02
- Upstream source: Shopify Theme Store — Trade

This commit represents the clean Trade baseline imported before substantial
Rhino Lapidary customization began.

## Purpose

The baseline allows future developers to distinguish:

1. Unmodified Shopify Trade files
2. Rhino-modified Trade files
3. New Rhino-specific files
4. Shopify-admin configuration that does not live in the repository
5. App-injected code that does not live in the repository

## Update policy

Trade updates must not be copied directly over the Rhino theme.

For each upstream Trade release:

1. Obtain a clean copy of the new Trade release.
2. Compare it against this recorded baseline and the current Rhino branch.
3. Review changes to high-risk surfaces individually.
4. Resolve conflicts deliberately.
5. Run Theme Check.
6. Test product purchase, cart, quick order, search, filters, and mobile behavior.
7. Test accessibility and performance baselines.
8. Deploy to an unpublished preview theme.
9. Publish only after the release checklist passes.

## High-risk inherited surfaces

The following inherited or platform-sensitive areas require explicit review:

- `layout/theme.liquid`
- `config/settings_schema.json`
- `config/settings_data.json`
- `templates/product.json`
- `sections/main-product.liquid`
- `assets/cart.js`
- `assets/cart-notification.js`
- `assets/quick-order-list.js`
- `assets/standard-actions-override.js`
- Collection and search filtering
- App blocks and app embeds

`assets/standard-actions-override.js` currently refers to Dawn throughout its
documentation and implementation comments even though this repository is a
Trade theme. Its origin and compatibility must be verified before it is
modified or relied upon as Rhino-specific code.

## Rhino customization rule

Every pull request that changes an inherited Trade file must state:

- Why the inherited file must change
- Whether a new Rhino-specific section, snippet, or asset was considered
- Which storefront journeys were tested
- Whether the change increases future upstream merge risk