'use strict';

const assert = require('node:assert/strict');
const {
    validateGlobalNavigationIA,
} = require('./validate-global-navigation-ia');

function baseRegister() {
    return {
        schemaVersion: 1,
        status: 'draft',
        source: 'validator regression fixture',
        menus: [
            {
                id: 'primary',
                label: 'Primary header navigation',
                owner: 'Product Owner and Shopify Admin',
                sourceType: 'shopify_navigation',
                adminHandle: 'main-menu',
                items: [
                    {
                        id: 'home',
                        label: 'Home',
                        status: 'verified_current',
                        owner: 'Product Owner and Shopify Admin',
                        targetPath: '/',
                        source: 'fixture',
                        sourceType: 'shopify_navigation',
                        requiredForLaunch: true,
                        dependencies: [],
                    },
                ],
            },
        ],
        unresolvedDependencies: [],
    };
}

function expectError(name, mutate, pattern) {
    const register = baseRegister();
    mutate(register);
    const errors = validateGlobalNavigationIA(register);

    assert(
        errors.some((error) => pattern.test(error)),
        `${name} should fail with ${pattern}. Errors:\n${errors.join('\n')}`,
    );
}

const validErrors = validateGlobalNavigationIA(baseRegister());
assert.deepEqual(validErrors, [], `valid fixture failed:\n${validErrors.join('\n')}`);

expectError(
    'duplicate menu IDs',
    (register) => {
        register.menus.push({
            ...register.menus[0],
            items: [],
        });
    },
    /Duplicate menu ID: primary/,
);

expectError(
    'duplicate item IDs',
    (register) => {
        register.menus[0].items.push({
            ...register.menus[0].items[0],
            targetPath: '/collections/all',
        });
    },
    /Duplicate item ID: home/,
);

expectError(
    'launch TODO path',
    (register) => {
        register.menus[0].items[0].targetPath = '/TODO-route';
    },
    /targetPath contains placeholder text/,
);

expectError(
    'invalid internal path',
    (register) => {
        register.menus[0].items[0].targetPath = 'collections/all';
    },
    /internal targetPath must start with "\/"/,
);

expectError(
    'missing owner',
    (register) => {
        register.menus[0].items[0].owner = '';
    },
    /owner is required/,
);

expectError(
    'launch-required item without route or blocker',
    (register) => {
        register.menus[0].items[0].targetPath = null;
    },
    /launch-required item needs a concrete route or explicit blocker/,
);

expectError(
    'external URL without external sourceType',
    (register) => {
        register.menus[0].items[0].targetPath = 'https://example.com';
    },
    /external targetPath requires an external sourceType/,
);

expectError(
    'unresolved dependency reference',
    (register) => {
        register.menus[0].items[0].dependencies = ['missing-dependency'];
    },
    /unresolved dependency reference missing-dependency/,
);

expectError(
    'footer item missing footer group',
    (register) => {
        register.menus.push({
            id: 'footer',
            label: 'Footer',
            owner: 'Product Owner and Shopify Admin',
            sourceType: 'shopify_navigation',
            adminHandle: 'footer',
            items: [
                {
                    id: 'footer-search',
                    label: 'Search',
                    status: 'verified_current',
                    owner: 'Product Owner and Shopify Admin',
                    targetPath: '/search',
                    source: 'fixture',
                    sourceType: 'shopify_navigation',
                    requiredForLaunch: true,
                    dependencies: [],
                    expectedLocations: ['footer'],
                },
            ],
        });
    },
    /footer item requires a valid footerGroup/,
);

expectError(
    'footer sensitive item missing claim IDs',
    (register) => {
        register.menus.push({
            id: 'footer',
            label: 'Footer',
            owner: 'Product Owner and Shopify Admin',
            sourceType: 'shopify_navigation',
            adminHandle: 'footer',
            items: [
                {
                    id: 'footer-warranty',
                    label: 'Warranty',
                    status: 'blocked',
                    owner: 'Legal and Shopify Admin',
                    targetPath: null,
                    source: 'fixture',
                    sourceType: 'shopify_navigation',
                    requiredForLaunch: false,
                    dependencies: [],
                    expectedLocations: ['footer'],
                    footerGroup: 'support',
                },
            ],
        });
    },
    /footer sensitive item requires claimIds/,
);

expectError(
    'policy source missing policy object type',
    (register) => {
        register.menus[0].items[0].sourceType = 'shopify_policy';
        register.menus[0].items[0].expectedLocations = ['footer'];
        register.menus[0].items[0].footerGroup = 'policies';
    },
    /policy source item requires policyObjectType/,
);

expectError(
    'external URL without explicit external approval',
    (register) => {
        register.menus[0].items[0].targetPath = 'https://www.shopify.com';
        register.menus[0].items[0].sourceType = 'external_shopify_platform';
    },
    /external destination requires externalAllowed true/,
);

console.log('Global navigation IA validator regression tests passed.');
