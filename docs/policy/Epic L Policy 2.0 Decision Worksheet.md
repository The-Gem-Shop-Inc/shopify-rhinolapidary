# Rhino Lapidary — Epic L Policy 2.0
## Outstanding Product Owner Decision Packet, Revision 2

**Prepared:** November 24, 2026  
**Basis:** November 7 workshop, November 19 Product Owner response, Policy 2.0 decision receipt, committed coverage and operational contracts, and B01–B04 implementation evidence.

**Scope:** Outstanding decisions and missing operational details only. Earlier approvals are retained.

**Status:** For Product Owner, Veronica, Kevin, Operations, and external legal review as indicated.

---

## Part A — Policy and warranty rules

### OPEN-01 — Warranty duration, coverage trigger, and remedies

**Related:** L-DEC-001, L-DEC-002, L-PBI-001–003  
**Priority:** Critical  
**Decision owner:** Veronica / Product Owner  
**Legal review:** Required

**Already established:**

Silica-Gem handles manufacturing defects and authorized repairs. Rhino handles stocked replacement parts and remote support. Wear components, durable components, machines, third party items, and excluded supplies require distinct treatment. The former policy's terms do not automatically carry into Policy 2.0.

**Still to decide:**

1. What warranty duration should apply to complete machines?
2. Do durable replacement components have a separate warranty duration?
3. Should wear components receive any warranty beyond damage or defects present upon arrival and before use?
4. When does the coverage period begin: purchase, delivery, first use, or another recorded event?
5. Which remedies may Rhino voluntarily authorize, and which belong exclusively to Silica-Gem?
6. How are purchases preceding Policy 2.0 handled?

**Product Owner answer:**

*Duration — machines:* 1 year  
*Duration — durable parts:* same as machine, but prioritize replacement of existing sold parts before replacing a machine  
*Wear component treatment:* no warranty beyond damage or defects present upon arrival, excepting shipping damages  
*Coverage starting event:* machine registration  
*Remedy allocation:* Rhino may authorize replacement parts and remote inspections, while Silica-Gem is responsible for necessary repairs on the machine that do not constitute a "replacement part."  
*Prior purchase transition rule:* they will adopt the 2.0 policy, but may forgo the registration requirement for the case that they already started using the machine  

**Gate:** These values cannot authorize customer promises until reviewed against the manufacturer agreement and applicable consumer law.

---

### OPEN-02 — Proof, registration exceptions, and eligibility evidence

**Related:** L-DEC-003, L-DEC-004, L-DEC-009  
**Priority:** Critical  
**Decision owner:** Product Owner / Veronica  
**Legal review:** Required

**Already established:**

Registration is intended before first use. The owner proposed that operation before registration affects warranty coverage. Registration captures customer and machine information and delivers setup instructions. Registration is not the physical machine serial number.

**Still to decide:**

1. Which evidence is acceptable when a machine was purchased from Rhino, a dealer, as a gift, or before the new registration system existed?
2. What procedure applies when a receipt or physical serial number is missing?
3. What evidence establishes whether a machine was first used before registration?
4. Which registration corrections or ownership disputes require human approval?
5. Is the originally proposed generated code intended as an internal registration reference rather than a physical manufacturer serial?

**Product Owner answer:**

*Accepted purchase evidence:* purchase order from The Gem Shop, Inc. is acceptable  
*Gift/dealer/legacy exceptions:*  N/A  
*Missing serial or receipt procedure:*  there are no physical serial numbers, but when a receipt is missing, the machine does not qualify under warranty  
*First use evidence:*  remote inspection  
*Registration identifier clarification:* yes it is, and it will be the number that we store in our system, and will be provided to the customer upon registration  

**Gate:** The proposed coverage consequence of failing to register before first use requires legal review. Until then, the system must not automatically deny coverage.

---

### OPEN-03 — Exact Product coverage approval

**Related:** L-DEC-002, L-PBI-002–003  
**Priority:** Critical  
**Decision owner:** Product Owner / Veronica / Product Data  
**Legal review:** Required

**Already established:**

The business has selected the conceptual coverage categories. All 122 Products and 125 Variants have been accounted for, including Draft Products.

**Outstanding approval work:**

The current matrix contains 78 Active Products requiring individual review:

| Tentative physical classification | Products |
|---|---:|
| Machines | 8 |
| Wear components | 30 |
| Durable components | 9 |
| Unresolved physical classification | 31 |
| **Total awaiting approval** | **78** |

The first review should prioritize the 31 uncertain classifications, especially the 6 in Trim Saw Attachment, DIALUX polishing pastes, and TrimMaster Splash Guard Front.

**Product Owner direction needed:**

*Who has final business authority to approve the 78 Product mappings?*  Avery & Veronica  
*Should the review begin with machine families, or with the 31 highest uncertainty Products?* begin with 31 highest uncertainty products  
*Who supplies independent manufacturer evidence where Shopify descriptions are insufficient?* unsure of what this question is asking for.

**Gate:** No Product coverage may be displayed as approved until the exact Product/Variant mapping and policy applicability are reviewed.

---

## Part B — Operational service decisions

### OPEN-04 — Manufacturer handoff procedure

**Related:** L-DEC-001, L-DEC-005, L-DEC-008, L-PBI-010  
**Priority:** Critical  
**Decision owner:** Veronica / Kevin / Silica-Gem

**Already established:**

Silica-Gem is the designated authorized repair destination. Kevin conducts remote inspection and technical guidance. Rhino retains case ownership and communication responsibilities.

**Still to decide:**

1. What approved contact channel transfers a case to Silica-Gem?
2. What evidence must Kevin provide before escalation?
3. Who acknowledges acceptance of a case at Silica-Gem?
4. Who communicates repair findings and status to the customer?
5. When does a case return to Rhino for follow-up?
6. What happens when Silica-Gem does not acknowledge a referral?

**Product Owner / manufacturer answer:**

*Referral channel:* email to ziyansiz@gmail.com, with record of ticket kept in Shopify Admin  
*Required evidence:* Report of damages/misuse, customer testimony  
*Manufacturer acknowledgement:* Defer to Silica-Gem management  
*Customer communication owner:* Defer to Silica-Gem management  
*Follow-up and exception procedure:* Silica-Gem liable for a refund

**Gate:** Verify the final procedure against the compatible operating agreement.

---

### OPEN-05 — Support operations, exceptions, and notification recovery

**Related:** L-DEC-007, L-DEC-008, L-DEC-016  
**Priority:** High  
**Decision owner:** Veronica / Operations

**Already established:**

Business hours are Monday–Friday, 9 a.m.–5 p.m. Central, with Avery, Kevin, Warehouse, and Stephanie assigned their respective functions. Warehouse and Kevin's WhatsApp provide identified backup or escalation options. Fixed FAQs may direct customers to human support.

**Still to decide:**

1. What happens to ordinary requests received outside operating hours or during holidays?
2. What exact staff destinations should the system use for primary and backup notifications?
3. Who checks requests that fail to reach their intended recipient?
4. When is a support case considered administratively closed, and who can reopen it?
5. What procedure applies if Shopify Forms, Flow, or internal email delivery is unavailable?

**Operations answer:**

*Holiday and closure behavior:* Automatic response with work hours description and customer assurance  
*Approved staff notification destinations:* We will have tickets tracked in Shopify using native apps (please), with email notifications and potentially a Discord webhook connection to alert our staff  
*Failed delivery recovery owner:* Stephanie is customer service head, so she can manage that
*Case closure/reopening rules:* When the staff owner has confirmed the issue is resolved. Requests to reopen can be approved by Kevin  
*Manual service fallback:* Let's use a Discord Webhook!

Do not introduce an unapproved response time guarantee or imply continuous monitoring.

---

### OPEN-06 — Safety incident governance

**Related:** L-DEC-012, L-DEC-019, L-PBI-012  
**Priority:** Critical  
**Decision owner:** Veronica / Kevin  
**Legal review:** Required for regulatory obligations and public notices

**Already established:**

Burning or rubber odors, overheating, screeching, rattling, and other potentially dangerous machine symptoms require immediate cessation of operation. Kevin governs technical instructions. Veronica has business and incident decision authority. A comprehensive recall platform is deferred.

**Still to decide:**

1. Which internal contact is notified first when a serious incident is received? 
2. Who acts if that person is unavailable?
3. Which evidence must be preserved before contacting Silica-Gem?
4. Who may authorize a public safety notice?
5. Who may authorize closing a safety hold after technical and safety review?

**Safety procedure answer:**

*Primary notification route:* Kevin (let's use Discord notification instead of WhatsApp, and Kevin can handle establishing the contact thru WhatsApp or phone manually)  
*Fallback route:* Warehouse  
*Required incident evidence:* Images of damage, registration info, shipping insurance info, remote inspection report  
*Public notice authority:* We may announce safety info in our newsletter, but that will be manual from our end, you do not have to worry about it  
*Safety hold closure authority:* again, we have no public safety holds. if youre referring to when we suggest the customer stop operation, then Kevin is able to advise using the machine again

**Gate:** Public recall and regulatory procedures require legal review; the immediate stop use pathway must remain independent of those later approvals.

---

## Part C — Privacy and platform operations

### OPEN-07 — Private system of record and retention operations

**Related:** L-DEC-010, L-DEC-014, L-PBI-006, L-PBI-020  
**Priority:** Critical  
**Decision owner:** Product Owner / Privacy / Engineering  
**Legal and security review:** Required

**Already established:**

Seven year retention is the intended business period. Shopify Forms and Flow are the preferred intake architecture. Support records and notifications must be separated from marketing consent.

**Still to decide:**

1. What approved private processor will retain registration, support, and evidence records?
2. Which staff roles may view, correct, export, and delete each record category?
3. Who handles customer access or deletion requests?
4. What specific exceptions require records to be preserved beyond ordinary deletion?
5. How will backup expiration, recovery, encrypted storage, and breach reporting be governed?
6. Who owns delivery failure reconciliation and the audit trail?

**Product Owner answer:**

*Preferred processor or authorization to assess candidates:* we will process registration through Shopify Forms and apply the serial number to the customer's metadata. support records remain in Forms   
*Staff access model:* Warehouse[..] Stephanie[..], mail[@thegemshop.com] can view, correct, export. Warehouse can delete  
*Access and deletion request owner:* customer only sees ticket information via email (or whatever Shopify Forms uses), and deletion requests are handled by Warehouse  
*Retention exceptions requiring review:* if a record is somehow still open beyond the deletion period, keep it. otherwise no exceptions  
*Backup and security requirements:* we will have an export option so we can manage backups ourselves  
*Recovery and incident owner:* primary assigned employee handles contact failures, customer service stephanie@thegemshop.com is the backup if no assigned employee

The selection must be technically verified and reviewed before any real customer collection. Shopify customer metafields alone do not establish the full retention architecture.

---

### OPEN-08 — Optional shipping insurance implementation

**Related:** L-DEC-006, L-PBI-011  
**Priority:** Medium  
**Decision owner:** Veronica / Product Owner / Shipping  
**Legal review:** Required

**Already established:**

The owner wants an optional shipment insurance choice. Stephanie handles carrier claims assistance. Rhino does not operate repair shipping or routine return processing.

The audited Shopify store uses Basic, and the proposed checkout shipping step extension is unavailable under that entitlement.

**Still to decide:**

Should the insurance choice be:

- Presented before checkout through a separately approved cart or product mechanism?
- Managed through an approved quotation or shipping service process, where applicable?
- Deferred until a compliant implementation is available?

**Product Owner answer:**

*Preferred implementation approach:* presented before checkout on the cart screen  
*Who confirms actual carrier coverage and insurance terms:* stephanie  
*Who handles uninsured shipment disputes:* if it is a dispute with the carrier: stephanie; if it is a dispute regarding machine functionality: kevin via remote inspection

**Gate:** Customer liability exclusions and insurance representations require legal and carrier agreement review. Do not modify checkout until an approved design passes feasibility review.

---

## Part D — Resources and release readiness

### OPEN-09 — First governed resource approval batch

**Related:** L-DEC-011, L-DEC-012, L-PBI-007, L-PBI-014  
**Priority:** High  
**Decision owner:** Kevin / Product Owner

**Already established:**

Kevin approves technical revisions. Google Docs may contain dynamic instructions. YouTube and Shopify Files can provide source content, but publication alone does not establish approval.

**Still to decide:**

1. Which machine family will receive the first full resource review?
2. Who confirms each document's exact revision and machine applicability?
3. What accessibility and publication approval process applies?
4. Which existing resources require replacement, retirement, or correction?

**Recommended starting point:** EM-1, because it is a primary storefront machine family.

**Product Owner / Kevin answer:**

*First machine family:* all current resources have been reviewed and approved by Kevin already, you just need to create the infrastructure so i can go in and assign document links and videos accordingly  
*Revision verification owner:* it has been verified  
*Accessibility and release approver:* this shouldnt be that complicated   
*Correction/retirement process:* we update what's published.

**Timing:** The B05 agent should return a candidate resource queue. Final individual resource approvals can be made against that queue rather than recreating the inventory manually.

---

### OPEN-10 — Policy publication and initial operational acceptance

**Related:** L-DEC-001–004 and M1 activation gate  
**Priority:** Critical  
**Decision owner:** Veronica / Product Owner / Legal / Operations

**Already established:**

Policy 2.0 is intended to take effect as soon as a compatible operating agreement and the necessary approvals are in place. The earlier warranty remains relevant to historical purchases.

**Still to establish:**

1. Exact executed agreement or amendment supporting the new responsibilities.
2. Final legally approved warranty text and applicable policy version.
3. Exact effective date and treatment of earlier purchases.
4. Approved support and registration customer messaging.
5. Evidence of staff preparedness and successful operational acceptance tests.
6. Final authorization to activate registration, support, and customer resource delivery.

**Required approval records:**

*Operating agreement evidence:* pending; complete infrastructure in the mean time. operating agreement should only provide approval for publish, not dictate warranty language unless specified later  
*Legal reviewer and approval evidence:* N/A  
*Policy version and effective date:* N/A  
*Customer message approval:* APPROVED  
*Operational acceptance owner:* TBD  
*Final release authorization:* TBD

This is a final release gate, not permission for the agent to activate services immediately after technical tests pass.

---

## Part E — Previously deferred decisions

The following should not be reopened in the current workshop:

| Area | Existing disposition | Future owner |
|---|---|---|
| Customer machine and service history | Interface only, implementation deferred | Epic O |
| Dealer and Gem & Mineral organization directory | Publication requires each organization's permission | Business / Content |
| Analytics and performance measurement | Deferred until support stabilizes | Product Owner / Epic U |
| Comprehensive recall management platform | Deferred; immediate safety handling remains required | Business / Safety |
| Replacement parts marketing | Intended after registration, with separate marketing authorization | Epic X / Marketing |
| Autonomous diagnosis and repair instruction generation | Prohibited | No implementation |

---

## Part F — Evidence reconciliation for the agent

These are administrative corrections, not fresh Product Owner questions.

The next repository decision reconciliation should:

- Recover or attach the original November 19 L-DEC-001 through L-DEC-020 response, preserving its exact wording.
- Record the previously approved 9 a.m.–5 p.m. Central support hours in the versioned operational contract.
- Record Avery, Kevin, Warehouse, Stephanie, and the previously described backup arrangements without treating their assignments as new proposals.
- Preserve Silica-Gem's manufacturing and repair responsibility and Rhino's stocked parts and communication role.
- Preserve the previously approved registration, resource, retention, Forms/Flow, FAQ, and messaging direction.
- Distinguish previously approved business intent from legal clearance, operational configuration, and runtime readiness.
- Maintain all existing activation blockers until their actual acceptance evidence is recorded.
- Do not reinterpret this packet as authority for customer activation, Shopify mutations, or publication.

## Decision receipt convention

I am overriding excessive formality
