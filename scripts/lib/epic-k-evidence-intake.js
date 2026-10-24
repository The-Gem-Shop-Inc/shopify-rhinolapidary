'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { schemaErrors, verifyEvidence } = require('./epic-k-evidence-drift');
const { parseTimestamp } = require('./epic-k-policy');

const PROHIBITED_ASSERTIONS = new Set([
    'checkoutEnforcement',
    'checkoutCompliance',
    'paymentAuthorized',
    'canInvoice',
    'shopifyConfigurationCompliant',
]);
const NON_APPROVAL_ARTIFACT_TYPES = new Set([
    'repository_observation',
    'shopify_configuration',
    'policy_contract',
    'historical_policy',
    'unconfirmed_export',
]);
const UNVERIFIED_VALUES = new Set(['', 'unknown', 'unverified', 'pending', 'missing', 'not established', 'not_established', 'n/a', 'tbd']);

function fingerprint(value) {
    return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function duplicateValues(values) {
    const seen = new Set();
    const duplicates = new Set();
    for (const value of values) {
        if (seen.has(value)) duplicates.add(value);
        seen.add(value);
    }
    return [...duplicates].sort();
}

function sameMembers(left, right) {
    return left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function validateIntakeManifest(manifest, requirements, receipts, evidenceGap, mapping, mappingAcceptance) {
    const errors = [
        ...schemaErrors('schemas/epic-k-evidence-intake-manifest.schema.json', manifest, 'evidence intake manifest'),
        ...schemaErrors('schemas/epic-k-operational-evidence.schema.json', requirements, 'evidence requirements'),
        ...schemaErrors('schemas/epic-k-evidence-receipts.schema.json', receipts, 'authoritative receipt register'),
        ...schemaErrors('schemas/epic-k-evidence-drift-report.schema.json', evidenceGap, 'evidence gap report'),
        ...schemaErrors('schemas/epic-k-shopify-source-mapping.schema.json', mapping, 'source mapping'),
        ...schemaErrors('schemas/epic-k-shopify-mapping-acceptance.schema.json', mappingAcceptance, 'mapping acceptance'),
    ];
    if (errors.length) return { errors, requestCount: 0, blockedCount: 0 };

    if (manifest.requirementsSource.fingerprint.value !== fingerprint(requirements)) errors.push('requirements register fingerprint mismatch');
    if (manifest.requirementsSource.version !== requirements.version || manifest.requirementsSource.contractId !== requirements.contractId) {
        errors.push('requirements register identity or version mismatch');
    }
    const requirementIds = requirements.requirements.map((entry) => entry.id);
    const requestIds = manifest.requests.map((entry) => entry.requirementId);
    const duplicateRequests = duplicateValues(requestIds);
    if (duplicateRequests.length) errors.push(`duplicate evidence requests: ${duplicateRequests.join(', ')}`);
    if (!sameMembers(requestIds, requirementIds)) errors.push('intake manifest must contain exactly one request for every authoritative requirement ID');

    const requirementById = new Map(requirements.requirements.map((entry) => [entry.id, entry]));
    for (const request of manifest.requests) {
        const requirement = requirementById.get(request.requirementId);
        if (!requirement) {
            errors.push(`${request.requestId}: unknown requirement ${request.requirementId}`);
            continue;
        }
        if (!request.requiredAssertionNames.includes('ownerIdentity')) errors.push(`${request.requestId}: ownerIdentity assertion is required`);
        for (const source of request.repositorySources) {
            if (source.maySatisfyRequirement) errors.push(`${request.requestId}: repository discovery source cannot satisfy operational authority`);
            if (source.repositoryPath && !fs.existsSync(path.resolve(process.cwd(), source.repositoryPath))) {
                errors.push(`${request.requestId}: repository source does not exist: ${source.repositoryPath}`);
            }
            if (!source.repositoryPath && source.classification !== 'missing_or_inaccessible') {
                errors.push(`${request.requestId}: null repository source must be classified missing_or_inaccessible`);
            }
        }
    }

    if (receipts.receipts.length !== 0 || receipts.status !== 'intake_open_no_authoritative_receipts') {
        errors.push('authoritative receipt register must remain empty during intake preparation');
    }
    const verified = verifyEvidence(receipts, requirements, { asOf: '2026-10-24T23:59:59.000Z' });
    errors.push(...verified.errors);
    const blockedCount = verified.report?.summary?.BLOCKED || 0;
    if (blockedCount !== 8 || verified.report?.operationalReadiness !== 'BLOCKED') errors.push('all eight operational requirements must remain BLOCKED');
    if (verified.report?.liveCheckoutEnforcement !== 'UNVERIFIED') errors.push('live checkout enforcement must remain UNVERIFIED');
    if (evidenceGap.summary?.BLOCKED !== 8 || evidenceGap.operationalReadiness !== 'BLOCKED') errors.push('committed evidence gap report must retain eight blocked requirements');
    if (mapping.version !== '1.2.0' || mapping.productOwnerMappingAcceptanceStatus !== 'accepted') errors.push('accepted source mapping version 1.2.0 must remain authoritative');
    if (mappingAcceptance.mappingDesignAcceptanceStatus !== 'accepted') errors.push('all 24 mapping definitions must retain Product Owner design acceptance');
    if (manifest.submissionContract.intakeCreatesAcceptedReceipt || manifest.globalBoundaries.shopifyAccessAuthorized || manifest.globalBoundaries.shopifyMutationAuthorized) {
        errors.push('intake manifest cannot create authority or authorize Shopify operations');
    }
    if (JSON.stringify(manifest).includes('K-DEC-020')) errors.push('intake manifest cannot create a new K-DEC decision');

    return { errors, requestCount: manifest.requests.length, blockedCount };
}

function validateAssertionValue(assertion, syntheticFixture, errors, receiptId) {
    if (assertion.value === null) errors.push(`${receiptId}: ${assertion.name} cannot be null`);
    if (typeof assertion.value === 'string' && UNVERIFIED_VALUES.has(assertion.value.trim().toLowerCase())) {
        errors.push(`${receiptId}: ${assertion.name} is unverified or unspecified`);
    }
    if (typeof assertion.value === 'number' && (!Number.isFinite(assertion.value) || assertion.value < 0)) {
        errors.push(`${receiptId}: ${assertion.name} has an invalid numeric value`);
    }
    if (!syntheticFixture && typeof assertion.value === 'string' && /^SYNTHETIC_/i.test(assertion.value)) {
        errors.push(`${receiptId}: synthetic assertion value cannot be represented as authoritative`);
    }
}

function validateSubmissionCandidate(receiptSet, manifest, requirements, options = {}) {
    const errors = [
        ...schemaErrors('schemas/epic-k-evidence-receipts.schema.json', receiptSet, 'submission candidate'),
    ];
    const asOf = options.asOf;
    if (parseTimestamp(asOf) === null) errors.push('a valid explicit assessment time is required');
    if (errors.length) return { errors, submissionState: 'INVALID', evidenceReport: null };

    const requestByRequirement = new Map(manifest.requests.map((entry) => [entry.requirementId, entry]));
    const requirementById = new Map(requirements.requirements.map((entry) => [entry.id, entry]));
    const syntheticFixture = receiptSet.inputClassification === 'synthetic_fixture' && receiptSet.synthetic;
    if (receiptSet.synthetic && receiptSet.inputClassification !== 'synthetic_fixture') {
        errors.push('synthetic submission cannot be represented as authoritative intake');
    }
    if (!receiptSet.synthetic && receiptSet.inputClassification === 'synthetic_fixture') {
        errors.push('synthetic fixture classification requires synthetic=true');
    }

    for (const receipt of receiptSet.receipts) {
        const request = requestByRequirement.get(receipt.requirementId);
        const requirement = requirementById.get(receipt.requirementId);
        if (!request || !requirement) {
            errors.push(`${receipt.id}: no intake request exists for ${receipt.requirementId}`);
            continue;
        }
        if (!requirement.authorityOwners.includes(receipt.ownerRole)) errors.push(`${receipt.id}: unsupported owner role ${receipt.ownerRole}`);
        if (!request.allowedSubjectTypes.includes(receipt.subject.type)) errors.push(`${receipt.id}: unsupported subject type ${receipt.subject.type}`);
        const missingScope = request.requiredScopeDimensions.filter((dimension) => !receipt.subject.scope.includes(dimension));
        if (missingScope.length) errors.push(`${receipt.id}: missing required scope dimensions: ${missingScope.join(', ')}`);
        if (!receipt.source.digest) errors.push(`${receipt.id}: sanitized source digest is required`);
        if (parseTimestamp(receipt.collectedAt) === null || (parseTimestamp(asOf) !== null && parseTimestamp(receipt.collectedAt) > parseTimestamp(asOf))) {
            errors.push(`${receipt.id}: collection timestamp is invalid or after the assessment time`);
        }
        if (request.validityMode === 'required_interval' && receipt.validity.kind !== 'interval') {
            errors.push(`${receipt.id}: an explicit validity interval is required`);
        }

        const assertionNames = receipt.assertions.map((entry) => entry.name);
        const duplicates = duplicateValues(assertionNames);
        if (duplicates.length) errors.push(`${receipt.id}: duplicate assertions: ${duplicates.join(', ')}`);
        const missingAssertions = request.requiredAssertionNames.filter((name) => !assertionNames.includes(name));
        if (missingAssertions.length) errors.push(`${receipt.id}: missing mandatory assertions: ${missingAssertions.join(', ')}`);
        const prohibited = assertionNames.filter((name) => PROHIBITED_ASSERTIONS.has(name));
        if (prohibited.length) errors.push(`${receipt.id}: configuration evidence cannot infer checkout or payment authority: ${prohibited.join(', ')}`);
        for (const assertion of receipt.assertions) validateAssertionValue(assertion, syntheticFixture, errors, receipt.id);

        const discovered = request.repositorySources.find((source) => source.repositoryPath === receipt.source.reference);
        if (receipt.verificationStatus === 'accepted' && discovered && !discovered.maySatisfyRequirement) {
            errors.push(`${receipt.id}: repository source ${receipt.source.reference} is discovery evidence, not operational approval`);
        }
        if (receipt.verificationStatus === 'accepted' && NON_APPROVAL_ARTIFACT_TYPES.has(receipt.source.artifactType)) {
            errors.push(`${receipt.id}: ${receipt.source.artifactType} artifact cannot be treated as approval`);
        }
        if (receipt.verificationStatus === 'accepted' && discovered?.classification === 'relevant_requires_confirmation_or_renewal') {
            errors.push(`${receipt.id}: expired or unconfirmed Epic E/F evidence cannot be promoted without renewed authority`);
        }
    }

    const verification = verifyEvidence(receiptSet, requirements, { asOf });
    errors.push(...verification.errors);
    if (verification.report?.results.some((entry) => entry.state === 'FAIL')) {
        errors.push('submission contains duplicate, conflicting, expired, unsupported, or incorrectly scoped evidence');
    }
    return {
        errors,
        submissionState: errors.length ? 'INVALID' : 'VALID_STRUCTURE_AND_SCOPE',
        evidenceReport: verification.report,
    };
}

function bulletList(values) {
    return values.map((value) => `- ${value}`).join('\n');
}

function renderDepartmentalRequestReport(manifest, requirements) {
    const requirementById = new Map(requirements.requirements.map((entry) => [entry.id, entry]));
    const lines = [
        '# Epic K Operational Evidence Requests',
        '',
        `Prepared: ${manifest.preparedOn}`,
        '',
        'These are intake requests. They are not accepted evidence receipts, do not authorize Shopify work, and do not change approved Epic K policy decisions.',
        '',
        'Current gates: 8/8 operational requirements BLOCKED; operational readiness BLOCKED; live checkout enforcement UNVERIFIED; K-PBI-002 PARTIAL.',
        '',
    ];
    for (const request of manifest.requests) {
        const requirement = requirementById.get(request.requirementId);
        lines.push(`## ${request.requirementId} — ${requirement.category}`, '');
        lines.push(`Request: ${request.requestId}`, '');
        lines.push('Authoritative roles:', '', bulletList(requirement.authorityOwners), '');
        lines.push('Required facts:', '', bulletList(requirement.requiredFacts), '');
        lines.push('Required subject and scope:', '', `- Subject type: ${request.allowedSubjectTypes.join(', ')}`, ...request.requiredScopeDimensions.map((value) => `- ${value}`), '');
        lines.push('Acceptable artifacts:', '', bulletList(request.acceptableArtifacts), '');
        lines.push('Required provenance:', '', bulletList(request.requiredProvenance), '');
        lines.push('Validity:', '', `- ${request.validityMode}: ${request.validityRationale}`, '');
        lines.push('Sanitization:', '', bulletList(request.sanitizationRequirements), '');
        lines.push('Repository leads and limitations:', '');
        for (const source of request.repositorySources) {
            lines.push(`- ${source.repositoryPath || 'No repository artifact'} — ${source.classification}: ${source.summary} ${source.limitation}`);
        }
        lines.push('', 'Human authority must supply:', '', bulletList(request.humanAuthorityInputs), '');
        lines.push('Do not infer:', '', bulletList(request.prohibitedInferences), '');
    }
    lines.push('## Submission validation', '');
    lines.push('Prepare a candidate that conforms to `schemas/epic-k-evidence-receipts.schema.json`, then run:', '');
    lines.push('```powershell', 'npm run validate:epic-k-evidence-intake -- --submission <sanitized-candidate.json> --as-of <ISO-8601 timestamp>', '```', '');
    lines.push('A valid intake candidate remains subject to authoritative review and attachment. It does not update the accepted receipt register automatically.', '');
    return lines.join('\n');
}

module.exports = {
    fingerprint,
    renderDepartmentalRequestReport,
    validateIntakeManifest,
    validateSubmissionCandidate,
};
