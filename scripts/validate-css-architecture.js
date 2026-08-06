const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const errors = [];
const warnings = [];

function exists(file) {
    return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
    return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function stripRhinoRootTokenBlocks(source) {
    return source.replace(
        /:root\s*\{[\s\S]*?\}/gi,
        '',
    );
}

if (!exists('assets/rhino-custom.css')) {
    errors.push('Missing assets/rhino-custom.css');
}

if (exists('layout/theme.liquid')) {
    const themeLiquid = read('layout/theme.liquid');

    if (!themeLiquid.includes('rhino-custom.css')) {
        errors.push('layout/theme.liquid must include rhino-custom.css');
    }
}

if (exists('assets/rhino-custom.css')) {
    const css = read('assets/rhino-custom.css');

    if (!css.includes('--rhino-')) {
        warnings.push('assets/rhino-custom.css does not define or use any --rhino-* token yet.');
    }

    const rhinoComponentCss = stripRhinoRootTokenBlocks(
        css,
    );

    const hexColorMatches = [
        ...rhinoComponentCss.matchAll(
            /#[0-9a-f]{3,8}\b/gi,
        ),
    ];

    if (hexColorMatches.length > 0) {
        warnings.push(
            `Prefer design tokens over hardcoded hex colors in Rhino CSS. Found ${[...new Set(hexColorMatches)].join(', ')}`
        );
    }
}

if (errors.length > 0) {
    console.error('CSS architecture validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('CSS architecture validation warnings:');

    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log('CSS architecture validation passed.');