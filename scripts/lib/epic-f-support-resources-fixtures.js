'use strict';
// Synthetic review records only. Approvals live in F's existing ephemeral WeakMap.
const fs = require('node:fs');
const consumer = require('./epic-f-consumer');
const base = require('./epic-f-machine-fixtures');
const { createFixture } = require('./epic-f-fact-fixtures');
const { projectSupportResources } = require('./epic-f-support-resources');
const asOf = '2026-09-18T12:00:00.000Z', expiresAt = '2026-09-18T13:00:00.000Z';
const machine = 'gid://shopify/Product/8905779937477';
const authority = id => ({ approvalDecisionId: 'fixture:' + id, state: 'approved', audience: 'customer', lifecycle: 'current', activation: 'fixture-only', sourceIds: ['fixture:review-source'], effectiveAt: asOf, expiresAt, conflictIds: [] });
const destination = (identity, route) => ({ requestedRoute: route, resolvedRoute: route, status: 200, identity, environment: 'local-fixture', observedAt: asOf, expiresAt });
function warranty() {
  const approvalDecisionId = 'fixture:warranty';
  const roles = { marketedBrand: 'Rhino Lapidary (synthetic role fixture)', manufacturer: 'Synthetic Other Manufacturer', warrantyIssuer: 'Synthetic Issuer', warrantyAdministrator: 'Synthetic Administrator', repairProvider: 'Synthetic Repair Organization' };
  return { ...authority('warranty'), recordId: 'fixture:warranty', productGid: machine, marketedBrand: roles.marketedBrand, manufacturer: roles.manufacturer,
    policy: { policyId: 'fixture:policy', revision: 'synthetic-r1', effectiveFrom: asOf, effectiveTo: expiresAt, lifecycle: 'current', sourceIds: ['fixture:review-source'], sourceSha256: consumer.hash('Synthetic policy evidence; not historic or current warranty terms'), resourceId: 'fixture:policy-resource', nativePolicyGid: null, issuer: roles.warrantyIssuer, administrator: roles.warrantyAdministrator, repairProvider: roles.repairProvider, roleEvidence: Object.entries(roles).map(([role, entity]) => ({ role, entity, sourceIds: ['fixture:role-' + role] })), approvalDecisionId },
    class: { classId: 'fixture:class', policyId: 'fixture:policy', policyRevision: 'synthetic-r1', durationValue: 17, durationUnit: 'months', trigger: 'Synthetic acceptance event', exclusions: ['Synthetic exclusion for fixture review'], approvalDecisionId },
    mapping: { productGid: machine, classId: 'fixture:class', exceptions: ['Synthetic Product exception'], approvalDecisionId },
    destination: { ...destination('fixture:policy-resource', '/fixture-support/warranty'), purpose: 'warranty' } };
}
function resource(type = 'manual', index = 0) {
  const id = type + '-' + index;
  return { ...authority(id), recordId: 'fixture:' + id, productGid: machine, resourceId: 'fixture:resource-' + id, fileIdentity: 'fixture:file:' + id, canonicalIdentity: 'fixture:canonical-' + id, configurationId: null, resourceType: type, status: 'current', visibility: 'customer', canonical: true, ownerApproved: true, rightsApproved: true, publicationApproved: true, languageReviewed: true, versionReviewed: true, sourceRole: 'customer_resource', language: 'en', version: 'synthetic-r1', applicableProductGids: [machine], title: 'Synthetic ' + type + ' guide ' + (index + 1),
    destination: { ...destination('fixture:resource-' + id, '/fixture-downloads/' + id + '.pdf'), fileIdentity: 'fixture:file:' + id },
    video: type === 'video' ? { productSurfaceApproved: true, autoplay: false, eagerProvider: false, posterIdentity: null, posterApproved: false, captionsReviewed: true, transcriptReviewed: true, width: 960, height: 540, embedUrl: 'http://video.fixture.invalid/embed/synthetic-resource?autoplay=0' } : null };
}
function supportFixture(state = 'combined', options = {}) {
  const f = createFixture('zero');
  const packet = { schemaVersion: 1, machineProductGid: machine, warranty: [], resources: [] };
  if (['support', 'combined', 'long', 'no-destination'].includes(state)) packet.warranty.push(warranty());
  if (['downloads', 'combined', 'long'].includes(state)) packet.resources.push(resource('manual'), resource('diagram'), resource('instruction'));
  if (['video', 'combined', 'long'].includes(state)) packet.resources.push(resource('video'));
  if (state === 'one') packet.resources.push(resource());
  if (state === 'no-destination') packet.warranty[0].destination = null;
  if (state === 'long') {
    const w = packet.warranty[0], text = 'SyntheticLongOrganization'.repeat(17);
    for (const [key, role] of [['issuer', 'warrantyIssuer'], ['administrator', 'warrantyAdministrator'], ['repairProvider', 'repairProvider']]) { w.policy[key] = text; w.policy.roleEvidence.find(e => e.role === role).entity = text; }
    for (const r of packet.resources) r.title = 'SyntheticResourceTitle'.repeat(22);
  }
  if (options.sameEntity && packet.warranty.length) {
    const w = packet.warranty[0];
    for (const [key, role] of [['issuer', 'warrantyIssuer'], ['administrator', 'warrantyAdministrator'], ['repairProvider', 'repairProvider']]) {
      w.policy[key] = 'Synthetic Shared Entity'; w.policy.roleEvidence.find(e => e.role === role).entity = w.policy[key];
    }
  }
  const input = structuredClone(require('../../data/epic-e-batch-3c-owner-decisions.json'));
  const upstream = { products: [{ id: machine }], variants: [], resources: { resources: [] }, nativePolicies: [], evidenceIds: new Set(['fixture:review-source']), brandByGid: { [machine]: 'Rhino Lapidary' }, supportedCountries: [], supportedSubdivisions: [] };
  for (const w of packet.warranty) {
    w.policy.approvalDecisionId = 'fixture:policy-approval';
    w.class.approvalDecisionId = 'fixture:class-approval';
    w.mapping.approvalDecisionId = 'fixture:mapping-approval';
    const policy = { ...structuredClone(w.policy), explicitRoleEquality: options.sameEntity === true || state === 'long', supersededBy: null, roleEvidence: {} };
    for (const e of w.policy.roleEvidence) for (const id of e.sourceIds) upstream.evidenceIds.add(id);
    for (const [key, role] of [['issuer', 'warrantyIssuer'], ['administrator', 'warrantyAdministrator'], ['repairProvider', 'repairProvider']]) policy.roleEvidence[key] = [...w.policy.roleEvidence.find(e => e.role === role).sourceIds];
    input.policyVersions.push(policy);input.warrantyClasses.push(structuredClone(w.class));input.warrantyMappings.push({ ...structuredClone(w.mapping), thirdPartyResponsibilityConfirmed: true });
    for (const [decisionId, kind, subjectId, ownerRoles] of [
      [w.policy.approvalDecisionId, 'policy', w.policy.policyId, ['Legal/Business', 'Support']],
      [w.class.approvalDecisionId, 'warranty_class', w.class.classId, ['Legal/Business', 'Product Owner']],
      [w.mapping.approvalDecisionId, 'warranty_mapping', machine, ['Legal/Business', 'Product Owner']]
    ]) input.approvals.push({ decisionId, kind, subjectId, decisionState: 'approved', sourceIds: ['fixture:review-source'], approvedAt: asOf, ownerRoles });
    upstream.resources.resources.push({ resourceId: w.policy.resourceId, contentHash: w.policy.sourceSha256, canonical: true, status: 'current', supersededBy: null, resourceType: 'instruction', visibility: 'customer', publicationApproved: true, rights: 'approved', sourceRole: 'customer_resource' });
  }
  f.context.operationalInput = input;f.context.operationalContext = upstream;
  const page = { language: 'en', configurationId: null };
  options.mutate?.({ packet, context: f.context, page });
  consumer.simulateFixtureApprovals(f.context, [...packet.warranty, ...packet.resources]);
  options.afterApproval?.({ packet, context: f.context, page });
  return { ...f, packet, page, asOf, projection: projectSupportResources(f.context, packet, options.asOf || asOf, page) };
}
function supportDocument(state = 'combined', options = {}) {
  const f = options.fixture || supportFixture(state, options), ctx = base.contextFor('tracked-available');
  ctx.request.host = 'machine.local'; ctx.fixture_support_resources = f.projection;
  options.adversarial?.(ctx);
  const gate = `{% if request.host == 'machine.local' and fixture_support_resources.fixture_only %}{% assign fixture_gid = 'gid://shopify/Product/' | append: product.id %}{% if fixture_gid == fixture_support_resources.product_gid %}{% render 'rhino-machine-support', projection: fixture_support_resources %}{% render 'rhino-machine-resources', projection: fixture_support_resources %}{% endif %}{% endif %}`;
  const engine = base.engine(ctx, {}, options.allowFixtures === false ? {} : { 'rhino-product-support-resources-projection.liquid': gate });
  const body = engine.parseAndRenderSync(base.normalize(fs.readFileSync('sections/main-product.liquid', 'utf8')), ctx);
  return base.documentFor('tracked-available').replace(/<main id="MainContent">[\s\S]*?<\/main>/, `<main id="MainContent">${body}</main>`);
}
module.exports = { supportFixture, supportDocument, warranty, resource, asOf, expiresAt, machine };
