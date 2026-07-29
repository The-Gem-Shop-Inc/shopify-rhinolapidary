# Security and Privacy Review Checklist

## When this checklist is required

Use this checklist before:

* Installing an app
* Enabling an app embed
* Adding an app block to a high-risk page
* Adding Custom Liquid
* Adding a custom pixel
* Enabling an app pixel
* Adding analytics or marketing scripts
* Adding embedded forms
* Adding chat, review, quiz, loyalty, subscription, or personalization tools
* Adding video embeds that set cookies
* Changing customer accounts, forms, or checkout-adjacent behavior

## Basic review

* [ ] Business purpose is documented.
* [ ] Owner is assigned.
* [ ] Vendor is identified.
* [ ] Configuration location is documented.
* [ ] Pages affected are listed.
* [ ] Rollback/removal process is known.
* [ ] Support impact is understood.
* [ ] Release notes impact is documented.

## Data review

* [ ] Data collected is listed.
* [ ] Customer identifiers are listed.
* [ ] Order data access is listed.
* [ ] Product/cart/checkout event access is listed.
* [ ] Form fields are listed.
* [ ] Data destination is known.
* [ ] Retention behavior is known or marked unknown.
* [ ] Vendor terms/privacy documentation is linked.
* [ ] Sensitive data is not collected unnecessarily.

## Consent and privacy

* [ ] Consent requirements are identified.
* [ ] Shopify Customer Privacy settings were reviewed.
* [ ] Pixel permissions were reviewed.
* [ ] Behavior before consent is understood.
* [ ] Behavior after consent withdrawal is understood.
* [ ] EEA/UK behavior is considered if applicable.
* [ ] “Do not sell/share” behavior is considered if applicable.
* [ ] Cookie banner requirements are considered if applicable.

## Storefront behavior

* [ ] Script injection behavior is documented.
* [ ] App block placement is documented.
* [ ] App embed behavior is documented.
* [ ] Custom Liquid is documented.
* [ ] No duplicate analytics events are introduced.
* [ ] No duplicate purchase events are introduced.
* [ ] No checkout-breaking dependency is introduced.
* [ ] No hidden required third-party runtime is introduced.

## Accessibility

* [ ] Keyboard behavior is reviewed.
* [ ] Focus behavior is reviewed.
* [ ] Forms have accessible labels and errors.
* [ ] Dialogs/drawers trap and restore focus when applicable.
* [ ] Widget iframes have accessible names where controllable.
* [ ] Automated accessibility tests pass or exceptions are documented.

## Performance

* [ ] Before/after page weight is reviewed.
* [ ] Added JavaScript requests are documented.
* [ ] Added third-party domains are documented.
* [ ] Core Web Vitals impact is considered.
* [ ] The app/script can be disabled quickly if performance regresses.

## Security

* [ ] No secrets are committed.
* [ ] No private keys or tokens are placed in theme code.
* [ ] App permissions are least-privilege where possible.
* [ ] Admin access required by the integration is documented.
* [ ] Embedded scripts come from expected domains.
* [ ] Vendor install instructions were not copied blindly.
* [ ] Removal steps are tested or clearly documented.

## Approval

* [ ] Engineering approval:
* [ ] Business/admin approval:
* [ ] Privacy/security approval, if required:
* [ ] Release owner:
* [ ] Review date:

## Decision

* [ ] Approved
* [ ] Approved with conditions
* [ ] Rejected
* [ ] Deferred

Notes:
