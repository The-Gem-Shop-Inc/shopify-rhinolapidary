# Rhino Form and Storefront State Patterns

**PBI:** B-009  
**Status:** Approved foundation  
**Owner:** Product, Content, Engineering, Privacy, and Support  
**Last reviewed:** 2026-07-31

## Purpose

Rhino forms and state messages must help customers recover from problems,
understand availability, and reach the correct support path without exposing
private information or relying on color alone.

## Form anatomy

Every field uses this order:

1. Persistent label
2. Optional requirement indicator
3. Optional concise instruction
4. Input, select, textarea, or control group
5. Inline validation or status message

Placeholder text is never the only label.

## Labels

- Use sentence case.
- Describe the information requested.
- Keep labels visible after input.
- Associate labels programmatically with controls.
- Put units in the label or adjacent help text when they affect the expected
  format.

Examples:

- Email address
- Order number
- Machine model
- Serial number
- Shipping country
- Question or issue

## Required and optional fields

- Mark required fields in text and programmatically.
- Prefer `Optional` on the minority of optional fields rather than an asterisk
  on every required field.
- Do not ask for information that the workflow does not need.
- Warranty and support forms must explain why serial numbers, photographs, or
  proof of purchase are requested.

## Validation timing

Validate:

- On submission
- After a previously invalid field changes
- When immediate validation prevents a costly error, such as malformed email

Do not display error states while the customer is still entering an initially
blank value.

## Error behavior

A form submission with errors must:

1. Keep the customer’s entered values.
2. Present a concise error summary at the start of the form.
3. Link each summary item to the affected field where practical.
4. Mark each invalid control with `aria-invalid="true"`.
5. Associate the field error through `aria-describedby`.
6. Move focus to the summary or first invalid field according to the form
   architecture.
7. Explain how to fix the problem.

Avoid:

- Invalid input
- Something went wrong
- Red border without text
- Clearing the form after failure

Preferred:

- Enter an email address in the format name@example.com.
- Choose a machine model.
- The uploaded file exceeds the permitted size.
- We could not update the cart. Your previous quantity is still shown.

## Success behavior

Success messages state:

- What happened
- What happens next
- Whether the customer must take another action
- The responsible support identity when relevant

Example:

`Your support request was submitted. The Gem Shop support team will reply using the email address you provided.`

Do not promise a response time unless approved.

## State patterns

| State | Treatment | Required content |
|---|---|---|
| Information | Information color and icon/text label | Relevant context or next action |
| Success | Success color and explicit confirmation | Completed action and next step |
| Warning | Warning color and `Warning` or equivalent text | Consequence and recovery |
| Error | Error color and explicit error heading | Problem and recovery |
| Empty | Neutral or alternate surface | Why empty and useful next action |
| No results | Neutral state near search/filter controls | Query context and ways to recover |
| Loading | Stable layout with progress wording | Current action; no duplicate submission |
| Unavailable | Neutral or warning treatment | Availability state and approved alternative |
| Draft or unverified | Never shown to customers as an internal status | Keep product unpublished |
| Quote required | Information/support treatment | Why direct purchase is unavailable and what happens next |

## Search no-results pattern

Include:

- The submitted search term
- A suggestion to check spelling
- A suggestion to use a model, product type, grit, diameter, or part name
- A link to browse relevant categories
- A support path when compatibility is uncertain

Do not imply that a product does not exist merely because search returned no
result.

## Empty cart pattern

Include:

- Clear `Your cart is empty` heading
- Link to machines, replacement parts, or consumables
- No fake urgency
- No unrelated newsletter request as the primary recovery action

## Product unavailable pattern

Distinguish:

- Sold out
- Temporarily unavailable
- Discontinued
- Quote required
- Draft or incomplete data
- Not available in the customer’s market

Do not use a zero price to represent any of these states.

## Cart error pattern

- Preserve the prior valid quantity.
- Explain whether the cart changed.
- Associate the message with the affected line.
- Announce the error through the existing cart live region.
- Offer a recovery action.
- Do not display raw server responses.

## Loading pattern

- Use `aria-busy="true"` on the affected region.
- Keep dimensions stable.
- Disable duplicate submission.
- Preserve the visible action label or replace it with a specific progressive
  label.
- Loading indicators must not be decorative motion.
- Reduced-motion preferences must be respected.

## Copy ownership

| Content | Owner and storage |
|---|---|
| Reusable UI state labels | Locale files |
| Section-specific editable guidance | Theme section settings |
| Product availability or compatibility | Product metafields or Shopify product state |
| Warranty and support explanations | Approved policy/page content or governed metaobject |
| Form confirmation and routing | Form implementation plus locale content |
| App-generated error text | App configuration, reviewed through app and privacy policy |
| Checkout messages | Shopify admin or checkout configuration |

## Privacy and app review

Any form collecting customer information must identify:

- Data collected
- Purpose
- Recipient
- Storage system
- Retention responsibility
- Required versus optional fields
- Third-party processors
- Customer contact expectation

A new app form, embedded form, upload service, chat widget, or warranty portal
requires the app dependency and privacy review before implementation.

## QA

Test:

- Keyboard-only completion
- Screen-reader labels and announcements
- 200% zoom
- 360 px viewport
- Error recovery
- Duplicate submission prevention
- Empty values
- Long values
- File upload failure when applicable
- Cart and search failures
- High-contrast mode
- Reduced motion