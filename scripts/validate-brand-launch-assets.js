'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SPEC_PATH = path.join(
    ROOT,
    'data',
    'brand-launch-assets.json',
);

const FORMAT_ALIASES = {
    jpg: 'jpeg',
};

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function projectPath(relativePath) {
    return path.resolve(ROOT, relativePath);
}

function normalizeFormat(format) {
    const normalized = String(format || '').toLowerCase();
    return FORMAT_ALIASES[normalized] || normalized;
}

function inspectSvg(relativePath, options = {}) {
    const absolutePath = projectPath(relativePath);

    if (!fs.existsSync(absolutePath)) {
        return [`Missing SVG asset: ${relativePath}`];
    }

    const source = fs.readFileSync(absolutePath, 'utf8');
    const violations = [];

    if (!/<svg\b/i.test(source)) {
        violations.push(`${relativePath} is not an SVG document.`);
    }

    if (!/\bviewBox\s*=/i.test(source)) {
        violations.push(`${relativePath} has no viewBox.`);
    }

    const forbiddenPatterns = [
        [/<script\b/i, 'script'],
        [/\bon\w+\s*=/i, 'event handler'],
        [/<image\b/i, 'embedded raster image'],
        [/<foreignObject\b/i, 'foreignObject'],
        [/<filter\b/i, 'filter'],
        [/<animate(?:Transform|Motion)?\b/i, 'animation'],
        [/\b(?:href|xlink:href)\s*=\s*["']https?:/i, 'external reference'],
    ];

    for (const [pattern, label] of forbiddenPatterns) {
        if (pattern.test(source)) {
            violations.push(
                `${relativePath} contains a forbidden ${label}.`,
            );
        }
    }

    if (options.monochrome) {
        const colorValues = [
            ...source.matchAll(
                /\b(?:fill|stroke)\s*=\s*["']([^"']+)["']/gi,
            ),
        ]
            .map((match) => match[1].trim().toLowerCase())
            .filter((value) => (
                value !== 'none'
                && value !== 'black'
                && value !== '#000'
                && value !== '#000000'
            ));

        if (colorValues.length > 0) {
            violations.push(
                `${relativePath} must be monochrome black. Found: ${
                    [...new Set(colorValues)].join(', ')
                }`,
            );
        }
    }

    return violations;
}

async function main() {
    const spec = readJson(SPEC_PATH);
    const violations = [];

    if (spec.schemaVersion !== 1) {
        violations.push('schemaVersion must equal 1.');
    }

    for (const [sourceName, relativePath] of Object.entries(spec.sources)) {
        if (!fs.existsSync(projectPath(relativePath))) {
            violations.push(
                `Missing source "${sourceName}": ${relativePath}`,
            );
        }
    }

    violations.push(
        ...inspectSvg(spec.sources.markTile),
        ...inspectSvg(spec.sources.horizontalDarkLogo),
        ...inspectSvg(spec.sources.pinnedTab, {
            monochrome: true,
        }),
    );

    const seenIds = new Set();
    const seenPaths = new Set();

    for (const output of spec.outputs) {
        if (seenIds.has(output.id)) {
            violations.push(`Duplicate output ID: ${output.id}`);
        }

        if (seenPaths.has(output.path)) {
            violations.push(`Duplicate output path: ${output.path}`);
        }

        seenIds.add(output.id);
        seenPaths.add(output.path);

        const absolutePath = projectPath(output.path);

        if (!fs.existsSync(absolutePath)) {
            violations.push(`Missing generated asset: ${output.path}`);
            continue;
        }

        const stat = fs.statSync(absolutePath);
        const metadata = await sharp(absolutePath).metadata();

        if (metadata.width !== output.width) {
            violations.push(
                `${output.path} width is ${metadata.width}; expected ${output.width}.`,
            );
        }

        if (metadata.height !== output.height) {
            violations.push(
                `${output.path} height is ${metadata.height}; expected ${output.height}.`,
            );
        }

        if (
            normalizeFormat(metadata.format)
            !== normalizeFormat(output.format)
        ) {
            violations.push(
                `${output.path} format is ${metadata.format}; expected ${output.format}.`,
            );
        }

        if (stat.size > output.maxBytes) {
            violations.push(
                `${output.path} is ${stat.size} bytes; maximum is ${output.maxBytes}.`,
            );
        }
    }

    const themePath = projectPath('layout/theme.liquid');
    const snippetPath = projectPath(
        'snippets/rhino-browser-assets.liquid',
    );

    if (!fs.existsSync(snippetPath)) {
        violations.push(
            'Missing snippets/rhino-browser-assets.liquid.',
        );
    } else {
        const snippet = fs.readFileSync(snippetPath, 'utf8');

        for (const requiredText of [
            'rhino-apple-touch-icon.png',
            'rhino-pinned-tab.svg',
            'theme-color',
        ]) {
            if (!snippet.includes(requiredText)) {
                violations.push(
                    `rhino-browser-assets.liquid does not reference ${requiredText}.`,
                );
            }
        }
    }

    if (fs.existsSync(themePath)) {
        const theme = fs.readFileSync(themePath, 'utf8');

        if (!/render\s+['"]rhino-browser-assets['"]/.test(theme)) {
            violations.push(
                'layout/theme.liquid does not render rhino-browser-assets.',
            );
        }

        if (!/settings\.favicon/.test(theme)) {
            violations.push(
                'layout/theme.liquid no longer uses the native favicon setting.',
            );
        }

        if (
            /<meta\s+name=["']theme-color["']\s+content=["']\s*["']/i
                .test(theme)
        ) {
            violations.push(
                'layout/theme.liquid still contains an empty theme-color meta tag.',
            );
        }
    }

    if (violations.length > 0) {
        console.error(
            `Brand launch asset validation failed:\n- ${
                violations.join('\n- ')
            }`,
        );
        process.exitCode = 1;
        return;
    }

    console.log(
        `Brand launch assets valid: ${spec.outputs.length} generated outputs.`,
    );
}

main().catch((error) => {
    console.error(
        `Brand launch asset validation failed:\n${error.stack || error.message}`,
    );
    process.exitCode = 1;
});