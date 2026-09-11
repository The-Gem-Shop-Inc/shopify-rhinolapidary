// Independent review/GO boundaries. These describe intent; there is no executor.
const mf=key=>`PRODUCT.metafields.rhino.${key}`;
const domain=(code,pbi,key,fields,consumers,decisions=[])=>({code,targetPbi:`E-PBI-${pbi}`,key,fieldAllowlist:fields,consumers,decisionIds:decisions});
const domains=[
 domain(20,'020','definitions',['metafieldDefinition','metaobjectDefinition'],['F','G','J','K','L','O','P']),
 domain(21,'021A','product_class',[mf('product_class')],['F','G','J','K','L','O']),
 domain(22,'021B','category',['Product.category'],['F','G','J','L','O'],['CATEGORY-CANDIDATES']),
 domain(23,'021C','vendor',['Product.vendor'],['F','G','L','O']),
 domain(24,'021D','commerce_sku',['ProductVariant.sku'],['F','J','K','L','O'],['SKU-ALLOCATIONS','PO-E-012','PO-E-013']),
 domain(25,'021E','machine_family',[mf('machine_family')],['F','G','J','L','O'],['FAMILY-MAPPINGS']),
 domain(26,'022A','electrical',['input_voltage','input_frequencies'].map(mf),['F','J','K','L'],['B3B-D03']),
 domain(27,'022B','motor_speed',['motor_power','motor_speed','wheel_speed_min','wheel_speed_max','flex_shaft_speed_min','flex_shaft_speed_max'].map(mf),['F','J','L'],['B3B-D03']),
 domain(28,'022C','tool_mount',['blade_diameter_min','blade_diameter_max','wheel_diameter','blade_arbor_diameter','wheel_arbor_diameter'].map(mf),['F','G','L'],['B3B-D03']),
 domain(29,'022D','water_fluid',['water_reservoir_capacity','cutting_oil_fill_min','cutting_oil_fill_max','water_system_type'].map(mf),['F','J','L'],['B3B-D03']),
 domain(30,'022E','durable_measurements',['net_weight','assembled_length','assembled_width','assembled_height'].map(mf),['F','J','K'],['B3B-D05']),
 domain(31,'022F','crate_measurements',['crate_length','crate_width','crate_height'].map(mf),['F','J','K'],['B3B-D05']),
 domain(32,'022G','shipping_weight',['ProductVariant.inventoryItem.measurement.weight'],['J','K','O'],['B3B-D05']),
 domain(33,'022H','fulfillment_class',[mf('fulfillment_class')],['F','J','K','O','P'],['B3C-D01']),
 domain(34,'023A','compatibility',[mf('compatible_machines')],['F','G','L','O'],['PO-E-012','PO-E-013','B3B-D02']),
 domain(35,'023B','included_components',['included_products','included_quantities','noncatalog_components'].map(mf),['F','L','O'],['B3B-D04']),
 domain(36,'023C','optional_components',[mf('optional_products')],['F','G','L'],['B3B-D04']),
 domain(37,'023D','recommendations',[mf('recommended_products')],['F','G','O'],['B3B-D04']),
 domain(38,'023E','customer_manuals',[mf('manual_files')],['F','L','O'],['B3B-D06']),
 domain(39,'023F','diagrams_instructions_videos',['diagram_files','instruction_files','video_files'].map(mf),['F','L','O'],['B3B-D06']),
 domain(40,'023G','warranty_support',[mf('support_files')],['F','L','O','P'],['B3C-D03','B3B-D06']),
 domain(41,'023H','pickup_region',['NO_APPROVED_SHOPIFY_FIELD'],['F','J','K','O','P'],['B3C-D02'])
];
module.exports={domains,mf};
