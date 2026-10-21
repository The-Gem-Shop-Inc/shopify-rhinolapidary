'use strict';
// Decision preparation only. This module has no Shopify client or mutation path.
const fs = require('node:fs');
const crypto = require('node:crypto');
const {isDeepStrictEqual} = require('node:util');
const registry = require('../../data/metafield-metaobject-definitions.json');
const contract = require('../../data/epic-e-batch-3b-contracts.json');
const {domains} = require('./epic-e-migration-domains');
const {formatTyped} = require('./epic-f-facts');
const roles = require('../../data/epic-f-field-roles.json').fields;
const DIR = 'docs/qa/evidence/epic-f/owner-decision-preparation-2026-10-12';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const units = {volts:'V',hertz:'Hz',horsepower:'hp',revolutions_per_minute:'rpm',inches:'in',pounds:'lb',us_gallons:'US gal'};
const definition = key => registry.metafields.find(d => d.ownerType === 'PRODUCT' && d.namespace === 'rhino' && d.key === key);
const field = key => contract.fields.find(d => d.key === key);
const owningDomain = key => domains.find(d => d.fieldAllowlist.includes('PRODUCT.metafields.rhino.'+key));
const acceptedActions = ['APPROVE_CANDIDATE','SELECT_CANDIDATE','CORRECT_VALUE'];
function approvedRow(row) {
  const r = row.reviewerResponse, d = field(row.fieldKey);
  if(row.decisionState !== 'OWNER_CONFIRMED' || !acceptedActions.includes(r.action)) return null;
  if(!r.reviewedAt || !Number.isFinite(Date.parse(r.reviewedAt)) || !r.reviewer || !r.reviewerRole || !r.evidenceRef) throw Error('Owner identity, date, role and evidence required');
  if(row.applicability !== 'APPLICABLE' && r.applicabilityConfirmed !== true) throw Error('Conditional applicability requires owner confirmation');
  const requiredRoles = row.decisionId === 'B3B-D03' ? ['Technical'] : ['Technical','Operations'];
  if(!requiredRoles.every(role => r.reviewerRole.includes(role))) throw Error('Owning roles required');
  if(!d || !r.canonicalValue || !r.configurationId || !r.configurationLabel || !r.sourceId || !r.physicalStateConfirmed) throw Error('Typed value and factual configuration provenance required');
  if(row.conflictIds.length && r.conflictsResolved !== true) throw Error('Conflicts require explicit resolution');
  if(d.unit === 'horsepower' && !['mechanical','metric'].includes(r.unitQualification)) throw Error('Horsepower convention required');
  if(d.unit === 'us_gallons' && r.unitQualification !== 'US') throw Error('US gallon confirmation required');
  if(row.domain === 'durable_measurements' || row.domain === 'crate_measurements') {
    if(!r.includedAssemblies || !r.fluidState) throw Error('Measured physical contents and fluid state required');
    if(row.fieldKey !== 'net_weight' && (!r.axisMapping || !r.axisMapping.length || !r.axisMapping.width || !r.axisMapping.height)) throw Error('All dimension axes require confirmation');
    if(row.domain === 'crate_measurements' && !r.packingRevision) throw Error('Packing revision required');
  }
  if(acceptedActions.slice(0,2).includes(r.action)) {
    const candidate = row.candidateValues.find(c => c.candidateId === r.candidateId);
    if(!candidate) throw Error('Exact candidate selection required');
    // No kW/mm/ambiguous axis or gallon conversion inferred by this adapter.
    if(!candidate.canonicalValue || !isDeepStrictEqual(candidate.canonicalValue,r.canonicalValue)) throw Error('Candidate needs explicit canonical correction; conversions are not approved here');
  }
  const value = r.canonicalValue;
  const vals = d.type.startsWith('list.') ? value : [value];
  if(d.type !== 'single_line_text_field' && (!Array.isArray(vals) || !vals.length || !vals.every(v => v && Object.keys(v).sort().join(',')==='unit,value' && typeof v.value==='number' && Number.isFinite(v.value) && v.unit===d.unit && (d.type==='rotational_speed'?v.value>=0:v.value>0)))) throw Error('Canonical value/unit mismatch');
  if(d.type === 'single_line_text_field' && !d.allowedValues.includes(value)) throw Error('Unsupported water-system vocabulary');
  if(Array.isArray(value) && new Set(value.map(v=>v.value)).size !== value.length) throw Error('Duplicate discrete frequency');
  return {rowId:'OWNER:'+row.rowId,kind:'metafield',domain:row.domain,targetGid:row.productGid,field:'PRODUCT.metafields.rhino.'+row.fieldKey,type:d.type,desired:value,valueState:'approved',approvalDecisionId:r.evidenceRef,conflictIds:[],before:{metafieldGid:null,requiresFreshRead:true},
    provenance:{sourceId:r.sourceId,sourceValue:d.type==='single_line_text_field'?value:Array.isArray(value)?value.map(v=>String(v.value)):String(value.value),sourceUnit:d.unit,physicalState:d.physicalState,configurationId:r.configurationId,configurationLabel:r.configurationLabel,unitQualification:r.unitQualification,conversionRuleId:null},executionAuthorized:false};
}
function migrationProjection(rows) {
  const result = [];
  for(const d of domains.filter(d=>d.code>=26 && d.code<=31)) {
    const scope = rows.filter(r=>r.domain===d.key), approved = scope.map(approvedRow).filter(Boolean).sort((a,b)=>a.targetGid.localeCompare(b.targetGid)||a.field.localeCompare(b.field));
    // A range is one factual relationship: never project only one endpoint.
    const deferred = [];
    for(const role of roles.filter(r=>r.domain===d.key && r.fields.length===2)) for(const gid of new Set(approved.map(r=>r.targetGid))) {
      const pair=role.fields.map(k=>approved.find(r=>r.targetGid===gid && r.field.endsWith('.'+k)));
      if(pair.some(Boolean) && (!pair.every(Boolean) || !formatTyped(pair,role))) {
        for(const r of pair.filter(Boolean)){deferred.push(r.rowId);approved.splice(approved.indexOf(r),1);}
      }
    }
    result.push({planId:'E-MUT-'+String(d.code).padStart(3,'0'),domain:d.key,candidateRowCount:scope.filter(r=>r.candidateValues.length).length,ownerConfirmedRowCount:scope.filter(r=>r.decisionState==='OWNER_CONFIRMED').length,
      singleConsistentRowCount:scope.filter(r=>r.sourceState==='SINGLE_CONSISTENT_CANDIDATE').length,multipleConsistentRowCount:scope.filter(r=>r.sourceState==='MULTIPLE_CONSISTENT_SOURCES').length,
      conflictRowCount:scope.filter(r=>r.sourceState==='CONFLICT').length,missingRowCount:scope.filter(r=>r.sourceState==='MISSING').length,notApplicableRowCount:scope.filter(r=>r.sourceState==='NOT_APPLICABLE').length,
      executionReadyRowCount:0,approvedRowProjectionCount:approved.length,rows:approved,rangeDeferredRowIds:deferred,executable:false,
      executionGate:'Owner response is necessary; fresh before-read, compare-before-write, separately frozen domain input, authorization, supported E adapter and reconciliation are still required.'});
  }
  return result;
}
function renderProjection(rows, products) {
  const approved=migrationProjection(rows).flatMap(p=>p.rows);
  return products.map(p=>{
    const customer = approved.filter(r=>r.targetGid===p.productGid && definition(r.field.split('.').pop()).accessIntent.storefront==='public_read');
    const displays=roles.map(role=>formatTyped(role.fields.map(k=>customer.find(r=>r.field.endsWith('.'+k))).filter(Boolean),role)).filter(Boolean);
    return {productGid:p.productGid,label:p.label,customerVisibleSpecRows:displays.length,adminOnlyRows:approved.filter(r=>r.targetGid===p.productGid && definition(r.field.split('.').pop()).accessIntent.storefront!=='public_read').length,displays};
  });
}
module.exports={DIR,read,hash,units,definition,field,owningDomain,approvedRow,migrationProjection,renderProjection};
