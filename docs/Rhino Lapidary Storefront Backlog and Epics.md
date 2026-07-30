# Rhino Lapidary Shopify Storefront Discovery and Long-Term PBI Backlog

## Objective

Perform a comprehensive discovery audit of this Shopify theme repository and prepare a long-term, GitHub-ready product backlog for transforming the stock Shopify **Trade** theme into a distinctive, trustworthy, high-performing storefront for **Rhino Lapidary** at `rhinolapidary.com`.

This is an **investigation and planning task only**.

Do not begin implementing changes unless a very small diagnostic change is absolutely necessary to understand the repository. Do not broadly refactor, install packages, remove applications, or modify production Shopify data.

The primary deliverable is an extensive backlog of actionable Product Backlog Items, or PBIs, that can later be transferred into GitHub issues.

The backlog may include:

* Theme repository changes
* Liquid, CSS, JavaScript, JSON, and asset changes
* New reusable Shopify sections and blocks
* Shopify theme-editor configuration
* Shopify admin configuration
* Product, collection, navigation, metadata, and content changes
* Search, filtering, merchandising, and product-discovery work
* App installation, removal, replacement, or configuration
* SEO, accessibility, analytics, and performance improvements
* Photography, video, illustration, iconography, and copywriting requirements
* Customer support, warranty, financing, freight, and post-purchase workflows
* Longer-term experimental or differentiating features

Prefer Shopify-native functionality and free applications whenever practical. Treat every additional app as a maintenance, performance, privacy, and cost liability that must be justified.

---

# 1. Business and Brand Context

Rhino Lapidary sells specialized lapidary machinery, tools, replacement parts, accessories, and consumables.

The storefront must support several distinct purchase journeys:

1. A new lapidary enthusiast trying to understand what equipment they need
2. An experienced lapidary comparing machines and specifications
3. A current Rhino owner finding compatible consumables or replacement parts
4. A professional workshop evaluating expensive equipment
5. A customer who needs reassurance regarding freight, warranties, support, repairs, and parts availability
6. A customer researching techniques before they are ready to buy
7. A returning buyer who wants to reorder known items quickly
8. A mobile visitor arriving from YouTube, social media, a QR code, or a trade show
9. Potential wholesale, dealer, school, club, or institutional customers
10. International visitors who may need to understand availability, voltage, shipping, and regional support

The site should not feel like a lightly recolored Shopify template.

It should communicate:

* Ruggedness
* Mechanical reliability
* Precision
* Innovation
* Workshop practicality
* Technical expertise
* Long-term support
* Geological and lapidary craftsmanship
* Confidence in purchasing expensive equipment
* A coherent Rhino Lapidary product ecosystem

Potential visual concepts to investigate—not blindly implement—include:

* Rhino armor, strength, and durability
* Geological strata and cut-stone textures
* The progression from rough stone to polished cabochon
* Industrial workshop materials
* Technical drawings and machine diagrams
* Water flow, rotational motion, cutting, grinding, and polishing
* Contrasts between rugged machinery and polished stone
* Strong silhouettes and restrained technical iconography
* A visual system that feels engineered rather than generic, rustic, or overly luxurious

Use existing repository assets and current Rhino Lapidary materials as evidence. Clearly distinguish existing brand decisions from ideas you are proposing.

---

# 2. Sources to Investigate

Inspect as many of the following as access permits:

## Repository

* Theme name, version, and upstream Trade version
* Git history and existing branches
* README files and internal documentation
* `layout/`
* `templates/`
* `sections/`
* `blocks/`, if present
* `snippets/`
* `assets/`
* `config/settings_schema.json`
* `config/settings_data.json`
* `locales/`
* `customers/`
* App blocks and app embeds
* Custom Liquid
* Custom JavaScript
* Custom CSS
* Third-party scripts
* Analytics and marketing tags
* Product-card implementations
* Search and filtering implementations
* Cart drawer and cart page
* Header, navigation, and mega-menu behavior
* Footer
* Product recommendations
* Quick-order or bulk-order functionality
* Existing documentation and development tooling
* Linting, formatting, Shopify CLI, Theme Check, and CI configuration
* Any local or generated files that should not be version-controlled

## Live and Reference Sites

Where internet access is available, compare:

* `rhinolapidary.com`
* Current Rhino Lapidary content hosted by The Gem Shop
* Current Rhino product listings and product media
* Rhino Lapidary videos or educational material
* The latest official Shopify Trade theme
* Relevant competitors in lapidary equipment
* Relevant industrial-equipment and workshop-tool ecommerce sites
* Strong ecommerce examples outside the lapidary industry when their patterns apply

Do not recommend copying a competitor’s branding or proprietary design. Use competitors to identify customer expectations, gaps, and differentiating opportunities.

## Shopify Admin

The repository may not reveal all Shopify configuration. Produce an explicit checklist of admin areas that a human must inspect, including:

* Products
* Variants
* Categories
* Collections
* Product types
* Vendors
* Tags
* Metafields
* Metaobjects
* Navigation
* Markets
* Domains
* Customer accounts
* Checkout
* Shipping profiles
* Package settings
* Local pickup
* Taxes
* Policies
* Notifications
* Discounts
* Gift cards
* Files
* Blog posts
* Search & Discovery
* App embeds
* Installed apps
* Pixels and customer events
* Analytics
* Consent and privacy settings
* Google and social sales channels
* Shop channel
* Email configuration
* Forms
* Automations
* Redirects
* Users and permissions

When you cannot access an admin setting, create a discovery PBI or verification task rather than silently assuming its state.

---

# 3. Begin With a Repository Findings Report

Before presenting the backlog, provide a concise findings report.

Include:

## Repository Summary

* Detected theme and version
* Apparent age of the repository
* Major customizations already present
* Areas that still appear close to stock Trade
* Files or systems carrying most of the customization
* Existing app integrations
* Existing design tokens
* Existing reusable components
* Existing technical debt
* Upgrade risks
* Missing documentation
* Missing tooling or safeguards

## Current Experience Summary

Assess the apparent customer experience for:

* Homepage
* Primary navigation
* Search
* Collection browsing
* Product comparison
* Product pages
* Machine pages
* Accessory and consumable pages
* Cart
* Checkout transition
* Mobile
* Account experience
* Support and contact
* Warranty and returns
* Educational content
* Post-purchase guidance

## Brand Summary

Identify:

* Existing logo treatments
* Existing colors
* Existing typography
* Existing iconography
* Existing photography style
* Existing voice and terminology
* Inconsistencies
* Generic Trade-theme remnants
* Areas where Rhino Lapidary and The Gem Shop identities may be unclear
* Missing brand assets or decisions

## Risk Summary

Flag issues such as:

* Accessibility barriers
* Poor mobile usability
* Slow-loading assets
* App-generated code
* Duplicate scripts
* Theme-upgrade conflicts
* Fragile DOM-dependent JavaScript
* Hardcoded content
* Missing schema settings
* Missing fallbacks
* Broken links
* Unclear product compatibility
* Missing legal or policy information
* Misleading availability or shipping information
* Unverified analytics
* SEO duplication
* Inconsistent product data

Reference exact files, components, templates, settings, or URLs whenever possible.

---

# 4. Create a GitHub-Ready Backlog

Create an extensive backlog covering immediate fixes through long-term experiments.

Aim for broad coverage and substantial depth. A backlog of **80–150 well-supported PBIs** is appropriate if the findings justify it. Do not inflate the count by splitting trivial edits into meaningless issues.

Group PBIs into epics. Suggested epics follow, but add, remove, merge, or rename them according to what you discover.

---

## Epic A — Repository Health and Theme Architecture

Investigate opportunities such as:

* Documenting the development workflow
* Recording the Trade base version
* Establishing an upstream-update strategy
* Creating an inventory of custom files
* Separating Rhino customizations from upstream theme code
* Introducing consistent CSS architecture
* Establishing design tokens
* Consolidating duplicate CSS
* Consolidating duplicate JavaScript
* Removing dead assets
* Removing stale snippets
* Replacing hardcoded strings with settings or locale entries
* Adding Theme Check
* Adding linting and formatting
* Adding CI checks
* Adding visual-regression testing
* Adding storefront smoke tests
* Creating development, preview, and production workflows
* Protecting `settings_data.json` from accidental destructive changes
* Documenting app dependencies
* Documenting Shopify admin dependencies
* Establishing browser-support expectations
* Establishing a performance budget
* Establishing an accessibility baseline
* Establishing theme-release notes
* Auditing security and third-party scripts

---

## Epic B — Rhino Brand Foundation

Investigate:

* Brand positioning
* Brand attributes
* Color system
* Typography system
* Heading hierarchy
* Spacing system
* Border and radius rules
* Shadow and elevation rules
* Button hierarchy
* Link styles
* Form styles
* Icon system
* Product badge system
* Machine-family color coding
* Diagram styling
* Photography art direction
* Video-thumbnail styling
* Background textures
* Geological pattern treatments
* Technical blueprint treatments
* Rhino motif usage
* Logo variants
* Favicon and app icons
* Social-sharing images
* Loading states
* Empty states
* Error states
* Motion and animation rules
* Brand voice
* Product naming conventions
* Technical terminology rules
* Trademark and legal attribution

Ensure that proposed styling remains readable, accessible, maintainable, and appropriate for expensive industrial equipment.

Avoid decorative choices that make specifications harder to read.

---

## Epic C — Global Header, Navigation, and Footer

Investigate:

* Header hierarchy
* Sticky-header behavior
* Mobile header
* Announcement bar
* Utility links
* Search prominence
* Account and cart icons
* Mega-menu structure
* Product-family navigation
* “Shop by task” navigation
* “Shop by machine” navigation
* “Parts by machine” navigation
* Support navigation
* Learning-center navigation
* Dealer or wholesale navigation
* Breadcrumbs
* Footer information architecture
* Contact details
* Support hours
* Warranty links
* Shipping links
* Financing links
* Manuals and downloads
* Social channels
* Newsletter signup
* Country and currency selector
* Legal links
* Payment indicators
* Trust messaging
* Accessibility statement
* Sitemap discoverability

Evaluate whether a first-time customer can understand Rhino’s machine ecosystem without already knowing product names.

---

## Epic D — Homepage Transformation

Investigate modules and content such as:

* Distinctive hero presentation
* Primary brand proposition
* Primary customer-path choices
* Shop machines
* Shop accessories
* Find parts for your machine
* Machine-family overview
* Flagship-machine feature
* Product comparison teaser
* Workshop or process imagery
* Rough-to-polished visual story
* “Why Rhino” value proposition
* Patented or differentiating features
* Reliability and support messaging
* Customer testimonials
* Reviews
* Educational content
* Latest videos
* Buying guides
* Popular replacement parts
* Consumables reorder section
* Trade-show or demonstration schedule
* Dealer or showroom information
* Newsletter signup
* Support contact
* Warranty reassurance
* Shipping or freight explanation
* Financing or installment explanation
* Recently viewed products
* New products
* Featured bundles
* Frequently purchased together
* Professional, school, club, or workshop applications

Every homepage section should have a clear purpose and measurable customer outcome.

---

## Epic E — Product Information Architecture

Investigate improvements to product data, including:

* Shopify product categories
* Product types
* Vendors
* Collections
* Tags
* Variant names
* SKUs
* Barcodes
* Weights
* Dimensions
* Package dimensions
* Shipping classifications
* Voltage
* Power requirements
* Motor specifications
* Wheel or blade sizes
* Water-system details
* Included components
* Optional components
* Compatible machines
* Replacement parts
* Consumables
* Recommended accessories
* Warranty duration
* Lead times
* Freight requirements
* Assembly requirements
* Skill level
* Intended applications
* Materials supported
* Safety requirements
* Manuals
* Parts diagrams
* Videos
* FAQs
* Country or region restrictions

Recommend when each field should use:

* Standard Shopify fields
* Variants
* Metafields
* Metaobjects
* Product tags
* Collections
* Files
* Theme settings

Prefer structured data over information buried only in product-description HTML.

---

## Epic F — Machine Product Pages

Machine pages require a different experience from ordinary accessory pages.

Investigate PBIs for:

* Machine-specific product templates
* Prominent machine overview
* Clear price and availability
* Preorder or lead-time messaging
* Freight messaging
* Financing messaging
* Quote or consultation request
* “Talk to an expert” action
* Key specifications at a glance
* Full technical specifications
* Dimensions and footprint
* Electrical requirements
* Machine weight
* Shipping weight
* What is included
* What is not included
* Supported operations
* Compatible accessories
* Replacement consumables
* Setup requirements
* Installation guidance
* Maintenance expectations
* Cleaning guidance
* Water-management details
* Noise and workshop considerations
* Safety information
* Warranty
* Service and repair process
* Spare-parts availability
* Downloads
* Manuals
* Exploded diagrams
* Demo videos
* Comparison against other Rhino machines
* Customer projects
* Reviews
* Frequently asked questions
* Sticky purchase or inquiry controls
* Mobile specification tables
* Structured product data
* Quote and financing lead capture
* Delivery inspection checklist
* Post-purchase onboarding

Consider whether some machinery should use “Request a quote,” “Reserve,” “Preorder,” or “Speak with sales” in addition to or instead of a conventional add-to-cart journey.

Do not assume a change to the purchase model is appropriate; create PBIs to investigate it.

---

## Epic G — Parts, Accessories, and Consumables

Investigate:

* Compatibility selectors
* “Fits these machines” display
* “Parts for my machine” landing page
* Machine-to-part relationship metaobjects
* Consumable reorder paths
* Grit selectors
* Diameter selectors
* Arbor or mounting selectors
* Blade-type education
* Wheel-type education
* Comparison tables
* Replacement intervals
* Recommended quantities
* Multipacks
* Bundles
* Frequently bought together
* Subscription feasibility for repeat consumables
* Back-in-stock alerts
* Low-stock indicators
* SKU visibility
* Technical drawings
* Installation instructions
* QR codes on physical machines linking to compatible parts
* QR codes in manuals
* Saved machine ownership in customer accounts
* Quick reorder from account history
* Accessory kits organized by workflow
* Starter kits
* Maintenance kits
* Machine-specific setup kits

---

## Epic H — Product Discovery, Search, Filters, and Collections

Investigate:

* Shopify Search & Discovery configuration
* Search synonyms
* Common misspellings
* Search analytics
* Predictive search
* Search result grouping
* Search result badges
* Empty-search recovery
* Product recommendations
* Complementary products
* Related products
* Filters based on metafields
* Machine compatibility filters
* Product category filters
* Application filters
* Diameter filters
* Grit filters
* Price filters
* Availability filters
* Voltage filters
* Skill-level filters
* Collection descriptions
* Collection landing-page content
* Collection cards
* Featured collection navigation
* Sorting defaults
* Merchandising rules
* Archived and discontinued products
* Replacement-product redirects
* Comparison entry points
* Recently viewed items
* Saved products or wishlist feasibility

Start with native Shopify search and filtering capabilities before recommending a third-party search application.

---

## Epic I — Machine Comparison and Buying Guidance

Investigate differentiating experiences such as:

* Machine comparison table
* Side-by-side specification comparison
* “Which Rhino machine is right for me?” questionnaire
* Task-based machine finder
* Workshop-space selector
* Budget-based recommendations
* Beginner versus professional guidance
* Required-capability selector
* Expandable comparison rows
* Mobile comparison interface
* Printable comparison sheet
* Downloadable buyer’s guide
* Machine-family overview
* “Upgrade from” guidance
* Total setup-cost estimates
* Required versus optional accessories
* Recommended starter configurations
* Consultation request from comparison results
* Persistent compare tray
* Shareable comparison links

Avoid quiz applications unless the same experience cannot reasonably be built as a lightweight theme feature.

---

## Epic J — Cart and Checkout Preparation

Checkout customization may be restricted by the Shopify plan, so distinguish theme-controlled work from checkout-limited work.

Investigate:

* Cart drawer usability
* Full cart-page usability
* Product compatibility warnings
* Required accessory reminders
* Freight-item messaging
* Lead-time messaging
* Preorder messaging
* Split-shipment messaging
* Local pickup
* Cart notes
* Purchase-order instructions
* Tax-exempt customer guidance
* Financing guidance
* Shipping-calculator behavior
* Oversized-item behavior
* Machine and consumable combinations
* Cross-selling
* Recommended maintenance items
* Warranty acknowledgement
* Safety acknowledgement, only if legitimately required
* Discount-code expectations
* Express checkout placement
* Cart error handling
* Inventory validation
* Quantity controls
* Mobile cart behavior
* Abandoned-cart recovery
* Checkout branding
* Order-status messaging
* Post-purchase instructions

Do not create dark patterns, fake urgency, misleading scarcity, or unnecessary interruptions.

---

## Epic K — Freight, Shipping, Pickup, and Delivery

Expensive and heavy machines require unusually clear logistics.

Investigate:

* Shipping-profile structure
* Package definitions
* Product weights
* Oversized-product handling
* Freight-quote workflow
* Residential versus commercial delivery
* Lift-gate requirements
* Delivery appointment expectations
* Local pickup
* Showroom pickup
* Regional restrictions
* Alaska, Hawaii, and territory handling
* International availability
* Damaged-shipment process
* Delivery inspection instructions
* Split fulfillment
* Lead times
* Shipping estimates
* Shipping FAQ
* Freight-specific cart messaging
* Freight-specific product messaging
* Order confirmation messaging
* Tracking communication
* White-glove or setup-service feasibility
* Dealer delivery feasibility

Separate repository work from Shopify-admin configuration and operational-policy decisions.

---

## Epic L — Warranty, Service, Repairs, and Support

Investigate:

* Warranty landing page
* Machine-specific warranties
* Warranty registration
* Serial-number capture
* Proof-of-purchase capture
* Support request forms
* Repair request forms
* Troubleshooting guides
* Error or symptom-based support navigation
* Replacement-parts lookup
* Manuals library
* Exploded diagrams
* Maintenance schedules
* Cleaning guides
* Setup videos
* Support contact methods
* Support-hour communication
* Expected response times
* Ticket categorization
* Shopify Inbox feasibility
* Knowledge-base architecture
* Common-question automation
* Dealer or service-center directory
* Recall and safety-notice capability
* Discontinued-machine support
* Post-purchase onboarding email series
* Customer account access to owned-machine resources

---

## Epic M — Education and Content Strategy

Investigate a structured learning center containing:

* Beginner lapidary guides
* Machine-selection guides
* Saw-selection guides
* Blade-selection guides
* Wheel and disc guides
* Grit progression guides
* Cabbing workflows
* Flat-lap workflows
* Drilling guides
* Carving guides
* Metalsmithing workflows
* Water-management guidance
* Maintenance guidance
* Safety guidance
* Workshop planning
* Video library
* Downloadable manuals
* Downloadable checklists
* Glossary
* FAQ hub
* Troubleshooting hub
* Project galleries
* Customer spotlights
* Material-specific guides
* Blog categories
* Related products within articles
* Related articles within products
* Author attribution
* Updated dates
* Article structured data
* Table of contents
* Searchable resources
* Print-friendly instructions

Recommend a sustainable information model using Shopify blogs, pages, metaobjects, or a combination.

---

## Epic N — Trust, Social Proof, and Conversion Confidence

Investigate:

* Product reviews
* Machine-specific reviews
* Photo and video reviews
* Review-request automation
* Testimonials
* Workshop case studies
* School or club case studies
* Professional customer profiles
* Dealer testimonials
* Customer project gallery
* Verified-purchase labeling
* Review moderation
* Questions and answers
* Warranty reassurance
* Parts-availability reassurance
* Support-team visibility
* Company history
* Manufacturing story
* Patent or innovation explanations
* Transparent availability
* Transparent lead times
* Secure payment messaging
* Financing explanations
* Returns clarity
* Shipping clarity

Evaluate free review applications such as Judge.me or current alternatives, but confirm present pricing, limits, compatibility, data ownership, accessibility, performance, and export capabilities before recommending one.

---

## Epic O — Accounts, Ownership, and Reordering

Investigate:

* New versus legacy customer accounts
* Order history
* Quick reorder
* Saved addresses
* Saved machines
* Machine registration
* Serial numbers
* Saved compatible parts
* Downloadable manuals
* Warranty status
* Support history feasibility
* Wholesale or dealer access
* Tax-exempt workflows
* Purchase-order workflows
* Account-specific product recommendations
* Back-in-stock subscriptions
* Wishlist
* Saved comparisons
* Recently viewed items
* Consumable reorder reminders
* Account onboarding
* Account navigation
* Account accessibility
* Account mobile usability

Clearly mark features that would require a custom app or external system.

---

## Epic P — Forms and Lead Capture

Investigate forms for:

* General contact
* Product questions
* Machine consultation
* Quote request
* Freight quote
* Financing interest
* Dealer inquiry
* Wholesale inquiry
* School or institutional inquiry
* Technical support
* Warranty registration
* Repair request
* Parts identification
* Product notification
* Newsletter signup
* Trade-show follow-up
* Downloadable guide access

Assess Shopify Forms before recommending paid form builders.

Every form PBI should address:

* Required fields
* Spam prevention
* Routing
* Notifications
* Consent
* Data retention
* Error handling
* Success state
* Mobile experience
* Accessibility
* Analytics
* Follow-up ownership

---

## Epic Q — Free and Native Shopify App Strategy

Inventory every installed app or inferred app integration.

For each app, record:

* Purpose
* Current usage
* Theme integration
* App blocks
* App embeds
* Script injection
* Performance impact
* Data accessed
* Recurring cost
* Free-tier limitations
* Export capability
* Lock-in risk
* Accessibility quality
* Maintenance status
* Whether native Shopify now replaces it
* Whether custom theme code could replace it more safely
* Whether it should be retained, reconfigured, replaced, or removed

Evaluate Shopify-native or free options first, including current versions of:

* Shopify Search & Discovery
* Shopify Inbox
* Shopify Forms
* Shopify Bundles
* Shopify Messaging or Shopify Email
* Shopify Translate & Adapt
* Shopify Flow, when available on the store’s plan
* Shopify Collabs, only if relevant
* Shop channel
* Google and YouTube channel
* A reputable free product-review solution
* A lightweight back-in-stock solution, only when native behavior is insufficient
* A privacy and consent solution appropriate to the store’s markets

Verify current pricing and features. Do not assume an application remains free merely because it was free previously.

Do not recommend an app simply because it has a feature. Compare it against:

1. Existing Trade functionality
2. Shopify-native functionality
3. A small theme customization
4. Operational complexity
5. Performance cost
6. Privacy cost
7. Long-term ownership

---

## Epic R — Accessibility

Perform a WCAG-oriented review covering:

* Semantic headings
* Landmarks
* Keyboard navigation
* Focus indicators
* Skip links
* Menus
* Mega menus
* Dialogs
* Cart drawer
* Quick view
* Predictive search
* Forms
* Validation
* Error messaging
* Color contrast
* Text sizing
* Zoom behavior
* Reduced motion
* Touch targets
* Icon labels
* Link purpose
* Alternative text
* Product media
* Video captions
* Transcripts
* Specification tables
* Comparison tables
* Accordions
* Tabs
* Carousels
* Status announcements
* Inventory states
* Price announcements
* Language attributes
* Mobile navigation

Create specific PBIs tied to evidence rather than one generic “make site accessible” issue.

---

## Epic S — Mobile and Responsive Experience

Investigate:

* Header
* Navigation
* Search
* Product grids
* Product cards
* Filters
* Specification tables
* Comparison tools
* Media galleries
* Video
* Sticky purchase actions
* Cart drawer
* Forms
* Accordions
* Tabs
* Footer
* Account pages
* Touch targets
* Landscape mode
* Small phones
* Large tablets
* Slow networks
* Mobile image crops
* Long product names
* Long variant names
* High-price readability
* Freight and lead-time messaging
* Thumb reach
* Mobile performance

Treat mobile as a primary design surface, not a later compression of desktop layouts.

---

## Epic T — Performance and Technical SEO

Investigate:

* Largest Contentful Paint
* Interaction to Next Paint
* Cumulative Layout Shift
* JavaScript bundle size
* Render-blocking assets
* Third-party scripts
* App embeds
* Font loading
* Image formats
* Responsive images
* Lazy loading
* Hero-image loading
* Video loading
* Unused CSS
* Duplicate CSS
* Unused JavaScript
* DOM size
* Animation cost
* Liquid render complexity
* Section rendering
* Predictive-search performance
* Cart performance
* Caching
* Resource hints
* Structured data
* Canonical URLs
* Redirects
* Pagination
* Collection duplication
* Product duplication
* Variant URLs
* Meta titles
* Meta descriptions
* Open Graph data
* Social images
* Breadcrumb schema
* Product schema
* FAQ schema
* Article schema
* Organization schema
* Sitemap coverage
* Robots behavior
* Broken links
* 404 recovery
* Discontinued-product strategy
* Search indexing of filter URLs

Do not recommend performance applications before identifying and addressing repository and app-script causes.

---

## Epic U — Analytics, Experimentation, and Measurement

Investigate:

* Shopify Analytics
* Customer events
* Pixels
* Google Analytics
* Google Ads
* Search Console
* Merchant Center
* YouTube attribution
* Social attribution
* Consent-mode behavior
* Duplicate tracking
* Missing ecommerce events
* Search analytics
* Filter analytics
* Product comparison usage
* Quote submissions
* Consultation requests
* Financing interest
* Manual downloads
* Video engagement
* Machine versus consumable funnels
* Cart abandonment
* Freight-related abandonment
* Internal search exits
* Zero-result searches
* Product recommendation performance
* Account adoption
* Reorder behavior

For meaningful features, define the metric that would indicate success.

Avoid invasive tracking and document consent implications.

---

## Epic V — Internationalization and Markets

Investigate:

* Current markets
* Currency display
* Language support
* Translate & Adapt
* Measurement units
* Voltage differences
* Plug types
* Machine availability by region
* Dealer availability
* Freight restrictions
* Duties and taxes
* Warranty coverage
* Regional support
* Regional content
* Region-specific contact paths
* Market-specific navigation
* Market-specific product exclusions
* Locale files
* Hardcoded strings
* Translation readiness
* Right-to-left risks, if relevant

Do not imply that a product can be shipped or supported in a region without operational confirmation.

---

## Epic W — Wholesale, Dealers, Schools, and Institutions

Even if the first release is primarily direct-to-consumer, investigate future support for:

* Dealer applications
* Dealer locator
* Dealer resources
* Wholesale accounts
* Tax-exempt accounts
* Schools and educational programs
* Rock and mineral clubs
* Shared workshop purchases
* Purchase orders
* Volume quotes
* Multi-unit purchases
* Quote expiry
* Documentation requests
* W-9 or vendor paperwork
* Catalog downloads
* Spec-sheet downloads
* Account approval
* Restricted resources
* Lead assignment
* Sales follow-up
* B2B capabilities available on the current Shopify plan
* Capabilities that require Shopify Plus
* Lower-cost alternatives for non-Plus stores

Do not assume Shopify Plus is available.

---

## Epic X — Post-Purchase Experience

Investigate:

* Order confirmation content
* Freight confirmation
* Delivery preparation
* Shipment tracking
* Inspection instructions
* Setup instructions
* Machine registration
* Warranty registration
* First-use checklist
* Maintenance schedule
* Consumable recommendations
* Reorder reminders
* Review requests
* Customer-project submissions
* Support onboarding
* Educational email series
* Accessory recommendations
* Parts reminders
* Service notices
* Customer account resources
* Packaging inserts
* QR codes
* Serial-number capture
* Customer satisfaction follow-up

---

## Epic Y — Distinctive Long-Term Experiences

Generate ambitious but realistic ideas that could make Rhino Lapidary meaningfully different from a generic equipment storefront.

Consider:

* Interactive machine anatomy
* Clickable exploded diagrams
* Visual parts finder
* Serial-number-based parts lookup
* Machine ownership dashboard
* Workshop planner
* Footprint visualization
* Electrical and water requirement planner
* Machine setup configurator
* Guided accessory builder
* Total-cost-of-setup calculator
* Consumable-life estimator
* Maintenance calendar
* Downloadable maintenance log
* Material-to-tool recommendation engine
* Grit progression planner
* Machine comparison tool
* Interactive process diagrams
* Before-and-after project galleries
* Customer workshop tours
* Expert office-hours booking
* Remote product demonstrations
* Trade-show mode
* QR-assisted support
* Digital manual library
* Product passport
* Repairability and parts longevity information
* Dealer inventory visibility
* Education certifications
* Community project showcases
* Lapidary glossary with contextual product links

Clearly label these as later-stage investments and identify which would require custom applications, external services, or substantial data preparation.

---

# 5. Required Format for Every PBI

Use this exact structure so each PBI can be transferred into GitHub with minimal editing.

---

## `[PBI-ID] Concise action-oriented title`

**Epic:**
**Work area:** Repository / Shopify Admin / Content / Design / App / Operations / Mixed
**Type:** Discovery / Bug / Improvement / Feature / Refactor / Content / Configuration / Research
**Priority:** P0 / P1 / P2 / P3
**Impact:** Low / Medium / High / Transformative
**Effort:** XS / S / M / L / XL
**Confidence:** Low / Medium / High
**Suggested milestone:** Foundation / Launch Readiness / Post-Launch / Long-Term
**Suggested GitHub labels:**

### Problem or opportunity

Explain the customer, business, brand, operational, or technical problem.

### Evidence

Reference exact repository files, theme settings, live pages, observed behavior, product data, or missing information.

When this is an idea rather than an observed defect, label the evidence as a hypothesis.

### Proposed outcome

Describe the desired result without over-prescribing an implementation when discovery is still needed.

### Scope

Include the work that belongs in this PBI.

### Out of scope

Identify adjacent work that should remain separate.

### Acceptance criteria

Use testable checklist items.

* [ ] Criterion
* [ ] Criterion
* [ ] Criterion

### Implementation considerations

Mention likely templates, sections, snippets, assets, settings, metafields, metaobjects, Shopify configuration, applications, or operational decisions.

Do not invent exact filenames when the repository does not support the claim.

### Dependencies

List other PBIs, missing assets, business decisions, product data, Shopify-plan restrictions, or external services.

### Risks and cautions

Include upgrade risk, accessibility, performance, SEO, privacy, operational burden, or app lock-in where applicable.

### Testing notes

Describe the necessary browsers, devices, customer states, products, carts, markets, or admin checks.

### Success measure

State how we would know the change helped.

### Open questions

List unresolved decisions without allowing them to make the PBI unusably vague.

---

# 6. PBI Quality Rules

Every PBI must:

* Have a concrete outcome
* Be understandable outside this audit
* Contain enough context for a future developer or administrator
* State whether it affects code, Shopify admin, content, operations, or an app
* Include testable acceptance criteria
* Avoid promising capabilities restricted to unavailable Shopify plans
* Avoid assuming access to unavailable business data
* Avoid recommending paid apps without a clear cost-benefit reason
* Avoid duplicating work already handled by Shopify or Trade
* Consider accessibility
* Consider mobile
* Consider performance
* Consider maintainability
* Identify content or asset dependencies
* Identify relevant repository evidence when available

Do not create PBIs like:

* “Improve SEO”
* “Make mobile better”
* “Update branding”
* “Add animations”
* “Improve product pages”

Split those broad intentions into independently actionable issues.

Do not over-split tiny related changes merely to increase the issue count.

---

# 7. Prioritization Model

Use the following priorities:

## P0 — Critical

* Broken purchasing behavior
* Severe accessibility blockers
* Incorrect product or shipping information
* Security or privacy concerns
* Major mobile failures
* Analytics duplication that corrupts data
* Code likely to break during launch
* Theme-update incompatibility requiring immediate action

## P1 — Launch Foundation

* Core branding
* Navigation
* Product data
* Machine-page usability
* Shipping clarity
* Warranty and support clarity
* Performance
* Search and filters
* Mobile purchasing
* Essential SEO
* Essential analytics

## P2 — Conversion and Content Growth

* Comparison tools
* Buying guides
* Reviews
* Educational content
* Bundles
* Account refinements
* Lead capture
* Post-purchase improvements
* Advanced merchandising

## P3 — Long-Term Differentiation

* Interactive diagrams
* Machine configurators
* Ownership dashboards
* Workshop planners
* Recommendation engines
* Community features
* Custom application development

Within each priority, order PBIs according to:

1. Customer harm or friction
2. Revenue or lead-generation impact
3. Brand importance
4. Dependency value
5. Effort
6. Risk
7. Confidence

---

# 8. Recommended Implementation Phases

After the PBIs, propose a roadmap.

Use phases similar to:

## Phase 0 — Discovery and Safety

Repository documentation, theme versioning, admin inventory, app inventory, analytics verification, baseline measurements, and launch safeguards.

## Phase 1 — Brand and Structural Foundation

Design tokens, typography, colors, global components, header, footer, navigation, templates, and reusable section architecture.

## Phase 2 — Commerce Essentials

Product data, collections, search, filters, machine product pages, accessory pages, cart, shipping clarity, warranty, and support.

## Phase 3 — Content and Trust

Buying guides, educational content, manuals, videos, reviews, testimonials, and post-purchase resources.

## Phase 4 — Conversion Refinement

Comparison, bundles, related products, consultation flows, lead capture, analytics refinement, and experiments.

## Phase 5 — Differentiation

Interactive machine systems, parts lookup, ownership tools, configurators, workshop planning, and custom applications.

For each phase, identify:

* Goals
* Prerequisites
* Included PBI IDs
* Major risks
* Shopify admin involvement
* Design or content dependencies
* Suggested validation before proceeding

---

# 9. Additional Required Deliverables

Conclude the report with the following.

## A. Top 15 Recommended Starting PBIs

Choose the work that produces the strongest foundation rather than merely the most visually exciting work.

## B. Quick Wins

List low-effort, high-value PBIs that could be completed without destabilizing the theme.

## C. Highest-Risk Areas

Identify the areas most likely to cause regressions, launch failures, app conflicts, or operational problems.

## D. Missing Business Decisions

List decisions Rhino Lapidary must make, such as:

* Brand direction
* Support ownership
* Warranty policy
* Freight policy
* Financing
* International availability
* Dealer strategy
* Product compatibility data
* Machine lead times
* Photography
* Manuals
* Video production
* Review migration
* Customer account strategy

## E. Missing Assets and Content

Create an asset checklist covering:

* Logos
* Font licenses
* Photography
* Workshop imagery
* Product images
* Diagrams
* Specification sheets
* Manuals
* Videos
* Captions
* Testimonials
* Warranty text
* Shipping text
* Support text
* Company story
* Staff or expert profiles
* Social-sharing images
* Email assets

## F. Shopify Admin Audit Checklist

Provide a checklist that an administrator can complete without needing to understand the theme code.

## G. App Recommendation Matrix

Use this format:

| Need | Current solution | Native Shopify option | Free app option | Paid option only if justified | Recommendation | Migration risk |
| ---- | ---------------- | --------------------- | --------------- | ----------------------------- | -------------- | -------------- |

Do not recommend installation until the current solution and native capabilities have been evaluated.

## H. Proposed GitHub Labels

Recommend a concise label taxonomy, such as:

* `area: theme`
* `area: shopify-admin`
* `area: product-data`
* `area: content`
* `area: app`
* `area: analytics`
* `area: accessibility`
* `area: performance`
* `area: seo`
* `area: mobile`
* `area: support`
* `area: shipping`
* `area: branding`
* `type: discovery`
* `type: bug`
* `type: feature`
* `type: refactor`
* `priority: p0`
* `priority: p1`
* `priority: p2`
* `priority: p3`
* `effort: xs`
* `effort: s`
* `effort: m`
* `effort: l`
* `effort: xl`
* `blocked`
* `needs-content`
* `needs-design`
* `needs-admin`
* `needs-decision`

Remove redundant labels and recommend a final controlled set.

## I. Suggested GitHub Epics or Milestones

Map the backlog into a manageable hierarchy suitable for a long-running repository project.

## J. Questions That Must Be Answered Before Implementation

Only include questions whose answers materially alter architecture, scope, product data, or operations.

Do not stop the audit because those questions are unresolved. Make the best evidence-based recommendations available and clearly mark assumptions.

---

# 10. Final Instructions

* Be exhaustive but not repetitive.
* Prefer evidence over generic ecommerce advice.
* Reference exact files and templates.
* Identify what is inherited from Trade and what appears Rhino-specific.
* Verify the current Trade version rather than assuming it.
* Identify recent upstream changes that could affect this repository.
* Do not assume all Trade features work correctly merely because the theme advertises them.
* Test or inspect inventory handling, quick order, dynamic buttons, comparison pricing, app blocks, and mobile behavior.
* Preserve Shopify theme-editor usability for non-developers.
* Favor reusable sections, blocks, metafields, and metaobjects over hardcoded page layouts.
* Prefer progressive enhancement.
* Avoid app bloat.
* Avoid unnecessary JavaScript.
* Avoid inaccessible custom controls.
* Avoid fragile selectors tied to generated markup.
* Avoid placing operational content exclusively in source code.
* Avoid creating a visual system that obscures technical information.
* Clearly flag recommendations that require Shopify Plus.
* Clearly flag recommendations that require custom app development.
* Clearly flag recommendations that require new operational processes.
* Clearly flag recommendations that require professional design, photography, video, or copywriting.
* Do not implement the PBIs during this task.

Return the completed audit as Markdown that can be saved directly into a repository document such as:

`docs/rhino-storefront-discovery-and-backlog.md`
