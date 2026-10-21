'use strict';
const fs=require('node:fs'),V=require('./lib/epic-j-j1-portability-v2');
try{
  const a=process.argv.slice(2),get=k=>a[a.indexOf(k)+1],root=a.includes('--root')?get('--root'):process.cwd();let result;
  if(a.includes('--index'))result=V.indexGate({root,indexFile:a.includes('--index-file')?get('--index-file'):undefined});
  else if(a.includes('--tree'))result=V.treeGate({root,tip:get('--tree'),...(a.includes('--base')?{base:get('--base')}:{} )});
  else if(a.includes('--publication-list'))result=V.publication({root,paths:JSON.parse(fs.readFileSync(get('--publication-list'),'utf8')).paths,...(a.includes('--repository')?{repository:get('--repository')}:{}),...(a.includes('--audience')?{audience:get('--audience')}:{} )});
  else result=V.verify({root,mode:a.includes('--mode')?get('--mode'):'local'});
  console.log(JSON.stringify(result));process.exitCode=result.status==='PASS'?0:2;
}catch(e){console.log(JSON.stringify({status:'FAIL',reasonCode:e.code||'VALIDATOR_ERROR',...(e.path?{path:e.path}:{})}));process.exitCode=1;}
