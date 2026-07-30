# Design Token Governance

## Purpose

Rhino Lapidary should customize the Trade theme through documented tokens and narrow overrides, not scattered one-off colors, spacing, fonts, or shadows.

## Source of truth

Repository token inventory:

```text
data/design-token-inventory.json
```

Automated validation:

```text
npm run validate:design-tokens
```

## Rules

* Rhino-specific visual decisions must be represented in the token inventory.
* Avoid hardcoded colors in new Rhino CSS.
* Prefer CSS custom properties over repeated literal values.
* Do not modify inherited Trade tokens without documenting the reason.
* Theme-editor color and typography decisions must be noted in release notes when changed.
