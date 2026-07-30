# JavaScript Architecture

## Purpose

Rhino Lapidary storefront JavaScript should be minimal, documented, and testable.

## Decision

Inherited Trade JavaScript remains the default runtime. Rhino-specific JavaScript should use:

```text
assets/rhino-storefront.js
```

only when Shopify settings, Liquid, or CSS cannot reasonably solve the problem.

## Rules

* Do not add global scripts without a documented owner and purpose.
* Do not create duplicate add-to-cart, cart, analytics, or pixel behavior.
* Do not intercept checkout.
* Rhino events must be documented in `data/storefront-event-contracts.json`.
* Rhino scripts must use a `window.RhinoLapidary` namespace if global state is unavoidable.
* Event names should use the `rhino:` prefix.
