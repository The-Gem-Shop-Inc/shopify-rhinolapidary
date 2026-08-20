# C-PBI-003 Implementation Record

## PBI

```text
PBI ID: C-PBI-003
Title: Create a Machine-Readable Global Navigation IA Register
Epic: C - Global Header, Navigation, and Footer
Type: Data contract / validation
Owner: Product Owner, Shopify Admin, and Frontend Engineering
Date completed: 2026-08-06
```

## Summary

- Created the global navigation IA register.
- Added schema and direct validator enforcement.
- Added validator regression coverage for valid and deliberately invalid fixtures.
- Wired the IA register into aggregate JSON register validation.

## Repository Evidence

- `data/global-navigation-ia.json`
- `schemas/global-navigation-ia.schema.json`
- `scripts/validate-global-navigation-ia.js`
- `scripts/test-global-navigation-ia-validator.js`
- `scripts/validate-json-registers.js`
- `package.json`

## Validation Evidence

Commands:

```powershell
npm run validate:global-navigation-ia
npm run test:global-navigation-ia-validator
npm run validate:registers
```

Observed Batch 1 result:

```text
Global navigation IA validation passed for 4 menus, 21 items, and 12 unresolved dependencies.
Global navigation IA validator regression tests passed.
npm run validate:registers: passed
```

## Shopify Admin Evidence

No Shopify Admin change was made.

## Risks and Follow-Ups

- IA status remains `draft` because future C-PBI-010/C-PBI-011 work must approve and configure final primary menu IA.
- C-PBI-025 must enforce the register, schema, and validator.
