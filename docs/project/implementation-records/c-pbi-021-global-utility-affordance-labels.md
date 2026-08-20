# C-PBI-021 Implementation Record

## Status

Complete.

## Summary

- Added `tests/global-utilities.spec.js`.
- The suite covers search trigger naming, keyboard activation, focus movement,
  close/focus return, and `/search` submission.
- The suite covers cart empty and nonempty accessible state using the existing
  product fixture and AJAX cart reset.
- The suite covers account affordance naming and intended account route.
- The suite records rendered or Shopify-suppressed localization controls and
  tests keyboard operation when rendered.

## Evidence

- `test-results/epic-c/batch-3/global-utilities.json`

## Blocker

`npm run test:global-utilities` and a retry both failed before storefront HTML
loaded because Shopify returned challenge URLs with `__cf_chl_rt_tk`.

## Finalization Reconciliation - 2026-08-18

- The Playwright preview authentication problem was repaired by consolidating browser access on the shared `tests/helpers/storefront-auth.js` helper.
- The utility suite now avoids unnecessary `/cart/clear.js` traffic and seeds nonempty cart state through the rendered product form UI, then verifies the customer-visible header cart count.
- Customer accounts are enabled for launch. The account affordance renders with accessible name `Log in` and routes to Shopify customer authentication, not `/password`.
- Search opens by keyboard, focuses the input, submits to `/search?q=rhino`, closes with focus return, and has accessible labels.
- Localization controls are absent by launch decision and leave no empty UI.
- Final validation: `npm run test:global-utilities` passed `6/6`; `npm run test:cart` passed `6/6`; `npm run test:smoke` passed `39/39`.

## Rollback

Remove `tests/global-utilities.spec.js` and the `test:global-utilities` package
script if the test contract must be reverted.
