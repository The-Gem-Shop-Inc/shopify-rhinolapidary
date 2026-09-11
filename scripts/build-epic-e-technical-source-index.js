const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const auditPath = 'docs/media/rhino-shopify-files-content-audit-2026-08-20.md';
const technicalRoot = 'docs/product/silica-gem';
const outputPath = 'data/epic-e-technical-source-index.json';
const generatedAt = process.env.EPIC_E_GENERATED_AT || '2026-09-02T00:00:00.000Z';
const slug = (value) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function familyFor(name) {
  const n = name.toLowerCase();
  return ['beadmaster','shapemaster','trimmaster','lapmaster','sawmaster','jademaster','tumblemaster'].find((family) => n.includes(family)) || (n.includes('em-1') || n.includes('em_1') ? 'em_1' : null);
}
function modelFor(name) {
  const family = familyFor(name);
  if (!family) return null;
  const match = name.match(/(?:12|18|24|36|14|8|6)(?:[^0-9]|$)/);
  return family === 'em_1' ? 'EM-1' : `${family.replace(/^./, (c) => c.toUpperCase())}${match ? ` ${match[0].match(/[0-9]+/)[0]}` : ''}`;
}
function evidenceClass(name, summary = '') {
  const n = `${name} ${summary}`.toLowerCase();
  if (/dimension/.test(n)) return 'dimension_drawing';
  if (/exploded/.test(n)) return 'exploded_diagram';
  if (/instruction|manual/.test(n)) return 'manual';
  if (/pallet|crate|packing|ağırlıkları/.test(n)) return 'packing_crate_pallet_sheet';
  if (/part list with picture|bom/.test(n)) return 'bom';
  if (/part ordering|price|order list/.test(n)) return 'price_order_list';
  if (/part list/.test(n)) return 'parts_list';
  if (/polic/.test(n)) return 'policy';
  if (/pamphlet|catalog/.test(n)) return 'catalog';
  if (/video/.test(n)) return 'video';
  return 'other';
}
function conflictsFor(name) {
  const n = name.toLowerCase();
  const map = {
    beadmaster:['C-003','C-004','C-005','C-006'], shapemaster:['C-007','C-008','C-009','C-010'],
    trimmaster:['C-011','C-012','C-013','C-014','C-015'], 'lapmaster 12':['C-016','C-017','C-018','C-019'],
    'lapmaster_12':['C-016','C-017','C-018','C-019'], 'lapmaster 18':['C-020','C-021','C-022'], 'lapmaster_18':['C-020','C-021','C-022'],
    'sawmaster 18':['C-023','C-024','C-025','C-026','C-027'], 'sawmaster_18':['C-023','C-024','C-025','C-026','C-027'],
    'sawmaster 24':['C-028','C-029','C-030','C-031','C-032'], 'sawmaster_24':['C-028','C-029','C-030','C-031','C-032'],
    jademaster:['C-036','C-037'], tumblemaster:['C-038','C-039'], 'em-1':['C-001','C-002','C-040','C-041'], 'em_1':['C-001','C-002','C-040','C-041']
  };
  return [...new Set(Object.entries(map).filter(([key]) => n.includes(key)).flatMap(([,ids]) => ids))];
}

const sources = [];
for (const entry of fs.readdirSync(path.join(root, technicalRoot), { withFileTypes: true }).filter((entry) => entry.isFile())) {
  const relative = `${technicalRoot}/${entry.name}`;
  const cls = evidenceClass(entry.name);
  sources.push({sourceId:`repo-${slug(entry.name)}`,origin:'repository',shopifyFileGid:null,shopifyHostedUrl:null,repositorySourcePath:relative,filename:entry.name,mimeType:entry.name.toLowerCase().endsWith('.pdf')?'application/pdf':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',contentHash:sha256(path.join(root,relative)),createdAt:null,documentRevision:null,sourceOrganization:'Silica-Gem / Rhino legacy source set',rightsState:'needs_confirmation',candidateMachineFamily:familyFor(entry.name),candidateProductModel:modelFor(entry.name),evidenceClass:cls,extractionStatus:'content_analyzed',associationConfidence:familyFor(entry.name)?'high':'medium',authoritativeStatus:'candidate',decisionState:conflictsFor(entry.name).length?'conflicting':'observed',supersessionState:'current_unknown',duplicateGroup:null,existingConflictIds:conflictsFor(entry.name),factsObserved:cls==='dimension_drawing'?['dimension callouts by engineering view']:cls==='packing_crate_pallet_sheet'?['machine, crate, weight, and tank rows by physical state']:['candidate component, part, or technical observations'],relationshipsObserved:['filename association is candidate evidence only'],humanReviewRequired:true});
}

const auditLines = fs.readFileSync(path.join(root,auditPath),'utf8').split(/\r?\n/);
let section = '';
for (const line of auditLines) {
  if (line === '## Video inventory') section = 'video';
  if (line === '## Document and generic file inventory') section = 'document';
  if (!['video','document'].includes(section) || !/^\| \d+ \|/.test(line)) continue;
  const cells = line.split('|').slice(1,-1).map((cell) => cell.trim());
  const [row, filename, summary] = cells;
  const createdIndex = section === 'video' ? 7 : 5;
  const gidIndex = section === 'video' ? 8 : 6;
  const urlIndex = section === 'video' ? 9 : 7;
  const notesIndex = section === 'video' ? 10 : 8;
  const notes = cells[notesIndex] || '';
  const duplicate = notes.match(/(?:DOC-EXACT|VID-PROBABLE)-\d+/)?.[0] || null;
  const cls = section === 'video' ? 'video' : evidenceClass(filename, summary);
  const analyzedNames = new Set(['Rhino_Instructions_Lapmaster_12.docx','Rhino_Instructions_Sawmaster_18.docx','Rhino_EM-1_Components_and_Accessories_List.docx','EM-1_Instructions.docx','EM-1_Instructions.pdf']);
  const localEquivalent = sources.find((source) => slug(source.filename.replace(/\.(pdf|xlsx)$/i,'')) === slug(filename.replace(/\.(pdf|docx)$/i,'')));
  const analyzed = analyzedNames.has(filename) || Boolean(localEquivalent);
  const linkedConflicts = analyzed ? conflictsFor(`${filename} ${summary}`) : [];
  sources.push({sourceId:`shopify-${section}-${row.padStart(3,'0')}-${slug(filename)}`,origin:'shopify_files',shopifyFileGid:cells[gidIndex].replace(/`/g,''),shopifyHostedUrl:cells[urlIndex],repositorySourcePath:localEquivalent?.repositorySourcePath || null,filename,mimeType:section==='video'?'video/shopify-hosted':cells[4],contentHash:null,createdAt:cells[createdIndex],documentRevision:null,sourceOrganization:'Rhino Lapidary Shopify Files',rightsState:/Internal/.test(notes)?'internal_or_restricted':'needs_confirmation',candidateMachineFamily:familyFor(`${filename} ${summary}`),candidateProductModel:modelFor(`${filename} ${summary}`),evidenceClass:cls,extractionStatus:analyzed?'content_analyzed':'metadata_indexed',associationConfidence:familyFor(`${filename} ${summary}`)?'high':'low',authoritativeStatus:'candidate',decisionState:linkedConflicts.length?'conflicting':'observed',supersessionState:duplicate?'duplicate_candidate':'current_unknown',duplicateGroup:duplicate,existingConflictIds:linkedConflicts,factsObserved:analyzed?[summary]:[],relationshipsObserved:familyFor(`${filename} ${summary}`)?['candidate machine association from audited content or filename; not approved compatibility']:[],humanReviewRequired:true});
}

const sourceId = (fragment, origin = null) => sources.find((source) => source.filename.toLowerCase().includes(fragment.toLowerCase()) && (!origin || source.origin === origin))?.sourceId;
const facts = [
  ['machine_dimensions','BeadMaster 6','assembled drawing','692.5 × 463.19 × 550.66','mm','bead  machine dimensions','drawing page 1',['C-005']],
  ['machine_dimensions','ShapeMaster 6','assembled drawing','696.5 × 568 × 531.31','mm','shape machine dimensions','drawing page 1',['C-009']],
  ['machine_dimensions','TrimMaster','assembled drawing','630.7 × 378.75 × 545.3','mm','trim saw machine dimensions','drawing page 1',['C-015']],
  ['machine_dimensions','LapMaster 18','assembled drawing','771.5 × 613.9 × 584.5','mm','lapmaster 18','drawing page 1',['C-021']],
  ['machine_dimensions','SawMaster 18','assembled drawing','1320.52 × 928 × 1252.7','mm','saw machine 18','drawing page 1',['C-026']],
  ['machine_dimensions','SawMaster 24','assembled drawing','1418.32 × 928 × 1348','mm','saw machine 24','drawing page 1',['C-031']],
  ['voltage','LapMaster 12','sellable configuration candidate',110,'V','instructions_lapmaster_12','Motor and Electrical Requirements',['C-016']],
  ['motor_power','LapMaster 12','sellable configuration candidate',1,'hp','instructions_lapmaster_12','Motor and Electrical Requirements',['C-018']],
  ['machine_dimensions','LapMaster 12','instruction-described machine','19 × 25','in','instructions_lapmaster_12','GENERAL',['C-017']],
  ['net_weight','LapMaster 12','instruction-described machine',90,'lb','instructions_lapmaster_12','GENERAL',['C-017']],
  ['voltage','SawMaster 18','sellable configuration candidate',110,'V','instructions_sawmaster_18','Electrical Requirements',['C-024']],
  ['motor_power','SawMaster 18','primary motor candidate',0.75,'hp','instructions_sawmaster_18','Electrical Requirements',['C-023']],
  ['arbor_mount','SawMaster 18','blade mount',1,'in','instructions_sawmaster_18','Arbor and Blade Mount',['C-025']],
  ['wheel_blade_size','SawMaster 18','supported blade candidate','12–18','in','instructions_sawmaster_18','Arbor and Blade Mount',['C-025']],
  ['water_system','SawMaster 18','cutting oil reservoir','8–10','gal','instructions_sawmaster_18','INITIAL SETUP',['C-026']],
  ['motor_speed','EM-1','control ranges','0–3000 wheels; 0–5000 flex shaft only','rpm','em-1_instructions.pdf','pages 2 and 5',['C-002']],
  ['water_system','EM-1','reservoir capacity',3.5,'gal','em-1_instructions.pdf','page 2',['C-041']],
  ['included_components','EM-1','as-packed candidate','manual component list including six arbor wheels','counted list','em-1_instructions.pdf','page 1',['C-040']],
  ['included_components','EM-1','sales-list candidate','document says six diamond wheels but enumerates five and differs on grit','counted list','components_and_accessories','document body',['C-040']]
].map((row,index)=>({factId:`FACT-${String(index+1).padStart(3,'0')}`,domain:row[0],candidateProductModel:row[1],physicalState:row[2],value:row[3],unit:row[4],sourceIds:[sourceId(row[5],'shopify_files') || sourceId(row[5],'repository')].filter(Boolean),sourceLocation:row[6],evidenceDateOrRevision:null,decisionState:'conflicting',conflictIds:row[7],humanReviewRequired:true}));

const relationSpecs = [
  ['BeadMaster ordering-list part numbers','BeadMaster 6','compatible_part_candidate','beadmaster part ordering','rows 2–71'],
  ['ShapeMaster ordering-list part numbers','ShapeMaster 6','compatible_part_candidate','shapemaster part ordering','rows 2–102'],
  ['TrimMaster ordering-list part numbers','TrimMaster','compatible_part_candidate','trimmaster part ordering','sheets S1–S2'],
  ['LapMaster 12 ordering-list part numbers','LapMaster 12','compatible_part_candidate','lapmaster 12’','rows 2–45'],
  ['LapMaster 18 ordering-list part numbers','LapMaster 18','compatible_part_candidate','lapmaster 18\'\' part ordering','rows 2–44'],
  ['SawMaster 18 ordering-list part numbers','SawMaster 18','compatible_part_candidate','sawmaster 18\'\' part ordering','sheets S1–S4'],
  ['SawMaster 24 ordering-list part numbers','SawMaster 24','compatible_part_candidate','sawmaster 24\'\' part ordering','sheets S1–S4'],
  ['12-inch regular and magnetic grinding laps','LapMaster 12','blade_or_wheel_candidate','instructions_lapmaster_12','INITIAL SETUP'],
  ['12-to-18-inch saw blades with 1-inch arbor hole','SawMaster 18','blade_or_wheel_candidate','instructions_sawmaster_18','INITIAL SETUP and Arbor and Blade Mount'],
  ['listed wheel, saw, flat-lap, flex-shaft, and metalsmithing package','EM-1','component_candidate','em-1_instructions.pdf','page 1']
];
const relationships = relationSpecs.map((row,index)=>({relationshipId:`REL-${String(index+1).padStart(3,'0')}`,dependentCandidate:row[0],targetMachineModel:row[1],relationshipType:row[2],sourceIds:[sourceId(row[3],'shopify_files') || sourceId(row[3],'repository')].filter(Boolean),sourceLocation:row[4],confidence:'medium',decisionState:'proposed',humanApprovalRequired:true}));

const reassessment = [
  ['E-REQ-003','candidate_answer_requires_owner_confirmation','Part/BOM sources supply many legacy part identifiers; product and variant SKU ownership remains unresolved.',['G','J','L','O']],
  ['E-REQ-005','genuine_source_conflict','Electrical candidates now exist for seven machine models, but 110/220/230 V and motor/speed conflicts remain.',['F','J','K','L','O']],
  ['E-REQ-006','genuine_source_conflict','Six drawings and the pallet workbook provide state-specific measurements; currentness and state mapping still require Technical/Operations approval.',['F','K']],
  ['E-REQ-007','candidate_answer_requires_owner_confirmation','Parts and ordering lists generate family/model candidate edges; catalog-product matching and consequential compatibility require approval.',['G','L','O']],
  ['E-REQ-008','genuine_source_conflict','EM-1 manuals provide a detailed candidate BOM but disagree on wheel count/grits; other machines remain incomplete.',['F','G','J','L']],
  ['E-REQ-011','candidate_answer_requires_owner_confirmation','Files GIDs, URLs, duplicates, and source associations are indexed; canonical customer-resource version and rights still need approval.',['F','G','L','O']],
  ['E-REQ-013','candidate_answer_requires_owner_confirmation','Instruction files supply assembly and safety candidates for EM-1, LapMaster 12, and SawMaster 18; editorial and legal review remains.',['F','K','L']]
].map(([requestId,disposition,summary,mvpConsumers])=>({requestId,disposition,summary,mvpConsumers}));

const countBy = (items, key) => items.reduce((acc,item)=>{const value=item[key] || 'unassociated';acc[value]=(acc[value]||0)+1;return acc;},{});
const existing = [...new Set(facts.flatMap((fact)=>fact.conflictIds).filter((id)=>/^C-0[0-3]/.test(id)))].sort();
const data = {$schema:'../schemas/epic-e-technical-source-index.schema.json',version:1,generatedAt,decisionStateVocabulary:'data/epic-e-source-governance.json',scope:'Technical evidence candidates from the complete 2026-08-20 Shopify Files audit and every file in docs/product/silica-gem; this is not approved product truth.',sources,factObservations:facts,candidateRelationships:relationships,humanRequestReassessment:reassessment,statistics:{sourcesIndexed:sources.length,sourcesContentAnalyzed:sources.filter((s)=>s.extractionStatus==='content_analyzed').length,sourcesMetadataOnly:sources.filter((s)=>s.extractionStatus==='metadata_indexed').length,sourcesInaccessible:sources.filter((s)=>s.extractionStatus==='inaccessible').length,duplicateGroups:new Set(sources.map((s)=>s.duplicateGroup).filter(Boolean)).size,factsByDomain:countBy(facts,'domain'),sourcesByMachineFamily:countBy(sources,'candidateMachineFamily'),existingConflictsSupported:existing,existingConflictsContradicted:['C-002','C-017','C-023','C-024','C-026'],newConflictsDiscovered:['C-040','C-041']}};
fs.writeFileSync(path.join(root,outputPath),`${JSON.stringify(data,null,2)}\n`);
console.log(`Wrote ${outputPath}: ${sources.length} sources, ${facts.length} facts, ${relationships.length} candidate relationships.`);
