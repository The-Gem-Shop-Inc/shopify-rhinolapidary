'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const {
    assertStorefrontPage,
    gotoUnlocked,
    hasVisiblePasswordForm,
    isPasswordPage,
    pathnameFromUrl,
    storefrontUrl,
    unlockStorefront,
} = require('../tests/helpers/storefront-auth');

try {
    require('@dotenvx/dotenvx').config({ quiet: true });
} catch {
    try {
        require('dotenv').config();
    } catch {
        // CI may provide environment variables directly.
    }
}

const ROOT = path.resolve(__dirname, '..');
const BUDGET_PATH = path.join(
    ROOT,
    'data',
    'brand-performance-budget.json'
);

const SOURCE_DIRS = [
    'assets',
    'layout',
    'sections',
    'snippets',
    'templates',
    'config',
    'locales',
];

const TEXT_EXTENSIONS = new Set([
    '.css',
    '.html',
    '.js',
    '.json',
    '.liquid',
    '.svg'
]);

const LIQUID_EXTENSIONS = new Set([
    '.html',
    '.liquid',
]);

const GLOBAL_CHROME_SOURCE_FILES = [
    'sections/header.liquid',
    'sections/footer.liquid',
    'snippets/header-drawer.liquid',
    'snippets/header-dropdown-menu.liquid',
    'snippets/header-mega-menu.liquid',
    'snippets/header-search.liquid',
    'snippets/country-localization.liquid',
    'snippets/language-localization.liquid',
    'snippets/social-icons.liquid',
    'snippets/rhino-breadcrumbs.liquid',
];

const GLOBAL_CHROME_ASSET_PATTERN =
    /['"]([^'"]+\.(?:css|js|svg|png|jpe?g|webp|gif|avif))['"]\s*\|\s*(?:asset_url|stylesheet_tag|inline_asset_content)/gi;

const GLOBAL_CHROME_RUNTIME_CORE_ASSETS = [
    'rhino-custom.css',
    'global.js',
    'details-disclosure.js',
    'details-modal.js',
    'search-form.js',
];

const EXCLUDED_DIRS = new Set([
    '.git',
    'node_modules',
    'playwright-report',
    'test-results',
    'artifacts',
    'coverage',
]);

function fail(message) {
    throw new Error(message);
}

function readJson(filePath) {
    try {
        return JSON.parse(
            fs.readFileSync(filePath, 'utf8')
        );
    } catch (error) {
        fail(
            `Could not read ${path.relative(ROOT, filePath)}: ` +
            error.message
        );
    }
}

function validateBudgetShape(budget) {
    const requiredNumbers = [
        [
            'static.rhinoCssGzipBytes',
            budget?.static?.rhinoCssGzipBytes,
        ],
        [
            'static.rhinoJsGzipBytes',
            budget?.static?.rhinoJsGzipBytes,
        ],
        [
            'static.rhinoIconSvgBytes',
            budget?.static?.rhinoIconSvgBytes,
        ],
        [
            'static.textureAssetBytes',
            budget?.static?.textureAssetBytes,
        ],
        [
            'runtime.lcpMs',
            budget?.runtime?.lcpMs,
        ],
        [
            'runtime.cls',
            budget?.runtime?.cls,
        ],
        [
            'runtime.tbtMs',
            budget?.runtime?.tbtMs,
        ],
        [
            'runtime.mobileInitialImageBytes',
            budget?.runtime?.mobileInitialImageBytes,
        ],
        [
            'runtime.desktopInitialImageBytes',
            budget?.runtime?.desktopInitialImageBytes,
        ],
        [
            'runtime.mobileMaxImageBytes',
            budget?.runtime?.mobileMaxImageBytes,
        ],
        [
            'runtime.desktopMaxImageBytes',
            budget?.runtime?.desktopMaxImageBytes,
        ],
        [
            'globalChrome.static.rhinoCssGzipBytes',
            budget?.globalChrome?.static?.rhinoCssGzipBytes,
        ],
        [
            'globalChrome.static.rhinoJsGzipBytes',
            budget?.globalChrome?.static?.rhinoJsGzipBytes,
        ],
        [
            'globalChrome.static.headerFooterCssGzipBytes',
            budget?.globalChrome?.static?.headerFooterCssGzipBytes,
        ],
        [
            'globalChrome.static.headerFooterJsGzipBytes',
            budget?.globalChrome?.static?.headerFooterJsGzipBytes,
        ],
        [
            'globalChrome.static.iconSvgBytes',
            budget?.globalChrome?.static?.iconSvgBytes,
        ],
        [
            'globalChrome.static.iconAssetCount',
            budget?.globalChrome?.static?.iconAssetCount,
        ],
        [
            'globalChrome.static.mediaAssetBytes',
            budget?.globalChrome?.static?.mediaAssetBytes,
        ],
        [
            'globalChrome.static.localAssetCount',
            budget?.globalChrome?.static?.localAssetCount,
        ],
        [
            'globalChrome.static.externalResourceHostCount',
            budget?.globalChrome?.static?.externalResourceHostCount,
        ],
        [
            'globalChrome.static.synchronousThirdPartyScriptCount',
            budget?.globalChrome?.static?.synchronousThirdPartyScriptCount,
        ],
        [
            'globalChrome.static.immediateVideoEmbedCount',
            budget?.globalChrome?.static?.immediateVideoEmbedCount,
        ],
        [
            'globalChrome.static.autoplayMediaCount',
            budget?.globalChrome?.static?.autoplayMediaCount,
        ],
        [
            'globalChrome.runtime.mobileMaxResourceCount',
            budget?.globalChrome?.runtime?.mobileMaxResourceCount,
        ],
        [
            'globalChrome.runtime.desktopMaxResourceCount',
            budget?.globalChrome?.runtime?.desktopMaxResourceCount,
        ],
        [
            'globalChrome.runtime.maxCssRequestCount',
            budget?.globalChrome?.runtime?.maxCssRequestCount,
        ],
        [
            'globalChrome.runtime.maxJsRequestCount',
            budget?.globalChrome?.runtime?.maxJsRequestCount,
        ],
        [
            'globalChrome.runtime.thirdPartyScriptHostCount',
            budget?.globalChrome?.runtime?.thirdPartyScriptHostCount,
        ],
        [
            'globalChrome.runtime.totalTransferBytes',
            budget?.globalChrome?.runtime?.totalTransferBytes,
        ],
    ];

    const errors = [];

    if (budget?.schemaVersion !== 1) {
        errors.push('schemaVersion must equal 1.');
    }

    for (const [name, value] of requiredNumbers) {
        if (
            typeof value !== 'number' ||
            value < 0
        ) {
            errors.push(
                `${name} must be a non-negative number.`
            );
        }
    }

    if (!Array.isArray(budget?.routes)) {
        errors.push('routes must be an array.');
    }

    if (!Array.isArray(budget?.allowedHostSuffixes)) {
        errors.push('allowedHostSuffixes must be an array.');
    }

    if (errors.length) {
        fail(
            `Invalid brand performance budget:\n- ` +
            errors.join('\n- ')
        );
    }
}

function walk(directory) {
    if (!fs.existsSync(directory)) {
        return [];
    }

    const files = [];

    for (
        const entry of fs.readdirSync(
            directory,
            { withFileTypes: true }
        )
    ) {
        if (EXCLUDED_DIRS.has(entry.name)) {
            continue;
        }

        const absolute = path.join(
            directory,
            entry.name
        );

        if (entry.isDirectory()) {
            files.push(...walk(absolute));
        } else if (entry.isFile()) {
            files.push(absolute);
        }
    }

    return files;
}

function gzipSize(filePaths) {
    const combined = Buffer.concat(
        filePaths.map((filePath) =>
            fs.readFileSync(filePath)
        )
    );

    return combined.length
        ? zlib.gzipSync(
            combined,
            { level: 9 }
          ).length
        : 0;
}

function formatBytes(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
}

function isAllowedHost(
    hostname,
    budget,
    baseHostname = ''
) {
    const host = hostname.toLowerCase();

    if (
        baseHostname &&
        host === baseHostname.toLowerCase()
    ) {
        return true;
    }

    return budget.allowedHostSuffixes.some(
        (suffix) => {
            const normalized = String(
                suffix
            ).toLowerCase();

            if (!normalized) {
                return false;
            }

            if (normalized.startsWith('.')) {
                return (
                    host === normalized.slice(1) ||
                    host.endsWith(normalized)
                );
            }

            return (
                host === normalized ||
                host.endsWith(`.${normalized}`)
            );
        }
    );
}

function extractHttpUrls(text) {
    return (
        text.match(
            /https?:\/\/[^\s"'()<>]+/gi
        ) || []
    );
}

function safeHostname(rawUrl) {
    try {
        return new URL(
            rawUrl.replace(/[),.;]+$/, '')
        ).hostname.toLowerCase();
    } catch {
        return '';
    }
}

function stripInertTemplateMarkup(source) {
    return source.replace(
        /<template\b[^>]*>[\s\S]*?<\/template>/gi,
        '',
    );
}

function budgetMetric(id, value, limit) {
    return {
        id,
        value,
        limit,
        passed: value <= limit,
    };
}

function metricViolation(metric, label) {
    if (metric.passed) {
        return null;
    }

    return `${label} is ${metric.value}; budget is ${metric.limit}.`;
}

let globalChromeRuntimeAssetNameCache = null;

function globalChromeRuntimeAssetNames() {
    if (globalChromeRuntimeAssetNameCache) {
        return globalChromeRuntimeAssetNameCache;
    }

    globalChromeRuntimeAssetNameCache = new Set([
        ...GLOBAL_CHROME_RUNTIME_CORE_ASSETS,
        ...collectGlobalChromeAssetReferences()
            .assets
            .map((asset) => asset.name),
    ]);

    return globalChromeRuntimeAssetNameCache;
}

function assetBasenameFromUrl(rawUrl) {
    try {
        const parsed = new URL(rawUrl);
        const pathname = decodeURIComponent(parsed.pathname);
        const name = pathname.split('/').filter(Boolean).at(-1) || '';

        return name.replace(/\?.*$/, '');
    } catch {
        return '';
    }
}

function isGlobalChromeRuntimeResource(resource) {
    return globalChromeRuntimeAssetNames().has(assetBasenameFromUrl(resource.url));
}

function collectGlobalChromeAssetReferences() {
    const sourceFiles = GLOBAL_CHROME_SOURCE_FILES
        .map((relativePath) => path.join(ROOT, relativePath))
        .filter(fs.existsSync);
    const referencedAssets = new Set();
    const externalHosts = new Set();

    for (const filePath of sourceFiles) {
        const text = fs.readFileSync(filePath, 'utf8');

        for (const match of text.matchAll(GLOBAL_CHROME_ASSET_PATTERN)) {
            referencedAssets.add(match[1]);
        }

        for (
            const match of text.matchAll(
                /<(?:script|link|iframe|img|source)\b[^>]*(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>/gi
            )
        ) {
            const hostname = safeHostname(match[1]);

            if (hostname) {
                externalHosts.add(hostname);
            }
        }
    }

    const assets = [...referencedAssets].sort().map((assetName) => {
        const filePath = path.join(ROOT, 'assets', assetName);
        const exists = fs.existsSync(filePath);
        const bytes = exists ? fs.statSync(filePath).size : 0;
        const extension = path.extname(assetName).toLowerCase();

        return {
            name: assetName,
            path: `assets/${assetName}`,
            exists,
            bytes,
            extension,
        };
    });

    return {
        sourceFiles: sourceFiles.map((filePath) =>
            path.relative(ROOT, filePath).replaceAll('\\', '/')
        ),
        assets,
        externalHosts: [...externalHosts].sort(),
    };
}

function runGlobalChromeStaticValidation(
    budget,
    existingDetails,
    staticSourceDetails,
) {
    const threshold = budget.globalChrome.static;
    const assetReferences = collectGlobalChromeAssetReferences();
    const cssFiles = assetReferences.assets
        .filter((asset) => asset.exists && asset.extension === '.css')
        .map((asset) => path.join(ROOT, asset.path));
    const jsFiles = assetReferences.assets
        .filter((asset) => asset.exists && asset.extension === '.js')
        .map((asset) => path.join(ROOT, asset.path));
    const iconAssets = assetReferences.assets
        .filter((asset) => asset.extension === '.svg');
    const mediaAssets = assetReferences.assets
        .filter((asset) => [
            '.png',
            '.jpg',
            '.jpeg',
            '.webp',
            '.gif',
            '.avif',
        ].includes(asset.extension));
    const missingAssets = assetReferences.assets
        .filter((asset) => !asset.exists);
    const iconSvgBytes = iconAssets.reduce(
        (sum, asset) => sum + asset.bytes,
        0,
    );
    const mediaAssetBytes = mediaAssets.reduce(
        (sum, asset) => sum + asset.bytes,
        0,
    );

    const details = {
        sourceFiles: assetReferences.sourceFiles,
        localAssets: assetReferences.assets,
        missingAssets: missingAssets.map((asset) => asset.path),
        externalHosts: assetReferences.externalHosts,
        rhinoCssGzipBytes: existingDetails.rhinoCssGzipBytes,
        rhinoJsGzipBytes: existingDetails.rhinoJsGzipBytes,
        headerFooterCssGzipBytes: gzipSize(cssFiles),
        headerFooterJsGzipBytes: gzipSize(jsFiles),
        iconAssetCount: iconAssets.length,
        iconSvgBytes,
        mediaAssetCount: mediaAssets.length,
        mediaAssetBytes,
        synchronousThirdPartyScripts:
            staticSourceDetails.synchronousThirdPartyScripts,
        immediateVideoEmbeds:
            staticSourceDetails.immediateVideoEmbeds,
        autoplayMedia:
            staticSourceDetails.autoplayMedia,
    };

    const metrics = [
        budgetMetric(
            'rhinoCssGzipBytes',
            details.rhinoCssGzipBytes,
            threshold.rhinoCssGzipBytes,
        ),
        budgetMetric(
            'rhinoJsGzipBytes',
            details.rhinoJsGzipBytes,
            threshold.rhinoJsGzipBytes,
        ),
        budgetMetric(
            'headerFooterCssGzipBytes',
            details.headerFooterCssGzipBytes,
            threshold.headerFooterCssGzipBytes,
        ),
        budgetMetric(
            'headerFooterJsGzipBytes',
            details.headerFooterJsGzipBytes,
            threshold.headerFooterJsGzipBytes,
        ),
        budgetMetric(
            'iconSvgBytes',
            details.iconSvgBytes,
            threshold.iconSvgBytes,
        ),
        budgetMetric(
            'iconAssetCount',
            details.iconAssetCount,
            threshold.iconAssetCount,
        ),
        budgetMetric(
            'mediaAssetBytes',
            details.mediaAssetBytes,
            threshold.mediaAssetBytes,
        ),
        budgetMetric(
            'localAssetCount',
            details.localAssets.length,
            threshold.localAssetCount,
        ),
        budgetMetric(
            'externalResourceHostCount',
            details.externalHosts.length,
            threshold.externalResourceHostCount,
        ),
        budgetMetric(
            'synchronousThirdPartyScriptCount',
            details.synchronousThirdPartyScripts.length,
            threshold.synchronousThirdPartyScriptCount,
        ),
        budgetMetric(
            'immediateVideoEmbedCount',
            details.immediateVideoEmbeds.length,
            threshold.immediateVideoEmbedCount,
        ),
        budgetMetric(
            'autoplayMediaCount',
            details.autoplayMedia.length,
            threshold.autoplayMediaCount,
        ),
    ];

    const violations = [
        ...missingAssets.map((asset) =>
            `Global chrome asset reference is missing: ${asset.path}`
        ),
        ...metrics
            .map((metric) => metricViolation(metric, metric.id))
            .filter(Boolean),
    ];

    return {
        details,
        metrics,
        violations,
    };
}

function runStaticValidation(budget) {
    const violations = [];
    const details = {};

    const assetsDir = path.join(
        ROOT,
        'assets'
    );

    const rhinoCssFiles = [
        path.join(
            assetsDir,
            'rhino-custom.css'
        ),
    ].filter(fs.existsSync);

    const assetNames = fs.existsSync(assetsDir)
        ? fs.readdirSync(assetsDir)
        : [];

    const rhinoJsFiles = assetNames
        .filter((name) =>
            /^rhino-.*\.js$/i.test(name)
        )
        .map((name) =>
            path.join(assetsDir, name)
        );

    const rhinoIconFiles = assetNames
        .filter((name) =>
            /^rhino-icon-.*\.svg$/i.test(name)
        )
        .map((name) =>
            path.join(assetsDir, name)
        );

    const textureFiles = assetNames
        .filter((name) =>
            /(texture|pattern|strata|geolog)/i
                .test(name)
        )
        .map((name) =>
            path.join(assetsDir, name)
        )
        .filter((filePath) =>
            fs.statSync(filePath).isFile()
        );

    if (!rhinoCssFiles.length) {
        violations.push(
            'assets/rhino-custom.css is missing.'
        );
    }

    details.rhinoCssGzipBytes =
        gzipSize(rhinoCssFiles);

    details.rhinoJsGzipBytes =
        gzipSize(rhinoJsFiles);

    details.rhinoIconCount =
        rhinoIconFiles.length;

    details.rhinoIconMaxBytes =
        rhinoIconFiles.length
            ? Math.max(
                ...rhinoIconFiles.map(
                    (filePath) =>
                        fs.statSync(filePath).size
                )
              )
            : 0;

    details.textureAssets =
        textureFiles.map((filePath) => ({
            path: path
                .relative(ROOT, filePath)
                .replaceAll('\\', '/'),
            bytes: fs.statSync(filePath).size,
        }));

    if (
        details.rhinoCssGzipBytes >
        budget.static.rhinoCssGzipBytes
    ) {
        violations.push(
            `Rhino CSS is ` +
            `${formatBytes(
                details.rhinoCssGzipBytes
            )} gzipped; budget is ` +
            `${formatBytes(
                budget.static.rhinoCssGzipBytes
            )}.`
        );
    }

    if (
        details.rhinoJsGzipBytes >
        budget.static.rhinoJsGzipBytes
    ) {
        violations.push(
            `Rhino JavaScript is ` +
            `${formatBytes(
                details.rhinoJsGzipBytes
            )} gzipped; budget is ` +
            `${formatBytes(
                budget.static.rhinoJsGzipBytes
            )}.`
        );
    }

    for (const iconPath of rhinoIconFiles) {
        const bytes =
            fs.statSync(iconPath).size;

        if (
            bytes >
            budget.static.rhinoIconSvgBytes
        ) {
            violations.push(
                `${path.relative(
                    ROOT,
                    iconPath
                )} is ${formatBytes(bytes)}; ` +
                `icon budget is ${formatBytes(
                    budget.static.rhinoIconSvgBytes
                )}.`
            );
        }
    }

    for (
        const texture of details.textureAssets
    ) {
        if (
            texture.bytes >
            budget.static.textureAssetBytes
        ) {
            violations.push(
                `${texture.path} is ` +
                `${formatBytes(texture.bytes)}; ` +
                `texture budget is ` +
                `${formatBytes(
                    budget.static.textureAssetBytes
                )}.`
            );
        }
    }

    const sourceFiles =
        SOURCE_DIRS.flatMap((directory) =>
            walk(path.join(ROOT, directory))
        );

    const externalFontHosts = new Set();
    const synchronousThirdPartyScripts = [];
    const immediateVideoEmbeds = [];
    const autoplayMedia = [];

    const fontHostPattern =
        /(fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|p\.typekit\.net|cloud\.typography\.com)$/i;

    for (const filePath of sourceFiles) {
        const extension = path
            .extname(filePath)
            .toLowerCase();

        if (
            !TEXT_EXTENSIONS.has(extension)
        ) {
            continue;
        }

        const relative = path
            .relative(ROOT, filePath)
            .replaceAll('\\', '/');

        const text = fs.readFileSync(
            filePath,
            'utf8'
        );

        const activeMarkup = stripInertTemplateMarkup(
            text,
        );

        for (
            const rawUrl of extractHttpUrls(text)
        ) {
            const hostname = safeHostname(rawUrl);

            if (fontHostPattern.test(hostname)) {
                externalFontHosts.add(hostname);
            }
        }

        if (!LIQUID_EXTENSIONS.has(extension)) {
            continue;
        }

        for (
            const match of activeMarkup.matchAll(
            /<script\b[^>]*>/gi
        )) {
            const tag = match[0];

            const srcMatch = tag.match(
                /\bsrc\s*["'](https?:\/\/[^"']+)["']/i
            );

            if (!srcMatch)
                continue;

            const hostname = safeHostname(srcMatch[1]);

            const deferred =
                /\b(?:async|defer)(?:\s|=|>)/i
                    .test(tag) ||
                /\btype\s*=\s*["']module["']/i
                    .test(tag);

            if (hostname && !isAllowedHost(hostname, budget)
                && !deferred) {
                synchronousThirdPartyScripts.push({
                    path: relative,
                    host: hostname,
                    tag,
                });
            }
        }

        for (
            const match of activeMarkup.matchAll(
            /<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi
            )
        ) {
            if (/(youtube(?:-nocookie)?\.com|youtu\.be|player\.vimeo\.com|vimeo\.com)/i.test(match[1])) {
                immediateVideoEmbeds.push({
                    path: relative,
                    src: match[1],
                });
            }
        }

        for (
            const match of activeMarkup.matchAll(
                /<(?:video|audio)\b[^>]*\bautoplay\b[^>]*>/gi
            )
        ) {
            autoplayMedia.push({
                path: relative,
                tag: match[0],
            });
        }
    }

    details.externalFontHosts = [
        ...externalFontHosts,
    ].sort();

    details.synchronousThirdPartyScripts =
        synchronousThirdPartyScripts;

    details.immediateVideoEmbeds =
        immediateVideoEmbeds;

    details.autoplayMedia =
        autoplayMedia;

    details.globalChrome =
        runGlobalChromeStaticValidation(
            budget,
            details,
            {
                synchronousThirdPartyScripts,
                immediateVideoEmbeds,
                autoplayMedia,
            },
        );

    if (
        details.externalFontHosts.length >
        budget.static.externalFontHostCount
    ) {
        violations.push(
            `Found ` +
            `${details.externalFontHosts.length} ` +
            `external font host(s): ` +
            details.externalFontHosts.join(', ')
        );
    }

    if (
        synchronousThirdPartyScripts.length >
        budget.static
            .synchronousThirdPartyScriptCount
    ) {
        violations.push(
            `Found ` +
            `${synchronousThirdPartyScripts.length} ` +
            `synchronous third party script tag(s).`
        );
    }

    if (
        immediateVideoEmbeds.length >
        budget.static.immediateVideoEmbedCount
    ) {
        violations.push(
            `Found ` +
            `${immediateVideoEmbeds.length} ` +
            `immediately loaded video iframe(s).`
        );
    }

    if (autoplayMedia.length > budget.static.autoplayMediaCount) {
        violations.push(
            `Found ${autoplayMedia.length} ` +
            `autoplay media element(s).`
        );
    }

    violations.push(
        ...details.globalChrome.violations.map((message) =>
            `global chrome: ${message}`
        ),
    );

    return {
        violations,
        details,
    };
}

function parseArguments(argv) {
    const options = {
        runtime: false,
        desktop: false,
        runs: 1,
        route: '',
        reportDir: path.join(
            ROOT,
            'test-results',
            'brand-performance'
        ),
    };

    for (const argument of argv) {
        if (argument === '--runtime') {
            options.runtime = true;
        } else if (argument === '--desktop') {
            options.desktop = true;
        } else if (
            argument.startsWith('--runs=')
        ) {
            options.runs = Number(
                argument.slice('--runs='.length)
            );
        } else if (argument.startsWith('--route=')) {
            options.route = argument.slice('--route='.length);
        } else if (argument.startsWith('--report-dir=')) {
            options.reportDir = path.resolve(ROOT, argument.slice('--report-dir='.length));
        } else {
            fail(`Unknown argument: ${argument}`);
        }
    }

    if (
        !Number.isInteger(options.runs) ||
        options.runs < 1 ||
        options.runs > 10
    ) {
        fail(
            '--runs must be an integer from 1 through 10.'
        );
    }

    return options;
}

function buildStorefrontUrl(routePath) {
    try {
        return storefrontUrl(routePath);
    } catch (error) {
        fail(error.message);
    }
}

function resolveRoutes(budget, routeFilter) {
    return budget.routes
        .map((route) => {
            const envValue = route.env
                ? process.env[route.env]
                : '';

            const resolvedPath =
                envValue ||
                route.path ||
                route.fallback ||
                '';

            return {
                ...route,
                resolvedPath,
            };
        })
        .filter((route) =>
            !routeFilter ||
            route.name === routeFilter
        );
}

function median(values) {
    const sorted = values
        .filter(Number.isFinite)
        .sort((a, b) => a - b);

    if (!sorted.length)
        return 0;

    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2
        ? sorted[middle]
        : (
            sorted[middle - 1] +
            sorted[middle]
        ) / 2;
}

function sleep(milliseconds) {
    return new Promise((resolve) =>
        setTimeout(resolve, milliseconds)
    );
}

async function installPerformanceObservers(
    page
) {
    await page.addInitScript(() => {
        window.__rhinoPerformance = {
            lcpMs: 0,
            cls: 0,
            tbtMs: 0,
        };

        const observe = (
            type,
            callback
        ) => {
            try {
                if (
                    !PerformanceObserver
                        .supportedEntryTypes
                        ?.includes(type)
                ) {
                    return;
                }

                const observer =
                    new PerformanceObserver(
                        (list) =>
                            callback(
                                list.getEntries()
                            )
                    );

                observer.observe({
                    type,
                    buffered: true,
                });
            } catch {
                // Zero is reported if unsupported.
            }
        };

        observe(
            'largest-contentful-paint',
            (entries) => {
                const last = entries.at(-1);

                if (last) {
                    window.__rhinoPerformance
                        .lcpMs = last.startTime;
                }
            }
        );

        observe(
            'layout-shift',
            (entries) => {
                for (const entry of entries) {
                    if (!entry.hadRecentInput) {
                        window.__rhinoPerformance
                            .cls += entry.value;
                    }
                }
            }
        );

        observe(
            'longtask',
            (entries) => {
                for (const entry of entries) {
                    window.__rhinoPerformance
                        .tbtMs += Math.max(
                        0,
                        entry.duration - 50
                    );
                }
            }
        );
    });
}

async function createNetworkRecorder(
    context,
    page
) {
    const session =
        await context.newCDPSession(page);

    await session.send(
        'Network.enable'
    );

    let recording = false;
    let records = new Map();

    session.on(
        'Network.requestWillBeSent',
        (event) => {
            if (!recording) {
                return;
            }

            records.set(
                event.requestId,
                {
                    url: event.request.url,
                    type:
                        event.type || 'Other',
                    mimeType: '',
                    status: 0,
                    bytes: 0,
                    failed: false,
                }
            );
        }
    );

    session.on(
        'Network.responseReceived',
        (event) => {
            if (!recording) {
                return;
            }

            const record = records.get(
                event.requestId
            );

            if (!record) {
                return;
            }

            record.type =
                event.type || record.type;

            record.mimeType =
                event.response.mimeType || '';

            record.status =
                event.response.status || 0;
        }
    );

    session.on(
        'Network.loadingFinished',
        (event) => {
            if (!recording) {
                return;
            }

            const record = records.get(
                event.requestId
            );

            if (record) {
                record.bytes =
                    event.encodedDataLength || 0;
            }
        }
    );

    session.on(
        'Network.loadingFailed',
        (event) => {
            if (!recording) {
                return;
            }

            const record = records.get(
                event.requestId
            );

            if (record) {
                record.failed = true;
            }
        }
    );

    return {
        session,

        start() {
            records = new Map();
            recording = true;
        },

        stop() {
            recording = false;
            return [...records.values()];
        },
    };
}

function summarizeResources(
    resources,
    budget,
    baseHostname
) {
    const successful = resources.filter(
        (resource) =>
            !resource.failed &&
            resource.status < 400
    );

    const images = successful.filter(
        (resource) =>
            resource.type === 'Image'
    );

    const scripts = successful.filter(
        (resource) =>
            resource.type === 'Script'
    );
    const globalChromeResources = successful.filter(
        isGlobalChromeRuntimeResource
    );
    const globalChromeScripts = globalChromeResources.filter(
        (resource) =>
            resource.type === 'Script'
    );
    const globalChromeStylesheets = globalChromeResources.filter(
        (resource) =>
            resource.type === 'Stylesheet'
    );

    const networkImages = images.filter(
        (resource) =>
            !/^data:/i.test(resource.url)
    );

    const resourceCountsByType = successful.reduce(
        (counts, resource) => {
            counts[resource.type] =
                (counts[resource.type] || 0) + 1;
            return counts;
        },
        {}
    );

    const thirdPartyScriptHosts = [
        ...new Set(
            scripts
                .map((resource) =>
                    safeHostname(resource.url)
                )
                .filter(
                    (hostname) =>
                        hostname &&
                        !isAllowedHost(
                            hostname,
                            budget,
                            baseHostname
                        )
                )
        ),
    ].sort();

    const largestImages = [...networkImages]
        .sort(
            (a, b) =>
                b.bytes - a.bytes
        )
        .slice(0, 10)
        .map(({ url, bytes }) => ({
            url,
            bytes,
        }));

    return {
        resourceCount:
            successful.length,

        totalTransferBytes:
            successful.reduce(
                (sum, resource) =>
                    sum + resource.bytes,
                0
            ),

        resourceCountsByType,

        imageRequestCount:
            networkImages.length,

        imageTransferBytes:
            networkImages.reduce(
                (sum, resource) =>
                    sum + resource.bytes,
                0
            ),

        imageBytes:
            networkImages.reduce(
                (sum, resource) =>
                    sum + resource.bytes,
                0
            ),

        maxImageBytes:
            networkImages.length
                ? Math.max(
                    ...networkImages.map(
                        (resource) =>
                            resource.bytes
                    )
                )
                : 0,

        cssBytes:
            successful
                .filter(
                    (resource) =>
                        resource.type ===
                        'Stylesheet'
                )
                .reduce(
                    (sum, resource) =>
                        sum + resource.bytes,
                    0
                ),

        cssRequestCount:
            successful.filter(
                (resource) =>
                    resource.type ===
                    'Stylesheet'
            ).length,

        jsBytes:
            scripts.reduce(
                (sum, resource) =>
                    sum + resource.bytes,
                0
            ),

        jsRequestCount:
            scripts.length,

        globalChromeResourceCount:
            globalChromeResources.length,

        globalChromeResourceCountsByType:
            globalChromeResources.reduce(
                (counts, resource) => {
                    counts[resource.type] =
                        (counts[resource.type] || 0) + 1;
                    return counts;
                },
                {}
            ),

        globalChromeCssBytes:
            globalChromeStylesheets.reduce(
                (sum, resource) =>
                    sum + resource.bytes,
                0
            ),

        globalChromeCssRequestCount:
            globalChromeStylesheets.length,

        globalChromeJsBytes:
            globalChromeScripts.reduce(
                (sum, resource) =>
                    sum + resource.bytes,
                0
            ),

        globalChromeJsRequestCount:
            globalChromeScripts.length,

        globalChromeTransferBytes:
            globalChromeResources.reduce(
                (sum, resource) =>
                    sum + resource.bytes,
                0
            ),

        globalChromeResources:
            globalChromeResources.map((resource) => ({
                url: resource.url,
                type: resource.type,
                bytes: resource.bytes,
            })),

        thirdPartyScriptHosts,
        largestImages,
    };
}

async function readCanonicalUrl(page) {
    return page.evaluate(() =>
        document.querySelector('link[rel="canonical"]')?.href || ''
    ).catch(() => '');
}

function isRelatedStorefrontPath(route, requestedPath, finalUrl) {
    const requested = new URL(requestedPath || '/', 'https://example.test');
    const finalPath = pathnameFromUrl(finalUrl);

    if (!finalPath) {
        return false;
    }

    if (requested.pathname === '/') {
        return finalPath === '/';
    }

    if (requested.pathname.startsWith('/search')) {
        return finalPath === '/search';
    }

    if (requested.pathname.startsWith('/collections/')) {
        return finalPath.startsWith('/collections/');
    }

    if (requested.pathname.startsWith('/products/')) {
        return finalPath.startsWith('/products/');
    }

    if (requested.pathname.startsWith('/cart')) {
        return finalPath === '/cart';
    }

    if (requested.pathname.startsWith('/pages/')) {
        return finalPath === requested.pathname;
    }

    if (requested.pathname.startsWith('/policies/')) {
        return finalPath === requested.pathname;
    }

    return finalPath === requested.pathname;
}

async function collectRouteIdentity(page, route, requestedUrl) {
    const canonicalUrl = await readCanonicalUrl(page);
    const finalUrl = page.url();
    const visiblePasswordForm = await hasVisiblePasswordForm(page);
    const passwordPage = await isPasswordPage(page);

    return {
        requestedUrl,
        finalUrl,
        canonicalUrl,
        documentTitle: await page.title().catch(() => ''),
        passwordPageDetection: {
            finalPathIsPassword:
                pathnameFromUrl(finalUrl) === '/password',
            canonicalPathIsPassword:
                canonicalUrl
                && pathnameFromUrl(canonicalUrl) === '/password',
            visiblePasswordForm,
            passwordPage,
        },
        relatedStorefrontPath: isRelatedStorefrontPath(
            route,
            route.resolvedPath,
            finalUrl,
        ),
    };
}

async function assertMeasurableStorefrontPage(page, route, requestedUrl) {
    const identity = await collectRouteIdentity(
        page,
        route,
        requestedUrl,
    );

    const violations = [];

    if (identity.passwordPageDetection.finalPathIsPassword) {
        violations.push(
            'final pathname is /password',
        );
    }

    if (identity.passwordPageDetection.canonicalPathIsPassword) {
        violations.push(
            `canonical resolves to /password: ${identity.canonicalUrl}`,
        );
    }

    if (identity.passwordPageDetection.visiblePasswordForm) {
        violations.push(
            'visible storefront password form is still present',
        );
    }

    if (identity.passwordPageDetection.passwordPage) {
        violations.push(
            'rendered document is still the storefront password page',
        );
    }

    if (!identity.relatedStorefrontPath) {
        violations.push(
            `requested route ${route.resolvedPath} rendered unrelated path ${pathnameFromUrl(identity.finalUrl) || identity.finalUrl}`,
        );
    }

    if (violations.length > 0) {
        const error = new Error(
            `Refusing to measure ${route.name}: ${violations.join('; ')}.`,
        );
        error.routeIdentity = identity;
        throw error;
    }

    await assertStorefrontPage(page, route.name);

    return identity;
}

async function measureRoute(
    page,
    recorder,
    budget,
    route,
    options
) {
    const targetUrl =
        buildStorefrontUrl(
            route.resolvedPath
        );

    const baseHostname =
        new URL(targetUrl).hostname;

    const samples = [];

    for (
        let index = 0;
        index < options.runs;
        index += 1
    ) {
        await page.goto('about:blank');

        await recorder.session.send(
            'Network.clearBrowserCache'
        );

        recorder.start();

        let response;

        try {
            const navigation = await gotoUnlocked(
                page,
                route.resolvedPath,
                route.name,
            );

            response = navigation.response;
        } catch (error) {
            const resources =
                recorder.stop();
            error.routeIdentity = error.routeIdentity || {
                requestedUrl: targetUrl,
                finalUrl: page.url(),
                canonicalUrl: await readCanonicalUrl(page),
                documentTitle: await page.title().catch(() => ''),
                passwordPageDetection: {
                    finalPathIsPassword:
                        pathnameFromUrl(page.url()) === '/password',
                    canonicalPathIsPassword: false,
                    visiblePasswordForm:
                        await hasVisiblePasswordForm(page),
                    passwordPage:
                        await isPasswordPage(page),
                },
                relatedStorefrontPath: false,
            };
            error.resources =
                summarizeResources(
                    resources,
                    budget,
                    baseHostname
                );
            throw error;
        }

        const status =
            response?.status() ?? 0;

        if (status === 429) {
            fail(
                `${route.name} returned HTTP 429. ` +
                `Wait before rerunning the suite.`
            );
        }

        if (status >= 400) {
            fail(
                `${route.name} returned HTTP ` +
                `${status}: ${page.url()}`
            );
        }

        await page.waitForLoadState(
            'load',
            { timeout: 30_000 }
        ).catch(() => {});

        await page.evaluate(
            async () => {
                if (document.fonts?.ready) {
                    await document.fonts.ready;
                }
            }
        ).catch(() => {});

        await sleep(
            budget.runtime.settleMs
        );

        const resources =
            recorder.stop();

        let routeIdentity;

        try {
            routeIdentity =
                await assertMeasurableStorefrontPage(
                page,
                route,
                targetUrl,
                );
        } catch (error) {
            error.resources =
                summarizeResources(
                    resources,
                    budget,
                    baseHostname
                );
            throw error;
        }

        const browserMetrics =
            await page.evaluate(() => ({
                ...(
                    window.__rhinoPerformance ||
                    {
                        lcpMs: 0,
                        cls: 0,
                        tbtMs: 0,
                    }
                ),

                immediateVideoIframes: [
                    ...document.querySelectorAll(
                        'iframe[src]'
                    ),
                ].filter((iframe) =>
                    /(youtube(?:-nocookie)?\.com|youtu\.be|player\.vimeo\.com|vimeo\.com)/i
                        .test(iframe.src)
                ).length,

                autoplayMedia:
                document.querySelectorAll(
                    'video[autoplay], ' +
                    'audio[autoplay]'
                ).length,

                finalUrl: location.href,
                title: document.title,
            }));

        const resourceMetrics =
            summarizeResources(
                resources,
                budget,
                baseHostname
            );

        samples.push({
            run: index + 1,
            status,
            requestedUrl: targetUrl,
            canonicalUrl:
                routeIdentity.canonicalUrl,
            documentTitle:
                routeIdentity.documentTitle,
            passwordPageDetection:
                routeIdentity.passwordPageDetection,
            relatedStorefrontPath:
                routeIdentity.relatedStorefrontPath,
            ...browserMetrics,
            ...resourceMetrics,
        });

        if (
            index + 1 < options.runs
        ) {
            await sleep(
                budget.runtime
                    .interRunDelayMs
            );
        }
    }

    const summary = {
        route: route.name,
        path: route.resolvedPath,
        requestedUrl: targetUrl,
        mode: options.desktop
            ? 'desktop'
            : 'mobile',
        runs: options.runs,
        finalUrl:
            samples.at(-1)?.finalUrl || '',
        canonicalUrl:
            samples.at(-1)?.canonicalUrl || '',
        documentTitle:
            samples.at(-1)?.documentTitle || '',
        passwordPageDetection:
            samples.at(-1)?.passwordPageDetection || null,

        medians: {
            lcpMs: median(
                samples.map(
                    (sample) => sample.lcpMs
                )
            ),

            cls: median(
                samples.map(
                    (sample) => sample.cls
                )
            ),

            tbtMs: median(
                samples.map(
                    (sample) => sample.tbtMs
                )
            ),

            imageBytes: median(
                samples.map(
                    (sample) =>
                        sample.imageBytes
                )
            ),

            imageRequestCount: median(
                samples.map(
                    (sample) =>
                        sample.imageRequestCount
                )
            ),

            resourceCount: median(
                samples.map(
                    (sample) =>
                        sample.resourceCount
                )
            ),

            totalTransferBytes: median(
                samples.map(
                    (sample) =>
                        sample.totalTransferBytes
                )
            ),

            cssBytes: median(
                samples.map(
                    (sample) =>
                        sample.cssBytes
                )
            ),

            cssRequestCount: median(
                samples.map(
                    (sample) =>
                        sample.cssRequestCount
                )
            ),

            jsBytes: median(
                samples.map(
                    (sample) =>
                        sample.jsBytes
                )
            ),

            jsRequestCount: median(
                samples.map(
                    (sample) =>
                        sample.jsRequestCount
                )
            ),

            globalChromeResourceCount: median(
                samples.map(
                    (sample) =>
                        sample.globalChromeResourceCount
                )
            ),

            globalChromeCssBytes: median(
                samples.map(
                    (sample) =>
                        sample.globalChromeCssBytes
                )
            ),

            globalChromeCssRequestCount: median(
                samples.map(
                    (sample) =>
                        sample.globalChromeCssRequestCount
                )
            ),

            globalChromeJsBytes: median(
                samples.map(
                    (sample) =>
                        sample.globalChromeJsBytes
                )
            ),

            globalChromeJsRequestCount: median(
                samples.map(
                    (sample) =>
                        sample.globalChromeJsRequestCount
                )
            ),

            globalChromeTransferBytes: median(
                samples.map(
                    (sample) =>
                        sample.globalChromeTransferBytes
                )
            ),
        },

        worst: {
            maxImageBytes: Math.max(
                ...samples.map(
                    (sample) =>
                        sample.maxImageBytes
                )
            ),

            immediateVideoIframes:
                Math.max(
                    ...samples.map(
                        (sample) =>
                            sample
                                .immediateVideoIframes
                    )
                ),

            autoplayMedia: Math.max(
                ...samples.map(
                    (sample) =>
                        sample.autoplayMedia
                )
            ),

            thirdPartyScriptHosts: [
                ...new Set(
                    samples.flatMap(
                        (sample) =>
                            sample
                                .thirdPartyScriptHosts
                    )
                ),
            ].sort(),
        },

        samples,
        globalChrome: {
            metrics: [],
        },
        warnings: [],
        violations: [],
    };

    const runtime = budget.runtime;

    const imageBudget =
        options.desktop
            ? runtime
                .desktopInitialImageBytes
            : runtime
                .mobileInitialImageBytes;

    const maxImageBudget =
        options.desktop
            ? runtime.desktopMaxImageBytes
            : runtime.mobileMaxImageBytes;

    if (
        ['homepage', 'collection', 'product']
            .includes(route.name)
        && Math.max(
            ...samples.map(
                (sample) =>
                    sample.imageRequestCount || 0
            )
        ) === 0
    ) {
        summary.warnings.push(
            `${route.name} recorded zero image requests. Confirm this is expected for the measured storefront document.`,
        );
    }

    if (
        summary.medians.lcpMs <= 0
    ) {
        summary.violations.push(
            'LCP was not captured.'
        );
    } else if (
        summary.medians.lcpMs >
        runtime.lcpMs
    ) {
        summary.violations.push(
            `Median LCP ` +
            `${summary.medians.lcpMs.toFixed(
                0
            )} ms exceeds ` +
            `${runtime.lcpMs} ms.`
        );
    }

    if (
        summary.medians.cls >
        runtime.cls
    ) {
        summary.violations.push(
            `Median CLS ` +
            `${summary.medians.cls.toFixed(
                3
            )} exceeds ${runtime.cls}.`
        );
    }

    if (
        summary.medians.tbtMs >
        runtime.tbtMs
    ) {
        summary.violations.push(
            `Median TBT ` +
            `${summary.medians.tbtMs.toFixed(
                0
            )} ms exceeds ` +
            `${runtime.tbtMs} ms.`
        );
    }

    if (
        summary.medians.imageBytes >
        imageBudget
    ) {
        summary.violations.push(
            `Median initial image transfer ` +
            `${formatBytes(
                summary.medians.imageBytes
            )} exceeds ` +
            `${formatBytes(imageBudget)}.`
        );
    }

    if (
        summary.worst.maxImageBytes >
        maxImageBudget
    ) {
        summary.violations.push(
            `Largest image ` +
            `${formatBytes(
                summary.worst.maxImageBytes
            )} exceeds ` +
            `${formatBytes(
                maxImageBudget
            )}.`
        );
    }

    if (
        summary.worst
            .immediateVideoIframes >
        runtime
            .immediateVideoIframeCount
    ) {
        summary.violations.push(
            `Found ` +
            `${summary.worst
                .immediateVideoIframes} ` +
            `immediately loaded video iframe(s).`
        );
    }

    if (
        summary.worst.autoplayMedia >
        runtime.autoplayMediaCount
    ) {
        summary.violations.push(
            `Found ` +
            `${summary.worst
                .autoplayMedia} ` +
            `autoplay media element(s).`
        );
    }

    if (
        summary.worst
            .thirdPartyScriptHosts.length >
        runtime
            .thirdPartyScriptHostCount
    ) {
        summary.violations.push(
            `Found ` +
            `${summary.worst
                .thirdPartyScriptHosts.length} ` +
            `third party script host(s): ` +
            summary.worst
                .thirdPartyScriptHosts
                .join(', ')
        );
    }

    const globalRuntime = budget.globalChrome.runtime;
    const resourceCountBudget =
        options.desktop
            ? globalRuntime.desktopMaxResourceCount
            : globalRuntime.mobileMaxResourceCount;

    summary.globalChrome.metrics = [
        budgetMetric(
            'resourceCount',
            summary.medians.globalChromeResourceCount,
            resourceCountBudget,
        ),
        budgetMetric(
            'cssRequestCount',
            summary.medians.globalChromeCssRequestCount,
            globalRuntime.maxCssRequestCount,
        ),
        budgetMetric(
            'jsRequestCount',
            summary.medians.globalChromeJsRequestCount,
            globalRuntime.maxJsRequestCount,
        ),
        budgetMetric(
            'thirdPartyScriptHostCount',
            summary.worst.thirdPartyScriptHosts.length,
            globalRuntime.thirdPartyScriptHostCount,
        ),
        budgetMetric(
            'totalTransferBytes',
            summary.medians.globalChromeTransferBytes,
            globalRuntime.totalTransferBytes,
        ),
    ];

    summary.violations.push(
        ...summary.globalChrome.metrics
            .map((metric) => metricViolation(
                metric,
                `Global chrome runtime ${metric.id}`,
            ))
            .filter(Boolean),
    );

    return summary;
}

async function runRuntimeValidation(
    budget,
    options
) {
    let playwright;

    try {
        playwright =
            require('@playwright/test');
    } catch {
        fail(
            '@playwright/test is required ' +
            'for runtime checks.'
        );
    }

    const device = options.desktop
        ? {
            viewport: {
                width: 1440,
                height: 900,
            },
        }
        : (
            playwright.devices[
                'Pixel 7'
                ] ||
            playwright.devices[
                'Pixel 5'
                ] ||
            {
                viewport: {
                    width: 390,
                    height: 844,
                },
                deviceScaleFactor: 1,
                isMobile: true,
                hasTouch: true,
            }
        );

    const browser =
        await playwright.chromium.launch({
            headless: true,
        });

    const context =
        await browser.newContext({
            ...device,
        });

    const page =
        await context.newPage();

    await installPerformanceObservers(
        page
    );

    await unlockStorefront(page);

    const recorder =
        await createNetworkRecorder(
            context,
            page
        );

    const routes = resolveRoutes(
        budget,
        options.route
    );

    const reports = [];

    try {
        for (const route of routes) {
            if (!route.resolvedPath) {
                reports.push({
                    route: route.name,
                    path: '',
                    mode: options.desktop
                        ? 'desktop'
                        : 'mobile',
                    runs: 0,
                    violations: route.required
                        ? [
                            `Required route is missing. ` +
                            `Set ${route.env || 'its path'}.`,
                        ]
                        : [],
                    skipped: !route.required,
                });

                continue;
            }

            try {
                reports.push(
                    await measureRoute(
                        page,
                        recorder,
                        budget,
                        route,
                        options
                    )
                );
            } catch (error) {
                reports.push({
                    route: route.name,
                    path: route.resolvedPath,
                    requestedUrl:
                        buildStorefrontUrl(
                            route.resolvedPath
                        ),
                    finalUrl:
                        error.routeIdentity?.finalUrl || '',
                    canonicalUrl:
                        error.routeIdentity?.canonicalUrl || '',
                    documentTitle:
                        error.routeIdentity?.documentTitle || '',
                    passwordPageDetection:
                        error.routeIdentity
                            ?.passwordPageDetection || null,
                    resourceCountsByType:
                        error.resources
                            ?.resourceCountsByType || {},
                    resourceCount:
                        error.resources
                            ?.resourceCount || 0,
                    cssRequestCount:
                        error.resources
                            ?.cssRequestCount || 0,
                    jsRequestCount:
                        error.resources
                            ?.jsRequestCount || 0,
                    imageRequestCount:
                        error.resources
                            ?.imageRequestCount || 0,
                    imageTransferBytes:
                        error.resources
                            ?.imageTransferBytes || 0,
                    mode: options.desktop
                        ? 'desktop'
                        : 'mobile',
                    runs: 0,
                    violations: [
                        error.message,
                    ],
                    error: error.stack,
                });
            }
        }
    } finally {
        await browser.close();
    }

    return reports;
}

function printStaticResult(result) {
    console.log(
        '\nBrand performance repository budget'
    );

    console.log(
        `- Rhino CSS gzip: ` +
        `${formatBytes(
            result.details
                .rhinoCssGzipBytes
        )}`
    );

    console.log(
        `- Rhino JavaScript gzip: ` +
        `${formatBytes(
            result.details
                .rhinoJsGzipBytes
        )}`
    );

    console.log(
        `- Rhino icons: ` +
        `${result.details.rhinoIconCount}`
    );

    console.log(
        `- Largest Rhino icon: ` +
        `${formatBytes(
            result.details
                .rhinoIconMaxBytes
        )}`
    );

    console.log(
        `- Texture assets: ` +
        `${result.details
            .textureAssets.length}`
    );

    console.log(
        `- External font hosts: ` +
        `${result.details
            .externalFontHosts.length}`
    );

    console.log(
        `- Synchronous third party scripts: ` +
        `${result.details
            .synchronousThirdPartyScripts
            .length}`
    );

    console.log(
        `- Immediate video embeds: ` +
        `${result.details
            .immediateVideoEmbeds.length}`
    );

    console.log(
        `- Autoplay media: ` +
        `${result.details
            .autoplayMedia.length}`
    );

    console.log(
        '- Global chrome local assets: ' +
        `${result.details.globalChrome.details.localAssets.length}`
    );

    console.log(
        '- Global chrome CSS gzip: ' +
        `${formatBytes(
            result.details.globalChrome.details
                .headerFooterCssGzipBytes
        )}`
    );

    console.log(
        '- Global chrome JS gzip: ' +
        `${formatBytes(
            result.details.globalChrome.details
                .headerFooterJsGzipBytes
        )}`
    );

    console.log(
        '- Global chrome icon assets: ' +
        `${result.details.globalChrome.details.iconAssetCount}`
    );
}

function printRuntimeResult(reports) {
    console.log(
        '\nBrand performance storefront budget'
    );

    for (const report of reports) {
        if (report.skipped) {
            console.log(
                `- ${report.route}: skipped`
            );
            continue;
        }

        if (!report.medians) {
            console.log(
                `- ${report.route}: ` +
                `failed to measure`
            );
            continue;
        }

        console.log(
            `- ${report.route}: ` +
            `LCP ` +
            `${report.medians.lcpMs.toFixed(
                0
            )} ms; ` +
            `CLS ` +
            `${report.medians.cls.toFixed(
                3
            )}; ` +
            `TBT ` +
            `${report.medians.tbtMs.toFixed(
                0
            )} ms; ` +
            `images ` +
            `${formatBytes(
                report.medians.imageBytes
            )}; ` +
            `image requests ` +
            `${report.medians.imageRequestCount}; ` +
            `resources ` +
            `${report.medians.resourceCount}; ` +
            `global chrome resources ` +
            `${report.medians.globalChromeResourceCount}; ` +
            `global chrome JS ` +
            `${report.medians.globalChromeJsRequestCount}; ` +
            `final ${report.finalUrl || 'unknown'}`
        );

        for (const warning of report.warnings || []) {
            console.warn(
                `  WARNING: ${warning}`
            );
        }
    }
}

async function main() {
    const options = parseArguments(
        process.argv.slice(2)
    );

    const budget = readJson(
        BUDGET_PATH
    );

    validateBudgetShape(budget);

    const staticResult =
        runStaticValidation(budget);

    printStaticResult(staticResult);

    let runtimeReports = [];

    if (options.runtime) {
        runtimeReports =
            await runRuntimeValidation(
                budget,
                options
            );

        printRuntimeResult(
            runtimeReports
        );
    }

    fs.mkdirSync(
        options.reportDir,
        { recursive: true }
    );

    const reportPath = path.join(
        options.reportDir,
        options.runtime
            ? (
                `brand-performance-` +
                `${options.desktop
                    ? 'desktop'
                    : 'mobile'
                }.json`
            )
            : 'brand-performance-static.json'
    );

    fs.writeFileSync(
        reportPath,
        `${JSON.stringify(
            {
                generatedAt:
                    new Date().toISOString(),
                static: staticResult,
                runtime: runtimeReports,
            },
            null,
            2
        )}\n`
    );

    console.log(
        `\nReport: ` +
        `${path.relative(
            ROOT,
            reportPath
        )}`
    );

    const violations = [
        ...staticResult.violations.map(
            (message) =>
                `static: ${message}`
        ),

        ...runtimeReports.flatMap(
            (report) =>
                (
                    report.violations || []
                ).map(
                    (message) =>
                        `${report.route}: ${message}`
                )
        ),
    ];

    if (violations.length) {
        console.error(
            `\nBrand performance validation failed:\n- ` +
            violations.join('\n- ')
        );

        process.exitCode = 1;
        return;
    }

    console.log(
        '\nBrand performance validation passed.'
    );
}

if (require.main === module) {
    main().catch((error) => {
        console.error(
            `Brand performance validation failed: ` +
            `${error.stack || error.message}`
        );

        process.exitCode = 1;
    });
}

module.exports = {
    assertMeasurableStorefrontPage,
    buildStorefrontUrl,
    collectRouteIdentity,
    isRelatedStorefrontPath,
    readCanonicalUrl,
    resolveRoutes,
    summarizeResources,
};
