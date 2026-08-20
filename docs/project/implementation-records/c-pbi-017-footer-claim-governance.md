# C-PBI-017 Implementation Record

## Status

Complete.

## Summary

- Added `CLAIM-016` to `data/legal-claims-register.json` for footer-global
  commercial and service promises.
- Refactored `scripts/validate-brand-claims.js` to scan governed footer source
  registers in addition to customer-facing theme files.
- Added `scripts/test-brand-claims-validator.js` to prove neutral footer content
  passes and unsupported footer promises fail.

## Acceptance

- Footer claim rules exist and link to the legal claims register.
- Claims validation covers footer group JSON, footer Liquid through existing
  theme scanning, and governed source registers.
- Unsupported footer claims fail automated validation.

## Evidence

- `data/legal-claims-register.json`
- `scripts/validate-brand-claims.js`
- `scripts/test-brand-claims-validator.js`
- `test-results/epic-c/batch-4/footer-claims-validation.json`

## Validation

- `npm run validate:brand-claims`: passed.
- `npm run test:brand-claims-validator`: passed.
