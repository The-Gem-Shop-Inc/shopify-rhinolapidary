# CSS Architecture

## Purpose

Rhino Lapidary custom styling should remain easy to identify, review, and remove.

## Decision

Rhino-specific CSS lives in:

```text
assets/rhino-custom.css
```

Future larger components may use:

```text
assets/rhino-*.css
```

## Rules

* Rhino-specific selectors should use `rhino-` class names where practical.
* Rhino design tokens must use `--rhino-*`.
* Avoid adding Rhino-specific overrides directly to inherited Trade CSS files.
* If an inherited Trade CSS file must be changed, document why in the PR.
* No hardcoded tracking, app, or third-party styling belongs in Rhino CSS.
