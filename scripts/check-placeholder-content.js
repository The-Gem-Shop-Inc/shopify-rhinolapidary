const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const SEARCH_ROOTS = [
    'templates',
    'sections',
    'snippets',
    'config',
    'locales',
];

const EXTENSIONS = new Set([
    '.json',
    '.liquid',
    '.js',
    '.css',
]);

const PLACEHOLDERS = [
    'Welcome industry insiders',
    'Grow your business with us',
    'Insert partner logo',
    'Add a customer testimonial',
    'Add educational content',
    'Product features',
    'Materials and care',
    'Merchandising tips',
    'Other industry favorites',
    'Share information about your brand',
    'Talk about your brand',
    'Image with text',
    'Pair text with an image',
];

const ALLOWLIST = [
    // Example:
    // {
    //      file: 'templates/index.json',
    //      phrase: 'Example phrase intentionally retained',
    //      reason: 'Used in a hidden draft-only section',
    // },
];

function normalizePath(filePath) {
    return filePath.split(path.sep).join('/');
}

function walk(directory) {
    if (!fs.existsSync(directory)) {
        return [];
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...walk(fullPath));
            continue;
        }

        if (EXTENSIONS.has(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }

    return files;
}

function isAllowed(file, phrase) {
    const normalized = normalizePath(path.relative(ROOT, file));

    return ALLOWLIST.some(
        (entry) => entry.file === normalized && entry.phrase === phrase
    );
}

const matches = [];

for (const root of SEARCH_ROOTS) {
    const absoluteRoot = path.join(ROOT, root);

    for (const file of walk(absoluteRoot)) {
        const content = fs.readFileSync(file, 'utf8');

        for (const phrase of PLACEHOLDERS) {
            if (content.includes(phrase) && !isAllowed(file, phrase)) {
                matches.push({
                    file: normalizePath(path.relative(ROOT, file)),
                    phrase,
                });
            }
        }
    }
}

if (matches.length > 0) {
    console.error('Placeholder content check failed.');
    console.error('');
    console.error('Replace stock Trade placeholder copy or add a documented allowlist entry.');
    console.error('');

    for (const match of matches) {
        console.error(`- ${match.file}: "${match.phrase}"`);
    }

    process.exit(1);
}

console.log('Placeholder content check passed.');
