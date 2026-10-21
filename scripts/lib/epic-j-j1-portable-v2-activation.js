'use strict';
const V=require('./epic-j-j1-portability-v2');
if(process.env.RHINO_J_PORTABILITY_SUCCESSOR!==V.ID)throw new Error('Explicit V2 successor selector required');
V.verify({mode:process.env.RHINO_J_PORTABILITY_MODE||'portable'});
require('./epic-j-j1-protection').nativeSurfaceMatches=V.nativeSurfaceMatches;
process.env.RHINO_J_SOURCE_SUCCESSOR='J1-2026-10-20-NATIVE-CART';
