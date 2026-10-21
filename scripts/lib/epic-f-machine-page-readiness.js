'use strict';

// Pure repository aggregation: no Shopify client, network adapter or event emitter.
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { read, fileHash, canonical, schemaErrors } = require('./epic-f-governance');
const { historicalHashMatches, approvedNewSnippet } = require('./epic-f-release-cleanup-binding');
const contractPath = 'data/epic-f-machine-page-readiness-contract.json';
const packetPath = 'data/epic-f-machine-page-readiness.json';
const inventoryPath = 'docs/project/epic-f-machine-inventory.json';
const planPath = 'data/epic-f-machine-template-rollout-plan.json';
const policyPath = 'data/epic-f-machine-template-rollout-policy.json';
const consumerPath = 'data/epic-f-consumer-release.json';
const mediaPath = 'data/epic-f-media-release.json';
const evidencePath = n => `docs/qa/evidence/epic-f/batch-f${n}-validation.json`;
const performancePath = n => `docs/qa/evidence/epic-f/batch-f${n}-performance-runtime.json`;
const unique = values => [...new Set(values)];
const machineGids = ['8905779937477', '8905780756677', '8905781248197', '8905781412037', '8905781477573', '8905784131781', '8905784197317', '8905784262853', '8905784328389', '8905785344197', '8905785868485'].map(id => `gid://shopify/Product/${id}`);

function sources() {
    const c = read(contractPath);
    const paths = unique([contractPath, ...Object.keys(c.sourcePins),
        ...read(consumerPath).provenance.map(p => p.path),
        'docs/project/implementation-records/f-pbi-001-005-batch-f1.md',
        'docs/project/implementation-records/f-pbi-016-017a-batch-f7.md',
        ...Array.from({ length: 7 }, (_, i) => `docs/project/epic-f-batch-f${i + 1}-file-manifest.json`),
        'tests/fixtures/epic-f-f8-file-baseline.json']);
    return paths.sort().map(path => {
        let d = {};
        if (path.endsWith('.json')) d = read(path);
        return { path, sha256: fileHash(path), sourceObservedAt: d.capturedAt || d.observedAt || d.assessedAt || d.asOf || d.preparedAt || null,
            observationKind: path.includes('admin-snapshot') || path.includes('machine-admin-read') ? 'historical_admin' : 'repository_artifact' };
    });
}

function grantCounts() {
    const consumer = read(consumerPath), media = read(mediaPath);
    const ownerBinding=require('./epic-f-owner-activation-binding');
    const ownerGrants=ownerBinding.active()?(ownerBinding.verify(),require('./epic-f-customer-release').verifyRelease().release.grants):[];
    // No live grant shape is supported by the F1-F7 release schema. Report any
    // unexpected row exactly and fail, even if its domain is unrecognizable.
    const groups = {
        specifications: ['electrical', 'motor_speed', 'tool_mount', 'water_fluid', 'durable_measurements', 'crate_measurements'],
        contents: ['included_components', 'optional_components'],
        contextual: ['compatibility', 'recommendations'],
        delivery: ['fulfillment_class', 'pickup_region', 'availability_authority'],
        warranty: ['warranty_support'], manuals: ['customer_manuals'],
        diagrams_instructions: ['diagrams_instructions_videos'], videos: ['diagrams_instructions_videos'],
        support_files: ['support_files']
    };
    const rows = [{ domain: 'media', before: read('tests/fixtures/epic-f-f8-governance-baseline.json').mediaGrantsBefore,
        current: media.grants.length, source: mediaPath }];
    for (const [domain, domains] of Object.entries(groups)) rows.push({ domain, before: 0,
        current: [...consumer.grants,...ownerGrants].filter(g => domains.includes(g.domain)).length, source: consumerPath });
    const approvedMedia = require('./epic-f-live-media-activation').authorizedCount();
    return { counts: rows, consumerTotalBefore: read('tests/fixtures/epic-f-f8-governance-baseline.json').consumerGrantsBefore,
        consumerTotalCurrent: consumer.grants.length+ownerGrants.length,
        unexpectedGrants: [...consumer.grants.map(grant => ({ source: consumerPath, domain: grant.domain || 'unknown', grant })),
            ...(approvedMedia===media.grants.length?[]:media.grants.map(grant => ({ source: mediaPath, domain: 'media', grant })))],
        scope: 'Actual routing and separately reconciled owner customer release artifacts; exact bound grants only; fixtures excluded; broader unresolved domains, final launch rights and certification remain unapproved' };
}

function build(assessedAt) {
    if (!Number.isFinite(Date.parse(assessedAt))) throw new Error('Valid assessment timestamp required');
    const c = read(contractPath), inventory = read(inventoryPath), plan = read(planPath), policy = read(policyPath);
    const downstream = read('data/epic-e-downstream-readiness.json').rows.filter(r => r.consumer === 'F');
    const batches = Array.from({ length: 7 }, (_, i) => ({ batch: `F${i + 1}`, path: evidencePath(i + 1), ...read(evidencePath(i + 1)) }));
    const before = read('tests/fixtures/epic-f-machine-template-before.json');
    const handoff = read('data/epic-e-deferred-decision-handoff.json');
    const domainMatrix = c.domains.map(domain => {
        const upstream = downstream.filter(r => domain.epicEDomains.includes(r.domain));
        const blocked = domain.governedFact || ['payment_decision', 'measurement_instrumentation', 'rollout_execution'].includes(domain.id);
        return { id: domain.id, owningPbis: domain.owningPbis, governedFact: domain.governedFact,
            implementation: domain.implementation, valueState: blocked ? 'blocked' : 'not_applicable',
            adminEvidence: ['measurement_contract', 'measurement_instrumentation', 'rollout_plan'].includes(domain.id) ? 'not_applicable' : 'stale',
            migrationReconciliation: domain.governedFact || domain.id === 'rollout_execution' ? 'blocked' : 'not_applicable',
            activationAuthorization: blocked ? 'not_granted' : 'not_applicable',
            customerPresentation: domain.governedFact ? 'suppressed' : 'not_applicable',
            shopifyParity: ['measurement_contract', 'rollout_plan'].includes(domain.id) ? 'not_applicable' : 'unverified',
            releaseCertification: domain.id === 'performance' ? 'deferred' : 'blocked',
            decisionIds: unique([...domain.decisionIds, ...upstream.flatMap(r => r.blockedDecisionIds)]),
            upstreamDomains: domain.epicEDomains, upstreamPlans: upstream.map(r => r.planId),
            evidenceReferences: [contractPath, ...batches.map(b => b.path), ...(upstream.length ? ['data/epic-e-downstream-readiness.json'] : [])],
            presentationScope: c.presentationScope,
            note: domain.governedFact ? 'Renderer complete; no eligible activated customer facts; safe suppression is not fact readiness' :
                domain.id === 'native_purchase' ? 'Native Product/Variant purchase, payment terms and pickup retained; no F factual grant; local fixtures only' :
                domain.id === 'contact' ? 'Neutral route/context adapter implemented; actual Shopify integration and inquiry submission unverified' : 'Repository evidence only; live release remains gated' };
    });
    const factual = domainMatrix.filter(d => d.governedFact);
    const machines = machineGids.map(productGid => {
        const product = inventory.products.find(p => p.productGid === productGid);
        const assessment = plan.assessments.find(p => p.productGid === productGid);
        if (!product || !assessment) throw new Error(`Missing governed machine ${productGid}`);
        return { productGid, displayLabel: product.title, governedClass: product.classification.value,
            classification: { sourceValueState: product.classification.state, decisionId: product.classification.decisionId,
                source: product.classification.source, liveValue: null, migrationReconciliation: 'blocked' },
            evidence: { historicalObservedAt: product.currentObservationAt, currentAdminEvidence: 'stale', currentLiveState: null },
            rolloutAssessment: { historicalEligibility: assessment.eligibility, conditionalFutureCandidate: assessment.futureCandidate,
                currentEligible: false, executable: false, source: planPath },
            template: { historicalSuffix: assessment.observedTemplateSuffix, historicalObservedAt: before.observedAt,
                evidenceState: 'stale', currentSuffix: null, intendedSuffix: policy.intendedSuffix, assignmentPerformed: false },
            historicalProductState: { status: assessment.status, publication: assessment.publication },
            modules: factual.map(d => ({ domain: d.id, implementation: d.implementation, valueState: d.valueState,
                eligibleFactValue: null, adminEvidence: d.adminEvidence, migrationReconciliation: d.migrationReconciliation,
                activationAuthorization: d.activationAuthorization, customerPresentation: d.customerPresentation,
                shopifyParity: d.shopifyParity, releaseCertification: d.releaseCertification, decisionIds: d.decisionIds })),
            customerPresentation: { repositoryGovernedModules: 'suppressed', actualShopifyPresentation: 'unverified' },
            blockers: unique([...product.blockers, ...assessment.reasons, ...factual.flatMap(d => d.decisionIds)]) };
    });
    const snapshots = [
        { path: 'docs/qa/evidence/epic-e/2026-09-03-epic-e-admin-snapshot.json', observedAt: read('data/epic-e-admin-readiness.json').snapshotCapturedAt,
            expiresAt: read(consumerPath).factEligibilityExpiresAt, freshnessRule: 'Epic E maximumAgeDaysForMutationPlanning=7', coverage: 'Historical Epic E dataset snapshot' },
        { path: before.sourcePath, observedAt: before.observedAt,
            expiresAt: new Date(Date.parse(before.observedAt) + policy.beforeRead.maxAgeSeconds * 1000).toISOString(),
            freshnessRule: `F7 before-read maximum age ${policy.beforeRead.maxAgeSeconds} seconds; historical incomplete read never authorizes execution`,
            coverage: '11 exact machines; incomplete protected-field/theme/publication execution coverage' }
    ].map(s => ({ ...s, state: 'stale' }));
    const performance = Array.from({ length: 4 }, (_, i) => {
        const path = performancePath(i + 3), d = read(path);
        return { batch: `F${i + 3}`, path, observedAt: d.assessedAt, exitCode: d.exitCode, scope: d.scope,
            thresholdChanges: d.thresholdChanges ?? null, budgets: d.budgets,
            observations: d.results.map(r => ({ state: r.state, profile: r.profile, violations: r.violations,
                expected: r.expected || 'pass', expectedResult: r.expectedResult ?? (r.violations.length === 0),
                requestedRuns: r.record.requestedRuns, timestamps: r.record.samples.map(s => s.timestamp),
                fixtureOnly: r.record.samples.every(s => s.fixtureOnly), stage: r.record.stage })) };
    });
    const coverage = [
        ['shell', 2, [320, 360, 390, 768, 1024, 1440, 1920], true],
        ['gallery', 3, [320, 390, 768, 1440], false],
        ['specifications_contents', 4, [320, 390, 768, 1440], true],
        ['contextual_delivery', 5, [320, 390, 768, 1440], true],
        ['support_resources', 6, [320, 390, 768, 1440], true]
    ].map(([domain, batch, widths, enlarged]) => ({ domain, widths, source: evidencePath(batch),
        textEnlargement: enlarged ? '200% root-font simulation' : 'Inherited F2 shell; gallery viewport/modal coverage',
        actualChromiumZoom: enlarged ? '200%; chrome.tabs.setZoom(2), layout viewport and DPR verified' : 'Inherited F2 shell zoom; separate gallery zoom inspection',
        keyboardFocus: 'passed in local tested states', axeSeriousCriticalFindings: 0, scope: 'local fixtures; global chrome/provider/live parity outside certification' }));
    const diagnostics = read('docs/qa/evidence/epic-f/batch-f8-historical-diagnostics.json');
    const f7 = read(evidencePath(7));
    const status = { 'F-PBI-018': 'partial', 'F-PBI-018A': 'complete_repository_scope', 'F-PBI-018B': 'open_not_ready',
        'F-PBI-013': 'open', 'F-DEC-001': 'open', 'F-PBI-014B': 'open_partial', 'F-PBI-015B': 'deferred',
        'F-PBI-016': 'contract_complete_instrumentation_blocked', 'F-PBI-017A': 'complete_repository_scope', 'F-PBI-017B': 'open_blocked_not_authorized' };
    for (const n of ['004', '006', '007', '008', '009', '010', '011']) status[`F-PBI-${n}B`] = 'open_not_ready';
    const packet = { $schema: '../schemas/epic-f-machine-page-readiness.schema.json', schemaVersion: 1,
        assessedAt, scope: c.scope, repositoryRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
        repositoryRevisionScope: 'HEAD plus source-bound uncommitted F1-F8 working tree; hashes are authority',
        evidenceProvenance: sources(), repositoryAggregatePassed: false, liveReleaseState: 'not_ready_not_authorized',
        machines, domainMatrix, realGrants: grantCounts(),
        adminEvidence: { state: 'stale', assessedAt, snapshots, currentAudit: null,
            dependentDomains: domainMatrix.filter(d => d.adminEvidence === 'stale').map(d => d.id),
            note: 'Generation time does not refresh source observation time; no current audit run' },
        epicE: { migrationReconciliation: 'blocked', currentReconciliation: 'unverified',
            downstreamAsOf: read('data/epic-e-downstream-readiness.json').asOf, downstreamRows: downstream,
            deferredDecisions: handoff.decisions.map(d => ({ decisionId: d.decisionId, sourceDecisionIds: d.sourceDecisionIds,
                currentState: d.currentState, sourceState: d.sourceState, domains: d.domains })),
            inheritedDecisions: [{ decisionId: 'B3C-D03', state: 'blocked' }, { decisionId: 'B3B-D06', state: 'pending' }],
            prerequisites: policy.prerequisites },
        regression: batches.map(b => ({ batch: b.batch, path: b.path, sourceObservedAt: b.assessedAt,
            exitCode: b.exitCode, results: b.results })),
        claims: { repositoryContainment: 'passed', liveContainment: 'unverified', source: evidencePath(1),
            surfaces: ['Product description', 'title', 'tags', 'collections', 'Vendor', 'Product Type', 'media captions', 'filenames', 'manuals/resources', 'Custom Liquid', 'recommendations', 'shipping profile/rate names', 'legal policy prose'],
            blockedDomains: ['specs', 'compatibility', 'BOM', 'warranty', 'freight', 'region', 'timing', 'resource-derived facts'],
            renderedCoverage: 'F1 all 11 saved identities; adversarial hidden/encoded output; F3-F6 typed module suppression fixtures',
            limitation: 'Repository scans and saved/local rendered outputs only; fresh Admin surfaces and legal/shipping source changes need 018B' },
        jsonLd: { repositoryContainment: 'passed', baseNativeProductIdentityAndOffers: 'retained',
            governedTechnicalRelationshipSupportFacts: 'absent', governedDescriptionAndMediaFallback: 'absent',
            source: 'scripts/test-epic-f-claims.js', liveParity: 'unverified' },
        accessibility: { implementation: 'partial', localRegression: 'passed', shopifyParity: 'unverified',
            releaseCertification: 'blocked', coverage, remaining014B: ['approved live media parity', 'actual Shopify-rendered integration/release parity', 'release-only journeys not proven locally'] },
        performance: { harness: 'complete', localRegression: 'passed', releaseCertification: 'deferred',
            thresholdChanges: false, observations: performance, releaseMedian: null,
            note: 'Cold/no-store unthrottled local single observations with 1500ms settle; no production result or release median' },
        measurement: { contractImplementation: 'complete', instrumentation: 'blocked', active: false, emittedEvents: 0,
            nativeOwnerSlots: f7.measurement.nativeOwnerSlots, assignedNativeOwners: f7.measurement.assignedNativeOwners,
            ownerConsentTooling: 'unresolved', source: 'data/epic-f-machine-measurement-contract.json' },
        rollout: { planImplementation: 'complete', execution: 'blocked_not_authorized', planHash: plan.planHash,
            planFileSha256: fileHash(planPath), intendedSuffix: policy.intendedSuffix, assessedCount: plan.assessments.length,
            conditionalFutureCandidateGids: plan.futureCandidateGids, exclusions: policy.exclusions,
            eligibleCurrentTargetGids: plan.eligibleTargetGids, executableTargetGids: [],
            GO: policy.approvals.map(a => ({ role: a.role, granted: a.granted })), beforeRead: policy.beforeRead,
            writeAllowlist: policy.fieldAllowlist, rollback: { planning: 'complete_exact_historical_values', values: plan.rollback,
                executionReadiness: 'blocked_pending_fresh_complete_before_read_and_GO' },
            productionThemePublicationAuthorized: plan.productionThemePublicationAuthorized, mutations: plan.mutationsProduced },
        historicalDiagnostics: { ownership: diagnostics['validate-launch-fixtures'], productCsv: diagnostics['validate-product-data'],
            descriptionClaims: f7.historicalDescriptionClaimMatches, manuals: f7.brokenManualRoutes,
            scope: 'Historical diagnostics; separately owned; unchanged signatures required, resolution not required for repository aggregate' },
        pbiStates: status, activationBlockers: factual.map(d => ({ domain: d.id, decisionIds: d.decisionIds, upstreamPlans: d.upstreamPlans,
            requirements: ['approved exact values/assets', 'current complete Admin evidence', 'applicable migration/reconciliation', 'separate activation authorization'] })),
        releaseBlockers: c.releaseBlockers, authorizations: c.authorizations,
        actionsPerformed: Object.fromEntries(Object.keys(c.authorizations).map(k => [k, false])),
        delta: { storefrontRuntime: 'none', newStorefrontRequests: 0, newRuntimeJavaScript: 0, newCss: 0, performanceThresholdChange: false }
    };
    packet.repositoryAggregatePassed = sourceErrors(packet).length === 0;
    return packet;
}

function sourceErrors(packet) {
    const errors = [], c = read(contractPath);
    for (const [path, hash] of Object.entries(c.sourcePins)) {
        if (!fs.existsSync(path) || (fileHash(path) !== hash && !require('./epic-f-live-media-activation').historicalSourceMatches(path,hash) && !require('./epic-f-owner-activation-binding').historicalSourceMatches(path,hash))) errors.push(`Upstream source drift: ${path}`);
    }
    for (const p of packet.evidenceProvenance) if (!fs.existsSync(p.path) || fileHash(p.path) !== p.sha256) errors.push(`Missing/stale provenance: ${p.path}`);
    for (const row of packet.realGrants.unexpectedGrants) errors.push(`Unauthorized real grant: ${row.domain} in ${row.source}: ${canonical(row.grant)}`);
    for (const r of packet.regression) if (r.exitCode !== 0) errors.push(`Inherited ${r.batch} evidence failed`);
    for (const observation of packet.performance.observations) {
        if (observation.exitCode !== 0 || observation.thresholdChanges === true || observation.observations.some(r => !r.expectedResult || !r.fixtureOnly || r.requestedRuns !== 1)) errors.push(`Invalid local performance evidence: ${observation.path}`);
    }
    const diagnosticBaseline = read('tests/fixtures/epic-f-historical-diagnostics.json');
    for (const [id, row] of [['validate-launch-fixtures', packet.historicalDiagnostics.ownership], ['validate-product-data', packet.historicalDiagnostics.productCsv]]) {
        if (row.findingCount !== diagnosticBaseline[id].findingCount || row.sha256 !== diagnosticBaseline[id].sha256) errors.push(`Historical signature drift: ${id}`);
    }
    const csv = packet.historicalDiagnostics.productCsv.findings;
    if (csv.filter(s => s.includes('Image Alt Text is missing')).length !== 95 || csv.filter(s => s.includes('Variant Price must be greater than 0')).length !== 8) errors.push('CSV 95/8 signature drift');
    if (packet.historicalDiagnostics.descriptionClaims.count !== 37 || packet.historicalDiagnostics.manuals.routes.length !== 7) errors.push('Claim/manual diagnostic drift');
    const baseline = read('tests/fixtures/epic-f-f8-file-baseline.json').files;
    const runtime = path => /^(assets|layout|locales|sections|snippets|templates|config)\//.test(path);
    for (const [path, hash] of Object.entries(baseline).filter(([p]) => runtime(p))) if (!fs.existsSync(path) || !historicalHashMatches(path, hash)) errors.push(`F8 runtime delta forbidden: ${path}`);
    for (const folder of ['assets', 'layout', 'locales', 'sections', 'snippets', 'templates', 'config']) {
        function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const path = `${dir}/${entry.name}`;
            if (entry.isDirectory()) walk(path); else if (!(path in baseline) && !approvedNewSnippet(path)) errors.push(`F8 new runtime file forbidden: ${path}`);
        } }
        walk(folder);
    }
    return errors;
}

function validate(packet) {
    const errors = schemaErrors('epic-f-machine-page-readiness', packet);
    if (errors.length) return errors;
    errors.push(...sourceErrors(packet));
    const gids = packet.machines.map(m => m.productGid);
    if (gids.length !== 11 || unique(gids).length !== 11 || canonical([...gids].sort()) !== canonical([...machineGids].sort())) errors.push('Exactly all 11 governed GIDs required, including excluded/draft/unpublished machines');
    for (const d of packet.domainMatrix) if (d.governedFact && (d.valueState !== 'blocked' || d.customerPresentation !== 'suppressed' || d.activationAuthorization !== 'not_granted')) errors.push(`Readiness conflation: ${d.id}`);
    const actualGrantCounts=grantCounts();
    for (const count of packet.realGrants.counts) if (count.current !== actualGrantCounts.counts.find(r=>r.domain===count.domain)?.current || count.before !== 0) errors.push(`Unauthorized ${count.domain} grant count from ${count.source}`);
    for (const s of packet.adminEvidence.snapshots) if (s.state === 'current' && Date.parse(packet.assessedAt) >= Date.parse(s.expiresAt)) errors.push(`Stale Admin labeled current: ${s.path}`);
    if (packet.rollout.GO.some(a => a.granted) || packet.rollout.executableTargetGids.length || packet.rollout.eligibleCurrentTargetGids.length) errors.push('F8 rollout GO/execution forbidden');
    // Reconstruct every status/evidence value from owning sources. Neither a
    // renderer, fixture, route, local test nor native widget can grant readiness.
    try {
        const expected = build(packet.assessedAt);
        for (const key of Object.keys(expected)) if (canonical(expected[key]) !== canonical(packet[key])) errors.push(`Source-bound readiness mismatch: ${key}`);
    } catch (error) { errors.push(`Source aggregation failed: ${error.message}`); }
    return unique(errors);
}

module.exports = { build, validate, sourceErrors, contractPath, packetPath, machineGids };
