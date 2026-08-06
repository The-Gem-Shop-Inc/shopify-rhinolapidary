# Rhino Legacy Content Migration Rules

**PBI:** B-024  
**Status:** Approved process; register population and review required  
**Owner:** Content, Product Data, SEO, Legal, Technical, Media, and Shopify Admin

## Principle

Legacy content is evidence. It is not automatically approved destination copy.

## Decisions

Every source receives one decision:

- `reuse`: migrate substantially unchanged after verification
- `rewrite`: use as evidence while drafting new Rhino copy
- `leave_and_summarize`: retain on The Gem Shop and use a distinct Rhino summary
- `reference_only`: preserve as internal evidence
- `retire`: remove from active use and redirect where appropriate
- `blocked`: no migration until an identified dependency is resolved

Verbatim reuse should be rare.

## Required evaluation

Each source must identify:

- owner
- rights
- destination
- canonical owner
- redirect need
- technical verification
- legal verification
- media review
- claims
- support impact
- status

## Product copy

Product copy must be rewritten from approved structured facts.

Do not carry forward:

- unsupported motor, speed, voltage, capacity, certification, safety, patent, or
  durability claims
- HTML presentation copied from The Gem Shop
- inline red promotional warnings
- generic shipping cost ranges
- unsupported compatibility
- inconsistent product naming
- zero-price workarounds

## Policies

Policy content requires legal and operational approval.

Do not silently correct policy wording and treat the correction as approved.

## Media

The Gem Shop media requires confirmed reuse permission.

Product media belongs in Shopify product media. Shared documents may belong in
Shopify Files. Repository assets are reserved for governed theme UI media.

## SEO

Every migrated or retired URL requires a canonical and redirect decision.

Do not publish substantially duplicate product or article content on both Rhino
and The Gem Shop without an explicit ownership decision.

## Implementation paths

### Repository

- Metadata behavior
- redirect validation
- placeholder detection
- locale-controlled reusable UI text
- structured-data behavior

### Shopify admin

- Products
- collections
- pages
- policies
- articles
- media
- Files
- redirects
- SEO titles and descriptions

Admin changes require admin-change records and rollback evidence.

## Completion condition

B-024 closes when:

1. The process is approved.
2. The register covers every identified legacy Rhino and The Gem Shop source.
3. Every source has an owner and migration decision.
4. Canonical and redirect dependencies are visible.
5. Blocked claims remain blocked.
6. The migration validator passes.