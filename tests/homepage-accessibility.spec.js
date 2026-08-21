require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const {
    gotoUnlocked,
    unlockStorefront,
} = require('./helpers/storefront');

const ROOT = process.cwd();
const RESULT_ROOT = path.join(ROOT, 'test-results', 'epic-d');
const outcomes = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'homepage-section-outcomes.json'), 'utf8'),
);
const evidence = [];

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

function safeFilePart(value) {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function moduleById(id) {
    return (outcomes.modules || []).find((module) => module.id === id);
}

function implemented(module) {
    return module?.implementationState === 'implemented' || module?.status === 'approved';
}

function viewportForProject(projectName) {
    if (/mobile/i.test(projectName)) {
        return {
            id: 'mobile-390',
            width: 390,
            height: 844,
        };
    }

    return {
        id: 'desktop-1440',
        width: 1440,
        height: 900,
    };
}

async function waitForSettledPage(page) {
    await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});
    await page.evaluate(async () => {
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }
    }).catch(() => {});
    await page.waitForTimeout(250);
}

async function visibleLogicalHeadings(page) {
    return page.locator('main h1, main .h1').evaluateAll((elements) => {
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

        return elements
            .filter(visible)
            .map((element) => ({
                tagName: element.tagName.toLowerCase(),
                className: String(element.className || ''),
                text: (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim(),
            }));
    });
}

async function interactiveNameFailures(page, selector = 'main a, main button, main input, main select, main textarea, main summary') {
    return page.locator(selector).evaluateAll((elements) => {
        function visible(element) {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);

            return (
                rect.width > 0
                && rect.height > 0
                && style.display !== 'none'
                && style.visibility !== 'hidden'
                && !element.closest('[aria-hidden="true"]')
            );
        }

        function textFromIdRefs(ids) {
            return String(ids || '')
                .split(/\s+/)
                .map((id) => document.getElementById(id)?.textContent || '')
                .join(' ');
        }

        function nameFor(element) {
            const label = element.id
                ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)?.textContent || ''
                : '';
            const wrappedLabel = element.closest('label')?.textContent || '';

            return (
                element.getAttribute('aria-label')
                || textFromIdRefs(element.getAttribute('aria-labelledby'))
                || label
                || wrappedLabel
                || element.getAttribute('title')
                || element.getAttribute('alt')
                || element.innerText
                || element.textContent
                || element.getAttribute('value')
                || ''
            ).replace(/\s+/g, ' ').trim();
        }

        return elements
            .filter(visible)
            .map((element, index) => ({
                index,
                tagName: element.tagName.toLowerCase(),
                type: element.getAttribute('type') || '',
                href: element.getAttribute('href') || '',
                name: nameFor(element),
            }))
            .filter((entry) => entry.name.length === 0);
    });
}

async function sourceOrderGeometry(page) {
    return page.locator(
        'main a[href], main button, main input, main select, main textarea, main summary, main [tabindex]:not([tabindex="-1"])',
    ).evaluateAll((elements) => {
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

        return elements.filter(visible).map((element, index) => {
            const rect = element.getBoundingClientRect();

            return {
                index,
                text: (element.innerText || element.getAttribute('aria-label') || element.textContent || '').replace(/\s+/g, ' ').trim(),
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
            };
        });
    });
}

function orderFailures(entries) {
    const failures = [];

    for (let index = 1; index < entries.length; index += 1) {
        const previous = entries[index - 1];
        const current = entries[index];
        const movesUp = current.top < previous.top - 24;
        const sameLineMovesLeft = Math.abs(current.top - previous.top) <= 24
            && current.left < previous.left - 24;

        if (movesUp || sameLineMovesLeft) {
            failures.push({
                previous,
                current,
            });
        }
    }

    return failures;
}

function record(entry) {
    evidence.push({
        generatedAt: new Date().toISOString(),
        ...entry,
    });
}

async function runAxe(page, context) {
    const results = await new AxeBuilder({ page })
        .exclude('#PBarNextFrame')
        .analyze();
    const blockingViolations = results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact)
    );

    record({
        ...context,
        check: 'axe serious/critical',
        status: blockingViolations.length === 0 ? 'passed' : 'failed',
        axeSeriousCount: blockingViolations.filter((violation) => violation.impact === 'serious').length,
        axeCriticalCount: blockingViolations.filter((violation) => violation.impact === 'critical').length,
        axeViolationIds: blockingViolations.map((violation) => violation.id),
    });

    expect(
        blockingViolations,
        JSON.stringify(blockingViolations, null, 2),
    ).toEqual([]);
}

async function requireConditionalModuleAccessibility(page, context, moduleId, label) {
    const module = moduleById(moduleId);

    if (!implemented(module)) {
        record({
            ...context,
            check: `${label} implemented accessibility assertions`,
            status: 'not_applicable',
            reason: `${moduleId} is ${module?.implementationState || module?.status || 'unknown'}.`,
        });
        return;
    }

    const root = page.locator(module.runtimeSelector).first();

    await expect(root).toBeVisible();

    const missingNames = await interactiveNameFailures(page, `${module.runtimeSelector} a, ${module.runtimeSelector} button, ${module.runtimeSelector} input, ${module.runtimeSelector} select, ${module.runtimeSelector} textarea`);

    record({
        ...context,
        check: `${label} interactive names`,
        status: missingNames.length === 0 ? 'passed' : 'failed',
        missingNames,
    });

    expect(missingNames).toEqual([]);
}

test.beforeEach(async ({ page }, testInfo) => {
    const viewport = viewportForProject(testInfo.project.name);

    await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
    });
    await unlockStorefront(page);
});

test('homepage has governed accessibility structure and no serious axe violations', async ({ page }, testInfo) => {
    const viewport = viewportForProject(testInfo.project.name);
    const context = {
        project: testInfo.project.name,
        viewport: viewport.id,
        route: '/',
    };

    await gotoUnlocked(page, '/', 'homepage accessibility');
    await waitForSettledPage(page);

    await expect(page.getByRole('main')).toHaveCount(1);
    record({
        ...context,
        check: 'main landmark count',
        status: 'passed',
        count: 1,
    });

    const logicalHeadings = await visibleLogicalHeadings(page);
    const semanticH1s = logicalHeadings.filter((heading) => heading.tagName === 'h1');
    const hero = moduleById('homepage-first-screen-gateway');

    record({
        ...context,
        check: 'visible logical h1 count',
        status: logicalHeadings.length === 1 ? 'passed' : 'failed',
        logicalHeadingCount: logicalHeadings.length,
        semanticH1Count: semanticH1s.length,
        headings: logicalHeadings,
    });

    expect(
        logicalHeadings,
        `Expected exactly one visible logical H1 candidate. Current Trade rich text may render h2.h1 until the hero owns a semantic h1.`,
    ).toHaveLength(1);
    expect(
        semanticH1s.length,
        'Homepage must never expose multiple semantic h1 elements.',
    ).toBeLessThanOrEqual(1);

    if (implemented(hero)) {
        expect(
            semanticH1s,
            'Implemented hero must provide one semantic h1.',
        ).toHaveLength(1);
    } else {
        record({
            ...context,
            check: 'implemented hero semantic h1',
            status: 'not_applicable',
            reason: `homepage-first-screen-gateway is ${hero?.implementationState || hero?.status || 'unknown'}.`,
        });
    }

    const missingNames = await interactiveNameFailures(page);

    record({
        ...context,
        check: 'main interactive accessible names',
        status: missingNames.length === 0 ? 'passed' : 'failed',
        missingNames,
    });

    expect(
        missingNames,
        `Homepage interactive elements without accessible names:\n${JSON.stringify(missingNames, null, 2)}`,
    ).toEqual([]);

    const order = await sourceOrderGeometry(page);
    const failures = orderFailures(order);

    record({
        ...context,
        check: 'source order follows visible order',
        status: failures.length === 0 ? 'passed' : 'failed',
        focusableCount: order.length,
        failures,
    });

    expect(
        failures,
        `Homepage source order moved backwards visually:\n${JSON.stringify(failures, null, 2)}`,
    ).toEqual([]);

    await requireConditionalModuleAccessibility(page, context, 'homepage-first-screen-gateway', 'hero');
    await requireConditionalModuleAccessibility(page, context, 'homepage-customer-path-chooser', 'customer path chooser');
    await requireConditionalModuleAccessibility(page, context, 'homepage-video-demo', 'media/video');
    await requireConditionalModuleAccessibility(page, context, 'homepage-inquiry-path', 'forms/inquiry');

    await runAxe(page, context);
});

test.afterAll(() => {
    const project = safeFilePart(evidence[0]?.project || 'unknown');
    const summary = evidence.reduce((totals, entry) => {
        totals.total += 1;
        totals.byStatus[entry.status] = (totals.byStatus[entry.status] || 0) + 1;
        totals.axeSeriousCount += entry.axeSeriousCount || 0;
        totals.axeCriticalCount += entry.axeCriticalCount || 0;
        return totals;
    }, {
        total: 0,
        axeSeriousCount: 0,
        axeCriticalCount: 0,
        byStatus: {},
    });

    fs.mkdirSync(RESULT_ROOT, { recursive: true });
    fs.writeFileSync(
        path.join(RESULT_ROOT, `homepage-accessibility-${project}.json`),
        `${JSON.stringify({
            suite: 'homepage-accessibility',
            generatedAt: new Date().toISOString(),
            previewThemeId: process.env.PREVIEW_THEME_ID || null,
            implementationState: {
                hero: moduleById('homepage-first-screen-gateway')?.implementationState || null,
                customerPathChooser: moduleById('homepage-customer-path-chooser')?.implementationState || null,
                video: moduleById('homepage-video-demo')?.implementationState || null,
                inquiry: moduleById('homepage-inquiry-path')?.implementationState || null,
            },
            summary,
            results: evidence,
        }, null, 2)}\n`,
    );
});
