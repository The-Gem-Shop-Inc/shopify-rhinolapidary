
'use strict';

// Local J/G production candidate preparation and readback.
// This script never writes to Shopify.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const cp = require('node:child_process');

const repo = path.resolve(__dirname, '..');

const phaseB = JSON.parse(fs.readFileSync(
    path.join(repo, 'data/j2-g4-preview-deployment-manifest.json')
));

const phaseC = JSON.parse(fs.readFileSync(
    path.join(repo, 'data/j2-g4-phase-c-corrective-manifest.json')
));

const { parseJsonDocument } = require(
    path.join(repo, 'scripts/lib/j2-g4-json-integrity.js')
);

const semanticPaths = new Set([
    'locales/en.default.json',
    'templates/collection.json',
    'templates/collection.directory.json',
]);

const sha = b => crypto.createHash('sha256').update(b).digest('hex');

const read = (root, rel) =>
    fs.readFileSync(path.join(root, ...rel.split('/')));

const exists = (root, rel) =>
    fs.existsSync(path.join(root, ...rel.split('/')));

const dependencies = new Map(
    phaseB.unchangedRuntimeDependencies.map(r => [r.path, r.sha256])
);

const accepted = new Map([
    ...phaseB.themeFiles.map(r => [r.path, r.sha256]),
    ...dependencies,
]);

for (const r of phaseC.runtimeFiles) {
    accepted.set(r.path, r.candidateSha256);
}

assert.equal(phaseB.themeFiles.length, 17);
assert.equal(phaseC.runtimeFiles.length, 7);
assert.equal(dependencies.size, 5);
assert.equal(accepted.size, 28, 'Unexpected release closure');

const successorCorrection = 'snippets/rhino-machine-specification-row.liquid';

function enumerate(root) {
    const output = [];

    function visit(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                visit(full);
            } else if (entry.isFile()) {
                output.push(path.relative(root, full).replace(/\\/g, '/'));
            } else {
                throw new Error(`Unexpected filesystem entry: ${full}`);
            }
        }
    }

    visit(root);
    return output.sort();
}

function inventory(root) {
    return enumerate(root).map(p => ({
        path: p,
        sha256: sha(read(root, p)),
        size: fs.statSync(path.join(root, ...p.split('/'))).size,
    }));
}

function inventoryDigest(records) {
    return sha(Buffer.from(JSON.stringify(records)));
}

function verifyRepository() {
    const git = args => cp.execFileSync('git', args, {
        cwd: repo,
        encoding: 'utf8',
    }).trim();

    assert.equal(
        git(['branch', '--show-current']),
        'integration/catalog-cart-preview'
    );

    const head = git(['rev-parse', 'HEAD']);

    const ancestor = cp.spawnSync('git', [
        'merge-base',
        '--is-ancestor',
        '216270579eefba8f7558bbce84e260a06f4fefcc',
        head,
    ], { cwd: repo });

    assert.equal(ancestor.status, 0, 'Accepted J/G commit is not an ancestor');
    assert.equal(head, git(['rev-parse', '@{u}']), 'Upstream drift');
}

function verifyAcceptedPreview(preview) {
    const results = [];

    for (const [rel, expected] of accepted) {
        assert(exists(preview, rel), `Preview missing ${rel}`);

        const remote = read(preview, rel);
        const source = read(repo, rel);

        assert.equal(
            sha(source),
            expected,
            `Repository source drift: ${rel}`
        );

        if (semanticPaths.has(rel)) {
            const original = parseJsonDocument(source, {
                label: `${rel} repository`,
            });

            const deployed = parseJsonDocument(remote, {
                label: `${rel} preview`,
                allowShopifyHeader: true,
            });

            assert.equal(
                deployed.semanticDigest,
                original.semanticDigest,
                `Preview JSON drift: ${rel}`
            );

            assert(
                remote.subarray(remote.length - source.length).equals(source),
                `Preview JSON must preserve exact candidate suffix: ${rel}`
            );
        } else {
            assert.equal(
                sha(remote),
                expected,
                `Preview exact hash drift: ${rel}`
            );
        }

        results.push({
            path: rel,
            sourceSha256: expected,
            previewSha256: sha(remote),
        });
    }

    return results;
}


function localeRemovals(production) {
    const defaults = new Set([
        'locales/en.default.json',
        'locales/en.default.schema.json',
    ]);

    const allLocales = enumerate(production).filter(p =>
        /^locales\/[^/]+\.json$/.test(p)
    );

    for (const required of defaults) {
        assert(
            allLocales.includes(required),
            `Required English locale is missing: ${required}`
        );
    }

    assert.equal(
        allLocales.length,
        51,
        'Production locale inventory has changed'
    );

    const removals = allLocales.filter(p => !defaults.has(p));

    const storefrontCount = removals.filter(
        p => !p.endsWith('.schema.json')
    ).length;

    const schemaCount = removals.filter(
        p => p.endsWith('.schema.json')
    ).length;

    assert.equal(
        storefrontCount,
        30,
        'Unexpected storefront locale inventory'
    );

    assert.equal(
        schemaCount,
        19,
        'Unexpected theme editor locale inventory'
    );

    assert.equal(removals.length, 49);

    return removals;
}

function makePlan(production, preview, localePolicy) {
    assert(['keep', 'english-only'].includes(localePolicy));

    const source = verifyAcceptedPreview(preview);
    const base = inventory(production);
    const baseMap = new Map(base.map(r => [r.path, r]));

    assert(
        !baseMap.has(successorCorrection),
        'Corrective snippet already exists in production; investigate drift'
    );

    assert(
        exists(repo, successorCorrection),
        'Corrective snippet is missing from the repository'
    );

    const replacements = source.filter(r =>
        baseMap.has(r.path) &&
        baseMap.get(r.path).sha256 !== r.previewSha256
    );

    const additions = source.filter(r => !baseMap.has(r.path));

    const unchanged = source.filter(r =>
        baseMap.has(r.path) &&
        baseMap.get(r.path).sha256 === r.previewSha256
    );

    assert.equal(
        replacements.length + additions.length,
        26,
        'Production has drifted from the expected 26-path transaction'
    );

    assert.equal(unchanged.length, 2);

    return {
        schemaVersion: 1,
        release: 'JG_PRODUCTION_DERIVED_RC1',
        shop: 'sz5dnk-nf.myshopify.com',
        productionTheme: '158579622085',
        acceptedPreviewTheme: '158631198917',
        sourceCommit: '216270579eefba8f7558bbce84e260a06f4fefcc',
        productionInventoryDigest: inventoryDigest(base),
        productionFileCount: base.length,
        localePolicy,
        replacements: replacements.map(r => r.path),
        additions: additions.map(r => r.path),
        unchangedClosure: unchanged.map(r => r.path),
        intentionalLocaleRemovals:
            localePolicy === 'english-only' ? localeRemovals(production) : [],
        source,
        successorCorrection: {
            path: successorCorrection,
            operation: 'ADD',
            sha256: sha(read(repo, successorCorrection)),
            rationale: 'Repair the historical missing machine specification row reference',
        },
        createdAt: new Date().toISOString(),
    };
}

function verifyCandidate(production, preview, candidate, policy) {
    verifyAcceptedPreview(preview);

    const baseline = new Map(
        inventory(production).map(r => [r.path, r])
    );

    const expectedPaths = new Set([
        ...baseline.keys(),
        ...accepted.keys(),
        successorCorrection,
    ]);

    if (policy === 'english-only') {
        for (const rel of localeRemovals(production)) {
            expectedPaths.delete(rel);
        }
    }

    const actualPaths = enumerate(candidate);

    assert.deepEqual(
        actualPaths,
        [...expectedPaths].sort(),
        'Candidate contains unexpected or missing theme files'
    );

    for (const rel of actualPaths) {
        const actual = read(candidate, rel);

        if (accepted.has(rel)) {
            const previewBody = read(preview, rel);

            if (semanticPaths.has(rel)) {
                const a = parseJsonDocument(actual, {
                    label: `${rel} candidate`,
                    allowShopifyHeader: true,
                });

                const b = parseJsonDocument(previewBody, {
                    label: `${rel} preview`,
                    allowShopifyHeader: true,
                });

                assert.equal(
                    a.semanticDigest,
                    b.semanticDigest,
                    `Candidate JSON drift: ${rel}`
                );
            } else {
                assert.equal(
                    sha(actual),
                    sha(previewBody),
                    `Candidate runtime drift: ${rel}`
                );
            }
        } else if (rel === successorCorrection) {
            assert.equal(
                baseline.has(rel),
                false,
                'Correction unexpectedly replaces a production file'
            );

            assert.equal(
                sha(actual),
                sha(read(repo, rel)),
                `Corrective source mismatch: ${rel}`
            );
        } else {
            assert.equal(
                sha(actual),
                baseline.get(rel).sha256,
                `Unrelated production asset changed: ${rel}`
            );
        }
    }

    return {
        result: 'PASS',
        files: actualPaths.length,
        acceptedClosure: accepted.size,
        originalProductionFiles: baseline.size,
        preservedProductionFiles:
        actualPaths.filter(p => !accepted.has(p)).length,
        localePolicy: policy,
        candidateInventoryDigest: inventoryDigest(inventory(candidate)),
    };
}

function main() {
    const [
        mode,
        productionDirectory,
        previewDirectory,
        candidateDirectory,
        policy = 'keep',
    ] = process.argv.slice(2);

    assert(
        ['plan', 'build', 'verify'].includes(mode),
        'Usage: node prepare-jg-production-candidate.js plan|build|verify production preview candidate [keep|english-only]'
    );

    assert(productionDirectory && previewDirectory && candidateDirectory);

    verifyRepository();

    const production = path.resolve(productionDirectory);
    const preview = path.resolve(previewDirectory);
    const target = path.resolve(candidateDirectory);

    assert.notEqual(production, preview);
    assert.notEqual(production, target);
    assert.notEqual(preview, target);

    const plan = makePlan(production, preview, policy);

    if (mode === 'plan') {
        console.log(JSON.stringify(plan, null, 2));
        return;
    }

    if (mode === 'build') {
        assert(
            !fs.existsSync(target),
            'Candidate directory already exists; refusing overwrite'
        );

        if (policy === 'english-only') {
            assert.equal(
                process.env.RHINO_APPROVE_LOCALE_REMOVAL,
                'I APPROVE REMOVING 49 NON-ENGLISH LOCALE FILES FROM LOCAL STAGING',
                'Explicit English-only staging approval is missing'
            );
        }

        fs.cpSync(production, target, {
            recursive: true,
            force: false,
        });

        for (const rel of accepted.keys()) {
            const dest = path.join(target, ...rel.split('/'));
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(
                path.join(preview, ...rel.split('/')),
                dest
            );
        }

        const correctionDestination = path.join(
            target,
            ...successorCorrection.split('/')
        );

        fs.mkdirSync(path.dirname(correctionDestination), {
            recursive: true,
        });

        fs.copyFileSync(
            path.join(repo, ...successorCorrection.split('/')),
            correctionDestination
        );

        for (const rel of plan.intentionalLocaleRemovals) {
            fs.rmSync(path.join(target, ...rel.split('/')));
        }

        const result = verifyCandidate(production, preview, target, policy);

        const manifestPath = path.join(
            path.dirname(target),
            'jg-production-derived-manifest.json'
        );

        assert(!fs.existsSync(manifestPath), 'Release manifest exists');

        fs.writeFileSync(
            manifestPath,
            JSON.stringify({ ...plan, ...result }, null, 2) + '\n'
        );

        console.log(JSON.stringify({
            ...result,
            manifestPath,
            manifestSha256: sha(fs.readFileSync(manifestPath)),
        }, null, 2));

        return;
    }

    console.log(JSON.stringify(
        verifyCandidate(production, preview, target, policy),
        null,
        2
    ));
}

try {
    main();
} catch (error) {
    console.error('STOP:', error.stack);
    process.exitCode = 1;
}
