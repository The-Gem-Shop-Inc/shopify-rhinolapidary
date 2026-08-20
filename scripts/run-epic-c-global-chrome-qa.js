'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const PLAN_PATH = path.join(ROOT, 'data', 'epic-c-global-chrome-qa-plan.json');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArguments(argv) {
    const options = {
        mode: 'all',
    };

    for (const argument of argv) {
        if (argument.startsWith('--mode=')) {
            options.mode = argument.slice('--mode='.length);
        } else {
            throw new Error(`Unknown argument: ${argument}`);
        }
    }

    if (!['static', 'preview', 'all'].includes(options.mode)) {
        throw new Error('--mode must be static, preview, or all.');
    }

    return options;
}

function safeTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function sanitizeOutput(value) {
    let text = String(value || '');

    for (const secretName of [
        'STOREFRONT_PASSWORD',
        'SHOPIFY_CLI_TOKEN',
        'SHOPIFY_ACCESS_TOKEN',
        'SHOPIFY_ADMIN_ACCESS_TOKEN',
    ]) {
        const secret = process.env[secretName];

        if (secret) {
            text = text.split(secret).join('[redacted]');
        }
    }

    return text;
}

function npmCommand(suite) {
    if (process.env.npm_execpath) {
        return {
            command: process.execPath,
            args: [
                process.env.npm_execpath,
                'run',
                suite.npmScript,
            ],
            shell: false,
        };
    }

    return {
        command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
        args: ['run', suite.npmScript],
        shell: process.platform === 'win32',
    };
}

function classifyEnvironmentBlocked(suite, exitCode, output) {
    if (
        typeof suite.environmentBlockedExitCode === 'number'
        && exitCode === suite.environmentBlockedExitCode
    ) {
        return 'Suite returned its configured environment-blocked exit code.';
    }

    if (
        /PREVIEW_BASE_URL or PREVIEW_URL|PREVIEW_URL or PREVIEW_BASE_URL|STOREFRONT_PASSWORD|StorefrontChallengeError|challenge|captcha|HTTP 429|throttling|Cloudflare/i
            .test(output)
    ) {
        return 'Preview storefront access was blocked or not configured.';
    }

    return '';
}

function runSuite(suite) {
    const { command, args, shell } = npmCommand(suite);
    const startedAt = new Date();
    const startTime = Date.now();

    console.log(`\n=== ${suite.id}: npm run ${suite.npmScript} ===`);

    const result = spawnSync(command, args, {
        cwd: ROOT,
        env: process.env,
        encoding: 'utf8',
        shell,
    });

    const stdout = sanitizeOutput(result.stdout);
    const stderr = sanitizeOutput(result.stderr);

    if (stdout) {
        process.stdout.write(stdout);
    }

    if (stderr) {
        process.stderr.write(stderr);
    }

    const exitCode = typeof result.status === 'number'
        ? result.status
        : 1;
    const output = `${stdout}\n${stderr}`;
    const environmentBlocker = exitCode === 0
        ? ''
        : classifyEnvironmentBlocked(suite, exitCode, output);

    return {
        id: suite.id,
        capability: suite.capability,
        npmScript: suite.npmScript,
        command: `npm run ${suite.npmScript}`,
        mode: suite.mode,
        required: suite.required,
        evidencePath: suite.evidencePath || null,
        startedAt: startedAt.toISOString(),
        endedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        exitCode,
        signal: result.signal || null,
        passed: exitCode === 0 && !result.error,
        environmentBlocked: Boolean(environmentBlocker),
        blockedReason: environmentBlocker || null,
        error: result.error ? result.error.message : null,
    };
}

function main() {
    const options = parseArguments(process.argv.slice(2));
    const plan = readJson(PLAN_PATH);
    const packageDocument = readJson(path.join(ROOT, 'package.json'));
    const packageScripts = packageDocument.scripts || {};
    const selectedSuites = plan.automatedSuites.filter((suite) => (
        options.mode === 'all' || suite.mode === options.mode
    ));

    if (selectedSuites.length === 0) {
        throw new Error(`No Epic C QA suites configured for mode "${options.mode}".`);
    }

    const results = [];

    for (const suite of selectedSuites) {
        if (!packageScripts[suite.npmScript]) {
            results.push({
                id: suite.id,
                capability: suite.capability,
                npmScript: suite.npmScript,
                command: `npm run ${suite.npmScript}`,
                mode: suite.mode,
                required: suite.required,
                evidencePath: suite.evidencePath || null,
                passed: false,
                skipped: true,
                environmentBlocked: false,
                exitCode: 1,
                error: `Missing package script "${suite.npmScript}".`,
            });
            console.error(`Missing package script: ${suite.npmScript}`);
            continue;
        }

        results.push(runSuite(suite));
    }

    const resultDirectory = path.resolve(ROOT, plan.resultRoot);
    fs.mkdirSync(resultDirectory, {
        recursive: true,
    });

    const failedRequired = results.filter((result) => (
        result.required && !result.passed
    ));
    const report = {
        generatedAt: new Date().toISOString(),
        mode: options.mode,
        planStatus: plan.status,
        previewThemeId: plan.previewThemeId,
        productionThemeId: plan.productionThemeId,
        productionMutationAllowed: plan.productionMutationAllowed,
        passed: failedRequired.length === 0,
        totals: {
            selected: results.length,
            passed: results.filter((result) => result.passed).length,
            failed: results.filter((result) => !result.passed).length,
            failedRequired: failedRequired.length,
            environmentBlocked: results.filter((result) => result.environmentBlocked).length,
            skipped: results.filter((result) => result.skipped).length,
        },
        results,
    };

    const reportPath = path.join(
        resultDirectory,
        `epic-c-qa-${options.mode}-${safeTimestamp()}.json`,
    );

    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`\nEpic C QA report: ${path.relative(ROOT, reportPath)}`);

    if (failedRequired.length > 0) {
        console.error(
            `\nEpic C QA failed required suites:\n- ${
                failedRequired.map((result) => result.id).join('\n- ')
            }`,
        );

        process.exitCode = 1;
        return;
    }

    console.log('\nEpic C QA automated suites passed.');
}

try {
    main();
} catch (error) {
    console.error(`Epic C QA runner failed:\n${error.stack || error.message}`);
    process.exitCode = 1;
}
