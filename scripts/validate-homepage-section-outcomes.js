'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');
const REGISTER_PATH = path.join(ROOT, 'data', 'homepage-section-outcomes.json');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'homepage-section-outcomes.schema.json');
const NAVIGATION_PATH = path.join(ROOT, 'data', 'navigation-spec.json');
const CLAIMS_PATH = path.join(ROOT, 'data', 'legal-claims-register.json');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateHomepageSectionOutcomes(options = {}) {
    const register = options.register || readJson(REGISTER_PATH);
    const schema = options.schema || readJson(SCHEMA_PATH);
    const navigation = options.navigation || readJson(NAVIGATION_PATH);
    const claims = options.claims || readJson(CLAIMS_PATH);
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const errors = [];

    if (!validate(register)) {
        for (const error of validate.errors || []) {
            errors.push(`schema${error.instancePath}: ${error.message}`);
        }
    }

    const ids = new Set();
    const routeIds = new Set((navigation.routes || []).map((route) => route.id));
    const routesById = new Map((navigation.routes || []).map((route) => [route.id, route]));
    const claimStatuses = new Map(
        (claims.claims || []).map((claim) => [claim.id, claim.status]),
    );
    const contentItemIds = new Set();

    try {
        const contentMap = options.contentMap
            || readJson(path.join(ROOT, 'data', 'homepage-content-claims-map.json'));

        for (const item of contentMap.contentItems || []) {
            contentItemIds.add(item.id);
        }
    } catch {
        // Batch 1 created the content map. Tests can still inject a minimal map.
    }

    for (const module of register.modules || []) {
        if (ids.has(module.id)) {
            errors.push(`Duplicate homepage module id: ${module.id}`);
        }

        ids.add(module.id);

        if (
            ['approved', 'observed'].includes(module.status)
            && !module.customerOutcome.trim()
        ) {
            errors.push(`${module.id}: customer-facing or approved modules require a customer outcome.`);
        }

        if (module.status === 'approved') {
            if (!module.contentOwner.trim()) {
                errors.push(`${module.id}: approved modules require a content owner.`);
            }

            if (!module.sourceReferences.length) {
                errors.push(`${module.id}: approved modules require source references.`);
            }
        }

        if (module.linksRequired && !module.routeTargetReferences.length) {
            errors.push(`${module.id}: linked modules require at least one governed route reference.`);
        }

        for (const routeReference of module.routeTargetReferences || []) {
            if (!routeIds.has(routeReference.routeId)) {
                errors.push(`${module.id}: unknown route target ${routeReference.routeId}.`);
            }
        }

        const actions = module.actions || [];
        const actionIds = new Set();
        const sourceOrders = new Set();
        const primaryByGroup = new Map();
        const actionGroups = new Map();

        for (const action of actions) {
            if (actionIds.has(action.id)) {
                errors.push(`${module.id}: duplicate action id ${action.id}.`);
            }

            actionIds.add(action.id);

            if (sourceOrders.has(action.sourceOrder)) {
                errors.push(`${module.id}: duplicate action sourceOrder ${action.sourceOrder}.`);
            }

            sourceOrders.add(action.sourceOrder);

            if (!action.label.trim()) {
                errors.push(`${module.id}/${action.id}: action label cannot be empty.`);
            }

            if (!action.accessibleLabel.trim()) {
                errors.push(`${module.id}/${action.id}: action accessibleLabel cannot be empty.`);
            }

            if (!routeIds.has(action.routeId)) {
                errors.push(`${module.id}/${action.id}: unknown action route ${action.routeId}.`);
            }

            const route = routesById.get(action.routeId);
            const activeRenderState = ['current_rendered', 'implemented'].includes(action.renderState);
            const activeApprovalState = action.approvalStatus === 'approved';

            if (
                (activeRenderState || activeApprovalState)
                && ['blocked', 'draft'].includes(route?.approvalStatus)
            ) {
                errors.push(
                    `${module.id}/${action.id}: active customer-facing action cannot target ${route.approvalStatus} route ${action.routeId}.`,
                );
            }

            if ((activeRenderState || activeApprovalState) && !route?.path) {
                errors.push(
                    `${module.id}/${action.id}: active customer-facing action requires route ${action.routeId} to have a path.`,
                );
            }

            const genericLabel = /^(?:learn more|more|read more|click here|details|shop|view)$/i
                .test(action.label.trim());

            if (
                genericLabel
                && !action.labelContext?.trim()
            ) {
                errors.push(
                    `${module.id}/${action.id}: generic homepage action label requires destination context.`,
                );
            }

            const groupActions = actionGroups.get(action.actionGroup) || [];
            groupActions.push(action);
            actionGroups.set(action.actionGroup, groupActions);

            if (action.role === 'primary_commerce') {
                const currentPrimary = primaryByGroup.get(action.actionGroup) || [];
                currentPrimary.push(action);
                primaryByGroup.set(action.actionGroup, currentPrimary);
            }

            if (
                action.classification === 'support'
                && action.visualPriority === 'primary'
                && !['support_reassurance', 'inquiry'].includes(module.role)
            ) {
                errors.push(
                    `${module.id}/${action.id}: support actions cannot visually outrank commerce outside support-specific modules.`,
                );
            }
        }

        for (const [group, primaryActions] of primaryByGroup.entries()) {
            if (primaryActions.length > 1) {
                errors.push(
                    `${module.id}: action group ${group} has ${primaryActions.length} primary commerce actions.`,
                );
            }
        }

        const visualRank = {
            primary: 1,
            secondary: 2,
            tertiary: 3,
        };

        for (const [group, groupActions] of actionGroups.entries()) {
            const commerceRank = Math.min(
                ...groupActions
                    .filter((action) => action.classification === 'commerce')
                    .map((action) => visualRank[action.visualPriority]),
            );
            const supportRank = Math.min(
                ...groupActions
                    .filter((action) => action.classification === 'support')
                    .map((action) => visualRank[action.visualPriority]),
            );

            if (
                Number.isFinite(commerceRank)
                && Number.isFinite(supportRank)
                && supportRank < commerceRank
                && !['support_reassurance', 'inquiry'].includes(module.role)
            ) {
                errors.push(
                    `${module.id}: support action group ${group} visually outranks commerce action.`,
                );
            }
        }

        if (module.implementationState === 'implemented') {
            const activeActions = actions.filter((action) =>
                action.renderState === 'implemented'
                || action.approvalStatus === 'approved'
            );

            if (module.linksRequired && activeActions.length === 0) {
                errors.push(`${module.id}: implemented linked module requires at least one active governed action.`);
            }

            if (module.runtimeSelector && !module.runtimeSelector.trim()) {
                errors.push(`${module.id}: implemented module runtimeSelector cannot be empty.`);
            }
        }

        for (const claimReference of module.claimReferences || []) {
            const actualStatus = claimStatuses.get(claimReference.claimId);

            if (!actualStatus) {
                errors.push(`${module.id}: unknown claim reference ${claimReference.claimId}.`);
                continue;
            }

            const claimIsApproved = ['approved', 'approved_plain_use'].includes(actualStatus);
            const referenceIsApproved = ['approved', 'approved_plain_use', 'not_applicable']
                .includes(claimReference.approvalState);

            if (module.status === 'approved' && claimReference.required && !claimIsApproved) {
                errors.push(
                    `${module.id}: approved module references unresolved required claim ${claimReference.claimId}.`,
                );
            }

            if (module.status === 'approved' && claimReference.required && !referenceIsApproved) {
                errors.push(
                    `${module.id}: approved module marks required claim ${claimReference.claimId} as ${claimReference.approvalState}.`,
                );
            }
        }

        for (const field of [
            'emptyStateBehavior',
            'accessibilityExpectation',
            'performanceConsideration',
            'successMeasure',
        ]) {
            if (!module[field] || !module[field].trim()) {
                errors.push(`${module.id}: ${field} is required.`);
            }
        }

        if (module.status === 'blocked' && !module.blockerReason?.trim()) {
            errors.push(`${module.id}: blocked modules require blockerReason.`);
        }

        if (module.heroContentContract) {
            if (module.heroContentContract.stableModuleId !== module.id) {
                errors.push(`${module.id}: heroContentContract.stableModuleId must match module id.`);
            }

            for (const contentItemId of module.heroContentContract.safeNeutralDraftContentItemIds || []) {
                if (contentItemIds.size > 0 && !contentItemIds.has(contentItemId)) {
                    errors.push(`${module.id}: hero safe neutral draft content item ${contentItemId} is unknown.`);
                }
            }

            if (
                module.implementationState === 'implemented'
                && module.heroContentContract.copyApprovalState !== 'approved'
            ) {
                errors.push(`${module.id}: implemented hero requires approved hero copy.`);
            }

            if (
                module.implementationState === 'implemented'
                && module.heroContentContract.mediaSourceState === 'blocked'
            ) {
                errors.push(`${module.id}: implemented hero cannot use blocked media source state.`);
            }
        }
    }

    return {
        errors,
        moduleCount: (register.modules || []).length,
    };
}

function main() {
    const result = validateHomepageSectionOutcomes();

    if (result.errors.length > 0) {
        console.error('Homepage section outcome validation failed.');

        for (const error of result.errors) {
            console.error(`- ${error}`);
        }

        process.exit(1);
    }

    console.log(`Homepage section outcome validation passed for ${result.moduleCount} modules.`);
}

if (require.main === module) {
    main();
}

module.exports = {
    validateHomepageSectionOutcomes,
};
