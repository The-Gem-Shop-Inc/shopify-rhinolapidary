# Epic K Operational Evidence Requests

Prepared: 2026-10-24

These are intake requests. They are not accepted evidence receipts, do not authorize Shopify work, and do not change approved Epic K policy decisions.

Current gates: 8/8 operational requirements BLOCKED; operational readiness BLOCKED; live checkout enforcement UNVERIFIED; K-PBI-002 PARTIAL.

## K-EVID-001 — product_variant_pickup_eligibility

Request: K-INTAKE-001

Authoritative roles:

- Epic E Product Data owner
- Epic F Product presentation owner
- Grafton operations

Required facts:

- Exact Product and Variant identity
- Explicit pickup eligibility
- Approval identity and effective period

Required subject and scope:

- Subject type: product_variant_pickup_eligibility
- Product references
- Variant references
- Grafton pickup eligibility decision

Acceptable artifacts:

- Owner-approved Product and Variant eligibility register
- Signed Grafton operations eligibility matrix
- Versioned approval export with owner attestation

Required provenance:

- Named authoritative owner role
- Source artifact reference and SHA-256 digest
- Collection timestamp
- Approval identity and effective interval

Validity:

- required_interval: Pickup eligibility can change and requires an explicit effective period.

Sanitization:

- Use stable Product and Variant references
- Exclude customer data and credentials
- Keep restricted raw approvals outside Git

Repository leads and limitations:

- data/epic-e-product-classification.json — relevant_requires_confirmation_or_renewal: Contains governed Product classification relationships. Does not establish current Product or Variant pickup approval; prior E/F owner authority expired October 22, 2026.
- data/epic-f-current-shopify-eligibility.json — informational_only: Describes current storefront Product eligibility context. Storefront eligibility is not Grafton pickup authorization.
- data/epic-k-shopify-config-snapshot-2026-10-24.json — informational_only: Records sanitized Product and location configuration observations. The audit reports unknown Product pickup eligibility and cannot provide operations approval.

Human authority must supply:

- Exact Product and Variant list
- Explicit eligible or ineligible value per subject
- Approval identity
- Effective start and expiration

Do not infer:

- Product classification implies pickup eligibility
- Positive inventory implies pickup approval
- An active Shopify location implies Product eligibility

## K-EVID-002 — grafton_inventory_location_readiness

Request: K-INTAKE-002

Authoritative roles:

- Grafton operations
- Inventory operations

Required facts:

- Location readiness
- Inventory fulfillment ownership
- Pickup operating procedure

Required subject and scope:

- Subject type: grafton_location_readiness
- Grafton location
- Inventory ownership
- Pickup operating procedure

Acceptable artifacts:

- Approved warehouse readiness checklist
- Inventory ownership procedure
- Current pickup standard operating procedure

Required provenance:

- Grafton or inventory operations owner identity
- Source artifact reference and SHA-256 digest
- Collection timestamp
- Declared validity

Validity:

- required_interval: Location readiness and procedures are current operating conditions.

Sanitization:

- Remove employee personal information
- Exclude alarm, access-control, and credential details
- Store restricted procedures outside Git and commit only a sanitized summary

Repository leads and limitations:

- data/epic-k-shopify-config-snapshot-2026-10-24.json — informational_only: Shows three observed locations with pickup disabled. Configuration does not establish warehouse readiness, inventory ownership, or procedure approval.
- No repository artifact — missing_or_inaccessible: No approved Grafton pickup procedure was found in the repository. Grafton and inventory operations must supply the current controlled artifact.

Human authority must supply:

- Current readiness decision
- Responsible inventory owner
- Pickup preparation, identity, handoff, exception, and closure procedure
- Validity interval

Do not infer:

- Shopify location activation establishes readiness
- Inventory quantity establishes ownership
- Pickup-disabled configuration establishes future procedure

## K-EVID-003 — shipping_weights_package_characteristics

Request: K-INTAKE-003

Authoritative roles:

- Epic E Product Data owner
- Epic F Product facts owner
- Shipping operations

Required facts:

- Packed shipping weight
- Package count
- Package dimensions and units
- Measurement inclusions

Required subject and scope:

- Subject type: product_variant_package_measurement
- Product and Variant references
- Each shipping package or crate
- Packed state and included components

Acceptable artifacts:

- Current packing record approved by Technical Owner and Operations
- Approved engineering packing drawing
- Dated warehouse measurement worksheet with owner attestation

Required provenance:

- Technical or operations owner identity
- Measurement method and instrument context
- Source artifact reference and SHA-256 digest
- Collection timestamp

Validity:

- owner_declared_interval_or_none: An owner must state whether the physical specification is version-bound or has an effective interval.

Sanitization:

- Use stable Product and Variant references
- Exclude supplier account details
- State units explicitly
- Keep restricted drawings outside Git if necessary

Repository leads and limitations:

- data/epic-e-measurement-evidence.json — relevant_requires_confirmation_or_renewal: Records 81 positive native weights, 44 missing or zero weights, zero approved custom measurements, and zero package records. Native Shopify weights are not approved packed measurements; prior E/F authority cannot be silently renewed.
- docs/project/completed-worksheet-decisions-transcribed.md — relevant_requires_confirmation_or_renewal: Contains a transcribed LapMaster 18 packed-weight observation. One observation is incomplete coverage and remains distinct from native Shopify weight and current packing authority.
- data/epic-e-source-governance.json — potentially_authoritative_current: Defines current engineering drawing or packing record approved by Technical Owner and Operations as the authority model. The governance rule identifies acceptable authority but supplies no Product measurements.

Human authority must supply:

- Packed weight and unit per shipping unit
- Package count
- Dimensions and units for every package
- Included and excluded components
- Owner approval and applicability

Do not infer:

- Positive Shopify weight is an approved packed weight
- A machine specification is a crate dimension
- One package observation covers other Products or Variants

## K-EVID-004 — approved_shipping_services_regions

Request: K-INTAKE-004

Authoritative roles:

- Shipping operations

Required facts:

- Approved paid service
- Supported region
- Product eligibility
- Service limitations

Required subject and scope:

- Subject type: shipping_service_region_product_scope
- Paid shipping service
- Supported region
- Eligible Product scope
- Service limitations

Acceptable artifacts:

- Shipping operations service matrix
- Current carrier service agreement summary approved for use
- Approved rate and eligibility schedule

Required provenance:

- Shipping operations approval identity
- Carrier or internal source reference and SHA-256 digest
- Collection timestamp
- Effective interval

Validity:

- required_interval: Services, regions, and limitations are time-sensitive operational facts.

Sanitization:

- Remove carrier account numbers and credentials
- Use sanitized service references
- Exclude negotiated confidential terms from Git

Repository leads and limitations:

- data/epic-k-shopify-config-snapshot-2026-10-24.json — informational_only: Records configured services, zones, assignments, and unresolved calculated rates. Shopify configuration does not establish operations approval, carrier availability, or complete Product eligibility.
- data/epic-e-source-governance.json — potentially_authoritative_current: Identifies Shopify configuration plus approved Operations policy as the authority model. The governance rule supplies no approved service matrix.

Human authority must supply:

- Approved paid service names
- Supported states or regions
- Eligible Product or class scope
- Exclusions and limitations
- Effective period

Do not infer:

- Configured shipping method is operations-approved
- A zone proves checkout availability
- An unknown carrier-calculated rate is a verified paid service

## K-EVID-005 — alaska_hawaii_rates

Request: K-INTAKE-005

Authoritative roles:

- Shipping operations
- Finance

Required facts:

- Approved Alaska rate
- Approved Hawaii rate
- Confirmed service availability
- Approval identity

Required subject and scope:

- Subject type: alaska_hawaii_rate_approval
- Alaska
- Hawaii
- Applicable service
- Product eligibility

Acceptable artifacts:

- Finance-approved Alaska and Hawaii rate schedule
- Carrier quote or tariff with shipping-operations approval
- Approved state-specific service matrix

Required provenance:

- Shipping operations and finance approval identities
- Carrier or calculation source reference and SHA-256 digest
- Collection timestamp
- Effective interval

Validity:

- required_interval: Rates and carrier availability require explicit current validity.

Sanitization:

- Remove carrier account identifiers
- Retain currency and unit basis
- Keep confidential raw tariffs outside Git

Repository leads and limitations:

- data/epic-k-shopify-config-snapshot-2026-10-24.json — informational_only: Shows Alaska and Hawaii within configured US scope and observed rate definitions. No separate approved Alaska or Hawaii rate and service evidence is attached.
- data/epic-k-fulfillment-policy.json — potentially_authoritative_current: Authorizes quotation intake while requiring separate rates before invoicing. Policy authority does not supply either state rate, service availability, or finance approval.

Human authority must supply:

- Alaska rate and basis
- Hawaii rate and basis
- Confirmed service for each state
- Product limitations
- Shipping operations and finance approval identities
- Validity interval

Do not infer:

- Quotation intake permits invoicing
- A generic US rate is separately approved for Alaska or Hawaii
- Zone membership proves carrier service

## K-EVID-006 — carrier_insurance_options

Request: K-INTAKE-006

Authoritative roles:

- Shipping operations
- Finance

Required facts:

- Available coverage option
- Cost
- Applicable service
- Selection acceptance

Required subject and scope:

- Subject type: carrier_insurance_service_option
- Carrier or delivery service
- Coverage option
- Cost basis
- Customer selection requirement

Acceptable artifacts:

- Current carrier insurance schedule
- Finance-approved insurance option matrix
- Service-specific coverage terms with operations approval

Required provenance:

- Shipping operations and finance approval identities
- Carrier source reference and SHA-256 digest
- Collection timestamp
- Effective interval

Validity:

- required_interval: Coverage availability, cost, and applicable services can change.

Sanitization:

- Remove carrier account and policy numbers
- Keep restricted insurance documents outside Git
- Commit only sanitized coverage and cost evidence

Repository leads and limitations:

- data/epic-k-fulfillment-policy.json — potentially_authoritative_current: Defines that documented insurance availability and cost may be selected during quotation. The policy contains no carrier option, premium, limit, or service availability.
- No repository artifact — missing_or_inaccessible: No current carrier insurance schedule was found in the repository. Shipping operations and finance must provide a sanitized authoritative artifact.

Human authority must supply:

- Available coverage option
- Actual cost and currency
- Applicable carrier service
- Selection and acceptance procedure
- Validity interval

Do not infer:

- Missing cost means complimentary coverage
- Insurance recommendation guarantees compensation
- One carrier option applies to another service

## K-EVID-007 — claims_contacts_responsibilities

Request: K-INTAKE-007

Authoritative roles:

- Shipping operations
- Customer service
- Epic L owner

Required facts:

- Designated Rhino contact process
- Carrier-specific filing responsibility
- Internal Rhino delivery process

Required subject and scope:

- Subject type: claims_contact_and_responsibility_process
- Rhino notification route
- Carrier and service
- Filing responsibility
- Rhino delivery process

Acceptable artifacts:

- Approved customer-service claims procedure
- Carrier-specific filing responsibility matrix
- Approved Rhino delivery damage process

Required provenance:

- Shipping operations, customer service, or Epic L owner identity
- Procedure reference and SHA-256 digest
- Collection timestamp
- Declared validity

Validity:

- owner_declared_interval_or_none: The procedure owner must state the effective version or interval.

Sanitization:

- Use role-based contact routes where possible
- Exclude employee personal contact details
- Remove carrier account identifiers
- Keep restricted procedures outside Git

Repository leads and limitations:

- data/epic-e-warranty-support-evidence.json — relevant_requires_confirmation_or_renewal: Indexes warranty and support contact candidates. Policy approval is false and the evidence does not establish current carrier filing or internal delivery claims procedures.
- docs/policy/Rhino Lapidary Policies - Warranty, Shipping, Returns.pdf — informational_only: Historical policy source relevant to shipping, returns, and warranty language. The legal claims register blocks reuse without current operational and legal authority.
- data/legal-claims-register.json — potentially_authoritative_current: Defines review gates for shipping, freight, warranty, returns, and contact claims. It governs claim use but supplies no current carrier-specific responsibility or Rhino delivery procedure.

Human authority must supply:

- Designated Rhino notification route
- Carrier-specific customer or merchant filing responsibility
- Internal Rhino delivery reporting and escalation process
- Procedure version or validity

Do not infer:

- Customer always files the carrier claim
- Lack of purchased insurance eliminates all remedies
- Historical policy text is a current approved process

## K-EVID-008 — quotation_approval_scope_expiration

Request: K-INTAKE-008

Authoritative roles:

- Warehouse or shipping operations

Required facts:

- Named approver
- Complete cart scope
- Destination and delivery requirements
- Insurance selection
- Expiration timestamp

Required subject and scope:

- Subject type: complete_order_quotation_authorization
- Complete cart
- Destination
- Residential or commercial designation
- Liftgate response
- Access information
- Insurance selection
- Quotation validity

Acceptable artifacts:

- Operations-approved quotation record
- Signed quotation approval receipt
- Controlled warehouse or shipping quotation authorization export

Required provenance:

- Named warehouse or shipping operations approver
- Quotation artifact reference and SHA-256 digest
- Approval timestamp
- Explicit validity interval

Validity:

- required_interval: Each quotation requires its own validity period and renewed approval after expiration or material change.

Sanitization:

- Use synthetic data in repository tests
- Do not commit customer addresses
- Store real quotation artifacts outside Git with access control
- Commit only sanitized relationship references

Repository leads and limitations:

- data/epic-k-fulfillment-policy.json — potentially_authoritative_current: Defines the approved quotation lifecycle and whole-cart policy. The policy contract is not a real quotation, named approval, shipping charge, service confirmation, or payment authorization.
- scripts/lib/epic-k-policy.js — informational_only: Implements deterministic offline quotation assessment. Repository assessment cannot authorize a real invoice, shipment, payment, or Shopify checkout.

Human authority must supply:

- Named approver
- Complete cart identity and quantities
- Destination and required delivery inputs
- Selected insurance and documented cost
- Approved service and charge
- Validity start and expiration

Do not infer:

- Offline assessment authorizes invoicing
- A draft order proves shipping approval
- An unchanged state or postal region preserves quotation authorization after a material address change

## Submission validation

Prepare a candidate that conforms to `schemas/epic-k-evidence-receipts.schema.json`, then run:

```powershell
npm run validate:epic-k-evidence-intake -- --submission <sanitized-candidate.json> --as-of <ISO-8601 timestamp>
```

A valid intake candidate remains subject to authoritative review and attachment. It does not update the accepted receipt register automatically.
