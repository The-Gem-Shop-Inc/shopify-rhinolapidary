# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: epic-j-cart.spec.js >> offline cart notes use native update endpoint without new purchasing rules
- Location: tests\epic-j-cart.spec.js:13:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "(intermediate value).connectedCallback is not a function",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Cart" [ref=e2] [cursor=pointer]:
    - /url: /cart
  - main [ref=e3]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - heading "Your cart" [level=1] [ref=e7]
        - link "Continue shopping" [ref=e8] [cursor=pointer]:
          - /url: /collections/all
      - generic [ref=e9]:
        - table "Your cart" [ref=e12]:
          - caption [ref=e13]: Your cart
          - rowgroup [ref=e14]:
            - row "Product Quantity Total" [ref=e15]:
              - columnheader "Product" [ref=e16]
              - columnheader "Quantity" [ref=e17]
              - columnheader "Total" [ref=e18]
          - rowgroup [ref=e19]:
            - 'row "Saw Blade $15.00 Size: 6\" Quantity Decrease quantity for Saw Blade 2 Increase quantity for Saw Blade Remove Saw Blade $30.00" [ref=e20]':
              - cell [ref=e21]
              - 'cell "Saw Blade $15.00 Size: 6\"" [ref=e22]':
                - link "Saw Blade" [ref=e24] [cursor=pointer]:
                  - /url: /products/saw-blade?variant=46484258652357
                - generic [ref=e25]: $15.00
                - generic [ref=e27]:
                  - term [ref=e28]: "Size:"
                  - definition [ref=e29]: 6"
              - cell "Quantity Decrease quantity for Saw Blade 2 Increase quantity for Saw Blade Remove Saw Blade" [ref=e30]:
                - generic [ref=e31]:
                  - generic [ref=e32]:
                    - generic [ref=e33]: Quantity
                    - generic [ref=e34]:
                      - button [ref=e35] [cursor=pointer]:
                        - img [ref=e36]
                      - generic [ref=e40]:
                        - button "Decrease quantity for Saw Blade" [ref=e41] [cursor=pointer]:
                          - generic [ref=e42]: Decrease quantity for Saw Blade
                          - generic:
                            - img
                        - spinbutton "Quantity for Saw Blade" [ref=e43]: "2"
                        - button "Increase quantity for Saw Blade" [ref=e44] [cursor=pointer]:
                          - generic [ref=e45]: Increase quantity for Saw Blade
                          - generic:
                            - img
                    - link "Remove Saw Blade" [ref=e47] [cursor=pointer]:
                      - /url: /cart/change?line=1&quantity=0
                      - img [ref=e49]
                  - alert
              - cell "$30.00" [ref=e52]:
                - generic [ref=e54]: $30.00
            - 'row "Saw Blade $25.00 Size: 8\" Quantity Decrease quantity for Saw Blade 1 Increase quantity for Saw Blade Remove Saw Blade $25.00" [ref=e55]':
              - cell [ref=e56]
              - 'cell "Saw Blade $25.00 Size: 8\"" [ref=e57]':
                - link "Saw Blade" [ref=e59] [cursor=pointer]:
                  - /url: /products/saw-blade?variant=46484258685125
                - generic [ref=e60]: $25.00
                - generic [ref=e62]:
                  - term [ref=e63]: "Size:"
                  - definition [ref=e64]: 8"
              - cell "Quantity Decrease quantity for Saw Blade 1 Increase quantity for Saw Blade Remove Saw Blade" [ref=e65]:
                - generic [ref=e66]:
                  - generic [ref=e67]:
                    - generic [ref=e68]: Quantity
                    - generic [ref=e69]:
                      - button [ref=e70] [cursor=pointer]:
                        - img [ref=e71]
                      - generic [ref=e75]:
                        - button "Decrease quantity for Saw Blade" [ref=e76] [cursor=pointer]:
                          - generic [ref=e77]: Decrease quantity for Saw Blade
                          - generic:
                            - img
                        - spinbutton "Quantity for Saw Blade" [ref=e78]: "1"
                        - button "Increase quantity for Saw Blade" [ref=e79] [cursor=pointer]:
                          - generic [ref=e80]: Increase quantity for Saw Blade
                          - generic:
                            - img
                    - link "Remove Saw Blade" [ref=e82] [cursor=pointer]:
                      - /url: /cart/change?line=2&quantity=0
                      - img [ref=e84]
                  - alert
              - cell "$25.00" [ref=e87]:
                - generic [ref=e89]: $25.00
        - status [ref=e90]: Loading...
    - generic [ref=e93]:
      - generic [ref=e94]:
        - generic [ref=e95]: Order special instructions
        - textbox "Order special instructions" [active] [ref=e96]: Fixture purchase order reference
      - generic [ref=e97]:
        - generic [ref=e99]:
          - heading "Estimated total" [level=2] [ref=e100]
          - paragraph [ref=e101]: $55.00 USD
        - button "Check out" [ref=e103] [cursor=pointer]
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
> 14 |  const f=await F.mount(page,{note:true});await page.locator('#Cart-note').fill('Fixture purchase order reference');await expect.poll(()=>f.requests.length).toBe(1);expect(f.requests[0]).toEqual({note:'Fixture purchase order reference'});expect(f.errors).toEqual([]);
     |                                                                                                                                                                                                                                                               ^ Error: expect(received).toEqual(expected) // deep equality
  15 | });
  16 | test('offline mixed equipment cart uses native identities without a freight or compatibility promise',async({page})=>{
  17 |  await F.mount(page,{mixed:true});await expect(page.locator('main .cart-item')).toHaveCount(2);await expect(page.locator('#Quantity-1')).toHaveAttribute('data-quantity-variant-id',fixture.items[0].variantId);await expect(page.locator('#Quantity-2')).toHaveAttribute('data-quantity-variant-id',fixture.machine.variantId);await expect(page.locator('main [name=checkout]')).toBeEnabled();expect(await page.locator('main').innerText()).not.toMatch(/guaranteed delivery|free freight|required accessory|compatible with/i);
  18 | });
  19 | for(const width of [390,360,1440])test('actual preview isolated native cart '+width,async({browser})=>{
  20 |  test.setTimeout(240000);expect(process.env.RHINO_J_LIVE).toBe('1');const out={mode:'ACTUAL_UNPUBLISHED_PREVIEW',themeId:'158631198917',width,startedAt:new Date().toISOString(),requests:[],checks:[],findings:[],failures:[]};let context,page,isolated=false,mocked=false;
  21 |  const record=(id,details={})=>out.checks.push({id,status:'PASS',details});
  22 |  try{
  23 |   const cookies=(await auth(browser)).filter(c=>c.name==='storefront_digest');context=await browser.newContext({viewport:{width,height:1000}});await context.addCookies(cookies);
  24 |   context.on('request',r=>{const u=new URL(r.url());if(r.method()==='POST'&&/^\/cart\/(add|change|update|clear)(\.js)?$/.test(u.pathname))out.requests.push({path:u.pathname,method:'POST',mode:mocked?'FIXTURE':'ACTUAL'});});
  25 |   await context.route('**/*',route=>{const u=new URL(route.request().url());if(/\/checkouts?(\/|$)|\/payments?(\/|$)|\/orders?(\/|$)|\/admin(\/|$)/.test(u.pathname)){out.findings.push({id:'prohibited-navigation-attempt',path:u.pathname});return route.abort();}return route.continue();});
  26 |   page=await context.newPage();page.setDefaultTimeout(20000);const goto=async route=>{const r=await page.goto('https://sz5dnk-nf.myshopify.com'+route+(route.includes('?')?'&':'?')+'preview_theme_id=158631198917',{waitUntil:'load',timeout:45000});expect(r.status()).toBe(200);expect(await page.evaluate(()=>String(Shopify.theme.id))).toBe(out.themeId);await page.waitForTimeout(500);};
  27 |   const cart=async()=>{const r=await context.request.get(new URL('/cart.js',page.url()).toString());expect(r.status()).toBe(200);return r.json();};
  28 |   const waitCart=async count=>expect.poll(async()=>(await cart()).item_count,{timeout:15000}).toBe(count);
  29 |   const add=async qty=>{await page.locator('main input[name=quantity]').fill(String(qty));const response=page.waitForResponse(r=>/\/cart\/add(?:\.js)?$/.test(new URL(r.url()).pathname)&&r.request().method()==='POST');await page.locator('main [name=add]').click();expect((await response).status()).toBe(200);await expect(page.locator('#cart-notification')).toHaveClass(/active/);};
  30 |   await goto('/products/saw-blade');expect((await cart()).item_count).toBe(0);isolated=true;record('isolated-initial-cart-empty');expect(await page.locator('main product-form [name=id]').inputValue()).toBe(fixture.items[0].variantId);await add(width===390?2:1);await waitCart(width===390?2:1);record('single-Variant-native-add',{variant:fixture.items[0].variantId,quantity:width===390?2:1});
  31 |   const notification=page.locator('#cart-notification');await expect(notification).toHaveAttribute('role','dialog');await expect(notification).toHaveAttribute('aria-modal','true');await page.waitForTimeout(450);expect(await page.evaluate(()=>!!document.activeElement.closest('cart-notification'))).toBe(true);await page.keyboard.press('Escape');await expect(page.locator('main [name=add]')).toBeFocused();record('notification-Escape-focus-return');
  32 |   await page.evaluate(()=>document.querySelector('cart-notification').open());await page.locator('#cart-notification-button').click();await page.waitForLoadState('load');expect(new URL(page.url()).pathname).toBe('/cart');expect(await page.locator('cart-drawer').count()).toBe(0);record('active-notification-to-cart-page',{drawer:'NOT APPLICABLE — inactive configuration'});
  33 |   if(width===390){
  34 |    await goto('/products/saw-blade');const picker=page.locator('variant-selects');expect(await picker.locator('input[type=radio], option').count()).toBe(4);const second=fixture.items[1];const radio=picker.locator('input[type=radio]').nth(1);if(await radio.count())await picker.locator('label[for="'+await radio.getAttribute('id')+'"]').click();else await picker.locator('select').selectOption({label:second.option});await expect(page.locator('main product-form [name=id]')).toHaveValue(second.variantId);await expect(page).toHaveURL(new RegExp('variant='+second.variantId));record('Saw-Blade-four-Size-native-URL-and-Variant');await add(1);await waitCart(3);await page.locator('#cart-notification-button').click();await page.waitForLoadState('load');const c=await cart();expect(c.items.map(i=>String(i.variant_id)).sort()).toEqual(fixture.items.map(i=>i.variantId).sort());expect(c.total_price).toBe(5500);record('two-Variants-native-subtotal',{subtotalCents:c.total_price});
  35 |    const row=page.locator('main .cart-item').filter({has:page.locator('[data-quantity-variant-id="'+fixture.items[0].variantId+'"]')});for(const [button,count]of [['plus',4],['minus',3]]){await row.locator('[name='+button+']').click();await waitCart(count);await page.waitForTimeout(400);}record('native-quantity-increase-decrease');
  36 |    const before=(await cart()).item_count;mocked=true;await page.route('**/cart/change*',r=>r.fulfill({status:422,json:{errors:'J0 fixture inventory quantity unavailable'}}));await row.locator('[name=plus]').click();await expect(row.locator('.cart-item__error-text')).toHaveText('J0 fixture inventory quantity unavailable');expect((await cart()).item_count).toBe(before);await page.unroute('**/cart/change*');mocked=false;record('mocked-invalid-update-visible-error-and-native-state-preservation');
  37 |    await page.locator('main .cart-item__name').first().click();await page.waitForLoadState('load');await page.goBack({waitUntil:'load'});expect(new URL(page.url()).pathname).toBe('/cart');expect((await cart()).item_count).toBe(3);await expect(page.locator('main .cart-item')).toHaveCount(2);await page.goForward({waitUntil:'load'});await page.goBack({waitUntil:'load'});record('back-forward-native-cart-state');
  38 |   }
  39 |   await page.evaluate(()=>document.documentElement.style.fontSize=parseFloat(getComputedStyle(document.documentElement).fontSize)*2+'px');await page.waitForTimeout(400);
  40 |   const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,headerHeight:document.querySelector('header.header')?.getBoundingClientRect().height,quantity:[...document.querySelectorAll('main input[name="updates[]"]')].map(e=>({label:e.getAttribute('aria-label'),disabled:e.disabled,width:e.getBoundingClientRect().width})),subtotal:document.querySelector('main .totals')?.textContent.trim(),note:!!document.querySelector('main cart-note'),express:document.querySelectorAll('main .additional-checkout-buttons').length,discountInput:!!document.querySelector('main input[name=discount]')}));expect(geometry.overflow).toBe(false);expect(geometry.quantity.every(q=>q.label&&q.width>0&&!q.disabled)).toBe(true);out.text200=geometry;
  41 |   const checkout=page.locator('main [name=checkout]');await checkout.focus();await checkout.scrollIntoViewIfNeeded();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(checkout).toBeFocused();await expect(checkout).toBeVisible();await expect(checkout).toBeEnabled();expect(await checkout.getAttribute('form')).toBe('cart');record('native-checkout-entry-no-submit-no-account-requirement');
  42 |   const axe=await new AxeBuilder({page}).analyze();out.axe=axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));const provider={origin:'https://cdn.shopify.com',path:'/shopifycloud/preview-bar/index.html',scriptVerified:await page.evaluate(()=>[...document.querySelectorAll('script[src]')].some(e=>e.src.includes('cdn.shopify.com')&&e.src.includes('preview-bar')))};out.axeOwnership=I.splitAxe(out.axe,provider);const severe=out.axeOwnership.storefront.filter(v=>['serious','critical'].includes(v.impact));if(severe.length)out.findings.push({id:'storefront-accessibility',severity:'serious-or-critical',details:severe});
  43 |   await page.screenshot({path:J.directory()+'/cart-'+width+'-text200.png',fullPage:true});record('responsive-root-text-labels-and-axe');await page.evaluate(()=>document.documentElement.style.fontSize='');
  44 |   while((await cart()).item_count){const expected=(await cart()).items.length-1;await page.locator('main cart-remove-button a').first().click();await expect.poll(async()=>(await cart()).items.length).toBe(expected);await page.waitForTimeout(400);}await waitCart(0);await expect(page.locator('main .cart__empty-text')).toBeVisible();await expect(page.locator('main [name=checkout]')).not.toBeVisible();out.cleaned=true;record('native-remove-and-empty-cart-recovery');
  45 |   if(width===390){for(const handle of ['mr16','saw-vice-plate-set']){await goto('/products/'+handle);await expect(page.locator('main [name=add]')).toBeEnabled();out.checks.push({id:'unresolved-zero-Product-observed-no-cart-write',status:'PASS',details:{handle,variant:await page.locator('main product-form [name=id]').inputValue()}});}await goto('/products/em-1');await expect(page.locator('main [name=add]')).toBeDisabled();record('actual-native-machine-sold-out-no-purchase-attempt');}
  46 |  }catch(e){out.failures.push({message:e.message,stack:e.stack});throw e;}finally{
  47 |   if(context&&isolated&&!out.cleaned){try{const origin=new URL(page.url()).origin,r=await context.request.get(origin+'/cart.js'),c=await r.json();expect(c.items.every(i=>fixture.items.some(v=>v.variantId===String(i.variant_id)))).toBe(true);for(const i of c.items){out.requests.push({path:'/cart/change.js',method:'POST',mode:'ACTUAL_FAILURE_CLEANUP'});const r=await context.request.post(origin+'/cart/change.js',{data:{id:i.key,quantity:0}});expect(r.status()).toBe(200);}out.cleaned=(await(await context.request.get(origin+'/cart.js')).json()).item_count===0;}catch(e){out.failures.push({cleanup:e.message});}}
  48 |   if(context)await context.close();out.completedAt=new Date().toISOString();J.write('cart-live-'+width+'.json',out);
  49 |  }
  50 | });
  51 | 
```