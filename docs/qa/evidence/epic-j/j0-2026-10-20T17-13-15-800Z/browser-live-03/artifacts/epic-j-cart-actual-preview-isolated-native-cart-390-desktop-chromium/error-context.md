# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: epic-j-cart.spec.js >> actual preview isolated native cart 390
- Location: tests\epic-j-cart.spec.js:19:35

# Error details

```
Error: J-DEF-002 populated cart 200% root text overflow

expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#MainContent"
  - banner [ref=e5]:
    - group [ref=e7]:
      - button "Menu" [ref=e8] [cursor=pointer]:
        - img [ref=e10]
    - link "Rhino Lapidary" [ref=e12] [cursor=pointer]:
      - /url: /
    - generic [ref=e13]:
      - group [ref=e15]:
        - button "Search" [ref=e16] [cursor=pointer]:
          - img [ref=e19]
      - link "Cart" [ref=e21] [cursor=pointer]:
        - /url: /cart
        - img [ref=e23]
        - generic [ref=e25]: Cart
  - main [ref=e26]:
    - navigation "Breadcrumb" [ref=e27]:
      - list [ref=e28]:
        - listitem [ref=e29]:
          - link "Home" [ref=e30] [cursor=pointer]:
            - /url: /
          - generic [ref=e31]: /
        - listitem [ref=e32]: EM-1 Machine
    - generic [ref=e39]:
      - heading "EM-1 Machine" [level=1] [ref=e41]
      - status [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e45]:
            - generic [ref=e46]: Regular price
            - generic [ref=e47]: $4,000.00 USD
          - generic [ref=e48]: Sold out
      - generic [ref=e49]:
        - link "Shipping" [ref=e50] [cursor=pointer]:
          - /url: /policies/shipping-policy
        - text: calculated at checkout.
      - paragraph [ref=e54]:
        - generic [ref=e55]:
          - text: From $361.03/mo with
          - img "Shop" [ref=e57]
        - button "View sample plans" [ref=e59] [cursor=pointer]:
          - img
      - generic [ref=e60]:
        - generic [ref=e61]: Quantity
        - generic [ref=e62]: Quantity
        - generic [ref=e64]:
          - button "Decrease quantity for EM-1 Machine" [ref=e65]:
            - generic [ref=e66]: Decrease quantity for EM-1 Machine
            - generic:
              - img
          - spinbutton "Quantity for EM-1 Machine" [ref=e67]: "1"
          - button "Increase quantity for EM-1 Machine" [ref=e68] [cursor=pointer]:
            - generic [ref=e69]: Increase quantity for EM-1 Machine
            - generic:
              - img
      - button "Sold out" [disabled] [ref=e74]:
        - generic [ref=e75]: Sold out
      - paragraph [ref=e76]:
        - link "Browse compatible products" [ref=e77] [cursor=pointer]:
          - /url: "#OwnerContext-template--24033921695941__main"
      - link "Contact" [ref=e78] [cursor=pointer]:
        - /url: /pages/contact
      - region "Key specifications" [ref=e79]:
        - heading "Key specifications" [level=2] [ref=e80]
        - generic [ref=e81]:
          - generic [ref=e82]:
            - term [ref=e83]: Input voltage
            - definition [ref=e84]: 110 V
          - generic [ref=e85]:
            - term [ref=e86]: Blade diameter
            - definition [ref=e87]: 6 in
          - generic [ref=e88]:
            - term [ref=e89]: Wheel diameter
            - definition [ref=e90]: 6 in
      - region "Workshop specifications" [ref=e91]:
        - heading "Workshop specifications" [level=2] [ref=e92]
        - heading "Electrical requirements" [level=3] [ref=e93]
        - generic [ref=e94]:
          - generic [ref=e95]:
            - term [ref=e96]: Input voltage
            - definition [ref=e97]: 110 V
          - generic [ref=e98]:
            - term [ref=e99]: Input frequencies
            - definition [ref=e100]: 60 Hz
        - heading "Motor and operating speeds" [level=3] [ref=e101]
        - generic [ref=e102]:
          - generic [ref=e103]:
            - term [ref=e104]: Motor power
            - definition [ref=e105]: 1 hp (manufacturer nameplate)
          - generic [ref=e106]:
            - term [ref=e107]: Motor speed
            - definition [ref=e108]: 3000 rpm
          - generic [ref=e109]:
            - term [ref=e110]: Wheel speed
            - definition [ref=e111]: 0–3000 rpm
          - generic [ref=e112]:
            - term [ref=e113]: Flex-shaft speed
            - definition [ref=e114]: 3000–5000 rpm
        - heading "Wheels, blades and arbors" [level=3] [ref=e115]
        - generic [ref=e116]:
          - generic [ref=e117]:
            - term [ref=e118]: Blade diameter
            - definition [ref=e119]: 6 in
          - generic [ref=e120]:
            - term [ref=e121]: Wheel diameter
            - definition [ref=e122]: 6 in
          - generic [ref=e123]:
            - term [ref=e124]: Wheel arbor diameter
            - definition [ref=e125]: 1 in
        - heading "Water and fluid requirements" [level=3] [ref=e126]
        - generic [ref=e127]:
          - generic [ref=e128]:
            - term [ref=e129]: Water reservoir capacity
            - definition [ref=e130]: 3.5 US gal
          - generic [ref=e131]:
            - term [ref=e132]: Water system type
            - definition [ref=e133]: Recirculating, filtered
        - heading "Assembled dimensions and net weight" [level=3] [ref=e134]
        - generic [ref=e135]:
          - generic [ref=e136]:
            - term [ref=e137]: Net weight
            - definition [ref=e138]: 60 lb
          - generic [ref=e139]:
            - term [ref=e140]: Assembled length
            - definition [ref=e141]: 14.5 in
          - generic [ref=e142]:
            - term [ref=e143]: Assembled width
            - definition [ref=e144]: 33.5 in
          - generic [ref=e145]:
            - term [ref=e146]: Assembled height
            - definition [ref=e147]: 18 in
      - region "Included catalog items" [ref=e148]:
        - heading "Included catalog items" [level=2] [ref=e149]
        - list [ref=e150]:
          - listitem [ref=e151]:
            - heading "6 in Bonded Diamond Wheel, 80 grit" [level=4] [ref=e158]:
              - link "6 in Bonded Diamond Wheel, 80 grit" [ref=e159] [cursor=pointer]:
                - /url: /products/bonded-diamond-wheel-80
            - text: × 1
          - listitem [ref=e162]:
            - heading "6 in Bonded Diamond Wheel, 220 grit" [level=4] [ref=e169]:
              - link "6 in Bonded Diamond Wheel, 220 grit" [ref=e170] [cursor=pointer]:
                - /url: /products/bonded-diamond-wheel-220
            - text: × 1
          - listitem [ref=e173]:
            - heading "6 in Resin Bond Diamond Wheel, 280 grit" [level=4] [ref=e180]:
              - link "6 in Resin Bond Diamond Wheel, 280 grit" [ref=e181] [cursor=pointer]:
                - /url: /products/resin-diamond-wheel-280
            - text: × 1
          - listitem [ref=e184]:
            - heading "6 in Resin Bond Diamond Wheel, 600 grit" [level=4] [ref=e191]:
              - link "6 in Resin Bond Diamond Wheel, 600 grit" [ref=e192] [cursor=pointer]:
                - /url: /products/resin-diamond-wheel-600
            - text: × 1
          - listitem [ref=e195]:
            - heading "6 in Resin Bond Diamond Wheel, 1200 grit" [level=4] [ref=e202]:
              - link "6 in Resin Bond Diamond Wheel, 1200 grit" [ref=e203] [cursor=pointer]:
                - /url: /products/resin-diamond-wheel-1200
            - text: × 1
          - listitem [ref=e206]:
            - heading "6 in Resin Bond Diamond Wheel, 3000 grit" [level=4] [ref=e213]:
              - link "6 in Resin Bond Diamond Wheel, 3000 grit" [ref=e214] [cursor=pointer]:
                - /url: /products/resin-diamond-wheel-3000
            - text: × 1
          - listitem [ref=e217]:
            - heading "Left Moss Pad" [level=4] [ref=e224]:
              - link "Left Moss Pad" [ref=e225] [cursor=pointer]:
                - /url: /products/left-moss-pad
            - text: × 1
          - listitem [ref=e228]:
            - heading "Right Moss Pad" [level=4] [ref=e235]:
              - link "Right Moss Pad" [ref=e236] [cursor=pointer]:
                - /url: /products/right-moss-pad
            - text: × 1
          - listitem [ref=e239]: Flexible-shaft packaged set (flexible shaft, 18-piece accessory set and 3 attachment heads) × 1
          - listitem [ref=e240]: Silversmithing spindles × 2
          - listitem [ref=e241]: Sanding/polishing wheels × 3
          - listitem [ref=e242]: DIALUX Superfinishing Paste × 1
          - listitem [ref=e243]: DIALUX Polishing Paste × 1
          - listitem [ref=e244]: Flat lap × 1
          - listitem [ref=e245]: Magnetic felt pad × 1
          - listitem [ref=e246]: Magnetic 80-grit disc × 1
          - listitem [ref=e247]: Magnifying glass attachment × 1
          - listitem [ref=e248]: Jointed light attachment × 1
          - listitem [ref=e249]: Wrist rests × 2
          - listitem [ref=e250]: Water pump × 1
          - listitem [ref=e251]: Tank filtration system × 1
          - listitem [ref=e252]: Right-side shield (loose included item) × 1
          - listitem [ref=e253]: Moss Filtration Pads × 2
          - listitem [ref=e254]: Brass spray nozzles × 2
          - listitem [ref=e255]: Spoke wrench × 1
          - listitem [ref=e256]: Hex key × 1
          - listitem [ref=e257]: Crescent wrench × 1
      - region "Related products" [ref=e258]:
        - heading "Related products" [level=2] [ref=e259]
        - list [ref=e260]:
          - listitem [ref=e261]:
            - heading "Approved compatibility" [level=3] [ref=e262]
            - heading "6 in Trim Saw Attachment (EM-1)" [level=4] [ref=e269]:
              - link "6 in Trim Saw Attachment (EM-1)" [ref=e270] [cursor=pointer]:
                - /url: /products/trim-saw-6
          - listitem [ref=e273]:
            - heading "Approved compatibility" [level=3] [ref=e274]
            - heading "Flex Shaft Conversion Bolt" [level=4] [ref=e281]:
              - link "Flex Shaft Conversion Bolt" [ref=e282] [cursor=pointer]:
                - /url: /products/arbor-size-conversion-bolt
          - listitem [ref=e285]:
            - heading "Approved compatibility" [level=3] [ref=e286]
            - heading "Arbor Spoke Nut" [level=4] [ref=e293]:
              - link "Arbor Spoke Nut" [ref=e294] [cursor=pointer]:
                - /url: /products/arbor-spoke-nut
          - listitem [ref=e297]:
            - heading "Approved compatibility" [level=3] [ref=e298]
            - heading "Flexible Shaft Attachment" [level=4] [ref=e305]:
              - link "Flexible Shaft Attachment" [ref=e306] [cursor=pointer]:
                - /url: /products/flexible-shaft-attachment
          - listitem [ref=e309]:
            - heading "Approved compatibility" [level=3] [ref=e310]
            - heading "Left Arbor Shaft" [level=4] [ref=e317]:
              - link "Left Arbor Shaft" [ref=e318] [cursor=pointer]:
                - /url: /products/left-arbor-shaft
          - listitem [ref=e321]:
            - heading "Approved compatibility" [level=3] [ref=e322]
            - heading "Left Moss Pad" [level=4] [ref=e329]:
              - link "Left Moss Pad" [ref=e330] [cursor=pointer]:
                - /url: /products/left-moss-pad
          - listitem [ref=e333]:
            - heading "Approved compatibility" [level=3] [ref=e334]
            - heading "Magnifying Glass Arm" [level=4] [ref=e341]:
              - link "Magnifying Glass Arm" [ref=e342] [cursor=pointer]:
                - /url: /products/magnifying-glass-arm
          - listitem [ref=e345]:
            - heading "Approved compatibility" [level=3] [ref=e346]
            - heading "Moss Pad, Pack of 2" [level=4] [ref=e353]:
              - link "Moss Pad, Pack of 2" [ref=e354] [cursor=pointer]:
                - /url: /products/moss-pad-pack
          - listitem [ref=e357]:
            - heading "Approved compatibility" [level=3] [ref=e358]
            - heading "Right Arbor Shaft" [level=4] [ref=e365]:
              - link "Right Arbor Shaft" [ref=e366] [cursor=pointer]:
                - /url: /products/right-arbor-shaft
          - listitem [ref=e369]:
            - heading "Approved compatibility" [level=3] [ref=e370]
            - heading "Right Moss Pad" [level=4] [ref=e377]:
              - link "Right Moss Pad" [ref=e378] [cursor=pointer]:
                - /url: /products/right-moss-pad
          - listitem [ref=e381]:
            - heading "Approved compatibility" [level=3] [ref=e382]
            - heading "Right Plexiglass Spray Guard" [level=4] [ref=e389]:
              - link "Right Plexiglass Spray Guard" [ref=e390] [cursor=pointer]:
                - /url: /products/right-plexiglass-spray-guard
          - listitem [ref=e393]:
            - heading "Approved compatibility" [level=3] [ref=e394]
            - heading "Spotlight" [level=4] [ref=e401]:
              - link "Spotlight" [ref=e402] [cursor=pointer]:
                - /url: /products/spotlight
  - contentinfo [ref=e406]:
    - generic [ref=e407]:
      - generic [ref=e409]:
        - heading "Quick links" [level=2] [ref=e410]
        - list [ref=e411]:
          - listitem [ref=e412]:
            - link "Search" [ref=e413] [cursor=pointer]:
              - /url: /search
          - listitem [ref=e414]:
            - link "Your Privacy Choices" [ref=e415] [cursor=pointer]:
              - /url: /policies/privacy-policy
      - button "Follow on Shop" [ref=e420] [cursor=pointer]:
        - img [ref=e423]
        - generic [ref=e425]:
          - text: Follow on
          - img "Shop" [ref=e426]
    - generic [ref=e428]:
      - generic [ref=e431]:
        - generic [ref=e432]: Payment methods
        - list [ref=e433]:
          - listitem [ref=e434]:
            - img "American Express" [ref=e435]
          - listitem [ref=e440]:
            - img "Apple Pay" [ref=e441]
          - listitem [ref=e452]:
            - img "Diners Club" [ref=e453]
          - listitem [ref=e457]:
            - img "Discover" [ref=e458]
          - listitem [ref=e467]:
            - img "Google Pay" [ref=e468]
          - listitem [ref=e476]:
            - img "Mastercard" [ref=e477]
          - listitem [ref=e484]:
            - img "PayPal" [ref=e485]
          - listitem [ref=e491]:
            - img "Shop Pay" [ref=e492]
          - listitem [ref=e496]:
            - img "Visa" [ref=e497]
      - generic [ref=e503]:
        - generic [ref=e504]:
          - text: © 2026,
          - link "Rhino Lapidary" [ref=e505] [cursor=pointer]:
            - /url: /
        - link "Powered by Shopify" [ref=e507] [cursor=pointer]:
          - /url: https://www.shopify.com?utm_campaign=poweredby&utm_medium=shopify&utm_source=onlinestore
        - list [ref=e508]:
          - listitem [ref=e509]:
            - text: ·
            - link "Privacy policy" [ref=e511] [cursor=pointer]:
              - /url: /policies/privacy-policy
          - listitem [ref=e512]:
            - text: ·
            - link "Shipping policy" [ref=e514] [cursor=pointer]:
              - /url: /policies/shipping-policy
          - listitem [ref=e515]:
            - text: ·
            - link "Refund policy" [ref=e517] [cursor=pointer]:
              - /url: /policies/refund-policy
          - listitem [ref=e518]:
            - text: ·
            - link "Legal notice" [ref=e520] [cursor=pointer]:
              - /url: /policies/legal-notice
  - iframe [ref=e522]:
    - generic [ref=f50e2]:
      - generic:
        - generic:
          - button "toggle" [ref=f50e3] [cursor=pointer]:
            - generic [ref=f50e6]:
              - img "Logo" [ref=f50e7]
              - generic [ref=f50e9]:
                - generic [ref=f50e10]: Rhino Lapidary - Preview
                - img [ref=f50e14]
                - generic [ref=f50e17]: Draft
          - generic:
            - generic:
              - generic:
                - dialog:
                  - generic [ref=f50e18]:
                    - navigation [ref=f50e20]:
                      - button "View as" [ref=f50e24] [cursor=pointer]:
                        - img [ref=f50e26]
                        - generic [ref=f50e29]:
                          - img [ref=f50e34]
                          - heading "View as" [level=2] [ref=f50e37]
                    - generic [ref=f50e46]:
                      - generic [ref=f50e48]: Actions
                      - generic [ref=f50e51]:
                        - button "Copy link" [ref=f50e52] [cursor=pointer]:
                          - img [ref=f50e56]
                          - generic [ref=f50e58]: Copy link
                        - button "Hide bar" [ref=f50e59] [cursor=pointer]:
                          - img [ref=f50e63]
                          - generic [ref=f50e66]: Hide bar
                        - button "Exit preview" [ref=f50e67] [cursor=pointer]:
                          - img [ref=f50e71]
                          - generic [ref=f50e74]: Exit preview
                  - status
```

# Test source

```ts
  1  | 'use strict';
  2  | const {test,expect}=require('@playwright/test'),fs=require('node:fs');
  3  | const J=require('../scripts/lib/epic-j-j0'),F=require('../scripts/lib/epic-j-cart-fixtures'),fixture=require('./fixtures/epic-j-cart.json');
  4  | const {auth}=require('../scripts/probe-epic-f-header-focus-correction'),I=require('../scripts/lib/epic-g-integrated');
  5  | const AxeBuilder=require('@axe-core/playwright').default;
  6  | test.describe.configure({mode:'default'});
  7  | test('offline native cart rejects unavailable inventory and announces update error',async({page})=>{
  8  |  const f=await F.mount(page);await page.locator('#Quantity-1').fill('9');await page.locator('#Quantity-1').press('Tab');await expect(page.locator('#Line-item-error-1 .cart-item__error-text')).toHaveText('Fixture inventory quantity unavailable');await expect(page.locator('#Quantity-1')).toHaveValue('2');expect(f.requests).toHaveLength(1);expect(f.requests[0]).toMatchObject({line:'1',quantity:9});await expect(page.locator('#cart-live-region-text')).toHaveAttribute('aria-live','polite');expect(f.errors).toEqual([]);
  9  | });
  10 | test('offline native drawer keyboard, close/focus return, checkout and page route',async({page})=>{
  11 |  const f=await F.mount(page,{drawer:true});await page.locator('#cart-icon-bubble').focus();await page.keyboard.press('Enter');const dialog=page.locator('cart-drawer [role=dialog]');await expect(dialog).toBeVisible();await expect(dialog).toHaveAttribute('aria-modal','true');await expect(dialog).toHaveAttribute('aria-label',/cart/i);await page.waitForTimeout(400);await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement.closest('cart-drawer'))).toBe(true);await page.keyboard.press('Escape');await expect(page.locator('cart-drawer')).not.toHaveClass(/active/);await expect(page.locator('#cart-icon-bubble')).toBeFocused();await expect(page.locator('cart-drawer [name=checkout]')).toHaveAttribute('form','CartDrawer-Form');expect(f.errors).toEqual([]);
  12 | });
  13 | test('offline cart notes use native update endpoint without new purchasing rules',async({page})=>{
  14 |  const f=await F.mount(page,{note:true});await page.locator('#Cart-note').fill('Fixture purchase order reference');await expect.poll(()=>f.requests.length).toBe(1);expect(f.requests[0]).toEqual({note:'Fixture purchase order reference'});expect(f.errors).toEqual([]);
  15 | });
  16 | test('offline mixed equipment cart uses native identities without a freight or compatibility promise',async({page})=>{
  17 |  await F.mount(page,{mixed:true});await expect(page.locator('main .cart-item')).toHaveCount(2);await expect(page.locator('#Quantity-1')).toHaveAttribute('data-quantity-variant-id',fixture.items[0].variantId);await expect(page.locator('#Quantity-2')).toHaveAttribute('data-quantity-variant-id',fixture.machine.variantId);await expect(page.locator('main [name=checkout]')).toBeEnabled();expect(await page.locator('main').innerText()).not.toMatch(/guaranteed delivery|free freight|required accessory|compatible with/i);
  18 | });
  19 | for(const width of [390,360,1440])test('actual preview isolated native cart '+width,async({browser})=>{
  20 |  test.setTimeout(240000);expect(process.env.RHINO_J_LIVE).toBe('1');const out={mode:'ACTUAL_UNPUBLISHED_PREVIEW',themeId:'158631198917',width,startedAt:new Date().toISOString(),requests:[],checks:[],findings:[],failures:[]};let context,page,isolated=false,mocked=false;
  21 |  const record=(id,details={})=>out.checks.push({id,status:'PASS',details});
  22 |  try{
  23 |   // Auth itself uses a new anonymous context. Preserve its platform access cookies,
  24 |   // exclude cart cookies, and independently prove this new cart is empty before writes.
  25 |   const cookies=(await auth(browser)).filter(c=>!/^cart(?:$|_)/i.test(c.name));context=await browser.newContext({viewport:{width,height:1000}});await context.addCookies(cookies);
  26 |   context.on('request',r=>{const u=new URL(r.url());if(r.method()==='POST'&&/^\/cart\/(add|change|update|clear)(\.js)?$/.test(u.pathname))out.requests.push({path:u.pathname,method:'POST',mode:mocked?'FIXTURE':'ACTUAL'});});
  27 |   await context.route('**/*',route=>{const u=new URL(route.request().url());if(/\/checkouts?(\/|$)|\/payments?(\/|$)|\/orders?(\/|$)|\/admin(\/|$)/.test(u.pathname)){out.findings.push({id:'prohibited-navigation-attempt',path:u.pathname});return route.abort();}return route.continue();});
  28 |   page=await context.newPage();page.setDefaultTimeout(20000);const goto=async route=>{const r=await page.goto('https://sz5dnk-nf.myshopify.com'+route+(route.includes('?')?'&':'?')+'preview_theme_id=158631198917',{waitUntil:'load',timeout:45000});expect(r.status()).toBe(200);expect(await page.evaluate(()=>String(Shopify.theme.id))).toBe(out.themeId);await page.waitForTimeout(500);};
  29 |   const cart=async()=>{for(let attempt=0;attempt<3;attempt++){const r=await context.request.get('https://sz5dnk-nf.myshopify.com/cart.js',{headers:{Accept:'application/json'}});if(r.status()>=500&&attempt<2){out.findings.push({id:'transient-cart-read',status:r.status(),attempt});await page.waitForTimeout(1000);continue;}expect(r.status()).toBe(200);return r.json();}};
  30 |   const waitCart=async count=>expect.poll(async()=>(await cart()).item_count,{timeout:15000}).toBe(count);
  31 |   const add=async qty=>{await page.locator('main input[name=quantity]').fill(String(qty));const response=page.waitForResponse(r=>/\/cart\/add(?:\.js)?$/.test(new URL(r.url()).pathname)&&r.request().method()==='POST');await page.locator('main [name=add]').click();expect((await response).status()).toBe(200);await expect(page.locator('#cart-notification')).toHaveClass(/active/);};
  32 |   await goto('/products/saw-blade');expect((await cart()).item_count).toBe(0);isolated=true;record('isolated-initial-cart-empty');expect(await page.locator('main product-form [name=id]').inputValue()).toBe(fixture.items[0].variantId);await add(width===390?2:1);await waitCart(width===390?2:1);record('single-Variant-native-add',{variant:fixture.items[0].variantId,quantity:width===390?2:1});
  33 |   const notification=page.locator('#cart-notification');await expect(notification).toHaveAttribute('role','dialog');await expect(notification).toHaveAttribute('aria-modal','true');await page.waitForTimeout(450);expect(await page.evaluate(()=>!!document.activeElement.closest('cart-notification'))).toBe(true);await page.keyboard.press('Escape');await expect(page.locator('main [name=add]')).toBeFocused();record('notification-Escape-focus-return');
  34 |   await page.evaluate(()=>document.querySelector('cart-notification').open());await page.locator('#cart-notification-button').click();await page.waitForLoadState('load');expect(new URL(page.url()).pathname).toBe('/cart');expect(await page.locator('cart-drawer').count()).toBe(0);record('active-notification-to-cart-page',{drawer:'NOT APPLICABLE — inactive configuration'});
  35 |   if(width===390){
  36 |    await goto('/products/saw-blade');const picker=page.locator('variant-selects');expect(await picker.locator('input[type=radio], option').count()).toBe(4);const second=fixture.items[1];const radio=picker.locator('input[type=radio]').nth(1);if(await radio.count())await picker.locator('label[for="'+await radio.getAttribute('id')+'"]').click();else await picker.locator('select').selectOption({label:second.option});await expect(page.locator('main product-form [name=id]')).toHaveValue(second.variantId);await expect(page).toHaveURL(new RegExp('variant='+second.variantId));record('Saw-Blade-four-Size-native-URL-and-Variant');await add(1);await waitCart(3);await page.locator('#cart-notification-button').click();await page.waitForLoadState('load');const c=await cart();expect(c.items.map(i=>String(i.variant_id)).sort()).toEqual(fixture.items.map(i=>i.variantId).sort());expect(c.total_price).toBe(5500);record('two-Variants-native-subtotal',{subtotalCents:c.total_price});
  37 |    const row=page.locator('main .cart-item').filter({has:page.locator('[data-quantity-variant-id="'+fixture.items[0].variantId+'"]')});for(const [button,count]of [['plus',4],['minus',3]]){await row.locator('[name='+button+']').click();await waitCart(count);await page.waitForTimeout(400);}record('native-quantity-increase-decrease');
  38 |    const before=(await cart()).item_count;mocked=true;await page.route('**/cart/change*',r=>r.fulfill({status:422,json:{errors:'J0 fixture inventory quantity unavailable'}}));await row.locator('[name=plus]').click();await expect(row.locator('.cart-item__error-text')).toHaveText('J0 fixture inventory quantity unavailable');expect((await cart()).item_count).toBe(before);await page.unroute('**/cart/change*');mocked=false;record('mocked-invalid-update-visible-error-and-native-state-preservation');
  39 |    await page.locator('main .cart-item__name').first().click();await page.waitForLoadState('load');await page.goBack({waitUntil:'load'});expect(new URL(page.url()).pathname).toBe('/cart');expect((await cart()).item_count).toBe(3);await expect(page.locator('main .cart-item')).toHaveCount(2);await page.goForward({waitUntil:'load'});await page.goBack({waitUntil:'load'});record('back-forward-native-cart-state');
  40 |   }
  41 |   await page.evaluate(()=>document.documentElement.style.fontSize=parseFloat(getComputedStyle(document.documentElement).fontSize)*2+'px');await page.waitForTimeout(400);
> 42 |   const geometry=await page.evaluate(()=>({route:location.pathname,themeId:String(window.Shopify?.theme?.id),viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,id:e.id,class:e.className,right:e.getBoundingClientRect().right})),overflow:document.documentElement.scrollWidth>innerWidth+1,headerHeight:document.querySelector('header.header')?.getBoundingClientRect().height,quantity:[...document.querySelectorAll('main input[name="updates[]"]')].map(e=>({label:e.getAttribute('aria-label'),disabled:e.disabled,width:e.getBoundingClientRect().width})),subtotal:document.querySelector('main .totals')?.textContent.trim(),note:!!document.querySelector('main cart-note'),express:document.querySelectorAll('main .additional-checkout-buttons').length,discountInput:!!document.querySelector('main input[name=discount]')}));out.text200=geometry;out.checks.push({id:'enlarged-text-no-horizontal-overflow',status:geometry.overflow?'FAIL':'PASS',details:geometry});if(geometry.overflow)out.findings.push({id:'J-DEF-002',severity:'high',owner:'J-PBI-002',condition:'200% root text on populated native cart',geometry});expect.soft(geometry.overflow,'J-DEF-002 populated cart 200% root text overflow').toBe(false);expect(geometry.quantity.every(q=>q.label&&q.width>0&&!q.disabled)).toBe(true);
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  ^ Error: J-DEF-002 populated cart 200% root text overflow
  43 |   const checkout=page.locator('main [name=checkout]');await checkout.focus();await checkout.scrollIntoViewIfNeeded();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(checkout).toBeFocused();await expect(checkout).toBeVisible();await expect(checkout).toBeEnabled();expect(await checkout.getAttribute('form')).toBe('cart');record('native-checkout-entry-no-submit-no-account-requirement');
  44 |   const axe=await new AxeBuilder({page}).analyze();out.axe=axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));const provider={origin:'https://cdn.shopify.com',path:'/shopifycloud/preview-bar/index.html',scriptVerified:await page.evaluate(()=>[...document.querySelectorAll('script[src]')].some(e=>e.src.includes('cdn.shopify.com')&&e.src.includes('preview-bar')))};out.axeOwnership=I.splitAxe(out.axe,provider);const severe=out.axeOwnership.storefront.filter(v=>['serious','critical'].includes(v.impact));if(severe.length)out.findings.push({id:'storefront-accessibility',severity:'serious-or-critical',details:severe});
  45 |   await page.screenshot({path:J.directory()+'/cart-'+width+'-text200.png',fullPage:true});record('responsive-root-text-labels-and-axe');await page.evaluate(()=>document.documentElement.style.fontSize='');
  46 |   while((await cart()).item_count){const expected=(await cart()).items.length-1;await page.locator('main cart-remove-button a').first().click();await expect.poll(async()=>(await cart()).items.length).toBe(expected);await page.waitForTimeout(400);}await waitCart(0);await expect(page.locator('main .cart__empty-text')).toBeVisible();await expect(page.locator('main [name=checkout]')).not.toBeVisible();out.cleaned=true;record('native-remove-and-empty-cart-recovery');
  47 |   if(width===390){for(const handle of ['mr16','saw-vice-plate-set']){await goto('/products/'+handle);await expect(page.locator('main [name=add]')).toBeEnabled();out.checks.push({id:'unresolved-zero-Product-observed-no-cart-write',status:'PASS',details:{handle,variant:await page.locator('main product-form [name=id]').inputValue()}});}await goto('/products/em-1');await expect(page.locator('main [name=add]')).toBeDisabled();record('actual-native-machine-sold-out-no-purchase-attempt');}
  48 |  }catch(e){out.failures.push({message:e.message,stack:e.stack});if(page)await page.screenshot({path:J.outputPath('failure-'+width+'.png'),fullPage:true}).catch(()=>{});throw e;}finally{
  49 |   if(context&&isolated&&!out.cleaned){try{const origin='https://sz5dnk-nf.myshopify.com';mocked=false;await page.unroute('**/cart/change*');const r=await context.request.get(origin+'/cart.js',{headers:{Accept:'application/json'}}),c=await r.json();expect(c.items.every(i=>fixture.items.some(v=>v.variantId===String(i.variant_id)))).toBe(true);for(const i of c.items){out.requests.push({path:'/cart/change.js',method:'POST',mode:'ACTUAL_FAILURE_CLEANUP'});const r=await context.request.post(origin+'/cart/change.js',{headers:{Accept:'application/json'},data:{id:i.key,quantity:0}});expect(r.status()).toBe(200);}out.cleaned=(await(await context.request.get(origin+'/cart.js')).json()).item_count===0;}catch(e){out.failures.push({cleanup:e.message});}}
  50 |   if(context)await context.close();out.completedAt=new Date().toISOString();J.write('cart-live-'+width+'.json',out);
  51 |  }
  52 | });
  53 | 
```