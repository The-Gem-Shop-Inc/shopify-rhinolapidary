'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const PLAN_PATH = path.join(ROOT, 'data', 'epic-d-homepage-qa-plan.json');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseMode(argv) {
    const argument = argv.find((value) => value.startsWith('--mode='));
    const mode = argument ? argument.slice(7) : 'all';

    if (!['static', 'preview', 'all'].includes(mode)) {
        throw new Error('--mode must be static, preview, or all.');
    }

    return mode;
}

function safeTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function sanitize(value) {
    let output = String(value || '');

    for (const key of ['STOREFRONT_PASSWORD', 'SHOPIFY_CLI_TOKEN', 'SHOPIFY_ACCESS_TOKEN', 'SHOPIFY_ADMIN_ACCESS_TOKEN']) {
        if (process.env[key]) {
            output = output.split(process.env[key]).join('[redacted]');
        }
    }

    return output;
}

function classifyEnvironmentBlocked(exitCode, output) {
    if (exitCode === 0) return '';

    if (/PREVIEW_BASE_URL|PREVIEW_URL|STOREFRONT_PASSWORD|StorefrontChallengeError|captcha|HTTP 429|Cloudflare/i.test(output)) {
        return 'Preview storefront access is unavailable or blocked.';
    }

    return '';
}

function runSuite(suite) {
    const startedAt = new Date();
    const start = Date.now();
    const command = process.env.npm_execpath ? process.execPath : (process.platform === 'win32' ? 'npm.cmd' : 'npm');
    const args = process.env.npm_execpath
        ? [process.env.npm_execpath, 'run', suite.npmScript]
        : ['run', suite.npmScript];

    console.log(`\n=== ${suite.id}: npm run ${suite.npmScript} ===`);

    const result = spawnSync(command, args, {
        cwd: ROOT,
        env: process.env,
        encoding: 'utf8',
        shell: !process.env.npm_execpath && process.platform === 'win32',
    });
    const stdout = sanitize(result.stdout);
    const stderr = sanitize(result.stderr);

    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);

    const exitCode = typeof result.status === 'number' ? result.status : 1;
    const blockedReason = classifyEnvironmentBlocked(exitCode, `${stdout}\n${stderr}`);

    return {
        id: suite.id,
        capability: suite.capability,
        mode: suite.mode,
        npmScript: suite.npmScript,
        command: `npm run ${suite.npmScript}`,
        required: suite.required,
        startedAt: startedAt.toISOString(),
        endedAt: new Date().toISOString(),
        durationMs: Date.now() - start,
        passed: exitCode === 0 && !result.error,
        failed: exitCode !== 0 || Boolean(result.error),
        skipped: false,
        environmentBlocked: Boolean(blockedReason),
        blockedReason: blockedReason || null,
        exitCode,
        error: result.error?.message || null,
    };
}

function main() {
    const mode = parseMode(process.argv.slice(2));
    const plan = readJson(PLAN_PATH);
    const packageScripts = readJson(path.join(ROOT, 'package.json')).scripts || {};
    const suites = plan.automatedSuites.filter((suite) => mode === 'all' || suite.mode === mode);
    const startedAt = new Date();
    const start = Date.now();
    const results = [];

    for (const suite of suites) {
        if (!packageScripts[suite.npmScript]) {
            results.push({
                id: suite.id,
                capability: suite.capability,
                mode: suite.mode,
                npmScript: suite.npmScript,
                command: `npm run ${suite.npmScript}`,
                required: suite.required,
                durationMs: 0,
                passed: false,
                failed: true,
                skipped: true,
                environmentBlocked: false,
                exitCode: 1,
                error: `Missing package script ${suite.npmScript}.`,
            });
            continue;
        }

        results.push(runSuite(suite));
    }

    const failedRequired = results.filter((result) => result.required && !result.passed);
    const report = {
        generatedAt: new Date().toISOString(),
        startedAt: startedAt.toISOString(),
        mode,
        previewThemeId: plan.previewThemeId,
        productionThemeId: plan.productionThemeId,
        productionMutationAllowed: plan.productionMutationAllowed,
        productionApproved: plan.productionApproved,
        humanGoNoGoRequired: plan.humanGoNoGoRequired,
        passed: failedRequired.length === 0,
        totals: {
            selected: results.length,
            passed: results.filter((result) => result.passed).length,
            failed: results.filter((result) => result.failed).length,
            failedRequired: failedRequired.length,
            skipped: results.filter((result) => result.skipped).length,
            environmentBlocked: results.filter((result) => result.environmentBlocked).length,
            durationMs: Date.now() - start,
        },
        results,
    };
    const resultRoot = path.join(ROOT, plan.resultRoot);
    const reportPath = path.join(resultRoot, `epic-d-qa-${mode}-${safeTimestamp()}.json`);

    fs.mkdirSync(resultRoot, { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`\nEpic D QA report: ${path.relative(ROOT, reportPath)}`);

    if (failedRequired.length) {
        console.error(`Epic D QA failed required suites: ${failedRequired.map((entry) => entry.id).join(', ')}`);
        process.exitCode = 1;
    } else {
        console.log('Epic D QA required suites passed.');
    }
}

try {
    main();
} catch (error) {
    console.error(`Epic D QA runner failed:\n${error.stack || error.message}`);
    process.exitCode = 1;
}
