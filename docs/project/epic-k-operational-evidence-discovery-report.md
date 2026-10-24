# Epic K Operational Evidence Discovery Report

Date: 2026-10-24
Scope: Repository-only discovery for K1B-04A

## Assessment rules

Repository presence does not establish operational authority. A source can guide an evidence request only when its exact scope, owner, provenance, collection time, and validity remain visible. The expired October 22 Epic E/F owner authority was not renewed. Approved Epic K policy decisions remain authoritative and were not reopened, but a policy decision does not supply a weight, price, service, eligibility record, procedure, or execution approval.

## Discovered sources

| Source | Classification | Relevant requirements | Finding and limitation |
|---|---|---|---|
| `data/epic-e-product-classification.json` | Relevant but requiring confirmation or renewal | K-EVID-001 | Provides governed Product relationships. It does not approve Product or Variant pickup eligibility, and prior E/F owner authority expired October 22. |
| `data/epic-f-current-shopify-eligibility.json` | Informational only | K-EVID-001 | Storefront eligibility context is distinct from Grafton pickup authorization. |
| `data/epic-e-measurement-evidence.json` | Relevant but requiring confirmation or renewal | K-EVID-003 | Records 81 positive native weights, 44 missing or zero weights, zero approved custom measurements, and zero package records. Shopify weights are not accepted packed measurements. |
| `docs/project/completed-worksheet-decisions-transcribed.md` | Relevant but requiring confirmation or renewal | K-EVID-003 | Includes one LapMaster 18 packed-weight observation. It lacks complete Product coverage, package count, dimensions, measurement inclusions, and current authority. |
| `data/epic-e-source-governance.json` | Potentially authoritative and current governance | K-EVID-001–007 | Defines acceptable authority models, including Technical/Operations packing records and Operations shipping policy. It supplies governance, not the required operational facts. |
| `data/epic-k-shopify-config-snapshot-2026-10-24.json` | Informational only | K-EVID-001, 002, 004, 005 | Sanitized current configuration evidence. It records unknown pickup eligibility, three pickup-disabled locations, configured services and regions, and incomplete logistics. It cannot confer operations approval or checkout proof. |
| `data/epic-k-shopify-audit-provenance-2026-10-24.json` | Informational only | K-EVID-001, 002, 004, 005 | Establishes the bounded read-only audit provenance and zero mutations. Admin evidence is not warehouse, finance, or shipping approval. |
| `data/epic-k-fulfillment-policy.json` | Potentially authoritative and current policy | K-EVID-005, 006, 008 | Governs quotation, Alaska/Hawaii, insurance-selection, and approval behavior. It does not contain actual rates, services, premiums, named approvals, or real quotation evidence. |
| `scripts/lib/epic-k-policy.js` | Informational only | K-EVID-008 | Deterministically assesses repository policy scenarios. It cannot authorize an invoice, shipment, payment, draft order, or Shopify checkout. |
| `data/epic-e-warranty-support-evidence.json` | Relevant but requiring confirmation or renewal | K-EVID-007 | Indexes warranty and support candidates, while its policy approval fields remain false. It does not establish current carrier filing responsibility or Rhino delivery claims handling. |
| `docs/policy/Rhino Lapidary Policies - Warranty, Shipping, Returns.pdf` | Informational only | K-EVID-007 | Historical policy source. Current operational and legal approval is required before claims instructions can rely on it. |
| `data/legal-claims-register.json` | Potentially authoritative and current governance | K-EVID-007 | Defines review gates and blocks unsupported shipping, freight, warranty, returns, and contact claims. It does not supply a current claims procedure. |
| Approved Grafton readiness and pickup procedure | Missing or inaccessible | K-EVID-002 | No controlled current procedure was found in the repository. |
| Approved paid service and Product eligibility matrix | Missing or inaccessible | K-EVID-004 | No current operations-approved matrix was found. |
| Separate Alaska/Hawaii rate approvals | Missing or inaccessible | K-EVID-005 | No current state-specific finance and shipping approval was found. |
| Carrier insurance schedule | Missing or inaccessible | K-EVID-006 | No current coverage, cost, and applicable-service artifact was found. |
| Current carrier/Rhino claims procedure | Missing or inaccessible | K-EVID-007 | No complete current responsibility matrix and internal process was found. |
| Real approved quotation receipt | Missing or inaccessible | K-EVID-008 | No customer quotation was sought or created, and none is committed. |

## Requirement gaps and owner inputs

| ID | Current state | Owner input still required |
|---|---|---|
| K-EVID-001 | BLOCKED | Epic E/F owners and Grafton operations: exact Product/Variant eligibility, approval identity, effective interval. |
| K-EVID-002 | BLOCKED | Grafton and inventory operations: location readiness, inventory ownership, complete pickup procedure, validity. |
| K-EVID-003 | BLOCKED | Product data/facts and shipping operations: packed weights, package counts, dimensions, units, inclusions, applicable Products/Variants. |
| K-EVID-004 | BLOCKED | Shipping operations: paid services, supported regions, Product eligibility, limitations, effective interval. |
| K-EVID-005 | BLOCKED | Shipping operations and finance: separate Alaska/Hawaii rates, confirmed services, approvals, validity. |
| K-EVID-006 | BLOCKED | Shipping operations and finance: insurance option, actual cost, applicable services, selection requirements, validity. |
| K-EVID-007 | BLOCKED | Shipping operations, customer service, and Epic L owner: Rhino contact route, carrier filing responsibility, internal process. |
| K-EVID-008 | BLOCKED | Warehouse or shipping operations: named approver and a complete scoped quotation with delivery inputs, insurance, charges, and expiration. |

No discovered source was converted into an authoritative receipt. All eight operational evidence requirements remain blocked.
