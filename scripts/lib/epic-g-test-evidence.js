'use strict';
// Preserve prior QA receipts while running unchanged historical test commands.
// Only output destinations are redirected; reads and assertions are untouched.
const fs=require('node:fs'),path=require('node:path'),write=fs.writeFileSync,writeAsync=fs.promises.writeFile;
const base=path.resolve('docs/qa/evidence'),dest=path.resolve('docs/qa/evidence/epic-g/g3b-2026-10-19');
function destination(file){if(typeof file==='string'){const full=path.resolve(file);if(full.startsWith(base+path.sep)&&!full.startsWith(dest+path.sep)){file=path.join(dest,'regression-writes',path.relative(base,full));fs.mkdirSync(path.dirname(file),{recursive:true});}}return file;}
fs.writeFileSync=function(file,...args){return write.call(fs,destination(file),...args);};
// Playwright screenshots use the asynchronous writer, unlike the historical JSON reports.
fs.promises.writeFile=function(file,...args){return writeAsync.call(fs.promises,destination(file),...args);};
