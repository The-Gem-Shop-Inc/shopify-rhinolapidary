'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),R=require('./lib/epic-g-admin-read'),E=require('./lib/epic-e-owner-response-adapter'),D=require('./lib/epic-e-final-owner-delta');
require('dotenv').config({quiet:true});
const args=process.argv.slice(2),value=k=>{const i=args.indexOf(k);return i<0?null:args[i+1];};
(async()=>{
 const output=value('--output');assert(output,'Supply --output <read-envelope.json>');
 const log=value('--connector-log');let envelope;
 if(log){
  const transcript=E.read(log);envelope=await R.replayConnector(transcript);
  envelope.recordedConnectorLog={path:log,sha256:E.hash(fs.readFileSync(log))};
 }else{
  const credential=process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if(!credential){console.error('ADMIN_READ_UNAVAILABLE: no authorized Admin credential. Zero requests/mutations. Use the connected read-only query tool and --connector-log, or validate explicitly offline with --fixture.');process.exitCode=2;return;}
  const receipt=E.read(D.RECEIPT),shop=E.read(receipt.after.path).shop;
  envelope=await R.capture({shop,accessToken:credential,apiVersion:require('./lib/epic-e-admin-audit').API_VERSION});
 }
 const problems=R.paginationProblems(envelope);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(envelope,null,2)+'\n');
 console.log(JSON.stringify({sourceKind:envelope.sourceKind,transport:envelope.transport,readRequests:envelope.operations.length,mutations:0,paginationProblems:problems}));
 if(problems.length)process.exitCode=1;
})().catch(error=>{console.error('G Admin read failed: '+error.message);process.exitCode=1;});

