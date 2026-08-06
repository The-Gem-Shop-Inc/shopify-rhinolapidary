# Rhino Lapidary Epic B PBI Tracker

**Epic:** Epic B — Rhino Brand Foundation  
**Source:** `docs/rhino-storefront-discovery-epic-b.md`  
**Tracker revision:** 2  
**Updated:** 2026-07-31

## Current batch status

| PBI | Status | Evidence |
|---|---|---|
| B-001 | Complete | User added and reviewed the brand evidence inventory; supplied logo, advertising, and policy evidence are now appended. |
| B-002 | Complete | User added and reviewed the positioning document. |
| B-003 | Complete for planning | User added and reviewed the identity architecture; any unresolved legal entity facts remain launch gates rather than drafting blockers. |
| B-004 | Guidance supplied | Batch 2 defines the approved Precision Workshop visual direction. |
| B-005 | Guidance supplied; pulled forward | Accessible palette and contrast matrix supplied from authoritative color evidence. |
| B-006 | Guidance and CSS foundation supplied | Typography roles, scale, wrapping, technical hierarchy, and DM Sans decision defined. |
| B-007 | Guidance and CSS foundation supplied | Spacing, width, borders, radii, elevation, panels, and responsive density defined. |
| B-008 | Guidance and CSS foundation supplied | Commerce, support, secondary, tertiary, destructive, icon, disabled, and loading action rules defined. |
| B-009 | Guidance and CSS foundation supplied | Forms, validation, success, error, empty, unavailable, loading, and ownership patterns defined. |
| B-010 | Complete | Badge and trust-marker rules approved and documented. |
| B-011 | Complete | Icon system, 85-icon repository audit, dynamic-reference review, and replacement plan completed. Final Rhino icon assets remain a preview implementation dependency. |
| B-012 | Complete | Machine-family visual identifiers and data ownership defined. |
| B-013 | Guidance and CSS foundation supplied | Diagram types, visual grammar, source governance, storage, and accessibility defined. |
| B-014 | Guidance and CSS foundation supplied | No launch texture; restrained CSS strata motif and post-launch exception rules defined. |
| B-015 | Guidance supplied | Logo and motif rules supplied. |
| B-016 | Implementation and automation supplied | Vector source requirements, deterministic exports, browser markup, asset validation, and preview admin process defined. |
| B-017 | Implementation and automation supplied | Default social image generation, source hierarchy, rendered metadata contract, and preview validator supplied. |
| B-018 | In progress | Photography rules exist; 95 missing image-alt-text handles require media remediation. |
| B-019 | Guidance and CSS foundation supplied | Thumbnail, click-to-load, captions, transcripts, privacy, and performance rules defined. |
| B-020 | Guidance and CSS foundation supplied | Functional motion, loading, duration, easing, reduced-motion, and state rules defined. |
| B-021 | Complete | Brand voice and channel copy rules approved. |
| B-022 | Complete | Terminology guide, source audit, normalization proposal, Product Owner decisions, and technical resolution register completed. |
| B-023 | Complete | Reassurance microcopy rules and approval ownership defined. |
| B-024 | Process and automation supplied | Structured migration register, drafted migration rules, repository audit prompt, and validator supplied. |
| B-025 | Complete after validation | The expanded token inventory is now checked against every global token implemented in Rhino CSS. |
| B-026 | Complete after candidate generation | The preview theme-settings profile, ownership, candidate snapshot, rollback snapshot, and drift checker are established without changing production. |
| B-027 | Complete after validation | The CSS implementation layer, file-splitting rule, token contract, and automated enforcement are established. |
| B-028 | Complete after validation | Reusable patterns, source ownership, empty behavior, schema requirements, and future-section enforcement are established. |
| B-029 | Complete after B-020 adoption | Epic B accessibility planning gate now includes motion and reduced-motion requirements. |
| B-030 | Guidance supplied | Incremental brand code, image, video, diagram, texture, and third-party budgets defined. |
| B-031 | Complete after validation | Epic B brand QA plan, evidence mappings, automated suite plan, manual checks, and signoff requirements supplied. |
| B-032 | Complete | User added and reviewed the governance workflow. |
| B-033 | Process and automation supplied | Claims register, legal attribution rules, blocked-claim scanner, and CI gate supplied. |
| B-034 | Complete after validation | Consolidated launch-ready brand style guide and machine-readable requirements register supplied. |
| B-035 | Complete after validation | First preview-only brand implementation slice plan supplied with included surfaces, exclusions, go/no-go gates, rollback, and rollout tasks. |


## Sequencing change

B-005 moved from Batch 3 to Batch 2 because:

1. The supplied logo fixes the authoritative brand red, black, and white.
2. The supplied EM-1 advertisement supports burgundy and gold as subordinate historical accents.
3. B-029 requires known foreground/background pairs.
4. Deferring color would make B-004 incomplete and force Batch 2 to rely on vague visual language.

## Revised batches

### Batch 1 — Complete

- B-001
- B-032
- B-002
- B-003

### Batch 2 — Current guidance supplied

- B-004
- B-005
- B-015
- B-018
- B-022
- B-029, remains open

### Batch 3 — Core interface system

- B-006 — Typography, type scale, and technical hierarchy
- B-007 — Layout rhythm, spacing, borders, radii, and elevation
- B-008 — Button, link, and CTA hierarchy
- B-009 — Form, validation, empty, loading, and error-state patterns

The high-level typography and spacing direction is already decided in B-004. Batch 3 will formalize component roles, tokens, state behavior, and implementation implications.

### Batch 4 — Product markers, iconography, voice, and reassurance

- B-010
- B-011
- B-012
- B-021
- B-023

### Batch 5 — Motion, performance, diagrams, textures, and video

- B-020
- B-030
- B-013
- B-014
- B-019

### Batch 6 — Launch assets, migration, and legal claims

- B-016
- B-017
- B-024
- B-033

### Batch 7 — Tokens and implementation architecture

- B-025
- B-027
- B-028
- B-026

### Batch 8 — QA consolidation, style guide, and preview slice

- B-031
- B-034
- B-035

## Batch 2 closure conditions

| PBI | Closure condition |
|---|---|
| B-004 | Visual-direction document added and approved. |
| B-005 | Color document added and palette accepted; implementation remains later. |
| B-015 | Logo guide added; PSD confirmed as the export source. |
| B-018 | Photography guide added and launch-critical media gap register populated. |
| B-022 | Terminology guide added and development-environment source audit completed. |
| B-029 | Do not close in Batch 2. Mark In progress until B-020 and preview evidence exist. |

## Next recommended action

1. Add the Batch 2 documents.
2. Run the B-022 development-environment agent prompt.
3. Populate the B-018 media gap register from Shopify admin.
4. Review the visual direction and palette.
5. Then proceed to Batch 3.
