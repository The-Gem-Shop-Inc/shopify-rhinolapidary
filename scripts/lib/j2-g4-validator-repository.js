'use strict';

const cp = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');

const RUNTIME_ROOTS = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];

function createRepository(overrides = {}) {
  const repository = {};
  repository.readBuffer = overrides.readBuffer || ((file) => fs.readFileSync(file));
  repository.read = overrides.read || ((file) => repository.readBuffer(file).toString('utf8'));
  repository.hash = overrides.hash || ((file) => crypto.createHash('sha256').update(repository.readBuffer(file)).digest('hex'));
  repository.git = overrides.git || ((...args) => cp.execFileSync('git', args, { encoding: 'utf8' }).trim());
  repository.show = overrides.show || ((ref, file) => cp.execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8' }));
  repository.files = overrides.files || ((range) => repository.git('diff', '--name-only', range).split(/\r?\n/).filter(Boolean));
  repository.exists = overrides.exists || ((file) => fs.existsSync(file));
  repository.commitExists = overrides.commitExists || ((commit) => cp.spawnSync('git', ['cat-file', '-e', `${commit}^{commit}`]).status === 0);
  repository.isAncestor = overrides.isAncestor || ((ancestor, descendant = 'HEAD') => cp.spawnSync('git', ['merge-base', '--is-ancestor', ancestor, descendant]).status === 0);
  repository.diffQuiet = overrides.diffQuiet || ((ref, file) => cp.spawnSync('git', ['diff', '--quiet', ref, '--', file]).status === 0);
  repository.runtimeStatus = overrides.runtimeStatus || (() => cp.execFileSync(
    'git',
    ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', ...RUNTIME_ROOTS],
    { encoding: 'utf8' },
  ));
  repository.now = overrides.now || (() => Date.now());
  return repository;
}

module.exports = { RUNTIME_ROOTS, createRepository };
