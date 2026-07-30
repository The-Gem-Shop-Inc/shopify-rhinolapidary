# ADR-0003: Navigation Architecture

## Status

Proposed

## Context

Rhino Lapidary navigation must help customers quickly reach machines, consumables, accessories, replacement parts, support content, contact information, and policies.

Shopify navigation is admin-owned, but the repository should define expected storefront routes and smoke-test them.

## Decision

Maintain a repository navigation spec at:

```text
data/navigation-spec.json
```

The spec defines expected route groups, labels, paths, and whether each route is launch-required.

Automated verification is handled by:

```text
npm run validate:navigation
npm run test:navigation
```

## Rules

* Navigation paths must begin with `/`.
* Launch-required navigation routes must resolve in preview.
* Do not point launch navigation to draft/unpublished products.
* Do not use external links for core Rhino shopping journeys unless deliberately approved.
* Header/footer menu admin changes must be reflected in the navigation spec.
* Navigation changes should be mentioned in release notes.

## Required launch route groups

* Homepage
* Machines
* Consumables
* Accessories
* Replacement parts
* Contact/support
* Policies
* Cart

## Non-goals

This ADR does not define final menu copy or final merchandising hierarchy. It defines a testable route contract.
