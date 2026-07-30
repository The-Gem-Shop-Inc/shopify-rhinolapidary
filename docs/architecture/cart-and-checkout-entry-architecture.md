# Cart and Checkout Entry Architecture

## Purpose

This document defines the expected Rhino Lapidary cart behavior before checkout.

The theme controls product forms, add-to-cart behavior, cart notification/drawer/page behavior, and links into checkout. Shopify controls checkout itself unless the store has Shopify Plus customization.

## Current decision

Rhino Lapidary uses Shopify Trade’s normal product form and cart flow.

Current expected behavior:

* Product pages use variant picker, quantity selector, and buy buttons.
* Add to cart submits through the theme’s product form behavior.
* Successful add-to-cart opens the configured cart notification.
* Cart page remains available at `/cart`.
* Checkout entry remains Shopify-native.
* Dynamic checkout buttons are disabled by default until payment/UX decisions are made.
* Quick order is not the default purchase path for normal products.

## Required customer journeys

* Product page loads.
* Variant selection works.
* Quantity selection works.
* Add to cart works.
* Cart notification appears after add-to-cart.
* Cart page shows the added item.
* Quantity update works on cart page.
* Remove item works on cart page.
* Checkout link/button is visible when cart has purchasable items.

## Out of scope

This document does not define Shopify checkout customization, tax rules, shipping rules, payment providers, or order processing.

Those are Shopify admin/business workflows and must be documented separately if changed.

## Automation

Cart behavior is verified by:

```text
npm run test:cart
npm run validate:cart-config
```

## Launch blockers

Launch is blocked if:

* Add to cart fails.
* Cart notification/drawer fails to open after add-to-cart.
* Cart page cannot be reached.
* Cart quantity updates fail.
* Checkout entry cannot be reached.
* Product form submits the wrong variant.
* Sold-out/unavailable products can be purchased accidentally.
