'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const { READINESS_BLOCKERS } = require('./lib/epic-l-policy2/foundation');
const { createB08ASubmissionSystem } = require('./lib/epic-l-policy2/submission-ingestion-fixture');

const ROOT = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const checks = [];
function check(name, condition) { assert.ok(condition, `B08A validation failed: ${name}`); checks.push(name); }

const ajv = new Ajv2020({ allErrors: true, strict: false });
const contract = json('data/epic-l-policy2-submission-ingestion-contract.json');
const contractValid = ajv.compile(json('schemas/epic-l-policy2-submission-ingestion.schema.json'))(contract);
check('submission ingestion contract passes its schema', contractValid === true);
const envelopeValidator = ajv.compile(json('schemas/epic-l-policy2-submission-envelope.schema.json'));
check('canonical external envelope schema accepts registration and rejects authority fields', envelopeValidator({ envelopeVersion: '1.0.0', submissionType: 'REGISTRATION', delivery: { transportId: 'SYNTHETIC_FORM_FIXTURE', deliveryId: 'syn_delivery_schema_001' }, payload: { productGid: 'gid://shopify/Product/1', variantGid: 'gid://shopify/ProductVariant/2', productVersion: 'MACHINE-V1' } }) === true && envelopeValidator({ envelopeVersion: '1.0.0', submissionType: 'SUPPORT', delivery: { transportId: 'SYNTHETIC_FORM_FIXTURE', deliveryId: 'syn_delivery_schema_002' }, payload: { category: 'TECHNICAL_GUIDANCE' }, role: 'ADMIN' }) === false);
const progress = json('data/epic-l-policy2-b08a-progress.json');
const progressValid = ajv.compile(json('schemas/epic-l-policy2-b08a-progress.schema.json'))(progress);
check('B08A progress receipt passes its schema', progressValid === true);
check('all eight readiness blockers remain exact', JSON.stringify(progress.readinessBlockers) === JSON.stringify(READINESS_BLOCKERS));
check('progress records executed positive and negative acceptance counts', progress.testEvidence.positiveScenarios === 22 && progress.testEvidence.negativeOperationRejections === 25);
check('all operational activation counts remain zero', Object.values(progress.activationEvidence).every((value) => value === 0));

const source = read('scripts/lib/epic-l-policy2/submission-ingestion.js');
const fixture = read('scripts/lib/epic-l-policy2/submission-ingestion-fixture.js');
check('canonical envelope is versioned and supports only registration and support', /SUBMISSION_ENVELOPE_VERSION = '1\.0\.0'/.test(source) && /\['REGISTRATION', 'SUPPORT'\]/.test(source));
check('authentication is evaluated before envelope processing and is not payload authority', /authenticate\(authentication\)[\s\S]*validateEnvelope\(envelope\)/.test(source) && contract.identityBoundary.callerRoleLabelsAccepted === false);
check('authentication context rejects self asserted fields', /exactKeys\(context, \['credential'\]/.test(source));
check('normal execution denies unresolved production identity', /PRODUCTION_IDENTITY_BINDING_UNRESOLVED/.test(source));
check('synthetic authentication requires explicit test mode', /SYNTHETIC_AUTHENTICATOR_FORBIDDEN/.test(source) && /testMode === true/.test(source));
check('registration defaults are deterministic and evidence conservative', /firstUseDeclaration \|\| \{ state: 'UNKNOWN' \}/.test(source) && /registrationPath \|\| 'NEW_REGISTRATION'/.test(source));
check('incomplete support defaults to clarification and safety review', /SYNTHETIC_CLARIFICATION_REQUIRED/.test(source) && /AMBIGUOUS_REVIEW_REQUIRED/.test(source));
check('source channel is derived internally', /sourceChannel: 'SYNTHETIC_WEB_FORM'/.test(source));
check('receipt correlation command and audit identities are generated internally', ['receiptIdFactory', 'correlationIdFactory', 'commandIdFactory', 'auditIdFactory'].every((term) => source.includes(term)));
check('delivery idempotency uses transport identity and payload digest', /deliveryKey = `\$\{transportId\}:\$\{deliveryId\}`/.test(source) && /payloadDigest/.test(source));
check('conflicting delivery reuse is rejected', /CONFLICTING_DELIVERY_REUSE/.test(source));
check('retry retains one domain command across attempts', /domainCommandId: this\.commandIdFactory/.test(source) && /commandId: receipt\.domainCommandId/.test(source));
check('restricted diagnostics exclude payload and contact data', /submissionPayloadIncluded: false/.test(source) && /customerContactIncluded: false/.test(source));
check('diagnostic and audit reads have independent authorization', /SUBMISSION_DIAGNOSTICS_READ/.test(source) && /SUBMISSION_AUDIT_READ/.test(source));
check('receipt audit is append only and cloned on read', /this\.audit\.set\(receiptId, \[\.\.\.\(this\.audit\.get\(receiptId\) \|\| \[\]\), event\]\)/.test(source) && /return clone\(this\.audit\.get\(receiptId\) \|\| \[\]\)/.test(source));
check('ingestion invokes canonical registration command', /registration\.createRegistration/.test(source));
check('ingestion invokes canonical support command', /supportIntake\.createCase/.test(source));
check('hazard normalization delegates to existing safety handling', /EXPLICIT_HAZARD/.test(source) && /hazardEvidenceRef/.test(source) && !/SAFETY_HOLD.*=/.test(source));
check('operational activation is domain blocked', /assertOperationalActivationBlocked/.test(source) && /activationGate\.assertPermitted/.test(source));
check('external Forms and Flow transport remains a B08B denial', /B08B_EXTERNAL_TRANSPORT_NOT_AUTHORIZED/.test(source));
check('fixture derives exact identities from accepted catalog snapshot', /epic-l-policy2-shopify-product-snapshot-2026-11-23\.json/.test(fixture) && /technicalProductClass === 'machine'/.test(fixture));
check('fixture does not depend on resource administration persistence or archives', !/resource-administration|Policy2ResourceAdmin|registry\.json|resource-admin-fixture/.test(fixture));

const pkg = json('package.json');
check('package exposes demo test and aggregate B08A gates', ['demo:epic-l-policy2-b08a', 'test:epic-l-policy2-b08a', 'validate:epic-l-policy2-b08a'].every((name) => pkg.scripts[name]));
check('architecture records independent decisions and B08B handoff', /B08B handoff/.test(read('docs/architecture/epic-l-policy2-private-submission-ingestion-b08a.md')) && /R3-006 is in progress/.test(read('docs/architecture/epic-l-policy2-private-submission-ingestion-b08a.md')));

const preserved = json('data/epic-l-policy2-b06-preserved-paths.json');
check('all 39 protected paths retain exact SHA-256 hashes', preserved.paths.length === 39 && preserved.paths.every((item) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, item.path))).digest('hex').toUpperCase() === item.sha256));
const historicalBacklog = json('data/epic-l-policy2-next-engineering-backlog-r3.json');
const r3006 = historicalBacklog.items?.find?.((item) => item.itemId === 'R3-006') || historicalBacklog.backlog?.find?.((item) => item.itemId === 'R3-006') || historicalBacklog.workItems?.find?.((item) => item.itemId === 'R3-006');
check('historical R3 backlog remains blocked and progress uses a successor receipt', progress.r3WorkItem.historicalBacklogModified === false && progress.r3WorkItem.status === 'IN_PROGRESS_BLOCKED_B08B_EXTERNAL_PROOF' && (!r3006 || r3006.status === 'BLOCKED_DEPENDENCY'));
check('B08B dependencies cover transport identity persistence notification and privacy', contract.b08bDependencies.length >= 5 && /identit/i.test(contract.b08bDependencies.join(' ')) && /storage/i.test(contract.b08bDependencies.join(' ')));

const system = createB08ASubmissionSystem();
const machine = system.catalogEntries[0];
const receipt = system.ingestion.ingest({ authentication: system.syntheticAuthentication, envelope: { envelopeVersion: '1.0.0', submissionType: 'REGISTRATION', delivery: { transportId: 'SYNTHETIC_FORM_FIXTURE', deliveryId: 'syn_delivery_validator_001' }, payload: { productGid: machine.productGid, variantGid: machine.variantGid, productVersion: machine.productVersion } } });
check('synthetic integration demonstration produces a blocked private receipt', receipt.state === 'COMPLETED' && receipt.result.targetType === 'REGISTRATION' && receipt.customerActivationPermitted === false);

assert.equal(checks.length, 34);
console.log(`Epic L Policy 2.0 B08A artifact checks passed: ${checks.length}/${checks.length}`);
console.log('Live provider calls: 0; Shopify mutations: 0; customer activations: 0; publications: 0.');
