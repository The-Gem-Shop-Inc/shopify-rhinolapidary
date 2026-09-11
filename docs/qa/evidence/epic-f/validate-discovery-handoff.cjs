// Validates discovery artifacts only; no storefront implementation or network calls.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const json = p => JSON.parse(read(p));
const checks = [];
function check(name, pass, detail) { checks.push({ name, pass: Boolean(pass), detail }); }
const audit = json('docs/qa/evidence/epic-f/2026-09-10-repository-audit.json');
const changed = audit.sources.filter(s => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, s.path))).digest('hex') !== s.sha256).map(s => s.path);
check('Consumed governance/source hashes unchanged', changed.length === 0, { sources: audit.sources.length, changed });
const inventory = json('docs/project/epic-f-machine-inventory.json');
const admin = json('docs/qa/evidence/epic-f/2026-09-10-machine-admin-read.json');
check('Exact machine identity coverage', inventory.products.length === 11 && new Set(inventory.products.map(p => p.productGid)).size === 11 && admin.data.nodes.every(p => inventory.products.some(i => i.productGid === p.id)), { count: inventory.products.length });
check('Discovery has no execution authorization', inventory.implementationAuthorized === false && inventory.mutationAuthorized === false && inventory.scope.epicECompleteSnapshot === false);
const backlog = json('docs/project/epic-f-proposed-backlog.json');
const tracker = read('docs/rhino-lapidary-pbi-tracker-epic-f.md');
const parts = tracker.split(/^## F-PBI-\d{3} /m).slice(1);
const required = ['Problem or opportunity', 'Evidence', 'Proposed outcome', 'Scope', 'Out of scope', 'Acceptance criteria', 'Implementation handoff', 'Success measure', 'Dependencies', 'Risks/cautions', 'Testing/validation expectations', 'Human/Admin dependencies', 'Automation opportunities', 'Downstream consumers', 'Blockers/open questions'];
const metadata = ['Status', 'Epic', 'Work area', 'Type', 'Priority', 'Impact', 'Effort', 'Confidence', 'Suggested milestone', 'Suggested GitHub labels'];
check('18 proposed PBIs with complete handoff fields', backlog.pbis.length === 18 && parts.length === 18 && parts.every(p => required.every(h => p.includes('### ' + h)) && metadata.every(h => p.includes('**' + h + ':**')) && p.includes('Proposed / not implemented')) && backlog.implementationAuthorized === false);
const docs = ['docs/architecture/epic-f-machine-product-page-discovery.md', 'docs/project/epic-f-machine-page-gap-matrix.md', 'docs/project/epic-f-decision-packet.md', 'docs/rhino-lapidary-pbi-tracker-epic-f.md'];
const missingLinks = [];
for (const doc of docs) {
  for (const match of read(doc).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = match[1];
    if (/^(https?:|#)/.test(href)) continue;
    const target = decodeURIComponent(href.split('#')[0]);
    if (!fs.existsSync(path.resolve(root, path.dirname(doc), target))) missingLinks.push({ doc, target });
  }
}
check('Local handoff links resolve', missingLinks.length === 0, missingLinks);
const preview = json('docs/qa/evidence/epic-f/2026-09-10-preview-observations.json');
check('All machine/viewport observations retained', preview.samples.length === 33, { samples: preview.samples.length, theme: preview.theme });
const incompleteConnections = [], mutations = [];
function walk(value, location) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'hasNextPage' && child === true) incompleteConnections.push(location);
    if ((key === 'query' || key === 'queries') && typeof child === 'string' && /\bmutation\s*[{(\w]/.test(child)) mutations.push(location);
    walk(child, location + '.' + key);
  }
}
for (const name of ['machine-admin-read', 'machine-inventory-read', 'definitions-pages-read', 'operational-read']) walk(json('docs/qa/evidence/epic-f/2026-09-10-' + name + '.json'), name);
check('Saved targeted reads have no outstanding pagination', incompleteConnections.length === 0, incompleteConnections);
check('Saved Admin queries remain read-only', mutations.length === 0, mutations);
const csv = audit.results.find(r => r.name === 'product_csv');
check('Original CSV failures retained', csv.exitCode === 1 && (csv.stderr.match(/Image Alt Text is missing/g) || []).length === 95 && (csv.stderr.match(/Variant Price must be greater than 0/g) || []).length === 8);
const fixtures = audit.results.find(r => r.name === 'launch_fixtures');
check('Three fixture ownership failures remain explicit', fixtures.exitCode === 1 && ['search', 'machineProduct', 'consumableProduct'].every(s => fixtures.stderr.includes('entry: ' + s)));
const report = { validatedAt: new Date().toISOString(), evidenceDate: '2026-09-10', scope: 'Discovery artifact validation only; no fresh Admin/browser assertion or Epic F implementation', pass: checks.every(c => c.pass), checks };
fs.writeFileSync(path.join(__dirname, 'handoff-validation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
