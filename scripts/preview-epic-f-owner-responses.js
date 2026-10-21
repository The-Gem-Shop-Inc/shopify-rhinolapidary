'use strict';
// CLI emits a preview to stdout only. Never writes authoritative E migration inputs.
const R=require('./lib/epic-f-owner-review'),{validate}=require('./validate-epic-f-owner-review');
try {
  const file=process.argv[2]||'data/epic-f-006b-owner-value-review.json',review=R.read(file);
  validate(review);
  console.log(JSON.stringify({mode:'NON_EXECUTABLE_OWNER_RESPONSE_PREVIEW',mutationAuthorized:false,plans:R.migrationProjection(review.rows),rendering:R.renderProjection(review.rows,review.machines.filter(m=>m.assigned))},null,2));
} catch(e){console.error(e.message);process.exitCode=1;}
