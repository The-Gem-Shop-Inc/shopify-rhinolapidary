'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
    validateFooterSupportResources,
} = require('./validate-footer-support-resources');

const ROOT = path.resolve(__dirname, '..');
const register = JSON.parse(
    fs.readFileSync(
        path.join(ROOT, 'data', 'footer-support-resources.json'),
        'utf8',
    ),
);

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const validErrors = validateFooterSupportResources(register);
assert.deepEqual(validErrors, [], `valid register failed:\n${validErrors.join('\n')}`);

const unsafeManual = clone(register);
const manual = unsafeManual.resources.find((resource) => resource.id === 'manual-12-in-lapmaster');
assert(manual, 'Expected hidden manual regression fixture manual-12-in-lapmaster.');
manual.safeForGlobalNavigation = true;
manual.globalNavigationStatus = 'approved';
const unsafeManualErrors = validateFooterSupportResources(unsafeManual);
assert(
    unsafeManualErrors.some((error) => /has blockers|blocking approval status|technical approval/.test(error)),
    `unsafe manual should fail:\n${unsafeManualErrors.join('\n')}`,
);

const missingDestination = clone(register);
const contact = missingDestination.resources.find((resource) => resource.id === 'support-contact-current-page');
contact.intendedDestination = null;
const missingDestinationErrors = validateFooterSupportResources(missingDestination);
assert(
    missingDestinationErrors.some((error) => /requires a concrete destination/.test(error)),
    `safe contact without destination should fail:\n${missingDestinationErrors.join('\n')}`,
);

console.log('Footer support resource validator regression tests passed.');
