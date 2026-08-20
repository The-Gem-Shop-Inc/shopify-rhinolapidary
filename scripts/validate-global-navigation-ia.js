'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_REGISTER_PATH = path.join(
    ROOT,
    'data',
    'global-navigation-ia.json',
);
const SCHEMA_PATH = path.join(
    ROOT,
    'schemas',
    'global-navigation-ia.schema.json',
);
const LEGAL_CLAIMS_REGISTER_PATH = path.join(
    ROOT,
    'data',
    'legal-claims-register.json',
);
const SUPPORT_RESOURCES_REGISTER_PATH = path.join(
    ROOT,
    'data',
    'footer-support-resources.json',
);

const ALLOWED_STATUSES = new Set([
    'verified_current',
    'approved',
    'approved_for_launch',
    'planned',
    'blocked',
    'unresolved',
    'deferred',
    'not_approved_current',
]);

const ALLOWED_SOURCE_TYPES = new Set([
    'shopify_navigation',
    'shopify_policy',
    'dynamic_policy',
    'repository_route',
    'theme_route',
    'theme_setting',
    'shopify_account',
    'shopify_localization',
    'external_social',
    'external_shopify_platform',
    'external_business',
]);

const ALLOWED_EXTERNAL_SOURCE_TYPES = new Set([
    'external_social',
    'external_shopify_platform',
    'external_business',
]);

const FOOTER_GROUPS = new Set([
    'shop',
    'support',
    'company',
    'policies',
    'utility',
    'platform',
]);

const POLICY_SOURCE_TYPES = new Set([
    'shopify_policy',
    'dynamic_policy',
]);

const FOOTER_SENSITIVE_LABEL_PATTERN = /\b(?:warranty|shipping|freight|support|repair|international|localization|dealer|financing|certification|patent|manufacturer|supplier)\b/i;
const PLACEHOLDER_PATH_PATTERN = /\b(?:todo|tbd|placeholder|example\.com|your-|replace-me)\b/i;

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeProjectPath(filePath) {
    return path.resolve(ROOT, filePath);
}

function collectKnownIds(registerPath, collectionName) {
    if (!fs.existsSync(registerPath)) {
        return new Set();
    }

    const register = readJson(registerPath);

    return new Set(
        (register[collectionName] || [])
            .map((entry) => entry.id)
            .filter(Boolean),
    );
}

function isExternalUrl(value) {
    return /^https?:\/\//i.test(value);
}

function itemPath(item, parentPath) {
    return `${parentPath} > ${item.id || '(blank item)'}`;
}

function collectItems(items, parentPath, collected) {
    if (!Array.isArray(items)) {
        return;
    }

    for (const item of items) {
        const currentPath = itemPath(item, parentPath);
        collected.push({ item, path: currentPath });
        collectItems(item.items, currentPath, collected);
    }
}

function validateGlobalNavigationIA(data, options = {}) {
    const errors = [];
    const schemaPath = options.schemaPath || SCHEMA_PATH;

    if (fs.existsSync(schemaPath)) {
        const ajv = new Ajv2020({
            allErrors: true,
            strict: false,
        });
        const validate = ajv.compile(readJson(schemaPath));

        if (!validate(data)) {
            for (const error of validate.errors || []) {
                errors.push(
                    `schema ${error.instancePath || '/'} ${error.message}`,
                );
            }
        }
    }

    const dependencyIds = new Set();
    const itemIds = new Set();
    const menuIds = new Set();
    const allItems = [];
    const claimIds = collectKnownIds(LEGAL_CLAIMS_REGISTER_PATH, 'claims');
    const supportResourceIds = collectKnownIds(
        SUPPORT_RESOURCES_REGISTER_PATH,
        'resources',
    );

    for (const dependency of data.unresolvedDependencies || []) {
        if (dependencyIds.has(dependency.id)) {
            errors.push(`Duplicate dependency ID: ${dependency.id}`);
        }

        dependencyIds.add(dependency.id);
    }

    for (const menu of data.menus || []) {
        if (menuIds.has(menu.id)) {
            errors.push(`Duplicate menu ID: ${menu.id}`);
        }

        menuIds.add(menu.id);

        if (!menu.owner || !menu.owner.trim()) {
            errors.push(`${menu.id || '(blank menu)'}: owner is required.`);
        }

        if (!ALLOWED_SOURCE_TYPES.has(menu.sourceType)) {
            errors.push(
                `${menu.id || '(blank menu)'}: unsupported sourceType "${menu.sourceType}".`,
            );
        }

        collectItems(menu.items, menu.id || '(blank menu)', allItems);
    }

    for (const { item, path: itemTrace } of allItems) {
        if (itemIds.has(item.id)) {
            errors.push(`Duplicate item ID: ${item.id}`);
        }

        itemIds.add(item.id);

        if (!item.owner || !item.owner.trim()) {
            errors.push(`${itemTrace}: owner is required.`);
        }

        if (!item.source || !item.source.trim()) {
            errors.push(`${itemTrace}: source is required.`);
        }

        if (!ALLOWED_SOURCE_TYPES.has(item.sourceType)) {
            errors.push(
                `${itemTrace}: unsupported sourceType "${item.sourceType}".`,
            );
        }

        if (!ALLOWED_STATUSES.has(item.status)) {
            errors.push(
                `${itemTrace}: unsupported status "${item.status}".`,
            );
        }

        if (
            typeof item.targetPath === 'string'
            && PLACEHOLDER_PATH_PATTERN.test(item.targetPath)
        ) {
            errors.push(`${itemTrace}: targetPath contains placeholder text.`);
        }

        if (item.targetPath === '') {
            errors.push(`${itemTrace}: targetPath cannot be blank.`);
        }

        if (typeof item.targetPath === 'string' && item.targetPath) {
            if (isExternalUrl(item.targetPath)) {
                if (!ALLOWED_EXTERNAL_SOURCE_TYPES.has(item.sourceType)) {
                    errors.push(
                        `${itemTrace}: external targetPath requires an external sourceType.`,
                    );
                }
            } else if (!item.targetPath.startsWith('/')) {
                errors.push(
                    `${itemTrace}: internal targetPath must start with "/".`,
                );
            }
        }

        const footerLocations = item.expectedLocations || [];
        const isFooterItem = footerLocations.includes('footer');

        if (isFooterItem && !FOOTER_GROUPS.has(item.footerGroup)) {
            errors.push(
                `${itemTrace}: footer item requires a valid footerGroup.`,
            );
        }

        if (
            isFooterItem
            && FOOTER_SENSITIVE_LABEL_PATTERN.test(`${item.id} ${item.label}`)
            && (!Array.isArray(item.claimIds) || item.claimIds.length === 0)
        ) {
            errors.push(
                `${itemTrace}: footer sensitive item requires claimIds.`,
            );
        }

        for (const claimId of item.claimIds || []) {
            if (!claimIds.has(claimId)) {
                errors.push(
                    `${itemTrace}: claimIds references unknown legal claim ${claimId}.`,
                );
            }
        }

        for (const resourceId of item.supportResourceIds || []) {
            if (
                supportResourceIds.size > 0
                && !supportResourceIds.has(resourceId)
            ) {
                errors.push(
                    `${itemTrace}: supportResourceIds references unknown support resource ${resourceId}.`,
                );
            }
        }

        if (POLICY_SOURCE_TYPES.has(item.sourceType) && !item.policyObjectType) {
            errors.push(
                `${itemTrace}: policy source item requires policyObjectType.`,
            );
        }

        if (
            isExternalUrl(item.targetPath || '')
            && ALLOWED_EXTERNAL_SOURCE_TYPES.has(item.sourceType)
            && item.externalAllowed !== true
        ) {
            errors.push(
                `${itemTrace}: external destination requires externalAllowed true.`,
            );
        }

        const hasConcreteRoute = (
            typeof item.targetPath === 'string'
            && item.targetPath.trim() !== ''
            && !PLACEHOLDER_PATH_PATTERN.test(item.targetPath)
        );

        const hasDocumentedBlocker = (
            item.blockerId
            && dependencyIds.has(item.blockerId)
        ) || (
            Array.isArray(item.dependencies)
            && item.dependencies.some((dependency) => (
                dependencyIds.has(dependency)
            ))
        );

        if (item.requiredForLaunch && !hasConcreteRoute && !hasDocumentedBlocker) {
            errors.push(
                `${itemTrace}: launch-required item needs a concrete route or explicit blocker.`,
            );
        }

        if (item.blockerId && !dependencyIds.has(item.blockerId)) {
            errors.push(
                `${itemTrace}: blockerId does not match an unresolved dependency: ${item.blockerId}`,
            );
        }

        for (const dependency of item.dependencies || []) {
            if (!dependencyIds.has(dependency) && !itemIds.has(dependency)) {
                errors.push(
                    `${itemTrace}: unresolved dependency reference ${dependency}`,
                );
            }
        }
    }

    for (const dependency of data.unresolvedDependencies || []) {
        for (const blockedItem of dependency.blockedItems || []) {
            if (!itemIds.has(blockedItem)) {
                errors.push(
                    `${dependency.id}: blockedItems references unknown item ${blockedItem}`,
                );
            }
        }
    }

    return errors;
}

function validateFile(registerPath = DEFAULT_REGISTER_PATH) {
    const resolvedPath = normalizeProjectPath(registerPath);
    const data = readJson(resolvedPath);

    return validateGlobalNavigationIA(data);
}

function main() {
    const registerPath = process.argv[2] || DEFAULT_REGISTER_PATH;
    const errors = validateFile(registerPath);

    if (errors.length > 0) {
        console.error('Global navigation IA validation failed.');

        for (const error of errors) {
            console.error(`- ${error}`);
        }

        process.exit(1);
    }

    const data = readJson(normalizeProjectPath(registerPath));
    const itemCount = (data.menus || []).reduce((total, menu) => {
        const items = [];
        collectItems(menu.items, menu.id, items);
        return total + items.length;
    }, 0);

    console.log(
        `Global navigation IA validation passed for ${data.menus.length} menus, `
        + `${itemCount} items, and ${data.unresolvedDependencies.length} unresolved dependencies.`,
    );
}

if (require.main === module) {
    main();
}

module.exports = {
    ALLOWED_EXTERNAL_SOURCE_TYPES,
    ALLOWED_SOURCE_TYPES,
    ALLOWED_STATUSES,
    FOOTER_GROUPS,
    POLICY_SOURCE_TYPES,
    PLACEHOLDER_PATH_PATTERN,
    validateFile,
    validateGlobalNavigationIA,
};
