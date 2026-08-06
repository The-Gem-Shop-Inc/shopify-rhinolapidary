'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const {
    gotoUnlocked,
    pathnameFromUrl,
    storefrontUrl,
} = require('../tests/helpers/storefront-auth');

try {
    require('@dotenvx/dotenvx').config({
        quiet: true,
    });
} catch {
    try {
        require('dotenv').config();
    } catch {
        // CI may provide environment variables directly.
    }
}

const ROOT = path.resolve(__dirname, '..');

const INSPECTIONS = [
    {
        page: 'homepage',
        route: '/',
        selector: '.multicolumn__title > .title.h2',
        label: 'homepage multicolumn heading',
    },
    {
        page: 'homepage',
        route: '/',
        selector: '.rich-text__heading',
        label: 'homepage rich-text heading',
    },
    {
        page: 'homepage',
        route: '/',
        selector: '.footer__copyright small',
        label: 'homepage footer copyright',
    },
    {
        page: 'homepage',
        route: '/',
        selector: '.policies a[href*="/policies/"]',
        label: 'homepage footer policy link',
    },
    {
        page: 'collection',
        route: process.env.TEST_COLLECTION_PATH || '/collections/machines',
        selector: '.card__heading a[href*="/products/"]',
        label: 'collection product title',
    },
    {
        page: 'collection',
        route: process.env.TEST_COLLECTION_PATH || '/collections/machines',
        selector: '.price',
        label: 'collection product price',
    },
    {
        page: 'search',
        route: process.env.TEST_SEARCH_PATH || '/search?q=rhino',
        selector: '.card__heading a[href*="/products/"]',
        label: 'search product title',
    },
    {
        page: 'search',
        route: process.env.TEST_SEARCH_PATH || '/search?q=rhino',
        selector: '.price',
        label: 'search product price',
    },
    {
        page: 'product',
        route: process.env.TEST_PRODUCT_PATH || '/products/left-moss-pad',
        selector: 'h1',
        label: 'product-page title',
    },
    {
        page: 'product',
        route: process.env.TEST_PRODUCT_PATH || '/products/left-moss-pad',
        selector: '.related-products .card__heading a[href*="/products/"]',
        label: 'product related-product card',
    },
    {
        page: 'cart',
        route: '/cart',
        selector: '.footer__copyright small',
        label: 'cart footer copyright',
    },
    {
        page: 'contact',
        route: process.env.TEST_CONTACT_PATH || '/pages/contact',
        selector: '.footer__copyright small',
        label: 'contact footer copyright',
    },
];

function inspectionScript(selector, label) {
    return ({ selector: currentSelector, label: currentLabel }) => {
        const element = document.querySelector(currentSelector);

        function classList(node) {
            return node?.classList ? [...node.classList] : [];
        }

        function colorClass(node) {
            return classList(node).find((className) => /^color-/.test(className)) || '';
        }

        function nearestColorAncestor(node) {
            let current = node;

            while (current && current.nodeType === Node.ELEMENT_NODE) {
                if (colorClass(current)) {
                    return current;
                }

                current = current.parentElement;
            }

            return null;
        }

        function effectiveBackground(node) {
            let current = node;

            while (current && current.nodeType === Node.ELEMENT_NODE) {
                const background = getComputedStyle(current).backgroundColor;

                if (
                    background
                    && background !== 'rgba(0, 0, 0, 0)'
                    && background !== 'transparent'
                ) {
                    return background;
                }

                current = current.parentElement;
            }

            return getComputedStyle(document.body).backgroundColor;
        }

        if (!element) {
            return {
                label: currentLabel,
                selector: currentSelector,
                found: false,
            };
        }

        const styles = getComputedStyle(element);
        const colorAncestor = nearestColorAncestor(element);
        const section = element.closest('[id^="shopify-section-"], .shopify-section');
        const card = element.closest('.card, .card-wrapper, .product-card-wrapper');
        const cardColorOwner = card ? nearestColorAncestor(card) : null;
        const sectionColorOwner = (
            section
            && colorAncestor
            && section.contains(colorAncestor)
        )
            ? colorAncestor
            : nearestColorAncestor(section);
        const variableOwner = colorAncestor || section || element;
        const variableStyles = getComputedStyle(variableOwner);

        return {
            label: currentLabel,
            selector: currentSelector,
            found: true,
            text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 140),
            computedColor: styles.color,
            computedBackgroundColor: styles.backgroundColor,
            effectiveBackgroundColor: effectiveBackground(element),
            nearestColorAncestor: colorAncestor
                ? {
                    tagName: colorAncestor.tagName.toLowerCase(),
                    id: colorAncestor.id || '',
                    classList: classList(colorAncestor),
                    colorScheme: colorClass(colorAncestor),
                }
                : null,
            sectionId: section?.id || '',
            ancestorClassList: section ? classList(section) : [],
            colorForeground: variableStyles.getPropertyValue('--color-foreground').trim(),
            colorBackground: variableStyles.getPropertyValue('--color-background').trim(),
            gradientBackground: variableStyles.getPropertyValue('--gradient-background').trim(),
            cardColorScheme: cardColorOwner ? colorClass(cardColorOwner) : '',
            sectionColorScheme: sectionColorOwner ? colorClass(sectionColorOwner) : '',
        };
    };
}

async function main() {
    const browser = await chromium.launch({
        headless: true,
    });

    const context = await browser.newContext({
        viewport: {
            width: 390,
            height: 844,
        },
    });

    const page = await context.newPage();
    const results = [];

    try {
        const routes = [...new Set(INSPECTIONS.map((inspection) => inspection.route))];

        for (const route of routes) {
            const targetUrl = storefrontUrl(route);
            const navigation = await gotoUnlocked(page, route, `color diagnostics ${route}`);
            const status = navigation.response?.status() || 0;
            const routeInspections = INSPECTIONS.filter(
                (inspection) => inspection.route === route,
            );

            for (const inspection of routeInspections) {
                const details = await page.evaluate(
                    inspectionScript(inspection.selector, inspection.label),
                    {
                        selector: inspection.selector,
                        label: inspection.label,
                    },
                );

                results.push({
                    page: inspection.page,
                    route,
                    requestedUrl: targetUrl,
                    finalUrl: page.url(),
                    finalPath: pathnameFromUrl(page.url()),
                    status,
                    ...details,
                });
            }
        }
    } finally {
        await browser.close();
    }

    const outputDirectory = path.join(
        ROOT,
        'test-results',
        'color-scheme-diagnostics',
    );

    fs.mkdirSync(outputDirectory, {
        recursive: true,
    });

    const outputPath = path.join(outputDirectory, 'color-scheme-diagnostics.json');

    fs.writeFileSync(
        outputPath,
        `${JSON.stringify({
            generatedAt: new Date().toISOString(),
            inspections: results,
        }, null, 2)}\n`,
    );

    console.log(
        `Color scheme diagnostics wrote ${path.relative(ROOT, outputPath)} ` +
        `with ${results.length} inspection(s).`,
    );
}

if (require.main === module) {
    main().catch((error) => {
        console.error(
            `Color scheme diagnostics failed:\n${error.stack || error.message}`,
        );
        process.exitCode = 1;
    });
}
