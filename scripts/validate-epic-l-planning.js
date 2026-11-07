'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'docs', 'project', 'epic-l-proposed-backlog.json');
const trackerPath = path.join(root, 'docs', 'rhino-lapidary-pbi-tracker-epic-l.md');
const decisionPath = path.join(root, 'docs', 'project', 'epic-l-decision-and-dependency-register.md');
const findingsPath = path.join(root, 'docs', 'project', 'epic-l-discovery-and-context.md');
const transitionPath = path.join(root, 'docs', 'project', 'epic-k-to-epic-l-transition.md');
const handoffPath = path.join(root, 'docs', 'project', 'epic-l-next-session-handoff.md');

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const tracker = fs.readFileSync(trackerPath, 'utf8');
const decisions = fs.readFileSync(decisionPath, 'utf8');
const findings = fs.readFileSync(findingsPath, 'utf8');
const transition = fs.readFileSync(transitionPath, 'utf8');
const handoff = fs.readFileSync(handoffPath, 'utf8');

const errors = [];
const allowedPriorities = new Set(['P0', 'P1', 'P2', 'P3']);
const allowedEfforts = new Set(['XS', 'S', 'M', 'L', 'XL']);
const allowedStatuses = new Set(registry.statusVocabulary);
const itemIds = registry.items.map((item) => item.id);
const itemIdSet = new Set(itemIds);

if (registry.epic !== 'L' || registry.planningOnly !== true) errors.push('Registry must be Epic L planning-only.');
if (registry.implementationAuthorized || registry.shopifyMutationAuthorized || registry.publicationAuthorized) {
  errors.push('Planning registry must not authorize implementation, Shopify mutation, or publication.');
}
if (registry.items.length !== 28) errors.push(`Expected 28 PBIs; found ${registry.items.length}.`);
if (itemIdSet.size !== itemIds.length) errors.push('PBI identifiers must be unique.');

registry.items.forEach((item, index) => {
  const expected = `L-PBI-${String(index + 1).padStart(3, '0')}`;
  if (item.id !== expected) errors.push(`Expected ${expected} at registry index ${index}; found ${item.id}.`);
  for (const key of ['title', 'priority', 'effort', 'status', 'evidenceState', 'batch', 'ownerClass', 'dependencies']) {
    if (!(key in item)) errors.push(`${item.id} is missing ${key}.`);
  }
  if (!allowedPriorities.has(item.priority)) errors.push(`${item.id} has invalid priority ${item.priority}.`);
  if (!allowedEfforts.has(item.effort)) errors.push(`${item.id} has invalid effort ${item.effort}.`);
  if (!allowedStatuses.has(item.status)) errors.push(`${item.id} has invalid status ${item.status}.`);
  if (!Array.isArray(item.dependencies)) errors.push(`${item.id} dependencies must be an array.`);
  const heading = `## ${item.id} —`;
  const sectionStart = tracker.indexOf(heading);
  if (sectionStart === -1) {
    errors.push(`${item.id} has no detailed tracker section.`);
  } else {
    const nextStart = tracker.indexOf('\n## L-PBI-', sectionStart + heading.length);
    const section = tracker.slice(sectionStart, nextStart === -1 ? tracker.length : nextStart);
    for (const field of [
      '**Status:**',
      '**Evidence state:**',
      '**Implementation owner / responsibility class:**',
      '**Work area:**',
      '**Implementation mode:**',
      '**Type:**',
      '**Priority:**',
      '**Impact:**',
      '**Effort:**',
      '**Confidence:**',
      '**Suggested milestone:**',
      '**Suggested GitHub labels:**',
    ]) {
      if (!section.includes(field)) errors.push(`${item.id} is missing tracker field ${field}`);
    }
    for (const subsection of [
      '### Problem or opportunity',
      '### Evidence',
      '### Proposed outcome',
      '### Scope / exclusions',
      '### Acceptance criteria',
      '### Architecture / implementation considerations',
      '### Dependencies and external decisions',
      '### Risks and cautions',
      '### Testing requirements',
      '### Success measure',
      '### Open Product Owner questions',
    ]) {
      if (!section.includes(subsection)) errors.push(`${item.id} is missing tracker subsection ${subsection}.`);
    }
  }
});

const batchIds = new Set(registry.batches.map((batch) => batch.id));
const batchMembership = registry.batches.flatMap((batch) => batch.pbiIds);
if (batchIds.size !== registry.batches.length) errors.push('Batch identifiers must be unique.');
if (batchMembership.length !== registry.items.length || new Set(batchMembership).size !== registry.items.length) {
  errors.push('Every PBI must appear in exactly one batch.');
}
registry.items.forEach((item) => {
  if (!batchIds.has(item.batch)) errors.push(`${item.id} references unknown batch ${item.batch}.`);
  item.dependencies.filter((id) => id.startsWith('L-PBI-')).forEach((id) => {
    if (!itemIdSet.has(id)) errors.push(`${item.id} references unknown dependency ${id}.`);
  });
});

for (const batch of registry.batches) {
  if (!tracker.includes(`### Batch ${batch.id.slice(1)} — ${batch.title}`)) {
    errors.push(`${batch.id} has no matching tracker batch section.`);
  }
}

for (const token of ['L-DEC-001', 'L-DEP-001', 'K-EVID-007']) {
  if (!decisions.includes(token)) errors.push(`Decision register is missing ${token}.`);
}
for (const token of ['ef76e02aa023616b0f7e70ed05f59f9bd16b4cf3', '110', 'fixture-only']) {
  if (!findings.includes(token)) errors.push(`Findings document is missing required evidence token ${token}.`);
}
for (const token of ['K-EVID-001', 'K-EVID-002', 'K-EVID-007', 'k1d04-20261105-173203']) {
  if (!transition.includes(token)) errors.push(`Transition record is missing ${token}.`);
}
for (let section = 1; section <= 10; section += 1) {
  if (!handoff.includes(`## ${section}.`)) errors.push(`Next-session handoff is missing section ${section}.`);
}
for (const item of registry.items) {
  if (!handoff.includes(`| ${item.id} |`)) errors.push(`Next-session handoff inventory is missing ${item.id}.`);
}
for (const token of [
  'ef76e02aa023616b0f7e70ed05f59f9bd16b4cf3',
  'K-EVID-007',
  'Do not immediately implement every proposed PBI',
]) {
  if (!handoff.includes(token)) errors.push(`Next-session handoff is missing required token ${token}.`);
}

if (errors.length) {
  console.error('Epic L planning validation failed.');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Epic L planning validation passed: ${registry.items.length} PBIs across ${registry.batches.length} batches.`);
  console.log('Planning only: implementation, Shopify mutation, and publication remain unauthorized.');
}
