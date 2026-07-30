const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const desired = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/search-discovery-desired-state.json'), 'utf8')
);

const filterSpec = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/collection-filter-spec.json'), 'utf8')
);

const knownFilterIds = new Set(filterSpec.filters.map((filter) => filter.id));
const launchRequiredFilters = new Set(
    filterSpec.filters
        .filter((filter) => filter.requiredForLaunch)
        .map((filter) => filter.id)
);

const enabledFilterIds = new Set(
    desired.filters
        .filter((filter) => filter.enabled)
        .map((filter) => filter.filterId)
);

const errors = [];

for (const filter of desired.filters) {
    if (!knownFilterIds.has(filter.filterId)) {
        errors.push(`Desired Search & Discovery filter "${filter.filterId}" is not in data/collection-filter-spec.json`);
    }
}

for (const requiredFilter of launchRequiredFilters) {
    if (!enabledFilterIds.has(requiredFilter)) {
        errors.push(`Launch-required filter "${requiredFilter}" is not enabled in desired Search & Discovery state`);
    }
}

for (const synonym of desired.synonyms) {
    const uniqueTerms = new Set(synonym.terms.map((term) => term.ToLowerCase()));
    if (uniqueTerms.size !== synonym.terms.length) {
        errors.push(`Synonym group has duplicate terms: ${synonym.terms.join(', ')}`);
    }
}

if (errors.length > 0) {
    console.error('Search and Discovery desired-state validation failed.');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log('Search and Discovery desired-state validation passed.');