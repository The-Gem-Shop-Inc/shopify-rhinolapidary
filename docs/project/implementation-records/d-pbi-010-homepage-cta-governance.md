# D-PBI-010 Implementation Record

## Status

Complete.

## Classification

Homepage CTA hierarchy governance and validator enforcement.

## Files Changed

- `data/homepage-section-outcomes.json`
- `schemas/homepage-section-outcomes.schema.json`
- `scripts/validate-homepage-section-outcomes.js`
- `docs/brand/epic-d-homepage-hero-content-model.md`

## Source / Evidence

- `docs/brand/rhino-action-hierarchy.md`
- `data/navigation-spec.json`
- `data/homepage-section-outcomes.json`
- Current homepage CTA evidence from Batch 1

## Automation Added / Reused

Extended `scripts/validate-homepage-section-outcomes.js` to enforce:

- At most one primary commerce action per action group.
- Non-empty visible and accessible labels.
- Governed route references for actions.
- Active actions cannot target draft or blocked routes.
- Generic labels require destination context.
- Support actions cannot visually outrank commerce actions outside support-specific modules.
- Source order values are unique per module.

## Validation Output

```text
npm run validate:homepage-sections: PASS; 12 modules.
npm run validate:registers: PASS; homepage section outcomes valid.
```

## Preview Runtime Evidence

Current rendered CTAs remain `Shop machines` and `Contact us`; no template changes were made.

## Manual Checks

No visual CTA review was performed. Current labels are observed, not a final homepage redesign approval.

## Blockers

Future actions for parts, accessories, consumables, inquiry, video, financing, dealer, and institutional paths remain blocked where their routes or claims are blocked.

## Acceptance Criteria

| Criterion | Result |
|---|---|
| Each action group has at most one primary CTA. | PASS |
| Support actions do not outrank commerce actions unless support-specific. | PASS |
| Labels name action or destination. | PASS |
| Keyboard order expected to follow source order. | PASS via governed `sourceOrder`; runtime coverage in D-PBI-011 and D-PBI-026 |

## Production Safety

No Admin or production mutation occurred.

## D-PBI-008 / D-PBI-009 Implication

Future hero/path implementations must mark actions approved and implemented before preview tests require them. Draft or blocked routes cannot become active CTAs.
