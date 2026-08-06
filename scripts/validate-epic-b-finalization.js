'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const PACKAGE_PATH = path.join(
    ROOT,
    'package.json',
);

const QA_PLAN_PATH = path.join(ROOT, 'data', 'epic-b-brand-qa-plan.json');

const STYLE_REQUIREMENTS_PATH = path.join(ROOT, 'data', 'rhino-brand-style-guide-requirements.json');

const PREVIEW_SLICE_PATH = path.join(ROOT, 'data', 'rhino-preview-brand-slice.json');

function readJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        throw new Error(`Could not read ${path.relative(ROOT, filePath)}: ${error.message}`);
    }
}

function relativeExists(relativePath) {
    return fs.existsSync(path.resolve(ROOT, relativePath));
}

function nonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function requireString(value, label, violations) {
    if (!nonEmptyString(value)) {
        violations.push(`${label} is required.`);
    }
}

function requireArray(value, label, violations) {
    if (!Array.isArray(value)) {
        violations.push(`${label} must be an array.`);
        return [];
    }

    return value;
}

function normalizeHeading(value) {
    return String(value)
        .toLowerCase()
        .replace(/[`*_]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function extractHeadings(markdown) {
    return new Set(
        markdown
            .split(/\r?\n/)
            .filter((line) => /^#{1,6}\s+/.test(line))
            .map((line) => {
                return normalizeHeading(line.replace(/^#{1,6}\s+/, ''));
            }),
    );
}

function validateQaPlan(plan, packageDocument) {
    const violations = [];

    if (plan.schemaVersion !== 1) {
        violations.push('QA plan schemaVersion must equal 1.');
    }

    requireString(plan.status, 'QA plan status', violations);
    requireString(plan.evidenceRoot, 'QA plan evidenceRoot', violations);
    requireString(plan.resultRoot, 'QA plan resultRoot', violations);

    const pages = requireArray(plan.pages, 'QA plan pages', violations);

    const requiredPageCategories = new Set([
        'homepage',
        'collection',
        'search',
        'product',
        'cart',
        'contact',
        'policy',
    ]);

    const actualPageCategories = new Set(pages.map((page) => page.category));

    for (const category of requiredPageCategories) {
        if (!actualPageCategories.has(category)) {
            violations.push(`QA plan is missing required page category "${category}".`);
        }
    }

    for (const page of pages) {
        requireString(page.id, 'QA page id', violations);
        requireString(page.category, `${page.id || 'QA page'} category`, violations);

        if (!nonEmptyString(page.path) && !nonEmptyString(page.env) && !nonEmptyString(page.fallback)) {
            violations.push(`${page.id || 'QA page'} requires path, env, or fallback.`);
        }

        if (typeof page.required !== "boolean") {
            violations.push(`${page.id || 'QA page'} required must be boolean.`);
        }
    }

    const viewports = requireArray(plan.viewports, 'QA plan viewports', violations);

    const viewportWidths = new Set(viewports.map((viewport) => viewport.width));

    for (const requiredWidth of [
        360,
        390,
        768,
        1440
    ]) {
        if (!viewportWidths.has(requiredWidth)) {
            violations.push(`QA plan is missing required viewport width ${requiredWidth}.`);
        }
    }

    for (const viewport of viewports) {
        requireString(viewport.id, 'Viewport id', violations);

        if (!Number.isInteger(viewport.width) || viewport.width <= 0) {
            violations.push(`${viewport.id || 'Viewport'} width must be a positive integer.`);
        }

        if (!Number.isInteger(viewport.height) || viewport.height <= 0) {
            violations.push(`${viewport.id || 'Viewport'} height must be a positive integer.`);
        }
    }

    const journeys = requireArray(plan.journeys, 'QA plan journeys', violations);
    const journeyCategories = new Set(journeys.map((journey) => journey.category));

    for (const requiredCategory of [
        'identity',
        'discovery',
        'purchase',
        'cart',
        'support',
        'policy',
    ]) {
        if (!journeyCategories.has(requiredCategory)) {
            violations.push(`QA plan is missing journey category "${requiredCategory}".`);
        }
    }

    for (const journey of journeys) {
        requireString(journey.id, 'Journey id', violations);
        requireString(journey.category, `${journey.id || 'Journey'} category`, violations);

        if (!Array.isArray(journey.pages) || journey.pages.length === 0) {
            violations.push(`${journey.id || 'Journey'} must reference at least one page.`);
        }

        if (!Array.isArray(journey.checks) || journey.checks.length === 0) {
            violations.push(`${journey.id || 'Journey'} must contain checks.`);
        }
    }

    const suites = requireArray(plan.automatedSuites, 'QA plan automatedSuites', violations);
    const packageScripts = packageDocument.scripts || {};
    const capabilities = new Set();

    for (const suite of suites) {
        requireString(suite.id, 'Automated suite id', violations);
        requireString(suite.capability, `${suite.id || 'Automated suite'} capability`, violations);
        requireString(suite.npmScript, `${suite.id || 'Automated suite'} npmScript`, violations);

        if (!['static', 'preview'].includes(suite.mode)) {
            violations.push(`${suite.id || 'Automated suite'} mode must be static or preview.`);
        }

        if (nonEmptyString(suite.npmScript) && !packageScripts[suite.npmScript]) {
            violations.push(`QA suite "${suite.id}" references missing package script "${suite.npmScript}`);
        }

        capabilities.add(suite.capability);
    }

    for (const requiredCapability of [
        'repository',
        'smoke',
        'accessibility',
        'performance',
        'social-metadata'
    ]) {
        if (!capabilities.has(requiredCapability)) {
            violations.push(`QA plan lacks automated capability "${requiredCapability}".`);
        }
    }

    const manualChecks = requireArray(plan.manualChecks, 'QA plan manualChecks', violations);
    const manualCheckIds = new Set(manualChecks.map((check) => check.id));

    for (const requiredCheck of [
        'keyboard',
        'zoom-200',
        'text-spacing',
        'reduced-motion',
        'forced-colors',
        'mobile-crops',
        'placeholder-content',
        'claims-review'
    ]) {
        if (!manualCheckIds.has(requiredCheck)) {
            violations.push(`QA plan lacks manual check "${requiredCheck}".`);
        }
    }

    for (const check of manualChecks) {
        requireString(check.id, 'Manual check id', violations);
        requireString(check.owner, `${check.id || 'Manual check'} owner`, violations);

        if (!Array.isArray(check.pages) || check.pages.length === 0) {
            violations.push(`${check.id || 'Manual check'} must reference pages.`);
        }

        if (!Array.isArray(check.evidence) || check.evidence.length === 0) {
            violations.push(`${check.id || 'Manual check'} must define evidence.`);
        }
    }

    const mappings = requireArray(plan.evidenceMappings, 'QA plan evidenceMappings', violations);
    const mappedTypes = new Set(mappings.map((mapping) => mapping.changeType));

    for (const requiredType of [
        'code',
        'admin',
        'content',
        'media',
    ]) {
        if (!mappedTypes.has(requiredType)) {
            violations.push(`QA plan lacks evidence mapping for "${requiredType}".`);
        }
    }

    const signoffs = requireArray(plan.signoffs, 'QA plan signoffs', violations);
    const signoffRoles = new Set(signoffs.map((signoff) => signoff.role));

    for (const requiredRole of [
        'Brand Owner',
        'Engineering Owner',
        'QA and Release Approver',
        'Product Owner'
    ]) {
        if (!signoffRoles.has(requiredRole)) {
            violations.push(`QA plan lacks required signoff role "${requiredRole}".`);
        }
    }

    return violations;
}

function validateStyleGuide(requirements) {
    const violations = [];

    if (requirements.schemaVersion !== 1) {
        violations.push('Style guide schemaVersion must equal 1.');
    }

    requireString(requirements.guidePath, 'Style guide guidePath', violations);

    if (nonEmptyString(requirements.guidePath) && !relativeExists(requirements.guidePath)) {
        violations.push(`Style guide does not exist: ${requirements.guidePath}`);

        return violations;
    }

    const markdown = fs.readFileSync(path.resolve(ROOT, requirements.guidePath), 'utf8');
    const headings = extractHeadings(markdown);
    const requiredSections = requireArray(requirements.requiredSections, 'Style guide requiredSections',
        violations);

    for (const section of requiredSections) {
        requireString(section.id, 'Style guide section id', violations);
        requireString(section.heading, `${section.id || 'Style guide section'} heading`, violations);

        if (nonEmptyString(section.heading) && !headings.has(normalizeHeading(section.heading))) {
            violations.push(`Style guide is missing heading "${section.heading}".`);
        }

        const sources = requireArray(section.sources, `${section.id || 'Style guide section'} sources`,
            violations);

        for (const sourcePath of sources) {
            if (!relativeExists(sourcePath)) {
                violations.push(`Style guide source does not exist: ${sourcePath}`);
            }

            if (!markdown.includes(sourcePath)) {
                violations.push(`Style guide does not link its source: ${sourcePath}`);
            }
        }
    }

    for (const requiredLink of requirements.requiredLinks || []) {
        if (!relativeExists(requiredLink)) {
            violations.push(`Required style guide dependency does not exist: ${requiredLink}`);
        }

        if (!markdown.includes(requiredLink)) {
            violations.push(`Style guide does not link required dependency: ${requiredLink}`);
        }
    }

    const normalizedMarkdown = markdown.toLowerCase();

    for (const requiredPhrase of [
        'approved',
        'needs review',
        'do',
        "don't",
        'open issues',
        'post-launch'
    ]) {
        if (!normalizedMarkdown.includes(requiredPhrase.toLowerCase())) {
            violations.push(`Style guide is missing required concept "${requiredPhrase}".`);
        }
    }

    return violations;
}

function validatePreviewSlice(plan) {
    const violations = [];

    if (plan.schemaVersion !== 1) {
        violations.push('Preview slice schemaVersion must equal 1.');
    }

    if (plan.target !== 'persistent_preview') {
        violations.push('Preview slice target must be "persistent_preview".');
    }

    if (plan.productionPublishAllowed !== false) {
        violations.push('Preview slice must explicitly set productionPublishAllowed to false.');
    }

    requireString(plan.status, 'Preview slice status', violations);

    const included = requireArray(plan.includedSurfaces, 'Preview slice includedSurfaces',
        violations);

    const includedIds = new Set(included.map((surface) => surface.id));

    for (const requiredSurface of [
        'global-theme-settings',
        'browser-identity',
        'homepage-intro',
        'collection-product-card',
        'search-product-card',
        'product-purchase-summary'
    ]) {
        if (!includedIds.has(requiredSurface)) {
            violations.push(`Preview slice lacks required surface "${requiredSurface}".`);
        }
    }

    for (const surface of included) {
        requireString(surface.id, 'Included surface id', violations);
        requireString(surface.owner, `${surface.id || 'Included surface'} owner`, violations);

        if (!Array.isArray(surface.changeTypes) || surface.changeTypes.length === 0) {
            violations.push(`${surface.id || 'Included surface'} must define changeTypes.`);
        }

        if (!Array.isArray(surface.requiredEvidence) || surface.requiredEvidence.length === 0) {
            violations.push(`${surface.id || 'Included surface'} must define requiredEvidence.`);
        }

        if (!Array.isArray(surface.rollback) || surface.rollback.length === 0) {
            violations.push(`${surface.id || 'Included surface'} must define rollback.`);
        }
    }

    const excluded = requireArray(plan.excludedSurfaces, 'Preview slice excludedSurfaces', violations);
    const excludedIds = new Set(excluded.map((surface) => surface.id));

    for (const requiredExclusion of [
        'production-publish',
        'navigation-redesign',
        'footer-identity-claims',
        'structured-specifications',
        'compatibility',
        'checkout'
    ]) {
        if (!excludedIds.has(requiredExclusion)) {
            violations.push(`Preview slice lacks required exclusion "${requiredExclusion}".`);
        }
    }

    const fixtures = requireArray(plan.fixtures, 'Preview slice fixtures', violations);
    const fixtureCategories = new Set(fixtures.map((fixture) => fixture.category));

    for (const requiredFixture of [
        'homepage',
        'collection',
        'search',
        'product',
        'cart'
    ]) {
        if (!fixtureCategories.has(requiredFixture)) {
            violations.push(`Preview slice lacks fixture category "${requiredFixture}".`);
        }
    }

    const gates = requireArray(plan.goNoGoCriteria, 'Preview slice goNoGoCriteria', violations);
    const gateCategories = new Set(gates.map((gate) => gate.category));

    for (const requiredGate of [
        'repository',
        'accessibility',
        'performance',
        'content',
        'media',
        'admin',
        'purchase-path',
        'rollback',
        'stakeholder'
    ]) {
        if (!gateCategories.has(requiredGate)) {
            violations.push(`Preview slice lacks go/no-go category "${requiredGate}".`);
        }
    }

    const followUps = requireArray(plan.followUps, 'Preview slice followUps', violations);

    if (followUps.length < 4) {
        violations.push('Preview slice must identify at least four follow-up rollout tasks.');
    }

    const overallRollback = requireArray(plan.overallRollback, 'Preview slice overallRollback', violations);

    if (overallRollback.length < 3) {
        violations.push('Preview slice overallRollback must contain at least three steps.');
    }

    return violations;
}

function main() {
    const violations = [];

    const packageDocument = readJson(PACKAGE_PATH);

    violations.push(...validateQaPlan(readJson(QA_PLAN_PATH), packageDocument));
    violations.push(...validateStyleGuide(readJson(STYLE_REQUIREMENTS_PATH)));
    violations.push(...validatePreviewSlice(readJson(PREVIEW_SLICE_PATH)));

    if (violations.length > 0) {
        console.error(`Epic B finalization validation failed:\n- ${violations.join('\n- ')}`);

        process.exitCode = 1;
        return;
    }

    console.log('Epic B finalization validation passed: QA plan, style guide, and preview slice are complete.');
}

try {
    main();
} catch (error) {
    console.error(`Epic B finalization validation failed:\n${error.stack || error.message}`);

    process.exitCode = 1;
}
