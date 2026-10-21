'use strict';
const fs=require('node:fs'),path=require('node:path'),Ajv=require('ajv/dist/2020'),G=require('./lib/epic-g-foundation'),{paginationProblems}=require('./lib/epic-g-admin-read');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function schemas(){return new Ajv({allErrors:true,strict:false,formats:{'date-time':v=>Number.isFinite(Date.parse(v))}}).addSchema(read('schemas/epic-e-admin-snapshot.schema.json'),'epic-e-admin-snapshot.schema.json');}
function validateRead(envelope){const check=schemas().compile(read('schemas/epic-g-foundation-read.schema.json'));return check(envelope)?paginationProblems(envelope):check.errors.map(e=>e.instancePath+' '+e.message);}
function run(args=process.argv.slice(2)){
 const value=key=>{const i=args.indexOf(key);return i<0?null:args[i+1];},fixture=args.includes('--fixture'),input=value('--read');
 if(!fixture&&!input)throw new Error('Supply --read <recorded Admin read> or --fixture; offline fixtures are never live reconciliation.');
 const f=fixture?read('tests/fixtures/epic-g-foundation.json'):null,envelope=f?.envelope||read(input),problems=validateRead(envelope);
 if(problems.length)throw new Error('Invalid/incomplete Admin read: '+problems.join('; '));
 if(envelope.recordedConnectorLog){const r=envelope.recordedConnectorLog;assertLog(r);}
 const authority=fixture?G.fixtureAuthority(f.authority):G.loadAuthority(),report=G.assess(authority,envelope,{asOf:fixture?f.asOf:new Date().toISOString(),baseline:read('docs/qa/evidence/epic-g/2026-10-15-discovery-summary.json')});
 const check=schemas().compile(read('schemas/epic-g-foundation-report.schema.json'));if(!check(report))throw new Error(JSON.stringify(check.errors));
 const output=value('--output');
 if(output){if(!output.endsWith('.json'))throw new Error('--output must end in .json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(output.replace(/\.json$/,'.md'),G.summaryMarkdown(report));}
 console.log(G.summaryMarkdown(report));
 if(!report.reconciliation.complete)process.exitCode=1;
 return report;
}
function assertLog(r){if(require('./lib/epic-e-owner-response-adapter').hash(fs.readFileSync(r.path))!==r.sha256)throw new Error('Recorded connector transcript drift');}
if(require.main===module){try{run();}catch(error){console.error('G foundation validation failed: '+error.message);process.exitCode=1;}}
module.exports={schemas,validateRead,run};

