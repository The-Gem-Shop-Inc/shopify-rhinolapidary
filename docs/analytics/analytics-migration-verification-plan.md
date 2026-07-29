# Analytics Migration and Verification Plan

## Purpose

This plan prevents Rhino Lapidary’s migration to Shopify from losing important analytics data or double-counting ecommerce events.

It connects the third-party script and pixel register to a practical event ownership model.

## Source systems to inspect

Before launch, inspect:

* Legacy Rhino website
* Legacy Weebly settings
* The Gem Shop Rhino-related pages
* Shopify Admin → Settings → Customer events
* Shopify Admin → Online Store → Preferences
* Shopify Admin → Apps
* Shopify Admin → Sales channels
* Google & YouTube channel
* Meta/Facebook channel
* Any email, review, chat, video, or form app
* Google Analytics / GA4 admin
* Google Search Console
* Google Tag Manager, if used
* Google Ads, if used
* Meta Events Manager, if used

## Analytics property inventory

| System            | Property/account ID | Owner | Current source  | Future source    | Status         | Notes                                                           |
| ----------------- | ------------------- | ----- | --------------- | ---------------- | -------------- | --------------------------------------------------------------- |
| Shopify Analytics | Shopify-native      | TBD   | Shopify         | Shopify          | Proposed       | Baseline business reporting                                     |
| GA4               | TODO                | TBD   | Legacy/TGS/none | TBD              | Needs decision | Decide whether Google & YouTube app or custom pixel owns events |
| Google Ads        | TODO                | TBD   | Legacy/TGS/none | TBD              | Needs decision | Must not duplicate purchase events                              |
| Meta Pixel        | TODO                | TBD   | Legacy/TGS/none | TBD              | Needs decision | Must respect consent/data-sharing settings                      |
| Search Console    | TODO                | TBD   | Legacy/TGS/none | Canonical domain | Needs setup    | Verify canonical host                                           |

## Event ownership

Every event must have one owner.

| Event            | Owner | Source | Destination | Verification method                  | Duplicate risk |
| ---------------- | ----- | ------ | ----------- | ------------------------------------ | -------------- |
| Page view        | TBD   | TBD    | TBD         | Browser devtools / platform debugger | Medium         |
| Product view     | TBD   | TBD    | TBD         | Product page test                    | Medium         |
| Search submitted | TBD   | TBD    | TBD         | Search test                          | Low/Medium     |
| Add to cart      | TBD   | TBD    | TBD         | Add-to-cart test                     | High           |
| Begin checkout   | TBD   | TBD    | TBD         | Checkout transition test             | High           |
| Purchase         | TBD   | TBD    | TBD         | Test order / platform debugger       | Critical       |
| Contact/lead     | TBD   | TBD    | TBD         | Form submission test                 | Medium         |

## Migration rules

* Do not copy old analytics scripts into theme Liquid by default.
* Do not install both a sales-channel pixel and a custom pixel for the same event without a documented reason.
* Purchase tracking must have one owner.
* Add-to-cart tracking must have one owner.
* If Google Tag Manager is used, it must be documented in the pixel register.
* If Shopify-native app pixels are used, their event behavior must be verified.
* Custom pixels must document consent and customer-event subscriptions.
* Legacy properties must be retired, archived, or explicitly mapped.

## Verification sequence

### Before enabling new analytics

* [ ] Inventory legacy analytics IDs.
* [ ] Inventory The Gem Shop Rhino-related analytics dependencies.
* [ ] Confirm whether Rhino uses a separate GA4 property.
* [ ] Confirm who owns reporting.
* [ ] Confirm customer consent/privacy behavior.
* [ ] Record desired event owners.

### Preview verification

* [ ] Homepage page view fires once.
* [ ] Product view fires once.
* [ ] Collection view/page view fires once.
* [ ] Search event fires once, if configured.
* [ ] Add to cart fires once.
* [ ] Begin checkout fires once, if visible to configured platform.
* [ ] Contact/lead event fires once, if configured.
* [ ] No duplicate purchase event is possible from theme-level scripts.

### Production verification

* [ ] Real-time analytics shows page view.
* [ ] Pixel helper/debugger sees the expected events.
* [ ] GA4 DebugView or real-time report shows expected events, if GA4 is used.
* [ ] Search Console property uses the canonical domain.
* [ ] Test order or controlled transaction validates purchase reporting, if enabled.
* [ ] Duplicate purchase events are ruled out.

## Test matrix

| Journey             | Expected analytics behavior                            |
| ------------------- | ------------------------------------------------------ |
| Homepage view       | One page view                                          |
| Product page view   | One page view; one product view if configured          |
| Search              | One search event if configured                         |
| Collection filter   | Page/navigation event only if intentionally configured |
| Add to cart         | One add-to-cart event                                  |
| Checkout transition | One begin-checkout event if configured                 |
| Purchase            | One purchase event                                     |
| Contact form        | One lead/contact event if configured                   |

## Launch blockers

Launch is blocked if:

* Purchase tracking has no owner.
* Purchase tracking has more than one owner.
* Add-to-cart tracking has more than one owner.
* Legacy analytics scripts are still active unintentionally.
* Customer consent behavior is unknown.
* Analytics/pixel configuration is not listed in the register.
