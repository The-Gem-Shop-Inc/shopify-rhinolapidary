'use strict';
// Explicit process-only native guard selection. Historical file bytes and verify() stay intact.
const P = require('./epic-j-j1-portability-v1');
if (process.env.RHINO_J_PORTABILITY_SUCCESSOR !== P.ID) throw new Error('Explicit portability successor selector required');
P.verify({ mode: process.env.RHINO_J_PORTABILITY_MODE || 'portable' });
require('./epic-j-j1-protection').nativeSurfaceMatches = P.nativeSurfaceMatches;
process.env.RHINO_J_SOURCE_SUCCESSOR = 'J1-2026-10-20-NATIVE-CART';
