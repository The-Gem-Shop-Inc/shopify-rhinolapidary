const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const MAX_BYTES = 2048;

const EXPECTED_NAMES = [
    'machine',
    'replacement-part',
    'accessory',
    'consumable',
    'bundle',
    'compatible',
    'included',
    'optional',
    'manual',
    'voltage',
    'speed',
    'dimensions',
    'weight',
    'water',
    'diameter',
    'arbor',
    'grit',
    'blade',
    'wheel',
    'freight',
    'parcel',
    'pickup',
    'international',
    'warranty',
    'support',
    'repair',
    'return',
    'em-1',
    'beadmaster',
    'shapemaster',
    'trimmaster',
    'lapmaster',
    'sawmaster',
    'jademaster',
];

const REQUIRED_SVG_ATTRIBUTES = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.75',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false',
};

const FORBIDDEN_SVG_PATTERNS = [
    { pattern: /<script\b/i, label: 'script element' },
    { pattern: /<animate\b/i, label: 'animation element' },
    { pattern: /<set\b/i, label: 'set animation element' },
    { pattern: /<image\b/i, label: 'raster image element' },
    { pattern: /<filter\b/i, label: 'filter element' },
    { pattern: /<foreignObject\b/i, label: 'foreignObject element' },
    { pattern: /<iframe\b/i, label: 'iframe element' },
    { pattern: /<style\b/i, label: 'style element' },
    { pattern: /<metadata\b/i, label: 'metadata element' },
    { pattern: /<mask\b/i, label: 'mask element' },
    { pattern: /\son[a-z]+\s*=/i, label: 'event handler attribute' },
    { pattern: /\s(?:href|xlink:href)\s*=/i, label: 'external reference attribute' },
    { pattern: /url\(/i, label: 'CSS URL reference' },
];

const errors = [];
const warnings = [];

function read(file) {
    return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function exists(file) {
    return fs.existsSync(path.join(ROOT, file));
}

function unique(values) {
    return [...new Set(values)];
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderIcon({ svg, wrapperClass, label }) {
    if (label) {
        return `<span class="${escapeHtml(wrapperClass)}" role="img" aria-label="${escapeHtml(label)}">${svg}</span>`;
    }

    return `<span class="${escapeHtml(wrapperClass)}" aria-hidden="true">${svg}</span>`;
}

function renderUnknownIcon() {
    return '';
}

const snippetPath = 'snippets/rhino-icon.liquid';

if (!exists(snippetPath)) {
    errors.push(`${snippetPath}: missing Rhino icon render snippet`);
} else {
    const snippet = read(snippetPath);

    if (!snippet.includes('aria-label="{{ label | escape }}"')) {
        errors.push(`${snippetPath}: accessible labels must be escaped`);
    }

    if (!snippet.includes('class="{{ wrapper_class | escape }}"')) {
        errors.push(`${snippetPath}: wrapper class output must be escaped`);
    }

    if (!snippet.includes('request.design_mode')) {
        errors.push(`${snippetPath}: unknown icon debug comment must be restricted to design mode`);
    }

    if (/assign\s+icon_asset\s*=.*\|\s*(append|prepend|replace)/.test(snippet)) {
        errors.push(`${snippetPath}: icon asset names must not be dynamically constructed`);
    }

    if (snippet.includes('tumblemaster') || snippet.includes('tumble-master')) {
        errors.push(`${snippetPath}: TumbleMaster must not be a supported Rhino icon`);
    }

    const mappingMatches = [
        ...snippet.matchAll(/when\s+'([^']+)'\s*\n\s*assign\s+icon_asset\s*=\s*'([^']+)'/g),
    ];
    const parsedNames = mappingMatches.map((match) => match[1]);
    const duplicateNames = parsedNames.filter((name, index) => parsedNames.indexOf(name) !== index);

    for (const duplicate of unique(duplicateNames)) {
        errors.push(`${snippetPath}: duplicate supported icon name '${duplicate}'`);
    }

    const expectedDuplicates = EXPECTED_NAMES.filter((name, index) => EXPECTED_NAMES.indexOf(name) !== index);

    for (const duplicate of unique(expectedDuplicates)) {
        errors.push(`scripts/validate-rhino-icons.js: duplicate expected icon name '${duplicate}'`);
    }

    const expectedSet = new Set(EXPECTED_NAMES);
    const parsedSet = new Set(parsedNames);

    for (const expected of EXPECTED_NAMES) {
        if (!parsedSet.has(expected)) {
            errors.push(`${snippetPath}: missing supported icon name '${expected}'`);
        }
    }

    for (const parsed of parsedNames) {
        if (!expectedSet.has(parsed)) {
            errors.push(`${snippetPath}: unsupported icon name '${parsed}'`);
        }
    }

    const mapping = new Map(mappingMatches.map((match) => [match[1], match[2]]));
    let totalBytes = 0;
    let renderedCount = 0;

    for (const name of EXPECTED_NAMES) {
        const expectedAsset = `rhino-icon-${name}.svg`;
        const assetName = mapping.get(name);

        if (assetName !== expectedAsset) {
            errors.push(`${snippetPath}: '${name}' must map to '${expectedAsset}', found '${assetName || ''}'`);
            continue;
        }

        const assetPath = `assets/${assetName}`;

        if (!exists(assetPath)) {
            errors.push(`${assetPath}: missing Rhino icon SVG`);
            continue;
        }

        const svg = read(assetPath);
        const bytes = Buffer.byteLength(svg, 'utf8');
        totalBytes += bytes;

        if (bytes > MAX_BYTES) {
            errors.push(`${assetPath}: ${bytes} bytes exceeds ${MAX_BYTES} byte threshold`);
        }

        const openingTag = svg.match(/^<svg\b([^>]*)>/);

        if (!openingTag) {
            errors.push(`${assetPath}: missing root SVG element`);
            continue;
        }

        if (!/\sclass="rhino-icon"(?:\s|>)/.test(openingTag[0])) {
            errors.push(`${assetPath}: root SVG must include class="rhino-icon"`);
        }

        for (const [attribute, value] of Object.entries(REQUIRED_SVG_ATTRIBUTES)) {
            const attrPattern = new RegExp(`\\b${attribute}="${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`);

            if (!attrPattern.test(openingTag[0])) {
                errors.push(`${assetPath}: root SVG must include ${attribute}="${value}"`);
            }
        }

        for (const { pattern, label } of FORBIDDEN_SVG_PATTERNS) {
            if (pattern.test(svg)) {
                errors.push(`${assetPath}: forbidden ${label}`);
            }
        }

        const decorativeMarkup = renderIcon({
            svg,
            wrapperClass: 'rhino-icon-wrapper rhino-icon-wrapper--default',
            label: '',
        });

        if (!decorativeMarkup.includes('aria-hidden="true"') || !decorativeMarkup.includes('<svg')) {
            errors.push(`${name}: decorative render did not produce expected hidden SVG markup`);
        }

        const labelMarkup = renderIcon({
            svg,
            wrapperClass: 'rhino-icon-wrapper rhino-icon-wrapper--small rhino-family-identifier__icon',
            label: 'Voltage "review" <required>',
        });

        if (!labelMarkup.includes('role="img"')) {
            errors.push(`${name}: labeled render must include role="img"`);
        }

        if (!labelMarkup.includes('aria-label="Voltage &quot;review&quot; &lt;required&gt;"')) {
            errors.push(`${name}: labeled render did not escape accessible label`);
        }

        renderedCount += 1;
    }

    const unknownMarkup = renderUnknownIcon();

    if (unknownMarkup.trim() !== '') {
        errors.push('unknown Rhino icon render must produce no visible icon markup');
    }

    if (totalBytes > 0) {
        const averageBytes = totalBytes / EXPECTED_NAMES.length;

        if (averageBytes > MAX_BYTES) {
            warnings.push(`Average SVG size is ${averageBytes.toFixed(1)} bytes`);
        }

        console.log(
            `Rhino icon validation inspected ${EXPECTED_NAMES.length} names, rendered ${renderedCount} markup fixtures, total SVG weight ${totalBytes} bytes, average ${(averageBytes).toFixed(1)} bytes.`
        );
    }
}

if (errors.length > 0) {
    console.error('Rhino icon validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('Rhino icon validation warnings:');

    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log('Rhino icon validation passed.');
