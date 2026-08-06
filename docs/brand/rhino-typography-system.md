# Rhino Typography and Technical Hierarchy

**PBI:** B-006  
**Status:** Approved foundation  
**Owner:** Brand and Engineering  
**Last reviewed:** 2026-07-31

## Purpose

Rhino typography must make machinery, specifications, compatibility, policies,
prices, and support information easy to scan. It must not imitate the striped
Rhino wordmark or use oversized display typography that delays technical content.

## Font decision

Rhino uses DM Sans for headings, body copy, labels, controls, and technical data.

Using one family provides a coherent technical hierarchy and removes the
unnecessary DM Sans and Jost split in the current Trade configuration.

No external font service is approved for launch.

### Approved weights

| Weight | Use |
|---:|---|
| 400 | Body copy, descriptions, policy text |
| 500 | Secondary emphasis, compact product information |
| 600 | Navigation, labels, buttons, table headings |
| 700 | Page titles, product titles, major section headings |

Technical values use tabular numerals:

`font-variant-numeric: tabular-nums lining-nums`

A monospace font is not required for launch.

## Type roles

| Role | Mobile size / line height | Desktop size / line height | Weight | Rules |
|---|---|---|---:|---|
| Page title | 32 / 40 px | 40 / 48 px | 700 | One per page; must not replace semantic heading order |
| Product title | 28 / 36 px | 32 / 40 px | 700 | Wrap naturally; no truncation on product pages |
| Section heading | 24 / 32 px | 28 / 36 px | 700 | Short and descriptive |
| Subsection heading | 20 / 28 px | 22 / 30 px | 600 | Used inside long pages and technical modules |
| Product subtitle | 18 / 28 px | 18 / 28 px | 500 | Positioning or machine-type explanation |
| Body | 16 / 26 px | 16 / 26 px | 400 | Default reading text |
| Compact body | 14 / 22 px | 14 / 22 px | 400 | Cards, filters, utility content |
| Technical label | 12 / 18 px | 12 / 18 px | 600 | Uppercase permitted; letter spacing 0.08em |
| Specification value | 16 / 24 px | 16 / 24 px | 600 | Tabular numerals; unit remains with value |
| Price | 26 / 34 px | 30 / 38 px | 700 | Currency and price remain on one line when practical |
| Button label | 15 / 20 px | 15 / 20 px | 600 | Sentence case |
| Badge label | 12 / 16 px | 12 / 16 px | 600 | Short labels only |
| Caption | 13 / 20 px | 13 / 20 px | 400 | Supplemental information, not legal fine print |
| Support note | 14 / 22 px | 14 / 22 px | 500 | Must not look like an error unless it is one |

## Hierarchy rules

1. Heading level follows document structure, not desired visual size.
2. Do not skip heading levels to obtain a visual style.
3. Do not use a page title inside a card, accordion, filter, or modal.
4. Dense technical panels use subsection headings or technical labels.
5. Product cards use compact body and a product-card title, not a page-title style.
6. Uppercase is limited to technical labels, short badges, and brief navigation cues.
7. Paragraphs should normally remain below 75 characters per line.
8. Long policy and educational text uses a maximum width of 720 px.
9. Do not reduce policy or warranty text below the default body size.
10. Do not use all-capital paragraphs.

## Product naming and wrapping

- Preserve approved model punctuation such as `EM-1`.
- Use `in`, `mm`, `V`, `Hz`, `rpm`, `hp`, `kW`, `lb`, and `kg` according to
  `docs/brand/rhino-product-naming-and-terminology.md`.
- Product titles may wrap to multiple lines.
- Product titles must not be truncated on product pages.
- Product cards may use a controlled line limit only when the complete title
  remains available to assistive technology and through the product link.
- Do not hyphenate product names automatically.
- Keep a number and its unit together where practical.
- Technical tables may wrap labels but should keep short values intact.
- Never reduce font size merely to force a long title onto one line.

## CTA typography

Button labels use sentence case and start with a verb:

- Add to cart
- View specifications
- Find compatible parts
- Download manual
- Request freight information
- Contact support

Avoid:

- CLICK HERE
- LEARN MORE when the destination can be named
- SHOP NOW on technical support surfaces
- Decorative punctuation
- More than one clause

## Theme-setting implication

During B-026, set both the body and heading font selections to Shopify-hosted
DM Sans values available in the theme editor.

The exact font-picker handles must be confirmed in the preview theme before
editing `config/settings_data.json`.

## Accessibility and QA

Test:

- 360, 390, 768, 1440, and 1920 px widths
- 200% browser zoom
- Long machine names
- Long replacement-part names
- Prices and sale prices
- Specification tables
- Quick-order rows
- Filters
- Contact and account forms
- Policies and warranty content

The system fails review if text overlaps, clips, requires horizontal page
scrolling, or becomes unreadably small.