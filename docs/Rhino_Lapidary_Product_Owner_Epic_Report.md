# Rhino Lapidary Storefront Epic Portfolio Report

**Audience:** Product Owner, business stakeholders, design, engineering, content, and operations  
**Source:** *Rhino Lapidary Shopify Storefront Discovery and Long-Term PBI Backlog*  
**Purpose:** Translate the A–Y epic portfolio into customer outcomes, business value, delivery dependencies, and decision points.

## 1. Executive Summary

The backlog describes a program to transform Rhino Lapidary’s storefront from a largely standard Shopify Trade implementation into a specialized equipment commerce platform. The intended experience must serve new hobbyists, experienced lapidaries, current machine owners, professional workshops, institutions, wholesale buyers, and international visitors.

The proposed program is broader than a visual redesign. It combines five product goals:

1. **Create a safe, maintainable storefront platform.** Establish release controls, testing, accessibility, performance standards, analytics governance, and a disciplined app strategy.
2. **Make Rhino’s product ecosystem understandable.** Improve navigation, product data, search, filters, compatibility, comparison, and buying guidance.
3. **Reduce uncertainty around expensive purchases.** Present specifications, freight, lead times, warranties, support, financing, and delivery expectations clearly.
4. **Support the full ownership lifecycle.** Help customers register machines, find parts, reorder consumables, access manuals, request repairs, and maintain equipment.
5. **Build durable differentiation.** Introduce interactive parts lookup, ownership tools, workshop planning, configurators, and other custom experiences only after the foundation is stable.

The epics are an **investigation and planning portfolio**, not an approved commitment to implement every feature. Each candidate capability still requires validation for customer value, operational ownership, Shopify plan constraints, data readiness, cost, privacy, accessibility, and maintenance burden.

## 2. Portfolio Outcomes

A successful delivery should produce the following business outcomes:

- Customers can quickly understand which Rhino machine, accessory, part, or consumable fits their needs.
- High value equipment purchases feel credible, transparent, and supported.
- Machine owners can locate compatible parts and repeat purchases without contacting staff for routine questions.
- Freight, warranty, repair, availability, and regional restrictions are communicated before checkout.
- The storefront is reliable on mobile devices, accessible, measurable, performant, and safe to update.
- Native Shopify capabilities are used before adding paid applications or custom systems.
- Content, support, sales, and fulfillment teams have clear ownership of the experiences the storefront promises.

## 3. Epic Portfolio at a Glance

| Portfolio area | Epics | Product objective |
|---|---|---|
| Platform and governance | A, Q, R, S, T, U, V | Make the storefront safe, accessible, performant, measurable, and sustainable. |
| Brand and global experience | B, C, D | Establish a distinctive Rhino identity and clear entry points into the product ecosystem. |
| Commerce and product discovery | E, F, G, H, I, J, K | Help customers find, evaluate, configure, and purchase the correct products with fewer surprises. |
| Trust, service, and customer lifecycle | L, M, N, O, P, W, X | Build confidence before purchase and continue supporting customers after purchase. |
| Strategic differentiation | Y | Create proprietary experiences that competitors and generic Shopify themes do not provide. |

## 4. Epic Summaries

### Epic A — Repository Health and Theme Architecture

**Objective:** Make the Shopify Trade fork safe to customize, test, release, and update.

**Planned upgrades:** Development documentation, upstream Trade version tracking, customization inventory, CSS and JavaScript architecture, design tokens, cleanup of stale assets, Theme Check, formatting, continuous integration, smoke tests, visual regression tests, environment workflows, protection for theme settings, dependency registers, release notes, browser support, security review, accessibility baselines, and performance budgets.

**Product Owner value:** This epic reduces launch risk and prevents future feature work from becoming fragile or expensive. It is the prerequisite for reliable delivery across the entire portfolio.

**Key dependency:** Must precede major visual or commerce customization.

### Epic B — Rhino Brand Foundation

**Objective:** Create a coherent visual and verbal identity suited to precision machinery and lapidary craftsmanship.

**Planned upgrades:** Color, typography, hierarchy, spacing, buttons, links, forms, iconography, product badges, machine family coding, diagrams, photography, video treatments, logo variants, motion, loading and error states, terminology, naming conventions, and legal attribution.

**Product Owner value:** A clear brand system raises perceived credibility and prevents inconsistent design decisions across pages and teams.

**Key decision:** Brand direction must remain readable and technical. Decorative treatments should never obscure specifications.

### Epic C — Global Header, Navigation, and Footer

**Objective:** Help first time and returning visitors understand Rhino’s machine ecosystem from every page.

**Planned upgrades:** Header hierarchy, mobile navigation, announcement bar, prominent search, mega menus, task and machine navigation, parts by machine, support and learning links, breadcrumbs, footer architecture, contact details, warranty, shipping, financing, manuals, social links, newsletter, legal content, payment indicators, accessibility statement, and sitemap access.

**Product Owner value:** Better global navigation should reduce abandonment, improve discovery, and lower the knowledge required to shop Rhino products.

**Key dependency:** Requires approved product taxonomy and navigation architecture from Epic E.

### Epic D — Homepage Transformation

**Objective:** Replace generic storefront messaging with a purposeful Rhino introduction and clear customer paths.

**Planned upgrades:** Distinctive hero content, primary value proposition, pathways to machines, accessories, and parts, machine family overview, flagship product presentation, comparison teaser, process imagery, “Why Rhino,” support and reliability messaging, testimonials, education, videos, buying guides, replacement parts, consumables, demonstrations, financing, freight, bundles, applications, and support contact.

**Product Owner value:** The homepage becomes a guided entry point instead of a promotional collage. Every module should have a defined customer action and measurable purpose.

**Key dependency:** Relies on brand assets, product structure, photography, and approved commercial messages.

### Epic E — Product Information Architecture

**Objective:** Build the structured product data needed for trustworthy merchandising, filtering, compatibility, support, and automation.

**Planned upgrades:** Standardized categories, types, vendors, collections, variants, SKUs, weights, dimensions, voltage, motor details, wheel and blade sizes, included components, compatibility, replacement parts, consumables, accessories, warranties, lead times, freight, assembly, skill level, applications, safety, manuals, videos, FAQs, and regional restrictions. The epic also determines which information belongs in Shopify fields, variants, metafields, metaobjects, tags, collections, files, or theme settings.

**Product Owner value:** This is the central data foundation for machine pages, filters, comparison, parts lookup, freight messaging, support, accounts, and later custom tools.

**Key dependency:** Requires operationally accurate product, compatibility, shipping, and warranty data.

### Epic F — Machine Product Pages

**Objective:** Give high value machines a sales and support experience distinct from ordinary accessories.

**Planned upgrades:** Machine templates, overview and availability, lead times, freight, financing, quotes, expert consultation, key and detailed specifications, dimensions, electrical requirements, weights, included items, operations, accessories, consumables, setup, installation, maintenance, water management, workshop considerations, safety, warranty, repair, parts, manuals, diagrams, videos, comparison, reviews, FAQs, sticky actions, delivery inspection, and onboarding.

**Product Owner value:** These pages should answer the questions that block expensive equipment purchases and generate qualified sales conversations when conventional checkout is not appropriate.

**Key decision:** Each machine may require a different purchase model: direct purchase, reservation, preorder, quote, or sales consultation.

### Epic G — Parts, Accessories, and Consumables

**Objective:** Make compatibility and repeat purchasing simple for existing machine owners.

**Planned upgrades:** Compatibility selectors, “fits these machines,” parts by machine, machine to part relationships, grit, diameter, mounting, blade and wheel education, replacement intervals, multipacks, bundles, recommended quantities, back in stock alerts, SKU visibility, drawings, installation instructions, QR links, ownership records, quick reorder, starter kits, maintenance kits, and workflow kits.

**Product Owner value:** Reduces incorrect purchases, support contacts, and reorder friction while increasing accessory and consumable revenue.

**Key dependency:** Requires reliable machine compatibility and replacement interval data from Epic E.

### Epic H — Product Discovery, Search, Filters, and Collections

**Objective:** Help customers find relevant products even when they do not know Rhino product names.

**Planned upgrades:** Shopify Search & Discovery configuration, synonyms, misspellings, predictive search, search analytics, grouped results, badges, zero result recovery, recommendations, metafield filters, compatibility, application, diameter, grit, voltage, skill, price and availability filters, richer collection pages, merchandising rules, discontinued products, replacements, comparison entry points, recently viewed products, and wishlist feasibility.

**Product Owner value:** Improves product findability and reduces exits from search and collection pages.

**Key principle:** Start with native Shopify search and filtering before considering a third party service.

### Epic I — Machine Comparison and Buying Guidance

**Objective:** Help customers choose the correct machine and configuration with confidence.

**Planned upgrades:** Comparison tables, specification comparison, machine finder, task, budget, workshop, skill and capability selectors, mobile comparison, printable sheets, buyer guides, upgrade guidance, total setup cost, required versus optional accessories, starter configurations, consultation requests, persistent comparison, and shareable results.

**Product Owner value:** Converts uncertain researchers into better informed buyers and sales leads.

**Key dependency:** Requires normalized specifications and commercial rules from Epics E and F.

### Epic J — Cart and Checkout Preparation

**Objective:** Make the precheckout experience accurate, reassuring, and compatible with complex product combinations.

**Planned upgrades:** Cart drawer and page usability, compatibility warnings, accessory reminders, freight and lead time messaging, preorder and split shipment information, pickup, notes, purchase order and tax exempt guidance, financing, shipping calculation, oversized item handling, cross selling, maintenance items, acknowledgements when legitimately required, discounts, express checkout, inventory validation, quantity controls, mobile cart, recovery messaging, checkout branding, and order status content.

**Product Owner value:** Reduces preventable cart abandonment, incorrect orders, and customer surprise.

**Key constraint:** Checkout customization depends on Shopify plan capabilities; theme controlled and checkout controlled work must remain separate.

### Epic K — Freight, Shipping, Pickup, and Delivery

**Objective:** Make heavy equipment logistics understandable before customers commit.

**Planned upgrades:** Shipping profiles, package definitions, weights, oversized products, freight quotes, residential and commercial delivery, lift gates, appointments, pickup, regional restrictions, international availability, damage claims, inspection, split fulfillment, lead times, estimates, FAQs, product and cart messaging, confirmations, tracking, and feasibility of setup or dealer delivery.

**Product Owner value:** Freight clarity protects conversion, margin, customer satisfaction, and support capacity.

**Key decision:** This epic depends heavily on operations policies and Shopify admin configuration, not only theme code.

### Epic L — Warranty, Service, Repairs, and Support

**Objective:** Demonstrate that Rhino supports equipment throughout its usable life.

**Planned upgrades:** Warranty pages and registration, serial and proof of purchase capture, support and repair forms, symptom based troubleshooting, parts lookup, manuals, diagrams, maintenance and cleaning guides, setup videos, support channels and hours, response expectations, ticket categorization, Inbox feasibility, knowledge base, service locations, recalls, discontinued machine support, onboarding emails, and owned machine resources.

**Product Owner value:** Strong service visibility increases purchase confidence and may reduce repetitive support requests.

**Key dependency:** Requires defined warranty, repair, escalation, and response ownership.

### Epic M — Education and Content Strategy

**Objective:** Establish Rhino as a practical learning resource throughout the customer journey.

**Planned upgrades:** Beginner, machine, saw, blade, wheel, grit, workflow, drilling, carving, metalsmithing, water, maintenance, safety and workshop guides; videos; manuals; checklists; glossary; FAQs; troubleshooting; projects; customer stories; material guides; article taxonomy; related products and articles; authorship; update dates; structured data; tables of contents; search; and printable instructions.

**Product Owner value:** Educational content supports acquisition, product choice, successful use, search visibility, and support deflection.

**Key decision:** Content architecture must be sustainable through Shopify blogs, pages, metaobjects, or a deliberate combination.

### Epic N — Trust, Social Proof, and Conversion Confidence

**Objective:** Provide credible evidence that Rhino products and support perform as promised.

**Planned upgrades:** Product and machine reviews, media reviews, review requests, testimonials, institutional and professional case studies, customer projects, verified purchase labels, moderation, questions and answers, warranty and parts reassurance, support visibility, company and manufacturing story, innovation explanations, transparent availability and lead times, payment security, financing, returns, and shipping clarity.

**Product Owner value:** Reduces perceived risk around high value purchases and unfamiliar machinery.

**Key constraint:** Any review application requires current cost, ownership, export, accessibility, privacy, and performance review.

### Epic O — Accounts, Ownership, and Reordering

**Objective:** Turn customer accounts into a useful ownership and repeat purchase workspace.

**Planned upgrades:** Account model selection, order history, quick reorder, addresses, saved machines, registration, serials, compatible parts, manuals, warranty status, support history feasibility, wholesale access, tax exemption, purchase orders, recommendations, stock alerts, wishlist, saved comparisons, recently viewed items, consumable reminders, onboarding, navigation, accessibility, and mobile usability.

**Product Owner value:** Encourages retention and simplifies ownership tasks that would otherwise require staff assistance.

**Key constraint:** Several capabilities may require a custom application or external system.

### Epic P — Forms and Lead Capture

**Objective:** Create reliable pathways for sales, support, freight, financing, and institutional inquiries.

**Planned upgrades:** Contact, product questions, consultations, quotes, freight, financing, dealer, wholesale, school, support, warranty, repair, parts identification, notifications, newsletter, trade show follow up, and gated guide forms. Every form must address fields, spam, routing, notifications, consent, retention, errors, success states, mobile, accessibility, analytics, and follow up ownership.

**Product Owner value:** Converts complex needs into structured, actionable leads and support requests.

**Key principle:** Evaluate Shopify Forms before paid form builders.

### Epic Q — Free and Native Shopify App Strategy

**Objective:** Prevent unnecessary app cost, lock in, performance damage, privacy exposure, and maintenance burden.

**Planned upgrades:** Full app inventory and evaluation across purpose, usage, integration, scripts, data access, cost, limits, export, accessibility, maintenance, and replacement options. Native or free options to evaluate include Search & Discovery, Inbox, Forms, Bundles, Email, Translate & Adapt, Flow, Shop, Google and YouTube, reviews, back in stock, and consent tools.

**Product Owner value:** Maintains a lean storefront and makes each app decision explicit and reversible.

**Key principle:** Compare every app against existing theme capabilities, native Shopify, a small customization, operational burden, performance, privacy, and ownership.

### Epic R — Accessibility

**Objective:** Make core journeys usable by customers with diverse access needs and reduce legal and product risk.

**Planned upgrades:** Semantics, landmarks, keyboard access, focus, skip links, menus, dialogs, cart, search, forms, errors, contrast, text sizing, zoom, reduced motion, touch targets, labels, alt text, captions, tables, accordions, tabs, carousels, status announcements, prices, language, and mobile navigation.

**Product Owner value:** Accessibility improves usability for everyone and must be treated as specific component work, not a final audit checkbox.

**Key dependency:** Acceptance criteria should be embedded across all customer facing epics.

### Epic S — Mobile and Responsive Experience

**Objective:** Treat mobile as a primary shopping and support surface.

**Planned upgrades:** Mobile header, navigation, search, grids, cards, filters, specifications, comparisons, media, sticky actions, cart, forms, footer, accounts, touch targets, landscape, small phones, tablets, slow networks, image crops, long names, price clarity, freight messaging, thumb reach, and performance.

**Product Owner value:** Protects conversion and usability for visitors arriving from video, social channels, QR codes, and trade shows.

**Key principle:** Mobile behavior should be designed alongside desktop behavior, not added after implementation.

### Epic T — Performance and Technical SEO

**Objective:** Keep the storefront fast, discoverable, stable, and indexable as media and applications grow.

**Planned upgrades:** Core Web Vitals, JavaScript and CSS, scripts, app embeds, fonts, images, video, lazy loading, DOM size, animation, Liquid complexity, search and cart performance, structured data, canonicals, redirects, pagination, duplicate content, metadata, social data, schemas, sitemap, robots, broken links, 404s, discontinued products, and filter URL indexing.

**Product Owner value:** Performance and SEO protect acquisition, conversion, usability, and the ability to update the theme safely.

**Key principle:** Diagnose repository and script causes before recommending performance applications.

### Epic U — Analytics, Experimentation, and Measurement

**Objective:** Create trustworthy measurement for customer behavior and feature outcomes.

**Planned upgrades:** Shopify analytics, customer events, pixels, Google platforms, Merchant Center, YouTube and social attribution, consent, duplicate tracking, ecommerce events, search and filter analytics, comparison use, quotes, consultations, financing, downloads, video, machine and consumable funnels, abandonment, freight exits, zero result search, recommendation performance, accounts, and reorders.

**Product Owner value:** Enables prioritization based on evidence rather than opinion and verifies whether major features deliver value.

**Key constraint:** Tracking must avoid duplication and invasive collection, with consent implications documented.

### Epic V — Internationalization and Markets

**Objective:** Ensure regional messaging matches what Rhino can actually sell, ship, power, warranty, and support.

**Planned upgrades:** Markets, currencies, languages, translation, measurement units, voltage, plugs, regional product availability, dealers, freight limits, duties, taxes, warranty, support, regional content and contact paths, navigation, exclusions, locale files, hardcoded strings, and translation readiness.

**Product Owner value:** Prevents misleading international promises while preparing the storefront for controlled expansion.

**Key decision:** Regional availability must be confirmed operationally before being advertised.

### Epic W — Wholesale, Dealers, Schools, and Institutions

**Objective:** Prepare future business purchasing journeys without assuming Shopify Plus.

**Planned upgrades:** Dealer applications and locator, dealer resources, wholesale and tax exempt accounts, schools, clubs, shared workshops, purchase orders, volume quotes, multiunit purchases, quote expiry, vendor documents, catalogs, specification downloads, approvals, restricted resources, lead assignment, sales follow up, plan specific B2B capabilities, and lower cost alternatives.

**Product Owner value:** Opens higher value channels while keeping early implementation proportional to demand and platform constraints.

**Key decision:** Dealer, wholesale, education, and institutional strategies require explicit commercial ownership and qualification rules.

### Epic X — Post-Purchase Experience

**Objective:** Help customers receive, inspect, set up, maintain, and expand their Rhino equipment successfully.

**Planned upgrades:** Confirmation content, freight preparation, tracking, inspection, setup, machine and warranty registration, first use, maintenance, consumables, reorder reminders, reviews, projects, support onboarding, education emails, accessories, service notices, account resources, inserts, QR codes, serial capture, and satisfaction follow up.

**Product Owner value:** Reduces early ownership friction, improves product success, creates repeat purchase opportunities, and reinforces trust.

**Key dependency:** Requires fulfillment, support, content, and lifecycle communication ownership.

### Epic Y — Distinctive Long-Term Experiences

**Objective:** Build proprietary tools that make Rhino meaningfully more useful than a generic equipment storefront.

**Planned upgrades:** Interactive machine anatomy, exploded diagrams, visual and serial based parts finders, ownership dashboard, workshop planner, footprint, electrical and water planning, setup configurator, accessory builder, setup cost calculator, consumable estimator, maintenance calendar and log, material recommendation, grit planning, process diagrams, project galleries, office hours, remote demos, trade show mode, QR support, digital manuals, product passports, repairability information, dealer inventory, certifications, community showcases, and contextual glossary.

**Product Owner value:** These features can create durable differentiation and customer loyalty after the foundational experience is proven.

**Key constraint:** Most candidates require custom applications, external services, extensive structured data, or sustained operational ownership.

## 5. Recommended Delivery Sequence

### Phase 0 — Discovery and Safety

**Primary epics:** A, Q, R, T, U, with early V discovery.  
**Goal:** Establish repository safety, baseline quality, app governance, analytics integrity, accessibility standards, and launch controls.

### Phase 1 — Brand and Structural Foundation

**Primary epics:** B, C, S.  
**Goal:** Establish the design system, navigation model, reusable global components, and mobile patterns.

### Phase 2 — Commerce Essentials

**Primary epics:** E, F, G, H, J, K, L, P, with the core portions of D.  
**Goal:** Make products understandable, purchasable, shippable, and supportable.

### Phase 3 — Content and Trust

**Primary epics:** M, N, X, with account foundations from O.  
**Goal:** Build education, social proof, ownership guidance, and support resources.

### Phase 4 — Conversion Refinement

**Primary epics:** I, advanced D, advanced H, O, W, and U experimentation.  
**Goal:** Improve comparison, recommendations, lead conversion, repeat purchasing, and specialized customer journeys.

### Phase 5 — Differentiation

**Primary epic:** Y.  
**Goal:** Invest in custom tools only after customer demand, data quality, and operational ownership are proven.

## 6. Critical Cross-Epic Dependencies

1. **Epic A enables the entire program.** Major customization should not outpace testing, release controls, and upstream theme governance.
2. **Epic E is the central data dependency.** Product structure and compatibility power machine pages, filters, comparison, parts, freight, support, accounts, post-purchase, and custom tools.
3. **Epic B should precede broad page redesign.** Otherwise visual decisions will be duplicated and inconsistent.
4. **Epics K and L require business policy decisions.** Freight, delivery, warranty, repair, and response promises cannot be solved by theme code alone.
5. **Epic Q governs application choices across the portfolio.** Reviews, forms, search, back in stock, translation, and consent must not create uncontrolled app sprawl.
6. **Epic U must precede serious experimentation.** The team needs reliable events and baselines before judging conversion changes.
7. **Epic R and S are acceptance dimensions for every customer facing epic.** Accessibility and mobile should not be isolated to late cleanup phases.
8. **Epic Y depends on proven demand and mature data.** Custom tools built before compatibility, serial, parts, and specification data are reliable will produce expensive failures.

## 7. Product Decisions Required Before Commitment

The backlog identifies several decisions that materially affect scope and sequencing:

- Final Rhino brand direction and identity relationship with The Gem Shop and Silica-Gem
- Direct purchase, preorder, reservation, quote, and consultation rules by machine
- Freight pricing, lift gate, delivery, pickup, damage, and regional policies
- Warranty coverage, registration, repair process, support hours, and response targets
- Financing availability and customer messaging
- Machine lead times and availability ownership
- Compatibility, replacement part, and consumable interval data ownership
- Customer account model and appetite for custom account capabilities
- Dealer, wholesale, school, club, and institutional strategy
- International markets, voltage, freight, warranty, and support commitments
- Review migration and review application policy
- Photography, video, manuals, diagrams, and technical content production capacity
- Approved analytics, advertising, consent, and attribution model

## 8. Suggested Product Measures

The following measures align with the epic portfolio and should be baselined before major launches:

- Machine page purchase, quote, and consultation conversion
- Search usage, zero result rate, search exit rate, and search assisted conversion
- Filter usage and compatibility filter success
- Collection to product click rate
- Product comparison engagement and assisted conversion
- Cart abandonment, especially for freight products
- Freight question rate and shipping related support contacts
- Incorrect part or compatibility return rate
- Consumable reorder rate and repeat purchase interval
- Manual, specification, and setup guide engagement
- Warranty and machine registration completion
- Support form completion and support deflection from self service content
- Mobile conversion and task completion compared with desktop
- Accessibility defect count and keyboard task completion
- Core Web Vitals and storefront error rate
- App count, script weight, recurring app cost, and duplicate tracking incidents

## 9. Principal Risks

- Treating exploratory epic ideas as approved commitments without validation
- Launching visual work before product data, navigation, and operational policies are ready
- Publishing inaccurate compatibility, lead time, freight, warranty, or regional claims
- Adding applications that duplicate native Shopify features or degrade performance and privacy
- Building custom ownership or parts tools without clean structured data
- Allowing desktop layouts to define mobile behavior by default
- Deferring accessibility, analytics, or performance until after feature completion
- Creating forms and lead channels without assigned response ownership
- Overpromising dealer, international, repair, or support capabilities that operations cannot sustain

## 10. Product Owner Recommendation

Treat this backlog as a **capability portfolio**, not a single release. Approve work in thin, outcome based increments:

1. Secure the platform and define ownership.
2. Normalize product and policy data.
3. Deliver the core machine, parts, discovery, cart, freight, and support journeys.
4. Add content, trust, accounts, and lead conversion once the essentials are stable.
5. Fund custom differentiators only when customer evidence and data readiness justify them.

This sequencing preserves the ambition of the backlog while preventing the program from becoming an unbounded redesign or app accumulation exercise.
