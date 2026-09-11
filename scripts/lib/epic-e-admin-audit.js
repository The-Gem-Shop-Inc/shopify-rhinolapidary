const API_VERSION = '2026-07';
const PAGE_SIZE = 25;
const OPERATIONS = {
  products: `query EpicEProducts($first: Int!, $after: String) { products(first: $first, after: $after, sortKey: ID) { nodes { id title handle status publishedAt vendor productType category { id fullName } tags templateSuffix updatedAt options { id name values } resourcePublicationsV2(first: 50) { nodes { publication { id } publishDate isPublished } pageInfo { hasNextPage endCursor } } collections(first: 50) { nodes { id handle title } pageInfo { hasNextPage endCursor } } media(first: 100) { nodes { id mediaContentType status alt } pageInfo { hasNextPage endCursor } } metafields(first: 100) { nodes { id namespace key type jsonValue updatedAt definition { id } } pageInfo { hasNextPage endCursor } } } pageInfo { hasNextPage endCursor } } }`,
  variants: `query EpicEVariants($first: Int!, $after: String) { productVariants(first: $first, after: $after, sortKey: ID) { nodes { id title displayName selectedOptions { name value } sku barcode price inventoryPolicy updatedAt product { id handle } inventoryItem { id tracked requiresShipping measurement { weight { value unit } } } metafields(first: 100) { nodes { id namespace key type jsonValue updatedAt definition { id } } pageInfo { hasNextPage endCursor } } } pageInfo { hasNextPage endCursor } } }`,
  productMetafieldDefinitions: `query EpicEProductDefinitions($first: Int!, $after: String) { metafieldDefinitions(first: $first, after: $after, ownerType: PRODUCT) { nodes { id namespace key name description type { name category } validations { name value } access { admin storefront } } pageInfo { hasNextPage endCursor } } }`,
  variantMetafieldDefinitions: `query EpicEVariantDefinitions($first: Int!, $after: String) { metafieldDefinitions(first: $first, after: $after, ownerType: PRODUCTVARIANT) { nodes { id namespace key name description type { name category } validations { name value } access { admin storefront } } pageInfo { hasNextPage endCursor } } }`,
  collectionMetafieldDefinitions: `query EpicECollectionDefinitions($first: Int!, $after: String) { metafieldDefinitions(first: $first, after: $after, ownerType: COLLECTION) { nodes { id namespace key name description type { name category } validations { name value } access { admin storefront } } pageInfo { hasNextPage endCursor } } }`,
  metaobjectDefinitions: `query EpicEMetaobjectDefinitions($first: Int!, $after: String) { metaobjectDefinitions(first: $first, after: $after) { nodes { id type name description displayNameKey fieldDefinitions { key name description required type { name category } validations { name value } } capabilities { publishable { enabled } translatable { enabled } } access { admin storefront } } pageInfo { hasNextPage endCursor } } }`,
  collections: `query EpicECollections($first: Int!, $after: String) { collections(first: $first, after: $after, sortKey: ID) { nodes { id title handle updatedAt productsCount { count } metafields(first: 100) { nodes { id namespace key type jsonValue updatedAt definition { id } } } } pageInfo { hasNextPage endCursor } } }`,
  deliveryProfiles: `query EpicEDeliveryProfiles($first: Int!, $after: String) { deliveryProfiles(first: $first, after: $after) { nodes { id name default activeMethodDefinitionsCount productVariantsCount { count } } pageInfo { hasNextPage endCursor } } }`,
  locations: `query EpicELocations($first: Int!, $after: String) { locations(first: $first, after: $after, sortKey: ID, includeInactive: true) { nodes { id name isActive fulfillsOnlineOrders hasActiveInventory } pageInfo { hasNextPage endCursor } } }`,
  markets: `query EpicEMarkets($first: Int!, $after: String) { markets(first: $first, after: $after) { nodes { id name handle status type webPresences(first: 25) { nodes { id domain { host } } pageInfo { hasNextPage endCursor } } } pageInfo { hasNextPage endCursor } } }`
};
const ROOT_FIELDS = {products:'products',variants:'productVariants',productMetafieldDefinitions:'metafieldDefinitions',variantMetafieldDefinitions:'metafieldDefinitions',collectionMetafieldDefinitions:'metafieldDefinitions',metaobjectDefinitions:'metaobjectDefinitions',collections:'collections',deliveryProfiles:'deliveryProfiles',locations:'locations',markets:'markets'};

function blankDataset() { return {queryStatus:'not_queried',resultState:'not_queried',records:[],recordCount:0,pageCount:0,errorCount:0}; }
function safeMessage(value) { return String(value || 'Unknown error').replace(/shpat_[A-Za-z0-9_-]+/g,'[REDACTED]').slice(0,1000); }
function isScopeError(errors) { return errors.some((error)=>/(access denied|scope|permission|not authorized)/i.test(error.message || '')); }
function nestedTruncations(value,path=[]) {
  if (!value || typeof value!=='object') return [];
  if (Array.isArray(value)) return value.flatMap((entry,index)=>nestedTruncations(entry,[...path,index]));
  const found=[];
  if (value.pageInfo?.hasNextPage===true) found.push(path.join('.'));
  for (const [key,entry] of Object.entries(value)) if (key!=='pageInfo') found.push(...nestedTruncations(entry,[...path,key]));
  return found;
}
function assertReadOnlyOperations(operations=OPERATIONS) {
  for (const [name,query] of Object.entries(operations)) if (!/^\s*query\b/.test(query) || /\bmutation\b/i.test(query)) throw new Error(`${name} is not an approved read-only query`);
}

async function runAdminAudit({shopDomain,accessToken,fetchImpl=global.fetch,now=()=>new Date(),only,apiVersion=API_VERSION,operational=false}) {
  const enrichment=operational?require('./epic-e-operational-audit'):{OPERATIONAL_OPERATIONS:{},OPERATIONAL_ROOTS:{}};
  const operations={...OPERATIONS,...enrichment.OPERATIONAL_OPERATIONS};
  const rootFields={...ROOT_FIELDS,...enrichment.OPERATIONAL_ROOTS};
  only=only||Object.keys(operations);
  assertReadOnlyOperations(operations);
  if (!shopDomain || !accessToken) throw new Error('Admin audit requires shopDomain and accessToken');
  const normalizedShop = shopDomain.replace(/^https?:\/\//,'').replace(/\/$/,'');
  const snapshot={$schema:'../../../../schemas/epic-e-admin-snapshot.schema.json',schemaVersion:1,sourceKind:'live_admin',capturedAt:now().toISOString(),apiVersion,shopDomain:normalizedShop,readOnly:true,redacted:true,datasets:{},errors:[],throttleSamples:[]};
  for (const name of Object.keys(operations)) snapshot.datasets[name]=blankDataset();
  for (const name of only) {
    if (!operations[name]) throw new Error(`Unknown dataset ${name}`);
    const definitionDataset=name.endsWith('MetafieldDefinitions') || name==='metaobjectDefinitions';
    const dataset={queryStatus:'success',resultState:definitionDataset?'zero_definitions':'zero',records:[],recordCount:0,pageCount:0,errorCount:0};
    snapshot.datasets[name]=dataset;
    let after=null; const cursors=new Set();
    do {
      let response;
      try {
        response=await fetchImpl(`https://${normalizedShop}/admin/api/${apiVersion}/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':accessToken},body:JSON.stringify({query:operations[name],variables:{first:operational?1:PAGE_SIZE,after}})});
      } catch (error) {
        snapshot.errors.push({dataset:name,kind:'transport',message:safeMessage(error.message),path:null}); dataset.queryStatus='query_failure'; break;
      }
      let payload;
      try { payload=await response.json(); } catch (error) { payload={errors:[{message:`Invalid JSON response (${response.status})`}]} }
      dataset.pageCount += 1;
      if (payload.extensions?.cost?.throttleStatus) snapshot.throttleSamples.push({dataset:name,...payload.extensions.cost.throttleStatus});
      if (!response.ok) {
        snapshot.errors.push({dataset:name,kind:'http',message:`HTTP ${response.status}`,path:null});
        dataset.queryStatus='query_failure';
        break;
      }
      if (payload.errors?.length) {
        const scope=isScopeError(payload.errors);
        for (const error of payload.errors) snapshot.errors.push({dataset:name,kind:scope?'scope':'graphql',message:safeMessage(error.message),path:error.path || null});
        dataset.queryStatus=scope?'inaccessible_scope':'query_failure'; break;
      }
      const result=payload.data?.[rootFields[name]];
      const connection=name==='shopPolicies'&&result?{nodes:[result],pageInfo:{hasNextPage:false,endCursor:null}}:result;
      if (!connection || !Array.isArray(connection.nodes) || !connection.pageInfo) {
        snapshot.errors.push({dataset:name,kind:'graphql',message:'Expected connection was absent from GraphQL data',path:null}); dataset.queryStatus='query_failure'; break;
      }
      dataset.records.push(...connection.nodes);
      const truncated=connection.nodes.flatMap((node,index)=>nestedTruncations(node,[`records[${dataset.records.length-connection.nodes.length+index}]`]));
      if (truncated.length) {
        snapshot.errors.push({dataset:name,kind:'pagination',message:`Nested connection limit reached at ${truncated.join(', ')}; dataset is partial and must not be treated as complete.`,path:null});
        dataset.queryStatus='query_failure';
        break;
      }
      after=connection.pageInfo.hasNextPage?connection.pageInfo.endCursor:null;
      if (connection.pageInfo.hasNextPage && !after) {
        snapshot.errors.push({dataset:name,kind:'graphql',message:'Pagination reported a next page without an end cursor',path:null}); dataset.queryStatus='query_failure'; break;
      }
      if(after&&cursors.has(after)){snapshot.errors.push({dataset:name,kind:'pagination',message:'Repeated pagination cursor; dataset is incomplete.',path:null});dataset.queryStatus='query_failure';break;}
      if(after)cursors.add(after);
    } while (after);
    dataset.recordCount=dataset.records.length;
    dataset.errorCount=snapshot.errors.filter((error)=>error.dataset===name).length;
    dataset.resultState=dataset.queryStatus==='success'?(dataset.recordCount?'nonzero':(definitionDataset?'zero_definitions':'zero')):dataset.queryStatus;
  }
  const serialized=JSON.stringify(snapshot);
  if (/X-Shopify-Access-Token|shpat_|accessToken/i.test(serialized)) throw new Error('Redaction guard rejected snapshot output');
  return snapshot;
}

module.exports={API_VERSION,PAGE_SIZE,OPERATIONS,runAdminAudit,assertReadOnlyOperations};
