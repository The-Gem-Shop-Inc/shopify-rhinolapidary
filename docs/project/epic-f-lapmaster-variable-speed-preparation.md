# LapMaster variable-speed implementation preparation

Both owners confirm a current variable-speed option and request a new Variant. E-MUT-036 is not the correct optional-Product operation. No Variants created.

See the exact fresh Product/Variant/inventory snapshot and individual missing values in [the preparation artifact](../../data/epic-f-lapmaster-variable-speed-preparation.json).

Before an execution plan can be approved, supply: exact option name; exact option values for each configuration; new Variant price and compare-at decision; SKU and barcode or explicit permitted blank; inventory tracking/policy and availability by location; Variant weight and shipping/tax state; whether both fixed-speed and variable-speed remain purchasable; technical differences and their exact Variant-aware data ownership; existing Variant identity preservation and Default Title conversion; fulfillment/profile, selling-plan and app Variant-identity review. Product-level technical facts must not silently describe a different configuration. Existing Variant IDs must remain stable where retained.

Current read-only catalog state:

| Product | Existing Variant | Price / compare-at | SKU / barcode | Tracking / policy | Native weight | Shipping / taxable |
|---|---|---|---|---|---|---|
| LapMaster 12" | gid://shopify/ProductVariant/46484255637701 | 1650.00 / blank | blank / blank | false / DENY | 180 POUNDS | true / true |
| LapMaster 18" | gid://shopify/ProductVariant/46484255703237 | 2850.00 / blank | blank / blank | false / DENY | 180 POUNDS | true / true |

Both currently use the sole option Title → Default Title, one Variant, ACTIVE publication and template machine. Inventory location 1411 6th Ave reports zero available/on-hand/committed/reserved/incoming. Tracking is off; zero stock is not converted into an approved new availability decision. General delivery profile is observed. No linked option metafield, selling-plan group or bundle components were returned; Variant metafields are captured in the exact artifact. External app state is outside this read. Existing weights/prices are observations and must not be cloned into the variable-speed configuration without approval.
