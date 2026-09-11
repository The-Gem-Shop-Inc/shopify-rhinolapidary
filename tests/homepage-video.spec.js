require('dotenv').config();

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const {
    gotoUnlocked,
    unlockStorefront,
} = require('./helpers/storefront');

const MODULE_SELECTOR = '[data-homepage-module-id="homepage-video-demo"]';
const VIDEO_ID = 'QbPTGCM1zhs';
const PLAY_NAME = 'Play Rhino Lapidary EM-1 Machine video';

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

test.beforeEach(async ({ page }) => {
    await unlockStorefront(page);
});

test('EM-1 video is inert initially and accessible after deliberate activation', async ({ page }) => {
    const initialRequests = [];

    page.on('request', (request) => initialRequests.push(request.url()));
    await gotoUnlocked(page, '/', 'homepage EM-1 video');
    await page.waitForLoadState('load');
    await page.waitForTimeout(750);

    const module = page.locator(MODULE_SELECTOR);

    await expect(module).toHaveCount(1);
    await module.scrollIntoViewIfNeeded();
    await expect(module).toBeVisible();
    await expect(
        module.getByRole('heading', { level: 2, name: 'See the EM-1 in operation' }),
    ).toBeVisible();

    const playButton = module.getByRole('button', { name: PLAY_NAME });
    const poster = playButton.locator('img');

    await expect(playButton).toBeVisible();
    await expect(poster).toBeVisible();
    await expect(poster).toHaveAttribute('width', '1280');
    await expect(poster).toHaveAttribute('height', '720');
    await expect(module.locator('iframe')).toHaveCount(0);
    await expect(module.locator('[autoplay]')).toHaveCount(0);

    expect(
        initialRequests.filter((url) => /youtube(?:-nocookie)?\.com|youtu\.be/i.test(url)),
        'No YouTube provider request may occur before activation.',
    ).toEqual([]);

    const before = await module.locator('deferred-media').boundingBox();

    await playButton.focus();
    await expect(playButton).toBeFocused();
    await page.keyboard.press('Enter');

    const iframe = module.locator('iframe');

    await expect(iframe).toHaveCount(1);
    await expect(iframe).toHaveAttribute('title', 'Rhino Lapidary EM-1 Machine');

    const iframeSrc = await iframe.getAttribute('src');
    const iframeUrl = new URL(iframeSrc);

    expect(iframeUrl.hostname).toBe('www.youtube-nocookie.com');
    expect(iframeUrl.pathname).toContain(`/embed/${VIDEO_ID}`);
    expect(iframeUrl.searchParams.has('autoplay')).toBe(false);

    const after = await module.locator('deferred-media').boundingBox();

    expect(before).toBeTruthy();
    expect(after).toBeTruthy();
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
    expect(after.width).toBeLessThanOrEqual(page.viewportSize().width);

    await page.keyboard.press('Shift+Tab');
    expect(
        await iframe.evaluate((element) => document.activeElement === element),
        'Focus must be able to leave the activated iframe.',
    ).toBe(false);

    const axe = await new AxeBuilder({ page })
        .include(MODULE_SELECTOR)
        // YouTube owns the cross-origin player document. Its boundary is
        // checked above for a descriptive iframe title and keyboard escape;
        // axe remains authoritative for all storefront-owned module markup.
        .exclude(`${MODULE_SELECTOR} iframe`)
        .exclude('#PBarNextFrame')
        .analyze();
    const blocking = axe.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact)
    );

    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});
