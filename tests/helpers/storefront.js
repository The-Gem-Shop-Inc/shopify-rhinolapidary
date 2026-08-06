const fs = require('fs');
const path = require('path');
const { expect } = require('@playwright/test');
const storefrontAuth = require('./storefront-auth');

function loadFixtures() {
    return JSON.parse(
        fs.readFileSync(
            path.join(process.cwd(), 'tests/fixtures/storefront-fixtures.json'),
            'utf8'
        )
    );
}

async function gotoStorefront(page, routePath, label = routePath) {
    const response = await page.goto(storefrontAuth.storefrontUrl(routePath), {
        waitUntil: 'domcontentloaded',
    });

    expect(
        response?.status(),
        `${label} return HTTP ${response?.status()} at ${page.url()}`
    ).toBeLessThan(400);

    return response;
}

function getFixture(name) {
    const fixtures = loadFixtures();
    const fixture = fixtures.fixtures?.[name];

    if (!fixture) {
        throw new Error(`Missing storefront fixture "${name}".`);
    }

    if (!fixture.path || !fixture.path.startsWith('/')) {
        throw new Error(
            `Storefront fixture "${name}" must have a path beginning with "/". Got: ${fixture.path}`
        );
    }

    return fixture;
}

module.exports = {
    loadFixtures,
    getFixture,
    storefrontUrl: storefrontAuth.storefrontUrl,
    gotoStorefront,
    gotoUnlocked: storefrontAuth.gotoUnlocked,
    unlockStorefront: storefrontAuth.unlockStorefront,
    isPasswordPage: storefrontAuth.isPasswordPage,
    assertStorefrontPage: storefrontAuth.assertStorefrontPage,
    applyCachedStorefrontState: storefrontAuth.applyCachedStorefrontState,
    STORAGE_STATE_PATH: storefrontAuth.STORAGE_STATE_PATH,
};
