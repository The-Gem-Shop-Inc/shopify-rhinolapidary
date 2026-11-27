'use strict';

const { createPersistentResourceAdminWorkspace, createResourceAdminServer } = require('./app');

if (!process.argv.includes('--synthetic')) {
  process.stderr.write('B07 refuses to start without explicit --synthetic isolation.\n');
  process.exit(2);
}

const portArgument = process.argv.indexOf('--port');
const port = portArgument >= 0 ? Number(process.argv[portArgument + 1]) : Number(process.env.B07_RESOURCE_ADMIN_PORT || 4177);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  process.stderr.write('A valid local port is required.\n');
  process.exit(2);
}

const dataFileArgument = process.argv.indexOf('--data-file');
const filePath = dataFileArgument >= 0 ? process.argv[dataFileArgument + 1] : undefined;
const workspace = createPersistentResourceAdminWorkspace({ ...(filePath ? { filePath } : {}) });
const server = createResourceAdminServer({ system: workspace.system, registryStore: workspace.store });
server.listen(port, '127.0.0.1', () => {
  const address = server.address();
  process.stdout.write(`B07 isolated resource administration: http://127.0.0.1:${address.port}\n`);
  process.stdout.write(`Local registry: ${workspace.store.filePath}${workspace.restoredFromBackup ? ' (recovered from backup)' : ''}\n`);
});

function close() { server.close(() => process.exit(0)); }
process.on('SIGINT', close);
process.on('SIGTERM', close);
