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

const supportRouteExpectations = [
    {
        routeId: 'contact',
        accessibleName: 'Contact us',
    },
    {
        routeId: 'shipping-policy',
        accessibleName: 'Shipping policy',
    },
];

const educationManualsExpectation = {
    routeId: 'homepage-manuals',
    moduleId: 'homepage-education-manuals',
    accessibleName: 'View manuals',
};

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

test('support reassurance renders only approved route-safe destinations', async ({ page }) => {
    await gotoUnlocked(page, '/', 'homepage support reassurance');

    const module = page.locator(
        '[data-homepage-module-id="homepage-support-reassurance"]',
    ).first();

    await expect(module).toBeVisible();
    await expect(module.getByRole('link')).toHaveCount(
        supportRouteExpectations.length,
    );

    for (const expectation of supportRouteExpectations) {
        const route = routeById(expectation.routeId);

        expect(
            route,
            `Missing governed route ${expectation.routeId}`,
        ).toBeTruthy();

        expect(route.approvalStatus).toBe('approved');
        expect(route.path).toBeTruthy();

        expect(
            (route.homepageReferences || []).some(
                (reference) =>
                    reference.moduleId === 'homepage-support-reassurance'
                    && reference.currentRendered
            ),
            `${expectation.routeId} must be governed as a rendered reassurance route`,
        ).toBe(true);

        const link = module.getByRole('link', {
            name: expectation.accessibleName,
        });

        await expect(link).toBeVisible();

        const href = await link.getAttribute('href');

        expect(
            new URL(href, page.url()).pathname,
        ).toBe(route.path);
    }

    for (const blockedCopy of [
        'Warranty',
        'Freight',
        'Pickup',
        'Financing',
        'International',
    ]) {
        await expect(
            module,
            `Blocked reassurance topic should not render: ${blockedCopy}`,
        ).not.toContainText(
            new RegExp(blockedCopy, 'i'),
        );
    }
});

test('education module renders only the approved Manuals action', async ({ page }) => {
    await gotoUnlocked(page, '/', 'homepage education Manuals entry');

    const module = page.locator(
        `[data-homepage-module-id="${educationManualsExpectation.moduleId}"]`,
    ).first();
    const route = routeById(educationManualsExpectation.routeId);

    await expect(module).toBeVisible();
    await expect(
        module.getByRole('heading', { level: 2, name: 'Manuals' }),
    ).toBeVisible();
    await expect(module.getByRole('link')).toHaveCount(1);

    expect(route, 'Missing governed homepage-manuals route').toBeTruthy();
    expect(route.approvalStatus).toBe('approved');
    expect(route.expectedRouteIdentity).toBe('page:manuals');
    expect(route.path).toBe('/pages/manuals');

    expect(
        (route.homepageReferences || []).some(
            (reference) =>
                reference.moduleId === educationManualsExpectation.moduleId
                && reference.currentRendered
        ),
        'homepage-manuals must be governed as currently rendered by the Manuals module',
    ).toBe(true);

    const link = module.getByRole('link', {
        name: educationManualsExpectation.accessibleName,
    });

    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', route.path);

    for (const placeholderAction of [
        'Buying guides',
        'How-to articles',
        'Videos',
        'Techniques',
        'Learning center',
    ]) {
        await expect(
            module,
            `Placeholder education action should not render: ${placeholderAction}`,
        ).not.toContainText(new RegExp(placeholderAction, 'i'));
    }
});
