'use strict';
// A bounded executor contract for this exact definition plan. No general approval bypass.
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { buildDefinitionDiff } = require('./epic-e-custom-data-contract');
const INPUT = 'data/epic-e-migration-plans/E-MUT-020-definitions-input.json';
const INPUT_SHA = 'c211f7c6258eedea6eed7d0ce64bb9272c70160f91d11b08e770474f2cd43edb';
const AUTH = 'docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-execution-authorization.json';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = path => JSON.parse(fs.readFileSync(path));
function authorize(record = read(AUTH), bundle = read(INPUT)) {
  assert.equal(hash(fs.readFileSync(INPUT)), INPUT_SHA, 'Deterministic input drift');
  assert.equal(record.planId, 'E-MUT-020');
  assert.equal(bundle.planId, 'E-MUT-020');
  assert.equal(bundle.domain, 'definitions');
  assert.equal(record.approvalMode, 'delegated_development_override');
  assert.equal(record.inputSha256, INPUT_SHA);
  assert.equal(record.approvalDate, '2026-10-05');
  assert.equal(record.productOwnerDecision, 'GO — all seven structural groups / all 38 definition rows approved without exceptions');
  assert.equal(record.delegatedAuthorityOverride.explicit, true);
  assert.equal(record.shop.id, 'gid://shopify/Shop/79279947973');
  assert.equal(record.shop.domain, 'sz5dnk-nf.myshopify.com');
  assert.deepEqual(record.authorizedMutations, ['metafieldDefinitionCreate', 'metaobjectDefinitionCreate']);
  assert.equal(bundle.rows.length, 38);
  for (const ref of bundle.inputs) assert.equal(hash(fs.readFileSync(ref.path)),ref.sha256,'Authority drift: '+ref.path);
  assert.equal(new Set(bundle.rows.map(r => r.rowId)).size, 38);
  for (const row of bundle.rows) {
    assert.equal(row.domain, 'definitions');
    assert.equal(row.kind, 'definition');
    assert.equal(row.valueState, 'approved');
    assert.equal(row.desiredContract.decisionState, 'approved');
    assert.ok(['metafieldDefinition', 'metaobjectDefinition'].includes(row.field));
    assert.ok(['PRODUCT', 'METAOBJECT'].includes(row.desiredContract.ownerType));
  }
  return bundle;
}
function validations(contract, ids) {
  return (contract.validationRules || []).filter(r => r.enforcement !== 'repository').map(r => {
    if (r.enforcement === 'mutation_plan_resolution') {
      assert.equal(r.name, 'metaobject_type');
      assert.equal(r.value, 'machine_family');
      assert.match(ids['CD-MO-001'] || '', /^gid:\/\/shopify\/MetaobjectDefinition\/\d+$/);
      return { name: 'metaobject_definition_id', value: ids['CD-MO-001'] };
    }
    assert.equal(r.enforcement, 'shopify_definition');
    return { name: r.name, value: typeof r.value === 'string' ? r.value : JSON.stringify(r.value) };
  });
}
function mutationInput(row, ids = {}) {
  const c = row.desiredContract;
  // Merchant-owned identities have Shopify-owned PUBLIC_READ_WRITE Admin access.
  // App-only Admin/customer inputs cannot be specified for these identities.
  assert.equal(c.accessIntent.admin, 'merchant_read_write');
  const access = { storefront: c.accessIntent.storefront.toUpperCase() };
  if (row.field === 'metaobjectDefinition') return {
    type: c.type, name: c.name, description: c.description, displayNameKey: c.displayNameKey, access,
    capabilities: { publishable: { enabled: c.capabilities.publishable }, translatable: { enabled: c.capabilities.translatable } },
    fieldDefinitions: c.fields.map(f => ({ key: f.key, name: f.name, description: f.description, required: f.required, type: f.type, validations: validations(f, ids) }))
  };
  assert.equal(row.field, 'metafieldDefinition');
  return { ownerType: c.ownerType, namespace: c.namespace, key: c.key, name: c.name, description: c.description, type: c.type, access, validations: validations(c, ids) };
}
function classify(snapshot, bundle = authorize()) {
  for (const name of ['productMetafieldDefinitions', 'variantMetafieldDefinitions', 'collectionMetafieldDefinitions', 'metaobjectDefinitions', 'products', 'variants', 'machineFamilies']) {
    const d = snapshot.datasets[name];
    assert.equal(d.queryStatus, 'success', 'Incomplete fresh read: ' + name);
    assert.equal(d.errorCount, 0);
    assert.equal(d.recordCount, d.records.length);
  }
  assert.equal(snapshot.shopDomain, 'sz5dnk-nf.myshopify.com');
  assert.equal(snapshot.errors.length, 0);
  assert.ok(Date.now() - Date.parse(snapshot.capturedAt) < 24 * 60 * 60 * 1000, 'Stale compare-before-write');
  const registry = read('data/metafield-metaobject-definitions.json');
  const diff = buildDefinitionDiff(registry, snapshot, { asOf: new Date().toISOString().slice(0, 10) });
  return bundle.rows.map(row => {
    const e = diff.entries.find(e => e.definitionId === row.definitionId);
    assert.ok(e);
    return { rowId: row.rowId, identity: row.desiredContract.resourceKind === 'metaobject' ? 'METAOBJECT:' + row.desiredContract.type : `${row.desiredContract.ownerType}:${row.desiredContract.namespace}.${row.desiredContract.key}`,
      beforeState: e.action === 'create' ? 'ABSENT' : e.action === 'no_op' ? 'EXACT_MATCH' : 'CONFLICT', existingGid: e.currentDefinitionId, differences: e.differences };
  });
}
module.exports = { INPUT, INPUT_SHA, AUTH, authorize, mutationInput, classify, hash };
