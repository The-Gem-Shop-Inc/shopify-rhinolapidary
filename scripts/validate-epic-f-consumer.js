'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const Ajv = require('ajv/dist/2020');
const { build, read, bytes, loadContext, classification, evaluate } = require('./lib/epic-f-consumer');

function validateGenerated(artifact, liquid, context = loadContext()) {
  const errors = [];
  const ajv = new Ajv({ allErrors: true, formats: { 'date-time': v => Number.isFinite(Date.parse(v)) } });
  const validate = ajv.compile(read('schemas/epic-f-consumer-release.schema.json'));
  if (!validate(artifact)) errors.push('Invalid release schema: ' + JSON.stringify(validate.errors));
  try {
    const expected = build(context);
    if (bytes(artifact) !== bytes(expected.artifact) || liquid.replaceAll('\r\n', '\n') !== expected.liquid) errors.push('Hand edited or stale generated artifact');
  } catch (e) { errors.push(e.message); }
  return errors;
}

function run() {
  const context = loadContext();
  const artifact = read('data/epic-f-consumer-release.json');
  assert.equal(fs.readFileSync('data/epic-f-consumer-release.json', 'utf8').replaceAll('\r\n', '\n'), bytes(artifact), 'Generated JSON formatting drift');
  assert.deepEqual(validateGenerated(artifact, fs.readFileSync('snippets/rhino-product-consumer-route.liquid', 'utf8'), context), []);
  const fixture = read('tests/fixtures/epic-f-consumer.json');
  const ajv = new Ajv();
  assert(ajv.validate(read('schemas/epic-f-consumer-fixtures.schema.json'), fixture), JSON.stringify(ajv.errors));
  assert.equal(classification(context, fixture.machineProductGid), 'machine');
  const owner = read('data/launch-fixture-ownership.json').fixtures.find(f => f.fixtureId === 'machineProduct');
  const storefront = read('tests/fixtures/storefront-fixtures.json').fixtures.machineProduct;
  assert(owner && owner.path === storefront.path && owner.validatedBy.includes('validate:epic-f-batch-f1'));
  assert.equal(storefront.expectedTemplate, 'product.machine');
  assert.equal(read('templates/product.machine.json').sections.main.type, 'main-product', 'F2 must reuse the F1-contained main-product');
  const states = artifact.routes.filter(r => r.productClass === 'machine').map(r => ({ productGid: r.productGid,
    ...evaluate(context, { productGid: r.productGid, domain: 'product_class', field: 'PRODUCT.metafields.rhino.product_class' }) }));
  assert(states.every(s => s.suppressed), 'F1 must not activate facts');
  const validateState = ajv.compile(read('schemas/epic-f-consumer-state.schema.json'));
  for (const { productGid, ...state } of states) assert(validateState(state), `${productGid}: ${JSON.stringify(validateState.errors)}`);
  fs.mkdirSync('test-results/epic-f', { recursive: true });
  fs.writeFileSync('test-results/epic-f/consumer-readiness.json', bytes({ assessedAt: new Date().toISOString(),
    architectureComplete: true, activationReady: false, factEligibilityExpiresAt: artifact.factEligibilityExpiresAt,
    shellOnly: true, states }));
  console.log(`F1 consumer valid: ${states.length} machines, zero grants, shell only; live fact eligibility remains blocked.`);
}
if (require.main === module) run();
module.exports = { validateGenerated, run };
