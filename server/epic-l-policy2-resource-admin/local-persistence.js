'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function defaultRegistryFile() {
  const base = process.env.LOCALAPPDATA || path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'RhinoLapidary', 'Policy2ResourceAdmin', 'registry.json');
}

function assertOutsideRepository(rootDir, filePath) {
  const root = path.resolve(rootDir);
  const target = path.resolve(filePath);
  if (target === root || target.startsWith(`${root}${path.sep}`)) {
    throw Object.assign(new Error('Administrative runtime data must remain outside the repository'), { code: 'RUNTIME_DATA_INSIDE_REPOSITORY' });
  }
  return target;
}

class AtomicRegistryStore {
  constructor({ rootDir, filePath = defaultRegistryFile() }) {
    this.filePath = assertOutsideRepository(rootDir, filePath);
    this.backupPath = `${this.filePath}.backup`;
  }

  readCandidates() {
    return [this.filePath, this.backupPath].filter((candidate) => fs.existsSync(candidate)).map((candidate) => ({
      path: candidate,
      archive: JSON.parse(fs.readFileSync(candidate, 'utf8')),
    }));
  }

  loadValidated(validate) {
    const failures = [];
    for (const candidate of [this.filePath, this.backupPath]) {
      if (!fs.existsSync(candidate)) continue;
      try {
        const archive = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        validate(archive);
        return { archive, restoredFromBackup: candidate === this.backupPath, path: candidate };
      } catch (error) {
        failures.push({ path: candidate, code: error.code || 'INVALID_LOCAL_ARCHIVE' });
      }
    }
    if (failures.length) {
      throw Object.assign(new Error('No valid local registry or backup could be restored'), { code: 'LOCAL_REGISTRY_RECOVERY_FAILED', failures });
    }
    return null;
  }

  save(archive, validate) {
    validate(archive);
    const directory = path.dirname(this.filePath);
    fs.mkdirSync(directory, { recursive: true });
    const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    const text = `${JSON.stringify(archive, null, 2)}\n`;
    let descriptor;
    try {
      descriptor = fs.openSync(tempPath, 'wx', 0o600);
      fs.writeFileSync(descriptor, text, 'utf8');
      fs.fsyncSync(descriptor);
      fs.closeSync(descriptor);
      descriptor = null;
      validate(JSON.parse(fs.readFileSync(tempPath, 'utf8')));
      if (fs.existsSync(this.filePath)) {
        try {
          const current = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
          validate(current);
          fs.copyFileSync(this.filePath, this.backupPath);
        } catch {
          // Preserve the existing last-valid backup when the current file is corrupt.
        }
      }
      fs.renameSync(tempPath, this.filePath);
      return { filePath: this.filePath, backupPath: this.backupPath, bytes: Buffer.byteLength(text) };
    } finally {
      if (descriptor != null) fs.closeSync(descriptor);
      if (fs.existsSync(tempPath)) fs.rmSync(tempPath);
    }
  }
}

module.exports = { AtomicRegistryStore, assertOutsideRepository, defaultRegistryFile };
