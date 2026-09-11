'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
    StorefrontChallengeError,
    gotoUnlocked,
    storefrontUrl,
    unlockStorefront,
} = require('../tests/helpers/storefront-auth');

try {
    require('dotenv').config();
} catch {
    // CI may provide environment variables directly.
}

const ROOT = path.resolve(__dirname, '..');
const BUDGET_PATH = path.join(ROOT, 'data', 'brand-performance-budget.json');
const OUTCOMES_PATH = path.join(ROOT, 'data', 'homepage-section-outcomes.json');
const MEDIA_PATH = path.join(ROOT, 'data', 'media-manifest.json');
const RESULT_ROOT = path.join(ROOT, 'test-results', 'epic-d');
const VIDEO_HOST_PATTERN = /(youtube(?:-nocookie)?\.com|youtu\.be|player\.vimeo\.com|vimeo\.com)/i;

const VIEWPORTS = [
    {
        id: 'mobile-390',
        width: 390,
        height: 844,
        mode: 'mobile',
    },
    {
        id: 'desktop-1440',
        width: 1440,
        height: 900,
        mode: 'desktop',
    },
];

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function relative(filePath) {
    return path.relative(ROOT, filePath).replaceAll('\\', '/');
}

function formatBytes(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
}

function safeHostname(rawUrl) {
    try {
        return new URL(rawUrl.replace(/[),.;]+$/, '')).hostname.toLowerCase();
    } catch {
        return '';
    }
}

function isAllowedHost(hostname, budget, baseHostname = '') {
    const host = String(hostname || '').toLowerCase();

    if (!host) {
        return true;
    }

    if (baseHostname && host === baseHostname.toLowerCase()) {
        return true;
    }

    return (budget.allowedHostSuffixes || []).some((suffix) => {
        const normalized = String(suffix || '').toLowerCase();

        if (!normalized) {
            return false;
        }

        if (normalized.startsWith('.')) {
            return host === normalized.slice(1) || host.endsWith(normalized);
        }

        return host === normalized || host.endsWith(`.${normalized}`);
    });
}

function parseArguments(argv) {
    const options = {
        runtime: false,
        runs: 1,
        reportDir: RESULT_ROOT,
    };

    for (const argument of argv) {
        if (argument === '--runtime') {
            options.runtime = true;
        } else if (argument.startsWith('--runs=')) {
            options.runs = Number(argument.slice('--runs='.length));
        } else if (argument.startsWith('--report-dir=')) {
            options.reportDir = path.resolve(ROOT, argument.slice('--report-dir='.length));
        } else {
            throw new Error(`Unknown argument: ${argument}`);
        }
    }

    if (!Number.isInteger(options.runs) || options.runs < 1 || options.runs > 10) {
        throw new Error('--runs must be an integer from 1 through 10.');
    }

    return options;
}

function validateBudgetShape(budget) {
    const homepage = budget.homepage;
    const requiredNumbers = [
        ['homepage.static.immediateVideoEmbedCount', homepage?.static?.immediateVideoEmbedCount],
        ['homepage.static.autoplayMediaCount', homepage?.static?.autoplayMediaCount],
        ['homepage.static.synchronousThirdPartyScriptCount', homepage?.static?.synchronousThirdPartyScriptCount],
        ['homepage.runtime.settleMs', homepage?.runtime?.settleMs],
        ['homepage.runtime.interRunDelayMs', homepage?.runtime?.interRunDelayMs],
        ['homepage.runtime.lcpMs', homepage?.runtime?.lcpMs],
        ['homepage.runtime.cls', homepage?.runtime?.cls],
        ['homepage.runtime.tbtMs', homepage?.runtime?.tbtMs],
        ['homepage.runtime.mobileInitialTransferBytes', homepage?.runtime?.mobileInitialTransferBytes],
        ['homepage.runtime.desktopInitialTransferBytes', homepage?.runtime?.desktopInitialTransferBytes],
        ['homepage.runtime.mobileRequestCount', homepage?.runtime?.mobileRequestCount],
        ['homepage.runtime.desktopRequestCount', homepage?.runtime?.desktopRequestCount],
        ['homepage.runtime.mobileImageBytes', homepage?.runtime?.mobileImageBytes],
        ['homepage.runtime.desktopImageBytes', homepage?.runtime?.desktopImageBytes],
        ['homepage.runtime.mobileFirstScreenMediaBytes', homepage?.runtime?.mobileFirstScreenMediaBytes],
        ['homepage.runtime.desktopFirstScreenMediaBytes', homepage?.runtime?.desktopFirstScreenMediaBytes],
        ['homepage.runtime.immediateVideoIframeCount', homepage?.runtime?.immediateVideoIframeCount],
        ['homepage.runtime.autoplayMediaCount', homepage?.runtime?.autoplayMediaCount],
        ['homepage.runtime.thirdPartyScriptHostCount', homepage?.runtime?.thirdPartyScriptHostCount],
    ];
    const errors = [];

    for (const [name, value] of requiredNumbers) {
        if (typeof value !== 'number' || value < 0) {
            errors.push(`${name} must be a non-negative number.`);
        }
    }

    if (homepage?.runtime?.route !== '/') {
        errors.push('homepage.runtime.route must be /.');
    }

    if (homepage?.runtime?.firstScreenMediaRequiresDimensions !== true) {
        errors.push('homepage.runtime.firstScreenMediaRequiresDimensions must be true.');
    }

    if (homepage?.runtime?.noncriticalMediaMustLazyLoad !== true) {
        errors.push('homepage.runtime.noncriticalMediaMustLazyLoad must be true.');
    }

    if (errors.length > 0) {
        throw new Error(`Invalid homepage performance budget:\n- ${errors.join('\n- ')}`);
    }
}

function homepageModules(outcomes) {
    return new Map((outcomes.modules || []).map((module) => [module.id, module]));
}

function implementedModule(module) {
    return module?.implementationState === 'implemented' || module?.status === 'approved';
}

function homepageSectionSourceFiles() {
    const templatePath = path.join(ROOT, 'templates', 'index.json');
    const template = readJson(templatePath);
    const files = [templatePath];

    for (const section of Object.values(template.sections || {})) {
        if (!section?.type) {
            continue;
        }

        const sectionPath = path.join(ROOT, 'sections', `${section.type}.liquid`);

        if (fs.existsSync(sectionPath)) {
            files.push(sectionPath);
        }
    }

    return files;
}

function removeInertTemplateContents(source) {
    return source.replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, '');
}

function runStaticValidation(budget, outcomes, mediaManifest) {
    const homepageBudget = budget.homepage.static;
    const modules = homepageModules(outcomes);
    const hero = modules.get('homepage-first-screen-gateway');
    const sourceFiles = homepageSectionSourceFiles();
    const synchronousThirdPartyScripts = [];
    const immediateVideoEmbeds = [];
    const autoplayMedia = [];
    const violations = [];
    const warnings = [];

    for (const filePath of sourceFiles) {
        const text = fs.readFileSync(filePath, 'utf8');
        const initiallyActiveText = removeInertTemplateContents(text);
        const source = relative(filePath);

        for (const match of initiallyActiveText.matchAll(/<script\b[^>]*>/gi)) {
            const tag = match[0];
            const src = tag.match(/\bsrc\s*=\s*["'](https?:\/\/[^"']+)["']/i)?.[1] || '';
            const host = safeHostname(src);
            const deferred = /\b(?:async|defer)(?:\s|=|>)/i.test(tag)
                || /\btype\s*=\s*["']module["']/i.test(tag);

            if (host && !isAllowedHost(host, budget) && !deferred) {
                synchronousThirdPartyScripts.push({
                    source,
                    host,
                    tag,
                });
            }
        }

        for (const match of initiallyActiveText.matchAll(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
            if (VIDEO_HOST_PATTERN.test(match[1])) {
                immediateVideoEmbeds.push({
                    source,
                    src: match[1],
                });
            }
        }

        for (const match of initiallyActiveText.matchAll(/<(?:video|audio)\b[^>]*\bautoplay\b[^>]*>/gi)) {
            autoplayMedia.push({
                source,
                tag: match[0],
            });
        }
    }

    if (synchronousThirdPartyScripts.length > homepageBudget.synchronousThirdPartyScriptCount) {
        violations.push(`Found ${synchronousThirdPartyScripts.length} synchronous third-party homepage script tag(s).`);
    }

    if (immediateVideoEmbeds.length > homepageBudget.immediateVideoEmbedCount) {
        violations.push(`Found ${immediateVideoEmbeds.length} immediate homepage video embed(s).`);
    }

    if (autoplayMedia.length > homepageBudget.autoplayMediaCount) {
        violations.push(`Found ${autoplayMedia.length} homepage autoplay media element(s).`);
    }

    if (implementedModule(hero)) {
        const candidates = mediaManifest.homepageInventory?.candidates || [];
        const readyHeroMedia = candidates.filter((candidate) =>
            (candidate.intendedModuleIds || []).includes(hero.id)
            && candidate.launchReadiness === 'ready'
        );

        if (hero.heroContentContract?.mediaSourceState === 'blocked') {
            violations.push('Implemented hero cannot retain blocked mediaSourceState.');
        }

        if (readyHeroMedia.length === 0) {
            violations.push('Implemented hero requires at least one launch-ready homepage media candidate.');
        }
    } else {
        warnings.push('Hero media checks are conditional because homepage-first-screen-gateway is not implemented.');
    }

    return {
        sourceFiles: sourceFiles.map(relative),
        synchronousThirdPartyScripts,
        immediateVideoEmbeds,
        autoplayMedia,
        warnings,
        violations,
    };
}

async function installPerformanceObservers(page) {
    await page.addInitScript(() => {
        window.__rhinoHomepagePerformance = {
            lcpMs: 0,
            cls: 0,
            tbtMs: 0,
            lcpCandidate: null,
        };

        const observe = (type, callback) => {
            try {
                if (!PerformanceObserver.supportedEntryTypes?.includes(type)) {
                    return;
                }

                const observer = new PerformanceObserver((list) => callback(list.getEntries()));
                observer.observe({
                    type,
                    buffered: true,
                });
            } catch {
                // Unsupported observer types report zero values.
            }
        };

        observe('largest-contentful-paint', (entries) => {
            const last = entries.at(-1);

            if (!last) {
                return;
            }

            const element = last.element || null;

            window.__rhinoHomepagePerformance.lcpMs = last.startTime;
            window.__rhinoHomepagePerformance.lcpCandidate = {
                startTime: last.startTime,
                size: last.size || 0,
                url: last.url || element?.currentSrc || element?.src || '',
                tagName: element?.tagName?.toLowerCase() || '',
                text: (element?.innerText || element?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
            };
        });

        observe('layout-shift', (entries) => {
            for (const entry of entries) {
                if (!entry.hadRecentInput) {
                    window.__rhinoHomepagePerformance.cls += entry.value;
                }
            }
        });

        observe('longtask', (entries) => {
            for (const entry of entries) {
                window.__rhinoHomepagePerformance.tbtMs += Math.max(0, entry.duration - 50);
            }
        });
    });
}

async function createNetworkRecorder(context, page) {
    const session = await context.newCDPSession(page);

    await session.send('Network.enable');

    let recording = false;
    let records = new Map();

    session.on('Network.requestWillBeSent', (event) => {
        if (!recording) {
            return;
        }

        records.set(event.requestId, {
            url: event.request.url,
            type: event.type || 'Other',
            mimeType: '',
            status: 0,
            bytes: 0,
            failed: false,
        });
    });

    session.on('Network.responseReceived', (event) => {
        if (!recording) {
            return;
        }

        const record = records.get(event.requestId);

        if (!record) {
            return;
        }

        record.type = event.type || record.type;
        record.mimeType = event.response.mimeType || '';
        record.status = event.response.status || 0;
    });

    session.on('Network.loadingFinished', (event) => {
        if (!recording) {
            return;
        }

        const record = records.get(event.requestId);

        if (record) {
            record.bytes = event.encodedDataLength || 0;
        }
    });

    session.on('Network.loadingFailed', (event) => {
        if (!recording) {
            return;
        }

        const record = records.get(event.requestId);

        if (record) {
            record.failed = true;
        }
    });

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

function summarizeResources(resources, budget, baseHostname) {
    const successful = resources.filter((resource) =>
        !resource.failed && resource.status < 400
    );
    const images = successful.filter((resource) =>
        resource.type === 'Image' && !/^data:/i.test(resource.url)
    );
    const scripts = successful.filter((resource) => resource.type === 'Script');
    const thirdPartyScriptHosts = [
        ...new Set(scripts
            .map((resource) => safeHostname(resource.url))
            .filter((host) => host && !isAllowedHost(host, budget, baseHostname))),
    ].sort();

    return {
        resourceCount: successful.length,
        totalTransferBytes: successful.reduce((sum, resource) => sum + resource.bytes, 0),
        imageRequestCount: images.length,
        imageBytes: images.reduce((sum, resource) => sum + resource.bytes, 0),
        largestImages: [...images]
            .sort((left, right) => right.bytes - left.bytes)
            .slice(0, 10)
            .map((resource) => ({
                url: resource.url,
                bytes: resource.bytes,
            })),
        maxImageBytes: images.length ? Math.max(...images.map((resource) => resource.bytes)) : 0,
        requestCountsByType: successful.reduce((counts, resource) => {
            counts[resource.type] = (counts[resource.type] || 0) + 1;
            return counts;
        }, {}),
        thirdPartyScriptHosts,
        resources: successful.map((resource) => ({
            url: resource.url,
            type: resource.type,
            bytes: resource.bytes,
            status: resource.status,
        })),
    };
}

function median(values) {
    const sorted = values.filter(Number.isFinite).sort((left, right) => left - right);

    if (!sorted.length) {
        return 0;
    }

    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
}

function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function collectDomMedia(page) {
    return page.evaluate(() => {
        function visible(element) {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);

            return (
                rect.width > 0
                && rect.height > 0
                && style.display !== 'none'
                && style.visibility !== 'hidden'
            );
        }

        function mediaEntry(element) {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            const tag = element.tagName.toLowerCase();
            const source = element.currentSrc || element.src || element.poster || '';
            const widthAttr = element.getAttribute('width') || '';
            const heightAttr = element.getAttribute('height') || '';
            const hasReservedDimensions = Boolean(
                (widthAttr && heightAttr)
                || style.aspectRatio !== 'auto'
                || element.closest('[style*="aspect-ratio"]')
            );

            return {
                tag,
                source,
                alt: element.getAttribute('alt'),
                loading: element.getAttribute('loading') || '',
                fetchPriority: element.getAttribute('fetchpriority') || '',
                widthAttr,
                heightAttr,
                naturalWidth: element.naturalWidth || element.videoWidth || 0,
                naturalHeight: element.naturalHeight || element.videoHeight || 0,
                rect: {
                    top: Math.round(rect.top),
                    left: Math.round(rect.left),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                },
                inFirstScreen: rect.top < window.innerHeight && rect.bottom > 0,
                hasReservedDimensions,
            };
        }

        const allMedia = [...document.querySelectorAll('main img, main video, main iframe')]
            .filter(visible)
            .map(mediaEntry);

        return {
            allMedia,
            firstScreenMedia: allMedia.filter((entry) => entry.inFirstScreen),
            belowFoldMedia: allMedia.filter((entry) => !entry.inFirstScreen),
            immediateVideoIframes: [...document.querySelectorAll('iframe[src]')]
                .filter((iframe) => /(youtube(?:-nocookie)?\.com|youtu\.be|player\.vimeo\.com|vimeo\.com)/i.test(iframe.src))
                .length,
            autoplayMedia: document.querySelectorAll('video[autoplay], audio[autoplay]').length,
        };
    });
}

function bytesForMedia(media, resources) {
    return media.map((entry) => {
        const matching = resources.find((resource) => (
            entry.source
            && (
                resource.url === entry.source
                || resource.url.startsWith(entry.source)
                || entry.source.startsWith(resource.url)
            )
        ));

        return {
            ...entry,
            transferBytes: matching?.bytes || 0,
        };
    });
}

function evaluateRuntimeSample(sample, budget, outcomes) {
    const runtime = budget.homepage.runtime;
    const modules = homepageModules(outcomes);
    const hero = modules.get('homepage-first-screen-gateway');
    const threshold = sample.viewport.mode === 'desktop'
        ? {
            transferBytes: runtime.desktopInitialTransferBytes,
            requestCount: runtime.desktopRequestCount,
            imageBytes: runtime.desktopImageBytes,
            firstScreenMediaBytes: runtime.desktopFirstScreenMediaBytes,
        }
        : {
            transferBytes: runtime.mobileInitialTransferBytes,
            requestCount: runtime.mobileRequestCount,
            imageBytes: runtime.mobileImageBytes,
            firstScreenMediaBytes: runtime.mobileFirstScreenMediaBytes,
        };
    const violations = [];
    const warnings = [];

    if (sample.lcpMs <= 0) {
        violations.push('LCP was not captured.');
    } else if (sample.lcpMs > runtime.lcpMs) {
        violations.push(`LCP ${sample.lcpMs.toFixed(0)} ms exceeds ${runtime.lcpMs} ms.`);
    }

    if (sample.cls > runtime.cls) {
        violations.push(`CLS ${sample.cls.toFixed(3)} exceeds ${runtime.cls}.`);
    }

    if (sample.tbtMs > runtime.tbtMs) {
        violations.push(`TBT ${sample.tbtMs.toFixed(0)} ms exceeds ${runtime.tbtMs} ms.`);
    }

    if (sample.resourceCount > threshold.requestCount) {
        violations.push(`Request count ${sample.resourceCount} exceeds ${threshold.requestCount}.`);
    }

    if (sample.totalTransferBytes > threshold.transferBytes) {
        violations.push(`Initial transfer ${formatBytes(sample.totalTransferBytes)} exceeds ${formatBytes(threshold.transferBytes)}.`);
    }

    if (sample.imageBytes > threshold.imageBytes) {
        violations.push(`Image transfer ${formatBytes(sample.imageBytes)} exceeds ${formatBytes(threshold.imageBytes)}.`);
    }

    if (sample.firstScreenMediaBytes > threshold.firstScreenMediaBytes) {
        violations.push(`First-screen media transfer ${formatBytes(sample.firstScreenMediaBytes)} exceeds ${formatBytes(threshold.firstScreenMediaBytes)}.`);
    }

    if (sample.immediateVideoIframes > runtime.immediateVideoIframeCount) {
        violations.push(`Found ${sample.immediateVideoIframes} immediate video iframe(s).`);
    }

    if (sample.autoplayMedia > runtime.autoplayMediaCount) {
        violations.push(`Found ${sample.autoplayMedia} autoplay media element(s).`);
    }

    if (sample.thirdPartyScriptHosts.length > runtime.thirdPartyScriptHostCount) {
        violations.push(`Found ${sample.thirdPartyScriptHosts.length} third-party script host(s): ${sample.thirdPartyScriptHosts.join(', ')}`);
    }

    const missingDimensions = sample.firstScreenMedia.filter((entry) => !entry.hasReservedDimensions);

    if (implementedModule(hero) && missingDimensions.length > 0) {
        violations.push(`First-screen media missing reserved dimensions: ${missingDimensions.map((entry) => entry.source || entry.tag).join(', ')}`);
    }

    const eagerBelowFold = sample.belowFoldMedia.filter((entry) =>
        entry.tag === 'img' && entry.loading.toLowerCase() !== 'lazy'
    );

    if (eagerBelowFold.length > 0) {
        violations.push(`Noncritical below-fold image media is not lazy-loaded: ${eagerBelowFold.map((entry) => entry.source || entry.tag).join(', ')}`);
    }

    if (!implementedModule(hero) && sample.firstScreenMedia.length === 0) {
        warnings.push('Current homepage has no first-screen content media; this is baseline state, not the future desired condition.');
    }

    return {
        violations,
        warnings,
    };
}

async function measureViewport(browser, viewport, budget, outcomes, options) {
    const cleanPreviewRoute = '/?pb=0&_fd=0';
    const context = await browser.newContext({
        viewport: {
            width: viewport.width,
            height: viewport.height,
        },
        deviceScaleFactor: viewport.mode === 'mobile' ? 2 : 1,
        isMobile: viewport.mode === 'mobile',
        hasTouch: viewport.mode === 'mobile',
    });
    const page = await context.newPage();
    const recorder = await createNetworkRecorder(context, page);
    const targetUrl = storefrontUrl(cleanPreviewRoute);
    const baseHostname = new URL(targetUrl).hostname;
    const samples = [];

    await installPerformanceObservers(page);
    await unlockStorefront(page);

    try {
        for (let index = 0; index < options.runs; index += 1) {
            await page.goto('about:blank');
            await recorder.session.send('Network.clearBrowserCache');
            recorder.start();

            const navigation = await gotoUnlocked(
                page,
                cleanPreviewRoute,
                `homepage performance ${viewport.id}`,
            );
            const status = navigation.response?.status() || 0;

            if (status >= 400) {
                throw new Error(`Homepage returned HTTP ${status} at ${page.url()}.`);
            }

            await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});
            await page.evaluate(async () => {
                if (document.fonts?.ready) {
                    await document.fonts.ready;
                }
            }).catch(() => {});
            await sleep(budget.homepage.runtime.settleMs);

            const resources = recorder.stop();
            const resourceMetrics = summarizeResources(resources, budget, baseHostname);
            const domMedia = await collectDomMedia(page);
            const firstScreenMedia = bytesForMedia(domMedia.firstScreenMedia, resourceMetrics.resources);
            const belowFoldMedia = bytesForMedia(domMedia.belowFoldMedia, resourceMetrics.resources);
            const perf = await page.evaluate(() => window.__rhinoHomepagePerformance || {
                lcpMs: 0,
                cls: 0,
                tbtMs: 0,
                lcpCandidate: null,
            });
            const sample = {
                run: index + 1,
                viewport,
                finalUrl: page.url(),
                status,
                ...perf,
                ...resourceMetrics,
                allMedia: bytesForMedia(domMedia.allMedia, resourceMetrics.resources),
                firstScreenMedia,
                belowFoldMedia,
                firstScreenMediaBytes: firstScreenMedia.reduce((sum, entry) => sum + entry.transferBytes, 0),
                immediateVideoIframes: domMedia.immediateVideoIframes,
                autoplayMedia: domMedia.autoplayMedia,
            };
            const evaluation = evaluateRuntimeSample(sample, budget, outcomes);

            samples.push({
                ...sample,
                warnings: evaluation.warnings,
                violations: evaluation.violations,
            });

            if (index + 1 < options.runs) {
                await sleep(budget.homepage.runtime.interRunDelayMs);
            }
        }
    } finally {
        await context.close();
    }

    const medians = {
        lcpMs: median(samples.map((sample) => sample.lcpMs)),
        cls: median(samples.map((sample) => sample.cls)),
        tbtMs: median(samples.map((sample) => sample.tbtMs)),
        resourceCount: median(samples.map((sample) => sample.resourceCount)),
        totalTransferBytes: median(
            samples.map((sample) => sample.totalTransferBytes),
        ),
        imageBytes: median(samples.map((sample) => sample.imageBytes)),
        imageRequestCount: median(
            samples.map((sample) => sample.imageRequestCount),
        ),
        firstScreenMediaBytes: median(
            samples.map((sample) => sample.firstScreenMediaBytes),
        ),
    };

    const worst = {
        immediateVideoIframes: Math.max(
            ...samples.map((sample) => sample.immediateVideoIframes),
        ),
        autoplayMedia: Math.max(
            ...samples.map((sample) => sample.autoplayMedia),
        ),
        thirdPartyScriptHosts: [
            ...new Set(
                samples.flatMap(
                    (sample) => sample.thirdPartyScriptHosts,
                ),
            ),
        ].sort(),
        maxImageBytes: Math.max(
            ...samples.map((sample) => sample.maxImageBytes),
        ),
    };

    /*
     * Numeric browser/network measurements are inherently noisy,
     * particularly against Shopify preview themes where Shopify-owned
     * telemetry and preview UI can vary between navigations.
     *
     * Gate representative numeric performance on the median while
     * retaining worst-case enforcement for zero-tolerance behavioral
     * conditions.
     */
    const summaryEvaluation = evaluateRuntimeSample(
        {
            run: 'median',
            viewport,
            finalUrl: samples[0]?.finalUrl || '',
            status: Math.max(
                ...samples.map((sample) => sample.status),
            ),

            lcpMs: medians.lcpMs,
            cls: medians.cls,
            tbtMs: medians.tbtMs,
            resourceCount: medians.resourceCount,
            totalTransferBytes: medians.totalTransferBytes,
            imageBytes: medians.imageBytes,
            imageRequestCount: medians.imageRequestCount,
            firstScreenMediaBytes: medians.firstScreenMediaBytes,

            /*
             * These remain worst-case rather than median because a
             * single occurrence should fail the performance contract.
             */
            immediateVideoIframes: worst.immediateVideoIframes,
            autoplayMedia: worst.autoplayMedia,
            thirdPartyScriptHosts: worst.thirdPartyScriptHosts,
            maxImageBytes: worst.maxImageBytes,

            /*
             * Preserve DOM/media invariants across every sample.
             * Missing dimensions or eager below-fold media in even
             * one run remains a failure.
             */
            firstScreenMedia: samples.flatMap(
                (sample) => sample.firstScreenMedia || [],
            ),
            belowFoldMedia: samples.flatMap(
                (sample) => sample.belowFoldMedia || [],
            ),
        },
        budget,
        outcomes,
    );

    const summary = {
        viewport,
        runs: options.runs,
        medians,
        worst,

        /*
         * Individual-sample violations remain in the report for
         * diagnostics, but do not independently fail a multi-run
         * release measurement.
         */
        sampleViolations: samples.map((sample) => ({
            run: sample.run,
            violations: sample.violations,
        })),

        warnings: [
            ...new Set([
                ...samples.flatMap((sample) => sample.warnings),
                ...summaryEvaluation.warnings,
            ]),
        ],

        violations: [
            ...new Set(summaryEvaluation.violations),
        ],

        samples,
    };

    return summary;
}

async function runRuntimeValidation(budget, outcomes, options) {
    const playwright = require('@playwright/test');
    const browser = await playwright.chromium.launch({
        headless: true,
    });
    const reports = [];

    try {
        for (const viewport of VIEWPORTS) {
            reports.push(await measureViewport(browser, viewport, budget, outcomes, options));
        }
    } finally {
        await browser.close();
    }

    return reports;
}

function implementationState(outcomes) {
    const modules = homepageModules(outcomes);

    return {
        hero: modules.get('homepage-first-screen-gateway')?.implementationState || 'unknown',
        customerPathChooser: modules.get('homepage-customer-path-chooser')?.implementationState || 'unknown',
        currentIntro: modules.get('rhino-intro-current')?.implementationState || 'unknown',
    };
}

async function main() {
    const options = parseArguments(process.argv.slice(2));
    const budget = readJson(BUDGET_PATH);
    const outcomes = readJson(OUTCOMES_PATH);
    const mediaManifest = readJson(MEDIA_PATH);

    validateBudgetShape(budget);

    fs.mkdirSync(options.reportDir, { recursive: true });

    const staticResult = runStaticValidation(budget, outcomes, mediaManifest);
    const runtime = options.runtime
        ? await runRuntimeValidation(budget, outcomes, options)
        : [];
    const report = {
        generatedAt: new Date().toISOString(),
        suite: options.runtime
            ? 'homepage-performance-runtime'
            : 'homepage-performance-static',
        previewThemeId: process.env.PREVIEW_THEME_ID || null,
        baselineLabel: 'current-minimal-homepage-before-visible-epic-d-hero',
        implementationState: implementationState(outcomes),
        budget: budget.homepage,
        static: staticResult,
        runtime,
        summary: {
            staticViolationCount: staticResult.violations.length,
            runtimeViolationCount: runtime.reduce((sum, entry) => sum + entry.violations.length, 0),
            runtimeWarningCount: runtime.reduce((sum, entry) => sum + entry.warnings.length, 0),
        },
    };
    const reportPath = path.join(
        options.reportDir,
        options.runtime
            ? 'homepage-performance-runtime.json'
            : 'homepage-performance-static.json',
    );

    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

    console.log(`Homepage performance report: ${relative(reportPath)}`);
    console.log(JSON.stringify(report.summary, null, 2));

    const violations = [
        ...staticResult.violations.map((message) => `static: ${message}`),
        ...runtime.flatMap((entry) =>
            entry.violations.map((message) => `${entry.viewport.id}: ${message}`)
        ),
    ];

    for (const warning of [
        ...staticResult.warnings,
        ...runtime.flatMap((entry) => entry.warnings.map((message) => `${entry.viewport.id}: ${message}`)),
    ]) {
        console.warn(`WARNING: ${warning}`);
    }

    if (violations.length > 0) {
        console.error(`Homepage performance validation failed:\n- ${violations.join('\n- ')}`);
        process.exitCode = 1;
        return;
    }

    console.log('Homepage performance validation passed.');
}

main().catch((error) => {
    console.error(`Homepage performance validation failed: ${error.stack || error.message}`);
    process.exitCode = error instanceof StorefrontChallengeError
        || /challenge|captcha|429|throttling/i.test(error.message)
        ? 2
        : 1;
});
