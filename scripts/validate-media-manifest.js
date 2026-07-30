const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/media-manifest.json'), 'utf8'));

const errors = [];
const warnings = [];

for (const item of manifest.media) {
    const existsInRepo = fs.existsSync(path.join(ROOT, item.path));

    if (item.type === 'product-media' && item.path.startsWith('assets/')) {
        errors.push(`${item.path}: product-media should not live in theme assets`);
    }

    if (item.status === 'active' && item.source === 'unknown') {
        errors.push(`${item.path}: active media cannot have unknown source`);
    }

    if (item.status === 'active' && !existsInRepo && item.type === 'theme-ui') {
        errors.push(`${item.path}: active theme-ui media does not exist in repository`);
    }

    if (item.status === 'proposed' && !existsInRepo) {
        warnings.push(`${item.path}: proposed media file does not exist yet`);
    }
}

if (errors.length > 0) {
    console.error('Media manifest validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('Media manifest validation warnings:');

    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log(`Media manifest validation passed with ${manifest.media.length} entries.`);