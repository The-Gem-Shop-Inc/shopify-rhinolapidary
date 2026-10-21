'use strict';
const J=require('./lib/epic-j-j0');
const out=J.validate();J.write('readiness.json',out);console.log(JSON.stringify(out));process.exitCode=out.status==='PASS'?0:out.status==='BLOCKED'?2:1;
