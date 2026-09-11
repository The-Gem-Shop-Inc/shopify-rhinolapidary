require('dotenv').config();

const { test, expect } = require('@playwright/test');
const {
    gotoUnlocked,
    unlockStorefront,
} = require('./helpers/storefront');

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

test.beforeEach(async ({ page }) => {
    await unlockStorefront(page);
});

test('keyboard traversal reaches core homepage actions', async ({ page }) => {
    await gotoUnlocked(
        page,
        '/',
        'homepage keyboard navigation',
    );

    await page.waitForLoadState('load');

    const expectedMainActions = [
        'Shop machines',
        'Contact us',
        'Browse catalog',
        'View EM-1',
        'View BeadMaster',
        'View ShapeMaster',
        'View TrimMaster',
        'Shipping policy',
        'View manuals',
    ];

    const reached = new Set();

    /*
     * Start from the document so the test exercises native sequential
     * keyboard navigation rather than calling element.focus().
     */
    await page.locator('body').click({
        position: {
            x: 1,
            y: 1,
        },
    });

    for (let index = 0; index < 80; index += 1) {
        await page.keyboard.press('Tab');

        const focused = await page.evaluate(() => {
            const element = document.activeElement;

            return {
                tagName: element?.tagName?.toLowerCase() || '',
                text: (
                    element?.innerText
                    || element?.getAttribute?.('aria-label')
                    || element?.textContent
                    || ''
                )
                    .replace(/\s+/g, ' ')
                    .trim(),
                href: element?.getAttribute?.('href') || '',
            };
        });

        for (const expected of expectedMainActions) {
            if (
                focused.text === expected
                || focused.text.includes(expected)
            ) {
                reached.add(expected);
            }
        }

        if (
            expectedMainActions.every(
                (expected) => reached.has(expected),
            )
        ) {
            break;
        }
    }

    expect(
        [...reached].sort(),
        `Native Tab traversal did not reach all governed homepage actions.`,
    ).toEqual(
        [...expectedMainActions].sort(),
    );
});