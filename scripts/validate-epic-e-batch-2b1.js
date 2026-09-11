const validator = require('./validate-epic-e-batch-2b');

if (require.main === module) {
  const errors = validator.validateBatch();
  if (errors.length) {
    console.error('Epic E Batch 2B.1 validation failed.');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    const classification = validator.read(validator.files.classification[0]);
    const registry = validator.read(validator.files.registry[0]);
    const vendor = validator.read(validator.files.vendor[0]);
    console.log(`Epic E Batch 2B.1 validation passed: ${classification.statistics.byDecisionState.approved}/122 classes approved, ${registry.statistics.proposed} SKU proposals, ${registry.statistics.blocked} SKU blockers, ${classification.statistics.taxonomyBySpecificity.specific} specific taxonomy rows, and ${vendor.statistics.proposed} Vendor proposals.`);
  }
}

module.exports = validator;
