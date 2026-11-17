'use strict';

const fs = require('node:fs');

const PATHS = Object.freeze({
  card: 'snippets/card-product.liquid',
  mediaAuthority: 'snippets/rhino-product-card-media-eligibility.liquid',
  canonicalMediaAuthority: 'snippets/rhino-product-media-eligibility.liquid',
  cardCss: 'assets/component-card.css',
  quote: 'snippets/rhino-quote-checkout.liquid',
  quoteJs: 'assets/rhino-quote-mode.js',
  facetsCss: 'assets/component-facets.css',
  menuDrawerCss: 'assets/component-menu-drawer.css',
  settings: 'config/settings_data.json',
});

function readSources(read = (file) => fs.readFileSync(file, 'utf8')) {
  return Object.fromEntries(Object.entries(PATHS).map(([key, file]) => [key, read(file)]));
}

function cartAcceptanceFor(cartType) {
  if (!['notification', 'drawer', 'page'].includes(cartType)) throw new Error(`Unsupported cart_type: ${cartType}`);
  return {
    cartType,
    notificationRequired: cartType === 'notification',
    drawerRequired: cartType === 'drawer',
    cartPageRequired: true,
  };
}

function validateSources(sources = readSources()) {
  const errors = [];
  const requireSource = (condition, message) => { if (!condition) errors.push(message); };

  requireSource(sources.card.includes("render 'rhino-product-card-media-eligibility', product: card_product, media: card_product.featured_media"),
    'Machine card media must reuse the exact F media authority gate.');
  requireSource(sources.card.includes("rhino_consumer_route == 'machine'"), 'Machine cards must have an explicit governed path.');
  requireSource(sources.card.includes("rhino_card_media_eligibility == 'eligible'"), 'Only eligible machine featured media may render.');
  requireSource(sources.card.includes('rhino_card_media_fallback = true'), 'Ineligible or missing machine media must receive a neutral fallback.');
  requireSource(sources.card.includes('rhino-card-media-fallback') && sources.card.includes("'rhino-icon-machine.svg' | inline_asset_content"),
    'The neutral machine fallback must be visible and use the governed machine icon.');
  requireSource(sources.card.includes('role="img" aria-label="{{ card_product.title | escape }}"'),
    'The neutral fallback must expose the Product title as its accessible image name.');
  requireSource(sources.card.includes('rhino_card_media.alt | default: card_product.title | escape'),
    'Approved and legacy media must have a nonempty accessible alt fallback.');
  requireSource(sources.card.includes('rhino_legacy_content and card_product.media[1] != null and show_secondary_image'),
    'Machine cards must not bypass authority through an unapproved secondary image.');
  requireSource(!/compatib|\bfits?\b|works with|designed for/i.test(sources.card),
    'Card presentation must not invent compatibility or fit claims.');
  const authorityPredicates = (source) => source.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes('rhino_media_source ==') || line.includes("rhino_product_id == '"));
  requireSource(JSON.stringify(authorityPredicates(sources.mediaAuthority)) === JSON.stringify(authorityPredicates(sources.canonicalMediaAuthority)),
    'Collection-card media grants must exactly match the protected Product-page grant predicates.');
  requireSource((sources.mediaAuthority.match(/}eligible/g) || []).length === 6,
    'Collection-card media authority must contain exactly six grants.');
  requireSource(/\.rhino-card-media-fallback \.media\s*\{[\s\S]*display:\s*flex/.test(sources.cardCss),
    'Neutral fallback styling must create a visible media region.');

  requireSource(!sources.quote.includes('aria-controls='), 'Native fulfillment radios cannot use aria-controls.');
  requireSource(!/setAttribute\(['"]aria-expanded['"]/.test(sources.quoteJs),
    'Native fulfillment radios cannot receive aria-expanded.');
  requireSource((sources.quote.match(/name="fulfillment_choice"/g) || []).length === 2,
    'Shipping and pickup must remain one native radio group.');
  requireSource((sources.quote.match(/data-rhino-fulfillment-target=/g) || []).length === 2,
    'Each fulfillment radio must identify its panel with a data target.');
  requireSource((sources.quote.match(/data-rhino-fulfillment-panel=/g) || []).length === 2,
    'Shipping and pickup panels must each expose a stable data relationship.');
  requireSource(sources.quoteJs.includes('panel.hidden = panel.dataset.rhinoFulfillmentPanel !== selected'),
    'Fulfillment JavaScript must show only the selected panel.');
  requireSource(!/role="(?:tab|switch|button)"/.test(sources.quote), 'Native radios must not receive an arbitrary ARIA role.');

  requireSource(sources.facetsCss.includes('grid-template-columns: minmax(0, 1fr) minmax(0, max-content) minmax(0, max-content)'),
    'Desktop facets must use shrink-safe grid tracks.');
  requireSource(sources.facetsCss.includes('@media screen and (min-width: 990px) and (max-width: 1199px)'),
    'Intermediate desktop facets must have an enlarged-text wrapping transition.');
  requireSource(sources.facetsCss.includes('grid-column: 1 / -1') && sources.facetsCss.includes('overflow-wrap: anywhere'),
    'Product counts must wrap on their own shrink-safe row.');
  requireSource(sources.facetsCss.includes('@media screen and (min-width: 750px) and (max-width: 989px)'),
    'Tablet facets must transition to the existing mobile disclosure.');
  requireSource(sources.menuDrawerCss.includes('width: min(40rem, 100vw)'),
    'The header offcanvas drawer must be constrained to the viewport.');
  requireSource(!/html\s*,?\s*body[^}]*overflow-x\s*:\s*hidden/is.test(sources.facetsCss + '\n' + sources.menuDrawerCss),
    'The repair cannot hide global horizontal overflow.');

  let settings;
  try { settings = JSON.parse(sources.settings); } catch (error) { errors.push(`settings_data.json is invalid: ${error.message}`); }
  if (settings) {
    const acceptance = cartAcceptanceFor(settings.current?.cart_type);
    requireSource(acceptance.notificationRequired, 'The Phase C corrective candidate must retain notification cart mode.');
    requireSource(!acceptance.drawerRequired, 'Notification mode cannot claim live cart-drawer coverage.');
    requireSource(acceptance.cartPageRequired, 'Cart-page synchronization remains required in every cart mode.');
  }

  return errors;
}

module.exports = { PATHS, readSources, validateSources, cartAcceptanceFor };
