require('dotenv').config();

const { spawnSync } = require('child_process');

const checks = [
    {
        name: 'Repository hygiene',
        command: 'python',
        args: ['scripts/validate-theme-repository.py'],
    },
    {
        name: 'Shopify Theme Check',
        command: 'shopify',
        args: ['theme', 'check', '--fail-level', 'warning'],
    },
    {
        name: 'JSON registers',
        command: 'npm',
        args: ['run', 'validate:registers'],
    },
    {
        name: 'Data architecture',
        command: 'npm',
        args: ['run', 'validate:data-architecture'],
    },
    {
        name: 'Theme architecture',
        command: 'npm',
        args: ['run', 'validate:theme-architecture'],
    },
    {
        name: 'Cleanup architecture',
        command: 'npm',
        args: ['run', 'validate:cleanup-architecture'],
    },
    {
        name: 'Cart config',
        command: 'npm',
        args: ['run', 'validate:cart-config'],
    },
    {
        name: 'Placeholder content',
        command: 'npm',
        args: ['run', 'check:placeholders'],
    },
    {
        name: 'Production push file audit',
        command: 'npm',
        args: ['run', 'audit:production-files'],
    }
];

const optionalPreviewChecks = [
    {
        name: 'Storefront fixtures',
        command: 'npm',
        args: ['run', 'validate:fixtures'],
    },
    {
        name: 'Desktop smoke tests',
        command: 'npm',
        args: ['run', 'test:smoke', '--', '--project=desktop-chromium'],
    },
    {
        name: 'Desktop cart tests',
        command: 'npm',
        args: ['run', 'test:cart', '--', '--project=desktop-chromium'],
    },
    {
        name: 'Desktop accessibility tests',
        command: 'npm',
        args: ['run', 'test:ally', '--', '--project=desktop-chromium'],
    },
    {
        name: 'Navigation tests',
        command: 'npm',
        args: ['run', 'test:navigation', '--', '--project=desktop-chromium'],
    },
];

const windowsCommandMap = {
    npm: 'npm.cmd',
    npx: 'npx.cmd',
    shopify: 'shopify.cmd',
};

function commandInvocation(command, args) {
    if (process.platform !== 'win32' || !windowsCommandMap[command]) {
        return { command, args };
    }

    return {
        command: 'cmd.exe',
        args: ['/d', '/s', '/c', windowsCommandMap[command], ...args],
    };
}

function runCheck(check) {
    console.log(`\n=== ${check.name} ===`);
    console.log(`${check.command} ${check.args.join(' ')}`);

    const invocation = commandInvocation(check.command, check.args);
    const result = spawnSync(invocation.command, invocation.args, {
        stdio: 'inherit',
    });

    if (result.status !== 0) {
        console.error(`\nFAILED: ${check.name}`);
        return false;
    }

    console.log(`PASSED: ${check.name}`);
    return true;
}

let failed = false;
const previewUrlEnvName = process.env.PREVIEW_URL
    ? 'PREVIEW_URL'
    : process.env.PREVIEW_BASE_URL
        ? 'PREVIEW_BASE_URL'
        : null;

for (const check of checks) {
    if (!runCheck(check)) {
        failed = true;
    }
}

if (previewUrlEnvName) {
    console.log(`\nRunning preview-dependent checks using ${previewUrlEnvName}.`);

    for (const check of optionalPreviewChecks) {
        if (!runCheck(check)) {
            failed = true;
        }
    }
} else {
    console.warn('\nSkipping preview-dependent checks because PREVIEW_URL or PREVIEW_BASE_URL is not set.');
}

if (failed) {
    console.error('\nProduction readiness validation failed.');
    process.exit(1);
}

console.log('\nProduction readiness validation passed.');
