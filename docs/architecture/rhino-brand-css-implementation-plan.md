# Rhino Brand CSS Implementation Plan

**PBI:** B-027  
**Status:** Approved and enforced  
**Owner:** Frontend Engineering and Brand  
**Primary entrypoint:** `assets/rhino-custom.css`

## Decision

Rhino will continue using one global owned stylesheet until there is a measured
reason to split it.

`assets/rhino-custom.css` remains loaded after Trade's `base.css`.

This keeps Rhino rules:

- visible in one reviewable layer
- separate from upstream Trade files
- available to global primitives
- testable against one token contract
- easy to remove during rollback

## CSS layers

Keep the file in this order:

1. Global design tokens
2. Responsive token overrides
3. Global typography and accessibility foundation
4. Typography roles
5. Layout primitives
6. Surfaces and panels
7. Links and actions
8. Forms and states
9. Product badges and trust markers
10. Machine-family identifiers
11. Rhino icons
12. Motion and loading
13. Technical diagrams
14. Geological motif
15. Video presentation
16. Section-specific adapters
17. Accessibility media queries

Do not reorder these layers casually. Later rules may rely on earlier tokens and
primitives.

## Selector contract

Rhino-owned components use:

- `.rhino-*`
- `[data-rhino-*]`
- `--rhino-*`
- `rhino-*` custom elements when a future approved component needs one

Global element selectors are allowed only for:

- approved body typography
- heading typography
- focus visibility
- text wrapping
- text selection
- reduced-motion behavior

Do not globally restyle generic Trade selectors such as:

- `.card`
- `.button`
- `.product`
- `.price`
- `.badge`
- `.field`
- `.drawer`
- `.header`
- `.footer`

A Trade component receives Rhino styling through:

1. an added Rhino class,
2. a Rhino wrapper,
3. a narrowly scoped template selector, or
4. an explicit documented upstream customization.

## Token contract

- Global visual values belong in `:root`.
- Global tokens must appear in `data/design-token-inventory.json`.
- Component-local variables may remain local when they are not shared design
  decisions.
- Component CSS uses `var(--rhino-*)` rather than repeating literal brand
  colors.
- Literal colors outside `:root` are prohibited.
- `!important` is prohibited unless an architecture exception is approved.

## Trade files

Do not edit inherited Trade CSS merely to apply branding.

A Trade CSS edit is allowed only when:

- the needed behavior cannot be expressed through the Rhino layer,
- the exact upstream file and rule are identified,
- the risk is recorded,
- rollback is documented,
- upstream-update impact is reviewed,
- tests cover the affected component.

## File splitting rule

Create a separate `assets/rhino-*.css` file only when at least one condition is
true:

1. The stylesheet is loaded only on a specific template or section.
2. The component exceeds approximately 8 KB uncompressed.
3. The component has an independent lifecycle or owner.
4. Loading it globally would violate the brand performance budget.
5. The section strategy explicitly calls for its own asset.

A split file must still use global Rhino tokens and pass the CSS architecture
validator.

## Validation

Every Rhino CSS change runs:

- `npm run validate:design-tokens`
- `npm run validate:css-architecture`
- `npm run validate:rhino-style-contract`
- `npm run validate:brand-performance`
- `python scripts/validate-theme-repository.py`
- `shopify theme check --fail-level warning`

Visible implementation also requires accessibility, responsive, and manual QA
evidence.

## Rollback

Revert the Rhino CSS commit and restore any related theme settings snapshot.

Do not manually edit generated theme-customization inventory documents. Run the
owning generator after source files change.