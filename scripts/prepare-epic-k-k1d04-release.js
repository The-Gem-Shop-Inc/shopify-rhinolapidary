'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'data/epic-k-k1d04p-release-manifest.json');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function readJson(file) {
  const source = fs.readFileSync(file, 'utf8').replace(/^\uFEFF?\s*\/\*[\s\S]*?\*\/\s*/, '');
  return JSON.parse(source);
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeCartDrawer(live) {
  const taxPattern = /<small class="tax-note caption-large rte">[\s\S]*?<\/small>/;
  const checkoutPattern = /<button\s+type="submit"\s+id="CartDrawer-Checkout"[\s\S]*?<\/button>/;
  assert.equal((live.match(new RegExp(taxPattern.source, 'g')) || []).length, 1, 'Expected one live cart-drawer tax note.');
  assert.equal((live.match(new RegExp(checkoutPattern.source, 'g')) || []).length, 1, 'Expected one live cart-drawer checkout button.');
  const withQuoteNote = live.replace(taxPattern, `<small class="tax-note caption-large rte">
            {{ 'sections.cart.quote_mode.merchandise_total_note' | t }}
          </small>`);
  return withQuoteNote.replace(checkoutPattern, `<a href="{{ routes.cart_url }}" class="cart__checkout-button button">
            {{ 'sections.cart.quote_mode.review_delivery_options' | t }}
          </a>`);
}

function mergeEnglishLocale(live, repository) {
  const result = clone(live);
  assert.ok(repository.sections?.cart?.quote_mode, 'Repository English quote-mode copy is missing.');
  result.sections ||= {};
  result.sections.cart ||= {};
  result.sections.cart.quote_mode = clone(repository.sections.cart.quote_mode);
  return result;
}

function mergeSettingsSchema(live) {
  const result = clone(live);
  const existing = result.flatMap((group) => group.settings || [])
    .filter((setting) => setting.id === 'rhino_quote_draft_automation_enabled');
  assert.equal(existing.length, 0, 'Live settings schema already contains the K1D automation setting; refresh the baseline.');
  const group = result.find((candidate) => (candidate.settings || []).some((setting) => setting.id === 'show_cart_note'));
  assert.ok(group, 'Live settings schema has no show_cart_note anchor.');
  const index = group.settings.findIndex((setting) => setting.id === 'show_cart_note');
  group.settings.splice(index + 1, 0, {
    type: 'checkbox',
    id: 'rhino_quote_draft_automation_enabled',
    label: 'Enable Rhino Draft Order quotation submission',
    info: 'Keep disabled unless the theme is approved for the authenticated Rhino quotation app proxy.',
    default: false,
  });
  return result;
}

function mergeSettingsData(live) {
  const result = clone(live);
  assert.ok(result.current && typeof result.current === 'object', 'Live settings_data current object is missing.');
  assert.equal(Object.hasOwn(result.current, 'rhino_quote_draft_automation_enabled'), false,
    'Live automation key already exists; refresh and review the baseline.');
  result.current.rhino_quote_draft_automation_enabled = true;
  return result;
}

function parseArgs(argv) {
  const values = {};
  for (const arg of argv) {
    const match = arg.match(/^--([^=]+)=(.+)$/);
    if (match) values[match[1]] = path.resolve(match[2]);
  }
  return values;
}

function prepare({ productionRoot, outputRoot }) {
  assert.ok(productionRoot && fs.statSync(productionRoot).isDirectory(), '--production-root must be a current selective MAIN pull.');
  assert.ok(outputRoot, '--output-root is required.');
  const manifest = readJson(MANIFEST_PATH);
  const candidateRoot = path.join(outputRoot, 'candidate');
  const backupRoot = path.join(outputRoot, 'backup');
  const preparedFiles = [];
  const backupFiles = [];

  for (const entry of manifest.files) {
    const liveFile = path.join(productionRoot, entry.path);
    const repositoryFile = path.join(ROOT, entry.path);
    const liveExists = fs.existsSync(liveFile);
    if (entry.expectedProductionSha256 === null) {
      assert.equal(liveExists, false, `${entry.path} unexpectedly exists on MAIN; refresh and review the manifest.`);
      backupFiles.push({ path: entry.path, existed: false, sha256: null });
    } else {
      assert.equal(liveExists, true, `${entry.path} is missing from MAIN.`);
      const liveBuffer = fs.readFileSync(liveFile);
      assert.equal(sha256(liveBuffer), entry.expectedProductionSha256, `${entry.path} MAIN hash drifted.`);
      writeFile(path.join(backupRoot, entry.path), liveBuffer);
      backupFiles.push({ path: entry.path, existed: true, sha256: entry.expectedProductionSha256 });
    }

    let candidate;
    if (entry.operation.endsWith('_from_repository')) {
      candidate = fs.readFileSync(repositoryFile);
      assert.equal(sha256(candidate), entry.sourceSha256, `${entry.path} repository source drifted.`);
    } else if (entry.operation === 'merge_k1d_controls_into_live') {
      candidate = Buffer.from(mergeCartDrawer(fs.readFileSync(liveFile, 'utf8')));
    } else if (entry.operation === 'merge_english_quote_mode_into_live') {
      candidate = Buffer.from(`${JSON.stringify(mergeEnglishLocale(readJson(liveFile), readJson(repositoryFile)), null, 2)}\n`);
    } else if (entry.operation === 'insert_single_disabled_checkbox_into_live') {
      candidate = Buffer.from(`${JSON.stringify(mergeSettingsSchema(readJson(liveFile)), null, 2)}\n`);
    } else if (entry.operation === 'set_single_current_key_true_on_live_copy') {
      candidate = Buffer.from(`${JSON.stringify(mergeSettingsData(readJson(liveFile)), null, 2)}\n`);
    } else {
      throw new Error(`Unsupported manifest operation: ${entry.operation}`);
    }
    writeFile(path.join(candidateRoot, entry.path), candidate);
    preparedFiles.push({ path: entry.path, sha256: sha256(candidate), operation: entry.operation });
  }

  const preparation = {
    schemaVersion: 1,
    store: manifest.store,
    destinationThemeId: manifest.destinationThemeId,
    productionMutationPerformed: false,
    sourceProductionRootPersisted: false,
    manifestSha256: sha256(fs.readFileSync(MANIFEST_PATH)),
    files: preparedFiles,
    backup: backupFiles,
    uploadOrder: manifest.uploadOrder,
    rollback: manifest.rollback,
  };
  writeFile(path.join(outputRoot, 'preparation.json'), `${JSON.stringify(preparation, null, 2)}\n`);
  return preparation;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = prepare({ productionRoot: args['production-root'], outputRoot: args['output-root'] });
  console.log(`K1D-04 candidate prepared locally: ${result.files.length} files; production writes: 0.`);
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(`K1D-04 preparation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  mergeCartDrawer,
  mergeEnglishLocale,
  mergeSettingsData,
  mergeSettingsSchema,
  prepare,
  sha256,
};
