'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
    validateLocalizationMarketSafety,
} = require('./validate-localization-market-safety');

const ROOT = path.resolve(__dirname, '..');
const decision = JSON.parse(
    fs.readFileSync(
        path.join(ROOT, 'data', 'localization-market-decision.json'),
        'utf8',
    ),
);

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const validErrors = validateLocalizationMarketSafety(decision);
assert.deepEqual(validErrors, [], `valid decision failed:\n${validErrors.join('\n')}`);

const drift = clone(decision);
drift.themeSelectorSettings.footer.enableCountrySelector = true;
const driftErrors = validateLocalizationMarketSafety(drift);
assert(
    driftErrors.some((error) => /Footer country selector setting/.test(error)),
    `selector drift should fail:\n${driftErrors.join('\n')}`,
);

const wording = clone(decision);
wording.decision.visibleInternationalWordingApproved = false;
wording.decision.approvedInternationalWording = ['Ships worldwide'];
const wordingErrors = validateLocalizationMarketSafety(wording);
assert(
    wordingErrors.some((error) => /International wording cannot be listed|unapproved international/.test(error)),
    `unapproved wording should fail:\n${wordingErrors.join('\n')}`,
);

console.log('Localization market safety validator regression tests passed.');
