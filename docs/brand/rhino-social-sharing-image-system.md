# Rhino Social Sharing and Open Graph Image System

**PBI:** B-017  
**Status:** Approved foundation with automated validation  
**Owner:** Brand, Content, Media, SEO, Engineering, and Shopify Admin

## Default image

The default Rhino social image is 1200 by 630 pixels.

It uses:

- Carbon background
- Approved horizontal dark Rhino logo
- One restrained Action Red rule
- No product specification
- No warranty, certification, patent, supplier, exclusivity, freight, or
  performance claim
- No The Gem Shop or Silica-Gem mark unless a later approved page context
  specifically requires one

## Page rules

### Homepage

Use the default Rhino social image until an approved homepage campaign image is
created.

### Collections

Use an approved collection image when:

- It represents the complete collection
- Usage rights are confirmed
- It does not imply that pictured accessories are included
- It remains legible when cropped by social platforms

Otherwise use the default image.

### Products

Use the product's approved primary media.

Do not add text to the product image for Open Graph purposes.

The selected image must:

- Show the actual product
- Avoid implying that optional accessories are included
- Meet the product photography rules
- Have meaningful image alt metadata
- Be large enough for social preview use

### Articles and education

Use an approved editorial image related to the article subject.

Do not use a machine image for an unrelated article merely because it is the
most visually impressive asset.

### Support and policies

Use the default Rhino social image.

Do not use policy text, warranty duration, phone numbers, or legal language
inside the image.

## Safe area

Keep essential logo content at least 96 pixels from every image edge.

Do not depend on the outer 10 percent of the image remaining visible.

## Text

The default image contains no additional promotional text.

A future campaign image may contain a short title when:

- It remains readable at mobile preview size
- It is no more than two lines
- It duplicates no unsupported claim
- The page title remains available in metadata
- A text-free fallback exists

## Metadata

Every indexable public page should provide:

- canonical URL
- `og:title`
- `og:description`
- `og:type`
- `og:url`
- `og:image`
- `og:image:alt`
- `twitter:card`
- `twitter:title`
- `twitter:description`
- `twitter:image`
- `twitter:image:alt`

Preview parameters must never appear in canonical or Open Graph URLs.

## Source ownership

- Default brand image: repository asset
- Product image: Shopify product media
- Collection image: Shopify collection media
- Article image: Shopify article media or approved Files asset
- Support/policy fallback: repository default image

## Validation

Run:

- `npm run validate:brand-assets`
- `npm run test:social-metadata`

Use social platform validators during release QA because cached previews cannot
be completely tested from the repository.