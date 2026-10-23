'use strict';

const {
    assessFulfillment,
    readJson,
    validateContentClaims,
    validateContracts,
} = require('./lib/epic-k-policy');

function validateEpicKPolicy({ decisions, policy, evidence, scenarios } = {}) {
    decisions ||= readJson('data/epic-k-provisional-decisions.json');
    policy ||= readJson('data/epic-k-fulfillment-policy.json');
    evidence ||= readJson('data/epic-k-operational-evidence-requirements.json');
    scenarios ||= readJson('tests/fixtures/epic-k-policy-scenarios.json');
    const errors = validateContracts({ decisions, policy, evidence, scenarios });

    for (const scenario of scenarios.routingCases || []) {
        const actual = assessFulfillment(scenario, policy);
        if (actual.route !== scenario.expected.route) {
            errors.push(`${scenario.id}: expected route ${scenario.expected.route}, received ${actual.route}`);
        }
        if (actual.policyEligible !== scenario.expected.policyEligible) {
            errors.push(`${scenario.id}: expected policyEligible ${scenario.expected.policyEligible}, received ${actual.policyEligible}`);
        }
        if (actual.shopifyCheckoutEnforceable !== 'unverified') {
            errors.push(`${scenario.id}: offline assessment must leave Shopify checkout enforcement unverified`);
        }
    }

    errors.push(...validateContentClaims([
        {
            id: 'K-CONTENT-CONTRACT-CLAIMS',
            claimType: 'carrier_claims',
            text: 'Notify Rhino through the designated process and follow the applicable carrier instructions.',
            rhinoNotificationRequired: true,
            designatedContactProcess: 'operations-owned contact process required before publication',
            uninsuredRemediesEliminated: false,
        },
    ], policy));
    return { errors, decisions, policy, evidence, scenarios };
}

function main() {
    const result = validateEpicKPolicy();
    if (result.errors.length) {
        console.error('Epic K provisional policy validation failed.');
        for (const error of result.errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    console.log('Epic K provisional policy contracts: valid.');
    console.log(`Synthetic routing scenarios: ${result.scenarios.routingCases.length} passed.`);
    console.log(`Operational evidence: ${result.evidence.requirements.length} required categories remain MISSING_EXTERNAL_EVIDENCE.`);
    console.log('Live Shopify checkout enforcement and configuration compliance: UNVERIFIED.');
}

if (require.main === module) main();

module.exports = { validateEpicKPolicy };
