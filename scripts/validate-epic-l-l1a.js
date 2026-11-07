'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');
const AS_OF = '2026-11-07T17:27:13.043Z';
const ARTIFACTS = {
  authority: ['data/epic-l-authority-evidence.json', 'schemas/epic-l-authority-evidence.schema.json'],
  warranty: ['data/epic-l-warranty-decision-packet.json', 'schemas/epic-l-warranty-decision-packet.schema.json'],
  service: ['data/epic-l-service-decision-packet.json', 'schemas/epic-l-service-decision-packet.schema.json'],
  privacy: ['data/epic-l-privacy-data-contract.json', 'schemas/epic-l-privacy-data-contract.schema.json'],
  admin: ['data/epic-l-admin-audit-plan.json', 'schemas/epic-l-admin-audit-plan.schema.json']
};
const VALIDATOR_CACHE = new Map();

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function duplicateValues(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function compile(schema) {
  const cacheKey = schema.$id || JSON.stringify(schema);
  if (VALIDATOR_CACHE.has(cacheKey)) return VALIDATOR_CACHE.get(cacheKey);
  const validator = new Ajv2020({
    allErrors: true,
    strict: false,
    formats: {
      date: /^\d{4}-\d{2}-\d{2}$/,
      'date-time': (value) => !Number.isNaN(Date.parse(value))
    }
  }).compile(schema);
  VALIDATOR_CACHE.set(cacheKey, validator);
  return validator;
}

function schemaErrors(name, data, schema) {
  const validate = compile(schema);
  if (validate(data)) return [];
  return validate.errors.map((error) => `${name} schema ${error.instancePath || '/'} ${error.message}`);
}

function periodsOverlap(a, b) {
  const aStart = Date.parse(a.effectiveFrom);
  const bStart = Date.parse(b.effectiveFrom);
  const aEnd = a.effectiveTo ? Date.parse(a.effectiveTo) : Number.POSITIVE_INFINITY;
  const bEnd = b.effectiveTo ? Date.parse(b.effectiveTo) : Number.POSITIVE_INFINITY;
  return aStart <= bEnd && bStart <= aEnd;
}

function validateAuthority(authority, asOf, errors) {
  const domainIds = authority.domains.map((domain) => domain.domainId);
  const sourceIds = authority.domains.flatMap((domain) => domain.sources.map((source) => source.sourceId));
  duplicateValues(domainIds).forEach((id) => errors.push(`authority duplicate domain identity ${id}`));
  duplicateValues(sourceIds).forEach((id) => errors.push(`authority duplicate source identity ${id}`));

  for (const [name, reuse] of Object.entries(authority.identityReuse)) {
    if (!fs.existsSync(path.join(ROOT, reuse.canonicalPath))) errors.push(`authority canonical reuse path missing for ${name}: ${reuse.canonicalPath}`);
  }

  for (const domain of authority.domains) {
    if (domain.evidenceState === 'conflicting' && domain.conflictRefs.length === 0) {
      errors.push(`authority ${domain.domainId} conflicting evidence requires conflictRefs`);
    }
    if (['missing', 'conflicting', 'expired', 'revoked'].includes(domain.evidenceState) && domain.publicClaimGate.authorized) {
      errors.push(`authority ${domain.domainId} ${domain.evidenceState} evidence cannot authorize a public claim`);
    }
    if (domain.evidenceState === 'current' && domain.freshness.kind === 'explicit_interval') {
      if (!domain.freshness.validThrough || Date.parse(domain.freshness.validThrough) < Date.parse(asOf)) {
        errors.push(`authority ${domain.domainId} stale observation is presented as current`);
      }
    }
    for (const source of domain.sources) {
      if (source.approval.status === 'approved' && !source.approval.evidenceRef) {
        errors.push(`authority ${source.sourceId} approved authority is missing approval evidence`);
      }
      if (['expired', 'revoked'].includes(source.approval.status) && domain.evidenceState === 'current') {
        errors.push(`authority ${source.sourceId} ${source.approval.status} approval cannot support current authority`);
      }
      if (domain.evidenceState === 'current' && !source.observedAt) {
        errors.push(`authority ${source.sourceId} current evidence is missing observation time`);
      }
      if (source.kind === 'repository') {
        const repositoryPath = source.path.split('#')[0];
        if (!fs.existsSync(path.join(ROOT, repositoryPath))) errors.push(`authority ${source.sourceId} repository source does not exist: ${repositoryPath}`);
      }
    }
  }
}

function approvedRecordComplete(record) {
  return record.approvedBy && record.approvedAt && record.evidenceRef;
}

function validateWarranty(warranty, identity, errors) {
  const decisions = Object.values(warranty.decisionFields);
  duplicateValues(decisions.map((decision) => decision.decisionId)).forEach((id) => errors.push(`warranty duplicate decision ${id}`));
  duplicateValues(warranty.policyVersions.map((policy) => policy.policyId)).forEach((id) => errors.push(`warranty duplicate policy ${id}`));
  duplicateValues(warranty.productMappings.map((mapping) => mapping.mappingId)).forEach((id) => errors.push(`warranty duplicate mapping ${id}`));
  duplicateValues(warranty.requiredApprovals.map((approval) => approval.approvalId)).forEach((id) => errors.push(`warranty duplicate approval ${id}`));

  for (const decision of decisions) {
    if (decision.value !== null && decision.status !== 'approved') errors.push(`warranty ${decision.decisionId} has an unapproved value`);
    if (decision.status === 'approved' && (decision.value === null || decision.evidenceRefs.length === 0)) errors.push(`warranty ${decision.decisionId} approved decision is missing value or evidence`);
    if (decision.value !== null && /\b(all|every|any)\s+(product|machine|model)s?\b|universal coverage/i.test(JSON.stringify(decision.value))) {
      errors.push(`warranty ${decision.decisionId} contains an unauthorized universal coverage claim`);
    }
  }
  for (const approval of warranty.requiredApprovals) {
    if (approval.status === 'approved' && !approvedRecordComplete(approval)) errors.push(`warranty ${approval.approvalId} approved authority is missing approver, time, or evidence`);
  }

  const approvals = new Map(warranty.requiredApprovals.map((approval) => [approval.approvalId, approval]));
  const policies = new Map(warranty.policyVersions.map((policy) => [policy.policyId, policy]));
  for (const policy of warranty.policyVersions) {
    if (policy.effectiveFrom && policy.effectiveTo && Date.parse(policy.effectiveFrom) > Date.parse(policy.effectiveTo)) errors.push(`warranty ${policy.policyId} has an invalid effective period`);
    if (policy.status === 'approved') {
      if (!policy.effectiveFrom || !policy.issuer || !policy.administrator || policy.evidenceRefs.length === 0) errors.push(`warranty ${policy.policyId} approved policy is missing authority fields`);
      if (policy.approvalIds.length === 0 || policy.approvalIds.some((id) => !approvals.has(id) || approvals.get(id).status !== 'approved')) errors.push(`warranty ${policy.policyId} approved policy lacks accepted approval authority`);
    }
  }

  const products = new Set(identity.productIdentities.map((product) => product.productGid));
  const variants = new Map(identity.variantIdentities.map((variant) => [variant.variantGid, variant.productGid]));
  for (const mapping of warranty.productMappings) {
    if (!products.has(mapping.productGid)) errors.push(`warranty ${mapping.mappingId} references invalid Product ${mapping.productGid}`);
    for (const variantGid of mapping.variantGids) {
      if (!variants.has(variantGid)) errors.push(`warranty ${mapping.mappingId} references invalid Variant ${variantGid}`);
      else if (variants.get(variantGid) !== mapping.productGid) errors.push(`warranty ${mapping.mappingId} Variant does not belong to Product`);
    }
    if (!policies.has(mapping.policyId)) errors.push(`warranty ${mapping.mappingId} references missing policy version ${mapping.policyId}`);
    if (mapping.effectiveTo && Date.parse(mapping.effectiveFrom) > Date.parse(mapping.effectiveTo)) errors.push(`warranty ${mapping.mappingId} has an invalid effective period`);
    if (mapping.status === 'approved') {
      const policy = policies.get(mapping.policyId);
      if (!policy || policy.status !== 'approved') errors.push(`warranty ${mapping.mappingId} approved mapping references an unapproved policy`);
      if (mapping.evidenceRefs.length === 0 || mapping.approvalIds.length === 0 || mapping.approvalIds.some((id) => !approvals.has(id) || approvals.get(id).status !== 'approved')) errors.push(`warranty ${mapping.mappingId} approved mapping lacks evidence or accepted authority`);
    }
  }
  const activeMappings = warranty.productMappings.filter((mapping) => !['expired', 'revoked', 'retired'].includes(mapping.status));
  for (let i = 0; i < activeMappings.length; i += 1) {
    for (let j = i + 1; j < activeMappings.length; j += 1) {
      if (activeMappings[i].productGid === activeMappings[j].productGid && periodsOverlap(activeMappings[i], activeMappings[j])) {
        errors.push(`warranty mappings ${activeMappings[i].mappingId} and ${activeMappings[j].mappingId} overlap Product authority`);
      }
    }
  }
}

function validateService(service, kReceipts, errors) {
  const requiredStates = ['intake', 'triage', 'remote_diagnostics', 'estimate', 'awaiting_authorization', 'repair', 'awaiting_return', 'closed', 'recovery'];
  duplicateValues(service.lifecycle.map((state) => state.stateId)).forEach((id) => errors.push(`service duplicate lifecycle identity ${id}`));
  duplicateValues(service.lifecycle.map((state) => state.name)).forEach((name) => errors.push(`service duplicate lifecycle state ${name}`));
  requiredStates.filter((name) => !service.lifecycle.some((state) => state.name === name)).forEach((name) => errors.push(`service missing lifecycle state ${name}`));
  const serviceApprovalsAccepted = service.requiredApprovals.every((approval) => approval.status === 'approved' && approvedRecordComplete(approval));
  for (const state of service.lifecycle) {
    if (state.decisionStatus === 'approved') {
      const missing = ['owner', 'entryRule', 'exitRule', 'customerMessage', 'recoveryPath'].filter((field) => !state[field]);
      if (missing.length || state.evidenceRefs.length === 0) errors.push(`service ${state.stateId} approved lifecycle is missing operational responsibility or evidence`);
      if (!serviceApprovalsAccepted) errors.push(`service ${state.stateId} approved lifecycle lacks required owner approvals`);
    }
  }
  const responsibilities = [...service.responsibilities, ...service.repairShipment.decisions];
  duplicateValues(responsibilities.map((decision) => decision.decisionId)).forEach((id) => errors.push(`service duplicate responsibility ${id}`));
  for (const decision of responsibilities) {
    if (decision.value !== null && decision.decisionStatus !== 'approved') errors.push(`service ${decision.decisionId} has an unapproved operational value`);
    if (decision.decisionStatus === 'approved' && (decision.value === null || decision.responsibleRoles.length === 0 || decision.evidenceRefs.length === 0)) errors.push(`service ${decision.decisionId} approved responsibility is incomplete`);
    if (decision.decisionStatus === 'approved' && !serviceApprovalsAccepted) errors.push(`service ${decision.decisionId} approved responsibility lacks required owner approvals`);
  }
  const acceptedKReceipts = kReceipts.receipts.filter((receipt) => receipt.requirementId === 'K-EVID-007' && receipt.status === 'accepted');
  const binding = service.repairShipment.kEvidenceBinding;
  if (binding.requirementId !== 'K-EVID-007') errors.push('service repair shipment is not bound to K-EVID-007');
  if (binding.acceptanceState === 'accepted' && acceptedKReceipts.length === 0) errors.push('service K-EVID-007 is presented as accepted without an accepted receipt');
  if (binding.acceptedReceiptIds.some((id) => !acceptedKReceipts.some((receipt) => receipt.receiptId === id))) errors.push('service K-EVID-007 references an invalid accepted receipt');
  if (service.repairShipment.decisions.some((decision) => decision.decisionStatus === 'approved') && acceptedKReceipts.length === 0) errors.push('service repair-shipment claim is approved without accepted K-EVID-007 evidence');
  for (const approval of service.requiredApprovals) {
    if (approval.status === 'approved' && !approvedRecordComplete(approval)) errors.push(`service ${approval.approvalId} approved authority is missing approver, time, or evidence`);
  }
}

function validatePrivacy(privacy, errors) {
  const requiredElements = ['contact_name', 'contact_email', 'contact_phone', 'product_identity', 'variant_identity', 'serial_number', 'purchase_evidence', 'uploads', 'diagnostics', 'service_records', 'notifications', 'audit_data'];
  duplicateValues(privacy.elements.map((element) => element.elementId)).forEach((id) => errors.push(`privacy duplicate element ${id}`));
  duplicateValues(privacy.elements.map((element) => element.name)).forEach((name) => errors.push(`privacy duplicate element name ${name}`));
  requiredElements.filter((name) => !privacy.elements.some((element) => element.name === name)).forEach((name) => errors.push(`privacy missing proposed data element ${name}`));
  const elementIds = new Set(privacy.elements.map((element) => element.elementId));
  const decisionFields = ['purpose', 'necessity', 'processor', 'owner', 'access', 'retention', 'deletionExport', 'recovery'];
  for (const element of privacy.elements) {
    for (const field of decisionFields) {
      const decision = element[field];
      if (decision.value !== null && decision.status !== 'approved') errors.push(`privacy ${element.elementId} ${field} has an unapproved value`);
      if (decision.status === 'approved' && (decision.value === null || decision.evidenceRefs.length === 0)) errors.push(`privacy ${element.elementId} ${field} approved decision is missing value or evidence`);
    }
    if (element.collectionAllowed) {
      const unresolved = decisionFields.filter((field) => element[field].status !== 'approved' || element[field].value === null || element[field].evidenceRefs.length === 0);
      if (element.collectionState !== 'approved' || unresolved.length) errors.push(`privacy ${element.elementId} permits private data without complete purpose, access, retention, and lifecycle authority`);
    }
  }
  duplicateValues(privacy.dataFlows.map((flow) => flow.flowId)).forEach((id) => errors.push(`privacy duplicate flow ${id}`));
  for (const flow of privacy.dataFlows) {
    flow.elementRefs.filter((id) => !elementIds.has(id)).forEach((id) => errors.push(`privacy ${flow.flowId} references missing element ${id}`));
    if (flow.status === 'approved' && (!flow.source || !flow.processor || !flow.destination || !flow.failureBehavior || flow.evidenceRefs.length === 0)) errors.push(`privacy ${flow.flowId} approved flow is incomplete`);
  }
  for (const approval of privacy.requiredApprovals) {
    if (approval.status === 'approved' && !approvedRecordComplete(approval)) errors.push(`privacy ${approval.approvalId} approved authority is missing approver, time, or evidence`);
  }
}

function validateAdminPlan(admin, errors) {
  duplicateValues(admin.operations.map((operation) => operation.operationId)).forEach((id) => errors.push(`admin duplicate operation ${id}`));
  const requiredDomains = ['permissions', 'shop_and_accounts', 'pages', 'files', 'policies', 'applications', 'themes', 'app_embeds', 'forms', 'flow', 'inbox', 'messaging'];
  requiredDomains.filter((domain) => !admin.operations.some((operation) => operation.domain === domain)).forEach((domain) => errors.push(`admin plan missing operation domain ${domain}`));
  if (admin.requiredPermissions.some((scope) => scope.startsWith('write_'))) errors.push('admin plan requests unauthorized write permission');
  for (const operation of admin.operations) {
    if (operation.writeOperation) errors.push(`admin ${operation.operationId} contains an unauthorized Shopify write operation`);
    if (operation.requiredScopes.some((scope) => scope.startsWith('write_'))) errors.push(`admin ${operation.operationId} requests unauthorized write scope`);
    if (operation.transport === 'admin_graphql') {
      if (!operation.queryDocument || !/^\s*query\b/.test(operation.queryDocument)) errors.push(`admin ${operation.operationId} is not an explicit read-only query`);
      if (operation.queryDocument && /\bmutation\b/i.test(operation.queryDocument)) errors.push(`admin ${operation.operationId} contains an unauthorized Shopify mutation`);
    }
    if (operation.transport === 'manual_admin_ui' && !operation.manualPath) errors.push(`admin ${operation.operationId} manual review is missing an exact Admin path`);
    if (operation.pagination.required && (!operation.pagination.connectionPath || !operation.pagination.pageSize || !/hasNextPage/i.test(operation.pagination.completionRule))) errors.push(`admin ${operation.operationId} has an incomplete pagination contract`);
  }
}

function scanForSensitiveValues(artifacts) {
  const serialized = JSON.stringify(artifacts);
  const findings = [];
  const patterns = [
    ['Shopify secret', /shpat_[A-Za-z0-9]{12,}/],
    ['private customer or order GID', /gid:\/\/shopify\/(?:Customer|Order|DraftOrder)\/[0-9]+/],
    ['email address', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
    ['serial value', /\b(?:SN|SERIAL)[-_:# ]+[A-Z0-9-]*\d[A-Z0-9-]*\b/i]
  ];
  for (const [label, pattern] of patterns) if (pattern.test(serialized)) findings.push(`sanitized evidence contains ${label}`);
  return findings;
}

function validateAuditResult(plan, result) {
  const errors = [];
  if (!result || result.status !== 'complete') errors.push('admin audit result is not explicitly complete');
  if (!result?.shop || result.shop.myshopifyDomain !== plan.target.expectedMyshopifyDomain) errors.push('admin audit result failed target shop identity verification');
  const results = new Map((result?.operations || []).map((operation) => [operation.operationId, operation]));
  for (const operation of plan.operations) {
    const observed = results.get(operation.operationId);
    if (!observed) {
      errors.push(`admin audit missing evidence for ${operation.operationId}`);
      continue;
    }
    if (observed.status !== 'complete' || !observed.evidenceRef) errors.push(`admin audit ${operation.operationId} is presented without successful evidence`);
    if (operation.pagination.required) {
      if (!Array.isArray(observed.pages) || observed.pages.length === 0) errors.push(`admin audit ${operation.operationId} pagination evidence is missing`);
      else {
        const lastPage = observed.pages[observed.pages.length - 1];
        if (lastPage.hasNextPage !== false) errors.push(`admin audit ${operation.operationId} pagination failure is presented as complete`);
        for (let index = 0; index < observed.pages.length - 1; index += 1) {
          if (observed.pages[index].hasNextPage !== true || !observed.pages[index].endCursor) errors.push(`admin audit ${operation.operationId} pagination chain is incomplete`);
        }
      }
    }
  }
  return errors;
}

function loadArtifacts(overrides = {}) {
  const loaded = {};
  for (const [name, [dataPath, schemaPath]] of Object.entries(ARTIFACTS)) {
    loaded[name] = overrides[name] || readJson(dataPath);
    loaded[`${name}Schema`] = readJson(schemaPath);
  }
  loaded.identity = overrides.identity || readJson('data/epic-e-product-identity.json');
  loaded.kReceipts = overrides.kReceipts || readJson('data/epic-k-evidence-receipts.json');
  return loaded;
}

function validateArtifacts(overrides = {}, options = {}) {
  const artifacts = loadArtifacts(overrides);
  const errors = [];
  for (const name of Object.keys(ARTIFACTS)) errors.push(...schemaErrors(name, artifacts[name], artifacts[`${name}Schema`]));
  validateAuthority(artifacts.authority, options.asOf || AS_OF, errors);
  validateWarranty(artifacts.warranty, artifacts.identity, errors);
  validateService(artifacts.service, artifacts.kReceipts, errors);
  validatePrivacy(artifacts.privacy, errors);
  validateAdminPlan(artifacts.admin, errors);
  errors.push(...scanForSensitiveValues({ authority: artifacts.authority, warranty: artifacts.warranty, service: artifacts.service, privacy: artifacts.privacy, admin: artifacts.admin }));
  return {
    errors,
    counts: {
      schemas: Object.keys(ARTIFACTS).length,
      authorityDomains: artifacts.authority.domains.length,
      warrantyDecisions: Object.keys(artifacts.warranty.decisionFields).length,
      serviceLifecycleStates: artifacts.service.lifecycle.length,
      serviceResponsibilities: artifacts.service.responsibilities.length + artifacts.service.repairShipment.decisions.length,
      privacyElements: artifacts.privacy.elements.length,
      auditOperations: artifacts.admin.operations.length
    }
  };
}

if (require.main === module) {
  const result = validateArtifacts();
  if (result.errors.length) {
    console.error(`Epic L L1A validation failed with ${result.errors.length} error(s):`);
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
  console.log(`Epic L L1A validation passed: ${result.counts.schemas} schemas, ${result.counts.authorityDomains} authority domains, ${result.counts.warrantyDecisions} warranty decisions, ${result.counts.serviceLifecycleStates} lifecycle states, ${result.counts.serviceResponsibilities} service responsibilities, ${result.counts.privacyElements} privacy elements, and ${result.counts.auditOperations} planned audit operations.`);
  console.log('Shopify Admin audit execution: NOT AUTHORIZED / NOT EXECUTED.');
}

module.exports = { ARTIFACTS, AS_OF, loadArtifacts, scanForSensitiveValues, validateArtifacts, validateAuditResult };
