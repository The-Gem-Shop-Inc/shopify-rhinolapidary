# Rhino Button, Link, and CTA Hierarchy

**PBI:** B-008  
**Status:** Approved foundation  
**Owner:** Product, Brand, and Engineering  
**Last reviewed:** 2026-07-31

## Purpose

Every page should make the most useful next action apparent without turning
support, education, and purchase actions into competing primary buttons.

## Priority rule

A directly purchasable product uses `Add to cart` or the approved Shopify
purchase action as its primary CTA.

`Request freight information` becomes primary only when a product cannot be
purchased directly or requires an approved quote workflow.

`Contact support` does not outrank a functioning purchase action. It may become
primary on support, warranty, repair, and troubleshooting pages.

## Action roles

| Role | Treatment | Examples | Maximum per action group |
|---|---|---|---:|
| Primary commerce | Filled Action Red, white text | Add to cart, Continue to checkout | 1 |
| Secondary | White, Graphite border and text | View specifications, Compare machines | 1–2 |
| Tertiary | Text link with visible underline | Download manual, View dimensions | As needed |
| Support | White or pale information surface, Information blue text/border | Contact support, Ask a compatibility question | 1 |
| Destructive | Error color with explicit wording | Remove item, Cancel request | 1 |
| Icon button | Square control with accessible name | Search, Close, Previous image | As required |
| External link | Underlined text plus external indication | Visit The Gem Shop | As required |

## Primary action rules

- One primary action per action group.
- Primary actions use Action Red `#B51820`, not the brighter logo red.
- Primary actions must not be used merely to make a section visually prominent.
- The button label names the action.
- A machine that is unavailable must not display an active purchase CTA.
- Loading, unavailable, and disabled states must explain why the action cannot
  proceed.

## Secondary action rules

Use a secondary button for a significant alternative that does not complete the
main transaction.

Examples:

- View specifications
- Compare machines
- Find compatible parts
- Request freight information when direct purchase remains available

Do not place more than two secondary buttons beside the primary action.

## Tertiary and inline links

Use visible underlines for text links in paragraphs and technical content.

Approved link patterns:

- Download the EM-1 manual (PDF)
- Review warranty terms
- View compatible wheels
- Watch the setup video
- Contact Rhino support
- Visit The Gem Shop

Avoid generic labels such as:

- Click here
- More
- Learn more
- Read more

Use those labels only when the surrounding accessible name makes the
destination unambiguous.

## Support actions

Support uses the Information color rather than Rhino red so it remains distinct
from commerce and error states.

Support actions include:

- Contact support
- Ask a compatibility question
- Report shipping damage
- Start a warranty request
- Request repair information

Support actions must route to an identified owner and cannot promise a response
time unless that response standard is approved.

## Destructive actions

A destructive action:

- Uses explicit text
- Requires confirmation when difficult to reverse
- Is not placed directly beside the primary action without separation
- Does not rely on red alone
- Restores focus after cancellation or completion

`Remove item` is preferable to `Delete`.

## Icon buttons

- Minimum target: 44 by 44 px
- Must have an accessible name
- Must have a visible focus state
- Must not rely on tooltip text as the only label
- Use only familiar actions or pair the icon with visible text
- Do not use the Rhino mark as a generic button icon

## States

### Hover

Hover may darken the background or strengthen the underline. Hover must not be
the only state indication.

### Focus

Use the approved high-contrast focus ring. Focus must remain visible against
light and dark surfaces.

### Active

Use a restrained pressed treatment. Do not move the control enough to cause
layout shift.

### Disabled

- Use the native `disabled` attribute where possible.
- Retain readable text contrast.
- Do not use `pointer-events: none` without preserving the disabled semantics.
- Explain the reason near the action when it is not obvious.

### Loading

- Preserve the button width.
- Use `aria-busy="true"`.
- Keep an understandable label such as `Adding…`.
- Prevent duplicate submission.
- Announce completion or failure in the relevant live region.

## CTA copy rules

- Start with a verb.
- Name the destination or result.
- Use sentence case.
- Keep labels concise.
- Do not include a period.
- Do not include unsupported urgency.
- Do not use “free,” “guaranteed,” “instant,” or equivalent claims unless
  approved and accurate.

## Accessibility evidence

Test:

- Keyboard focus
- Hover and active states
- Disabled semantics
- Loading announcements
- High-contrast mode
- 200% zoom
- Mobile wrapping
- Long translated labels
- Product, collection, cart, contact, support, and policy surfaces