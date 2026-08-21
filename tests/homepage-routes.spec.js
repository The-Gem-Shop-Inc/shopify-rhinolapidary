require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const {
    gotoUnlocked,
    unlockStorefront,
} = require('./helpers/storefront');

const navigationSpec = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data/navigation-spec.json'), 'utf8'),
);

const currentHomepageRoutes = navigationSpec.routes.filter((route) => (
    route.homepageReferences || []
).some((reference) => reference.currentRendered));

const customerPathExpectations = [
    {
        routeId: 'machines',
        accessibleName: 'Shop machines',
    },
    {
        routeId: 'catalog',
        accessibleName: 'Browse catalog',
    },
    {
        routeId: 'contact',
        accessibleName: 'Contact us',
    },
];

function routeById(id) {
    return navigationSpec.routes.find((route) => route.id === id);
}

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    await unlockStorefront(page);
});

test('current homepage CTA destinations are governed routes', async ({ page }) => {
    await gotoUnlocked(page, '/', 'current homepage route contract');

    const renderedPaths = await page.locator('main a').evaluateAll((links) => (
        links.map((link) => new URL(link.href, window.location.href).pathname)
    ));

    for (const route of currentHomepageRoutes) {
        expect(renderedPaths, `${route.id} path should render`).toContain(route.path);
    }
});

test('customer path chooser renders three approved governed tasks', async ({ page }) => {
    await gotoUnlocked(page, '/', 'homepage customer path chooser');

    const chooser = page.locator('[id$="__homepage_customer_paths"]').first();

    await expect(chooser).toBeVisible();
    await expect(chooser.getByRole('link')).toHaveCount(customerPathExpectations.length);

    for (const expectation of customerPathExpectations) {
        const route = routeById(expectation.routeId);

        expect(route, `Missing route ${expectation.routeId}`).toBeTruthy();
        expect(route.approvalStatus).toBe('approved');
        expect(route.path).toBeTruthy();

        expect(
            (route.homepageReferences || []).some((reference) =>
                reference.moduleId === 'homepage-customer-path-chooser'
                && reference.currentRendered
            ),
            `${expectation.routeId} must be governed as a rendered customer path`,
        ).toBe(true);

        const link = chooser.getByRole('link', {
            name: expectation.accessibleName,
        });

        await expect(link).toBeVisible();

        const href = await link.getAttribute('href');

        expect(
            new URL(href, page.url()).pathname,
            `${expectation.accessibleName} should resolve to ${route.path}`,
        ).toBe(route.path);
    }
});