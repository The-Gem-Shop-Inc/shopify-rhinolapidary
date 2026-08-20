'use strict';

const assert = require('node:assert/strict');
const {
    readRegister,
    validateBrandClaims,
    validateSourceText,
} = require('./validate-brand-claims');

const register = readRegister();

const validResult = validateBrandClaims();
assert.deepEqual(
    validResult.violations,
    [],
    `current claim sources should pass:\n${validResult.violations.join('\n')}`,
);

const neutralFooter = validateSourceText(
    'synthetic-footer-valid.liquid',
    '<footer><a href="/pages/contact">Contact</a><a href="/policies/privacy-policy">Privacy policy</a></footer>',
    register,
);
assert.deepEqual(
    neutralFooter,
    [],
    `neutral footer content should pass:\n${neutralFooter.join('\n')}`,
);

const invalidFooter = validateSourceText(
    'synthetic-footer-invalid.liquid',
    '<footer>Financing available with lifetime support and free shipping.</footer>',
    register,
);
assert(
    invalidFooter.some((violation) => /CLAIM-016|CLAIM-012/.test(violation)),
    `unsupported footer claims should fail:\n${invalidFooter.join('\n')}`,
);

console.log('Brand claims validator regression tests passed.');
