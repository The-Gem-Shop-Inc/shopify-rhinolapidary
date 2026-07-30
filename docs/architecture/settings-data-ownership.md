# `settings_data.json` Ownership and Safety

## Purpose

`config/settings_data.json` stores theme-editor state. It can contain legitimate storefront configuration, app embed state, colors, typography, cart settings, and section settings.

It should be treated as a high-risk file.

## Rules

* Do not commit accidental theme-editor changes.
* Review every `settings_data.json` diff before merge.
* Do not overwrite production settings blindly.
* App embed changes require app/register review.
* Cart type changes require cart config validation.
* Color/type changes require design token or release note review.
* Custom Liquid changes require the theme-editor code register.
* Production rollback must account for settings changes separately from Liquid/CSS/JS code.

## Required checks

Run:

```powershell
npm run validate:settings-data
```

before merging a change that touches `config/settings_data.json`.

## Review requirement

Any PR changing `config/settings_data.json` must explain:

* What admin/theme-editor setting changed
* Why it changed
* Whether the change is required for launch
* Whether app embeds changed
* Whether cart type changed
* Whether Custom Liquid changed
* Rollback notes
