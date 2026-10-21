'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./epic-e-owner-response-adapter'),N=require('./epic-e-bom-owner-followup');
const BINDING=N.DIR+'/source-binding.json';let cache;
function verify(){const b=E.read(BINDING),{bindingSha256,...body}=b;assert.equal(E.hash(JSON.stringify(body)),bindingSha256);assert.equal(b.identity,'EPIC_F_RECONCILED_BOM_FOLLOWUP_DEVELOPMENT_2026_10_14');const parent=E.read(E.DIR+'/source-binding.json'),{bindingSha256:p,...pbody}=parent;assert.equal(E.hash(JSON.stringify(pbody)),p);assert.equal(p,'4451fffaee890c77177677a196754fb16e86d33f7c3ba9974307842627aefa31');assert.equal(b.parentSourceBindingSha256,p);
 for(const r of [...b.provenance,...b.sourceAfter,...b.runtimeDelta,...b.qaDelta])assert.equal(E.hash(fs.readFileSync(r.path)),r.sha256,'Current binding drift '+r.path);
 for(const r of [...b.runtimeDelta,...b.qaDelta])if(r.oldSha256)assert.equal(E.hash(r.originalBody),r.oldSha256);
 const media=E.read(require('./epic-f-owner-activation-binding').PARENT);for(const r of media.provenance.filter(r=>r.path!=='scripts/lib/epic-f-live-media-activation.js'))assert.equal(E.hash(fs.readFileSync(r.path)),r.sha256);assert.equal(E.hash(fs.readFileSync('snippets/rhino-product-media-eligibility.liquid')),media.runtimeDelta[0].sha256);
 const fingerprint=E.digest(b);if(cache?.fingerprint===fingerprint){assert(Date.now()<cache.expiresAt);return b;}const s=N.loadCurrent();assert.equal(s.input.rows.length,72);assert.equal(require('./epic-f-customer-release').verifyRelease().release.grants.length,70);cache={fingerprint,expiresAt:Date.parse(s.receipt.expiresAt)};return b;}
module.exports={BINDING,verify};
