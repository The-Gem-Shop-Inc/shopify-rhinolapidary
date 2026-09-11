# D-PBI-017 Implementation Record

## Status

Complete with deferred dependency.

## Classification

Truthful no-render decision; full comparison remains Epic I scope.

## Files Changed

- `data/rhino-section-patterns.json`
- `scripts/validate-rhino-section-patterns.js`
- `docs/qa/evidence/epic-d/2026-08-26-epic-d-gap-closure-merchandising-audit.json`
- This implementation record

## Source / Evidence

Preview searches for comparison, compare, and buying/selection guidance found no genuine comparison-oriented destination. The Machines collection is a shopping destination, not comparison guidance, and was not repurposed to imply a comparison experience.

## Automation Added / Reused

The existing Rhino pattern validator now generically rejects implementation files that declare any non-approved pattern. The comparison pattern remains `planned` and `post_launch`, preventing an unapproved teaser from rendering without introducing a PBI-specific framework.

## Validation Output

```text
npm run validate:rhino-section-patterns: PASS; 9 patterns, 2 implemented Rhino sections.
npm run validate:rhino-sections: PASS.
npm run validate:homepage-sections: PASS; 12 modules.
npm run theme:check: PASS; 236 files, 0 offenses.
```

## Preview Runtime Evidence

Preview theme `158631198917`: no comparison page, buyer guide, machine-selection guide, or equivalent truthful destination was found. No comparison module renders.

## Manual Checks

The Machines collection and search candidates were reviewed for destination meaning, not merely route success.

## Blockers / Deferred Dependencies

Epic I or an independently approved buyer guide must provide the destination and approved structured fields: machine identity, supported operations, dimensions/footprint, electrical requirements, approved motor/speed data, verified machine weight, included components, and applicable consumables/accessories. Other fields may be used only when approved.

## Acceptance Criteria

| Criterion | Result |
|---|---|
| Teaser does not pretend the Machines collection is comparison guidance. | PASS |
| Unsupported comparisons or recommendations are absent. | PASS |
| Full comparison is handed to Epic I with structured-field needs. | PASS |
| Blocked/planned pattern cannot be rendered. | PASS |

## Production Safety

No comparison UI, app, route, Admin state, or production theme was changed.

## Rollback Notes

Revert the pattern note and generic non-approved-pattern assertion if governance is redesigned. There is no customer-facing module to remove.
