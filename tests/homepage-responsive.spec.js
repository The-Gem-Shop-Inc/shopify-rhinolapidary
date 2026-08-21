require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const {
    gotoUnlocked,
    unlockStorefront,
} = require('./helpers/storefront');

const ROOT = process.cwd();
const RESULT_ROOT = path.join(ROOT, 'test-results', 'epic-d');
const EVIDENCE_ROOT = path.join(ROOT, 'docs', 'qa', 'evidence', 'epic-d');
const DATE_PREFIX = new Date().toISOString().slice(0, 10);
const outcomes = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'homepage-section-outcomes.json'), 'utf8'),
);
const evidence = [];

const VIEWPORTS = [
    { id: 'mobile-360', width: 360, height: 800 },
    { id: 'mobile-390', width: 390, height: 844 },
    { id: 'mobile-430', width: 430, height: 932 },
    { id: 'tablet-768', width: 768, height: 1024 },
    { id: 'tablet-1024', width: 1024, height: 768 },
    { id: 'desktop-1280', width: 1280, height: 720 },
    { id: 'desktop-1440', width: 1440, height: 900 },
    { id: 'desktop-1920', width: 1920, height: 1080 },
];

test.describe.configure({ mode: 'serial' });
test.setTimeout(180_000);

function moduleById(id) {
    return (outcomes.modules || []).find((module) => module.id === id);
}

function implemented(module) {
    return module?.implementationState === 'implemented' || module?.status === 'approved';
}

function safeFilePart(value) {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function relative(filePath) {
    return path.relative(ROOT, filePath).replaceAll('\\', '/');
}

async function waitForSettledPage(page) {
    await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});
    await page.evaluate(async () => {
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }
    }).catch(() => {});
    await page.waitForTimeout(300);
}

async function screenshot(page, viewport, state, projectName) {
    fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });

    const filePath = path.join(
        EVIDENCE_ROOT,
        `${DATE_PREFIX}-epic-d-homepage-${safeFilePart(projectName)}-${safeFilePart(viewport.id)}-${safeFilePart(state)}.png`,
    );

    await page.screenshot({
        path: filePath,
        fullPage: false,
    });

    return relative(filePath);
}

async function collectGeometry(page, state) {
    return page.evaluate((stateId) => {
        function visible(element) {
            if (!element) {
                return false;
            }

            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);

            return (
                rect.width > 0
                && rect.height > 0
                && style.display !== 'none'
                && style.visibility !== 'hidden'
            );
        }

        function rectFor(element) {
            if (!element) {
                return null;
            }

            const rect = element.getBoundingClientRect();

            return {
                top: Math.round(rect.top * 100) / 100,
                right: Math.round(rect.right * 100) / 100,
                bottom: Math.round(rect.bottom * 100) / 100,
                left: Math.round(rect.left * 100) / 100,
                width: Math.round(rect.width * 100) / 100,
                height: Math.round(rect.height * 100) / 100,
            };
        }

        function overlap(left, right) {
            if (!left || !right) {
                return false;
            }

            return (
                left.left < right.right
                && left.right > right.left
                && left.top < right.bottom
                && left.bottom > right.top
            );
        }

        function textFor(element) {
            return (
                element?.innerText
                || element?.getAttribute('aria-label')
                || element?.textContent
                || ''
            ).replace(/\s+/g, ' ').trim();
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const main = document.querySelector('main');
        const header = document.querySelector('.section-header, header.header');
        const firstMainChild = [...(main?.children || [])].find(visible) || null;
        const focusables = [...document.querySelectorAll(
            'main a[href], main button, main input, main select, main textarea, main summary, main [tabindex]:not([tabindex="-1"])',
        )].filter(visible);
        const ctas = focusables.map((element, index) => {
            const rect = rectFor(element);

            return {
                index,
                tagName: element.tagName.toLowerCase(),
                text: textFor(element),
                rect,
                clipped: element.scrollWidth > element.clientWidth + 1
                    || element.scrollHeight > element.clientHeight + 1,
                outOfViewportX: rect.left < -1 || rect.right > viewportWidth + 1,
            };
        });
        const h1s = [...document.querySelectorAll('h1')].filter(visible).map((element) => ({
            text: textFor(element),
            rect: rectFor(element),
        }));
        const h1Like = [...document.querySelectorAll('h1, .h1')].filter(visible).map((element) => ({
            tagName: element.tagName.toLowerCase(),
            text: textFor(element),
            rect: rectFor(element),
        }));
        const failures = [];
        const headerRect = rectFor(header);
        const firstMainRect = rectFor(firstMainChild);

        if (document.documentElement.scrollWidth > viewportWidth + 1) {
            failures.push('horizontal-page-overflow');
        }

        if (main && main.scrollWidth > viewportWidth + 1) {
            failures.push('main-horizontal-overflow');
        }

        if (overlap(headerRect, firstMainRect)) {
            failures.push('main-overlaps-header');
        }

        if (ctas.some((entry) => entry.clipped)) {
            failures.push('cta-label-or-control-clipped');
        }

        if (ctas.some((entry) => entry.outOfViewportX)) {
            failures.push('cta-outside-viewport');
        }

        return {
            state: stateId,
            viewport: {
                width: viewportWidth,
                height: viewportHeight,
                scrollWidth: document.documentElement.scrollWidth,
            },
            main: {
                present: Boolean(main),
                visible: visible(main),
                rect: rectFor(main),
                firstChildRect: firstMainRect,
            },
            header: {
                present: Boolean(header),
                visible: visible(header),
                rect: headerRect,
            },
            h1s,
            h1Like,
            ctas,
            firstScreen: {
                text: textFor(firstMainChild).slice(0, 320),
                firstMainChildHeight: firstMainRect?.height || 0,
            },
            failures,
        };
    }, state);
}

async function collectFocusClearance(page) {
    const focusTarget = page.locator(
        'main a[href]:visible, main button:visible, main input:visible, main select:visible, main textarea:visible, main summary:visible',
    ).first();

    if (!await focusTarget.isVisible({ timeout: 1000 }).catch(() => false)) {
        return {
            status: 'not_applicable',
            reason: 'No visible main focus target.',
        };
    }

    await focusTarget.evaluate((element) => element.scrollIntoView({
        block: 'center',
        inline: 'center',
    }));
    await focusTarget.focus();

    return page.evaluate(() => {
        function rectFor(element) {
            const rect = element.getBoundingClientRect();

            return {
                top: Math.round(rect.top),
                bottom: Math.round(rect.bottom),
            };
        }

        const active = document.activeElement;
        const header = document.querySelector('.section-header, header.header');
        const activeRect = active ? rectFor(active) : null;
        const headerRect = header ? rectFor(header) : null;
        const obscured = Boolean(
            activeRect
            && headerRect
            && activeRect.top < headerRect.bottom
        );

        return {
            status: obscured ? 'failed' : 'passed',
            activeText: (active?.innerText || active?.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
            activeRect,
            headerRect,
        };
    });
}

async function runCheck(record, name, callback) {
    try {
        const details = await callback();
        record.passed.push({
            name,
            details: details || null,
        });
    } catch (error) {
        record.failed.push({
            name,
            message: error.message,
            stack: error.stack,
        });
    }
}

function recordNotApplicable(record, name, reason) {
    record.notApplicable.push({
        name,
        reason,
    });
}

async function requireFutureHero(page, record, viewport) {
    const hero = moduleById('homepage-first-screen-gateway');

    if (!implemented(hero)) {
        recordNotApplicable(
            record,
            'future hero assertions',
            `${hero?.id || 'homepage-first-screen-gateway'} is ${hero?.implementationState || hero?.status || 'unknown'}.`,
        );
        return;
    }

    const root = page.locator(hero.runtimeSelector).first();

    await runCheck(record, 'implemented hero root visible', async () => {
        await expect(root).toBeVisible();
    });

    await runCheck(record, 'implemented hero has one semantic h1', async () => {
        await expect(root.locator('h1:visible')).toHaveCount(1);
    });

    const primaryAction = (hero.actions || []).find((action) =>
        action.role === 'primary_commerce'
        && action.approvalStatus === 'approved'
    );

    await runCheck(record, 'implemented hero primary action visible', async () => {
        expect(primaryAction, 'Hero must define an approved primary commerce action.').toBeTruthy();
        await expect(page.getByRole('link', { name: primaryAction.accessibleLabel }).first()).toBeVisible();
    });

    await runCheck(record, 'implemented hero height is within responsive range', async () => {
        const box = await root.boundingBox();

        expect(box, 'Hero root bounding box').toBeTruthy();
        expect(
            box.height,
            `Hero height at ${viewport.id} should not create excessive first-screen dead space.`,
        ).toBeLessThanOrEqual(viewport.height * 1.15);
    });
}

async function requireFuturePathChooser(page, record) {
    const chooser = moduleById('homepage-customer-path-chooser');

    if (!implemented(chooser)) {
        recordNotApplicable(
            record,
            'future customer path chooser assertions',
            `${chooser?.id || 'homepage-customer-path-chooser'} is ${chooser?.implementationState || chooser?.status || 'unknown'}.`,
        );
        return;
    }

    const root = page.locator(chooser.runtimeSelector).first();

    await runCheck(record, 'implemented path chooser root visible', async () => {
        await expect(root).toBeVisible();
    });

    for (const action of (chooser.actions || []).filter((item) => item.approvalStatus === 'approved')) {
        await runCheck(record, `implemented path action visible: ${action.id}`, async () => {
            await expect(page.getByRole('link', { name: action.accessibleLabel }).first()).toBeVisible();
        });
    }
}

test.beforeEach(async ({ page }) => {
    await unlockStorefront(page);
});

for (const viewport of VIEWPORTS) {
    test(`homepage responsive contract at ${viewport.id}`, async ({ page }, testInfo) => {
        const initialRecord = {
            generatedAt: new Date().toISOString(),
            project: testInfo.project.name,
            route: '/',
            viewport,
            state: 'initial-load',
            selectedChecks: [
                'no horizontal overflow',
                'main/header geometry',
                'CTA bounds/wrapping',
                'current intro coherence',
                'conditional future hero/path assertions',
                'screenshot capture',
            ],
            passed: [],
            failed: [],
            notApplicable: [],
            screenshot: null,
        };

        await page.setViewportSize({
            width: viewport.width,
            height: viewport.height,
        });
        await gotoUnlocked(page, '/', `homepage responsive ${viewport.id}`);
        await waitForSettledPage(page);

        const geometry = await collectGeometry(page, 'initial-load');
        initialRecord.geometry = geometry;
        initialRecord.screenshot = await screenshot(page, viewport, 'initial-load', testInfo.project.name);

        await runCheck(initialRecord, 'no horizontal overflow', async () => {
            expect(geometry.failures).not.toContain('horizontal-page-overflow');
            expect(geometry.failures).not.toContain('main-horizontal-overflow');
        });

        await runCheck(initialRecord, 'main content does not overlap header', async () => {
            expect(geometry.failures).not.toContain('main-overlaps-header');
        });

        await runCheck(initialRecord, 'buttons and links do not clip viewport', async () => {
            expect(geometry.failures).not.toContain('cta-label-or-control-clipped');
            expect(geometry.failures).not.toContain('cta-outside-viewport');
        });

        await runCheck(initialRecord, 'current first screen remains coherent', async () => {
            await expect(page.getByText('Choose lapidary equipment for the work you need to do')).toBeVisible();
            await expect(page.getByRole('link', { name: 'Shop machines' })).toBeVisible();
            await expect(page.getByRole('link', { name: 'Contact us' })).toBeVisible();
        });

        await requireFutureHero(page, initialRecord, viewport);
        await requireFuturePathChooser(page, initialRecord);

        evidence.push(initialRecord);

        expect(
            initialRecord.failed,
            JSON.stringify(initialRecord.failed, null, 2),
        ).toEqual([]);

        const firstScrollRecord = {
            generatedAt: new Date().toISOString(),
            project: testInfo.project.name,
            route: '/',
            viewport,
            state: 'first-scroll',
            selectedChecks: [
                'screenshot capture',
                'focusable content clear of sticky header',
                'no horizontal overflow after first scroll',
            ],
            passed: [],
            failed: [],
            notApplicable: [],
            screenshot: null,
        };

        await page.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight, Math.round(window.innerHeight * 0.85))));
        await page.waitForTimeout(300);

        const focusClearance = await collectFocusClearance(page);
        const firstScrollGeometry = await collectGeometry(page, 'first-scroll');
        firstScrollRecord.geometry = firstScrollGeometry;
        firstScrollRecord.focusClearance = focusClearance;
        firstScrollRecord.screenshot = await screenshot(page, viewport, 'first-scroll', testInfo.project.name);

        await runCheck(firstScrollRecord, 'focusable content can be scrolled clear of sticky header', async () => {
            if (focusClearance.status === 'not_applicable') {
                recordNotApplicable(firstScrollRecord, 'focusable content can be scrolled clear of sticky header', focusClearance.reason);
                return;
            }

            expect(focusClearance.status).toBe('passed');
        });

        await runCheck(firstScrollRecord, 'no horizontal overflow after first scroll', async () => {
            expect(firstScrollGeometry.failures).not.toContain('horizontal-page-overflow');
            expect(firstScrollGeometry.failures).not.toContain('main-horizontal-overflow');
        });

        evidence.push(firstScrollRecord);

        expect(
            firstScrollRecord.failed,
            JSON.stringify(firstScrollRecord.failed, null, 2),
        ).toEqual([]);
    });
}

test.afterAll(() => {
    const project = safeFilePart(evidence[0]?.project || 'unknown');
    const summary = evidence.reduce((totals, entry) => {
        totals.entries += 1;
        totals.passed += entry.passed.length;
        totals.failed += entry.failed.length;
        totals.notApplicable += entry.notApplicable.length;
        return totals;
    }, {
        entries: 0,
        passed: 0,
        failed: 0,
        notApplicable: 0,
    });

    fs.mkdirSync(RESULT_ROOT, { recursive: true });
    fs.writeFileSync(
        path.join(RESULT_ROOT, `homepage-responsive-${project}.json`),
        `${JSON.stringify({
            suite: 'homepage-responsive',
            generatedAt: new Date().toISOString(),
            previewThemeId: process.env.PREVIEW_THEME_ID || null,
            viewports: VIEWPORTS,
            implementationState: {
                hero: moduleById('homepage-first-screen-gateway')?.implementationState || null,
                customerPathChooser: moduleById('homepage-customer-path-chooser')?.implementationState || null,
            },
            evidenceRoot: relative(EVIDENCE_ROOT),
            summary,
            results: evidence,
        }, null, 2)}\n`,
    );
});
