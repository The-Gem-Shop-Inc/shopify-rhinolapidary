const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = process.cwd();
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/navigation-spec.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas/navigation-spec.schema.json'), 'utf8'));
const outcomesPath = path.join(ROOT, 'data/homepage-section-outcomes.json');
const outcomes = fs.existsSync(outcomesPath)
    ? JSON.parse(fs.readFileSync(outcomesPath, 'utf8'))
    : { modules: [] };

const errors = [];
const ids = new Set();
const paths = new Set();
const homepageModuleIds = new Set((outcomes.modules || []).map((module) => module.id));
const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
});
const validate = ajv.compile(schema);

if (!validate(spec)) {
    for (const error of validate.errors || []) {
        errors.push(`schema${error.instancePath}: ${error.message}`);
    }
}

for (const route of spec.routes) {
    if (ids.has(route.id)) {
        errors.push(`Duplicate route id: ${route.id}`);
    }

    ids.add(route.id);

    if (route.path && !route.path.startsWith('/')) {
        errors.push(`${route.id}: path must start with "/"`);
    }

    if (route.requiredForLaunch && !route.path) {
        errors.push(`${route.id}: launch-required route must include a path`);
    }

    if (route.requiredForLaunch && route.path.includes('TODO')) {
        errors.push(`${route.id}: launch-required route contains TODO path`);
    }

    if (route.path && paths.has(route.path) && route.requiredForLaunch) {
        errors.push(`${route.id}: duplicate launch-required path ${route.path}`);
    }

    if (route.path) {
        paths.add(route.path);
    }

    if (route.approvalStatus === 'blocked') {
        if (route.path) {
            errors.push(`${route.id}: blocked homepage route must not render or reserve a path`);
        }

        if (route.requiredForLaunch) {
            errors.push(`${route.id}: blocked route cannot be required for launch`);
        }

        if (!route.blocker || route.blocker.trim() === '') {
            errors.push(`${route.id}: blocked route requires a blocker`);
        }
    }

    for (const homepageReference of route.homepageReferences || []) {
        if (!homepageModuleIds.has(homepageReference.moduleId)) {
            errors.push(`${route.id}: unknown homepage module ${homepageReference.moduleId}`);
        }

        if (homepageReference.currentRendered && route.approvalStatus !== 'approved') {
            errors.push(`${route.id}: currently rendered homepage links must have approved route status`);
        }

        if (homepageReference.currentRendered && !route.path) {
            errors.push(`${route.id}: currently rendered homepage links require a path`);
        }
    }
}

for (const requiredId of ['home', 'cart']) {
    if (!ids.has(requiredId)) {
        errors.push(`Missing required navigation route: ${requiredId}`);
    }
}

for (const requiredHomepageRouteId of ['machines', 'contact']) {
    const route = spec.routes.find((item) => item.id === requiredHomepageRouteId);

    if (!route?.homepageReferences?.some((reference) => reference.currentRendered)) {
        errors.push(`Missing current homepage CTA route coverage: ${requiredHomepageRouteId}`);
    }
}

const renderedCustomerPathRoutes = spec.routes.filter((route) =>
    (route.homepageReferences || []).some((reference) =>
        reference.moduleId === 'homepage-customer-path-chooser'
        && reference.currentRendered
    )
);

if (renderedCustomerPathRoutes.length > 0) {
    if (renderedCustomerPathRoutes.length < 3 || renderedCustomerPathRoutes.length > 5) {
        errors.push(
            `homepage-customer-path-chooser must render 3-5 governed routes; found ${renderedCustomerPathRoutes.length}`,
        );
    }

    const chooserPaths = new Set();

    for (const route of renderedCustomerPathRoutes) {
        if (route.approvalStatus !== 'approved') {
            errors.push(`${route.id}: rendered customer-path route must be approved`);
        }

        if (!route.path) {
            errors.push(`${route.id}: rendered customer-path route requires a real path`);
            continue;
        }

        if (chooserPaths.has(route.path)) {
            errors.push(`${route.id}: duplicate customer-path destination ${route.path}`);
        }

        chooserPaths.add(route.path);
    }
}

if (errors.length > 0) {
    console.error('Navigation spec validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

console.log(
    `Navigation spec validation passed for ${spec.routes.length} routes; `
    + `${renderedCustomerPathRoutes.length} rendered customer-path route(s).`,
);