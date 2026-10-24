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
const WEIGHT_UNITS = new Set(['g', 'kg', 'oz', 'lb']);
const DIMENSION_UNITS = new Set(['mm', 'cm', 'm', 'in', 'ft']);
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

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

function validateIntakeManifest(manifest, requirements, receipts, evidenceGap, mapping, mappingAcceptance, options = {}) {
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

    const asOf = options.asOf;
    if (parseTimestamp(asOf) === null) errors.push('a valid explicit assessment time is required for authoritative receipt evaluation');
    const verified = verifyEvidence(receipts, requirements, { asOf });
    errors.push(...verified.errors);
    const blockedCount = verified.report?.summary?.BLOCKED || 0;
    if (verified.report?.results?.some((entry) => entry.state === 'FAIL')) {
        errors.push('authoritative receipt register contains expired, duplicate, conflicting, unsupported, or incorrectly scoped evidence');
    }
    if (verified.report?.operationalReadiness !== 'BLOCKED') errors.push('operational readiness must remain BLOCKED until the evidence gate explicitly establishes otherwise');
    if (verified.report?.liveCheckoutEnforcement !== 'UNVERIFIED') errors.push('live checkout enforcement must remain UNVERIFIED');
    if (mapping.version !== '1.2.0' || mapping.productOwnerMappingAcceptanceStatus !== 'accepted') errors.push('accepted source mapping version 1.2.0 must remain authoritative');
    if (mappingAcceptance.mappingDesignAcceptanceStatus !== 'accepted') errors.push('all 24 mapping definitions must retain Product Owner design acceptance');
    if (manifest.submissionContract.intakeCreatesAcceptedReceipt || manifest.globalBoundaries.shopifyAccessAuthorized || manifest.globalBoundaries.shopifyMutationAuthorized) {
        errors.push('intake manifest cannot create authority or authorize Shopify operations');
    }
    if (JSON.stringify(manifest).includes('K-DEC-020')) errors.push('intake manifest cannot create a new K-DEC decision');

    return { errors, requestCount: manifest.requests.length, blockedCount, receiptCount: receipts.receipts.length };
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

function assertionsByName(receipt) {
    return new Map(receipt.assertions.map((assertion) => [assertion.name, assertion.value]));
}

function requireNonplaceholderString(assertions, name, errors, receiptId) {
    const value = assertions.get(name);
    if (typeof value !== 'string' || UNVERIFIED_VALUES.has(value.trim().toLowerCase()) || value.trim().length < 2) {
        errors.push(`${receiptId}: ${name} must be an explicit, nonplaceholder string`);
        return null;
    }
    return value.trim();
}

function requirePositiveNumber(assertions, name, errors, receiptId) {
    const value = assertions.get(name);
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        errors.push(`${receiptId}: ${name} must be a finite number greater than zero; numeric strings are not accepted`);
        return null;
    }
    return value;
}

function requireNonnegativeNumber(assertions, name, errors, receiptId) {
    const value = assertions.get(name);
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        errors.push(`${receiptId}: ${name} must be a documented finite number of zero or greater; absent, unknown, and numeric-string costs are not accepted`);
        return null;
    }
    return value;
}

function requirePositiveInteger(assertions, name, errors, receiptId) {
    const value = assertions.get(name);
    if (!Number.isInteger(value) || value <= 0) {
        errors.push(`${receiptId}: ${name} must be a positive integer`);
        return null;
    }
    return value;
}

function requireUnit(assertions, name, allowed, errors, receiptId) {
    const value = assertions.get(name);
    if (typeof value !== 'string' || !allowed.has(value.trim().toLowerCase())) {
        errors.push(`${receiptId}: ${name} must use a recognized explicit unit (${[...allowed].join(', ')})`);
        return null;
    }
    return value.trim().toLowerCase();
}

function validatePackageDimensions(assertions, packageCount, errors, receiptId) {
    const value = assertions.get('packageDimensions');
    if (typeof value !== 'string') {
        errors.push(`${receiptId}: packageDimensions must list positive length x width x height measurements for every package`);
        return;
    }
    const packages = value.split(';').map((entry) => entry.trim()).filter(Boolean);
    const complete = packages.length > 0 && packages.every((entry) => {
        const dimensions = entry.split(/\s*[xX×]\s*/);
        return dimensions.length === 3 && dimensions.every((dimension) => {
            if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(dimension)) return false;
            const parsed = Number(dimension);
            return Number.isFinite(parsed) && parsed > 0;
        });
    });
    if (!complete) errors.push(`${receiptId}: packageDimensions must contain three strictly positive numeric dimensions per package`);
    if (packageCount !== null && packages.length !== packageCount) {
        errors.push(`${receiptId}: packageDimensions must contain exactly one complete dimension set for each package`);
    }
}

function requireBoolean(assertions, name, errors, receiptId, requiredValue) {
    const value = assertions.get(name);
    if (typeof value !== 'boolean' || (requiredValue !== undefined && value !== requiredValue)) {
        const suffix = requiredValue === undefined ? 'an explicit boolean' : `explicitly ${requiredValue}`;
        errors.push(`${receiptId}: ${name} must be ${suffix}`);
        return null;
    }
    return value;
}

function requireCurrency(assertions, errors, receiptId) {
    const value = assertions.get('currency');
    if (typeof value !== 'string' || !CURRENCY_PATTERN.test(value.trim().toUpperCase())) {
        errors.push(`${receiptId}: currency must be an explicit three-letter currency code`);
        return null;
    }
    return value.trim().toUpperCase();
}

function validateRequirementSemantics(receipt, errors) {
    const assertions = assertionsByName(receipt);
    if (receipt.requirementId === 'K-EVID-001') {
        requireBoolean(assertions, 'pickupEligibility', errors, receipt.id);
        return;
    }
    if (receipt.requirementId === 'K-EVID-003') {
        if (receipt.subject.identifiers.length < 2) errors.push(`${receipt.id}: packed logistics evidence must identify both Product and Variant`);
        requirePositiveNumber(assertions, 'packedShippingWeight', errors, receipt.id);
        const packageCount = requirePositiveInteger(assertions, 'packageCount', errors, receipt.id);
        validatePackageDimensions(assertions, packageCount, errors, receipt.id);
        requireUnit(assertions, 'weightUnit', WEIGHT_UNITS, errors, receipt.id);
        requireUnit(assertions, 'dimensionUnit', DIMENSION_UNITS, errors, receipt.id);
        requireNonplaceholderString(assertions, 'measurementInclusions', errors, receipt.id);
        return;
    }
    if (receipt.requirementId === 'K-EVID-005') {
        requirePositiveNumber(assertions, 'alaskaRate', errors, receipt.id);
        requirePositiveNumber(assertions, 'hawaiiRate', errors, receipt.id);
        requireCurrency(assertions, errors, receipt.id);
        requireBoolean(assertions, 'confirmedServiceAvailability', errors, receipt.id, true);
        requireBoolean(assertions, 'alaskaServiceAvailability', errors, receipt.id, true);
        requireBoolean(assertions, 'hawaiiServiceAvailability', errors, receipt.id, true);
        const alaskaApproval = requireNonplaceholderString(assertions, 'alaskaApprovalReference', errors, receipt.id);
        const hawaiiApproval = requireNonplaceholderString(assertions, 'hawaiiApprovalReference', errors, receipt.id);
        if (alaskaApproval && hawaiiApproval && alaskaApproval === hawaiiApproval) {
            errors.push(`${receipt.id}: Alaska and Hawaii require separate state approval references; a general rate approval is insufficient`);
        }
        return;
    }
    if (receipt.requirementId === 'K-EVID-006') {
        requireNonnegativeNumber(assertions, 'cost', errors, receipt.id);
        requireCurrency(assertions, errors, receipt.id);
        requireNonplaceholderString(assertions, 'availableCoverageOption', errors, receipt.id);
        requireNonplaceholderString(assertions, 'applicableService', errors, receipt.id);
        requireBoolean(assertions, 'selectionAcceptance', errors, receipt.id);
    }
}

function validateSubmissionCandidate(receiptSet, manifest, requirements, options = {}) {
    const errors = [
        ...schemaErrors('schemas/epic-k-evidence-receipts.schema.json', receiptSet, 'submission candidate'),
    ];
    const asOf = options.asOf;
    if (parseTimestamp(asOf) === null) errors.push('a valid explicit assessment time is required');
    if (errors.length) return {
        errors,
        submissionState: 'INVALID',
        candidatePolicyComparison: null,
        authorityAssessment: null,
    };

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
        validateRequirementSemantics(receipt, errors);

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
        candidatePolicyComparison: verification.report ? {
            ...verification.report,
            assessmentScope: 'NON_AUTHORITATIVE_CANDIDATE_COMPARISON',
            establishesRepositoryAuthority: false,
        } : null,
        authorityAssessment: {
            structuralAndSemanticValidation: errors.length ? 'FAIL' : 'PASS',
            sourceAuthenticity: 'UNVERIFIED',
            departmentalAcceptance: 'UNVERIFIED',
            authoritativeRegisterAttachment: 'NOT_ATTACHED',
            operationalReadiness: 'BLOCKED',
            liveCheckoutEnforcement: 'UNVERIFIED',
            candidateVerificationStatusIsAuthority: false,
        },
        policyEffects: receiptSet.receipts
            .filter((receipt) => receipt.requirementId === 'K-EVID-001')
            .map((receipt) => {
                const pickupEligibility = assertionsByName(receipt).get('pickupEligibility');
                return {
                    receiptId: receipt.id,
                    pickupEligibility: pickupEligibility === false ? 'explicitly_ineligible' : pickupEligibility === true ? 'candidate_eligible' : 'unspecified',
                    ordinaryPickupAuthorized: false,
                };
            }),
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
    lines.push('A valid intake candidate has passed structural and semantic checks only. Source authenticity and departmental acceptance remain unverified until independently established, and the candidate is not attached to the authoritative register automatically. Operational readiness and Shopify checkout enforcement remain separate gates.', '');
    return lines.join('\n');
}

module.exports = {
    fingerprint,
    renderDepartmentalRequestReport,
    validateIntakeManifest,
    validateSubmissionCandidate,
};
