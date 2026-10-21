'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), cp = require('node:child_process');
const Ajv = require('ajv');
const ID = 'J1-EVIDENCE-PORTABILITY-V1-2026-10-20';
const CONTRACT = 'data/epic-j-j1-portability-v1.json';
const CONTRACT_SHA256 = '7841693dc348cf47ee481da8d5b32faa285fd046c2eefa0002bf9385705cfffd';
const J1_SHA256 = '6656356c225ee086c611381152d196b19e79782ba6dbe9a2ef07d14ad4f868db';
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
class IntegrityError extends Error { constructor(code, file) { super(code); this.code = code; if (file) this.path = file; } }
const fail = (code, file) => { throw new IntegrityError(code, file); };
function canonical(p) {
  if (typeof p !== 'string' || !p || /[\\:*?\x00]/.test(p) || p.startsWith('/') || p.split('/').some(s => !s || s === '.' || s === '..') || p !== p.normalize('NFC')) fail('INVALID_PATH');
  return p;
}
function file(root, p) {
  canonical(p); const full = path.resolve(root, p), base = fs.realpathSync(root);
  if (!full.startsWith(path.resolve(root) + path.sep)) fail('PATH_ESCAPE');
  // Resolve ancestors too, including dangling/escaping symlinks.
  let current = root;
  for (const part of p.split('/')) { current = path.join(current, part); if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) fail('SYMLINK_PATH', p); }
  if (fs.existsSync(full) && !fs.realpathSync(full).startsWith(base + path.sep)) fail('PATH_ESCAPE', p);
  return full;
}
function reader(root, io = {}) {
  const paths = new Map(), checkedAncestors = new Set();
  const locate = p => {
    canonical(p); if (paths.has(p)) return paths.get(p);
    const full = path.resolve(root, p); if (!full.startsWith(path.resolve(root) + path.sep)) fail('PATH_ESCAPE');
    let current = root;
    for (const part of p.split('/')) {
      current = path.join(current, part);
      if (checkedAncestors.has(current)) continue;
      if (fs.existsSync(current)) { if (fs.lstatSync(current).isSymbolicLink()) fail('SYMLINK_PATH', p); checkedAncestors.add(current); }
    }
    paths.set(p, full); return full;
  };
  return { exists: p => { const full = locate(p); return io.exists ? io.exists(p, full) : fs.existsSync(full); },
    bytes: p => { const full = locate(p); try { return io.read ? io.read(p, full) : fs.readFileSync(full); } catch { fail('REQUIRED_FILE_MISSING', p); } } };
}
function schema(value, definition) { const validate = new Ajv({ allErrors: true, strict: true }).compile(definition); if (!validate(value)) fail('SCHEMA_INVALID'); }
function load(root, io = {}) {
  const r = reader(root, io), bytes = r.bytes(CONTRACT);
  if (hash(bytes) !== CONTRACT_SHA256) fail('PORTABILITY_CONTRACT_DRIFT', CONTRACT);
  const c = JSON.parse(bytes), s = 'schemas/epic-j-portability-v1.schema.json';
  const expectedSchema = c.implementation.find(x => x.path === s);
  if (!expectedSchema || hash(r.bytes(s)) !== expectedSchema.sha256) fail('SCHEMA_DRIFT', s);
  schema(c, JSON.parse(r.bytes(s)));
  canonical(c.evidenceDirectory); canonical(c.executionOutputRoot);
  if (c.executionOutputRoot !== c.evidenceDirectory + '/execution') fail('INVALID_EXECUTION_OUTPUT_ROOT');
  for (const identity of [c.predecessor, c.privateManifest, c.privateSchema]) if (hash(r.bytes(identity.path)) !== identity.sha256) fail('ANCHOR_DRIFT', identity.path);
  if (c.predecessor.path !== 'data/epic-j-j1-source-successor.json' || c.predecessor.sha256 !== J1_SHA256) fail('UNKNOWN_J1_PREDECESSOR');
  const j1 = JSON.parse(r.bytes(c.predecessor.path)), privateManifest = JSON.parse(r.bytes(c.privateManifest.path));
  schema(privateManifest, JSON.parse(r.bytes(c.privateSchema.path)));
  const before = JSON.parse(r.bytes(j1.before.path));
  if (hash(r.bytes(j1.before.path)) !== j1.before.sha256 || hash(r.bytes(j1.baseline.path)) !== j1.baseline.sha256) fail('HISTORICAL_CONTRACT_DRIFT');
  const seen = new Set();
  for (const row of [...c.requiredFiles, ...c.disposableFiles, ...privateManifest.entries]) {
    canonical(row.path); const key = row.path.toLowerCase(); if (seen.has(key)) fail('DUPLICATE_CLASSIFICATION', row.path); seen.add(key);
  }
  for (const row of privateManifest.entries) {
    canonical(row.safeSummary);
    if (before[row.path] !== row.originalSha256 || !c.requiredFiles.some(r => r.path === row.safeSummary && r.classification === 'PUBLIC_REPOSITORY_EVIDENCE')) fail('INVALID_PRIVATE_EXCLUSION', row.path);
  }
  // Every predecessor file remains mandatory except the ten exact private paths.
  // No unrelated evidence gets reclassified as disposable to obtain a pass.
  const required = new Map(c.requiredFiles.map(x => [x.path, x]));
  const changes = new Map(j1.reviewedRepositoryChanges.map(x => [x.path, x]));
  const privates = new Map(privateManifest.entries.map(x => [x.path, x]));
  for (const [p, old] of Object.entries(before)) {
    if (privates.has(p)) continue;
    if (!required.has(p) || required.get(p).sha256 !== (changes.get(p)?.sha256 || old)) fail('PREDECESSOR_COVERAGE_GAP', p);
  }
  for (const row of j1.runtime) if (required.get(row.path)?.sha256 !== row.sha256) fail('RUNTIME_SUCCESSOR_DRIFT', row.path);
  for (const row of c.implementation) {
    let b = r.bytes(row.path);
    if (row.path === 'scripts/lib/epic-j-j1-portability-v1.js') b = Buffer.from(b.toString('utf8').replace(CONTRACT_SHA256, 'PORTABILITY_MANIFEST_PIN_PENDING'));
    if (hash(b) !== row.sha256) fail('IMPLEMENTATION_DRIFT', row.path);
  }
  return { c, j1, privateManifest, r };
}
function verify({ root = process.cwd(), mode = 'local', io } = {}) {
  if (!['local', 'portable'].includes(mode)) fail('INVALID_MODE');
  const { c, j1, privateManifest, r } = load(root, io);
  for (const row of c.requiredFiles) {
    if (!r.exists(row.path)) fail('REQUIRED_FILE_MISSING', row.path);
    if (hash(r.bytes(row.path)) !== row.sha256) fail(row.classification === 'PUBLIC_REPOSITORY_EVIDENCE' ? 'PUBLIC_EVIDENCE_DRIFT' : 'PROTECTED_SOURCE_DRIFT', row.path);
  }
  let present = 0, absent = 0;
  for (const row of privateManifest.entries) {
    if (r.exists(row.path)) { if (hash(r.bytes(row.path)) !== row.originalSha256) fail('PRIVATE_EVIDENCE_DRIFT', row.path); present++; }
    else if (mode === 'portable' && row.absencePermittedInPortableValidation) absent++;
    else fail('PRIVATE_EVIDENCE_REQUIRED_LOCALLY', row.path);
    const summary = JSON.parse(r.bytes(row.safeSummary));
    schema(summary, JSON.parse(r.bytes('schemas/epic-j-portable-summary-v1.schema.json')));
    if (summary.original.path !== row.path || summary.original.sha256 !== row.originalSha256 || summary.governingSuccessor !== ID || summary.kind !== 'OBSERVED_HISTORICAL_METADATA_NOT_REGENERATED_MEASUREMENTS') fail('INVALID_SAFE_SUMMARY', row.safeSummary);
  }
  for (const row of c.disposableFiles) if (r.exists(row.path) && hash(r.bytes(row.path)) !== row.sha256) fail('HISTORICAL_DISPOSABLE_DRIFT', row.path);
  const known = new Set([CONTRACT, ...c.requiredFiles.map(x => x.path), ...c.disposableFiles.map(x => x.path), ...c.implementation.map(x => x.path), ...privateManifest.entries.map(x => x.path)]);
  const files = io?.list ? io.list() : cp.execFileSync('rg', ['--files', '--hidden', '-g', '!.git', '-g', '!node_modules', '-g', '!test-results', '-g', '!playwright-report'], { cwd: root, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 }).trim().split(/\r?\n/).filter(Boolean).map(p => p.replaceAll('\\', '/'));
  for (const p of files) if (!known.has(p) && !p.startsWith(c.executionOutputRoot + '/')) fail('UNCLASSIFIED_FILE', p);
  return { schemaVersion: 1, status: 'PASS', successor: ID, originalJ1: j1.id, mode, requiredChecked: c.requiredFiles.length, privatePresent: present, privateAbsent: absent, disposablePaths: c.disposableFiles.length, deploymentAuthorized: false, publicationAuthorized: false };
}
function scan(root, paths) {
  for (const p of paths) file(root, p);
  const processResult = cp.spawnSync('python', [path.join(__dirname, 'epic-j-evidence-scan.py')], { input: JSON.stringify({ root: path.resolve(root), paths }), encoding: 'utf8', maxBuffer: 40 * 1024 * 1024, windowsHide: true });
  if (processResult.status !== 0) fail('SECURITY_SCANNER_UNAVAILABLE');
  return JSON.parse(processResult.stdout);
}
function publication({ root = process.cwd(), paths } = {}) {
  const { c, privateManifest } = load(root);
  if (!Array.isArray(paths) || new Set(paths.map(p => canonical(p).toLowerCase())).size !== paths.length) fail('INVALID_PUBLICATION_LIST');
  const privatePaths = new Set(privateManifest.entries.map(r => r.path.toLowerCase()));
  for (const p of paths) if (privatePaths.has(p.toLowerCase())) fail('PRIVATE_EVIDENCE_PUBLICATION', p);
  verify({ root, mode: 'portable' });
  const privateHashes = new Set(privateManifest.entries.map(r => r.originalSha256));
  for (const p of paths) if (privateHashes.has(hash(fs.readFileSync(file(root, p))))) fail('PRIVATE_EVIDENCE_PUBLICATION', p);
  const result = scan(root, paths);
  if (result.results.length !== paths.length || result.results.some((r, i) => r.path !== paths[i])) fail('INCOMPLETE_SECURITY_SCAN');
  const rejected = result.results.find(r => r.status === 'REJECT'); if (rejected) fail('PUBLICATION_CREDENTIAL_OR_UNREADABLE_PATH', rejected.path);
  const required = new Map([...c.requiredFiles, ...c.implementation].map(r => [r.path, r]));
  for (const p of paths) {
    if (p === CONTRACT) continue;
    const known = required.get(p); if (!known) fail('UNAPPROVED_PUBLICATION_ARTIFACT', p);
    let b = fs.readFileSync(file(root, p));
    if (p === 'scripts/lib/epic-j-j1-portability-v1.js') b = Buffer.from(b.toString('utf8').replace(CONTRACT_SHA256, 'PORTABILITY_MANIFEST_PIN_PENDING'));
    if (hash(b) !== known.sha256) fail('PUBLICATION_SOURCE_DRIFT', p);
  }
  const review = result.results.filter(r => r.status === 'REVIEW');
  return { schemaVersion: 1, status: review.length ? 'BLOCKED' : 'PASS', reasonCode: review.length ? 'HUMAN_SECURITY_REVIEW_REQUIRED' : null, scanned: paths.length, review: review.map(r => ({ path: r.path, classifications: r.review })), publicationAuthorized: false };
}
function nativeSurfaceMatches(fileName, oldHash, text) {
  verify({ mode: process.env.RHINO_J_PORTABILITY_MODE || 'portable' });
  const row = JSON.parse(fs.readFileSync('data/epic-j-j1-source-successor.json')).runtime.find(r => r.path === fileName);
  if (!row || row.oldNormalizedSha256 !== oldHash || hash(text.replaceAll('\r\n', '\n')) !== row.normalizedSha256) fail('UNREVIEWED_NATIVE_SOURCE', fileName);
  return true;
}
module.exports = { ID, CONTRACT, hash, canonical, file, load, verify, publication, scan, schema, nativeSurfaceMatches, IntegrityError };
