'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createB07ResourceAdminSystem } = require('./lib/epic-l-policy2/resource-admin-fixture');

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const archivePath = argument('--archive');
const outputPath = argument('--output');
const apply = process.argv.includes('--apply');

if (!archivePath) {
  process.stderr.write('Usage: node scripts/enrich-epic-l-policy2-resources.js --archive <registry.json> [--apply --output <new-registry.json>]\n');
  process.exit(2);
}
if (apply && !outputPath) {
  process.stderr.write('--apply requires a separate --output path. The source archive is never overwritten.\n');
  process.exit(2);
}

const source = path.resolve(archivePath);
const output = outputPath ? path.resolve(outputPath) : null;
if (output && output === source) {
  process.stderr.write('The enriched archive must use a different path from the source archive.\n');
  process.exit(2);
}

const rootDir = path.resolve(__dirname, '..');
const system = createB07ResourceAdminSystem({ rootDir, importB05: false });
const archive = JSON.parse(fs.readFileSync(source, 'utf8'));
system.administration.importRegistry({
  actor: system.actors.productOwner,
  commandId: 'B07C_CLI_ARCHIVE_IMPORT',
  archive,
  replaceExisting: false,
});
const preview = system.administration.previewEnrichment();

if (!apply) {
  process.stdout.write(`${JSON.stringify({
    archive: source,
    resources: preview.length,
    suggestedValues: preview.reduce((sum, item) => sum + item.suggestions.length, 0),
    preview,
    sourceArchiveModified: false,
    liveProviderRequests: 0,
  }, null, 2)}\n`);
  process.exit(0);
}

system.administration.applyEnrichment({ actor: system.actors.productOwner, commandId: 'B07C_CLI_ENRICHMENT_APPLY' });
const enriched = system.administration.exportRegistry({ actor: system.actors.productOwner });
system.administration.validateArchive(enriched);
fs.writeFileSync(output, `${JSON.stringify(enriched, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
process.stdout.write(`${JSON.stringify({
  sourceArchive: source,
  outputArchive: output,
  resources: enriched.resources.length,
  archiveDigest: enriched.archiveDigest,
  sourceArchiveModified: false,
  liveProviderRequests: 0,
}, null, 2)}\n`);
