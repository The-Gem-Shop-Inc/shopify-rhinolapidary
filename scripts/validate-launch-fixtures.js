const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const ownership = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/launch-fixture-ownership.json'), 'utf8')
);

const storefrontFixtures = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'tests/fixtures/storefront-fixtures.json'), 'utf8')
);

const errors = [];
const storefrontFixtureIds = new Set(Object.keys(storefrontFixtures.fixtures || {}));

for (const fixture of ownership.fixtures) {
    if (!storefrontFixtureIds.has(fixture.fixtureId)) {
        errors.push(`Fixture ownership references missing storefront fixture: ${fixture.fixtureId}`);
        continue;
    }

    const storefrontFixture = storefrontFixtures.fixtures[fixture.fixtureId];

    if (storefrontFixture.path !== fixture.path) {
        errors.push(
            `${fixture.fixtureId}: ownership path "${fixture.path}" does not match storefront fixture path "${storefrontFixture.path}"`
        );
    }

    if (fixture.requiredForLaunch && fixture.path.includes('TODO')) {
        errors.push(`${fixture.fixtureId}: launch-required fixture cannot use TODO path`);
    }

    if (fixture.requiredForLaunch && fixture.validatedBy.length === 0) {
        errors.push(`${fixture.fixtureId}: launch-required fixture must have at least one validator`);
    }
}

for (const fixtureId of storefrontFixtureIds) {
    const listed = ownership.fixtures.some((fixture) => fixture.fixtureId === fixtureId);

    if (!listed && storefrontFixtures.fixtures[fixtureId].required) {
        errors.push(`Required storefront fixture is missing ownership entry: ${fixtureId}`);
    }
}

if (errors.length > 0) {
    console.error('Launch fixture ownership validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

console.log(`Launch fixture ownership validation passed for ${ownership.fixtures.length} fixtures.`);
