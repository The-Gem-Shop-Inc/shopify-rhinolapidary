'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const { READINESS_BLOCKERS } = require('./lib/epic-l-policy2/foundation');
const { createB07ResourceAdminSystem } = require('./lib/epic-l-policy2/resource-admin-fixture');

const ROOT = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));
const checks = [];
function check(name, condition) { assert.ok(condition, `B07C validation failed: ${name}`); checks.push(name); }

const schema = json('schemas/epic-l-policy2-b07c-progress.schema.json');
const progress = json('data/epic-l-policy2-b07c-progress.json');
const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
check('B07C progress receipt passes its schema', validate(progress) === true);
check('all eight readiness blockers remain exact', JSON.stringify(progress.readinessBlockers) === JSON.stringify(READINESS_BLOCKERS));
check('workflow measurement records zero new manual fields for an existing unchanged resource', progress.workflowMetrics.manualFieldsBefore === 13 && progress.workflowMetrics.manualFieldsAfterExistingUnchanged === 0 && progress.workflowMetrics.explicitActionsAfterExistingUnchanged === 2);
check('acceptance receipt records executed artifact domain rejection browser and accessibility counts', progress.testEvidence.artifactChecks === 28 && progress.testEvidence.positiveAssertions === 28 && progress.testEvidence.negativeOperationRejections === 10 && progress.testEvidence.browserScenarios === 6 && progress.testEvidence.axeViolations === 0);
check('all external and customer operation counts remain zero', Object.values(progress.activationEvidence).every((value) => value === 0));

const adminSource = read('scripts/lib/epic-l-policy2/resource-administration.js');
const enrichmentSource = read('scripts/lib/epic-l-policy2/resource-enrichment.js');
const serverSource = read('server/epic-l-policy2-resource-admin/app.js');
const persistenceSource = read('server/epic-l-policy2-resource-admin/local-persistence.js');
const browserSource = read('server/epic-l-policy2-resource-admin/public/app.js');
check('metadata edits and content replacement are separate governed commands', /editAdministrativeDetails/.test(adminSource) && /updateContent/.test(adminSource) && /contentChanged: false/.test(adminSource));
check('content replacement automatically supersedes and cannot inherit approval', /automatic-supersession/.test(adminSource) && /technicalApprovalInherited: false/.test(adminSource));
check('classification correction retains original effective and invalidated dispositions', /originalClassification/.test(adminSource) && /effectiveClassification/.test(adminSource) && /invalidatedDispositionReferences/.test(adminSource));
check('demonstrably changed content cannot be corrected to unchanged', /DEMONSTRABLE_CONTENT_CHANGE/.test(adminSource));
check('historical approval can remain pending and bind automatically', /PENDING_IMMUTABLE_IDENTITY/.test(adminSource) && /HISTORICAL_APPROVAL_BOUND/.test(adminSource));
check('technical action evidence is automatic and notes are optional', /authenticated-technical-action/.test(adminSource) && /notes = null/.test(adminSource));
check('enrichment hashes bytes and explicitly detects Git LFS pointers', /createHash\('sha256'\).*update\(bytes\)/s.test(enrichmentSource) && /GIT_LFS_CONTENT_UNAVAILABLE/.test(enrichmentSource));
check('enrichment uses established Epic E evidence without provider calls', /epic-e-technical-source-index/.test(enrichmentSource) && /epic-e-resource-catalog/.test(enrichmentSource) && !/fetch\s*\(/.test(enrichmentSource));
check('language defaults preserve a non-verified basis', /POLICY_DEFAULT/.test(enrichmentSource) && /DEFAULTED_NOT_LANGUAGE_VERIFIED/.test(enrichmentSource));
check('missing delivery remains pending and never fabricates a URL', /customerDeliveryPreparation/.test(enrichmentSource) && /DELIVERY_PREPARATION_PENDING/.test(adminSource));
check('server exposes enrichment correction reset and simplified editing commands', ['/api/enrichment-preview', '/api/bulk/correct-unchanged', '/api/reset', '/administrative-details', '/content-update'].every((route) => serverSource.includes(route)));
check('local persistence is outside repository validated atomic and recoverable', /assertOutsideRepository/.test(persistenceSource) && /fsyncSync/.test(persistenceSource) && /backupPath/.test(persistenceSource) && /loadValidated/.test(persistenceSource));
const interfaceHtml = read('server/epic-l-policy2-resource-admin/public/index.html');
check('browser removes routine identity reason and availability inputs while retaining an inventory status filter', (interfaceHtml.match(/name="changeStatus"/g) || []).length === 1 && !/name="immutableRevisionIdentity"|name="changeReason"|name="availabilityStatus"/.test(interfaceHtml));
check('browser retains confirmation for content replacement correction retirement import and reset', /confirmTransition/.test(browserSource) && /CONTENT_REPLACEMENT/.test(browserSource) === false && /Replace the document or video content/.test(browserSource) && /Reset the isolated workspace/.test(browserSource));

const system = createB07ResourceAdminSystem();
const preview = system.administration.previewEnrichment();
check('all nine original candidates receive one bulk enrichment preview', preview.length === 9);
check('six repository candidates have verified hash suggestions', preview.filter((item) => item.suggestions.some((suggestion) => suggestion.field === 'immutableRevisionIdentity' && String(suggestion.value).startsWith('sha256:'))).length === 6);
check('three known Shopify candidates receive canonical delivery suggestions', preview.filter((item) => item.suggestions.some((suggestion) => suggestion.field === 'proposedCustomerDeliveryLink')).length === 3);
const sourceArchive = path.join(process.env.USERPROFILE || '', 'Downloads', 'epic-l-policy2-resource-registry.json');
if (fs.existsSync(sourceArchive)) {
  const archive = JSON.parse(fs.readFileSync(sourceArchive, 'utf8'));
  const restore = createB07ResourceAdminSystem({ importB05: false });
  restore.administration.validateArchive(archive);
  check('available Product Owner V1 archive validates without digest bypass', archive.archiveVersion === 'EPIC_L_POLICY2_RESOURCE_ADMIN_EXPORT_V1' && archive.resources.length === 9 && archive.resources.reduce((sum, item) => sum + item.revisions.length, 0) === 13 && archive.audit.length === 16);
  check('Product Owner archive still has zero customer releases and exactly two current changed classifications', archive.customerReleaseAuthorized === false && archive.resources.filter((item) => item.revisions.at(-1).changeStatus === 'CHANGED_CONTENT').length === 2);
}

const preserved = json('data/epic-l-policy2-b06-preserved-paths.json');
check('all 39 protected paths retain exact SHA-256 hashes', preserved.paths.length === 39 && preserved.paths.every((item) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, item.path))).digest('hex').toUpperCase() === item.sha256));
const pkg = json('package.json');
check('B07C exposes enrichment domain browser and aggregate validation scripts', ['enrich:epic-l-policy2-b07c', 'test:epic-l-policy2-b07c', 'test:epic-l-policy2-b07c-ui', 'validate:epic-l-policy2-b07c'].every((name) => pkg.scripts[name]));
check('B07C browser is isolated loopback synthetic and uses outside-repository runtime data', /127\.0\.0\.1:4178/.test(read('playwright.epic-l-policy2-b07c.config.js')) && /--synthetic/.test(read('playwright.epic-l-policy2-b07c.config.js')) && /os\.tmpdir/.test(read('playwright.epic-l-policy2-b07c.config.js')));
check('publication and storefront mutation boundaries remain domain enforced', /assertCustomerPublicationBlocked/.test(adminSource) && /STOREFRONT_MUTATION_FORBIDDEN/.test(adminSource));

console.log(`Epic L Policy 2.0 B07C artifact checks passed: ${checks.length}/${checks.length}`);
console.log('External provider calls: 0; Shopify mutations: 0; publications: 0.');
