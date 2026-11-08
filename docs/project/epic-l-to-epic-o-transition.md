# Epic L to Epic O transition

**Prepared:** 2026-11-07
**Epic L foundation:** `feat/epic-l-l1a-foundation` at `414288a16fe7123b06c3433f0063ba402fc35e83`
**Epic O planning branch:** `epic-o/o0-discovery-and-planning`
**Disposition:** Epic O planning may proceed. Epic L remains approval-constrained and is not closed.

## What Epic L established

Epic L created a repository authority/evidence foundation, unresolved warranty/service/privacy decision packets, a read-only Admin audit plan, negative fixtures, and an explicit account interface handoff. It did not approve policy, collect data, query Shopify Admin, install apps, publish customer content, or implement account features.

Important current facts:

- warranty evidence has zero approved policy versions and zero approved Product mappings;
- the resource catalog has candidates but zero canonical publication-approved resources;
- serial, purchase evidence, uploads, diagnostics, service records, notifications, and audit data are marked not collected and collection is not allowed;
- actual customer-account mode remains unknown;
- `sections/main-account.liquid` is legacy repository evidence only;
- L-PBI-023 is Deferred and hands account architecture/implementation to Epic O;
- K production/evidence reconciliation and `K-EVID-007` remain open.

## Remaining L decisions that block O capabilities

| L decision/dependency | Unresolved subject | Epic O effect |
|---|---|---|
| L-DEC-001/002 | Warranty authority, policy, Product coverage, durations, exclusions, remedies, transfer, effective period | Blocks O-PBI-010 warranty status |
| L-DEC-003 | Whether registration is required/optional and affects warranty | Blocks O-PBI-007 and any registration-to-warranty language |
| L-DEC-004 | Proof of purchase, gifts/used/legacy exceptions, order lookup authority | Blocks ownership/warranty inference and private order linkage |
| L-DEC-005–008 | Service eligibility, repair lifecycle/shipping, channels, routing | Blocks service status/history promises and account support actions |
| L-DEC-009 | Serial formats, validation, legacy/duplicate handling | Blocks serial collection and registration activation |
| L-DEC-010 | Purpose, processor, access, retention, deletion/export, recovery | Blocks ownership/service private-data storage and display |
| L-DEC-011/012 | Resource versions, mappings, rights, accessibility, safety approval | Blocks account-specific manual/support-resource activation beyond approved public routes |
| L-DEC-013 | Supported/legacy/discontinued machine status and promise | Blocks lifecycle claims attached to saved machines |
| L-DEC-014 | Forms/Flow/custom intake architecture | Blocks registration or support-intake implementation |
| L-DEC-015 | Account mode and owned-machine/service extension value | Becomes O-DEC-001/008/015; implementation remains undecided |
| L-DEC-017 | Post-purchase messages and consent | Blocks O-PBI-019; Epic X owns lifecycle messaging |
| L-DEP-001 | Fresh Admin/plan/account/app audit | Becomes O-DEP-001; not authorized in this batch |
| L-DEP-003 | Epic F support-resource locale binding drift | Limits resource validation; do not weaken the historic hash |
| L-DEP-004 | Epic G revocation/production state | Limits saved compatible-parts claims |
| K-EVID-007 | Contact/carrier claim responsibility | Cannot become an account repair/shipping promise |

## Interface meanings O must preserve

| Concept | Required interpretation |
|---|---|
| Purchaser | Account/customer associated with an order; not automatically current owner |
| Saved machine | Bookmark/interest state; not verified ownership |
| Registration | Submitted/private claim; not warranty eligibility by itself |
| Verified owner | Separately authorized state with provenance, correction, transfer, revocation, and audit |
| Warranty status | Output only from an approved versioned policy/mapping/eligibility authority |
| Account history | Commerce orders/statuses; not private service history |
| Service history | Private operational record requiring a system of record and field-level disclosure authority |
| Product compatibility | Exact approved Product reference from Epic G; not a recommendation or ownership inference |
| Manual/resource | Public only when canonical, current, rights-cleared, accessible, Product-mapped, and publication-approved |

Do not store private machine or service records on public Product metafields. Product definitions remain Product facts/relations; customer-linked state requires a separately approved Customer/Order/Company definition or private service with authorization and data lifecycle controls.

## What Epic O may safely proceed with independently

Epic O can plan and, after a future separate implementation authorization, validate:

- actual account mode/plan/configuration through a separately authorized sanitized read-only audit;
- account entry, redirect, branding, and navigation behavior;
- native orders, order status, profile, and saved addresses;
- native Buy again and Epic J cart reconciliation using synthetic/dev data;
- accessibility, keyboard, focus, screen-reader, zoom, responsive/mobile, performance, and failure behavior;
- app/cost/no-build comparisons without installing or configuring anything;
- interface-only definitions for future owned-machine/resource capability.

These activities must not authenticate as a real customer, read real customer records, or infer current Admin state from Liquid.

## What Epic O must keep blocked or deferred

- machine registration or serial storage;
- warranty status, duration, eligibility, or denial;
- private service history, attachments, diagnoses, repair status, or staff notes;
- automated ownership from orders, registrations, email matches, serials, or saved machines;
- unapproved manuals/support resources;
- repair shipment, carrier, insurance, response-time, or support-channel promises;
- dealer/service/wholesale eligibility without an approved business program;
- reminders/onboarding without Epic X and consent decisions;
- apps/backends without Epic Q governance and explicit installation/deployment authorization.

## Skipped-Epic boundary

H, I, M, and N remain deferred until after the Epic O launch. Saved comparisons are an Epic I interface only; manual links do not activate Epic M; account navigation does not activate Epic H; no account feature activates Epic N social proof.

## Recommended transition sequence

1. Product Owner reviews the Epic O discovery, tracker, registry, and decision register.
2. Product Owner confirms native returning-customer MVP scope and accountable decision owners.
3. If desired, issue a separate prompt authorizing only O-PBI-001's bounded read-only Admin audit.
4. After accepting that evidence, issue a separate implementation prompt for O-PBI-004/005 only.
5. Revisit O-PBI-006–011 only as Epic L decisions become approved.

This transition authorizes no implementation or external operation.
