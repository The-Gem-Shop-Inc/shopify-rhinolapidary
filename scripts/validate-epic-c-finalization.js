'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PLAN_PATH = path.join(ROOT, 'data', 'epic-c-global-chrome-qa-plan.json');
const RESULT_ROOT = path.join(ROOT, 'test-results', 'epic-c', 'batch-5');
const REPORT_PATH = path.join(RESULT_ROOT, 'epic-c-finalization.json');

function readJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        throw new Error(`Could not read ${path.relative(ROOT, filePath)}: ${error.message}`);
    }
}

function parseArguments(argv) {
    const options = {
        artifactsOnly: false,
    };

    for (const argument of argv) {
        if (argument === '--artifacts-only') {
            options.artifactsOnly = true;
        } else {
            throw new Error(`Unknown argument: ${argument}`);
        }
    }

    return options;
}

function exists(relativePath) {
    return fs.existsSync(path.join(ROOT, relativePath));
}

function readText(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function requireString(value, label, violations) {
    if (typeof value !== 'string' || value.trim().length === 0) {
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

function validatePlanShape(plan, packageDocument) {
    const violations = [];

    if (plan.schemaVersion !== 1) {
        violations.push('QA plan schemaVersion must equal 1.');
    }

    requireString(plan.status, 'QA plan status', violations);
    requireString(plan.evidenceRoot, 'QA plan evidenceRoot', violations);
    requireString(plan.resultRoot, 'QA plan resultRoot', violations);

    if (plan.previewThemeId !== '158631198917') {
        violations.push('QA plan previewThemeId must be 158631198917.');
    }

    if (plan.productionThemeId !== '158579622085') {
        violations.push('QA plan productionThemeId must be 158579622085.');
    }

    if (plan.productionMutationAllowed !== false) {
        violations.push('QA plan must set productionMutationAllowed to false.');
    }

    const pages = requireArray(plan.pages, 'QA plan pages', violations);
    const pageCategories = new Set(pages.map((page) => page.category));

    for (const category of [
        'homepage',
        'collection',
        'search',
        'product',
        'cart',
        'contact',
        'policy',
    ]) {
        if (!pageCategories.has(category)) {
            violations.push(`QA plan is missing page category ${category}.`);
        }
    }

    const viewports = requireArray(plan.viewports, 'QA plan viewports', violations);
    const viewportIds = new Set(viewports.map((viewport) => viewport.id));

    for (const viewportId of [
        'mobile-360',
        'mobile-390',
        'tablet-768',
        'desktop-1440',
        'desktop-1920',
    ]) {
        if (!viewportIds.has(viewportId)) {
            violations.push(`QA plan is missing viewport ${viewportId}.`);
        }
    }

    const suites = requireArray(plan.automatedSuites, 'QA plan automatedSuites', violations);
    const packageScripts = packageDocument.scripts || {};
    const capabilities = new Set();
    const modes = new Set();

    for (const suite of suites) {
        requireString(suite.id, 'Automated suite id', violations);
        requireString(suite.capability, `${suite.id || 'Automated suite'} capability`, violations);
        requireString(suite.npmScript, `${suite.id || 'Automated suite'} npmScript`, violations);

        if (!['static', 'preview'].includes(suite.mode)) {
            violations.push(`${suite.id || 'Automated suite'} mode must be static or preview.`);
        }

        if (suite.npmScript && !packageScripts[suite.npmScript]) {
            violations.push(`QA suite ${suite.id} references missing package script ${suite.npmScript}.`);
        }

        capabilities.add(suite.capability);
        modes.add(suite.mode);
    }

    for (const mode of ['static', 'preview']) {
        if (!modes.has(mode)) {
            violations.push(`QA plan is missing ${mode} suites.`);
        }
    }

    for (const capability of [
        'repository',
        'theme-architecture',
        'navigation-route-specification',
        'global-navigation-ia',
        'schemas-registers',
        'legal-brand-claims',
        'theme-settings',
        'footer-support-governance',
        'localization-governance',
        'performance',
        'analytics-governance',
        'global-chrome-links',
        'breadcrumbs',
        'utility-controls',
        'accessibility',
        'mobile-drawer',
        'desktop-header',
        'policy-sitemap',
        'smoke',
        'social-metadata',
        'responsive-evidence',
    ]) {
        if (!capabilities.has(capability)) {
            violations.push(`QA plan lacks capability ${capability}.`);
        }
    }

    return violations;
}

function validateArtifacts(plan) {
    const records = [
        ...requireArray(plan.requiredArtifacts, 'requiredArtifacts', []),
        ...requireArray(plan.implementationRecords, 'implementationRecords', [])
            .map((recordPath) => ({
                path: recordPath,
                required: true,
                type: 'implementation-record',
            })),
    ];
    const artifacts = [];
    const missing = [];

    for (const artifact of records) {
        const artifactPath = typeof artifact === 'string'
            ? artifact
            : artifact.path;
        const present = exists(artifactPath);
        const entry = {
            path: artifactPath,
            pbi: artifact.pbi || null,
            type: artifact.type || null,
            required: artifact.required !== false,
            present,
        };

        artifacts.push(entry);

        if (entry.required && !present) {
            missing.push(entry);
        }
    }

    return {
        passed: missing.length === 0,
        artifacts,
        missing,
    };
}

function validateDocumentationReferences(plan) {
    const checks = [];
    const missing = [];

    for (const reference of plan.documentationReferences || []) {
        const present = exists(reference.path);
        const text = present ? readText(reference.path) : '';
        const missingStrings = [];

        for (const requiredString of reference.requiredStrings || []) {
            if (!text.includes(requiredString)) {
                missingStrings.push(requiredString);
            }
        }

        const check = {
            path: reference.path,
            present,
            requiredStrings: reference.requiredStrings || [],
            missingStrings,
            passed: present && missingStrings.length === 0,
        };

        checks.push(check);

        if (!check.passed) {
            missing.push(check);
        }
    }

    return {
        passed: missing.length === 0,
        checks,
        missing,
    };
}

function newestFile(pattern) {
    if (!fs.existsSync(RESULT_ROOT)) {
        return null;
    }

    const matches = fs.readdirSync(RESULT_ROOT)
        .filter((name) => pattern.test(name))
        .map((name) => path.join(RESULT_ROOT, name))
        .sort((left, right) => (
            fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs
        ));

    return matches[0] || null;
}

function readReport(pattern) {
    const filePath = newestFile(pattern);

    if (!filePath) {
        return {
            present: false,
            path: null,
            passed: false,
            totals: null,
            environmentBlocked: false,
        };
    }

    const report = readJson(filePath);

    return {
        present: true,
        path: path.relative(ROOT, filePath).replaceAll('\\', '/'),
        passed: report.passed === true,
        totals: report.totals || null,
        environmentBlocked: Boolean(report.totals?.environmentBlocked),
        report,
    };
}

function validateAccessibilityEvidence() {
    const files = fs.existsSync(RESULT_ROOT)
        ? fs.readdirSync(RESULT_ROOT)
            .filter((name) => /^global-chrome-accessibility-.*\.json$/.test(name))
            .map((name) => path.join(RESULT_ROOT, name))
        : [];
    const reports = files.map((filePath) => readJson(filePath));
    const failures = reports.flatMap((report) => (
        (report.results || []).filter((entry) => (
            entry.status === 'failed'
            || (entry.axeSeriousCount || 0) > 0
            || (entry.axeCriticalCount || 0) > 0
        ))
    ));

    return {
        present: files.length > 0,
        paths: files.map((filePath) => path.relative(ROOT, filePath).replaceAll('\\', '/')),
        passed: files.length > 0 && failures.length === 0,
        failures,
        summaries: reports.map((report) => report.summary || null),
    };
}

function validateResponsiveEvidence() {
    const timestamped = newestFile(/^responsive-global-chrome-qa-.*\.json$/);
    const fallback = path.join(ROOT, 'test-results/epic-c/batch-5/responsive-global-chrome-qa.json');
    const filePath = timestamped || (fs.existsSync(fallback) ? fallback : null);

    if (!filePath) {
        return {
            present: false,
            path: 'test-results/epic-c/batch-5/responsive-global-chrome-qa.json',
            passed: false,
            summary: null,
        };
    }

    const report = readJson(filePath);
    const requiredWidthFailures = report.summary?.requiredWidthFailures || 0;
    const environmentBlocked = (report.summary?.byStatus?.environment_blocked || 0)
        + (report.summary?.statesByStatus?.environment_blocked || 0);

    return {
        present: true,
        path: path.relative(ROOT, filePath).replaceAll('\\', '/'),
        passed: (
            requiredWidthFailures === 0
            && !report.summary?.statesByStatus?.failed
            && environmentBlocked === 0
        ),
        summary: report.summary,
        environmentBlocked,
    };
}

function validatePerformanceEvidence() {
    const relativePath = 'test-results/epic-c/batch-5/brand-performance-static.json';

    if (!exists(relativePath)) {
        return {
            present: false,
            path: relativePath,
            passed: false,
        };
    }

    const report = readJson(path.join(ROOT, relativePath));
    const globalChrome = report.static?.details?.globalChrome || null;
    const failedMetrics = (globalChrome?.metrics || []).filter((metric) => !metric.passed);

    return {
        present: true,
        path: relativePath,
        passed: failedMetrics.length === 0 && (report.static?.violations || []).length === 0,
        globalChromeMetrics: globalChrome?.metrics || [],
        failedMetrics,
    };
}

function validateAutomationState() {
    const staticReport = readReport(/^epic-c-qa-static-.*\.json$/);
    const previewReport = readReport(/^epic-c-qa-preview-.*\.json$/);
    const accessibility = validateAccessibilityEvidence();
    const responsive = validateResponsiveEvidence();
    const performance = validatePerformanceEvidence();
    const failures = [];

    if (!staticReport.present) {
        failures.push('Missing Epic C static QA report.');
    } else if (!staticReport.passed) {
        failures.push('Epic C static QA report did not pass.');
    }

    if (!previewReport.present) {
        failures.push('Missing Epic C preview QA report.');
    } else if (!previewReport.passed) {
        failures.push('Epic C preview QA report did not pass.');
    }

    if (previewReport.environmentBlocked) {
        failures.push('Epic C preview QA report contains environment-blocked required suites.');
    }

    if (!accessibility.passed) {
        failures.push('Global chrome accessibility evidence is missing or failed.');
    }

    if (!responsive.passed) {
        failures.push('Responsive global chrome evidence is missing or failed required width rules.');
    }

    if (!performance.passed) {
        failures.push('Global chrome performance evidence is missing or failed.');
    }

    return {
        passed: failures.length === 0,
        failures,
        staticReport,
        previewReport,
        accessibility,
        responsive,
        performance,
    };
}

function knownBlockerState(plan) {
    const blockers = plan.knownBlockers || [];
    const closureBlockers = blockers.filter((blocker) => blocker.blocksEpicClosure);
    const technicalClosureBlockers = closureBlockers.filter((blocker) => !blocker.humanSignoffOnly);
    const humanSignoffBlockers = closureBlockers.filter((blocker) => blocker.humanSignoffOnly);

    return {
        blockers,
        closureBlockers,
        technicalClosureBlockers,
        humanSignoffBlockers,
        passed: technicalClosureBlockers.length === 0,
    };
}

function writeReport(report) {
    fs.mkdirSync(RESULT_ROOT, {
        recursive: true,
    });
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

function main() {
    const options = parseArguments(process.argv.slice(2));
    const plan = readJson(PLAN_PATH);
    const packageDocument = readJson(path.join(ROOT, 'package.json'));
    const planViolations = validatePlanShape(plan, packageDocument);
    const artifactCompleteness = validateArtifacts(plan);
    const documentationReferences = validateDocumentationReferences(plan);
    const blockerState = knownBlockerState(plan);
    const automationState = options.artifactsOnly
        ? {
            skipped: true,
            passed: true,
            failures: [],
        }
        : validateAutomationState();
    const artifactViolations = [
        ...planViolations,
        ...artifactCompleteness.missing.map((artifact) => (
            `Missing required artifact: ${artifact.path}`
        )),
        ...documentationReferences.missing.flatMap((reference) => (
            reference.present
                ? reference.missingStrings.map((value) => (
                    `${reference.path} does not include required reference "${value}".`
                ))
                : [`Missing documentation file: ${reference.path}`]
        )),
    ];
    const technicalGatesPassed = (
        artifactViolations.length === 0
        && automationState.passed
        && blockerState.passed
    );
    const canCloseEpic = (
        technicalGatesPassed
        && blockerState.humanSignoffBlockers.length === 0
    );
    const passed = options.artifactsOnly
        ? artifactViolations.length === 0
        : technicalGatesPassed;
    const report = {
        generatedAt: new Date().toISOString(),
        mode: options.artifactsOnly ? 'artifacts-only' : 'finalization',
        passed,
        technicalGatesPassed,
        previewThemeId: plan.previewThemeId,
        productionThemeId: plan.productionThemeId,
        productionMutationAllowed: plan.productionMutationAllowed,
        artifactCompleteness,
        documentationReferences,
        automationState,
        knownBlockers: blockerState.blockers,
        epicClosure: {
            canClose: canCloseEpic,
            humanSignoffRemaining: blockerState.humanSignoffBlockers.length > 0,
            unresolvedPbis: blockerState.closureBlockers.map((blocker) => ({
                pbi: blocker.pbi,
                reason: blocker.reason,
                owner: blocker.owner,
                humanSignoffOnly: Boolean(blocker.humanSignoffOnly),
            })),
        },
        violations: [
            ...artifactViolations,
            ...automationState.failures,
            ...(
                options.artifactsOnly
                    ? []
                    : blockerState.technicalClosureBlockers.map((blocker) => (
                        `${blocker.pbi} remains unresolved: ${blocker.reason}`
                    ))
            ),
        ],
    };

    writeReport(report);

    if (!report.passed) {
        console.error(`Epic C finalization validation failed. Report: ${path.relative(ROOT, REPORT_PATH)}`);

        for (const violation of report.violations) {
            console.error(`- ${violation}`);
        }

        process.exitCode = 1;
        return;
    }

    console.log(`Epic C finalization validation passed. Report: ${path.relative(ROOT, REPORT_PATH)}`);
}

try {
    main();
} catch (error) {
    console.error(`Epic C finalization validation failed:\n${error.stack || error.message}`);
    process.exitCode = 1;
}
