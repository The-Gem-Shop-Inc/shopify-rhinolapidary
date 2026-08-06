'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { chromium } = require('@playwright/test');
const {
    assertStorefrontPage,
    gotoUnlocked,
    hasVisiblePasswordForm,
    isPasswordPage,
    pathnameFromUrl,
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
const SPEC = JSON.parse(
    fs.readFileSync(
        path.join(ROOT, 'data', 'social-preview-spec.json'),
        'utf8',
    ),
);

function resolveRoute(route) {
    return (
        (route.env && process.env[route.env])
        || route.path
        || route.fallback
        || ''
    );
}

function cleanPublicUrl(rawUrl) {
    const url = new URL(rawUrl);

    for (const key of [
        'preview_theme_id',
        '_fd',
        'pb',
    ]) {
        url.searchParams.delete(key);
    }

    return url.toString();
}

async function readMetadata(page) {
    return page.evaluate(() => {
        const content = (selector) => (
            document.querySelector(selector)?.getAttribute('content')?.trim()
            || ''
        );

        return {
            canonical:
                document.querySelector('link[rel="canonical"]')?.href || '',
            title: content('meta[property="og:title"]'),
            description: content('meta[property="og:description"]'),
            type: content('meta[property="og:type"]'),
            url: content('meta[property="og:url"]'),
            image: content('meta[property="og:image"]'),
            imageAlt: content('meta[property="og:image:alt"]'),
            twitterCard: content('meta[name="twitter:card"]'),
            twitterTitle: content('meta[name="twitter:title"]'),
            twitterDescription: content('meta[name="twitter:description"]'),
            twitterImage: content('meta[name="twitter:image"]'),
            twitterImageAlt: content('meta[name="twitter:image:alt"]'),
        };
    });
}

function expectedPathForRoute(route, routePath, finalUrl) {
    const finalPath = pathnameFromUrl(finalUrl);
    const requestedPath = new URL(routePath, 'https://example.test').pathname;

    if (route.name === 'homepage') {
        return finalPath === '/';
    }

    if (route.name === 'collection') {
        return finalPath.startsWith('/collections/');
    }

    if (route.name === 'product') {
        return finalPath.startsWith('/products/');
    }

    if (route.name === 'contact') {
        return finalPath.startsWith('/pages/');
    }

    if (route.name === 'policy') {
        return finalPath.startsWith('/policies/');
    }

    return finalPath === requestedPath;
}

async function assertMetadataRouteReady(page, route, routePath, metadata) {
    const finalUrl = page.url();
    const authenticationViolations = [];

    if (pathnameFromUrl(finalUrl) === '/password') {
        authenticationViolations.push(
            `final pathname is /password for requested route ${routePath}`,
        );
    }

    if (await hasVisiblePasswordForm(page)) {
        authenticationViolations.push(
            'visible storefront password form is still present',
        );
    }

    if (await isPasswordPage(page)) {
        authenticationViolations.push(
            'rendered document is still the storefront password page',
        );
    }

    if (
        metadata.canonical
        && pathnameFromUrl(metadata.canonical) === '/password'
    ) {
        authenticationViolations.push(
            `canonical resolves to /password: ${metadata.canonical}`,
        );
    }

    if (!expectedPathForRoute(route, routePath, finalUrl)) {
        authenticationViolations.push(
            `requested ${route.name} route rendered unrelated path ${pathnameFromUrl(finalUrl) || finalUrl}`,
        );
    }

    if (authenticationViolations.length > 0) {
        throw new Error(authenticationViolations.join('; '));
    }

    await assertStorefrontPage(page, route.name);
}

async function inspectRemoteImage(request, imageUrl) {
    const response = await request.get(imageUrl, {
        timeout: 30000,
    });

    if (!response.ok()) {
        throw new Error(
            `Social image returned HTTP ${response.status()}: ${imageUrl}`,
        );
    }

    const buffer = await response.body();
    const metadata = await sharp(buffer).metadata();

    return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || '',
        bytes: buffer.length,
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
    const violations = [];
    const authenticationViolations = [];
    const metadataViolations = [];
    const report = [];

    try {
        for (const route of SPEC.routes) {
            const routePath = resolveRoute(route);

            if (!routePath) {
                if (route.required) {
                    violations.push(
                        `${route.name}: required route is not configured.`,
                    );
                }
                continue;
            }

            let navigation = null;

            try {
                navigation = await gotoUnlocked(
                    page,
                    routePath,
                    route.name,
                );
            } catch (error) {
                const message = error.message || String(error);

                report.push({
                    route: route.name,
                    path: routePath,
                    finalUrl: page.url(),
                    metadata: null,
                    imageMetadata: null,
                    authenticationViolations: [message],
                    metadataViolations: [],
                    violations: [message],
                });

                authenticationViolations.push(
                    `${route.name}: ${message}`,
                );
                violations.push(
                    `${route.name}: authentication: ${message}`,
                );
                continue;
            }

            const response = navigation.response;

            if (!response || response.status() >= 400) {
                violations.push(
                    `${route.name}: returned HTTP ${response?.status() || 'unknown'}.`,
                );
                continue;
            }

            const metadata = await readMetadata(page);
            const routeAuthenticationViolations = [];
            const routeViolations = [];

            try {
                await assertMetadataRouteReady(
                    page,
                    route,
                    routePath,
                    metadata,
                );
            } catch (error) {
                routeAuthenticationViolations.push(error.message);
            }

            if (routeAuthenticationViolations.length > 0) {
                report.push({
                    route: route.name,
                    path: routePath,
                    finalUrl: page.url(),
                    metadata,
                    imageMetadata: null,
                    authenticationViolations: routeAuthenticationViolations,
                    metadataViolations: [],
                    violations: routeAuthenticationViolations,
                });

                for (const violation of routeAuthenticationViolations) {
                    authenticationViolations.push(
                        `${route.name}: ${violation}`,
                    );
                    violations.push(
                        `${route.name}: authentication: ${violation}`,
                    );
                }

                continue;
            }

            for (const field of [
                'canonical',
                'title',
                'description',
                'type',
                'url',
                'image',
                'imageAlt',
                'twitterCard',
                'twitterTitle',
                'twitterDescription',
                'twitterImage',
                'twitterImageAlt',
            ]) {
                if (!metadata[field]) {
                    routeViolations.push(
                        `missing ${field}`,
                    );
                }
            }

            if (
                metadata.twitterCard
                && metadata.twitterCard !== 'summary_large_image'
            ) {
                routeViolations.push(
                    `twitter:card is "${metadata.twitterCard}", expected "summary_large_image"`,
                );
            }

            if (
                metadata.type
                && route.expectedType
                && metadata.type !== route.expectedType
            ) {
                routeViolations.push(
                    `og:type is "${metadata.type}", expected "${route.expectedType}"`,
                );
            }

            if (metadata.canonical && metadata.url) {
                const canonical = cleanPublicUrl(metadata.canonical);
                const openGraphUrl = cleanPublicUrl(metadata.url);

                if (canonical !== openGraphUrl) {
                    routeViolations.push(
                        `canonical and og:url differ: ${canonical} !== ${openGraphUrl}`,
                    );
                }
            }

            for (const value of [
                metadata.canonical,
                metadata.url,
            ]) {
                if (
                    value
                    && /(?:preview_theme_id|[?&]pb=|[?&]_fd=)/.test(value)
                ) {
                    routeViolations.push(
                        `public metadata contains preview parameters: ${value}`,
                    );
                }
            }

            let imageMetadata = null;

            if (metadata.image) {
                try {
                    imageMetadata = await inspectRemoteImage(
                        context.request,
                        metadata.image,
                    );

                    if (
                        imageMetadata.width < SPEC.minimumImage.width
                        || imageMetadata.height < SPEC.minimumImage.height
                    ) {
                        routeViolations.push(
                            `social image is ${imageMetadata.width}x${imageMetadata.height}; `
                            + `minimum is ${SPEC.minimumImage.width}x${SPEC.minimumImage.height}`,
                        );
                    }

                    if (
                        route.requiresDefaultDimensions
                        && (
                            imageMetadata.width !== SPEC.defaultImage.width
                            || imageMetadata.height !== SPEC.defaultImage.height
                        )
                    ) {
                        routeViolations.push(
                            `fallback image is ${imageMetadata.width}x${imageMetadata.height}; `
                            + `expected ${SPEC.defaultImage.width}x${SPEC.defaultImage.height}`,
                        );
                    }
                } catch (error) {
                    routeViolations.push(error.message);
                }
            }

            report.push({
                route: route.name,
                path: routePath,
                finalUrl: page.url(),
                metadata,
                imageMetadata,
                authenticationViolations: [],
                metadataViolations: routeViolations,
                violations: routeViolations,
            });

            for (const violation of routeViolations) {
                metadataViolations.push(
                    `${route.name}: ${violation}`,
                );
                violations.push(
                    `${route.name}: ${violation}`,
                );
            }
        }
    } finally {
        await browser.close();
    }

    const reportDirectory = path.join(
        ROOT,
        'test-results',
        'social-metadata',
    );

    fs.mkdirSync(reportDirectory, {
        recursive: true,
    });

    fs.writeFileSync(
        path.join(
            reportDirectory,
            'social-metadata.json',
        ),
        `${JSON.stringify(report, null, 2)}\n`,
    );

    if (violations.length > 0) {
        const sections = [];

        if (authenticationViolations.length > 0) {
            sections.push(
                `Authentication or route identity defects:\n- ${
                    authenticationViolations.join('\n- ')
                }`,
            );
        }

        if (metadataViolations.length > 0) {
            sections.push(
                `Metadata defects after authentication:\n- ${
                    metadataViolations.join('\n- ')
                }`,
            );
        }

        console.error(
            `Social metadata validation failed:\n${
                sections.length
                    ? sections.join('\n\n')
                    : `- ${violations.join('\n- ')}`
            }`,
        );
        process.exitCode = 1;
        return;
    }

    console.log(
        `Social metadata valid for ${report.length} route(s).`,
    );
}

if (require.main === module) {
    main().catch((error) => {
        console.error(
            `Social metadata validation failed:\n${error.stack || error.message}`,
        );
        process.exitCode = 1;
    });
}

module.exports = {
    assertMetadataRouteReady,
    cleanPublicUrl,
    expectedPathForRoute,
    readMetadata,
    resolveRoute,
};
