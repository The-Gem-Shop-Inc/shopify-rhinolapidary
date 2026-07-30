const { spawnSync } = require('child_process');

const forbiddenTrackedPatterns = [
    /^\.env$/,
    /^\.env\./,
    /^\.idea\//,
    /^\.shopify\//,
    /^node_modules\//,
    /^coverage\//,
    /^test-results\//,
    /^playwright-report\//,
    /^blob-report\//,
    /^__pycache__\//,
    /\.log$/,
    /\.tmp$/,
    /\.temp$/,
    /^data\/product-export\/.*\.csv$/,
];

const allowedGeneratedFiles = new Set([
    'data/product-export/.gitkeep',
]);

function git(args) {
    const result = spawnSync('git', args, {
        encoding: 'utf8',
        shell: process.platform === 'win32',
    });

    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout);
    }

    return result.stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

const trackedFiles = git(['ls-files']);
const errors = [];

for (const file of trackedFiles) {
    if (allowedGeneratedFiles.has(file)) {
        continue;
    }

    for (const pattern of forbiddenTrackedPatterns) {
        if (pattern.test(file)) {
            errors.push(`Forbidden tracked file: ${file}`);
            break;
        }
    }
}

const status = git(['status', '--short']);

const concerningUntracked = status.filter((line) =>
    line.startsWith('??') &&
    (
        line.includes('.env') ||
        line.includes('test-results') ||
        line.includes('playwright-report') ||
        line.includes('coverage') ||
        line.includes('.shopify') ||
        line.includes('.idea')
    )
);

if (concerningUntracked.length > 0) {
    errors.push('Concerning untracked local files exist:');
    for (const line of concerningUntracked) {
        errors.push(`  ${line}`);
    }
}

if (errors.length > 0) {
    console.error('Production push file audit failed.');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log(`Production push file audit passed for ${trackedFiles.length} tracked files.`);