# Rollback Drill Process

## Purpose

A production launch should not proceed unless rollback has been rehearsed or explicitly accepted as a risk.

## Rollback assumptions

Rollback may require:

* Re-publishing a previous Shopify theme
* Reverting Git changes
* Restoring `settings_data.json`
* Reverting app embed/admin changes manually
* Reverting Search and Discovery settings manually
* Reverting navigation/menu changes manually
* Reverting product publication/media changes manually

## Required rollback evidence

Before launch, record:

* Current production theme ID
* New candidate theme ID
* Backup theme ID
* Git commit SHA
* Owner
* Rollback steps
* Expected rollback duration
* Admin changes that require manual reversal
* Result of rollback drill or reason drill was skipped

## Drill steps

1. Identify current production theme.
2. Duplicate or record backup theme.
3. Push candidate theme to preview.
4. Verify preview.
5. Document production publish command or admin publish path.
6. Document rollback publish command or admin rollback path.
7. Confirm owner can execute rollback.
8. Record evidence.

## Rollback command examples

Preview push:

```powershell id="zujnf0"
shopify theme push --environment preview --strict
```

Production push, only if intentionally using CLI for production:

```powershell id="6s83dt"
shopify theme push --environment production --strict
```

Theme publish should generally be done deliberately through Shopify Admin unless the CLI environment is explicitly configured and verified.

## Launch blocker

Launch is blocked if:

* No rollback owner is assigned.
* No backup/current production theme ID is recorded.
* Launch-critical admin changes have no rollback instructions.
* A launch-blocking risk remains open.
