'use strict';
// Independent command log, not a replacement for any existing validator.
const fs=require('node:fs'),cp=require('node:child_process'),R=require('./lib/epic-g-machine-routes'),D=require('./deploy-epic-g-machine-routes-preview');
async function run(){const gates=[],sourceRefs=D.GATE_SOURCES.map(R.digest);fs.mkdirSync(R.DIR+'/commands',{recursive:true});fs.mkdirSync(R.DIR+'/g2-diagnostic',{recursive:true});const commands=[...D.REQUIRED,'npm.cmd run validate:epic-g-products'];let next=0;async function worker(){while(next<commands.length){const command=commands[next++];
 const startedAt=new Date().toISOString(),name=command.split(' ').at(-1).replace(/:/g,'-');let stdout='',stderr='';
 const child=cp.spawn(process.env.ComSpec||'cmd.exe',['/d','/s','/c',command],{windowsHide:true,env:{...process.env,RHINO_G2_EVIDENCE_DIR:R.DIR+'/g2-diagnostic'},stdio:['ignore','pipe','pipe']});child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
 const record={command,startedAt,completedAt:new Date().toISOString(),exitCode,sourceRefs,stdout,stderr};fs.writeFileSync(R.DIR+'/commands/'+name+'.json',JSON.stringify(record,null,2)+'\n');gates.push({...record,stdout:undefined,stderr:undefined});fs.writeFileSync(R.DIR+'/predeployment-gates.json',JSON.stringify(gates,null,2)+'\n');console.log(JSON.stringify({command,exitCode}));
 }}await Promise.all([worker(),worker(),worker()]);if(gates.filter(g=>D.REQUIRED.includes(g.command)).some(g=>g.exitCode!==0))process.exitCode=1;
}
if(require.main===module)run().catch(e=>{console.error(e.stack);process.exitCode=1;});
