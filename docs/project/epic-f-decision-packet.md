# Epic F — narrow decision and dependency packet

**Prepared:** 2026-09-10  
**State:** Proposed handoff; no decision granted, no implementation or mutation authorized.

The agent has collected the Product, media, route, inventory/profile, pickup, description, financing-widget and preview evidence. Reviewers are not being asked to collect these records manually. The [discovery](../architecture/epic-f-machine-product-page-discovery.md) and [machine inventory](epic-f-machine-inventory.json) provide exact scope.

## F-DEC-001 — Existing native installment messaging

- **Question:** Should the shared machine template retain Shopify's currently rendered native Shop Pay installment messaging, or suppress it pending the business's financing review? If retained, confirm that Shopify-owned eligibility/terms—not Rhino-authored promises—are the intended source.
- **Owner:** Business/Product Owner, Shopify Admin Owner; Legal reviews any additional explanatory claims.
- **Evidence already collected:** All eight published machine screenshots show native installment amounts. `sections/main-product.liquid` uses `form | payment_terms`; the browser loads `shop.app`. `data/navigation-spec.json#homepage-financing` still blocks a custom financing destination because provider/terms/visibility approval is absent.
- **Scope:** Native widget visibility on published machine pages only. No payment-provider configuration, financing landing page, rate copy or custom CTA.
- **Interim:** Preserve existing evidence; do not add a financing CTA or copy observed installments into static text. Shell development and native Add to cart/Sold out controls proceed independently. No payment configuration is changed.
- **Approval evidence:** Dated visibility decision, affected Product/template scope and accountable business/Admin owner; reference the actual provider-controlled terms. No universal customer eligibility promise.
- **Unblocks:** F-PBI-013 and the payment-terms portion of F-PBI-002/003. Does not authorize any Epic E mutation or alternative purchase model.

## F-DEC-002 — Current Product-photo rights and launch shot scope

- **Question:** Which of the nine unique current machine photographs may be used on the new machine page, which exact model does each depict, and which replacement/detail shots will Media supply under the existing B-018 brief?
- **Owner:** Media and Brand; Product Data verifies exact model identity; Legal/Claims reviews embedded patent/certification wording without treating a photographed mark as certification evidence.
- **Evidence already collected:** Exact image GIDs, URLs, dimensions and blank alt fields for ten attachments; all eight published Product galleries inspected in the preview; active but unpublished JadeMaster source saved for internal inspection. SawMaster 24/36 share a GID. TumbleMaster has none. EM-1's photograph contains patent wording. Front/oblique images lack rear/connection/scale/packing coverage; staged tools/materials do not establish inclusion.
- **Scope:** Product photography and accessibility, under existing Media/Brand governance. Canonical manuals/diagrams/videos and publication rights remain in E B3B-D06 and are not re-decided here.
- **Interim:** No new uploads, image replacements, alt mutations, invented process imagery or decorative filler. Describe observable image content without asserting technical facts; retain draft Products' visibility limits. Omit a newly proposed gallery module/asset if its approved use cannot be established.
- **Approval evidence:** Exact asset/model/use permission and reviewer, accepted factual alt wording, approved shot list and delivery owner. Inclusion photographs depend on existing BOM approval rather than settling it.
- **Unblocks:** Asset activation in F-PBI-004. Gallery shell and internal fixture tests remain independent.

## Existing non-E decisions handed to their owners

| Existing owner/work | Exact outstanding question | Evidence supplied | F impact and interim |
|---|---|---|---|
| Epic P / Product Owner, Support and form/privacy owner | Will the existing Contact process accept and maintain a Product/selected-Variant context field, and who owns routing, retention and follow-up? | Live native form has Name/Email/Phone/Comment only; no Product-aware handler. D-PBI-025 already records missing specialized-process ownership. | F-PBI-012 can specify the adapter and use neutral Contact. No quote/reserve promise, competing form or new submission until P owns the change. |
| Epic U / Analytics and Product Owner | Who is accountable for native Product events and optional F interactions, and what consent/destination ownership applies? | Existing analytics migration plan lists unassigned owners; only proposed generic section event exists. | F-PBI-016 prepares payload/verification requirements; custom tracking remains disabled until existing U governance is satisfied. |

These are continuations of P/U ownership work, not new F tooling approvals. Named roles do not imply a person has accepted responsibility.

## Inherited Epic E decisions: reference, do not re-ask

| Existing decision | Blocked F modules | Approved interim |
|---|---|---|
| PO-E-012 / PO-E-013: ambiguous clamp/vice identities | Contextual fit and any SKU-linked accessories | Exclude those edges/items from fit assertions; retain exact historical identities |
| SKU-ALLOCATIONS / PO-E-041 | SKU display and later ownership/reorder identity | Blank SKU stays omitted; use native IDs internally |
| B3B-D02 | Contextual compatibility | No approved fit edges, including four explicitly blocked SawMaster edges |
| B3B-D03 | Key/full specs, electrical, motor/speed, mount, water/fluid | Omit unresolved values and unsupported conversions |
| B3B-D04 / C-040 | Included/noncatalog/optional contents and quantities | No BOM inferred from description, manual or photo |
| B3B-D05 | Dimensions/net/crate/shipping weight | Keep physical states separate; omit unapproved customer measurements |
| B3C-D01 / B3C-D02 | Fulfillment/pickup/region | Current profile observations do not approve handling assignments or destination promises |
| B3C-D03 | Warranty/service/repair responsibility | Neutral Contact; Vendor is not responsibility evidence |
| B3B-D06 | Canonical Product resources and rights | No evidence-only/internal/superseded File exposure |
| B3C-D04 | Lead time/availability promises | Native storefront orderability only; no timing estimate |
| FAMILY-MAPPINGS | Optional family content/navigation | No inferred membership; keep native identity |
| CATEGORY-CANDIDATES | Category population and downstream discovery | Three approved inputs remain separate from 119 proposals |
| B3B-D07 | G abrasive semantics | No F filter/attribute invention |

The authoritative questions, owners, affected IDs and approval requirements remain in the [15-group Epic E handoff](epic-e-deferred-decision-handoff.md). Reviewer absence does not waive them. Current F reads supply additional observations only.

## Findings that do not need a new business decision

- One shared machine template and shared conditional modules are the evidence-supported engineering recommendation; do not ask owners to pick a template per Product.
- Normal Trade purchase behavior is already the documented choice. Keep it unless an owner deliberately requests an exception. Neither high price nor current sold-out state justifies proposing quote/preorder as the default.
- The agent can enumerate broken manual routes, unsupported claims, empty fields, source/type mismatches, fixture defects and missing approved references. Do not ask reviewers to rediscover them.
- J/K/Admin must investigate the observed location/profile mismatch and broad general-rate configuration using current read tools. This is technical/operational follow-up to E, not permission for F to configure rates or infer delivery eligibility.
- Claims already blocked by governance need suppression/cleanup, not another vote on whether the blocked wording is acceptable. Any genuinely new replacement assertion needs its existing owner/source review.
- No new financing CTA, comparison tool, reviews, customer-project gallery, education hub, specialized quote process or broader G discovery UI is proposed for the F MVP.

## Approval boundary

Reviewing this packet does not execute a mutation or approve the PBIs wholesale. Future template assignment and Product/SEO/media edits must identify exact IDs, current before states, input hashes, affected fields, dry run, rollback, after verification and separate Product Owner/Admin GO under the existing process. Shell readiness and approved-value readiness must remain separately reportable.
