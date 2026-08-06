# Rhino Reusable Section and Block Rules

**PBI:** B-028  
**Status:** Approved and machine enforced  
**Owner:** Brand, Content, Product Data, Accessibility, and Engineering

## Decision order

Before creating a Rhino section, use this order:

1. Use an existing Trade section when it already meets the need.
2. Use a block in an existing section when the information belongs there.
3. Use product metafields or metaobjects for structured content.
4. Create a Rhino section only when the presentation and content relationship
   are genuinely Rhino-specific.
5. Do not use Custom Liquid as a substitute for maintained theme code.

## Required marker

Every `sections/rhino-*.liquid` file must include:

```liquid
{% comment %}
  Rhino section pattern: technical-specs
{% endcomment %}
```

The value must match an approved or planned ID in:

data/rhino-section-patterns.json

## Root element

Every Rhino section must expose the shared class:

```liquid
class="rhino-section"
```

Additional classes must remain Rhino-prefixed.

## Heading hierarchy
- Sections do not render an `h1`.
- The default section heading is `h2`.
- Blocks beneath it use `h3` only when they form real subsections.
- Heading appearance is controlled through Rhino typography classes.
- A merchant cannot choose heading level merely for visual size.
## Content sources

Technical content comes from structured data.

Do not derive specifications or compatibility from:

- tags
- product title parsing
- product-description HTML
- collection membership
- handle names
- similar dimensions
- JavaScript inference

Policy, warranty, freight, identity, legal, and certification copy must use an
approved governed source.

## Schema
- Section names, setting labels, and information text use locale keys.
- Setting IDs use snake_case.
- Customer-facing text settings have no promotional placeholder defaults.
- Presets contain no generic Trade copy.
- Product-specific text is not hardcoded into section files.
- Custom Liquid settings are prohibited.
- App blocks require the existing app dependency and privacy process.
## Empty states

A section must either:

- omit itself,
- omit only missing rows,
- display an explicitly approved unconfirmed state, or
- show a merchant-only theme-editor warning.

A storefront customer must not see:

- empty bordered panels,
- placeholder icons,
- sample specifications,
- `TBD`,
- fake compatibility,
- generic lorem ipsum,
- theme-editor instructions.
## Media
- Product images remain Shopify product media.
- Shared documents and manuals use approved Files storage.
- Repository-owned UI diagrams and icons use the media manifest.
- Media dimensions are reserved to prevent layout shift.
- Complex diagrams have adjacent text alternatives.
- Videos use click-to-load behavior.
## JavaScript

Use no JavaScript unless the interaction cannot be provided accessibly through
HTML, CSS, or existing Trade behavior.

A new script requires:

- architecture review,
- event-contract review,
- performance measurement,
- reduced-motion behavior,
- disconnect cleanup,
- automated tests.
## Validation

Future Rhino sections run:

- `npm run validate:rhino-sections`
- `npm run validate:rhino-section-patterns`
- `npm run validate:hardcoded-strings`
- `npm run validate:media`
- `npm run validate:brand-claims`
- `npm run validate:brand-performance`
- `shopify theme check --fail-level warning`
## Completion condition

B-028 is complete when the pattern registry and validator pass.

Actual sections belong to their product-page, support, education, or preview
implementation PBIs.