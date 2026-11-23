
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const [sourceRoot, readbackRoot] = process.argv.slice(2);

assert(sourceRoot && readbackRoot, 'Source and Shopify readback paths required');

const themeDirs = [
    'assets', 'blocks', 'config', 'layout',
    'locales', 'sections', 'snippets', 'templates'
];

const textExtensions = new Set([
    '.liquid', '.css', '.js', '.json', '.svg',
    '.html', '.txt', '.xml', '.scss',
    '.map', '.webmanifest'
]);

function inventory(root) {
    assert(fs.existsSync(root), `Directory missing: ${root}`);

    const files = new Map();

    function visit(directory) {
        for (const entry of fs.readdirSync(directory, {
            withFileTypes: true
        })) {
            const absolute = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                visit(absolute);
            } else if (entry.isFile()) {
                const relative = path.relative(root, absolute)
                    .replace(/\\/g, '/');

                const raw = fs.readFileSync(absolute);
                const extension = path.extname(absolute).toLowerCase();

                let canonical = raw;

                if (textExtensions.has(extension)) {
                    const decoded = new TextDecoder('utf-8', {
                        fatal: true
                    }).decode(raw);

                    canonical = Buffer.from(
                        decoded.replace(/\r\n/g, '\n'),
                        'utf8'
                    );
                }

                const hash = bytes =>
                    crypto.createHash('sha256').update(bytes).digest('hex');

                files.set(relative, {
                    raw: hash(raw),
                    canonical: hash(canonical)
                });
            }
        }
    }

    for (const directory of themeDirs) {
        const target = path.join(root, directory);

        if (fs.existsSync(target)) {
            visit(target);
        }
    }

    return files;
}

const source = inventory(sourceRoot);
const remote = inventory(readbackRoot);

const missing = [...source.keys()].filter(p => !remote.has(p));
const extra = [...remote.keys()].filter(p => !source.has(p));

const contentDifferences = [];
const newlineDifferences = [];

for (const [file, expected] of source) {
    const actual = remote.get(file);
    if (!actual) continue;

    if (expected.canonical !== actual.canonical) {
        contentDifferences.push(file);
    } else if (expected.raw !== actual.raw) {
        newlineDifferences.push(file);
    }
}

const result = {
    sourceFiles: source.size,
    shopifyFiles: remote.size,
    missing,
    extra,
    contentDifferences,
    newlineDifferences: newlineDifferences.length,
    passed:
        source.size === 407 &&
        remote.size === 407 &&
        missing.length === 0 &&
        extra.length === 0 &&
        contentDifferences.length === 0
};

console.log(JSON.stringify(result, null, 2));

if (!result.passed) process.exitCode = 1;
