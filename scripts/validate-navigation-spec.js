const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/navigation-spec.json'), 'utf8'));

const errors = [];
const ids = new Set();
const paths = new Set();

for (const route of spec.routes) {
    if (ids.has(route.id)) {
        errors.push(`Duplicate route id: ${route.id}`);
    }

    ids.add(route.id);

    if (!route.path.startsWith('/')) {
        errors.push(`${route.id}: path must start with "/"`);
    }

    if (route.requiredForLaunch && route.path.includes('TODO')) {
        errors.push(`${route.id}: launch-required route contains TODO path`);
    }

    if (paths.has(route.path) && route.requiredForLaunch) {
        errors.push(`${route.id}: duplicate launch-required path ${route.path}`);
    }

    paths.add(route.path);
}

for (const requiredId of ['home', 'cart']) {
    if (!ids.has(requiredId)) {
        errors.push(`Missing required navigation route: ${requiredId}`);
    }
}

if (errors.length > 0) {
    console.error('Navigation spec validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

console.log(`Navigation spec validation passed for ${spec.routes.length} routes.`);