# Epic L Policy 2.0 Shopify native feasibility — Revision 3

Assessed: 2026-11-25

Store evidence carried forward: Basic plan, not Plus; Forms and Flow were not installed in the 2026-11-23 read-only audit

Action taken: documentation and repository inspection only; no install, activation, Shopify mutation, webhook, or checkout change

## Conclusion

Shopify Forms and Flow on Basic can provide intake, a Forms-owned submission record in Shopify Admin, and staff email notification. They cannot, by themselves, satisfy the complete governed ticket workflow. The smallest compatible extension is a private app that creates and governs a separate support-case record plus append-only case events and notification ledger, while using Forms only as intake. The same app can later issue a redacted Discord alert after the durable case exists.

Registration can also begin with Forms, but a customer metafield cannot be the authoritative machine registry: when a customer submits the same metafield again, the customer profile retains the most recent submitted value. Each machine therefore needs its own registration record, related to the customer; the customer profile may hold a list/reference or summary, not the sole record.

These findings are design evidence, not proof of this store's exact Forms definitions, API visibility, staff permissions, file lifecycle, or runtime behavior. Those require a non-production proof and read-only live audit before implementation.

## Verified native capabilities and limits

| Capability | Current official finding | Policy 2.0 consequence |
| --- | --- | --- |
| Forms submission storage | Submission data is stored in Shopify Admin, viewable in Forms, customer profile metafields, and Forms-owned metaobjects | Suitable intake evidence; not automatically a case state machine |
| Metaobject submission event | Flow can use `Metaobject entry created` for a selected form | Can start email/processing after intake when both apps are installed |
| Customer matching | Forms creates a customer profile for new customers and matches existing customers; existing contact information is not automatically updated | Customer association must be verified; matching is not ownership proof |
| Custom field storage | Fields can remain local or also store as customer/company metafields | Local submission fields preserve each submission; customer metafields are profile attributes, not a multi-record registry |
| Repeated metafield submissions | Customer profile shows the most recent submitted metafield value | A scalar registration-ID metafield would overwrite earlier machines |
| Form upload | Forms supports a single file per file-upload field, up to 20 MB, for Shopify's documented formats | Evidence intake is possible but lifecycle, access, export, retention, and malware/content handling still need verification |
| Flow availability | Flow is available on Basic | Internal workflow automation is feasible after authorized installation |
| Staff email | Forms can notify the store owner; Flow can send internal email to fixed recipients | Meets the basic email-alert preference, subject to delivery/recovery testing |
| Outbound HTTP | Flow `Send HTTP Request` is available only on Grow, Advanced, or Plus | Basic Flow cannot post a Discord webhook directly |
| Admin API mutations from Flow | `Send Admin API request` can use most supported mutations | A proof may create merchant-owned records, but API versioning, permissions, error recovery, and enforceable history still require engineering |
| Staff permissions | Shopify has distinct Customer, Content/metaobject, Flow, Files, export, delete, erase, and app permissions | Exact accounts and least-privilege role mapping must be inspected; role names in the packet are not account evidence |
| Store activity log | Incomplete, not exportable, and available for only 18 months | Cannot serve as the required seven-year durable case history |

Official sources accessed November 25, 2026:

- [Managing Forms and viewing submissions](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/forms-app/manage)
- [Forms fields and customer-metafield overwrite behavior](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/forms-app/settings/all-forms)
- [Forms processing with Flow](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/forms-app/flow)
- [Flow plan availability](https://help.shopify.com/en/manual/shopify-flow)
- [Flow internal email](https://help.shopify.com/en/manual/shopify-flow/reference/actions/send-email)
- [Flow Send HTTP Request plan limits](https://help.shopify.com/en/manual/shopify-flow/reference/actions/send-http-request)
- [Flow Send Admin API request](https://help.shopify.com/en/manual/shopify-flow/reference/actions/send-admin-api-request)
- [Shopify staff/store permissions](https://help.shopify.com/en/manual/your-account/users/roles/permissions/store-permissions)
- [Shopify activity-log scope and retention](https://help.shopify.com/en/manual/shopify-admin/activity-logs)

## Minimum ticket requirement assessment

| Requirement | Forms/Flow only | Precise gap | Smallest extension behavior |
| --- | --- | --- | --- |
| Stable case identity | PARTIAL | Forms has a submission/metaobject identity, but no governed customer-facing opaque case identity contract | Generate a 128-bit opaque case ID and bind it to immutable intake identity |
| Case status | PARTIAL | A separate editable metaobject can hold a field, but Forms submission definitions are read-only and native edits do not enforce the B03 state machine | App-owned case record with guarded transitions |
| Staff assignment | PARTIAL | A text/reference field can store an assignee, but exact staff identity and authority are not proven and permissions are broad | Governed assignee identity, role scope, and audit event |
| Notes and evidence | PARTIAL | Form data/files capture initial evidence; no case-bound staff-note timeline or evidence-disposition controls | Append-only note/evidence events with restricted access and references |
| Resolution and reopening | NO | Native field editing cannot enforce staff-owner resolution and Kevin-only reopen authority | Enforce resolution prerequisites and Kevin-authorized reopen event |
| Access restrictions | PARTIAL | Shopify roles can restrict Customers, Content, Flow, Files, and apps, but Forms-owned records and broad content permissions need exact testing | Limit app access, keep records app-owned/private, and check actor authorization on every operation |
| Notification failure recovery | PARTIAL | Flow exposes runs/errors and can send alerts, but there is no complete case-bound delivery ledger and reconciliation workflow | Notification outbox/ledger with attempt, confirmation, uncertainty, retry, recovery owner, and terminal disposition |
| Durable case history | NO | General activity log is incomplete, non-exportable, and 18 months | Append-only case-event records included in seven-year export and restore tests |

Native Forms and Flow therefore do not meet the full ticket requirement set without the extension.

## Proposed smallest compatible architecture

1. Shopify Forms collects registration/support intake with marketing consent disabled for operational forms.
2. A Forms submission remains immutable intake evidence.
3. A private app observes or reconciles the submission using the exact Forms metaobject type/API behavior proven in a non-production spike.
4. The app creates an app-owned private `support_case` or `machine_registration` metaobject and a separate append-only event record. If Shopify storage cannot meet lifecycle or access requirements, the spike must stop and document the smallest compatible private processor rather than silently adding one.
5. The case record stores current state and assignment; events store submissions, staff notes, evidence references, transitions, resolution, reopen authorization, safety disposition, and notification outcomes.
6. The customer profile relates to many registration records. A scalar customer metafield is never the authoritative collection.
7. Email alerts use Forms/Flow or the app, with delivery evidence and Stephanie-owned recovery.
8. A later app-owned Discord adapter sends only opaque case ID, severity, state, and an authenticated internal link after the case record exists.

The proof must verify Forms app-owned metaobject API visibility, event delivery, permissions, file references, duplicate delivery, API version behavior, and recovery. No Forms/Flow installation or activation is included here.

## Discord boundary

Discord is a notification convenience, never the case record. A permitted payload contains only:

- opaque case ID;
- severity/category without customer narrative;
- current internal state;
- authenticated internal case link.

It must reject customer testimony, names, email/phone, addresses, registration evidence, images/files, remote-inspection details, insurance information, and webhook credentials. Webhook secrets belong in a secret manager or restricted app configuration and must never be committed. A failed Discord delivery creates notification recovery and cannot resolve or close a case.

## Registration feasibility

Use one registration record for each machine, with:

- opaque registration ID;
- exact Product and Variant GIDs plus machine version;
- customer reference;
- purchase-evidence collection, including The Gem Shop purchase order when supplied;
- first-use evidence, including remote inspection when performed;
- new/prior-purchase/prior-registration path;
- correction and ownership-review events;
- acknowledgement and resource-delivery evidence;
- warranty eligibility fixed to human/legal review where required.

The customer relationship can use a list of metaobject references or be derived by querying registrations by customer reference after limits and permissions are verified. Do not store multiple registrations as a JSON blob or repeatedly overwritten scalar solely because Forms exposes a customer metafield option.

## Separate cart and insurance assessment

The current theme is compatible with a cart-screen control in principle:

- `templates/cart.json` renders `main-cart-footer`, which already supports app blocks.
- `snippets/rhino-quote-checkout.liquid` already contains a non-binding `insurance_options_requested` checkbox in the shipping-quotation request.
- Shopify themes can capture cart attributes before checkout; Basic cannot add UI to the information, shipping, or payment checkout steps.

Official references: [Shopify cart template and attributes](https://shopify.dev/docs/storefronts/themes/architecture/templates/cart), [Cart Ajax API and attribute visibility](https://shopify.dev/docs/api/ajax/reference/cart), and [checkout customization plan availability](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-apps/).

The existing checkbox requests that staff discuss insurance options. It is not an insurance election, charge, proof of carrier coverage, or order protection promise. A binding selection is blocked until Stephanie confirms provider/carrier terms and engineering verifies:

- eligible carts, Products, destinations, and carriers;
- price source, taxes, discounts, cancellation, refund, and charge behavior;
- quote/draft-order and direct-pickup behavior;
- persistence from cart to order and visibility to staff/customer;
- customer copy, consent, claims, exclusions, and legal compatibility;
- cart-change, duplicate, stale, mobile, enlarged-text, keyboard, error, and notification regressions.

Feasible candidates, in increasing complexity, are a non-binding quote request, a governed cart attribute, a cart app block backed by an approved provider, or an approved protection Product/Variant. None is selected or authorized here. Checkout-step modification is not a Basic-plan option.
