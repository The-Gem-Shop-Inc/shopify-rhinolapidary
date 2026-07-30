# Rhino Custom Section and Block Strategy

## Purpose

Rhino-specific sections and blocks should be intentional, reusable, and schema-safe.

## Naming rules

* Rhino-specific sections use `sections/rhino-*.liquid`.
* Rhino-specific snippets use `snippets/rhino-*.liquid`.
* Rhino-specific CSS uses `assets/rhino-*.css`.
* Rhino-specific JavaScript uses `assets/rhino-*.js`.

## Section schema rules

Every Rhino section must have:

* A schema name
* A preset, unless intentionally internal
* Clear setting labels
* No TODO setting labels
* No placeholder default copy in customer-facing settings
* Blocks only when the merchant needs repeatable content

## When to create a custom section

Create a Rhino custom section when:

* Trade cannot express the layout safely through settings
* The section represents reusable Rhino merchandising/support content
* The section has clear ownership and test coverage
* The behavior should be version-controlled rather than Custom Liquid

## When not to create a custom section

Do not create a custom section for:

* One-off admin content
* Analytics or pixels
* App install snippets
* Temporary launch notes
* Large JavaScript widgets better served by an app or separate integration
