'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const LFS_POINTER_PREFIX = 'version https://git-lfs.github.com/spec/v1';

function readJson(rootDir, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

function sha256File(filePath) {
  const bytes = fs.readFileSync(filePath);
  if (bytes.subarray(0, LFS_POINTER_PREFIX.length).toString('utf8') === LFS_POINTER_PREFIX) {
    return { status: 'GIT_LFS_CONTENT_UNAVAILABLE', immutableRevisionIdentity: null, bytes: bytes.length };
  }
  return {
    status: 'VERIFIED_REPOSITORY_BYTES',
    immutableRevisionIdentity: `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`,
    bytes: bytes.length,
  };
}

function readableTitle(filename) {
  return String(filename || '')
    .replace(/\.[^.]+$/, '')
    .replace(/[_\s]+/g, ' ')
    .replace(/\s*[–—-]\s*/g, ' — ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(^|\s|—\s)([a-z])/g, (match) => match.toUpperCase())
    .replace(/\b(Pdf|Docx|Em)\b/g, (value) => value.toUpperCase());
}

class ResourceEnrichmentService {
  constructor({ rootDir }) {
    this.rootDir = rootDir;
    this.sourceIndex = readJson(rootDir, 'data/epic-e-technical-source-index.json');
    this.resourceCatalog = readJson(rootDir, 'data/epic-e-resource-catalog.json');
  }

  preview(resource) {
    const revision = resource.revisions[resource.revisions.length - 1];
    const imported = revision.importedCandidateEvidence || {};
    const source = this.sourceIndex.sources.find((item) => item.sourceId === resource.resourceId
      || item.sourceId === imported.sourceIdentity
      || item.shopifyFileGid === imported.sourceReference) || null;
    const catalog = this.resourceCatalog.resources.find((item) => item.resourceId === resource.resourceId) || null;
    const suggestions = [];
    const add = (field, value, basis, confidence = 'DETERMINISTIC') => {
      if (value == null || value === '') return;
      suggestions.push({ field, value, basis, confidence });
    };

    if (!revision.language) add('language', 'en-US', 'POLICY_DEFAULT', 'DEFAULTED_NOT_LANGUAGE_VERIFIED');
    if (imported.sourceFilename && revision.title === imported.sourceFilename) {
      add('title', readableTitle(imported.sourceFilename), 'KNOWN_FILENAME');
    }
    if (imported.category && !revision.category) add('category', imported.category, 'B05_INVENTORY');
    if (imported.sourceReference && revision.editableSourceIdentity !== imported.sourceReference) {
      add('editableSourceIdentity', imported.sourceReference, 'B05_SOURCE_REFERENCE');
    }
    if (!revision.providerType && (source || imported.sourceReference)) {
      add('providerType', source?.origin === 'shopify_files' || String(imported.sourceReference).startsWith('gid://shopify/') ? 'SHOPIFY_FILE' : 'REPOSITORY_FILE', 'SOURCE_INVENTORY');
    }
    if (!revision.proposedCustomerDeliveryLink && source?.shopifyHostedUrl) {
      add('proposedCustomerDeliveryLink', source.shopifyHostedUrl, 'TECHNICAL_SOURCE_INDEX_CANONICAL_URL');
    }

    const repositoryPath = source?.repositorySourcePath || (String(imported.sourceReference || '').startsWith('docs/') ? imported.sourceReference : null);
    if (repositoryPath) {
      const absolutePath = path.resolve(this.rootDir, repositoryPath);
      const withinRoot = absolutePath === this.rootDir || absolutePath.startsWith(`${this.rootDir}${path.sep}`);
      if (withinRoot && fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
        const identity = sha256File(absolutePath);
        if (identity.immutableRevisionIdentity && revision.immutableRevisionIdentity !== identity.immutableRevisionIdentity) {
          add('immutableRevisionIdentity', identity.immutableRevisionIdentity, `ACTUAL_FILE_BYTES:${repositoryPath}`);
        }
        add('availabilityDisposition', {
          status: identity.status === 'VERIFIED_REPOSITORY_BYTES' ? 'SYNTHETIC_AVAILABLE' : 'UNRESOLVED',
          checkedAt: this.resourceCatalog.generatedAt,
          evidenceRefs: [`repository-file:${repositoryPath}`, `bytes:${identity.bytes}`],
          synthetic: true,
          productionVerified: false,
          futureProviderVerificationRequired: true,
        }, `ISOLATED_REPOSITORY_CHECK:${identity.status}`);
      }
    }

    if (catalog?.contentHash && !suggestions.some((item) => item.field === 'immutableRevisionIdentity')) {
      add('immutableRevisionIdentity', `sha256:${catalog.contentHash}`, 'EPIC_E_RECORDED_CONTENT_HASH', 'RECORDED_PROVENANCE');
    }
    if (!revision.accessibilityDisposition || revision.accessibilityDisposition.status === 'UNRESOLVED') {
      add('accessibilityDisposition', {
        status: 'UNRESOLVED',
        evidenceRefs: ['AUTOMATED_ASSESSMENT:STRUCTURAL_ACCESSIBILITY_REVIEW_REQUIRED'],
      }, 'AUTOMATED_ACCESSIBILITY_TRIAGE', 'ISSUE_REVIEW_RESERVED_FOR_HUMAN');
    }

    return {
      resourceId: resource.resourceId,
      revisionId: revision.revisionId,
      suggestions,
      pending: {
        customerDeliveryPreparation: !revision.proposedCustomerDeliveryLink && !source?.shopifyHostedUrl,
        productionAvailabilityVerification: true,
        rightsDecision: revision.rightsDisposition?.status === 'UNRESOLVED',
        accessibilityHumanReview: true,
      },
      observedApplicabilityPreserved: revision.applicability,
    };
  }
}

module.exports = { LFS_POINTER_PREFIX, ResourceEnrichmentService, readableTitle, sha256File };
