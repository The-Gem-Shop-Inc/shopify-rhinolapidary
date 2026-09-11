'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PLAN = path.join(ROOT, 'data', 'epic-d-homepage-qa-plan.json');
const REPORT = path.join(ROOT, 'test-results', 'epic-d', 'finalization', 'epic-d-finalization.json');

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function exists(relativePath) {
    return fs.existsSync(path.join(ROOT, relativePath));
}

function latestQaReport(mode, resultRoot) {
    const directory = path.join(ROOT, resultRoot);
    if (!fs.existsSync(directory)) return null;

    const match = fs.readdirSync(directory)
        .filter((name) => new RegExp(`^epic-d-qa-${mode}-.*\\.json$`).test(name))
        .map((name) => path.join(directory, name))
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];

    return match ? JSON.parse(fs.readFileSync(match, 'utf8')) : null;
}

function validateArtifacts(plan, violations) {
    const results = [];

    for (const relativePath of [...plan.requiredArtifacts, ...plan.implementationRecords]) {
        const present = exists(relativePath);
        const entry = { path: relativePath, present };

        if (!present) violations.push(`Missing required artifact: ${relativePath}.`);

        if (present && plan.implementationRecords.includes(relativePath)) {
            const text = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
            entry.hasStatus = /(?:## Status\s+|Status:\s*)(Complete with deferred dependency|Appropriately blocked|Complete|Needs small correction)/i.test(text);
            if (!entry.hasStatus) violations.push(`Implementation record lacks an allowed status: ${relativePath}.`);
        }

        results.push(entry);
    }

    return results;
}

function validateGovernedModules(plan, violations) {
    const outcomes = readJson('data/homepage-section-outcomes.json');
    const index = readJson('templates/index.json');
    const sections = Object.entries(index.sections || {});
    const state = [];

    for (const module of outcomes.modules || []) {
        const rendered = sections.some(([sectionId, section]) => {
            const sourcePath = path.join(ROOT, 'sections', `${section?.type || ''}.liquid`);
            const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : '';

            return section?.settings?.module_id === module.id
                || sectionId.replaceAll('_', '-') === module.id
                || source.includes(`data-homepage-module-id="${module.id}"`);
        });

        if (module.implementationState === 'blocked' && rendered) {
            violations.push(`${module.id}: blocked module is rendered.`);
        }

        if (module.implementationState === 'implemented') {
            if (!module.sourceReferences?.length) violations.push(`${module.id}: implemented module lacks source evidence.`);
            if (!module.runtimeSelector) violations.push(`${module.id}: implemented module lacks runtime selector.`);
            if (!rendered) violations.push(`${module.id}: implemented module is absent from templates/index.json.`);
        }

        state.push({ id: module.id, status: module.status, implementationState: module.implementationState, rendered });
    }

    for (const requiredId of ['homepage-why-rhino-proof', 'homepage-video-demo']) {
        const module = outcomes.modules.find((entry) => entry.id === requiredId);
        if (!module || module.status !== 'approved' || module.implementationState !== 'implemented') {
            violations.push(`${requiredId}: final current state must be approved and implemented.`);
        }
    }

    for (const optionalId of plan.launchOptionalDeferredModules || []) {
        const module = outcomes.modules.find((entry) => entry.id === optionalId);
        if (!module || !['blocked', 'deferred'].includes(module.implementationState)) {
            violations.push(`${optionalId}: optional omission must remain explicitly blocked or deferred.`);
        }
    }

    return state;
}

function main() {
    const artifactsOnly = process.argv.includes('--artifacts-only');
    const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
    const violations = [];

    if (plan.previewThemeId !== '158631198917') violations.push('Preview theme ID must be 158631198917.');
    if (plan.productionThemeId !== '158579622085') violations.push('Production theme ID must be 158579622085.');
    if (plan.productionMutationAllowed !== false) violations.push('Production mutation must remain false.');
    if (plan.productionApproved !== false) violations.push('Production approval must remain false.');
    if (plan.humanGoNoGoRequired !== true) violations.push('Human D-PBI-032 go/no-go must remain required.');
    if (plan.humanSignoff?.status !== 'pending' || plan.humanSignoff?.productionApproved !== false) {
        violations.push('D-PBI-032 must remain pending and production-unapproved.');
    }

    const artifacts = validateArtifacts(plan, violations);
    const moduleState = validateGovernedModules(plan, violations);
    const nfr = readJson('data/epic-d-homepage-nfr-readiness.json');

    if (nfr.productionSignoffGranted !== false) violations.push('NFR register must not grant production signoff.');
    for (const requirement of nfr.requirements || []) {
        if (requirement.automatedTechnicalStatus !== 'complete') {
            violations.push(`${requirement.pbi}: automated technical status is incomplete.`);
        }
    }

    const qa = { static: null, preview: null, all: null };
    if (!artifactsOnly) {
        for (const mode of Object.keys(qa)) {
            qa[mode] = latestQaReport(mode, plan.resultRoot);
        }

        for (const mode of ['static', 'preview']) {
            if (!qa[mode]) violations.push(`Missing Epic D ${mode} QA report.`);
            else if (!qa[mode].passed || qa[mode].totals?.failedRequired > 0) violations.push(`Epic D ${mode} QA report did not pass.`);
        }

        const performance = readJson('test-results/epic-d/homepage-performance-runtime.json');
        if ((performance.summary?.runtimeViolationCount || 0) > 0) violations.push('Homepage performance report contains violations.');

        for (const device of ['desktop-chromium', 'mobile-chromium']) {
            const evidence = readJson(`test-results/epic-d/homepage-accessibility-${device}.json`);
            if ((evidence.summary?.axeSeriousCount || 0) > 0 || (evidence.summary?.axeCriticalCount || 0) > 0) {
                violations.push(`Homepage accessibility evidence contains blocking ${device} violations.`);
            }
        }
    }

    const report = {
        generatedAt: new Date().toISOString(),
        artifactsOnly,
        technicalFinalization: violations.length === 0 ? 'passed' : 'failed',
        humanGoNoGoRequired: true,
        productionApproved: false,
        previewThemeId: plan.previewThemeId,
        productionThemeId: plan.productionThemeId,
        passed: violations.length === 0,
        artifacts,
        moduleState,
        qa: Object.fromEntries(Object.entries(qa).map(([mode, value]) => [mode, value ? { passed: value.passed, totals: value.totals } : null])),
        manualPending: (nfr.manualChecks || []).filter((check) => check.status !== 'pass'),
        violations,
    };

    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);

    if (violations.length) {
        console.error(`Epic D finalization validation failed. Report: ${path.relative(ROOT, REPORT)}`);
        for (const violation of violations) console.error(`- ${violation}`);
        process.exitCode = 1;
    } else {
        console.log(`Epic D technical finalization passed. Human D-PBI-032 GO remains required. Production approved: false. Report: ${path.relative(ROOT, REPORT)}`);
    }
}

try {
    main();
} catch (error) {
    console.error(`Epic D finalization validation failed:\n${error.stack || error.message}`);
    process.exitCode = 1;
}
