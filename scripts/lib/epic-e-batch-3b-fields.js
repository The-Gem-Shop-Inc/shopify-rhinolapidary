// Authored field contracts. Builders generate evidence, never Product value approval.
const technical = [
  ['input_voltage', 'voltage', 'volts', ['C-002','C-004','C-008','C-014','C-016','C-020','C-024','C-029'], 'Rated machine input voltage; conflicting regional observations are not configurations.'],
  ['input_frequencies', 'list.frequency', 'hertz', ['C-002','C-004','C-008','C-014'], 'Explicitly rated discrete supply frequencies; do not expand a printed range into a list without Technical confirmation.'],
  ['motor_power', 'power', 'horsepower', ['C-002','C-023','C-028'], 'Rated primary drive motor output; input consumption and auxiliary motor power are different facts. Preserve horsepower standard uncertainty before conversion.'],
  ['motor_speed', 'rotational_speed', 'revolutions_per_minute', ['C-003','C-007','C-013'], 'Rated primary motor shaft speed; does not represent tool operating speed.'],
  ['wheel_speed_min', 'rotational_speed', 'revolutions_per_minute', ['C-002'], 'Minimum supported wheel operating speed for the approved current machine configuration.'],
  ['wheel_speed_max', 'rotational_speed', 'revolutions_per_minute', ['C-002'], 'Maximum supported wheel operating speed; cannot inherit flex-shaft speed.'],
  ['flex_shaft_speed_min', 'rotational_speed', 'revolutions_per_minute', ['C-002'], 'Minimum flex-shaft operating speed; attachment-specific EM-1 control range.'],
  ['flex_shaft_speed_max', 'rotational_speed', 'revolutions_per_minute', ['C-002'], 'Maximum flex-shaft operating speed; never a motor or wheel speed alias.'],
  ['blade_diameter_min', 'dimension', 'inches', ['C-025','C-030'], 'Minimum supported blade diameter; range endpoints require an approved mounting specification.'],
  ['blade_diameter_max', 'dimension', 'inches', ['C-025','C-030'], 'Maximum supported blade diameter; does not independently prove compatibility.'],
  ['wheel_diameter', 'dimension', 'inches', ['C-002'], 'Nominal supported arbor wheel diameter; does not identify included wheel products.'],
  ['blade_arbor_diameter', 'dimension', 'inches', ['C-025','C-030'], 'Blade mounting arbor diameter; excludes wheel mounting and threaded attachments.'],
  ['wheel_arbor_diameter', 'dimension', 'inches', ['C-002'], 'Wheel mounting arbor diameter; other mount geometries require separate evidence.'],
  ['water_reservoir_capacity', 'volume', 'us_gallons', ['C-002','C-041'], 'Water reservoir nominal capacity; Technical must confirm US versus Imperial gallon before approval.'],
  ['cutting_oil_fill_min', 'volume', 'us_gallons', ['C-026'], 'Minimum operating cutting-oil fill; not nominal tank or water capacity.'],
  ['cutting_oil_fill_max', 'volume', 'us_gallons', ['C-026'], 'Maximum operating cutting-oil fill; preserve gallon-system ambiguity.'],
  ['water_system_type', 'single_line_text_field', null, ['C-002'], 'Governed water system arrangement: recirculating_filtered is evidenced by the EM-1 filtration system; no default for other machines.']
].map(([key,type,unit,conflictIds,description]) => ({key,type,unit,conflictIds,description,ownerType:'PRODUCT',sourcePbi:'E-PBI-010',physicalState:'technical_configuration',allowedValues:key==='water_system_type'?['recirculating_filtered']:null}));
const measurements = [
  ['net_weight','weight','pounds','net','Durable net machine weight without shipping packaging, fluid fill and installed accessories explicitly declared.'],
  ...['length','width','height'].map(axis=>[`assembled_${axis}`,'dimension','inches','assembled',`Assembled machine ${axis}; axis orientation and included assemblies must be approved from the drawing.`]),
  ...['length','width','height'].map(axis=>[`crate_${axis}`,'dimension','inches','crate_outer',`Outer standard shipping crate ${axis}; includes packing allowances and must have an Operations-approved packing revision.`])
].map(([key,type,unit,physicalState,description])=>({key,type,unit,physicalState,description,ownerType:'PRODUCT',sourcePbi:'E-PBI-011',conflictIds:[],allowedValues:null}));
const relationships = [
  ['compatible_machines','list.product_reference','E-PBI-012','Dependent Product to exact compatible machine Product references; only universally applicable approved Product edges.'],
  ['included_products','list.product_reference','E-PBI-014','Exact catalog Products included in the current commercial machine package; independent from fit and recommendations.'],
  ['included_quantities','json','E-PBI-014','Positive integer quantity map keyed by exactly the GIDs in included_products; companion metadata, never independent membership.'],
  ['noncatalog_components','json','E-PBI-014','Product-local component lines with label, positive integer quantity and included/not_included/optional meaning for evidenced noncatalog contents.'],
  ['optional_products','list.product_reference','E-PBI-014','Separately selectable optional catalog components confirmed by Technical and Product Owner; not speculative machine Variants.'],
  ['recommended_products','list.product_reference','E-PBI-014','Product Owner merchandising recommendations; cannot establish compatibility or box contents.']
].map(([key,type,sourcePbi,description])=>({key,type,sourcePbi,description,ownerType:'PRODUCT',unit:null,physicalState:null,conflictIds:[],allowedValues:null}));
const resources = ['manual','diagram','instruction','video','support'].map(kind=>({key:`${kind}_files`,type:'list.file_reference',sourcePbi:'E-PBI-018B',description:`Exact Shopify File references for approved ${kind} resources. Version, rights, current status and Product applicability are governed by the repository resource catalog; evidence Files are not automatically downloads.`,ownerType:'PRODUCT',unit:null,physicalState:null,conflictIds:[],allowedValues:null}));
const deferred = [
  {domain:'electrical_phase',owner:'Technical / E-PBI-010',reason:'No phase observation found in the analyzed corpus; no field created.'},
  {domain:'generic_machine_capacity',owner:'Technical / E-PBI-010',reason:'No common, source-supported capacity semantics; do not mix cutting envelope, bead size and tank volume.'},
  {domain:'generic_speed_range',owner:'Technical / E-PBI-010',reason:'C-018 optional configuration is not proven commerce; current EM-1 tool speeds have distinct fields.'},
  {domain:'operating_footprint',owner:'Technical / E-PBI-011',reason:'Assembled drawings do not prove operational clearances or an operating footprint.'},
  {domain:'packaged_dimensions_package_count_multi_package',owner:'Operations / E-PBI-011',reason:'Crate dimensions are evidenced; no separate carton or multi-package count is proven. Repository state schema reserves these states without placeholder package records.'},
  {domain:'shipping_weight',owner:'Operations / native Variant inventoryItem.measurement.weight',reason:'Native Shopify shipping weight is canonical; custom duplicate prohibited.'},
  {domain:'grit',owner:'Product Owner / Technical: future Epic E abrasive attribute contract supporting Epic G filters',reason:'Real G filter consumer; current separate Products establish scope, but grit grading standard, mixed grit packs and unit vocabulary are unapproved. Legacy text remains proposed.'},
  {domain:'applications_materials_skill_safety_assembly',owner:'Technical / later separately authorized evidence contract',reason:'No deterministic closed vocabulary justified in this batch; no speculative definitions.'}
];
module.exports = {technical,measurements,relationships,resources,deferred,fields:[...technical,...measurements,...relationships,...resources]};
