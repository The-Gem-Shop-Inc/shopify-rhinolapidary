require('dotenv').config();

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const fixtureFile = path.join(ROOT, 'tests/fixtures/storefront-fixtures.json');
const fixtureData = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));

const previewUrl = process.env[fixtureData.baseUrlEnv];

if (!previewUrl) {
    throw new Error(`${fixtureData.baseUrlEnv} must be set in .env`);
}

function storefrontUrl(routePath) {
    const base = new URL(previewUrl);
    const target = new URL(routePath, base.origin);

    for (const [key, value] of base.searchParams.entries()) {
        if (!target.searchParams.has(key)) {
            target.searchParams.set(key, value);
        }
    }

    return target.toString();
}

async function main() {
    let failed = false;

    for (const [name, fixture] of Object.entries(fixtureData.fixtures)) {
        if (!fixture.required) {
            console.log(`${name}: skipped optional fixture ${fixture.path}`);
            continue;
        }

        const url = storefrontUrl(fixture.path);
        const response = await fetch(url, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'RhinoLapidaryFixtureValidator/1.0',
            },
        });

        const text = await response.text();

        if (response.status >= 400) {
            console.error(`${name}: ${response.status} ${url}`);
            failed = true;
            continue;
        }

        if (!text.includes('<html') || !text.includes('</html>')) {
            console.error(`${name}: did not return storefront HTML: ${url}`);
            failed = true;
            continue;
        }

        if (text.includes('404 Not Found') || text.includes('local_rate_limited')) {
            console.error(`${name}: returned invalid preview body: ${url}`);
            failed = true;
            continue;
        }

        console.log(`${name}: ok ${response.status} ${fixture.path}`);
    }

    if (failed) {
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});