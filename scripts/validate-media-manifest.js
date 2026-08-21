const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/media-manifest.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas/media-manifest.schema.json'), 'utf8'));
const outcomesPath = path.join(ROOT, 'data/homepage-section-outcomes.json');
const homepageOutcomes = fs.existsSync(outcomesPath)
    ? JSON.parse(fs.readFileSync(outcomesPath, 'utf8'))
    : { modules: [] };

const errors = [];
const warnings = [];
const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
});
const validate = ajv.compile(schema);

if (!validate(manifest)) {
    for (const error of validate.errors || []) {
        errors.push(`schema${error.instancePath}: ${error.message}`);
    }
}

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

    if (item.status === 'proposed' && !existsInRepo && item.type === 'theme-ui') {
        warnings.push(`${item.path}: proposed media file does not exist yet`);
    }
}

const shopifyFilesAudit = manifest.shopifyFilesAudit;

if (shopifyFilesAudit) {
    const totals = shopifyFilesAudit.totals || {};
    const storage = shopifyFilesAudit.storage || {};
    const sourceAuditPath = shopifyFilesAudit.sourceAuditPath
        ? path.join(ROOT, shopifyFilesAudit.sourceAuditPath)
        : '';

    if (sourceAuditPath && !fs.existsSync(sourceAuditPath)) {
        errors.push(`${shopifyFilesAudit.sourceAuditPath}: Shopify Files audit source does not exist`);
    }

    const mediaTypeTotal = totals.images
        + totals.shopifyHostedVideos
        + totals.documentsAndGenericFiles;

    if (Number.isInteger(totals.totalFiles) && mediaTypeTotal !== totals.totalFiles) {
        errors.push('shopifyFilesAudit: image, video, and generic file counts must equal totalFiles');
    }

    const associationTotal = totals.productMediaAssociated + totals.notProductMediaAssociated;

    if (Number.isInteger(totals.totalFiles) && associationTotal !== totals.totalFiles) {
        errors.push('shopifyFilesAudit: product media association counts must equal totalFiles');
    }

    if (totals.readyNoFileErrors > totals.totalFiles) {
        errors.push('shopifyFilesAudit: readyNoFileErrors cannot exceed totalFiles');
    }

    if (totals.missingAltText > totals.totalFiles) {
        errors.push('shopifyFilesAudit: missingAltText cannot exceed totalFiles');
    }

    const storageTotal = storage.imagesOriginalBytes
        + storage.shopifyHostedVideosOriginalBytes
        + storage.documentsAndGenericFilesOriginalBytes;

    if (Number.isInteger(storage.totalOriginalBytes) && storageTotal !== storage.totalOriginalBytes) {
        errors.push('shopifyFilesAudit: storage category bytes must equal totalOriginalBytes');
    }

    if (shopifyFilesAudit.status === 'ready_for_governed_use') {
        const blockingGates = (shopifyFilesAudit.gates || []).filter((gate) => gate.blocking);

        if (totals.missingAltText > 0) {
            errors.push('shopifyFilesAudit: ready_for_governed_use cannot have missing alt text');
        }

        if (blockingGates.length > 0) {
            errors.push('shopifyFilesAudit: ready_for_governed_use cannot have blocking gates');
        }
    }
}

const homepageCandidateIds = new Set();
const homepageModuleIds = new Set((homepageOutcomes.modules || []).map((module) => module.id));
const mediaManifestPaths = new Set((manifest.media || []).map((item) => item.path));

for (const candidate of manifest.homepageInventory?.candidates || []) {
    if (homepageCandidateIds.has(candidate.id)) {
        errors.push(`${candidate.id}: duplicate homepage media candidate id`);
    }

    homepageCandidateIds.add(candidate.id);

    if (candidate.mediaManifestPath && !mediaManifestPaths.has(candidate.mediaManifestPath)) {
        errors.push(`${candidate.id}: mediaManifestPath does not exist in media manifest`);
    }

    for (const moduleId of candidate.intendedModuleIds || []) {
        if (!homepageModuleIds.has(moduleId)) {
            errors.push(`${candidate.id}: unknown homepage module ${moduleId}`);
        }
    }

    if (candidate.launchReadiness === 'ready') {
        if (!['approved', 'not_applicable'].includes(candidate.usageRightsStatus)) {
            errors.push(`${candidate.id}: launch-ready media requires approved or not-applicable rights`);
        }

        if (!candidate.dimensions.known || !candidate.dimensions.width || !candidate.dimensions.height) {
            errors.push(`${candidate.id}: launch-ready media requires known width and height`);
        }

        if (!['approved', 'not_applicable'].includes(candidate.cropSafety)) {
            errors.push(`${candidate.id}: launch-ready media requires approved crop safety`);
        }

        if (!candidate.altTextOwner.trim() || !candidate.altTextGuidance.trim()) {
            errors.push(`${candidate.id}: launch-ready media requires alt-text owner and guidance`);
        }

        if (candidate.blocker.trim()) {
            errors.push(`${candidate.id}: launch-ready media cannot have a blocker`);
        }
    }
}

for (const requirement of manifest.homepageInventory?.moduleMediaRequirements || []) {
    if (!homepageModuleIds.has(requirement.moduleId)) {
        errors.push(`${requirement.moduleId}: unknown homepage module media requirement`);
    }

    const readyCandidateForModule = (manifest.homepageInventory?.candidates || []).some((candidate) =>
        candidate.launchReadiness === 'ready'
        && (candidate.intendedModuleIds || []).includes(requirement.moduleId)
    );

    if (
        requirement.launchNeed === 'requires_media_before_launch'
        && !readyCandidateForModule
        && !requirement.blocker?.trim()
    ) {
        errors.push(`${requirement.moduleId}: required homepage media needs a blocker until ready media exists`);
    }

    if (
        requirement.governedFallbackCandidateId
        && !homepageCandidateIds.has(requirement.governedFallbackCandidateId)
    ) {
        errors.push(
            `${requirement.moduleId}: unknown governed fallback candidate ${requirement.governedFallbackCandidateId}`,
        );
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

const homepageCandidateCount = manifest.homepageInventory?.candidates?.length || 0;
const shopifyFilesAuditCount = manifest.shopifyFilesAudit?.totals?.totalFiles || 0;

let validationMessage = `Media manifest validation passed with ${manifest.media.length} entries `
    + `and ${homepageCandidateCount} homepage media candidates`;

if (shopifyFilesAuditCount > 0) {
    validationMessage += `; Shopify Files audit covers ${shopifyFilesAuditCount} files`;
}

console.log(`${validationMessage}.`);
