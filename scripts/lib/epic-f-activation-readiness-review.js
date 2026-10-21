'use strict';

// Read-only review projection. No Shopify adapter, event emitter or mutation code.
const { read, fileHash, canonical, schemaErrors } = require('./epic-f-governance');
const f8 = require('./epic-f-machine-page-readiness');
const packetPath = 'data/epic-f-activation-readiness-review.json';
const auditPath = 'docs/qa/evidence/epic-f/activation-review-admin-audit.json';
const sourcePaths = [f8.packetPath, f8.contractPath, auditPath,
    'docs/qa/evidence/epic-f/batch-f8-validation.json',
    'docs/project/epic-f-machine-inventory.json', 'docs/project/epic-f-decision-packet.md',
    'data/epic-f-consumer-release.json', 'data/epic-f-media-release.json',
    'data/epic-f-machine-template-rollout-plan.json', 'data/epic-f-machine-template-rollout-policy.json',
    'data/epic-f-machine-measurement-contract.json', 'data/epic-e-downstream-readiness.json',
    'data/epic-e-deferred-decision-handoff.json', 'data/epic-e-migration-readiness.json',
    'data/epic-e-product-classification.json', 'data/metafield-metaobject-definitions.json',
    'data/epic-e-component-evidence.json', 'data/epic-e-relationship-matrix.json',
    'data/epic-e-resource-catalog.json', 'data/epic-e-batch-3c-owner-decisions.json',
    'data/epic-e-batch-3b-decision-packet.json', 'data/epic-e-batch-3c-decision-packet.json',
    'data/epic-e-warranty-support-evidence.json', 'data/epic-e-availability-evidence.json',
    'data/epic-e-fulfillment-reconciliation.json', 'data/epic-e-gap-conflict-register.json',
    'data/media-manifest.json', 'data/storefront-event-contracts.json',
    'docs/analytics/analytics-migration-verification-plan.md',
    'docs/privacy/third-party-script-and-pixel-register.md'];
const unique = a => [...new Set(a)];
const categories = ['TECHNICALLY READY, HUMAN GO REQUIRED', 'HUMAN DECISION REQUIRED',
    'VALUE APPROVAL REQUIRED', 'MIGRATION REQUIRED', 'RECONCILIATION REQUIRED',
    'CURRENT ADMIN READ REQUIRED', 'LIVE/PREVIEW VALIDATION REQUIRED',
    'RELEASE CERTIFICATION REQUIRED', 'DEPENDENCY BLOCKED', 'INTENTIONALLY DEFERRED'];
const factual = ['VALUE APPROVAL REQUIRED', 'MIGRATION REQUIRED', 'RECONCILIATION REQUIRED',
    'LIVE/PREVIEW VALIDATION REQUIRED', 'DEPENDENCY BLOCKED'];
// These are review mappings to existing authorities, not new decision/approval inputs.
const rowDefinitions = [
    ['F-PBI-004B', ['F-DEC-002'], [], ['HUMAN DECISION REQUIRED', 'VALUE APPROVAL REQUIRED', 'LIVE/PREVIEW VALIDATION REQUIRED', 'DEPENDENCY BLOCKED'], 'Prepare exact Product/media/use/rights/alt/embedded-claim review against F-DEC-002; keep grants empty.'],
    ['F-PBI-006B', ['B3B-D03', 'B3B-D05'], ['electrical', 'motor_speed', 'tool_mount', 'water_fluid', 'durable_measurements', 'crate_measurements'], factual, 'Review the existing technical and measurement decision packets for exact Product/configuration values; do not infer from manuals or descriptions.'],
    ['F-PBI-007B', ['B3B-D04', 'C-040'], ['included_components', 'optional_components'], factual, 'Prepare the existing EM-1 six-wheel/five-line/60-versus-80-grit conflict for the owner; preserve null components and quantities.'],
    ['F-PBI-008B', ['B3B-D02', 'PO-E-012', 'PO-E-013', 'B3B-D04'], ['compatibility', 'recommendations'], factual, 'Review the existing exact dependent-to-machine edges and separate recommendation approvals; retain four blocked SawMaster edges.'],
    ['F-PBI-009B', ['B3C-D01', 'B3C-D02', 'B3C-D04'], ['fulfillment_class', 'pickup_region', 'availability_authority'], factual, 'Prepare independent handling, pickup, region and timing owner decisions; native inventory/pickup and profile names confer no business approval.'],
    ['F-PBI-010B', ['B3C-D03', 'B3B-D06'], ['warranty_support'], factual, 'Review distinct issuer, administrator, repair provider, policy revision, coverage, exact mappings/exceptions and customer-safe destination with Support/Legal.'],
    ['F-PBI-011B', ['B3B-D06', 'F-DEC-002'], ['customer_manuals', 'diagrams_instructions_videos'], factual, 'Review exact canonical File/resource version, Product mapping, language, lifecycle, rights, publication and destination; keep support_files forbidden. F-DEC-002 applies to Product-surface media/video use where applicable.'],
    ['F-PBI-013', ['F-DEC-001'], [], ['HUMAN DECISION REQUIRED'], 'Prepare the existing business/Admin decision: retain native provider-owned payment_terms or suppress them; do not change provider configuration.'],
    ['F-PBI-014B', ['F-DEC-002'], [], ['LIVE/PREVIEW VALIDATION REQUIRED', 'DEPENDENCY BLOCKED'], 'Plan Shopify-rendered shell/native purchase/Contact/global chrome and approved-module scenarios, including live media and release-only journeys; no submissions in this review.'],
    ['F-PBI-015B', [], [], ['INTENTIONALLY DEFERRED', 'RELEASE CERTIFICATION REQUIRED', 'DEPENDENCY BLOCKED'], 'Define a separately authorized concrete preview/release target and scope after integration/parity prerequisites; consume existing budgets without running certification.'],
    ['F-PBI-016 instrumentation', [], [], ['HUMAN DECISION REQUIRED', 'DEPENDENCY BLOCKED'], 'Review existing U ownership, consent, collector/destination and deduplication identity decisions; reserve one native owner per action and emit nothing.'],
    ['F-PBI-017B', [], ['definitions', 'product_class'], ['MIGRATION REQUIRED', 'RECONCILIATION REQUIRED', 'CURRENT ADMIN READ REQUIRED', 'DEPENDENCY BLOCKED'], 'Review E-MUT-020/021 and the existing F7 plan; document missing deployed template, protected before-read and both GO roles. Do not assign.'],
    ['F-PBI-018B', [], [], ['CURRENT ADMIN READ REQUIRED', 'LIVE/PREVIEW VALIDATION REQUIRED', 'RELEASE CERTIFICATION REQUIRED', 'DEPENDENCY BLOCKED'], 'Plan selected-scope evidence and owner signoffs after applicable value/migration/assignment, 014B and 015B gates; production go/no-go is separate.']
];

function build(generatedAt = new Date().toISOString()) {
    const baseline = read(f8.packetPath), audit = read(auditPath);
    const plan = read('data/epic-f-machine-template-rollout-plan.json');
    const policy = read('data/epic-f-machine-template-rollout-policy.json');
    const inventory = read('docs/project/epic-f-machine-inventory.json');
    const downstream = read('data/epic-e-downstream-readiness.json').rows.filter(r => r.consumer === 'F');
    const migration = read('data/epic-e-migration-readiness.json');
    const relationship = read('data/epic-e-relationship-matrix.json');
    const resources = read('data/epic-e-resource-catalog.json');
    const measurement = read('data/epic-f-machine-measurement-contract.json');
    const query = name => audit.queries.find(q => q.dataset === name);
    const products = query('currentMachineRead').data.nodes;
    const definitions = query('currentDefinitionsRead').data;
    const themes = query('currentThemeRead').data.themes;
    const assessedAt = audit.observedAt;
    const evidencePaths = unique([...sourcePaths, ...baseline.evidenceProvenance.map(e => e.path),
        ...migration.plans.filter(p => downstream.some(d => d.planId === p.planId)).flatMap(p => [p.planPath, p.inputPath]),
        ...measurement.authorities]);
    const machines = products.map(p => {
        const historical = plan.assessments.find(a => a.productGid === p.id);
        const source = inventory.products.find(a => a.productGid === p.id);
        const excluded = policy.exclusions.find(a => a.productGid === p.id);
        return { productGid: p.id, displayLabel: source.title, currentIdentity: { title: p.title, handle: p.handle },
            status: p.status, updatedAt: p.updatedAt, resourceVersion: null, currentSuffix: p.templateSuffix,
            intendedSuffix: policy.intendedSuffix, historicalSuffix: historical.observedTemplateSuffix,
            templateDrift: p.templateSuffix === historical.observedTemplateSuffix ? 'unchanged' : 'drifted',
            publication: { publishedAt: p.publishedAt, onlineStoreUrl: p.onlineStoreUrl,
                channels: p.resourcePublicationsV2.nodes, customerPresentationVerified: false,
                note: 'publishedAt/channel membership are Admin observations; null onlineStoreUrl and availableForSale do not prove customer behavior' },
            productClass: { approvedValue: source.classification.value, approvalDecisionId: source.classification.decisionId,
                approvalState: source.classification.state, currentValue: p.metafields.nodes.find(m => m.key === 'product_class')?.jsonValue ?? null,
                migration: 'not_started', reconciliation: 'unreconciled' },
            rhinoMetafields: p.metafields.nodes, nativeVariants: p.variants.nodes,
            observedAt: query('currentMachineRead').completedAt, historicalObservedAt: source.currentObservationAt,
            futureCandidate: historical.futureCandidate, exclusion: excluded || null,
            mutationWouldBeNecessaryIfIncluded: p.templateSuffix !== policy.intendedSuffix,
            currentEligible: false, executable: false, executionPrerequisitesSatisfied: false,
            blockers: unique(['governed Product definitions absent', 'product_class absent', 'consumer eligibility not rebuilt/reconciled',
                'deployed machine template absent', 'complete protected before-read required', 'Product Owner GO absent', 'Shopify Admin Owner GO absent',
                ...(excluded ? ['explicit exclusion retained'] : [])]) };
    });
    // Native category/vendor/SKU surfaces were not audited; do not invent a
    // current migration conclusion for them from the custom-data read.
    const epicE = downstream.filter(d => !['category', 'vendor', 'commerce_sku'].includes(d.domain)).map(d => {
        const m = migration.plans.find(p => p.planId === d.planId);
        return { domain: d.domain, planId: d.planId, architectureReady: d.architecture_ready,
            definitionState: ['pickup_region', 'availability_authority'].includes(d.domain) ? 'owner_contract_blocked' : 'absent_in_current_product_definition_read',
            approvedValueExists: d.value_ready, approvedRows: d.approvedRows,
            valueState: d.value_ready ? 'approved' : 'blocked', valueMigrated: false,
            afterStateReconciled: false, consumerEligibilityCurrent: false, activationAuthorization: 'not_granted',
            requiredDecisionIds: d.blockedDecisionIds, historicalExecutionBlockers: m?.executionBlockers || [],
            currentBlockers: ['relevant governed Product definitions absent', 'no governed values on the 11 machines',
                'selected-scope migration and after-state consumer reconciliation required',
                ...(d.value_ready ? [] : ['owner-approved exact value/contract missing'])],
            evidence: ['data/epic-e-downstream-readiness.json', 'data/epic-e-migration-readiness.json', auditPath,
                ...(m ? [m.planPath, m.inputPath] : [])] };
    });
    const rows = rowDefinitions.map(([pbi, ids, domains, classification, nextSafeAction]) => {
        const upstream = epicE.filter(e => domains.includes(e.domain));
        const instrumentation = pbi === 'F-PBI-016 instrumentation';
        const sourceStatus = baseline.pbiStates[instrumentation ? 'F-PBI-016' : pbi];
        const media = pbi === 'F-PBI-004B';
        return { pbi, currentStatus: sourceStatus, repositoryArchitectureReady: true,
            currentAdminEvidence: ['F-PBI-013', 'F-PBI-016 instrumentation'].includes(pbi) ? 'not_applicable' : 'bounded_current_read_at_assessment',
            requiredDecisionIds: unique([...ids, ...upstream.flatMap(u => u.requiredDecisionIds), ...(pbi === 'F-PBI-018B' ? ['F-DEC-001'] : [])]),
            conditionalRequiredDecisionIds: pbi === 'F-PBI-018B' ? unique(rowDefinitions.slice(0, 7).flatMap(r => r[1])) : [],
            upstreamDomains: domains, classification,
            valueApprovalReady: upstream.length ? upstream.every(u => u.approvedValueExists) : false,
            migrationReady: upstream.length ? false : 'not_applicable', reconciliationReady: upstream.length ? false : 'not_applicable',
            activationAuthorization: 'not_granted', previewParity: instrumentation ? 'not_applicable' : 'unverified',
            releaseCertification: pbi === 'F-PBI-015B' ? 'deferred' : 'blocked', humanGoRequired: true,
            technicallyReadyExceptHumanGo: false, nextSafeAction,
            blockers: unique([...ids.map(id => `${id}: unresolved; owning authority required`),
                ...upstream.flatMap(u => u.currentBlockers),
                ...(media ? ['rights/use, factual alt, embedded claims, exact model and lifecycle approval absent'] : []),
                ...(instrumentation ? ['U owner/consent/collector/deduplication identity unresolved'] : []),
                ...(['F-PBI-014B', 'F-PBI-015B', 'F-PBI-017B', 'F-PBI-018B'].includes(pbi) ?
                    ['machine template absent from all five queried themes', 'template assignment absent', 'actual Shopify machine-page parity unverified'] : []),
                ...(['F-PBI-017B', 'F-PBI-018B'].includes(pbi) ? ['complete immediately-before-execution/current release evidence required', 'both GO roles absent', 'production approval absent'] : [])]),
            evidence: unique([f8.packetPath, auditPath, 'docs/project/epic-f-decision-packet.md',
                ...(upstream.length ? ['data/epic-e-downstream-readiness.json', 'data/epic-e-migration-readiness.json'] : []),
                ...(media ? ['data/epic-f-media-release.json'] : []),
                ...(instrumentation ? ['data/epic-f-machine-measurement-contract.json', ...measurement.authorities] : []),
                ...(['F-PBI-017B', 'F-PBI-018B'].includes(pbi) ? ['data/epic-f-machine-template-rollout-plan.json', 'data/epic-f-machine-template-rollout-policy.json'] : [])]) };
    });
    const mediaCandidates = products.flatMap(p => p.media.nodes.map(asset => ({ productGid: p.id, mediaGid: asset.id,
        asset, intendedUse: 'product_machine_gallery', eligibility: 'blocked', rightsUseApproval: null,
        factualAltApproval: null, lifecycleApproval: null, applicableDecisionId: 'F-DEC-002',
        historicalIdentityMatched: inventory.products.find(i => i.productGid === p.id).media.items.some(i => i.id === asset.id),
        embeddedClaimReview: p.id === 'gid://shopify/Product/8905780756677' ? 'historical patent wording concern; no approved claim review' : 'owner review unapproved',
        blockers: ['Product-surface rights/use and exact model approval missing', 'blank alt; factual alt approval missing',
            'embedded claim and lifecycle/currentness approval missing', 'homepage use approval does not grant Product use',
            ...(['gid://shopify/Product/8905784197317', 'gid://shopify/Product/8905784262853'].includes(p.id) ? ['shared SawMaster 24/36 asset; exact model scope unresolved'] : [])] })));
    return { $schema: '../schemas/epic-f-activation-readiness-review.schema.json', schemaVersion: 1,
        assessedAt, generatedAt, scope: 'read_only_activation_dependency_review',
        baseline: { packet: f8.packetPath, repositoryAggregatePassed: baseline.repositoryAggregatePassed,
            pbiStates: baseline.pbiStates, liveReleaseState: baseline.liveReleaseState },
        evidence: evidencePaths.sort().map(path => { const d = path.endsWith('.json') ? read(path) : {};
            return { path, sha256: fileHash(path), sourceObservedAt: d.observedAt || d.assessedAt || d.capturedAt || d.asOf || d.generatedAt || null }; }),
        admin: { adminCurrentRead: audit.adminCurrentRead, observedAt: audit.observedAt, shop: audit.shop,
            api: audit.api, apiVersion: audit.apiVersion, evidence: auditPath, completeMachineCoverage: true,
            productDefinitionCount: definitions.productDefinitions.nodes.length, machineFamilyDefinition: definitions.machineFamilyDefinition,
            freshness: audit.queries.map(q => ({ dataset: q.dataset, observedAt: q.completedAt,
                expiresAt: new Date(Date.parse(q.completedAt) + audit.freshness.maxAgeSeconds * 1000).toISOString(),
                stateAtAssessment: Date.parse(assessedAt) <= Date.parse(q.completedAt) + 900000 ? 'current' : 'stale' })),
            freshnessAtGeneration: audit.queries.map(q => ({ dataset: q.dataset,
                state: Date.parse(generatedAt) <= Date.parse(q.completedAt) + 900000 ? 'current' : 'stale' })),
            executionBeforeReadComplete: false, scopeLimitations: audit.scopeLimitations,
            historicalAdminState: baseline.adminEvidence },
        machines, epicE, rows,
        realGrants: { ...baseline.realGrants, scope: 'Actual repository release artifacts; all current machine rhino values absent; no inference from fixtures or legacy deployed theme' },
        media: { eligibleLiveMediaGrants: 0, candidates: mediaCandidates, missingMediaProductGids: products.filter(p => !p.media.nodes.length).map(p => p.id) },
        specifications: { eligibleLiveSpecificationGrants: 0, exactApprovedMigratedReconciledValues: [], requiredDecisionIds: ['B3B-D03', 'B3B-D05'] },
        contents: { eligibleLiveContentsGrants: 0, statistics: read('data/epic-e-component-evidence.json').statistics,
            decision: read('data/epic-e-component-evidence.json').decision, compatibilityEstablishesInclusion: false, recommendationsEstablishInclusion: false },
        relationships: { statistics: relationship.statistics, edges: relationship.edges, approvedCurrentEdges: [],
            migratedReconciled: false, customerVisibleTargetEligibility: 'unverified_for_dependent_products', activationAuthorization: 'not_granted' },
        operations: ['handling', 'pickup', 'region', 'timing'].map((domain, i) => ({ domain,
            decisionId: ['B3C-D01', 'B3C-D02', 'B3C-D02', 'B3C-D04'][i], state: 'blocked',
            owner: 'Operations / Product Owner', approvedValue: null, migratedReconciled: false,
            nativeBehaviorIsBusinessApproval: false, evidence: 'data/epic-e-batch-3c-owner-decisions.json' })),
        warranty: { decisionId: 'B3C-D03', state: 'blocked', issuer: null, administrator: null, repairProvider: null,
            manufacturer: null, policyRevision: null, coverage: null, productMappings: [], productExceptions: [], customerSafeDestination: null,
            vendorIsAuthority: false, historicalOneYear90DayWordingApproved: false },
        resources: { statistics: resources.statistics, canonicalApproved: 0, resourceIds: resources.resources.map(r => r.resourceId),
            workingPageIsCanonicalFile: false, newestUploadOrFilenameIsAuthority: false, supportFilesCustomerAllowed: false,
            liveFilePageVerification: 'not_queried', requiredDecisionIds: ['B3B-D06'] },
        payment: { pbi: 'F-PBI-013', decisionId: 'F-DEC-001', state: 'open', nativeTermsAreDecisionApproval: false,
            humanChoices: ['retain native provider-owned payment_terms', 'suppress native payment_terms'], businessAdminDecisionPresent: false },
        accessibility: { ...baseline.accessibility, currentShopifyMachineParity: 'unverified',
            requiredScenarios: ['deployed/assigned machine template with native purchase and neutral Contact', 'global header/footer, cart, provider terms and native pickup integration',
                'all release-scoped routes, empty/suppressed and approved-media/module states', 'responsive widths, 200% text enlargement and actual Chromium zoom',
                'keyboard/focus, gallery modal/download targets and axe serious/critical findings', 'release-only journeys under separate authorization; no review submissions'] },
        performance: { harness: 'ready', localRegression: baseline.performance.localRegression, releaseCertification: 'deferred',
            observations: baseline.performance.observations.map(batch => ({ batch: batch.batch, path: batch.path,
                observedAt: batch.observedAt, exitCode: batch.exitCode, scope: batch.scope, budgets: batch.budgets,
                thresholdChanges: batch.thresholdChanges,
                states: unique(batch.observations.map(o => o.state)),
                requestedRuns: unique(batch.observations.map(o => o.requestedRuns)),
                everyExpectedResultMatched: batch.observations.every(o => o.expectedResult) })),
            budgetEvidence: 'data/brand-performance-budget.json',
            source: f8.packetPath, releaseMedian: null, thresholdChanges: false,
            prerequisites: ['selected shell-only or activated-domain release scope', 'authorized deployed preview/release target',
                'applicable template assignment and integration verified', 'Shopify-rendered parity including global/provider/native behavior', 'unchanged existing release protocol/budgets'] },
        measurement: { ...baseline.measurement, instrumentationReady: false, owner: 'unresolved', consent: 'unresolved',
            collector: 'unresolved', deduplicationIdentity: 'unverified', authorities: measurement.authorities },
        rollout: { ...baseline.rollout, currentExactIdentityReadSucceeded: true, completeExecutionBeforeRead: false,
            currentTemplateDriftCount: machines.filter(m => m.templateDrift === 'drifted').length,
            deployedThemes: themes.nodes, templatePresentThemeCount: themes.nodes.filter(t => t.files.nodes.length).length },
        containment: { claims: baseline.claims, jsonLd: baseline.jsonLd,
            currentDeployedCustomerContainment: 'unverified; default template still assigned; F suppression in repository is not live containment certification' },
        unresolvedDecisions: read('data/epic-e-deferred-decision-handoff.json').decisions.map(d => ({
            decisionId: d.decisionId, sourceDecisionIds: d.sourceDecisionIds, currentState: d.currentState,
            sourceState: d.sourceState, ownerRoles: d.ownerRoles, question: d.question, domains: d.domains,
            evidenceArtifact: d.evidenceArtifact, unblocksPlans: d.unblocksPlans })),
        historicalDiagnostics: baseline.historicalDiagnostics,
        shellOnly: { technicallyConceivable: true, authorized: false, factualGrantsRequired: false,
            requirements: ['explicit bounded release scope and owner approval of continued suppression',
                'existing E definition/product_class migration and reconciliation prerequisites retained by F7',
                'separately authorized preview deployment of the existing repository template',
                'current consumer eligibility, complete protected before-read, unchanged plan and both GO roles',
                'separately authorized assignment only to approved non-excluded exact targets',
                'F-DEC-001 provider-term visibility decision; neutral Contact process/integration within existing P ownership',
                'actual native purchase/Contact/pickup parity; no inference from Admin availableForSale',
                'remaining applicable 014B, 015B release performance and 018B owner signoffs', 'separate explicit production go/no-go'],
            smallestSafeNextAction: 'Prepare concrete shell-only scope against the eight existing F7 future candidates and review E-MUT-020/021 prerequisites; no candidate becomes executable. Payment/media/U owner decisions can be reviewed independently.' },
        dependencyOrder: ['selected release scope and existing owner decisions for each chosen factual domain (independent lanes)',
            'approved E values/definitions; separately authorized existing migrations and after-state reconciliation',
            'fresh source-bound F consumer eligibility and media grants, only after applicable approvals',
            'separately authorized deployment and exact bounded template assignment with both GO roles and complete before-read',
            'actual Shopify-rendered parity and remaining 014B', '015B release performance certification',
            '018B selected-scope aggregate owner signoff', 'separate production go/no-go'],
        independentLanes: ['F-DEC-001 business payment decision', 'F-DEC-002 exact media rights/use/alt/claims decisions',
            'B3B technical/measurements/BOM/compatibility/canonical resources and B3C operations/warranty owner decisions',
            'U owner/consent/collector/deduplication decisions', 'read-only E-MUT-020/021 and shell-only scope planning'],
        safety: { shopifyAdminMutation: false, productTemplateAssignment: false, productDataMutation: false,
            filePagePolicyMediaAltMutation: false, analyticsPixelConsentChange: false, shippingLocationChange: false,
            previewThemePush: false, productionThemePush: false, productionPublication: false,
            executed017B: false, executed018B: false, activatedBScope: false, runtimeThemeDelta: false, thresholdChanges: false }
    };
}

function validateSnapshot(packet, expected) {
    const errors = schemaErrors('epic-f-activation-readiness-review', packet);
    if (canonical(packet) !== canonical(expected)) errors.push('Review differs from source-bound evidence projection; readiness promotion or provenance drift rejected');
    return errors;
}
function validate(packet) {
    const errors = f8.validate(read(f8.packetPath));
    const audit = read(auditPath);
    if (!Number.isFinite(Date.parse(packet.generatedAt)) || Date.parse(packet.generatedAt) < Date.parse(audit.observedAt)) errors.push('Generation time cannot predate its actual evidence');
    const actualIds = audit.queries.find(q => q.dataset === 'currentMachineRead').data.nodes.map(p => p.id);
    if (canonical([...actualIds].sort()) !== canonical([...f8.machineGids].sort())) errors.push('Current read must cover exactly the 11 governed GIDs');
    function connections(value) {
        if (!value || typeof value !== 'object') return;
        if (value.pageInfo?.hasNextPage) errors.push('Unconsumed Admin pagination');
        Object.values(value).forEach(connections);
    }
    connections(audit.queries);
    // Fail closed if a new audit no longer supports this review's absence
    // conclusions. It requires investigation rather than automatic promotion.
    const observed = audit.queries.find(q => q.dataset === 'currentMachineRead').data.nodes;
    if (observed.some(p => p.metafields.nodes.length || p.templateSuffix !== null)) errors.push('Current governed value/template drift requires a new evidence assessment');
    const defs = audit.queries.find(q => q.dataset === 'currentDefinitionsRead').data;
    const themes = audit.queries.find(q => q.dataset === 'currentThemeRead').data.themes.nodes;
    if (defs.productDefinitions.nodes.length || defs.machineFamilyDefinition || themes.some(t => t.files.nodes.length)) errors.push('Definition/deployment drift requires a new evidence assessment');
    for (const q of audit.queries) {
        if (/\bmutation\b/i.test(q.query) || !/^\s*query\b/.test(q.query)) errors.push('Audit query must be read-only');
        if (!Number.isFinite(Date.parse(q.completedAt)) || Date.parse(q.completedAt) > Date.parse(audit.observedAt)) errors.push('Invalid audit observation timestamp');
    }
    if (audit.mutations !== 0 || audit.apiVersion !== null) errors.push('Audit must preserve zero mutations and unexposed API version');
    errors.push(...validateSnapshot(packet, build(packet.generatedAt)));
    return errors;
}
module.exports = { build, validate, validateSnapshot, packetPath, auditPath, categories };
