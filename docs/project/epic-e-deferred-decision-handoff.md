# Epic E deferred decisions and migration readiness

Assessed 2026-09-09T22:12:21.000Z. Reviewers are temporarily unavailable; this changes scheduling only. No decision is waived.

Epic E architecture and migration planning substantially complete; live migration and human-owned value closure deferred.

Admin: **admin_inaccessible**, dated snapshot 2026-09-03T17:52:28.268Z; expires 2026-09-10T17:52:28.268Z. The builder performs no Admin query; audit provenance is recorded separately.

## Independent domain plans

| Plan | Domain | Approved rows | Candidate rows | Execution |
|---|---|---:|---:|---|
| E-MUT-020 (E-PBI-020) | definitions | 38 | 0 | Blocked; no GO |
| E-MUT-021 (E-PBI-021A) | product_class | 122 | 0 | Blocked; no GO |
| E-MUT-022 (E-PBI-021B) | category | 3 | 119 | Blocked; no GO |
| E-MUT-023 (E-PBI-021C) | vendor | 0 | 11 | Blocked; no GO |
| E-MUT-024 (E-PBI-021D) | commerce_sku | 0 | 125 | Blocked; no GO |
| E-MUT-025 (E-PBI-021E) | machine_family | 0 | 31 | Blocked; no GO |
| E-MUT-026 (E-PBI-022A) | electrical | 0 | 0 | Blocked; no GO |
| E-MUT-027 (E-PBI-022B) | motor_speed | 0 | 0 | Blocked; no GO |
| E-MUT-028 (E-PBI-022C) | tool_mount | 0 | 0 | Blocked; no GO |
| E-MUT-029 (E-PBI-022D) | water_fluid | 0 | 0 | Blocked; no GO |
| E-MUT-030 (E-PBI-022E) | durable_measurements | 0 | 0 | Blocked; no GO |
| E-MUT-031 (E-PBI-022F) | crate_measurements | 0 | 0 | Blocked; no GO |
| E-MUT-032 (E-PBI-022G) | shipping_weight | 0 | 0 | Blocked; no GO |
| E-MUT-033 (E-PBI-022H) | fulfillment_class | 0 | 0 | Blocked; no GO |
| E-MUT-034 (E-PBI-023A) | compatibility | 0 | 0 | Blocked; no GO |
| E-MUT-035 (E-PBI-023B) | included_components | 0 | 0 | Blocked; no GO |
| E-MUT-036 (E-PBI-023C) | optional_components | 0 | 0 | Blocked; no GO |
| E-MUT-037 (E-PBI-023D) | recommendations | 0 | 0 | Blocked; no GO |
| E-MUT-038 (E-PBI-023E) | customer_manuals | 0 | 0 | Blocked; no GO |
| E-MUT-039 (E-PBI-023F) | diagrams_instructions_videos | 0 | 0 | Blocked; no GO |
| E-MUT-040 (E-PBI-023G) | warranty_support | 0 | 0 | Blocked; no GO |
| E-MUT-041 (E-PBI-023H) | pickup_region | 0 | 0 | Blocked; no GO |

Approved row counts are preparation inputs, never execution authorization. The three Category rows retain explicit PO-E-042/043/044 approval; 119 remain proposals. Vendor evidence needs domain GO under PO-E-016, without redundant review of already unambiguous brand evidence. Machine-family membership has no approved exact value mappings or target metaobject GIDs.

## Reviewer handoff

### PO-E-012 — Technical, Product Owner

Which size-specific technical item does the current Automatic Feed Clamp Product sell? Resolve the exact identity before SKU or fit approval.

Current state: pending; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: Automatic Feed Clamp

Evidence: [data/epic-e-batch-3b-decision-packet.json](../../data/epic-e-batch-3b-decision-packet.json); source decision IDs: B3B-D01, PO-E-012.

Unblocks: E-MUT-024, E-MUT-034. Consumers: F, G, J, K, L, O.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### PO-E-013 — Technical, Product Owner

Which size-specific technical item does the current Saw Vice Plate Set Product sell? Resolve the exact identity before SKU or fit approval.

Current state: pending; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: Saw Vice Plate Set

Evidence: [data/epic-e-batch-3b-decision-packet.json](../../data/epic-e-batch-3b-decision-packet.json); source decision IDs: B3B-D01, PO-E-013.

Unblocks: E-MUT-024, E-MUT-034. Consumers: F, G, J, K, L, O.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### SKU-ALLOCATIONS — Product Owner

Review the 121 deterministic RH-###### proposals for issuance; retain two ambiguous identities and two non-sellable deferrals. Scheme approval does not issue an SKU.

Current state: proposed; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: 6 in Bonded Diamond Wheel, 220 grit; 6 in Bonded Diamond Wheel, 80 grit; 6 in Hard Buffing Wheel; 6 in Magnetic Felt Pad; 6 in Magnetic Hard Disc, 80 grit; 6 in Magnetic Resin Bond Disc, 220 grit; 6 in Magnetic Resin Bond Disc, 600 grit; 6 in Metal Screw-On Flat Lap; 6 in Resin Bond Diamond Wheel, 1200 grit; 6 in Resin Bond Diamond Wheel, 280 grit; 6 in Resin Bond Diamond Wheel, 3000 grit; 6 in Resin Bond Diamond Wheel, 600 grit; 6 in Soft Buffing Wheel; 6 in Trim Saw; Allen Wrench; Anchor Rod, x4; Arbor Adapter Washer, 1" to 1 & 1/4", x2; Arbor Nut, 1"; Arbor Size Conversion Bolt; Arbor Spoke Nut; Arbor Washer, 1", x2; Arbor Wrench; BeadMaster 6"; Belt Guard (JadeMaster); Brass Sprayer; Buffing Wheel Head; Conical Grinder; Cylindrical Grinder; Debris Guard; DIALUX Polishing Paste; DIALUX Superfinishing Paste; Drain Plug (JadeMaster); Drain Plug, 15/16"; EM-1 Machine; Feet, x4 (JadeMaster); Final Sanding Wheel Head; Flexible Shaft; Flexible Shaft Attachment; Flexible Shaft Bit Turntable; Flexible Shaft Pack; Flexible Water Spout; JadeMaster, 14"; KUM800 Sanding Wheel; Lap Fixture Bolt Pack; LapMaster 12"; LapMaster 18"; LapMaster Lap Bolt; Large Drill; Large Silversmithing Ball Head; Large Stonework Bullnose Head; Large Stonework Inverted 60° Cone Head; Left Arbor Nut; Left Arbor Set Screw & Spring; Left Arbor Shaft; Left Moss Pad; Lock Nut Fixture for Plexiglass Insert, x4; Magnifying Glass Arm; Medium Silversmithing Ball Head; Metal Spindle, Left; Metal Spindle, Pair; Metal Spindle, Right; Moss Pad, Pack of 2; MR16 LED Bulb; Nylon Bristle Brush Head; Plastic End Spacer; Plastic Trim Saw Spacer; Plastic Wheel Spacer; Plastic Wheel Spacer, 5 pack; Plexiglass Insert Spacers, x4; Power Feed Bearings Set, x2; Power Grip Belt, 26"; Pulleys, x2 (18" LapMaster); Pulleys, x2 (JadeMaster); Pulleys, x2 (TrimMaster); Purple Jade Bead Strand; Right Arbor Nut; Right Arbor Set Screw & Spring; Right Arbor Shaft; Right Moss Pad; Right Plexiglass Spray Guard; Rotation Table; Rotational Lock; Rotational Lock Handle; Rubber Feet for 18" LapMaster, x3; Saw Blade; Saw Table; SawMaster 18"; SawMaster 24"; ShapeMaster 6"; Sled Release Handle; Small Drill; Small Silversmithing Ball Head; Small Stonework Bullnose Head; Small Stonework Inverted 60° Cone Head; Spoke Wrench; Spotlight; Stonework Ball Head; Stonework Flame Head; Stonework Inverted 30° Cone Head; Stonework Taper Head; Thumb Spindle Knob; TOFF Brush Wheel; Triangle Latch Screws, x2; Trim Saw Accessories Knob; TrimMaster; TrimMaster Adjustable Feet, x4; TrimMaster Belt Guard; TrimMaster Plexiglass Insert; TrimMaster Splash Guard, Front; TrimMaster Splash Guard, Upper; TrimMaster Straight Edge Guide; Vice Clamp Riser; Vice Clamp Set; Water Guard; Water Pump; Wing Nut, x2; Wrist Rest; Wrist Rest Knob

Evidence: [data/rhino-commerce-sku-registry.json](../../data/rhino-commerce-sku-registry.json); source decision IDs: PO-E-041.

Unblocks: E-MUT-024. Consumers: F, J, K, L, O.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3B-D05 — Operations, Technical

Confirm net/assembled/crate physical states, axes and packing revision; supply actual missing native shipping weights and package counts. Multi-package records require direct evidence.

Current state: pending; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: Anchor Rod, x4; Arbor Adapter Washer, 1" to 1 & 1/4", x2; Arbor Nut, 1"; Arbor Wrench; Automatic Feed Clamp; Belt Guard (JadeMaster); Debris Guard; Drain Plug (JadeMaster); Drain Plug, 15/16"; Feet, x4 (JadeMaster); Flexible Water Spout; JadeMaster, 14"; LapMaster Lap Bolt; Lock Nut Fixture for Plexiglass Insert, x4; Plexiglass Insert Spacers, x4; Power Feed Bearings Set, x2; Power Grip Belt, 26"; Pulleys, x2 (18" LapMaster); Pulleys, x2 (JadeMaster); Pulleys, x2 (TrimMaster); Purple Jade Bead Strand; Rotation Table; Rotational Lock; Rotational Lock Handle; Rubber Feet for 18" LapMaster, x3; Saw Blade; Saw Vice Plate Set; SawMaster, 36"; Sled Release Handle; Thumb Spindle Knob; Triangle Latch Screws, x2; TrimMaster Adjustable Feet, x4; TrimMaster Belt Guard; TrimMaster Plexiglass Insert; TrimMaster Splash Guard, Front; TrimMaster Splash Guard, Upper; TrimMaster Straight Edge Guide; TumbleMaster; Vice Clamp Riser; Vice Clamp Set; Wing Nut, x2

Evidence: [data/epic-e-batch-3b-decision-packet.json](../../data/epic-e-batch-3b-decision-packet.json); source decision IDs: B3B-D05.

Unblocks: E-MUT-030, E-MUT-031, E-MUT-032. Consumers: F, J, K, O.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3C-D01 — Operations, Product Owner, Admin/Engineering

Confirm whether parcel/freight are stable handling requirements, approve exact Product assignments and bind accepted handling to native profile configurations after the detailed read audit. Review nine extracted crate candidates first; do not use weight thresholds or profile names as freight proof.

Current state: blocked; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: 6 in Bonded Diamond Wheel, 220 grit; 6 in Bonded Diamond Wheel, 80 grit; 6 in Hard Buffing Wheel; 6 in Magnetic Felt Pad; 6 in Magnetic Hard Disc, 80 grit; 6 in Magnetic Resin Bond Disc, 220 grit; 6 in Magnetic Resin Bond Disc, 600 grit; 6 in Metal Screw-On Flat Lap; 6 in Resin Bond Diamond Wheel, 1200 grit; 6 in Resin Bond Diamond Wheel, 280 grit; 6 in Resin Bond Diamond Wheel, 3000 grit; 6 in Resin Bond Diamond Wheel, 600 grit; 6 in Soft Buffing Wheel; 6 in Trim Saw; Allen Wrench; Anchor Rod, x4; Arbor Adapter Washer, 1" to 1 & 1/4", x2; Arbor Nut, 1"; Arbor Size Conversion Bolt; Arbor Spoke Nut; Arbor Washer, 1", x2; Arbor Wrench; Automatic Feed Clamp; BeadMaster 6"; Belt Guard (JadeMaster); Brass Sprayer; Buffing Wheel Head; Conical Grinder; Cylindrical Grinder; Debris Guard; DIALUX Polishing Paste; DIALUX Superfinishing Paste; Drain Plug (JadeMaster); Drain Plug, 15/16"; EM-1 Machine; Feet, x4 (JadeMaster); Final Sanding Wheel Head; Flexible Shaft; Flexible Shaft Attachment; Flexible Shaft Bit Turntable; Flexible Shaft Pack; Flexible Water Spout; JadeMaster, 14"; KUM800 Sanding Wheel; Lap Fixture Bolt Pack; LapMaster 12"; LapMaster 18"; LapMaster Lap Bolt; Large Drill; Large Silversmithing Ball Head; Large Stonework Bullnose Head; Large Stonework Inverted 60° Cone Head; Left Arbor Nut; Left Arbor Set Screw & Spring; Left Arbor Shaft; Left Moss Pad; Lock Nut Fixture for Plexiglass Insert, x4; Magnifying Glass Arm; Medium Silversmithing Ball Head; Metal Spindle, Left; Metal Spindle, Pair; Metal Spindle, Right; Moss Pad, Pack of 2; MR16 LED Bulb; Nylon Bristle Brush Head; Plastic End Spacer; Plastic Trim Saw Spacer; Plastic Wheel Spacer; Plastic Wheel Spacer, 5 pack; Plexiglass Insert Spacers, x4; Power Feed Bearings Set, x2; Power Grip Belt, 26"; Pulleys, x2 (18" LapMaster); Pulleys, x2 (JadeMaster); Pulleys, x2 (TrimMaster); Purple Jade Bead Strand; Right Arbor Nut; Right Arbor Set Screw & Spring; Right Arbor Shaft; Right Moss Pad; Right Plexiglass Spray Guard; Rotation Table; Rotational Lock; Rotational Lock Handle; Rubber Feet for 18" LapMaster, x3; Saw Blade; Saw Table; Saw Vice Plate Set; SawMaster 18"; SawMaster 24"; SawMaster, 36"; ShapeMaster 6"; Sled Release Handle; Small Drill; Small Silversmithing Ball Head; Small Stonework Bullnose Head; Small Stonework Inverted 60° Cone Head; Spoke Wrench; Spotlight; Stonework Ball Head; Stonework Flame Head; Stonework Inverted 30° Cone Head; Stonework Taper Head; Thumb Spindle Knob; TOFF Brush Wheel; Triangle Latch Screws, x2; Trim Saw Accessories Knob; TrimMaster; TrimMaster Adjustable Feet, x4; TrimMaster Belt Guard; TrimMaster Plexiglass Insert; TrimMaster Splash Guard, Front; TrimMaster Splash Guard, Upper; TrimMaster Straight Edge Guide; TumbleMaster; Vice Clamp Riser; Vice Clamp Set; Water Guard; Water Pump; Wing Nut, x2; Wrist Rest; Wrist Rest Knob

Evidence: [data/epic-e-batch-3c-decision-packet.json](../../data/epic-e-batch-3c-decision-packet.json); source decision IDs: B3C-D01.

Unblocks: E-MUT-033. Consumers: F, J, K, O, P.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3C-D02 — Operations, Product Owner

Confirm current pickup business permission and seasonal/location process for the seven Products whose descriptions mention Wisconsin year-round and Arizona Jan/Feb. Approve explicit destination restrictions only where evidence supports them; no international eligibility is implied.

Current state: blocked; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: TrimMaster; ShapeMaster 6"; SawMaster 24"; SawMaster 18"; LapMaster 18"; LapMaster 12"; BeadMaster 6"

Evidence: [data/epic-e-batch-3c-decision-packet.json](../../data/epic-e-batch-3c-decision-packet.json); source decision IDs: B3C-D02.

Unblocks: E-MUT-041. Consumers: F, J, K, O, P.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3C-D03 — Legal/Business, Support, Product Owner

Confirm current policy revision and distinct issuer, administrator and repair provider roles, then approve or reject the four pre-extracted historical coverage buckets and Product exceptions. Review third-party brand groups separately; historic one-year/90-day wording does not assign terms.

Current state: blocked; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: See the named source conflict/resource/attribute group; this decision governs semantics rather than a pre-approved Product set.

Evidence: [data/epic-e-batch-3c-decision-packet.json](../../data/epic-e-batch-3c-decision-packet.json); source decision IDs: B3C-D03.

Unblocks: E-MUT-040. Consumers: F, L, O, P.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3B-D06 — Support, Technical, Media, Legal/Business

Choose current canonical File/version per exact model and resource type, confirm language and rights/publication. Review duplicate groups; select no winner by upload date.

Current state: pending; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: LapMaster 12"; SawMaster 18"; EM-1 Machine

Evidence: [data/epic-e-batch-3b-decision-packet.json](../../data/epic-e-batch-3b-decision-packet.json); source decision IDs: B3B-D06.

Unblocks: E-MUT-038, E-MUT-039, E-MUT-040. Consumers: F, L, O, P.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3C-D04 — Operations, Product Owner, Admin/Engineering

Choose native availability without timing promises, or appoint an actual maintainable dispatch/delivery timing source with update process and maximum age. If timing is needed, approve business/calendar-day semantics, event, SLA and expiry; no integration is currently evidenced.

Current state: blocked; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: 6 in Bonded Diamond Wheel, 220 grit; 6 in Bonded Diamond Wheel, 80 grit; 6 in Hard Buffing Wheel; 6 in Magnetic Felt Pad; 6 in Magnetic Hard Disc, 80 grit; 6 in Magnetic Resin Bond Disc, 220 grit; 6 in Magnetic Resin Bond Disc, 600 grit; 6 in Metal Screw-On Flat Lap; 6 in Resin Bond Diamond Wheel, 1200 grit; 6 in Resin Bond Diamond Wheel, 280 grit; 6 in Resin Bond Diamond Wheel, 3000 grit; 6 in Resin Bond Diamond Wheel, 600 grit; 6 in Soft Buffing Wheel; 6 in Trim Saw; Allen Wrench; Anchor Rod, x4; Arbor Adapter Washer, 1" to 1 & 1/4", x2; Arbor Nut, 1"; Arbor Size Conversion Bolt; Arbor Spoke Nut; Arbor Washer, 1", x2; Arbor Wrench; Automatic Feed Clamp; BeadMaster 6"; Belt Guard (JadeMaster); Brass Sprayer; Buffing Wheel Head; Conical Grinder; Cylindrical Grinder; Debris Guard; DIALUX Polishing Paste; DIALUX Superfinishing Paste; Drain Plug (JadeMaster); Drain Plug, 15/16"; EM-1 Machine; Feet, x4 (JadeMaster); Final Sanding Wheel Head; Flexible Shaft; Flexible Shaft Attachment; Flexible Shaft Bit Turntable; Flexible Shaft Pack; Flexible Water Spout; JadeMaster, 14"; KUM800 Sanding Wheel; Lap Fixture Bolt Pack; LapMaster 12"; LapMaster 18"; LapMaster Lap Bolt; Large Drill; Large Silversmithing Ball Head; Large Stonework Bullnose Head; Large Stonework Inverted 60° Cone Head; Left Arbor Nut; Left Arbor Set Screw & Spring; Left Arbor Shaft; Left Moss Pad; Lock Nut Fixture for Plexiglass Insert, x4; Magnifying Glass Arm; Medium Silversmithing Ball Head; Metal Spindle, Left; Metal Spindle, Pair; Metal Spindle, Right; Moss Pad, Pack of 2; MR16 LED Bulb; Nylon Bristle Brush Head; Plastic End Spacer; Plastic Trim Saw Spacer; Plastic Wheel Spacer; Plastic Wheel Spacer, 5 pack; Plexiglass Insert Spacers, x4; Power Feed Bearings Set, x2; Power Grip Belt, 26"; Pulleys, x2 (18" LapMaster); Pulleys, x2 (JadeMaster); Pulleys, x2 (TrimMaster); Purple Jade Bead Strand; Right Arbor Nut; Right Arbor Set Screw & Spring; Right Arbor Shaft; Right Moss Pad; Right Plexiglass Spray Guard; Rotation Table; Rotational Lock; Rotational Lock Handle; Rubber Feet for 18" LapMaster, x3; Saw Blade; Saw Table; Saw Vice Plate Set; SawMaster 18"; SawMaster 24"; SawMaster, 36"; ShapeMaster 6"; Sled Release Handle; Small Drill; Small Silversmithing Ball Head; Small Stonework Bullnose Head; Small Stonework Inverted 60° Cone Head; Spoke Wrench; Spotlight; Stonework Ball Head; Stonework Flame Head; Stonework Inverted 30° Cone Head; Stonework Taper Head; Thumb Spindle Knob; TOFF Brush Wheel; Triangle Latch Screws, x2; Trim Saw Accessories Knob; TrimMaster; TrimMaster Adjustable Feet, x4; TrimMaster Belt Guard; TrimMaster Plexiglass Insert; TrimMaster Splash Guard, Front; TrimMaster Splash Guard, Upper; TrimMaster Straight Edge Guide; TumbleMaster; Vice Clamp Riser; Vice Clamp Set; Water Guard; Water Pump; Wing Nut, x2; Wrist Rest; Wrist Rest Knob

Evidence: [data/epic-e-batch-3c-decision-packet.json](../../data/epic-e-batch-3c-decision-packet.json); source decision IDs: B3C-D04.

Unblocks: future owned contract/process; no current Shopify migration input. Consumers: F, J, K, O.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3B-D03 — Technical

Resolve current electrical/motor/tool-speed/mount/reservoir facts in the existing conflict register. Confirm horsepower and gallon conventions; do not invent machine configurations.

Current state: pending; review scheduling: temporarily_unavailable.

Affected source models: EM-1; BeadMaster 6; ShapeMaster 6; TrimMaster 8; LapMaster 12; LapMaster 18; SawMaster 18; SawMaster 24.

Affected Products: See the named source conflict/resource/attribute group; this decision governs semantics rather than a pre-approved Product set.

Evidence: [data/epic-e-batch-3b-decision-packet.json](../../data/epic-e-batch-3b-decision-packet.json); source decision IDs: B3B-D03.

Unblocks: E-MUT-026, E-MUT-027, E-MUT-028, E-MUT-029. Consumers: F, G, J, K, L.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3B-D02 — Technical

Approve or reject the exact legacy-identifier edges, then review the lower-authority explicit description edges by model; supply evidence only for the remaining unknowns.

Current state: pending; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: Automatic Feed Clamp; Pulleys, x2 (18" LapMaster); Pulleys, x2 (TrimMaster); Saw Vice Plate Set; TrimMaster Adjustable Feet, x4; TrimMaster Belt Guard; TrimMaster Plexiglass Insert; 6 in Trim Saw; Arbor Size Conversion Bolt; Arbor Spoke Nut; Belt Guard (JadeMaster); Debris Guard; Drain Plug (JadeMaster); Drain Plug, 15/16"; Feet, x4 (JadeMaster); Flexible Shaft Attachment; Flexible Water Spout; Left Arbor Shaft; Left Moss Pad; Magnifying Glass Arm; Moss Pad, Pack of 2; Plexiglass Insert Spacers, x4; Power Feed Bearings Set, x2; Power Grip Belt, 26"; Pulleys, x2 (JadeMaster); Purple Jade Bead Strand; Right Arbor Shaft; Right Moss Pad; Right Plexiglass Spray Guard; Rotation Table; Rotational Lock; Rotational Lock Handle; Rubber Feet for 18" LapMaster, x3; Sled Release Handle; Spotlight; Thumb Spindle Knob; Triangle Latch Screws, x2; TrimMaster Splash Guard, Upper; TrimMaster Straight Edge Guide; Vice Clamp Riser

Evidence: [data/epic-e-batch-3b-decision-packet.json](../../data/epic-e-batch-3b-decision-packet.json); source decision IDs: B3B-D02.

Unblocks: E-MUT-034. Consumers: F, G, L, O.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3B-D04 — Technical, Product Owner

Resolve C-040 EM-1 current BOM, exact catalog component identities and quantities against manual, sales list and description. Confirm optional commercial contents separately.

Current state: pending; review scheduling: temporarily_unavailable.

Affected source models: EM-1.

Affected Products: See the named source conflict/resource/attribute group; this decision governs semantics rather than a pre-approved Product set.

Evidence: [data/epic-e-batch-3b-decision-packet.json](../../data/epic-e-batch-3b-decision-packet.json); source decision IDs: B3B-D04.

Unblocks: E-MUT-035, E-MUT-036, E-MUT-037. Consumers: F, G, L, O.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### FAMILY-MAPPINGS — Product Owner, Technical

Approve exact Product-to-family membership where useful. Compound family evidence is not a single metaobject target; preserve TumbleMaster visibility limits and do not use family as fit proof.

Current state: observed_or_proposed; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: Automatic Feed Clamp; BeadMaster 6"; Belt Guard (JadeMaster); Drain Plug (JadeMaster); Drain Plug, 15/16"; EM-1 Machine; Feet, x4 (JadeMaster); Flexible Shaft; Flexible Shaft Attachment; Flexible Shaft Pack; JadeMaster, 14"; LapMaster 12"; LapMaster 18"; LapMaster Lap Bolt; Power Feed Bearings Set, x2; Pulleys, x2 (18" LapMaster); Pulleys, x2 (JadeMaster); Pulleys, x2 (TrimMaster); Rubber Feet for 18" LapMaster, x3; Saw Blade; Saw Table; Saw Vice Plate Set; SawMaster 18"; SawMaster 24"; SawMaster, 36"; ShapeMaster 6"; TrimMaster; TrimMaster Adjustable Feet, x4; TrimMaster Belt Guard; TrimMaster Plexiglass Insert; TumbleMaster

Evidence: [data/epic-e-product-identity.json](../../data/epic-e-product-identity.json); source decision IDs: FAMILY-MAPPINGS.

Unblocks: E-MUT-025. Consumers: F, G, J, L, O.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### CATEGORY-CANDIDATES — Product Owner

Review the 119 remaining proposed official-taxonomy assignments as one bounded candidate set; retain the three explicit Product approvals already recorded.

Current state: proposed; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: 6 in Bonded Diamond Wheel, 220 grit; 6 in Bonded Diamond Wheel, 80 grit; 6 in Hard Buffing Wheel; 6 in Magnetic Felt Pad; 6 in Magnetic Hard Disc, 80 grit; 6 in Magnetic Resin Bond Disc, 220 grit; 6 in Magnetic Resin Bond Disc, 600 grit; 6 in Metal Screw-On Flat Lap; 6 in Resin Bond Diamond Wheel, 1200 grit; 6 in Resin Bond Diamond Wheel, 280 grit; 6 in Resin Bond Diamond Wheel, 3000 grit; 6 in Resin Bond Diamond Wheel, 600 grit; 6 in Soft Buffing Wheel; 6 in Trim Saw; Allen Wrench; Anchor Rod, x4; Arbor Adapter Washer, 1" to 1 & 1/4", x2; Arbor Nut, 1"; Arbor Size Conversion Bolt; Arbor Spoke Nut; Arbor Washer, 1", x2; Arbor Wrench; Automatic Feed Clamp; BeadMaster 6"; Belt Guard (JadeMaster); Brass Sprayer; Buffing Wheel Head; Conical Grinder; Cylindrical Grinder; Debris Guard; DIALUX Polishing Paste; DIALUX Superfinishing Paste; Drain Plug (JadeMaster); Drain Plug, 15/16"; Feet, x4 (JadeMaster); Final Sanding Wheel Head; Flexible Shaft; Flexible Shaft Attachment; Flexible Shaft Bit Turntable; Flexible Shaft Pack; Flexible Water Spout; KUM800 Sanding Wheel; Lap Fixture Bolt Pack; LapMaster 12"; LapMaster 18"; LapMaster Lap Bolt; Large Drill; Large Silversmithing Ball Head; Large Stonework Bullnose Head; Large Stonework Inverted 60° Cone Head; Left Arbor Nut; Left Arbor Set Screw & Spring; Left Arbor Shaft; Left Moss Pad; Lock Nut Fixture for Plexiglass Insert, x4; Magnifying Glass Arm; Medium Silversmithing Ball Head; Metal Spindle, Left; Metal Spindle, Pair; Metal Spindle, Right; Moss Pad, Pack of 2; MR16 LED Bulb; Nylon Bristle Brush Head; Plastic End Spacer; Plastic Trim Saw Spacer; Plastic Wheel Spacer; Plastic Wheel Spacer, 5 pack; Plexiglass Insert Spacers, x4; Power Feed Bearings Set, x2; Power Grip Belt, 26"; Pulleys, x2 (18" LapMaster); Pulleys, x2 (JadeMaster); Pulleys, x2 (TrimMaster); Purple Jade Bead Strand; Right Arbor Nut; Right Arbor Set Screw & Spring; Right Arbor Shaft; Right Moss Pad; Right Plexiglass Spray Guard; Rotation Table; Rotational Lock; Rotational Lock Handle; Rubber Feet for 18" LapMaster, x3; Saw Blade; Saw Table; Saw Vice Plate Set; SawMaster 18"; SawMaster 24"; SawMaster, 36"; ShapeMaster 6"; Sled Release Handle; Small Drill; Small Silversmithing Ball Head; Small Stonework Bullnose Head; Small Stonework Inverted 60° Cone Head; Spoke Wrench; Spotlight; Stonework Ball Head; Stonework Flame Head; Stonework Inverted 30° Cone Head; Stonework Taper Head; Thumb Spindle Knob; TOFF Brush Wheel; Triangle Latch Screws, x2; Trim Saw Accessories Knob; TrimMaster; TrimMaster Adjustable Feet, x4; TrimMaster Belt Guard; TrimMaster Plexiglass Insert; TrimMaster Splash Guard, Front; TrimMaster Splash Guard, Upper; TrimMaster Straight Edge Guide; Vice Clamp Riser; Vice Clamp Set; Water Guard; Water Pump; Wing Nut, x2; Wrist Rest; Wrist Rest Knob

Evidence: [data/epic-e-product-classification.json](../../data/epic-e-product-classification.json); source decision IDs: PO-E-005.

Unblocks: E-MUT-022. Consumers: F, G, J, L, O.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

### B3B-D07 — Product Owner, Technical

For the future abrasive attribute contract, approve grading standard and mixed-grit/pack semantics for the existing G filter consumer.

Current state: pending; review scheduling: temporarily_unavailable.

Affected source models: Product/resource scope below.

Affected Products: 6 in Bonded Diamond Wheel, 220 grit; 6 in Bonded Diamond Wheel, 80 grit; 6 in Magnetic Hard Disc, 80 grit; 6 in Magnetic Resin Bond Disc, 220 grit; 6 in Magnetic Resin Bond Disc, 600 grit; 6 in Resin Bond Diamond Wheel, 1200 grit; 6 in Resin Bond Diamond Wheel, 280 grit; 6 in Resin Bond Diamond Wheel, 3000 grit; 6 in Resin Bond Diamond Wheel, 600 grit; EM-1 Machine

Evidence: [data/epic-e-batch-3b-decision-packet.json](../../data/epic-e-batch-3b-decision-packet.json); source decision IDs: B3B-D07.

Unblocks: future owned contract/process; no current Shopify migration input. Consumers: G.

Approval: An explicit dated decision by the named owner, identifying exact Product/Variant/resource IDs, accepted values/revisions and supporting evidence in the owning governed decision input. Execution GO remains separate.

Interim: Use architecture and shell placeholders; omit unapproved facts and preserve each source observation/state. No population or customer promise.

## Downstream readiness

| Consumer | Architecture / planning | Interim safe use | Trusted fact rendering |
|---|---|---|---|
| Epic F | 22 domain rows, assessed independently | Product-page discovery, shell and design | Blocked until each domain is approved and reconciled/migrated |
| Epic G | 10 domain rows, assessed independently | Filter/search shell and data contracts | Blocked until each domain is approved and reconciled/migrated |
| Epic J | 14 domain rows, assessed independently | Contract integration and shell planning | Blocked until each domain is approved and reconciled/migrated |
| Epic K | 10 domain rows, assessed independently | Contract integration and shell planning | Blocked until each domain is approved and reconciled/migrated |
| Epic L | 16 domain rows, assessed independently | Contract integration and shell planning | Blocked until each domain is approved and reconciled/migrated |
| Epic O | 16 domain rows, assessed independently | Contract integration and shell planning | Blocked until each domain is approved and reconciled/migrated |
| Epic P | 4 domain rows, assessed independently | Contract integration and shell planning | Blocked until each domain is approved and reconciled/migrated |

Epic F discovery/planning can start now. Unresolved technical/BOM/warranty/freight claims must remain absent or visibly internal placeholders; a design fixture cannot become a customer fact. No theme work was performed.

## Owner counts

- Admin/Engineering: 2 decision groups (shared-owner groups overlap).
- Legal/Business: 2 decision groups (shared-owner groups overlap).
- Media: 1 decision groups (shared-owner groups overlap).
- Operations: 4 decision groups (shared-owner groups overlap).
- Product Owner: 11 decision groups (shared-owner groups overlap).
- Support: 2 decision groups (shared-owner groups overlap).
- Technical: 9 decision groups (shared-owner groups overlap).

## Next step

When reviewers return, resolve the narrowed decisions above and collect domain-specific Product Owner/Admin GO after a fresh complete read audit. E-PBI-020/021/022/023 execution remains deferred. E-PBI-025 is not complete.
