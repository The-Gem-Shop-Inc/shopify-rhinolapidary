# Rhino Lapidary J/G Publication Readiness

**Review date:** November 20, 2026  
**Store:** `sz5dnk-nf.myshopify.com`  
**Previous production theme:** `158579622085`  
**Verified staging theme:** `169509912773`  
**Publication target:** New GitHub connected theme, ID pending  
**GitHub branch:** `shopify/live`

## Completed evidence

- [x] Production baseline retained and verified.
- [x] Staging candidate contains exactly 407 files.
- [x] All 49 non-English locale files removed.
- [x] V4 staging digest verified: `d9f231936cbdf322a558bcfe2e1ebcd2dd95908176fa53716035506c12e3895f`.
- [x] Existing storefront functional tests passed, reported by Product Owner.
- [x] Shopify Draft Order API test created and independently verified as `#D4`.
- [x] Test Draft Order has no customer visibility and no invoice sent.

## Release corrections and remaining evidence

- [x] V5 catalog navigation styling accepted on desktop and mobile.
- [x] Customer quotation app proxy creates a confirmed Draft Order.
- [x] Quote reference and staff Draft Order identifier match the Shopify record.
- [x] Pickup eligibility behavior accepted.
- [x] GitHub `shopify/live` branch connected to an unpublished theme.
- [x] Connected theme matches the exact V5 candidate inventory.
- [ ] Final accessibility and performance checks accepted.
- [ ] Two inherited Theme Check warning exceptions approved.
- [ ] Brand, content, legal, support, and operations signoffs recorded.
- [ ] Production backup identity and rollback procedure verified.
- [ ] Production publication verified after deployment.

## Controlled test records

**Administrative test:** Shopify Draft Order `#D4`  
**Purpose:** Verify Admin Draft Order creation and readback.  
**Status:** Passed. Not a sale. No invoice sent.

**Storefront integration test:** Pending.  
**Expected evidence:** Quotation reference, staff Draft Order number, HTTP response, and independent Shopify Admin readback.

## Publication decision

**Current decision:** NO-GO until outstanding acceptance criteria are complete.

**Authorized release principle:** Publish only after technical, operational, and owner acceptance gates are satisfied.

**Publication theme ID:** Pending.

**Previous production theme for rollback:** `158579622085`.

**Product Owner approval:** Pending final candidate verification.

**Publication result and timestamp:** Pending.