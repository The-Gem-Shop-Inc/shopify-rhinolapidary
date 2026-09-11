const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
require('dotenv').config({quiet:true});
const {runAdminAudit,API_VERSION}=require('./lib/epic-e-admin-audit');

const args=process.argv.slice(2); const value=(flag)=>{const i=args.indexOf(flag);return i>=0?args[i+1]:null;};
const shop=value('--shop') || process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_ADMIN_SHOP;
const token=process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const only=value('--only')?.split(',').filter(Boolean);
if (!shop || !token) {
  console.error('BLOCKED: no authorized Shopify Admin credential was found. No query ran and no snapshot was written.');
  console.error('Authorized run: $env:SHOPIFY_STORE_DOMAIN="store.myshopify.com"; $env:SHOPIFY_ADMIN_ACCESS_TOKEN="<read-only token>"; npm run audit:epic-e-admin');
  process.exit(2);
}
(async()=>{
  const snapshot=await runAdminAudit({shopDomain:shop,accessToken:token,only:only||undefined,apiVersion:value('--api-version')||API_VERSION,operational:args.includes('--operational')});
  const schema=JSON.parse(fs.readFileSync(path.join(process.cwd(),'schemas/epic-e-admin-snapshot.schema.json'),'utf8'));
  const validate=new Ajv2020({allErrors:true,strict:false,formats:{'date-time':true}}).compile(schema);
  if (!validate(snapshot)) throw new Error(`Snapshot schema validation failed: ${validate.errors.map((entry)=>`${entry.instancePath} ${entry.message}`).join('; ')}`);
  const date=snapshot.capturedAt.slice(0,10);
  const output=value('--output') || `docs/qa/evidence/epic-e/${date}-epic-e-admin-snapshot.json`;
  fs.mkdirSync(path.dirname(path.join(process.cwd(),output)),{recursive:true});
  fs.writeFileSync(path.join(process.cwd(),output),`${JSON.stringify(snapshot,null,2)}\n`);
  console.log(`Read-only Admin snapshot written to ${output}.`);
  const failed=Object.entries(snapshot.datasets).filter(([,d])=>!['success','not_queried'].includes(d.queryStatus));
  if (failed.length) { console.error(`Completed with ${failed.length} inaccessible/failed dataset(s): ${failed.map(([n,d])=>`${n}:${d.queryStatus}`).join(', ')}`); process.exitCode=1; }
})().catch((error)=>{console.error(`Admin audit failed: ${error.message}`);process.exit(1)});
