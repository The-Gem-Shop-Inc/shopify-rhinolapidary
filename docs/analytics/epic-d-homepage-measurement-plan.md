# Epic D Post-launch Homepage Measurement Plan

**PBI:** D-PBI-029

**Status:** Complete; no tracking code authorized

**Machine-readable contract:** [epic-d-homepage-measurement-plan.json](../../data/epic-d-homepage-measurement-plan.json)

**Validator:** `npm run validate:homepage-measurement-plan`

This plan defines how to evaluate the implemented homepage after an approved launch. It adds no pixel, custom event, analytics app, or consent change. All unknown targets use the governed statement: **Baseline first, threshold pending Product/Analytics review.**

## Native / Available Now

Shopify's native analytics can establish homepage landing-session and online-store conversion baselines without new theme tracking. Relevant native reporting includes sessions by landing page, sessions by device type, and the online-store conversion funnel (cart addition, checkout reached, and checkout completed). Destination page, collection, and product reporting can support directional continuation analysis where the store's plan and report configuration expose it.

Native reporting does not reliably distinguish which particular homepage module produced every destination visit. That placement-specific attribution remains a future custom-event candidate, not a current requirement.

| Outcome | Question | Metric and source | Owner | Privacy / consent | Baseline and target | Cadence | Decision informed |
|---|---|---|---|---|---|---|---|
| Homepage conversion/session outcomes | How do homepage landing sessions progress through purchase outcomes? | Native homepage landing sessions, conversion rate, cart additions, checkout reached, and checkout completed. | Analytics Owner; Product and Merchandising Owners | Existing aggregate Shopify reporting; no new code or consent behavior. | First 28 post-launch days. Baseline first, threshold pending Product/Analytics review. | Monthly for three months, then quarterly. | Whether shopping continuation changed enough to warrant deeper investigation. |
| Mobile vs desktop outcomes | Are device segments materially different? | Native sessions by device type and device-segmented conversion outcomes where report configuration supports them. | Analytics Owner; Product Owner; QA/Release Approver | Aggregate device reporting; no new code. | First 28 post-launch days. Baseline first, threshold pending Product/Analytics review. | Monthly for three months, then quarterly. | Whether mobile hierarchy or route prominence needs follow-up. |

## Native Directional Metrics With Future Custom-event Candidates

These outcomes should first use native destination and conversion evidence. Exact module-click counts require later approved custom instrumentation.

| Outcome | Question | Native metric / source | Owner | Privacy / consent | Baseline and target | Cadence | Decision informed |
|---|---|---|---|---|---|---|---|
| Homepage → Machines primary CTA | Do homepage visitors continue from the primary action into useful machine shopping? | Homepage landing sessions, Machines destination sessions, product continuation, and native conversion outcomes. | Analytics Owner; Product and Merchandising Owners | Custom placement attribution requires privacy/consent review. | First 28 post-launch days. Baseline first, threshold pending Product/Analytics review. | Monthly for three months, then quarterly. | CTA wording, hierarchy, or destination quality. |
| Customer-path chooser | Which approved chooser destinations produce useful continuation? | Destination sessions for Machines, Catalog, and Contact, plus downstream continuation where supported. | Analytics Owner; Product, Merchandising, and Support Owners | Link-specific attribution requires privacy/consent review. | Same 28-day baseline rule. | Monthly for three months, then quarterly. | Labels, ordering, and destinations. |
| Machine-family routes | Do EM-1, BeadMaster, ShapeMaster, and TrimMaster entries lead to useful product outcomes? | Native product sessions and downstream product outcomes. | Analytics Owner; Product and Merchandising Owners | Card-specific attribution requires privacy/consent review. | Same 28-day baseline rule. | Monthly for three months, then quarterly. | Family coverage, ordering, naming, and route readiness. |
| EM-1 flagship | Does the flagship entry support the EM-1 journey? | EM-1 product sessions and native product/cart/conversion outcomes. | Analytics Owner; Product and Merchandising Owners | Do not duplicate product-view, cart, checkout, or purchase tracking. | Same 28-day baseline rule. | Monthly for three months, then quarterly. | Retain, reposition, or consolidate the module. |
| Contact/support routes | Do support and replacement-parts fallback links help visitors reach Contact? | Contact page sessions and existing form outcomes where available. | Analytics and Privacy Owners; Support and Product Owners | No extra lead data; custom attribution requires privacy review. | Same 28-day baseline rule. | Monthly support review for three months, then quarterly. | Keep or consolidate neutral Contact fallbacks. |
| Shipping Policy | Is the policy link useful purchase-reassurance information? | Shipping Policy page sessions and subsequent continuation where supported. | Analytics Owner; Operations, Product, and Claims Owners | Placement attribution requires privacy/consent review. | Same 28-day baseline rule. | Monthly for three months, then quarterly. | Keep or move the link within reassurance hierarchy. |
| Manuals | Do visitors use the Manuals entry and continue to useful manuals? | Manuals page sessions and downstream manual-page continuation. | Analytics Owner; Content, Support, and Product Owners | Link-specific attribution requires privacy/consent review. | Same 28-day baseline rule. | Monthly for three months, then quarterly. | Keep the entry and prioritize or defer broader education work. |
| EM-1 video | Do visitors deliberately activate the approved promotional video? | YouTube aggregate reporting where available; exact homepage attribution requires a future event. | Analytics and Privacy Owners; Product, Content, and Media Owners | No storefront event exists; future activation tracking requires privacy/consent and duplicate-pixel review. | Same 28-day baseline rule. | Monthly for three months, then quarterly. | Keep the video on the homepage or move it to product/support content. |

## Future Custom-event Candidates

The machine-readable contract reserves proposal-only names for Machines primary CTA, customer-path, machine-family, EM-1 flagship, Contact, Shipping Policy, Manuals, and EM-1 video activation. No event is implemented or required for launch.

Every future custom event requires all of the following before code or configuration work begins:

- Analytics Owner approval.
- Privacy and consent review.
- Duplication check against existing pixels and native ecommerce tracking.
- Approved event naming contract.
- Documented QA plan.
- Data-retention and ownership decision.

Custom events must never duplicate native product-view, add-to-cart, checkout, or purchase events. The [analytics migration verification plan](analytics-migration-verification-plan.md) remains the dependency for any later instrumentation.

## Ownership and Threshold Decisions

Named roles are governance requirements, not evidence that individuals have accepted ownership. Analytics and Product must assign accountable people before the first reporting review. Numerical thresholds are deliberately unset until the first 28-day baseline exists; this plan does not fabricate pre-launch baselines or success targets.

## Release Boundary

D-PBI-029 is complete as analytics architecture. Custom tracking, pixels, consent changes, dashboards, and report configuration are outside this PBI and require separate approval. D-PBI-032 retains human go/no-go authority.
