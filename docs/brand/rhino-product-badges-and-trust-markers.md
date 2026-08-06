# Rhino Product Badge and Trust Marker System

**PBI:** B-010  
**Status:** Approved foundation  
**Owner:** Product, Content, Brand, Engineering, and Shopify Admin  
**Last reviewed:** 2026-07-31

## Purpose

Rhino badges must help customers identify product role, availability,
fulfillment requirements, verified compatibility, and relevant purchase
conditions.

Badges are not decorative promotional labels. Every badge must answer a useful
customer question and come from an identified data source.

Trust markers are separate from badges. Badges classify or signal a product
state. Trust markers explain support, warranty, freight, parts, or ownership
information at a purchase decision point.

## Governing principles

1. Show only information that changes a customer decision.
2. Use text for every meaning.
3. Do not rely on hue or an icon alone.
4. Do not derive compatibility from product titles, tags, dimensions, or family
   resemblance.
5. Do not display warranty duration without product-specific approved data.
6. Do not display freight estimates as stable facts unless the operational
   source is current.
7. Do not use scarcity, popularity, or superiority claims without evidence.
8. Remove a badge when its source becomes stale, incomplete, or unapproved.
9. Keep product cards concise.
10. Keep legal and operational explanations outside compact badges.

## Badge categories

### 1. Commerce and availability

These have the highest priority because they directly affect whether the
customer can purchase the item.

| Badge | Source | Surfaces | Notes |
|---|---|---|---|
| Sold out | Shopify product or variant availability | Card, search, product page | Reuse Shopify availability state |
| Temporarily unavailable | Governed product availability field | Card, product page | Must differ operationally from sold out |
| Discontinued | Governed product lifecycle field | Card, product page, support | Provide replacement or support route when available |
| Quote required | Approved purchase model field | Card, product page | Never infer from a zero price |
| Backorder | Approved inventory or fulfillment state | Product page; card only when useful | Must include expected handling elsewhere |
| Preorder | Approved selling plan or product state | Product page; card when active | Requires an actual preorder process |

A zero price is never an availability badge source.

### 2. Fulfillment and handling

| Badge | Source | Surfaces | Notes |
|---|---|---|---|
| Freight delivery | Product freight flag | Card, product page, cart | Does not state a price or delivery date |
| Oversize shipment | Approved fulfillment field | Product page, cart | Use only when it changes customer preparation |
| Pickup available | Approved product and location availability | Product page | Requires current location and pickup process |
| International review required | Market or product restriction data | Product page | Use when purchase requires confirmation before ordering |

### 3. Product role

| Badge | Source | Surfaces |
|---|---|---|
| Machine | `rhino.product_class` |
| Replacement part | `rhino.product_class` |
| Accessory | `rhino.product_class` |
| Consumable | `rhino.product_class` |
| Manual or support item | `rhino.product_class` |

Product role badges may appear on collection and search cards when mixed product
classes would otherwise be difficult to distinguish.

### 4. Compatibility

| Badge | Source | Surfaces | Rule |
|---|---|---|---|
| Fits Rhino {family} | Approved compatibility relation | Card, product page, search | Only for confirmed compatibility |
| Fits multiple Rhino machines | Approved compatibility relation list | Product page; compact card summary | Link to the complete list |
| Compatibility not confirmed | Explicit unresolved compatibility state | Product page | Do not show as a positive badge |
| Model-specific part | Approved product relation | Product page, search | Include the actual model in adjacent text |

Do not use `Universal`, `Fits all Rhino machines`, or equivalent wording without
complete approved evidence.

### 5. Warranty and support

Warranty and support information normally belongs in a trust marker rather than
a product-card badge.

Permitted badge uses:

- Warranty details
- Support available
- Replacement parts available

These labels must link or lead to the actual details. They must not imply a
specific warranty duration or service level unless those values are current and
product-specific.

### 6. Merchandising

| Badge | Source | Rule |
|---|---|---|
| Sale | Shopify compare-at pricing | Reuse native pricing state |
| New | Approved launch or first-published date | Automatically expires after 90 days unless governance selects another period |
| Featured | Manual merchandising decision | Internal collection presentation only; do not imply popularity |
| Best seller | Verified sales rule and review period | Not approved for launch |
| Staff pick | Named editorial decision and review date | Not approved for launch |

## Priority rules

When several badges apply, use this order:

1. Commerce blocker
2. Fulfillment requirement
3. Product role
4. Confirmed compatibility
5. Warranty or support route
6. Sale or new status

### Product card limits

A product card may show:

- One machine family identifier
- Up to two badges

When a commerce blocker exists, it occupies the first badge position.

Do not create a wrapping cloud of labels below a product title.

### Product page limits

The primary product summary may show up to three concise badges.

Longer reassurance belongs in a labeled trust-marker group below the primary
purchase information.

## Trust markers

Approved trust-marker categories:

- Freight and delivery
- Warranty details
- Support and repair
- Replacement parts
- Pickup
- International purchase review
- Manuals and documentation

Each trust marker contains:

1. A short heading
2. One sentence of explanation
3. A named destination or action
4. An optional informative icon
5. Its source owner in the content architecture

Trust markers must not:

- Contain unverified claims
- Replace complete policies
- Hide exclusions
- Use generic phrases such as `Buy with confidence`
- Promise response or delivery time without approval
- Present The Gem Shop or Silica-Gem responsibilities ambiguously

## Visual rules

### Badges

- Compact rectangular form
- Four-pixel radius
- One-pixel border
- Sentence case
- No gradients
- No shadow
- No animated pulse
- No more than one icon
- At least 3:1 boundary contrast
- Text must meet normal-text contrast requirements

### Trust markers

- Flat row or grouped panel
- Strong heading and plain explanation
- Icon optional
- Dividers preferred over individual floating cards
- Support markers use information blue
- Warnings use warning color
- Commerce conditions remain neutral unless they block purchase

## Data ownership

| Data | Proposed source | Owner |
|---|---|---|
| Product role | `rhino.product_class` | Product Data Owner |
| Machine family | `machine_family` metaobject reference | Product Data Owner |
| Compatibility | `rhino.compatibility` or structured product references | Technical and Product Data Owners |
| Freight requirement | Product freight field or governed metafield | Operations |
| Warranty class | Product-specific warranty reference | Business and Legal |
| Product lifecycle | Governed product status | Product Owner |
| New-product date | Product launch or publication field | Merchandising |
| Sale | Native Shopify pricing | Shopify Admin |
| Availability | Native Shopify inventory plus approved lifecycle state | Operations and Shopify Admin |

## Implementation separation

### Repository work

Future rendering may affect:

- Product-card snippets
- Product-page sections
- Search result rendering
- Locale files
- `assets/rhino-custom.css`

### Shopify admin work

Future data changes may include:

- Product class metafields
- Compatibility relations
- Machine family references
- Freight flags
- Product lifecycle
- Product-specific warranty references

Every admin change requires an admin change record and rollback source.

## Accessibility review

Test:

- Multiple badges on narrow product cards
- 200% zoom
- Forced colors
- Screen-reader reading order
- Long machine names
- Sale plus sold-out combinations
- Compatibility with multiple families
- Product cards without badges
- Missing or stale data

## Completion condition

B-010 is complete when this system is approved and implementation dependencies
are recorded. It does not require badge rendering or metafield creation.