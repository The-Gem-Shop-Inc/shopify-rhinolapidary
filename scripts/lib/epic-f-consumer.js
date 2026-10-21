'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const { domains } = require('./epic-e-migration-domains');
const { assessAdmin, verifyAfterPlan } = require('./epic-e-readiness');

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const bytes = value => JSON.stringify(value, null, 2) + '\n';
const digest = value => hash(JSON.stringify(value ?? null));
// Ephemeral upstream approval simulation, never serialized or admitted by build().
// The same E migration, reconciliation, classification and audience gates still run.
const fixtureApprovals = new WeakMap();
const ownerAuthorities = new WeakMap();
function simulateFixtureApprovals(context, rows) {
  if (context.fixtureOnly !== true) throw new Error('Only repository fixtures may simulate upstream approvals');
  fixtureApprovals.set(context, new Set(rows.filter(r => /^fixture:/.test(r.approvalDecisionId || '')).map(r => digest(r))));
  return context;
}
const paths = {
  classification: 'data/epic-e-product-classification.json',
  identity: 'data/epic-e-product-identity.json',
  decisions: 'data/epic-e-product-owner-decisions.json',
  registry: 'data/metafield-metaobject-definitions.json',
  readiness: 'data/epic-e-downstream-readiness.json',
  admin: 'data/epic-e-admin-readiness.json',
  migration: 'data/epic-e-migration-readiness.json',
  deferred: 'data/epic-e-deferred-decision-handoff.json',
};

function loadContext(options = {}) {
  const context = Object.fromEntries(Object.entries(paths).map(([key, p]) => [key, read(p)]));
  const sources = new Set([...Object.values(paths), 'scripts/lib/epic-e-migration-domains.js']);
  context.bundles = {};
  context.plans = {};
  context.after = {};
  context.before = {};
  context.definitionDiffs = {};
  context.receiptsCurrent = {};
  for (const d of domains) {
    const base = `data/epic-e-migration-plans/E-MUT-${String(d.code).padStart(3, '0')}-${d.key}`;
    context.bundles[d.key] = read(base + '-input.json');
    context.plans[d.key] = read(base + '.json');
    sources.add(base + '-input.json');
    sources.add(base + '.json');
    const plan = context.plans[d.key];
    // Only Epic E's hashed after-state artifacts can establish reconciliation.
    const refs = [plan.currentReadSnapshot, plan.afterSnapshot, plan.driftValidation.expectedArtifact];
    const valid = refs.every(r => r.sha256 && fs.existsSync(r.path) && hash(fs.readFileSync(r.path)) === r.sha256);
    context.receiptsCurrent[d.key] = valid;
    if (valid) {
      refs.forEach(r => sources.add(r.path));
      context.before[d.key] = read(plan.currentReadSnapshot.path);
      context.after[d.key] = read(plan.afterSnapshot.path);
      context.definitionDiffs[d.key] = read(plan.driftValidation.expectedArtifact.path).definitionDiff;
    }
  }
  // Keep the full upstream provenance chain, including dated evidence. No F facts registry.
  for (const input of [...context.readiness.inputs, ...context.migration.inputs]) sources.add(input.path);
  context.provenance = [...sources].sort().map(p => {
    const raw = fs.readFileSync(p);
    let version = 'source';
    if (p.endsWith('.json')) {
      const data = JSON.parse(raw);
      version = String(data.registryVersion || data.schemaVersion || data.schema_version || 'unversioned');
    }
    return { path: p, version, sha256: hash(raw) };
  });
  const upstreamBindings = [...context.readiness.inputs, ...context.migration.inputs,
    ...Object.values(context.bundles).flatMap(b => b.inputs),
    ...Object.values(context.plans).flatMap(p => [p.deterministicInput, p.currentReadSnapshot])];
  context.inputsCurrent = upstreamBindings.every(r =>
    fs.existsSync(r.path) && hash(fs.readFileSync(r.path)) === r.sha256);
  context.fixtureOnly = false;
  // Explicit current-customer context; historical shell/fixture builders remain
  // separate and cannot accidentally consume live approvals.
  if(options.ownerResponses===true){
    const H=require('./epic-f-owner-activation-binding');H.verify();
    const state=require('./epic-e-final-owner-delta').loadCurrent();
    ownerAuthorities.set(context,state);
    for(const domain of new Set(state.input.rows.map(r=>r.domain)))context.bundles[domain].rows=structuredClone(state.input.rows.filter(r=>r.domain===domain));
  }
  return context;
}

function classification(context, productGid) {
  if (!/^gid:\/\/shopify\/Product\/[0-9]+$/.test(productGid)) return null;
  const mappings = context.classification.mappings.filter(m => m.productGid === productGid);
  const ids = context.identity.productIdentities.filter(m => m.productGid === productGid);
  if (mappings.length !== 1 || ids.length !== 1) return null;
  const m = mappings[0];
  const decisions = context.decisions.decisions.productClass;
  const override = decisions.overrides.find(d => d.productGid === productGid);
  const approval = override || decisions.bulkApproval;
  if (m.classDecisionState !== 'approved' || approval.decisionState !== 'approved' ||
      m.approvalDecisionId !== approval.decisionId ||
      (override && override.productClass !== m.proposedProductClass) ||
      (!override && m.evidenceProposedProductClass !== m.proposedProductClass)) return null;
  return m.proposedProductClass;
}

// Consumes Epic E plan rows, registry definitions, approvals and after-state evidence.
// Callers never supply an F approval boolean or a live nonblank value as authority.
function evaluate(context, { productGid, domain, field }, asOf = new Date().toISOString()) {
  if(context.fixtureOnly!==true&&ownerAuthorities.has(context))return evaluateOwnerRow(context,{productGid,domain,field},asOf);
  const d = domains.find(d => d.key === domain && d.consumers.includes('F'));
  const key = field?.split('.metafields.')[1];
  const definition = context.registry.metafields.find(f => `${f.namespace}.${f.key}` === key && f.ownerType === 'PRODUCT');
  const readiness = context.readiness.rows.find(r => r.consumer === 'F' && r.domain === domain);
  const bundle = context.bundles[domain];
  const plan = context.plans[domain];
  const rows = (bundle?.rows || []).filter(r => r.targetGid === productGid && r.field === field && r.domain === domain);
  const row = rows.length === 1 ? rows[0] : null;
  const after = context.after[domain];
  const live = after?.datasets.products?.records.find(p => p.id === productGid)?.metafields?.nodes
    .filter(m => `${m.namespace}.${m.key}` === key) || [];
  const subjectClass = classification(context, productGid);
  const permittedSubject = domain === 'compatibility'
    ? ['replacement_part', 'consumable', 'accessory'].includes(subjectClass) : subjectClass === 'machine';
  const architectureSupported = !!(d?.fieldAllowlist.includes(field) && definition?.decisionState === 'approved' &&
    definition.applicability.productClasses.includes(domain === 'compatibility' ? subjectClass : 'machine') && readiness?.architecture_ready);
  const sourceValuePresent = row?.desired !== undefined && row.desired !== null && row.desired !== '';
  // E's only approved Product-metafield population adapter today is product_class.
  // New domains require an E-owned exact value adapter; a hand-edited plan is not approval.
  const mapping = context.classification.mappings.find(m => m.productGid === productGid);
  const approved = !!(row && sourceValuePresent && row.valueState === 'approved' && row.approvalDecisionId && !row.conflictIds?.length &&
    ((domain === 'product_class' && row.desired === classification(context, productGid) && row.approvalDecisionId === mapping?.approvalDecisionId) ||
      (context.fixtureOnly === true && fixtureApprovals.get(context)?.has(digest(row)))));
  const audiencePermitted = definition?.accessIntent.storefront === 'public_read';
  const adminAssessment = after ? assessAdmin(after, asOf, true) : null;
  const current = !!(context.inputsCurrent && context.receiptsCurrent[domain] && adminAssessment?.currentReconciliationUsable &&
    Date.parse(asOf) < Date.parse(adminAssessment.expiresAt));
  const migratedReconciled = !!(current && plan?.executionStatus === 'completed' && plan.driftValidation.status === 'passed' &&
    live.length === 1 && live[0].type === definition?.type && digest(live[0].jsonValue) === digest(row?.desired) &&
    context.before[domain] && verifyAfterPlan(bundle, context.before[domain], after,
      context.definitionDiffs[domain] || { entries: [] }).matchesExpectedState);
  const activationAuthorized = !!(plan?.approvals && ['Product Owner', 'Shopify Admin Owner'].every(role =>
    plan.approvals.some(a => a.role === role && a.granted && a.evidence && Number.isFinite(Date.parse(a.recordedAt)) &&
      Date.parse(a.recordedAt) <= Date.parse(after?.capturedAt))) &&
    readiness?.safe_for_customer_fact_rendering && !readiness.value_blocked &&
    !readiness.admin_mutation_required && !readiness.admin_reconciliation_required);
  const machine = permittedSubject;
  const eligible = machine && architectureSupported && sourceValuePresent && approved &&
    audiencePermitted && current && migratedReconciled && activationAuthorized;
  const reasons = Object.entries({ wrong_product_or_class: !machine, wrong_field_or_domain: !architectureSupported,
    missing_value: !sourceValuePresent, missing_approval: !approved, audience_denied: !audiencePermitted,
    stale_eligibility: !current, migration_unverified: !migratedReconciled, activation_unauthorized: !activationAuthorized,
    fixture_only: context.fixtureOnly }).filter(([, failed]) => failed).map(([reason]) => reason);
  return { schemaVersion: 1, valueState: row?.valueState || (live.length ? 'unauthorized_live' : 'missing'),
    architectureSupported, sourceValuePresent, approved, migratedReconciled, current,
    audiencePermitted, activationAuthorized, fixtureOnly: context.fixtureOnly,
    eligible, suppressed: !eligible || context.fixtureOnly, reasons };
}

function evaluateOwnerRow(context,{productGid,domain,field},asOf){
 const E=require('./epic-e-owner-response-adapter'),state=ownerAuthorities.get(context),F=require('./epic-f-customer-release'),key=field?.split('.').pop();
 const row=state.input.rows.find(r=>r.targetGid===productGid&&r.domain===domain&&r.field===field),def=E.definition(key),d=domains.find(d=>d.key===domain),cls=classification(context,productGid);
 const subject=domain==='compatibility'?['replacement_part','consumable','accessory'].includes(cls):cls==='machine';
 const supported=!!(subject&&def?.decisionState==='approved'&&d?.fieldAllowlist.includes(field)),present=!!row;
 const audience=def?.accessIntent.storefront==='public_read';
 const current=Date.parse(asOf)>=Date.parse(state.receipt.reconciledAt)&&Date.parse(asOf)<Date.parse(state.receipt.expiresAt)&&E.hash(fs.readFileSync(state.input.source.path))===state.input.source.sha256;
 const approved=!!row&&require('./epic-e-final-owner-delta').ownerRowApproved(row,state.input);
 const actual=state.products.find(p=>p.id===productGid),reconciled=!!row&&require('./epic-e-final-owner-delta').compareRow(row,actual).state==='EXACT';
 const exposed=!!row&&F.eligibleRows(state).some(r=>r.rowId===row.rowId),eligible=!!(supported&&present&&audience&&current&&approved&&reconciled&&exposed);
 const reasons=Object.entries({wrong_product_or_class:!subject,wrong_field_or_domain:!supported,missing_value:!present,missing_approval:!approved,audience_denied:!audience,stale_eligibility:!current,migration_unverified:!reconciled,incomplete_customer_range:!exposed}).filter(([,bad])=>bad).map(([reason])=>reason);
 return {schemaVersion:1,valueState:row?'approved':'missing',architectureSupported:supported,sourceValuePresent:present,approved,migratedReconciled:reconciled,current,audiencePermitted:audience,activationAuthorized:approved,fixtureOnly:false,eligible,suppressed:!eligible,reasons};
}

function build(context = loadContext()) {
  if (!context.inputsCurrent || context.fixtureOnly) throw new Error('Stale upstream inputs or repository fixture cannot build a release artifact');
  const upstreamErrors = require('../validate-epic-e-batch-2b').validateBatch({
    classification: context.classification, identity: context.identity, decisions: context.decisions,
  });
  if (upstreamErrors.length) throw new Error('Epic E identity/approval validation failed: ' + upstreamErrors.join('; '));
  const routes = context.classification.mappings.map(m => ({ productGid: m.productGid,
    productClass: classification(context, m.productGid) })).sort((a, b) => a.productGid.localeCompare(b.productGid));
  if (routes.some(r => !r.productClass) || new Set(routes.map(r => r.productGid)).size !== routes.length) throw new Error('Invalid exact classification/identity');
  const artifact = { schemaVersion: 1, contract: 'epic-f-batch-f1', provenance: context.provenance,
    fixtureOnly: false, mode: 'shell_only', factEligibilityExpiresAt: context.admin.expiresAt,
    routes, grants: [] };
  // F1 has no fact renderer. Future E closure must be integrated and tested before extending this format.
  const groups = ['machine', 'replacement_part', 'consumable', 'accessory'].map(c => {
    const ids = routes.filter(r => r.productClass === c).map(r => `'${r.productGid}'`).join(', ');
    return `    when ${ids}\n      echo '${c}'`;
  }).join('\n');
  const liquid = `{%- comment -%}\nGenerated by build:epic-f-consumer. Routing only; no fact or media authorization.\nArtifact SHA256: ${hash(bytes(artifact))}\nRevocation: validate:epic-f-batch-f1 before release; unknown IDs remain contained.\n{%- endcomment -%}\n{%- liquid\n  assign product_gid = 'gid://shopify/Product/' | append: product.id\n  case product_gid\n${groups}\n    else\n      echo 'unclassified'\n  endcase\n-%}\n`;
  return { artifact, liquid };
}

function buildFactProjection(context = loadContext()) {
  const { artifact } = build(context);
  if (artifact.grants.length) throw new Error('Live fact activation requires separately approved Epic E adapters and F-PBI-006B/F-PBI-007B integration');
  const base=`{%- comment -%}\nGenerated from the F consumer. Zero customer fact grants; no specification or contents activation.\nConsumer SHA256: ${hash(bytes(artifact))}\n{%- endcomment -%}\n{%- assign rhino_fact_projection = nil -%}\n{%- render 'rhino-machine-specifications', projection: rhino_fact_projection -%}\n{%- render 'rhino-machine-contents', projection: rhino_fact_projection -%}\n`;
  if(require('./epic-f-owner-activation-binding').active()){require('./epic-f-owner-activation-binding').verify();return base+"\n{%- comment -%}Bounded current-owner release; exact E reconciliation remains separate from historical fixture architecture.{%- endcomment -%}\n{%- render 'rhino-owner-approved-facts', product: product, section: section -%}\n";}
  return base;
}
// No deployed E adapter exists for these repository projections. Reuse the
// existing ephemeral fixture boundary, never a second customer approval store.
function evaluateProjectionRecord(context, record, asOf) {
  const approved = context.fixtureOnly === true && context.inputsCurrent === true &&
    fixtureApprovals.get(context)?.has(digest(record));
  return !!(approved && record.state === 'approved' && record.audience === 'customer' &&
    record.lifecycle === 'current' && record.activation === 'fixture-only' &&
    record.sourceIds?.length && record.sourceIds.every(id => /^fixture:/.test(id)) &&
    !record.conflictIds?.length && Number.isFinite(Date.parse(asOf)) &&
    Date.parse(record.effectiveAt) <= Date.parse(asOf) && Date.parse(asOf) < Date.parse(record.expiresAt));
}
function buildContextDeliveryProjection(context = loadContext()) {
  const { artifact } = build(context);
  if (artifact.grants.length) throw new Error('F-PBI-008B/009B requires separately approved activation');
  const base=`{%- comment -%}\nGenerated from the F consumer. Zero contextual and operational grants.\nConsumer SHA256: ${hash(bytes(artifact))}\n{%- endcomment -%}\n{%- assign rhino_context_delivery = nil -%}\n{%- render 'rhino-machine-contextual', projection: rhino_context_delivery -%}\n{%- render 'rhino-machine-delivery', projection: rhino_context_delivery -%}\n`;
  if(require('./epic-f-owner-activation-binding').active()){require('./epic-f-owner-activation-binding').verify();return base+"\n{%- comment -%}Bounded current-owner release; exact E reconciliation remains separate from historical fixture architecture.{%- endcomment -%}\n{%- render 'rhino-owner-approved-context', product: product, section: section -%}\n";}
  return base;
}
function buildSupportResourcesProjection(context = loadContext()) {
  const { artifact } = build(context);
  if (artifact.grants.length) throw new Error('F-PBI-010B/011B requires separately approved activation');
  return `{%- comment -%}\nGenerated from the F consumer. Zero warranty/service/resource grants.\nConsumer SHA256: ${hash(bytes(artifact))}\nB3C-D03 blocked; B3B-D06 pending. Fixture approvals cannot ship.\n{%- endcomment -%}\n{%- assign rhino_support_resources = nil -%}\n{%- render 'rhino-machine-support', projection: rhino_support_resources -%}\n{%- render 'rhino-machine-resources', projection: rhino_support_resources -%}\n`;
}
module.exports = { read, hash, bytes, paths, loadContext, classification, evaluate, build, simulateFixtureApprovals, buildFactProjection, evaluateProjectionRecord, buildContextDeliveryProjection, buildSupportResourcesProjection };
