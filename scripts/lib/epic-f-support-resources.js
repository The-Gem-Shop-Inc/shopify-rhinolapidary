'use strict';

const Ajv = require('ajv/dist/2020');

const {
    classification,
    evaluateProjectionRecord
} = require('./epic-f-consumer');

const { safeText } = require('./epic-f-facts');
const { validateOwnerInputs } = require('./epic-e-batch-3c');
const validateOwnerPacket = new Ajv({ strict: false, allErrors: true }).compile(
    require('../../schemas/epic-e-batch-3c-owner-decisions.schema.json')
);

const validatePacket = new Ajv({
    strict: false,
    allErrors: true
}).compile(
    require('../../schemas/epic-f-support-resources.schema.json')
);

const validateProjection = new Ajv({
    strict: false,
    allErrors: true
}).compile(
    require('../../schemas/epic-f-support-resources-projection.schema.json')
);

function validTimeRange(start, end, asOf) {
    const startMs = Date.parse(start);
    const endMs = Date.parse(end);
    const nowMs = Date.parse(asOf);

    return (
        Number.isFinite(startMs) &&
        Number.isFinite(endMs) &&
        Number.isFinite(nowMs) &&
        startMs <= nowMs &&
        nowMs < endMs
    );
}

function safeRelativeRoute(value) {
    return (
        typeof value === 'string' &&
        /^\/[A-Za-z0-9/_-]+(?:\.[A-Za-z0-9]+)?$/.test(value) &&
        !value.includes('//')
    );
}

function routeDestination(destination, expectedIdentity, asOf, purpose = null) {
    if (!destination) return null;

    if (
        destination.environment !== 'local-fixture' ||
        destination.status !== 200 ||
        destination.requestedRoute !== destination.resolvedRoute ||
        destination.identity !== expectedIdentity ||
        (purpose !== null && destination.purpose !== purpose) ||
        !safeRelativeRoute(destination.requestedRoute) ||
        !validTimeRange(destination.observedAt, destination.expiresAt, asOf)
    ) {
        return null;
    }

    return destination.requestedRoute;
}

function roleEvidenceMatches(policy, role, entity) {
    if (!entity) return true;

    const rows = policy.roleEvidence.filter(
        evidence =>
            evidence.role === role &&
            evidence.entity === entity &&
            evidence.sourceIds.length > 0
    );

    return rows.length === 1;
}

function warrantyCoherent(record, asOf) {
    const {
        policy,
        class: warrantyClass,
        mapping
    } = record;

    if (
        mapping.productGid !== record.productGid ||
        mapping.classId !== warrantyClass.classId ||
        warrantyClass.policyId !== policy.policyId ||
        warrantyClass.policyRevision !== policy.revision
    ) {
        return false;
    }

    if (
        policy.lifecycle !== 'current' ||
        !Number.isFinite(Date.parse(policy.effectiveFrom)) ||
        Date.parse(policy.effectiveFrom) > Date.parse(asOf)
    ) {
        return false;
    }

    if (
        policy.effectiveTo !== null &&
        (
            !Number.isFinite(Date.parse(policy.effectiveTo)) ||
            Date.parse(asOf) >= Date.parse(policy.effectiveTo)
        )
    ) {
        return false;
    }

    const durationHasValue = warrantyClass.durationValue !== null;
    const durationHasUnit = warrantyClass.durationUnit !== null;

    if (durationHasValue !== durationHasUnit) {
        return false;
    }

    if (
        !safeText(policy.issuer) ||
        !safeText(policy.administrator) ||
        !safeText(policy.repairProvider) ||
        !safeText(warrantyClass.trigger)
    ) {
        return false;
    }

    if (record.marketedBrand !== null && !safeText(record.marketedBrand)) return false;

    if (
        record.manufacturer !== null &&
        !safeText(record.manufacturer)
    ) {
        return false;
    }

    const roles = [
        ['warrantyIssuer', policy.issuer],
        ['warrantyAdministrator', policy.administrator],
        ['repairProvider', policy.repairProvider]
    ];

    if (record.marketedBrand !== null) {
        roles.push(['marketedBrand', record.marketedBrand]);
    }

    if (record.manufacturer !== null) {
        roles.push(['manufacturer', record.manufacturer]);
    }

    if (
        !roles.every(([role, entity]) =>
            roleEvidenceMatches(policy, role, entity)
        )
    ) {
        return false;
    }

    if (
        !warrantyClass.exclusions.every(safeText) ||
        !mapping.exceptions.every(safeText)
    ) {
        return false;
    }

    return true;
}

// Policy, class and mapping approvals have distinct E subject/kind identities.
// This consumes the same owner input/context used by F5, not an F approval register.
function warrantyUpstreamEligible(context, record, asOf) {
    const input = context.operationalInput;
    const upstream = context.operationalContext;
    if (!input || !upstream || !validateOwnerPacket(input)) return false;
    try {
        if (validateOwnerInputs(input, upstream, asOf).length) return false;
    } catch {
        return false;
    }
    const policy = input.policyVersions.find(p => p.policyId === record.policy.policyId);
    const warrantyClass = input.warrantyClasses.find(c => c.classId === record.class.classId);
    const mapping = input.warrantyMappings.find(m => m.productGid === record.productGid);
    if (!policy || !warrantyClass || !mapping) return false;
    const same = (source, projected, keys) => keys.every(key => JSON.stringify(source[key]) === JSON.stringify(projected[key]));
    if (!same(policy, record.policy, ['policyId', 'revision', 'effectiveFrom', 'effectiveTo', 'lifecycle', 'sourceIds', 'sourceSha256', 'resourceId', 'nativePolicyGid', 'issuer', 'administrator', 'repairProvider', 'approvalDecisionId'])) return false;
    if (!same(warrantyClass, record.class, ['classId', 'policyId', 'policyRevision', 'trigger', 'exclusions', 'approvalDecisionId'])) return false;
    // Omission is not an assertion of unlimited/no-duration coverage. E's source
    // duration remains unchanged; only a supplied display duration must match it.
    if (record.class.durationValue !== null && !same(warrantyClass, record.class, ['durationValue', 'durationUnit'])) return false;
    if (!same(mapping, record.mapping, ['productGid', 'classId', 'exceptions', 'approvalDecisionId'])) return false;
    if (!record.policy.roleEvidence.every(e => e.sourceIds.every(id => upstream.evidenceIds.has(id)))) return false;
    return [['issuer', 'warrantyIssuer'], ['administrator', 'warrantyAdministrator'], ['repairProvider', 'repairProvider']].every(([key, role]) =>
        JSON.stringify(policy.roleEvidence[key]) === JSON.stringify(record.policy.roleEvidence.find(e => e.role === role)?.sourceIds)
    );
}

function resourceCoherent(record, page = { language: 'en', configurationId: null }) {
    if (
        record.resourceType === 'support' ||
        record.status !== 'current' ||
        record.visibility !== 'customer' ||
        record.canonical !== true ||
        record.ownerApproved !== true ||
        record.rightsApproved !== true ||
        record.publicationApproved !== true ||
        record.languageReviewed !== true ||
        record.versionReviewed !== true ||
        record.sourceRole !== 'customer_resource' ||
        record.language !== page.language ||
        !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(record.language) ||
        (record.configurationId !== null && record.configurationId !== page.configurationId) ||
        record.destination.fileIdentity !== record.fileIdentity ||
        !record.applicableProductGids.includes(record.productGid) ||
        !safeText(record.title) ||
        !safeText(record.language) ||
        !safeText(record.version)
    ) {
        return false;
    }

     if (record.resourceType === 'video') {
         if (
             !record.video ||
             record.video.productSurfaceApproved !== true ||
             record.video.autoplay !== false ||
             record.video.eagerProvider !== false ||
             record.video.captionsReviewed !== true ||
             record.video.transcriptReviewed !== true
         ) {
             return false;
         }

         if (
             record.video.posterIdentity !== null
         ) {
             return false;
         }
     } else if (record.video !== null) {
         return false;
     }

     return true;
}

function customerWarrantyDestination(context, record) {
    const target = context.operationalContext?.resources?.resources?.find(r => r.resourceId === record.policy.resourceId);
    // Evidence may authorize a structured fact without authorizing its File for customers.
    // Native generic legal policies are not warranty destinations in this adapter.
    return !!(target && target.visibility === 'customer' && target.publicationApproved === true &&
        target.rights === 'approved' && target.resourceType !== 'support' && target.sourceRole === 'customer_resource');
}

function projectSupportResources(
    context,
    packet,
    asOf = new Date().toISOString(),
    page = { language: 'en', configurationId: null }
) {
    const out = {
        fixture_only: context?.fixtureOnly === true,
        product_gid:
        /^gid:\/\/shopify\/Product\/[0-9]+$/.test(packet?.machineProductGid)
            ? packet.machineProductGid
            : null,
        warranty: [],
        resources: [],
        suppressed: []
    };

    const suppress = (reason, record = null) => {
        const item = { reason };

        if (record?.recordId) {
            item.recordId = record.recordId;
        }

        if (record?.resourceId) {
            item.resourceId = record.resourceId;
        }

        out.suppressed.push(item);
    };

    if (!validatePacket(packet)) {
        suppress('invalid_packet');
        if (!validateProjection(out)) {
            throw new Error(
                'Invalid F6 fallback projection: ' +
                JSON.stringify(validateProjection.errors)
            );
        }
        return out;
    }

    if (
        classification(context, packet.machineProductGid) !== 'machine' ||
        context.fixtureOnly !== true
    ) {
        suppress('no_approved_runtime_adapter');

        if (!validateProjection(out)) {
            throw new Error(
                'Invalid F6 runtime-suppressed projection: ' +
                JSON.stringify(validateProjection.errors)
            );
        }

        return out;
    }

    /*
     * Warranty/service projection
     */
    const warrantyRecordIds = new Map();
    const warrantyProductCounts = new Map();

    for (const record of packet.warranty) {
        warrantyProductCounts.set(record.productGid, (warrantyProductCounts.get(record.productGid) || 0) + 1);
        warrantyRecordIds.set(
            record.recordId,
            (warrantyRecordIds.get(record.recordId) || 0) + 1
        );
    }

    for (const record of packet.warranty) {
        if (warrantyRecordIds.get(record.recordId) !== 1 || warrantyProductCounts.get(record.productGid) !== 1) {
            suppress('duplicate_warranty_record', record);
            continue;
        }

        if (record.productGid !== packet.machineProductGid) {
            suppress('wrong_warranty_product', record);
            continue;
        }

        if (!evaluateProjectionRecord(context, record, asOf)) {
            suppress('warranty_authority_ineligible', record);
            continue;
        }

        if (!warrantyCoherent(record, asOf) || !warrantyUpstreamEligible(context, record, asOf)) {
            suppress('incoherent_warranty_mapping', record);
            continue;
        }

        const expectedDestinationIdentity =
            record.policy.resourceId ||
            record.policy.nativePolicyGid;

        let destination = null;

        if (record.destination !== null) {
            if (!expectedDestinationIdentity || !customerWarrantyDestination(context, record)) {
                suppress('warranty_destination_without_authority', record);
            } else {
                destination = routeDestination(
                    record.destination,
                    expectedDestinationIdentity,
                    asOf,
                    'warranty'
                );

                if (!destination) {
                    suppress('invalid_warranty_destination', record);
                }
            }
        }

        out.warranty.push({
            record_id: record.recordId,
            policy_id: record.policy.policyId,
            class_id: record.class.classId,
            policy_approval_decision_id: record.policy.approvalDecisionId,
            class_approval_decision_id: record.class.approvalDecisionId,
            mapping_approval_decision_id: record.mapping.approvalDecisionId,
            revision: record.policy.revision,
            roles: {
                marketed_brand: record.marketedBrand,
                manufacturer: record.manufacturer,
                issuer: record.policy.issuer,
                administrator: record.policy.administrator,
                repair_provider: record.policy.repairProvider
            },
            duration:
                record.class.durationValue === null
                    ? null
                    : {
                        value: record.class.durationValue,
                        unit: record.class.durationUnit
                    },
            trigger: record.class.trigger,
            exclusions: [...record.class.exclusions],
            exceptions: [...record.mapping.exceptions],
            destination,
            approval_decision_id: record.approvalDecisionId,
            source_ids: [...record.sourceIds]
        });
    }

    /*
     * Customer resource projection
     */
    const resourceIdCounts = new Map();
    const fileIdentityCounts = new Map();
    const canonicalCounts = new Map();

    for (const record of packet.resources) {
        const canonicalKey = `${record.productGid}|${record.configurationId}|${record.language}|${record.canonicalIdentity}`;
        canonicalCounts.set(canonicalKey, (canonicalCounts.get(canonicalKey) || 0) + 1);
        resourceIdCounts.set(
            record.resourceId,
            (resourceIdCounts.get(record.resourceId) || 0) + 1
        );

        fileIdentityCounts.set(
            record.fileIdentity,
            (fileIdentityCounts.get(record.fileIdentity) || 0) + 1
        );
    }

    for (const record of packet.resources) {
        if (
            resourceIdCounts.get(record.resourceId) !== 1 ||
            fileIdentityCounts.get(record.fileIdentity) !== 1 ||
            canonicalCounts.get(`${record.productGid}|${record.configurationId}|${record.language}|${record.canonicalIdentity}`) !== 1
        ) {
            suppress('duplicate_resource_identity', record);
            continue;
        }

        if (
            record.productGid !== packet.machineProductGid ||
            !record.applicableProductGids.includes(packet.machineProductGid)
        ) {
            suppress('wrong_resource_product', record);
            continue;
        }

        if (!evaluateProjectionRecord(context, record, asOf)) {
            suppress('resource_authority_ineligible', record);
            continue;
        }

        if (!resourceCoherent(record, page)) {
            suppress(
                record.resourceType === 'support'
                    ? 'support_resource_customer_forbidden'
                    : 'resource_not_current_canonical_customer_approved',
                record
            );
            continue;
        }

        const url = routeDestination(
            record.destination,
            record.resourceId,
            asOf
        );

        if (!url) {
            suppress('invalid_resource_destination', record);
            continue;
        }

        out.resources.push({
            record_id: record.recordId,
            resource_id: record.resourceId,
            type: record.resourceType,
            title: record.title,
            url,
            language: record.language,
            version: record.version,
            video:
                record.resourceType === 'video'
                    ? {
                        poster_identity: record.video.posterIdentity,
                        captions_reviewed: true,
                        width: record.video.width,
                        height: record.video.height,
                        embed_url: record.video.embedUrl
                    }
                    : null,
            approval_decision_id: record.approvalDecisionId,
            source_ids: [...record.sourceIds]
        });
    }

    if (!validateProjection(out)) {
        throw new Error(
            'Invlid F6 support/resources projection: ' +
            JSON.stringify(validateProjection.errors)
        );
    }

    return out;
}

module.exports = {
    projectSupportResources,
    warrantyCoherent,
    warrantyUpstreamEligible,
    resourceCoherent,
    routeDestination,
    roleEvidenceMatches,
    safeRelativeRoute,
    validTimeRange,
    validatePacket,
    validateProjection
};
