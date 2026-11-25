'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const matrixPath = path.join(root, 'data/epic-l-policy2-coverage-matrix.json');
const projectionPath = path.join(root, 'data/epic-l-policy2-coverage-review-31.json');
const worksheetPath = path.join(root, 'docs/policy/epic-l-policy2-coverage-review-31-worksheet.md');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

const sourceRows = matrix.activeProductApprovalRegister.filter((row) =>
  row.shopifyStatus === 'ACTIVE' && row.coverageProposal.disposition === 'HUMAN_REVIEW_REQUIRED');

if (sourceRows.length !== 31) throw new Error(`Expected exactly 31 unresolved Active Products, found ${sourceRows.length}`);

const records = sourceRows.map((row) => ({
  productGid: row.productGid,
  variantGids: [...row.variantGids],
  title: row.title,
  technicalClassContext: {
    value: row.technicalClassificationEvidence.value,
    sourceRef: row.technicalClassificationEvidence.sourceRef,
    authority: 'CONTEXT_ONLY_NOT_COVERAGE_AUTHORITY',
  },
  observedFunctionEvidence: JSON.parse(JSON.stringify(row.physicalFunctionAssessment)),
  classificationUncertainty: {
    sourceStatus: row.coverageProposal.status,
    rationale: row.coverageProposal.rationale,
    reviewReasons: [...row.reviewReasons],
  },
  candidateDispositions: [...row.coverageProposal.candidateDispositions],
  independentManufacturingEvidence: {
    status: row.manufacturingSource.status,
    producer: row.manufacturingSource.manufacturer,
    evidenceRefs: [...row.manufacturingSource.evidenceRefs],
    plainLanguage: 'Identify whether an external manufacturer or Rhino produced the machine or component, and cite the source supporting that conclusion. This is evidence, not a separate approval role.',
  },
  reviewPriority: row.reviewPriority,
  assignedBusinessReviewer: null,
  proposedBusinessClassification: null,
  reviewEvidenceReference: null,
  reviewStatus: 'PENDING_BUSINESS_REVIEW',
  legalApprovalStatus: row.legalApproval.status,
  sourceBusinessApprovalStatus: row.businessApproval.status,
  customerPromiseAuthorized: false,
}));

const projection = {
  schemaVersion: '1.0.0',
  artifactId: 'EPIC-L-POLICY2-B06-COVERAGE-REVIEW-31',
  generatedAt: '2026-11-25',
  source: 'data/epic-l-policy2-coverage-matrix.json',
  sourceSchemaVersion: matrix.schemaVersion,
  status: 'PENDING_AVERY_OR_VERONICA_REVIEW',
  businessReviewAuthorities: ['Avery', 'Veronica'],
  reviewerIdentityBindingStatus: 'UNVERIFIED',
  customerFacingAuthority: false,
  originalMatrixMutated: false,
  selectionRule: 'ACTIVE Products with coverageProposal.disposition HUMAN_REVIEW_REQUIRED',
  selectedProductCount: records.length,
  remainingActiveProductsRequiringEventualApproval: matrix.currentAudit.activeProducts - records.length,
  records,
};

fs.writeFileSync(projectionPath, `${JSON.stringify(projection, null, 2)}\n`);

const groups = ['CRITICAL', 'HIGH'];
const lines = [
  '# Policy 2.0 Product Coverage Review — First 31 Products',
  '',
  'Decision authorities: Avery or Veronica. This worksheet organizes the 31 currently unresolved physical classifications; it does not approve coverage or authorize customer promises.',
  '',
  'Manufacturer evidence means: identify whether Rhino or an external manufacturer produced the relevant machine or component, then cite the source supporting that conclusion. No separate manufacturer-evidence approver is required.',
  '',
  'For each Product, choose one existing candidate disposition, identify the reviewer, and add the evidence reference. Legal approval and customer promise authorization remain separate.',
  '',
];

for (const priority of groups) {
  const rows = records.filter((row) => row.reviewPriority === priority);
  lines.push(`## ${priority} priority (${rows.length})`, '');
  for (const [index, row] of rows.entries()) {
    const observed = row.observedFunctionEvidence.evidenceRefs.map((evidence) => evidence.observedValue).join(' ');
    lines.push(
      `### ${index + 1}. ${row.title}`,
      '',
      `- Product: \`${row.productGid}\``,
      `- Variants: ${row.variantGids.map((gid) => `\`${gid}\``).join(', ')}`,
      `- Technical class (context only): ${row.technicalClassContext.value}`,
      `- Observed function: ${observed || 'No description evidence recorded.'}`,
      `- Why unresolved: ${row.classificationUncertainty.rationale}`,
      `- Candidate dispositions: ${row.candidateDispositions.join(', ')}`,
      `- Manufacturer evidence: ${row.independentManufacturingEvidence.status}; producer not yet established`,
      '- Avery/Veronica decision: ____________________',
      '- Reviewer: ____________________',
      '- Evidence reference: ____________________',
      '',
    );
  }
}

lines.push('## Remaining boundary', '', `${projection.remainingActiveProductsRequiringEventualApproval} other Active Products still require eventual business and legal coverage approval. No row in this worksheet has customer-promise authorization.`);
fs.writeFileSync(worksheetPath, `${lines.join('\n')}\n`);

console.log(`Built ${records.length} coverage review records and worksheet rows.`);
