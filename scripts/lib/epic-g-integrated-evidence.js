'use strict';
// Output-only adapter. No approval, assertion, read or historical expected hash changes.
const fs=require('node:fs'),path=require('node:path'),{fileURLToPath}=require('node:url');
const root=path.resolve('docs/qa/evidence'),dest=path.resolve(require('./epic-g-integrated').dir());
const sync=fs.writeFileSync,asyncWrite=fs.promises.writeFile,callback=fs.writeFile,stream=fs.createWriteStream;
function contains(base,target){return target.toLowerCase().startsWith(base.toLowerCase()+path.sep);}
function destination(file){const name=file instanceof URL?fileURLToPath(file):Buffer.isBuffer(file)?file.toString():file;if(typeof name!=='string')return file;const full=path.resolve(name);if(contains(root,full)&&!contains(dest,full)){const next=path.join(dest,'regression-writes',path.relative(root,full));fs.mkdirSync(path.dirname(next),{recursive:true});return next;}return file;}
fs.writeFileSync=function(file,...args){return sync.call(fs,destination(file),...args);};
fs.promises.writeFile=function(file,...args){return asyncWrite.call(fs.promises,destination(file),...args);};
fs.writeFile=function(file,...args){return callback.call(fs,destination(file),...args);};
fs.createWriteStream=function(file,...args){return stream.call(fs,destination(file),...args);};
module.exports={destination};
