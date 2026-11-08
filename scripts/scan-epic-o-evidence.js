'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const files = [
  ...fs.readdirSync(path.join(root, 'data')).filter((name) => name.startsWith('epic-o-')).map((name) => path.join(root, 'data', name)),
  ...fs.readdirSync(path.join(root, 'schemas')).filter((name) => name.startsWith('epic-o-')).map((name) => path.join(root, 'schemas', name)),
  ...fs.readdirSync(path.join(root, 'docs', 'project')).filter((name) => name.startsWith('epic-o-')).map((name) => path.join(root, 'docs', 'project', name)),
  path.join(root, 'docs', 'project', 'implementation-records', 'o-pbi-001-005-native-mvp.md'),
  path.join(root, 'docs', 'rhino-lapidary-pbi-tracker-epic-o.md'),
  path.join(root, 'tests', 'fixtures', 'epic-o-native-account.json'),
];

const rules = [
  ['Shopify secret', /shp(?:at|ca|ss)_[A-Za-z0-9_]+/i],
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['customer record GID', /gid:\/\/shopify\/(?:Customer|Order|MailingAddress)\//i],
  ['email address', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ['credential-bearing URL', /https?:\/\/[^\s"/]+:[^\s"@]+@/i],
  ['URL query or fragment', /https?:\/\/[^\s")]+[?#][^\s")]+/i],
];

const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const [name, pattern] of rules) if (pattern.test(text)) findings.push(`${path.relative(root, file)}: ${name}`);
}

if (findings.length) {
  console.error('Epic O evidence PII/secret scan failed.');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log(`Epic O evidence PII/secret scan passed for ${files.length} artifacts.`);
}
