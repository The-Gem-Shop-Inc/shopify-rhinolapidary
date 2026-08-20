# Epic C Post-Launch Navigation Measurement Plan

**Epic:** C - Global Header, Navigation, and Footer  
**PBI:** C-PBI-028  
**Status:** Measurement design complete; no tracking implementation authorized  
**Machine-readable register:** [data/epic-c-navigation-measurement-plan.json](../../data/epic-c-navigation-measurement-plan.json)

## Governance

This plan defines how Rhino Lapidary should evaluate navigation after launch.
It does not add analytics apps, pixels, custom events, customer-event code, or
consent changes.

Related governance:

- [Analytics migration and verification plan](analytics-migration-verification-plan.md)
- [Third-party script and pixel register](../privacy/third-party-script-and-pixel-register.md)
- [Storefront event contracts](../../data/storefront-event-contracts.json)

Custom navigation tracking requires Analytics Owner and privacy/legal approval
before implementation.

## Native Shopify Reporting

Use native Shopify reporting first when it answers the question adequately.

| Measure | Question | Source | Owner | Baseline |
|---|---|---|---|---|
| Header search usage | Are customers using search for machines, parts, consumables, and support? | Shopify Analytics search reports | Product Owner and Analytics Owner | First 28 days after Epic C release |
| Search zero-result rate | Which customer terms fail to return useful results? | Shopify Analytics and Search and Discovery reports where available | Merchandising Owner and Product Owner | First 28 days after Epic C release |
| Machine navigation outcomes | Do Machines route visitors continue to machine product pages? | Shopify collection and product reports | Product Owner and Merchandising Owner | First 28 days after Epic C release |
| Parts/consumables navigation outcomes | Do customers find parts and consumables once approved routes exist? | Shopify collection and product reports after route launch | Product Owner, Merchandising Owner, Shopify Admin Owner | First 28 days after approved routes launch |
| Policy visits | Are customers reaching policy pages needed for purchase confidence? | Shopify page reports | Legal Owner, Content Owner, Product Owner | First 28 days after Epic C release |
| Support/contact conversion | Do support/contact journeys produce contact actions? | Shopify page reports and existing contact form evidence | Support Owner and Product Owner | First 28 days after Epic C release |
| Mobile navigation outcomes | Do mobile visitors reach useful outcomes compared with desktop? | Shopify device-segmented reports | Product Owner and QA/Release Approver | First 28 days after Epic C release |

No numerical thresholds are defined before baseline data exists. The owner
listed in the register must set thresholds at the first review after the
baseline period.

## Existing Approved Analytics

No approved custom navigation analytics owner is documented for Epic C.

Until ownership is approved, do not move navigation interaction measures into
active custom tracking. Use native Shopify reporting and existing governance
documents.

## Proposed Custom Tracking

These measures may be useful later, but they require Analytics Owner and
privacy/legal approval before any implementation:

| Proposed event | Question | Approval dependency |
|---|---|---|
| `rhino:navigation:primary_menu_click` | Which primary menu labels drive useful navigation after final IA is approved? | Analytics Owner, Product Owner, Privacy/Legal Owner |
| `rhino:navigation:footer_support_click` | Do footer support links help customers reach approved support destinations? | Support Owner, Product Owner, Analytics Owner, Privacy/Legal Owner |
| `rhino:navigation:mobile_drawer_open` | Are mobile visitors opening the drawer, and does it lead to useful outcomes? | Product Owner, Analytics Owner, Privacy/Legal Owner |

Do not implement these events in C-PBI-028. Do not add pixels, apps, or consent
changes to support this plan.

## Review Cadence

Review native reporting monthly for the first three months after launch, then
quarterly unless performance degrades or navigation IA changes.

When performance degrades:

1. Confirm the route exists, is not `/password`, and is not a 404.
2. Review search terms, collection assignments, menu labels, and responsive QA
   evidence.
3. Resolve missing route/content/Admin blockers before adding custom tracking.
4. Request Analytics Owner and privacy/legal review if native reporting cannot
   answer the product question.

## Validation

Run:

```powershell
npm run validate:epic-c-measurement-plan
```

The validator confirms the required measure fields exist and that this PBI does
not authorize custom tracking implementation.
