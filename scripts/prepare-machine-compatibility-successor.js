
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const mode = process.argv[2];
assert(['--apply', '--check'].includes(mode), 'Use --apply or --check');

const repo = process.cwd();
const themeRepo = path.join(
    process.env.LOCALAPPDATA || '',
    'RhinoLapidary', 'jg-production', '20261119T150005', 'github-theme-v5'
);

assert(fs.existsSync(path.join(themeRepo, '.git')), 'GitHub theme worktree missing');

const baseCommit = 'e45bcc2';
const devBaseCommit = '48f0e61';

const contextIds = [
    '8905780756677',
    '8905781477573',
    '8905784131781',
    '8905784197317',
    '8905785344197',
];

const themeFiles = [
    'assets/rhino-storefront.js',
    'snippets/rhino-owner-approved-context.liquid',
    ...contextIds.map(id => `snippets/rhino-owner-approved-context-${id}.liquid`),
];

const ownerGate =
    ' and rhino_owner_now >= 1792095997 and rhino_owner_now < 1792700797';

const ownerClock =
    "{%- assign rhino_owner_now = 'now' | date: '%s' | plus: 0 -%}\n";

const normalize = text => text.replace(/\r\n/g, '\n');

function replaceOnce(text, oldText, newText, label) {
    const first = text.indexOf(oldText);

    assert(first >= 0, `Expected source marker missing: ${label}`);
    assert(
        text.indexOf(oldText, first + oldText.length) < 0,
        `Ambiguous source marker: ${label}`
    );

    return text.slice(0, first) +
        newText +
        text.slice(first + oldText.length);
}

function gitFile(gitDir, commit, relative) {
    return normalize(execFileSync(
        'git',
        ['-C', gitDir, 'show', `${commit}:${relative}`],
        { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }
    ));
}

function transform(relative, source) {
    if (relative.endsWith('.liquid')) {
        const noClock = replaceOnce(
            source,
            ownerClock,
            '',
            `${relative}: unused clock`
        );

        return replaceOnce(
            noClock,
            ownerGate,
            '',
            `${relative}: expiry condition`
        );
    }

    let result = source;

    const edits = [
        [
            "    const receiptExpiresAt = Date.parse('2026-10-22T20:26:37.102Z');\n",
            '',
            'expiry constant',
        ],
        [
            "    const receiptCurrent = () => Number.isFinite(Date.now()) && Date.now() < receiptExpiresAt;\n",
            '',
            'expiry predicate',
        ],
        [
            "        if (!receiptCurrent()) {\n            document.querySelectorAll(selector).forEach((entry) => entry.parentElement.remove());\n            return;\n        }\n\n",
            '',
            'expiry removal block',
        ],
        [
            'if (!receiptCurrent() || !target.isConnected)',
            'if (!target.isConnected)',
            'focus safety',
        ],
        [
            '            setTimeout(() => wrapper.remove(), Math.min(receiptExpiresAt - Date.now(), 2147483647));\n',
            '',
            'expiry timer',
        ],
    ];

    for (const [before, after, label] of edits) {
        result = replaceOnce(result, before, after, `${relative}: ${label}`);
    }

    assert(!result.includes('receiptCurrent'));
    assert(!result.includes('receiptExpiresAt'));

    return result;
}

function compilerSuccessor(source) {
    const oldSetup =
        ' const facts=[header],context=[header],shards={};let index=0;';

    const newSetup = [
        '  const contextHeader=header',
        `    .replace("{%- assign rhino_owner_now = 'now' | date: '%s' | plus: 0 -%}\\n", '')`,
        "    .replace(/ and rhino_owner_now >= \\d+ and rhino_owner_now < \\d+/, '');",
        "  assert.notEqual(contextHeader,header,'Expected approved context guard');",
        '  const facts=[header],context=[contextHeader],shards={};let index=0;',
    ].join('\n');

    const oldShard =
        "shards['snippets/'+contextSnippet+'.liquid']=header+contextBody";

    const newShard =
        "shards['snippets/'+contextSnippet+'.liquid']=contextHeader+contextBody";

    if (source.includes(newSetup) && source.includes(newShard)) {
        return source;
    }

    let next = replaceOnce(
        source,
        oldSetup,
        newSetup,
        'F compiler context header'
    );

    next = replaceOnce(
        next,
        oldShard,
        newShard,
        'F compiler context shard'
    );

    return next;
}

const changes = [];

for (const relative of themeFiles) {
    const file = path.join(repo, relative);

    assert(fs.existsSync(file), `Missing file: ${relative}`);

    const raw = fs.readFileSync(file, 'utf8');
    const current = normalize(raw);

    const themeOriginal = gitFile(themeRepo, baseCommit, relative);

    const original = relative === 'assets/rhino-storefront.js'
        ? gitFile(repo, devBaseCommit, relative)
        : themeOriginal;

    if (relative === 'assets/rhino-storefront.js') {
        assert(
            original.startsWith(themeOriginal),
            'Development G3A asset must extend the exact deployed storefront asset'
        );
    }

    const expected = transform(relative, original);

    if (mode === '--apply') {
        assert(
            current === original || current === expected,
            `Unexpected local drift: ${relative}`
        );
    } else {
        assert.equal(current, expected, `Successor differs: ${relative}`);
    }

    changes.push({ relative, file, raw, current, expected });
}

const compilerFile = path.join(
    repo,
    'scripts/lib/epic-f-customer-release.js'
);

const compilerRaw = fs.readFileSync(compilerFile, 'utf8');
const compilerCurrent = normalize(compilerRaw);
const compilerExpected = compilerSuccessor(compilerCurrent);

if (mode === '--check') {
    assert.equal(
        compilerCurrent,
        compilerExpected,
        'F compiler missing context successor'
    );
}

if (mode === '--apply') {
    for (const change of changes) {
        if (change.current === change.expected) continue;

        const eol = change.raw.includes('\r\n') ? '\r\n' : '\n';

        fs.writeFileSync(
            change.file,
            change.expected.replace(/\n/g, eol),
            'utf8'
        );

        console.log(`Updated ${change.relative}`);
    }

    if (compilerCurrent !== compilerExpected) {
        const eol = compilerRaw.includes('\r\n') ? '\r\n' : '\n';

        fs.writeFileSync(
            compilerFile,
            compilerExpected.replace(/\n/g, eol),
            'utf8'
        );

        console.log('Updated scripts/lib/epic-f-customer-release.js');
    }
}

console.log(
    `PASS: ${themeFiles.length} bounded theme files and F generator ${mode}`
);
