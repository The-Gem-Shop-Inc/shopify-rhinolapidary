'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SNIPPET_PATH = path.join(ROOT, 'snippets', 'meta-tags.liquid');
const snippet = fs.readFileSync(SNIPPET_PATH, 'utf8');

const checks = [
    {
        id: 'homepage-default-image',
        description: 'Pages without selected media fall back to the repository default social image.',
        patterns: [
            /assign\s+default_social_image_url\s*=\s*'rhino-og-default\.jpg'\s*\|\s*asset_url/,
            /if\s+social_image_url\s*==\s*blank[\s\S]*assign\s+social_image_url\s*=\s*default_social_image_url/,
            /assign\s+social_image_width\s*=\s*1200/,
            /assign\s+social_image_height\s*=\s*630/,
        ],
    },
    {
        id: 'collection-configured-image',
        description: 'Collection pages use a configured collection image when one exists.',
        patterns: [
            /request\.page_type\s*==\s*'collection'/,
            /if\s+collection\.image[\s\S]*assign\s+social_image\s*=\s*collection\.image/,
        ],
    },
    {
        id: 'collection-without-image',
        description: 'Collection pages without configured media retain the default fallback path.',
        patterns: [
            /assign\s+social_image\s*=\s*nil/,
            /elsif\s+request\.page_type\s*==\s*'collection'[\s\S]*endif[\s\S]*if\s+social_image_url\s*==\s*blank/,
        ],
    },
    {
        id: 'product-featured-media-alt',
        description: 'Product pages prefer featured media and use product media alt text when available.',
        patterns: [
            /request\.page_type\s*==\s*'product'/,
            /assign\s+product_social_image\s*=\s*product\.featured_media\.preview_image\s*\|\s*default:\s*product\.featured_image/,
            /assign\s+product_social_image_alt\s*=\s*product\.featured_media\.alt\s*\|\s*default:\s*product_social_image\.alt/,
            /assign\s+social_image_alt\s*=\s*product_social_image_alt/,
        ],
    },
    {
        id: 'page-contact-default-image',
        description: 'Plain pages, including contact/support pages, use the default image unless approved media is selected.',
        patterns: [
            /assign\s+social_image\s*=\s*nil/,
            /else[\s\S]*assign\s+social_image_alt\s*=\s*default_social_image_alt[\s\S]*endif[\s\S]*if\s+social_image_url\s*==\s*blank/,
        ],
    },
    {
        id: 'og-twitter-image-parity',
        description: 'Open Graph and Twitter image tags are emitted from the same resolved URL.',
        patterns: [
            /<meta\s+property="og:image"\s+content="{{\s*social_image_url\s*}}">/,
            /<meta\s+name="twitter:image"\s+content="{{\s*social_image_url\s*}}">/,
        ],
    },
    {
        id: 'image-alt-parity',
        description: 'Open Graph and Twitter image alt tags are emitted from the same escaped alt value.',
        patterns: [
            /<meta\s+property="og:image:alt"\s+content="{{\s*social_image_alt\s*\|\s*escape\s*}}">/,
            /<meta\s+name="twitter:image:alt"\s+content="{{\s*social_image_alt\s*\|\s*escape\s*}}">/,
        ],
    },
    {
        id: 'absolute-https-image-urls',
        description: 'Resolved social images are normalized to absolute HTTPS URLs.',
        patterns: [
            /replace_first:\s*'http:\/\/',\s*'https:\/\/'/,
            /social_image_url_prefix\s*==\s*'\/\/'[\s\S]*prepend:\s*'https:'/,
            /social_image_url\s*!=\s*blank[\s\S]*prepend:\s*request\.origin/,
        ],
    },
    {
        id: 'twitter-large-card',
        description: 'Twitter card type remains summary_large_image.',
        patterns: [
            /<meta\s+name="twitter:card"\s+content="summary_large_image">/,
        ],
    },
];

const violations = [];

for (const check of checks) {
    const missing = check.patterns.filter((pattern) => !pattern.test(snippet));

    if (missing.length > 0) {
        violations.push(
            `${check.id}: ${check.description}`,
        );
    }
}

if (/rhino-lapidary\.myshopify\.com|rhinolapidary\.com/i.test(snippet)) {
    violations.push('hardcoded-hostname: snippet must not hardcode a production or preview hostname.');
}

if (violations.length > 0) {
    console.error(
        `Social metadata contract validation failed:\n- ${violations.join('\n- ')}`,
    );
    process.exitCode = 1;
} else {
    console.log(
        `Social metadata contract validation passed: ${checks.length} focused checks.`,
    );
}
