'use strict';
// The historical validator is itself receipt-bound. Adapt only its preservation
// predicate in memory, retaining all its resource/warranty/schema assertions.
const fs=require('node:fs'),assert=require('node:assert/strict'),Module=require('node:module'),path=require('node:path');
const P=require('./lib/epic-g-current-protection');P.activate();P.assertTemplate();
const file=path.resolve('scripts/validate-epic-f-support-resources.js'),source=fs.readFileSync(file,'utf8');
const needle='&& !exactDevelopmentMedia && !exactOwnerSuccessor)';assert.equal(source.split(needle).length,2,'Historical support adapter no longer matches the bound assertion');
const adapted="'use strict';\nconst currentProtection=require('./lib/epic-g-current-protection');\n"+source.replace(needle,'&& !exactDevelopmentMedia && !exactOwnerSuccessor && !currentProtection.surfaceMatches(path, hash))');
const current=new Module(file,module);current.filename=file;current.paths=module.paths;current._compile(adapted,file);
console.log(JSON.stringify({currentRelease:P.currentRelease(),historicalSourceUnchanged:true,adaptedPredicate:'Exact current template delta or receipt-proven predecessor; all other assertions retained'}));
