# Theme Settings Data Policy

**Owner:** Rhino Lapidary software engineering  
**Last reviewed:** 2026-07-02

## Scope

This policy applies to:

- `config/settings_data.json`
- Theme-editor changes
- JSON template changes produced by the theme editor
- App blocks recorded in theme configuration
- Platform-controlled custom CSS and settings

## Source-of-truth policy

`config/settings_data.json` is version-controlled as a reviewed snapshot of the
intended Rhino Lapidary theme configuration.

It is not included in routine code-only theme pushes.

## Routine code changes

Routine pushes must ignore:

```text
config/settings_data.json
```

### Intentional settings changes

An intentional settings change must follow this process:

1. Make the change on the unpublished Rhino preview theme.
2. Verify the change visually in the preview theme.
3. Pull only config/settings_data.json from the preview theme.
4. Review the Git diff.
5. Commit the change separately or clearly identify it in the pull request.
6. Include screenshots or a preview link.
7. Push the settings file only as part of an approved settings deployment.

Suggested command:

```bash
shopify theme pull --environment preview \
--only "config/settings_data.json"
```