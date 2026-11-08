'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const files = {
  registry: path.join(root, 'docs', 'project', 'epic-o-proposed-backlog.json'),
  tracker: path.join(root, 'docs', 'rhino-lapidary-pbi-tracker-epic-o.md'),
  decisions: path.join(root, 'docs', 'project', 'epic-o-decision-and-dependency-register.md'),
  discovery: path.join(root, 'docs', 'project', 'epic-o-discovery-and-context.md'),
  transition: path.join(root, 'docs', 'project', 'epic-l-to-epic-o-transition.md'),
  handoff: path.join(root, 'docs', 'project', 'epic-o-next-session-handoff.md'),
};

const read = (file) => fs.readFileSync(file, 'utf8');
const registry = JSON.parse(read(files.registry));
const packageJson = JSON.parse(read(path.join(root, 'package.json')));
const documents = Object.fromEntries(
  Object.entries(files).filter(([key]) => key !== 'registry').map(([key, file]) => [key, read(file)]),
);

const allowedPriorities = new Set(['P0', 'P1', 'P2', 'P3']);
const allowedImpacts = new Set(['Low', 'Medium', 'High']);
const allowedEfforts = new Set(['XS', 'S', 'M', 'L', 'XL']);
const allowedConfidence = new Set(['Low', 'Medium', 'High']);
const requiredPbiFields = [
  'title', 'priority', 'impact', 'effort', 'confidence', 'batch', 'milestone', 'status', 'statusHistory',
  'ownerClass', 'workSplit', 'decisionRefs', 'dependencyRefs', 'canonicalAreaIds', 'externalSystem',
  'externalRequirementStated',
];
const trackerFields = [
  '**Status:**', '**Evidence state:**', '**Implementation owner / responsibility class:**', '**Work area:**',
  '**Implementation mode:**', '**Type:**', '**Priority:**', '**Impact:**', '**Effort:**', '**Confidence:**',
  '**Proposed batch / milestone:**', '**Repository work:**', '**Shopify Admin / configuration work:**',
];
const trackerSubsections = [
  '### Customer or business problem', '### Evidence and current state', '### Proposed outcome',
  '### Scope and exclusions', '### Functional and privacy acceptance criteria',
  '### Accessibility and responsive requirements', '### Automated validation opportunities',
  '### Dependencies, approvals, and human decisions', '### Risk, rollback, and evidence expectations',
];

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function validate(input, docs = documents) {
  const errors = [];
  const pbiIds = input.items.map((item) => item.id);
  const pbiSet = new Set(pbiIds);
  const decisionIds = input.decisions.map((decision) => decision.id);
  const decisionSet = new Set(decisionIds);
  const dependencyIds = input.dependencies.map((dependency) => dependency.id);
  const dependencySet = new Set(dependencyIds);
  const areaIds = input.canonicalAreas.map((area) => area.id);
  const areaSet = new Set(areaIds);
  const batchIds = input.batches.map((batch) => batch.id);
  const batchSet = new Set(batchIds);
  const allowedStatuses = new Set(input.statusVocabulary);

  if (input.epic !== 'O' || input.planningOnly !== true) errors.push('Registry must be Epic O planning-only.');
  if (packageJson.scripts['validate:epic-o-planning'] !== 'node scripts/validate-epic-o-planning.js') {
    errors.push('package.json must expose the scoped validate:epic-o-planning command.');
  }
  for (const flag of [
    'implementationAuthorized', 'shopifyAdminAccessAuthorized', 'shopifyMutationAuthorized',
    'customerAuthenticationAuthorized', 'customerRecordAccessAuthorized', 'appInstallationAuthorized',
    'publicationAuthorized', 'deploymentAuthorized', 'emailAuthorized', 'shopifyAdminVerified',
    'evidenceContainsCustomerData',
  ]) {
    if (input[flag] !== false) errors.push(`${flag} must be false in the planning registry.`);
  }

  if (input.items.length !== 20) errors.push(`Expected 20 PBIs; found ${input.items.length}.`);
  if (input.canonicalAreas.length !== 24) errors.push(`Expected 24 canonical areas; found ${input.canonicalAreas.length}.`);
  for (const [label, ids] of [['PBI', pbiIds], ['decision', decisionIds], ['dependency', dependencyIds], ['area', areaIds], ['batch', batchIds]]) {
    const repeated = duplicates(ids);
    if (repeated.length) errors.push(`Duplicate ${label} identifiers: ${repeated.join(', ')}.`);
  }

  input.items.forEach((item, index) => {
    const expected = `O-PBI-${String(index + 1).padStart(3, '0')}`;
    if (item.id !== expected) errors.push(`Expected ${expected} at index ${index}; found ${item.id}.`);
    for (const field of requiredPbiFields) if (!(field in item)) errors.push(`${item.id} is missing ${field}.`);
    if (!allowedPriorities.has(item.priority)) errors.push(`${item.id} has invalid priority ${item.priority}.`);
    if (!allowedImpacts.has(item.impact)) errors.push(`${item.id} has invalid impact ${item.impact}.`);
    if (!allowedEfforts.has(item.effort)) errors.push(`${item.id} has invalid effort ${item.effort}.`);
    if (!allowedConfidence.has(item.confidence)) errors.push(`${item.id} has invalid confidence ${item.confidence}.`);
    if (!allowedStatuses.has(item.status)) errors.push(`${item.id} has invalid status ${item.status}.`);
    if (!batchSet.has(item.batch)) errors.push(`${item.id} references unknown batch ${item.batch}.`);
    if (item.externalRequirementStated !== true || !item.externalSystem.trim()) {
      errors.push(`${item.id} must state its external application/system requirement explicitly.`);
    }
    for (const id of item.decisionRefs) if (!decisionSet.has(id)) errors.push(`${item.id} references unknown decision ${id}.`);
    for (const id of item.dependencyRefs) if (!dependencySet.has(id)) errors.push(`${item.id} references unknown dependency ${id}.`);
    for (const id of item.canonicalAreaIds) if (!areaSet.has(id)) errors.push(`${item.id} references unknown area ${id}.`);

    const history = item.statusHistory || [];
    if (!history.length || history.at(-1).status !== item.status) errors.push(`${item.id} status history must end at current status.`);
    for (let i = 0; i < history.length; i += 1) {
      if (!allowedStatuses.has(history[i].status)) errors.push(`${item.id} history has invalid status ${history[i].status}.`);
      if (i > 0) {
        const prior = history[i - 1].status;
        if (!(input.allowedStatusTransitions[prior] || []).includes(history[i].status)) {
          errors.push(`${item.id} has invalid status transition ${prior} -> ${history[i].status}.`);
        }
      }
    }

    const heading = `## ${item.id} —`;
    const start = docs.tracker.indexOf(heading);
    if (start === -1) {
      errors.push(`${item.id} has no detailed tracker section.`);
    } else {
      const next = docs.tracker.indexOf('\n## O-PBI-', start + heading.length);
      const section = docs.tracker.slice(start, next === -1 ? docs.tracker.length : next);
      for (const field of trackerFields) if (!section.includes(field)) errors.push(`${item.id} is missing tracker field ${field}`);
      for (const subsection of trackerSubsections) if (!section.includes(subsection)) errors.push(`${item.id} is missing ${subsection}.`);
    }
  });

  const membership = input.batches.flatMap((batch) => batch.pbiIds);
  if (membership.length !== input.items.length || new Set(membership).size !== input.items.length) {
    errors.push('Every PBI must appear in exactly one batch.');
  }
  for (const id of membership) if (!pbiSet.has(id)) errors.push(`Batch references unknown PBI ${id}.`);
  for (const item of input.items) if (!membership.includes(item.id)) errors.push(`${item.id} is missing from batch membership.`);

  input.canonicalAreas.forEach((area, index) => {
    const expected = `O-AREA-${String(index + 1).padStart(3, '0')}`;
    if (area.id !== expected) errors.push(`Expected canonical area ${expected}; found ${area.id}.`);
    if (!area.pbiIds.length) errors.push(`${area.id} has no PBI coverage.`);
    for (const id of area.pbiIds) if (!pbiSet.has(id)) errors.push(`${area.id} references unknown PBI ${id}.`);
    if (!docs.discovery.includes(`| ${area.id} |`)) errors.push(`Discovery matrix is missing ${area.id}.`);
  });

  for (const decision of input.decisions) {
    if (decision.blocking && (!decision.authority || decision.authority.trim().length < 3)) {
      errors.push(`${decision.id} is blocking but has no accountable authority.`);
    }
    if (!docs.decisions.includes(`| ${decision.id} |`)) errors.push(`Decision register is missing ${decision.id}.`);
  }
  for (const dependency of input.dependencies) {
    if (!dependency.authority || dependency.authority.trim().length < 3) errors.push(`${dependency.id} has no accountable authority.`);
    if (!docs.decisions.includes(`| ${dependency.id} |`)) errors.push(`Dependency register is missing ${dependency.id}.`);
  }

  const expectedDeferredEpics = ['H', 'I', 'M', 'N'];
  for (const epic of expectedDeferredEpics) {
    const entry = input.deferredEpicInterfaces.find((candidate) => candidate.epic === epic);
    if (!entry || entry.status !== 'Deferred') errors.push(`Epic ${epic} interface must be explicitly Deferred.`);
  }

  const requiredInvariants = [
    'purchaserDoesNotEqualCurrentOwner', 'orderDoesNotProveOwnership',
    'savedMachineDoesNotProveAuthorizedOwnership', 'registrationDoesNotProveWarrantyEligibility',
    'compatibilityDoesNotAuthorizeRecommendation', 'accountHistoryDoesNotEqualPrivateServiceHistory',
    'accountVisibilityDoesNotAuthorizePrivateDisclosure',
    'privateMachineAndServiceRecordsForbiddenOnPublicProductMetafields',
    'planningApprovalDoesNotAuthorizeImplementation',
  ];
  for (const invariant of requiredInvariants) if (input.invariants[invariant] !== true) errors.push(`Required invariant ${invariant} must be true.`);

  const requiredTokens = {
    discovery: [
      '414288a16fe7123b06c3433f0063ba402fc35e83', 'Shopify Admin state: Unverified',
      'Research date: 2026-11-07', 'Legacy customer accounts are deprecated',
      'Do not store private machine or service records on public Product metafields',
    ],
    transition: ['L-DEC-003', 'L-DEC-009', 'L-DEC-010', 'L-DEC-015', 'K-EVID-007'],
    handoff: [
      'epic-o/o0-discovery-and-planning', '414288a16fe7123b06c3433f0063ba402fc35e83',
      'H, I, M, and N remain deferred', 'Request Product Owner review before preparing an implementation prompt',
    ],
  };
  for (const [document, tokens] of Object.entries(requiredTokens)) {
    for (const token of tokens) if (!docs[document].includes(token)) errors.push(`${document} is missing required token: ${token}`);
  }

  const combined = Object.values(docs).join('\n');
  const secretPatterns = [/shpat_[A-Za-z0-9_]+/, /shpca_[A-Za-z0-9_]+/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /gid:\/\/shopify\/Customer\//];
  for (const pattern of secretPatterns) if (pattern.test(combined)) errors.push(`Planning documents contain prohibited secret/customer evidence pattern ${pattern}.`);

  return errors;
}

const errors = validate(registry);

function expectNegativeFixture(name, mutate, expectedFragment) {
  const fixture = structuredClone(registry);
  mutate(fixture);
  const fixtureErrors = validate(fixture);
  if (!fixtureErrors.some((error) => error.includes(expectedFragment))) {
    errors.push(`Negative fixture ${name} did not fail with ${expectedFragment}.`);
  }
}

expectNegativeFixture('duplicate-pbi-id', (fixture) => { fixture.items[1].id = fixture.items[0].id; }, 'Duplicate PBI identifiers');
expectNegativeFixture('invalid-status', (fixture) => { fixture.items[0].status = 'Invented'; }, 'invalid status');
expectNegativeFixture('invalid-transition', (fixture) => {
  fixture.items[0].status = 'Complete';
  fixture.items[0].statusHistory.push({status: 'Complete', at: '2026-11-07', evidence: 'invalid shortcut'});
}, 'invalid status transition');
expectNegativeFixture('missing-area-coverage', (fixture) => { fixture.canonicalAreas[0].pbiIds = []; }, 'has no PBI coverage');
expectNegativeFixture('unknown-dependency', (fixture) => { fixture.items[0].dependencyRefs.push('O-DEP-999'); }, 'unknown dependency');
expectNegativeFixture('missing-blocking-authority', (fixture) => { fixture.decisions[0].authority = ''; }, 'blocking but has no accountable authority');
expectNegativeFixture('ownership-assumption', (fixture) => { fixture.invariants.orderDoesNotProveOwnership = false; }, 'orderDoesNotProveOwnership');
expectNegativeFixture('invented-admin-verification', (fixture) => { fixture.shopifyAdminVerified = true; }, 'shopifyAdminVerified must be false');
expectNegativeFixture('implementation-authorization', (fixture) => { fixture.implementationAuthorized = true; }, 'implementationAuthorized must be false');
expectNegativeFixture('unstated-external-system', (fixture) => { fixture.items[5].externalRequirementStated = false; }, 'external application/system requirement');

if (errors.length) {
  console.error('Epic O planning validation failed.');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Epic O planning validation passed: ${registry.items.length} PBIs, ${registry.canonicalAreas.length} canonical areas, ${registry.batches.length} batches.`);
  console.log('Negative fixtures passed: identifier, status, transition, coverage, dependency, authority, ownership, Admin, authorization, and external-system guards.');
  console.log('Planning only: implementation, Admin access/mutation, customer access, app install, publication, deployment, and email remain unauthorized.');
}

module.exports = { validate };
