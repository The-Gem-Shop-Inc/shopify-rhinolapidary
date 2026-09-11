const fs = require('fs');
const path = require('path');
const { sha256, buildDefinitionDiff } = require('./lib/epic-e-custom-data-contract');

const root = process.cwd();
const registryPath = 'data/metafield-metaobject-definitions.json';
const outputPath = 'data/epic-e-custom-data-definition-diff.json';
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  return [key, value ?? true];
}));
const asOf = args['as-of'];
if (!asOf) throw new Error('Use --as-of=YYYY-MM-DD so the dry-run diff and freshness result are deterministic.');

const registryBytes = fs.readFileSync(path.join(root, registryPath));
const registry = JSON.parse(registryBytes);
const snapshotPath = registry.adminReconciliation.snapshotPath;
const snapshotBytes = fs.readFileSync(path.join(root, snapshotPath));
const snapshot = JSON.parse(snapshotBytes);
const snapshotSha256 = sha256(snapshotBytes);
if (snapshotSha256 !== registry.adminReconciliation.snapshotSha256) throw new Error('Admin snapshot hash differs from the registry reconciliation contract.');
if (snapshot.capturedAt !== registry.adminReconciliation.capturedAt || snapshot.apiVersion !== registry.adminReconciliation.apiVersion) throw new Error('Admin snapshot identity differs from the registry reconciliation contract.');

const diff = buildDefinitionDiff(registry, snapshot, {
  asOf,
  registrySha256: sha256(registryBytes),
  snapshotSha256
});
fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(diff, null, 2)}\n`);
console.log(`Epic E E-PBI-009 dry-run definition diff built: ${diff.summary.create} create, ${diff.summary.no_op} no-op, ${diff.summary.conflict + diff.summary.incompatible_type} conflicts, ${diff.summary.desired_not_approved} deferred/non-approved; no mutation executed.`);
