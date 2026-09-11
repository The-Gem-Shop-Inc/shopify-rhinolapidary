const fulfillmentDefinition={sourcePbi:'E-PBI-015',key:'fulfillment_class',ownerType:'PRODUCT',type:'single_line_text_field',decisionState:'proposed'};
function isBatch3cDefinition(f){return f.namespace==='rhino'&&Object.entries(fulfillmentDefinition).every(([k,v])=>f[k]===v);}
const contracts={
  executionOrder:['E-PBI-015','E-PBI-016','E-PBI-017'],
  fulfillment:{
    layers:[
      {layer:'durable',concepts:['approved handling requirement','business pickup permission','explicit regulatory limitation'],authority:'Operations / Product Owner / Technical approval',storage:'repository exact Product/Variant decisions; fulfillment_class proposed only'},
      {layer:'physical_shipment',concepts:['native shipping weight','approved crate dimensions','evidenced package records'],authority:'E-PBI-011',storage:'native Variant weight and existing typed measurement architecture'},
      {layer:'native_configuration',concepts:['delivery profile membership','zones and methods and rates','locations','Markets','location pickup settings'],authority:'Shopify Admin',storage:'native; dated read-only audit evidence, never copied as durable metafields'},
      {layer:'policy',concepts:['territory rules','responsibility and exclusions'],authority:'Legal/Business and Operations',storage:'governed current policy revision'},
      {layer:'temporary',concepts:['inventory','seasonal pickup','route interruptions','expected dispatch timing'],authority:'current native Shopify state or approved Operations source',storage:'fresh operational record, never timeless Product fact'}
    ],
    definition:fulfillmentDefinition,
    proposedVocabulary:['parcel','freight'],
    vocabularyState:'proposed',
    vocabularyEvidence:'Historical policy distinguishes parcel carriers and freight. Nine packing sheets evidence crates; neither assigns a current shipping mode to any Product.',
    rejectedVocabulary:['oversized_parcel','pickup_only','special_handling'],
    rejectedReason:'No stable criteria or current assignments are evidenced. Pickup is independent of shipment mode. No lift-gate/residential/appointment/assembly flags are created.',
    nativeWeight:'PRODUCTVARIANT.inventoryItem.measurement.weight',
    measurementContract:'data/epic-e-batch-3b-contracts.json#/measurements',
    scope:'Product when the approved handling requirement applies to every purchased Variant; a differing Variant requires approved commerce evidence. Profile membership is natively Variant-specific regardless.',
    drift:'Exact Variant deliveryProfile.id versus approved expectedProfileGids. Compare required handling to Operations-approved profile capabilities bound to the current configuration hash. Missing/partial/stale audit or missing approval is unassessed, never a pass. coversAllItems profiles trigger separate enforcement review; never infer freight safety from a profile name or rate.',
    driftStates:['aligned','contradiction','missing_profile','unassessed','stale'],
    pickup:'Business Product permission AND active location pickup setting AND current location inventory/checkout eligibility; location existence proves none of these. Historical Wisconsin/Arizona claims remain seasonal evidence without Location GID assignment.',
    regions:'Separate regulatory Product restrictions, commercial Market eligibility, temporary limitations and policy restrictions. Explicit evidence and ISO country/subdivision identifiers required. Electrical conflict/family/Vendor is not region evidence. No restriction record means unknown, never worldwide availability.'
  },
  warranty:{
    storageDecision:'No new Shopify warranty definition or metaobject. Reusable current terms and entity ownership are not approved. Repository typed policy/class/mapping references support review; approved resource delivery reuses E-PBI-018B.',
    roles:['marketedBrand','manufacturer','warrantyIssuer','warrantyAdministrator','repairProvider'],
    equalityRule:'Roles may name the same entity only when separately evidenced and explicitly approved. Vendor is marketed brand, never automatic issuer or manufacturer.',
    policyModel:['policyId','revision','effectiveFrom','effectiveTo','lifecycle','sourceIds','sourceSha256','resourceId or nativePolicyGid','issuer','administrator','repairProvider','roleEvidence','approvalDecisionId'],
    classModel:['classId','policyId','policyRevision','durationValue','durationUnit','trigger','exclusions','approvalDecisionId'],
    mappingModel:['productGid','classId','exceptions','approvalDecisionId'],
    groupingRule:'Group review by approved Product class and observed marketed brand; never assign terms by Vendor, title, price or product class alone. Included motors and separately purchased motors require distinct review.',
    thirdPartyBrands:['DIALUX','KAAN ZIMPARA','Johnson Brothers Lapidary','Nova Wheel'],
    resourceModel:'Exact resourceId in data/epic-e-resource-catalog.json, native ShopPolicy identity, and existing governed site support IDs. Manual/diagram/support_files and product/model identity are reused. No copied File URL, phone, email or address Product metafields.',
    publicationGate:'Current effective policy revision, Legal/Business approval, explicit issuer/administrator/provider evidence, approved class and exact Product mapping; obsolete/superseded terms cannot be selected. Customer resources additionally pass E-PBI-018B publication gates.',
    historicalClaims:['CLAIM-006','CLAIM-007','CLAIM-008','CLAIM-013','CLAIM-014'],
    durationRule:'One-year and 90-day wording remain observations, not approved durations or universal current terms.'
  },
  availability:{
    nativeAuthority:['Product.status','publication context','Variant.availableForSale','Variant.inventoryPolicy','InventoryItem.tracked','InventoryLevel.quantities'],
    timingAuthority:'No maintainable timing source or approved update process has been evidenced. Operations must appoint one; no source system is invented.',
    operationalOwner:'Operations',
    implementationOwner:'Admin/Engineering',
    approvalOwner:'Product Owner',
    customProjectionJustified:false,
    newMetafieldDefinition:null,
    nativeSemantics:'DENY does not prove current stock; CONTINUE does not establish an approved preorder/backorder promise; untracked inventory is not zero or guaranteed available. Native availability is a dated commerce observation, not dispatch time.',
    timingScope:'Product only if all purchased Variants share the approved operational timing; Variant timing requires exact parent/GID and approved E-PBI-008 commerce distinction with independently evidenced fulfillment state.',
    projectionRequirements:['sourceId','owner','sourceUpdatedAt','expiresAt','productGid','scope','approvalDecisionId','minDays','maxDays','timeBasis','event','fallback'],
    sourceRequirements:['sourceId','owner','approvalDecisionId','process','consumer','maxAgeSeconds','updateSlaSeconds'],
    expiry:'expiresAt must be after sourceUpdatedAt and at or before sourceUpdatedAt + source.maxAgeSeconds. Reject future/invalid timestamps; evaluate time at consumption, not just when building.',
    fallback:'unknown_no_timing_promise',
    availabilityStates:['unknown','available_for_sale','unavailable_for_sale','not_published'],
    staleAction:'Suppress timing, retain native checkout availability in its actual context, and queue Operations review. Never substitute available now or unavailable for unknown.',
    integrationDecision:'F/J/K/O are concrete consumers; a maintainable source and a useful enforceable Shopify projection are unproven. Store no lead_time metafield until all gates pass.'
  }
};
module.exports={contracts,isBatch3cDefinition};
