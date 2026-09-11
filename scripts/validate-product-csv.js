const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const rules = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/product-data-rules.json'), 'utf8'));

const csvPath = process.argv[2] || process.env.PRODUCT_CSV;

if (!csvPath) {
    console.error('Usage: node scripts/validate-product-csv.js path/to/products.csv');
    console.error('Or set PRODUCT_CSV=path/to/products.csv');
    process.exit(1);
}

const absoluteCsvPath = path.resolve(ROOT, csvPath);

if (!fs.existsSync(absoluteCsvPath)) {
    console.error(`Product CSV not found: ${absoluteCsvPath}`);
    process.exit(1);
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"' && inQuotes && next === '"') {
            value += '"';
            i += 1;
            continue;
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (char === ',' && !inQuotes) {
            row.push(value);
            value = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && next === '\n') {
                i += 1;
            }

            row.push(value);
            if (row.some((cell) => cell.length > 0)) {
                rows.push(row);
            }
            row = [];
            value = '';
            continue;
        }

        value += char;
    }

    if (value.length || row.length) {
        row.push(value);
        rows.push(row);
    }

    return rows;
}

function normalize(value) {
    return String(value || '').trim();
}

function tags(value) {
    return normalize(value)
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
}

const rows = parseCsv(fs.readFileSync(absoluteCsvPath, 'utf8'));
const headers = rows[0] || [];
const missingHeaders = rules.requiredColumns.filter((header) => !headers.includes(header));

const errors = [];

if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
}

const records = rows.slice(1).map((cells, index) => {
    const record = { __line: index + 2 };
    headers.forEach((header, columnIndex) => {
        record[header] = cells[columnIndex] ?? '';
    });
    return record;
});

const productFirstRows = new Map();

for (const record of records) {
    const handle = normalize(record.Handle);
    if (handle && !productFirstRows.has(handle)) {
        productFirstRows.set(handle, record);
    }
}

for (const [handle, record] of productFirstRows.entries()) {
    const title = normalize(record.Title);
    const status = normalize(record.Status).toLowerCase();
    const published = normalize(record.Published).toUpperCase();
    const price = Number(normalize(record['Variant Price']));
    const imageSrc = normalize(record['Image Src']);
    const imageAlt = normalize(record['Image Alt Text']);
    const body = normalize(record['Body (HTML)']);

    if (!title) errors.push(`${handle}: missing Title`);
    if (rules.forbiddenTitleFragments.some((fragment) => title.includes(fragment))) {
        errors.push(`${handle}: title contains placeholder text`);
    }

    if (rules.forbiddenDescriptionFragments.some((fragment) => body.includes(fragment))) {
        errors.push(`${handle}: description contains placeholder text`);
    }

    if (status && !rules.allowedStatuses.includes(status)) {
        errors.push(`${handle}: invalid Status "${record.Status}"`);
    }

    if (rules.keyProductHandles.includes(handle) && !rules.launchRequiredStatuses.includes(status)) {
        errors.push(`${handle}: key launch product must be active, got "${record.Status}"`);
    }

    if (rules.keyProductHandles.includes(handle) && published !== 'TRUE') {
        errors.push(`${handle}: key launch product must be Published TRUE`);
    }

    if (!Number.isFinite(price) || price <= 0) {
        errors.push(`${handle}: Variant Price must be greater than 0`);
    }

    if (imageSrc && !imageAlt) {
        errors.push(`${handle}: Image Src present but Image Alt Text is missing`);
    }

}

if (Object.prototype.hasOwnProperty.call(rules, 'requiredTagsByProductClass')) {
    errors.push('product-data-rules.json: requiredTagsByProductClass is deprecated; use governed rhino.product_class mappings');
}

if (rules.legacyTagAuthority?.decisionState !== 'deprecated' || rules.legacyTagAuthority?.replacement !== 'rhino.product_class') {
    errors.push('product-data-rules.json: legacy tag authority disposition is missing or invalid');
}

for (const requiredHandle of rules.keyProductHandles) {
    if (!productFirstRows.has(requiredHandle)) {
        errors.push(`Missing key launch product handle: ${requiredHandle}`);
    }
}

if (errors.length > 0) {
    console.error('Product CSV validation failed:');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log(`Product CSV validation passed for ${productFirstRows.size} products.`);
