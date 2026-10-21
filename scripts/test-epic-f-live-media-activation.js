'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),M=require('./lib/epic-f-live-media-activation'),base=require('./lib/epic-f-machine-fixtures');
const release=M.read(M.RELEASE),snapshot=M.read(M.DIR+'/media-after-alt.json');let count=0;const tests=[];
const test=(name,fn)=>{fn();count++;tests.push({name,passed:true});};
test('exact six fresh current-Product grants reconcile',()=>assert.deepEqual(M.validateRelease(release),[]));
for(const [name,mutate]of [
 ['wrong Product',r=>r.grants[0].productGid='gid://shopify/Product/1'],
 ['excluded Product',r=>r.grants[0].productGid='gid://shopify/Product/8905784262853'],
 ['fixture cannot grant live media',r=>r.grants[0].mediaGid='fixture-front'],
 ['unassociated current media',r=>r.grants[0].mediaGid=r.grants[1].mediaGid],
 ['review-required EM1',r=>{r.grants[0].productGid='gid://shopify/Product/8905780756677';r.grants[0].mediaGid='gid://shopify/MediaImage/33451101683909';}],
 ['shared SawMaster alt scope',r=>{r.grants[0].productGid='gid://shopify/Product/8905784197317';r.grants[0].mediaGid='gid://shopify/MediaImage/33451117871301';}],
 ['duplicate grant',r=>r.grants[1]=structuredClone(r.grants[0])],
 ['non-ready media',r=>r.grants[0].status='PROCESSING'],
 ['deleted file',r=>r.grants[0].fileStatus='FAILED'],
 ['unsupported video',r=>r.grants[0].mediaType='VIDEO'],
 ['external substitution',r=>r.grants[0].sourceUrl='https://example.com/photo.jpg'],
 ['changed dimensions',r=>r.grants[0].width++],
 ['blank alt',r=>r.grants[0].alt=''],
 ['inferred technical alt',r=>r.grants[0].alt='Compatible powerful 5000 rpm machine'],
 ['wrong decision',r=>r.grants[0].decisionId='F-DEC-002'],
 ['invented launch rights',r=>r.grants[0].finalLaunchApproved=true],
 ['missing audience',r=>delete r.grants[0].audience],
 ['stale media revision',r=>r.grants[0].mediaUpdatedAt='2026-09-01T00:00:00Z'],
 ['snapshot timestamp mismatch',r=>r.observedAt='2026-09-01T00:00:00Z'],
 ['unexpected seventh grant',r=>r.grants.push(structuredClone(r.grants[0]))]
])test(name,()=>{const r=structuredClone(release);mutate(r);assert.ok(M.validateRelease(r).length);});
for(const g of release.grants){
 const p=snapshot.products.find(p=>p.id===g.productGid),context={request:{host:'sz5dnk-nf.myshopify.com'},product:{id:Number(g.productGid.split('/').pop()),published_at:p.publishedAt},template:{suffix:'machine'},media:{id:Number(g.mediaGid.split('/').pop()),media_type:'image',alt:g.alt,preview_image:{src:g.sourceUrl,alt:g.alt,width:g.width,height:g.height}}};
 const render=c=>base.engine(c).parseAndRenderSync(fs.readFileSync(M.FILE,'utf8'),c).trim();
 test('exact Liquid gate '+p.handle,()=>assert.equal(render(context),'eligible'));
 const uri=new URL(g.sourceUrl),relative='files/'+uri.pathname.split('/files/').pop();
 for(const source of [relative,relative+uri.search,'/cdn/shop/'+relative+uri.search,'//sz5dnk-nf.myshopify.com/cdn/shop/'+relative+uri.search])test(p.handle+' native source representation '+source,()=>{const c=structuredClone(context);c.media.preview_image.src=source;assert.equal(render(c),'eligible');});
 for(const source of [relative+'?v=0','//evil.example/cdn/shop/'+relative,relative+'-different'])test(p.handle+' wrong native source '+source,()=>{const c=structuredClone(context);c.media.preview_image.src=source;assert.equal(render(c),'');});
 for(const [name,mutate]of [['wrong media',c=>c.media.id++],['wrong Product',c=>c.product.id++],['wrong suffix',c=>c.template.suffix=''],['unpublished',c=>c.product.published_at=null],['changed source',c=>c.media.preview_image.src+='changed'],['blank alt',c=>c.media.alt=''],['wrong preview alt',c=>c.media.preview_image.alt='wrong'],['wrong dimensions',c=>c.media.preview_image.height++],['wrong type',c=>c.media.media_type='external_video']])test(p.handle+' '+name,()=>{const c=structuredClone(context);mutate(c);assert.equal(render(c),'');});
}
test('bound one-file runtime delta exact',()=>assert.equal(M.verifyBinding().runtimeDelta.length,1));
test('historical pins require explicit media opt-in',()=>{const previous=process.env.RHINO_EPIC_F_MEDIA_BINDING;delete process.env.RHINO_EPIC_F_MEDIA_BINDING;assert.equal(M.historicalSourceMatches(M.FILE,M.read(M.BINDING).runtimeDelta[0].oldSha256),false);process.env.RHINO_EPIC_F_MEDIA_BINDING=previous;});
test('no unrelated factual grant activation',()=>assert.deepEqual(M.read('data/epic-f-consumer-release.json').grants,[]));
test('no video grants',()=>assert.ok(release.grants.every(g=>g.mediaType==='IMAGE')));
M.write('media-activation-tests.json',{completedAt:new Date().toISOString(),passed:count,failed:0,tests,newShopifyReads:0,mutations:0});console.log(JSON.stringify({passed:count,failed:0}));
