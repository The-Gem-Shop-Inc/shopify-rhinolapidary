'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

const PLAN_PATH = path.join(
    ROOT,
    'data',
    'epic-b-brand-qa-plan.json',
);

function readJson(filePath) {
    return JSON.parse(
        fs.readFileSync(filePath, 'utf8'),
    );
}

function parseArguments(argv) {
    const options = {
        mode: 'all',
    };

    for (const argument of argv) {
        if (argument.startsWith('--mode=')) {
            options.mode = argument.slice(
                '--mode='.length,
            );
        } else {
            throw new Error(
                `Unknown argument: ${argument}`,
            );
        }
    }

    if (
        !['static', 'preview', 'all'].includes(
            options.mode,
        )
    ) {
        throw new Error(
            '--mode must be static, preview, or all.',
        );
    }

    return options;
}

function safeTimestamp() {
    return new Date()
        .toISOString()
        .replace(/[:.]/g, '-');
}

function runSuite(suite) {
    const command = process.env.npm_execpath
        ? process.execPath
        : (
            process.platform === 'win32'
                ? 'npm.cmd'
                : 'npm'
        );
    const args = process.env.npm_execpath
        ? [
            process.env.npm_execpath,
            'run',
            suite.npmScript,
        ]
        : [
            'run',
            suite.npmScript,
        ];
    const useShell =
        process.platform === 'win32'
        && !process.env.npm_execpath;

    const startedAt = new Date();
    const startTime = Date.now();

    console.log(
        `\n=== ${suite.id}: npm run ${suite.npmScript} ===`,
    );

    const result = spawnSync(
        command,
        args,
        {
            cwd: ROOT,
            env: process.env,
            stdio: 'inherit',
            shell: useShell,
        },
    );

    const endedAt = new Date();

    return {
        id: suite.id,
        capability: suite.capability,
        npmScript: suite.npmScript,
        mode: suite.mode,
        required: suite.required,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationMs: Date.now() - startTime,
        exitCode:
            typeof result.status === 'number'
                ? result.status
                : 1,
        signal: result.signal || null,
        error: result.error
            ? result.error.message
            : null,
        passed:
            result.status === 0
            && !result.error,
    };
}

function main() {
    const options = parseArguments(
        process.argv.slice(2),
    );

    const plan = readJson(PLAN_PATH);
    const packageDocument = readJson(
        path.join(ROOT, 'package.json'),
    );

    const packageScripts =
        packageDocument.scripts || {};

    const selectedSuites =
        plan.automatedSuites.filter(
            (suite) => (
                options.mode === 'all'
                || suite.mode === options.mode
            ),
        );

    if (selectedSuites.length === 0) {
        throw new Error(
            `No QA suites are configured for mode "${options.mode}".`,
        );
    }

    const results = [];

    for (const suite of selectedSuites) {
        if (!packageScripts[suite.npmScript]) {
            results.push({
                id: suite.id,
                capability: suite.capability,
                npmScript: suite.npmScript,
                mode: suite.mode,
                required: suite.required,
                passed: false,
                skipped: true,
                exitCode: 1,
                error:
                    `Missing package script "${suite.npmScript}".`,
            });

            console.error(
                `Missing package script: ${suite.npmScript}`,
            );

            continue;
        }

        results.push(
            runSuite(suite),
        );
    }

    const resultDirectory = path.resolve(
        ROOT,
        plan.resultRoot,
    );

    fs.mkdirSync(
        resultDirectory,
        {
            recursive: true,
        },
    );

    const reportPath = path.join(
        resultDirectory,
        `epic-b-qa-${options.mode}-${safeTimestamp()}.json`,
    );

    const failedRequired = results.filter(
        (result) => (
            result.required
            && !result.passed
        ),
    );

    const report = {
        generatedAt: new Date().toISOString(),
        mode: options.mode,
        planStatus: plan.status,
        passed:
            failedRequired.length === 0,
        totals: {
            selected: results.length,
            passed: results.filter(
                (result) => result.passed,
            ).length,
            failed: results.filter(
                (result) => !result.passed,
            ).length,
            failedRequired:
            failedRequired.length,
        },
        results,
    };

    fs.writeFileSync(
        reportPath,
        `${JSON.stringify(
            report,
            null,
            2,
        )}\n`,
    );

    console.log(
        `\nEpic B QA report: ${
            path.relative(ROOT, reportPath)
        }`,
    );

    if (failedRequired.length > 0) {
        console.error(
            `\nEpic B QA failed required suites:\n- ${
                failedRequired
                    .map((result) => result.id)
                    .join('\n- ')
            }`,
        );

        process.exitCode = 1;
        return;
    }

    console.log(
        '\nEpic B QA automated suites passed.',
    );
}

try {
    main();
} catch (error) {
    console.error(
        `Epic B QA runner failed:\n${
            error.stack || error.message
        }`,
    );

    process.exitCode = 1;
}
