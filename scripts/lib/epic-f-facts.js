'use strict';
const { evaluate, classification } = require('./epic-f-consumer');
const roles = require('../../data/epic-f-field-roles.json');
const upstream = require('../../data/epic-e-batch-3b-contracts.json');
const validateProjection = new (require('ajv/dist/2020'))({strict:false,allErrors:true}).compile(require('../../schemas/epic-f-fact-projection.schema.json'));
const { validateRenderedText } = require('../validate-brand-claims');
const fieldPath = key => 'PRODUCT.metafields.rhino.' + key;
const decimal = /^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/;
const safeText = s => typeof s === 'string' && s.trim().length > 0 && s.length <= 1200 && !/[<>{}\r\n]/.test(s) && !validateRenderedText('machine-fact',s).length;
const unitLabels = { volts:'V',hertz:'Hz',revolutions_per_minute:'rpm',inches:'in',pounds:'lb',us_gallons:'US gal',horsepower:'hp' };
const canonicalDecimal = s => s.includes('.') ? s.replace(/0+$/,'').replace(/\.$/,'') : s;
function compareDecimal(a,b) {
  const scale=Math.max((a.split('.')[1]||'').length,(b.split('.')[1]||'').length);
  const integer=s=>BigInt(s.replace('.','')+'0'.repeat(scale-(s.split('.')[1]||'').length));
  return integer(a)<=integer(b);
}
// No arithmetic conversions, inferred units, fixed decimals or value fallback.
// This formatter feeds BOTH compact and detailed surfaces.
function formatTyped(rows, role) {
  if(rows.length!==role.fields.length || !rows.length)return null;
  const parts=[];
  for(let i=0;i<rows.length;i++) {
    const row=rows[i], def=upstream.fields.find(f=>f.key===role.fields[i]), p=row.provenance;
    if(!def || row.type!==def.type || !p || p.physicalState!==def.physicalState || !safeText(p.configurationLabel) || !safeText(p.configurationId) || !safeText(p.sourceId) || p.conversionRuleId!==null)return null;
    if(def.type==='single_line_text_field') {
      if(!def.allowedValues?.includes(row.desired) || p.sourceValue!==row.desired || p.sourceUnit!==null)return null;
      parts.push({display:row.desired==='recirculating_filtered'?'Recirculating, filtered':null});continue;
    }
    const values=def.type.startsWith('list.')?row.desired:[row.desired];
    const sourceValues=def.type.startsWith('list.')?p.sourceValue:[p.sourceValue];
    if(!Array.isArray(values)||!values.length||!Array.isArray(sourceValues)||values.length!==sourceValues.length)return null;
    const rendered=[];
    for(let n=0;n<values.length;n++) {
      const v=values[n], raw=sourceValues[n];
      if(!v || Array.isArray(v) || Object.keys(v).sort().join(',')!=='unit,value' || typeof v.value!=='number' || !Number.isFinite(v.value) || typeof raw!=='string' || !decimal.test(raw) || raw.length>80 || !decimal.test(String(v.value)) || canonicalDecimal(raw)!==canonicalDecimal(String(v.value)) || v.unit!==def.unit || p.sourceUnit!==def.unit || !unitLabels[def.unit])return null;
      if(['dimension','weight','voltage','list.frequency','volume','power'].includes(def.type) && v.value<=0)return null;
      if(def.unit==='horsepower' && !['mechanical','metric','manufacturer_nameplate'].includes(p.unitQualification))return null;
      rendered.push(raw);
    }
    if(new Set(rendered).size!==rendered.length)return null;
    parts.push({value:rendered[0],display:rendered.join(', ')+' '+unitLabels[def.unit]+(def.unit==='horsepower'?' ('+(p.unitQualification==='manufacturer_nameplate'?'manufacturer nameplate':p.unitQualification)+')':''),unit:def.unit});
  }
  if(parts.length===2) {
    const [a,b]=rows.map(r=>r.provenance);
    if(parts[0].unit!==parts[1].unit || a.configurationId!==b.configurationId || a.configurationLabel!==b.configurationLabel || a.physicalState!==b.physicalState || a.sourceId!==b.sourceId || !compareDecimal(parts[0].value,parts[1].value))return null;
  }
  return {label_key:role.labelKey,display:parts.length===2?(parts[0].value===parts[1].value?parts[1].display:parts[0].value+'–'+parts[1].display):parts[0].display,configuration:rows[0].provenance.configurationLabel,
    source:rows.map(r=>({field:r.field,domain:r.domain,productGid:r.targetGid,rowId:r.rowId,approvalDecisionId:r.approvalDecisionId,...r.provenance}))};
}
function quantityMap(value, members) {
  // Raw JSON keeps duplicate key evidence; never let JSON.parse erase it first.
  if(typeof value==='string') {
    // Canonical exact-GID keys need no JSON escapes. Reject escaped aliases so
    // duplicate spellings cannot disappear when JSON.parse normalizes keys.
    if(value.includes('\\'))return null;
    const keys=[...value.matchAll(/"(gid:\/\/shopify\/Product\/[0-9]+)"\s*:/g)].map(m=>m[1]);
    if(new Set(keys).size!==keys.length)return null;
    try {value=JSON.parse(value);} catch{return null;}
  }
  if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).sort().join('|')!==members.slice().sort().join('|')||!Object.values(value).every(n=>Number.isSafeInteger(n)&&n>0))return null;
  return value;
}
function projectFacts(context, productGid, asOf) {
  const out={schemaVersion:1,fixture_only:context.fixtureOnly===true,product_gid:productGid,key_specs:[],spec_groups:[],contents:[],suppressed:[]};
  function row(domain,key) {
    const query={productGid,domain,field:fieldPath(key)}, state=evaluate(context,query,asOf);
    const rows=(context.bundles[domain]?.rows||[]).filter(r=>r.targetGid===productGid&&r.field===query.field&&r.domain===domain);
    if(!state.eligible || (!context.fixtureOnly && state.suppressed) || rows.length!==1){out.suppressed.push({domain,field:query.field,reasons:state.reasons});return null;}
    return rows[0];
  }
  if(classification(context,productGid)!=='machine')return out;
  for(const role of roles.fields) {
    const rows=role.fields.map(key=>row(role.domain,key));
    const value=rows.every(Boolean)?formatTyped(rows,role):null;
    if(!value){if(rows.some(Boolean))out.suppressed.push({field:role.id,reasons:['typed_value_or_context_invalid']});continue;}
    if(role.keyRole && out.key_specs.length<roles.keyLimit)out.key_specs.push(value);
    let group=out.spec_groups.find(g=>g.id===role.domain);
    if(!group)out.spec_groups.push(group={id:role.domain,label_key:'products.product.machine_facts.groups.'+role.domain,rows:[]});
    group.rows.push(value);
  }
  const semanticRows=roles.contents.map(role=>({role,row:row(role.domain,role.field)}));
  const membership=new Map();
  for(const x of semanticRows)if(x.row&&Array.isArray(x.row.desired))for(const gid of x.row.desired)membership.set(gid,(membership.get(gid)||0)+1);
  function group(meaning,item){let g=out.contents.find(g=>g.meaning===meaning);if(!g)out.contents.push(g={meaning,label_key:'products.product.machine_facts.'+meaning,items:[]});g.items.push(item);}
  for(const {role,row:source} of semanticRows) {
    if(!source)continue;
    const members=source.desired;
    if(source.type!=='list.product_reference'||!Array.isArray(members)||!members.every(g=>/^gid:\/\/shopify\/Product\/[0-9]+$/.test(g))){out.suppressed.push({field:role.field,reasons:['malformed_membership']});continue;}
    let quantities=null;
    if(role.quantityRequired){const q=row('included_components','included_quantities');quantities=q?.type==='json'?quantityMap(q.desired,members):null;if(!quantities){out.suppressed.push({field:role.field,reasons:['quantity_join_invalid']});continue;}}
    for(const gid of members) {
      const candidates=context.after[role.domain]?.datasets.products.records.filter(p=>p.id===gid)||[];
      const target=candidates.length===1?candidates[0]:null;
      const identity=context.identity.productIdentities.find(p=>p.productGid===gid);
      if(membership.get(gid)!==1 || gid===productGid || !['replacement_part','consumable','accessory'].includes(classification(context,gid)) || !target || target.status!=='ACTIVE' || !target.publishedAt || target.customerVisible!==true || !identity || target.handle!==identity.handle || !safeText(target.title) || /compatible|fits?\b/i.test(target.title)) {
        out.suppressed.push({targetGid:gid,field:role.field,reasons:['conflicting_or_orphan_or_invisible_target']});continue;
      }
      // Native card, a minimal exact-GID Product projection; never prose/media/fit.
      const product={id:gid.split('/').pop(),title:target.title,url:'/products/'+identity.handle,featured_media:null};
      group(role.meaning,{product,quantity:quantities?.[gid]??null,source:{field:source.field,rowId:source.rowId,productGid,targetGid:gid,approvalDecisionId:source.approvalDecisionId}});
    }
  }
  const lines=row('included_components','noncatalog_components');
  if(lines) {
    if(lines.type!=='json'||!Array.isArray(lines.desired))out.suppressed.push({field:lines.field,reasons:['invalid_noncatalog']});
    else for(const line of lines.desired) {
      if(!line||Object.keys(line).sort().join(',')!=='label,meaning,quantity'||!safeText(line.label)||!Number.isSafeInteger(line.quantity)||line.quantity<=0||!['included','not_included','optional'].includes(line.meaning)||lines.desired.filter(l=>l?.label===line.label).length!==1){out.suppressed.push({field:lines.field,reasons:['invalid_or_conflicting_noncatalog']});continue;}
      group(line.meaning==='included'?'noncatalog':line.meaning,{label:line.label,quantity:line.quantity,source:{field:lines.field,rowId:lines.rowId,productGid,approvalDecisionId:lines.approvalDecisionId}});
    }
  }
  const order=['included','noncatalog','not_included','optional','recommended'];out.contents.sort((a,b)=>order.indexOf(a.meaning)-order.indexOf(b.meaning));
  if(!validateProjection(out))throw new Error('Invalid governed projection: '+JSON.stringify(validateProjection.errors));
  return out;
}
module.exports={projectFacts,formatTyped,quantityMap,fieldPath,safeText};
