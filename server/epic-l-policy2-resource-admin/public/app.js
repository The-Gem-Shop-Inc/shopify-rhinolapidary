'use strict';

const SESSION = { 'x-rhino-synthetic-session': 'B07_LOCAL_ISOLATED' };
const CATEGORIES = ['MANUAL', 'DYNAMIC_INSTRUCTION_DOCUMENT', 'DIAGRAM', 'SETUP_GUIDE', 'TUTORIAL_VIDEO', 'SAFETY_NOTICE'];
const state = { catalog: [], resources: [], selected: null, dirty: false, correctionCandidates: [] };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const commandId = (prefix) => `${prefix}-${crypto.randomUUID()}`;
const words = (value) => String(value || '').replaceAll('_', ' ').toLowerCase();
const statusLabel = (value) => ({
  DRAFT: 'Draft', TECHNICAL_REVIEW_REQUIRED: 'Technical decision recorded', APPROVED_INTERNAL: 'Approved for internal use', SUPERSEDED: 'Replaced', RETIRED: 'Retired',
  UNCHANGED_EXISTING_UNBOUND: 'Existing content; identity pending', UNCHANGED_EXISTING_UNVERIFIED: 'Existing content; unchanged assertion pending verification',
  UNCHANGED_EXISTING_BOUND: 'Existing unchanged content', CHANGED_CONTENT: 'Content changed', NEW_DRAFT: 'New content draft',
  OBSERVED_NOT_APPROVED: 'Suggested from inventory', EXPLICITLY_APPROVED: 'Confirmed for this machine',
}[value] || words(value));

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...SESSION, ...(options.body ? { 'content-type': 'application/json' } : {}), ...(options.headers || {}) } });
  const payload = await response.json();
  if (!response.ok) throw Object.assign(new Error(payload.error?.message || 'Request failed'), payload.error || {});
  return payload.data;
}

function notice(message) {
  const node = $('#notice'); node.textContent = message; node.classList.add('visible');
  window.setTimeout(() => node.classList.remove('visible'), 4000);
}

function fillSelect(select, options, label, value) {
  select.innerHTML = `<option value="">${escapeHtml(label)}</option>${options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('')}`;
  select.value = value || '';
}

function productOptions() { return state.catalog.map((product) => ({ value: product.productGid, label: product.title })); }
function variantOptions(productGid = '') {
  const products = productGid ? state.catalog.filter((product) => product.productGid === productGid) : state.catalog;
  return products.flatMap((product) => product.variants.map((variant) => ({ value: variant.variantGid, label: `${product.title} — ${variant.title}` })));
}

function assignmentRow(assignment = {}, index = 0) {
  const productId = `assignment-product-${index}`;
  const variantId = `assignment-variant-${index}`;
  const machineId = `assignment-machine-${index}`;
  const statusId = `assignment-status-${index}`;
  return `<div class="applicability-row" data-assignment>
    <label for="${productId}">Machine<select id="${productId}" name="assignmentProduct"><option value="">Choose later</option>${productOptions().map((option) => `<option value="${escapeHtml(option.value)}"${option.value === assignment.productGid ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
    <label for="${variantId}">Model option<select id="${variantId}" name="assignmentVariant"><option value="">Choose later</option>${variantOptions(assignment.productGid).map((option) => `<option value="${escapeHtml(option.value)}"${option.value === assignment.variantGid ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
    <label for="${machineId}">Version<input id="${machineId}" name="assignmentMachineVersion" value="${escapeHtml(assignment.machineVersion || '')}"></label>
    <label for="${statusId}">Decision<select id="${statusId}" name="assignmentApprovalStatus"><option value="OBSERVED_NOT_APPROVED"${assignment.approvalStatus !== 'EXPLICITLY_APPROVED' ? ' selected' : ''}>Use as a suggestion</option><option value="EXPLICITLY_APPROVED"${assignment.approvalStatus === 'EXPLICITLY_APPROVED' ? ' selected' : ''}>Confirm exact machine</option></select></label>
    <button class="remove-assignment" type="button" aria-label="Remove machine assignment ${index + 1}">Remove</button>
  </div>`;
}

function renderAssignments(assignments = [{}]) {
  $('#applicability-list').innerHTML = (assignments.length ? assignments : [{}]).map(assignmentRow).join('');
}

async function bootstrap() {
  const data = await api('/api/bootstrap');
  state.catalog = data.catalog; state.resources = data.resources; state.correctionCandidates = data.correctionCandidates;
  $$('select[name="category"]').forEach((select) => fillSelect(select, CATEGORIES.map((value) => ({ value, label: statusLabel(value) })), select.closest('#filter-form') ? 'All categories' : 'Choose category', select.value));
  $$('select[name="productGid"]').forEach((select) => fillSelect(select, productOptions(), 'All machines', select.value));
  $$('select[name="variantGid"]').forEach((select) => fillSelect(select, variantOptions(), 'All model options', select.value));
  renderCorrectionReview(); renderList();
}

async function refreshList() {
  const params = new URLSearchParams(new FormData($('#filter-form')));
  for (const [key, value] of [...params]) if (!value) params.delete(key);
  state.resources = await api(`/api/resources?${params}`); renderList();
}

function renderCorrectionReview() {
  const root = $('#correction-review');
  if (state.correctionCandidates.length !== 2) { root.hidden = true; return; }
  root.hidden = false;
  root.innerHTML = `<div><strong>Two SawMaster diagrams need one content check.</strong><p>Were the actual files unchanged when their administrative details were edited? The original records and synthetic decisions will be retained either way.</p></div><button id="confirm-two-unchanged" type="button">Confirm both files were unchanged</button>`;
}

function renderList() {
  $('#inventory-count').textContent = `${state.resources.length} resource${state.resources.length === 1 ? '' : 's'} shown`;
  $('#resource-list').innerHTML = state.resources.length ? state.resources.map((row) => `<button class="resource-card" type="button" data-resource-id="${escapeHtml(row.resourceId)}" aria-current="${row.resourceId === state.selected?.resourceId}"><strong>${escapeHtml(row.title)}</strong><span class="meta"><span>${escapeHtml(statusLabel(row.category))}</span><span>${escapeHtml(statusLabel(row.changeStatus))}</span><span class="status${row.missingRequirements.length ? ' warning' : ''}">${escapeHtml(statusLabel(row.lifecycleStatus))}</span><span>${row.missingRequirements.length ? `${row.missingRequirements.length} item${row.missingRequirements.length === 1 ? '' : 's'} need attention` : 'Evidence complete'}</span></span></button>`).join('') : '<div class="empty-state"><strong>No resources match these filters.</strong><p>Clear a filter or create a new draft.</p></div>';
}

async function selectResource(resourceId) {
  state.selected = await api(`/api/resources/${encodeURIComponent(resourceId)}`); renderList(); renderDetail();
}

function machineName(assignment) {
  const product = state.catalog.find((item) => item.productGid === assignment.productGid);
  const variant = product?.variants.find((item) => item.variantGid === assignment.variantGid);
  return `${product?.title || 'Unknown machine'} — ${variant?.title || 'Unknown model'} — ${assignment.machineVersion} (${statusLabel(assignment.approvalStatus)})`;
}

function requirementHelp(code) {
  const labels = {
    IMMUTABLE_REVISION_IDENTITY_REQUIRED: 'Content identity is pending automatic hashing or a provider revision.',
    DELIVERY_PREPARATION_PENDING: 'Customer delivery preparation is pending; this does not block draft work or technical approval.',
    PROVIDER_TYPE_REQUIRED: 'Source provider has not yet been resolved.', LANGUAGE_DISPOSITION_REQUIRED: 'Choose a language or use the English (US) default.',
    RESOURCE_APPLICABILITY_REQUIRED: 'Choose at least one machine when applicability is required.', EXACT_APPLICABILITY_APPROVAL_REQUIRED: 'Confirm the suggested exact machine assignment.',
    RIGHTS_DISPOSITION_REQUIRED: 'Confirm permission to distribute.', ACCESSIBILITY_DISPOSITION_REQUIRED: 'Accessibility review is unresolved.',
    SYNTHETIC_AVAILABILITY_EVIDENCE_REQUIRED: 'Run automatic evidence updates to check isolated availability.', TECHNICAL_APPROVAL_EVIDENCE_REQUIRED: 'Record the prior Kevin decision for unchanged content or a new technical decision for changed content.',
    HISTORICAL_APPROVAL_BINDING_PENDING: 'The prior approval assertion is saved and will bind automatically when content identity is established.',
  };
  return labels[code] || statusLabel(code);
}

function renderDetail() {
  const record = state.selected; $('#detail-empty').hidden = true; const root = $('#detail-content'); root.hidden = false;
  const current = record.revisions.at(-1);
  const assignments = current.applicability.map(machineName).join('\n') || 'No machine chosen yet';
  const historicalEligible = !['CHANGED_CONTENT', 'NEW_DRAFT'].includes(current.changeStatus) && !current.technicalApproval;
  const freshEligible = ['CHANGED_CONTENT', 'NEW_DRAFT'].includes(current.changeStatus) && !current.technicalApproval;
  root.innerHTML = `<div class="section-heading"><div><p class="eyebrow">${escapeHtml(record.origin.kind === 'B05_CANDIDATE' ? 'Existing inventory resource' : 'Administrative draft')}</p><h2>${escapeHtml(current.title)}</h2></div><div class="actions"><button type="button" data-action="edit">Edit administrative details</button><button class="secondary" type="button" data-action="content" aria-label="Update content">Update document or video content</button><button class="secondary" type="button" data-action="correct">Correct an administrative error</button></div></div>
    <div class="actions"><span class="status">${escapeHtml(statusLabel(current.lifecycleStatus))}</span>${historicalEligible ? '<button class="secondary" type="button" data-action="historical">Confirm prior Kevin approval</button>' : ''}${freshEligible ? '<button class="secondary" type="button" data-action="technical">Record technical decision</button>' : ''}<button class="secondary" type="button" data-action="approve">Approve for internal use</button><button class="danger-secondary" type="button" data-action="retire">Retire</button></div>
    <h3>What needs attention</h3>${current.missingRequirements.length ? `<div class="missing"><ul>${current.missingRequirements.map((item) => `<li>${escapeHtml(requirementHelp(item))}</li>`).join('')}</ul></div>` : '<p>No internal evidence requirements are missing. Customer release remains blocked.</p>'}
    <h3>Resource summary</h3><dl class="detail-grid"><div><dt>Content status</dt><dd>${escapeHtml(statusLabel(current.changeStatus))}</dd></div><div><dt>Language</dt><dd>${escapeHtml(current.language || 'Not set')}${current.languageDisposition?.basis === 'DEFAULTED' ? ' (defaulted)' : ''}</dd></div><div class="wide"><dt>Machines</dt><dd><pre>${escapeHtml(assignments)}</pre></dd></div><div><dt>Distribution rights</dt><dd>${escapeHtml(statusLabel(current.rightsDisposition.status))}</dd></div><div><dt>Accessibility</dt><dd>${escapeHtml(statusLabel(current.accessibilityDisposition.status))}</dd></div><div><dt>Technical decision</dt><dd>${escapeHtml(current.technicalApproval ? (current.technicalApproval.bindingStatus === 'PENDING_IMMUTABLE_IDENTITY' ? 'Historical assertion saved; exact binding pending' : 'Recorded') : 'Not recorded')}</dd></div></dl>
    <details class="advanced"><summary>Advanced identities and evidence</summary><dl class="detail-grid"><div><dt>Administrative revision</dt><dd>${escapeHtml(current.revisionId)}</dd></div><div><dt>Immutable content identity</dt><dd>${escapeHtml(current.immutableRevisionIdentity || 'Pending automatic resolution')}</dd></div><div><dt>Source</dt><dd>${escapeHtml(current.editableSourceIdentity)}</dd></div><div><dt>Customer delivery</dt><dd>${escapeHtml(current.proposedCustomerDeliveryLink || 'Pending delivery preparation')}</dd></div><div><dt>Provider</dt><dd>${escapeHtml(current.providerType || 'Pending')}</dd></div><div><dt>Availability</dt><dd>${escapeHtml(statusLabel(current.availabilityDisposition.status))}; production not verified</dd></div>${current.classificationCorrection ? `<div class="wide"><dt>Classification correction</dt><dd>Originally ${escapeHtml(statusLabel(current.recordedChangeStatus))}; effectively ${escapeHtml(statusLabel(current.effectiveChangeStatus))}. ${escapeHtml(current.classificationCorrection.correctionReason)}</dd></div>` : ''}</dl></details>
    <h3>History</h3><ol class="history">${record.revisions.slice().reverse().map((revision) => `<li><strong>Revision ${revision.sequence}: ${escapeHtml(revision.title)}</strong><div class="meta"><span>${escapeHtml(statusLabel(revision.changeStatus))}</span><span>${escapeHtml(statusLabel(revision.lifecycleStatus))}</span><span>${escapeHtml(revision.createdAt)}</span></div>${record.revisions.length > 1 && revision.revisionId !== current.revisionId ? `<button class="secondary" type="button" data-action="compare" data-left="${escapeHtml(revision.revisionId)}" data-right="${escapeHtml(current.revisionId)}">Compare with current</button>` : ''}</li>`).join('')}</ol><div id="comparison" aria-live="polite"></div>`;
}

function openResourceForm(operation) {
  const form = $('#resource-form'); form.reset(); $('#form-error').hidden = true; form.elements.operation.value = operation;
  $('details.advanced', form).open = operation !== 'admin';
  fillSelect(form.elements.category, CATEGORIES.map((value) => ({ value, label: statusLabel(value) })), 'Choose category');
  const current = state.selected?.revisions.at(-1);
  const copyCurrent = operation !== 'new' && current;
  $('#dialog-heading').textContent = operation === 'new' ? 'Create draft' : operation === 'admin' ? 'Edit administrative details' : 'Update content';
  $('#dialog-eyebrow').textContent = operation === 'content' ? 'Content replacement' : 'Administrative details';
  $('#dialog-help').textContent = operation === 'content' ? 'This creates a new immutable revision, requires a fresh technical decision, and automatically retains the previous revision.' : 'Known evidence is preserved. Saving these details does not classify the content as changed.';
  $('#save-resource').textContent = operation === 'new' ? 'Save draft' : operation === 'admin' ? 'Save details' : 'Continue to confirmation';
  if (copyCurrent) {
    for (const name of ['title', 'category', 'language', 'editableSourceIdentity', 'proposedCustomerDeliveryLink']) form.elements[name].value = current[name] || '';
    form.elements.resourceId.value = state.selected.resourceId; form.elements.baseRevisionId.value = current.revisionId; form.elements.expectedVersion.value = state.selected.version;
    form.elements.providerType.value = current.providerType || ''; form.elements.rightsStatus.value = current.rightsDisposition.status; form.elements.accessibilityStatus.value = current.accessibilityDisposition.status;
    renderAssignments(current.applicability);
  } else {
    form.elements.language.value = 'en-US'; renderAssignments();
  }
  state.dirty = false; $('#resource-dialog').showModal(); form.elements.title.focus();
}

function applicabilityFrom(form) {
  return $$('[data-assignment]', form).map((row) => ({ productGid: $('[name="assignmentProduct"]', row).value, variantGid: $('[name="assignmentVariant"]', row).value, machineVersion: $('[name="assignmentMachineVersion"]', row).value, approvalStatus: $('[name="assignmentApprovalStatus"]', row).value })).filter((item) => item.productGid || item.variantGid || item.machineVersion);
}

function fullInput(form, operation) {
  const current = state.selected?.revisions.at(-1);
  const notes = form.elements.evidenceRefs.value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  const rightsEvidence = notes.length ? notes : current?.rightsDisposition?.evidenceRefs || [];
  const accessibilityEvidence = notes.length ? notes : current?.accessibilityDisposition?.evidenceRefs || [];
  return {
    title: form.elements.title.value, category: form.elements.category.value, language: form.elements.language.value || 'en-US',
    languageDisposition: { basis: form.elements.language.value && form.elements.language.value !== 'en-US' ? 'OVERRIDDEN' : 'DEFAULTED', verified: false, evidenceRefs: ['ADMINISTRATIVE_LANGUAGE_DISPOSITION'] },
    editableSourceIdentity: form.elements.editableSourceIdentity.value, proposedCustomerDeliveryLink: form.elements.proposedCustomerDeliveryLink.value || null,
    immutableRevisionIdentity: operation === 'content' ? null : current?.immutableRevisionIdentity || null, providerType: form.elements.providerType.value || current?.providerType || null,
    changeStatus: operation === 'new' ? 'NEW_DRAFT' : operation === 'content' ? 'CHANGED_CONTENT' : current?.changeStatus,
    changeReason: operation === 'content' ? 'CONTENT_REPLACED_BY_ADMINISTRATOR' : 'ADMINISTRATIVE_DETAILS_UPDATED', changeEvidenceRefs: [],
    applicability: applicabilityFrom(form), rightsDisposition: { status: form.elements.rightsStatus.value, evidenceRefs: rightsEvidence },
    accessibilityDisposition: { status: form.elements.accessibilityStatus.value, evidenceRefs: accessibilityEvidence },
    availabilityDisposition: operation === 'content' || !current ? { status: 'UNRESOLVED', checkedAt: null, evidenceRefs: [], synthetic: true, productionVerified: false } : current.availabilityDisposition,
  };
}

async function saveResource(event) {
  event.preventDefault(); const form = event.currentTarget; const operation = form.elements.operation.value; const input = fullInput(form, operation);
  try {
    let result;
    if (operation === 'new') result = await api('/api/resources', { method: 'POST', body: JSON.stringify({ commandId: commandId('draft'), input }) });
    if (operation === 'admin') {
      const changes = Object.fromEntries(['title', 'category', 'language', 'languageDisposition', 'editableSourceIdentity', 'proposedCustomerDeliveryLink', 'providerType', 'applicability', 'rightsDisposition', 'accessibilityDisposition', 'availabilityDisposition'].map((key) => [key, input[key]]));
      result = await api(`/api/resources/${encodeURIComponent(form.elements.resourceId.value)}/administrative-details`, { method: 'POST', body: JSON.stringify({ commandId: commandId('details'), expectedVersion: Number(form.elements.expectedVersion.value), revisionId: form.elements.baseRevisionId.value, changes }) });
    }
    if (operation === 'content') {
      if (!await confirmTransition('Replace the document or video content? The previous revision and its evidence will be retained, and the new content will require a fresh technical decision.')) return;
      result = await api(`/api/resources/${encodeURIComponent(form.elements.resourceId.value)}/content-update`, { method: 'POST', body: JSON.stringify({ commandId: commandId('content'), expectedVersion: Number(form.elements.expectedVersion.value), baseRevisionId: form.elements.baseRevisionId.value, input, confirmed: true }) });
    }
    state.dirty = false; $('#resource-dialog').close(); await refreshList(); await selectResource(result.resourceId); notice(operation === 'admin' ? 'Administrative details saved without changing the content classification.' : 'Resource saved with retained history.');
  } catch (error) { const node = $('#form-error'); node.textContent = `${error.code || 'ERROR'}: ${error.message}`; node.hidden = false; node.focus(); }
}

async function confirmTransition(message) {
  const dialog = $('#confirmation-dialog'); $('#confirmation-copy').textContent = message; dialog.showModal();
  return new Promise((resolve) => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true }));
}

async function transition(action) {
  const record = state.selected; const current = record.revisions.at(-1); let result;
  if (action === 'historical') result = await api(`/api/resources/${encodeURIComponent(record.resourceId)}/historical-approval`, { method: 'POST', body: JSON.stringify({ commandId: commandId('historical'), expectedVersion: record.version, revisionId: current.revisionId, authorityLimitations: ['PRODUCTION_IDENTITY_UNVERIFIED', 'CUSTOMER_RELEASE_NOT_AUTHORIZED'] }) });
  if (action === 'technical') result = await api(`/api/resources/${encodeURIComponent(record.resourceId)}/technical-disposition`, { method: 'POST', body: JSON.stringify({ commandId: commandId('technical'), expectedVersion: record.version, revisionId: current.revisionId, notes: null }) });
  if (action === 'approve') result = await api(`/api/resources/${encodeURIComponent(record.resourceId)}/approve-internal`, { method: 'POST', body: JSON.stringify({ commandId: commandId('approve'), expectedVersion: record.version, revisionId: current.revisionId, reason: 'AUTHENTICATED_INTERNAL_APPROVAL_ACTION', evidenceRefs: ['authenticated-administrative-action'] }) });
  if (action === 'retire' && await confirmTransition('Retire this resource revision? Its complete history and evidence will remain available.')) result = await api(`/api/resources/${encodeURIComponent(record.resourceId)}/retire`, { method: 'POST', body: JSON.stringify({ commandId: commandId('retire'), expectedVersion: record.version, revisionId: current.revisionId, reason: 'ADMINISTRATIVE_RETIREMENT', evidenceRefs: ['authenticated-administrative-action'] }) });
  if (action === 'correct') {
    const corrected = current.changeStatus === 'CHANGED_CONTENT' ? (current.immutableRevisionIdentity ? 'UNCHANGED_EXISTING_BOUND' : 'UNCHANGED_EXISTING_UNVERIFIED') : current.changeStatus;
    if (!await confirmTransition(`Correct the recorded classification to “${statusLabel(corrected)}”? The original classification and any invalidated synthetic disposition remain in history.`)) return;
    result = await api(`/api/resources/${encodeURIComponent(record.resourceId)}/classification-correction`, { method: 'POST', body: JSON.stringify({ commandId: commandId('correction'), expectedVersion: record.version, revisionId: current.revisionId, effectiveChangeStatus: corrected, reason: 'ADMINISTRATIVE_CLASSIFICATION_ERROR_CORRECTED', confirmed: true }) });
  }
  if (result) { state.selected = result; await refreshList(); renderDetail(); notice('Governed action recorded.'); }
}

async function reviewEnrichment() {
  const previews = await api('/api/enrichment-preview');
  const suggestions = previews.flatMap((preview) => preview.suggestions.map((item) => ({ ...item, resourceId: preview.resourceId })));
  $('#enrichment-preview').innerHTML = suggestions.length ? `<p><strong>${suggestions.length} values</strong> can be filled across ${new Set(suggestions.map((item) => item.resourceId)).size} resources.</p><ul class="preview-list">${suggestions.map((item) => `<li><strong>${escapeHtml(item.resourceId)}</strong>: ${escapeHtml(statusLabel(item.field))} — ${escapeHtml(typeof item.value === 'object' ? JSON.stringify(item.value) : item.value)} <span>(${escapeHtml(words(item.confidence))})</span></li>`).join('')}</ul>` : '<p>No deterministic updates are available.</p>';
  $('#apply-enrichment').disabled = suggestions.length === 0; $('#enrichment-dialog').showModal(); $('#enrichment-preview').focus();
}

$('#filter-form').addEventListener('input', refreshList);
$('#resource-list').addEventListener('click', (event) => { const button = event.target.closest('[data-resource-id]'); if (button) selectResource(button.dataset.resourceId).catch(showError); });
$('#new-resource').addEventListener('click', () => openResourceForm('new'));
$('#resource-form').addEventListener('input', () => { state.dirty = true; }); $('#resource-form').addEventListener('submit', saveResource);
$$('[data-close]').forEach((button) => button.addEventListener('click', () => { if (!state.dirty || window.confirm('Discard unsaved changes?')) { $('#resource-dialog').close(); state.dirty = false; } }));
$('#resource-dialog').addEventListener('cancel', (event) => { if (state.dirty && !window.confirm('Discard unsaved changes?')) event.preventDefault(); else state.dirty = false; });
$('#add-applicability').addEventListener('click', () => { const values = applicabilityFrom($('#resource-form')); values.push({}); renderAssignments(values); state.dirty = true; });
$('#applicability-list').addEventListener('click', (event) => { const button = event.target.closest('.remove-assignment'); if (!button) return; button.closest('[data-assignment]').remove(); if (!$('#applicability-list').children.length) renderAssignments(); state.dirty = true; });
$('#applicability-list').addEventListener('change', (event) => { if (event.target.name !== 'assignmentProduct') return; const row = event.target.closest('[data-assignment]'); fillSelect($('[name="assignmentVariant"]', row), variantOptions(event.target.value), 'Choose later'); });
$('#detail-content').addEventListener('click', async (event) => { const button = event.target.closest('[data-action]'); if (!button) return; try { if (button.dataset.action === 'edit') return openResourceForm('admin'); if (button.dataset.action === 'content') return openResourceForm('content'); if (button.dataset.action === 'compare') { const comparison = await api(`/api/resources/${encodeURIComponent(state.selected.resourceId)}/compare?left=${encodeURIComponent(button.dataset.left)}&right=${encodeURIComponent(button.dataset.right)}`); $('#comparison').innerHTML = `<h4>Revision comparison</h4>${comparison.changes.length ? `<table class="comparison-table"><thead><tr><th scope="col">Field</th><th scope="col">Earlier revision</th><th scope="col">Current revision</th></tr></thead><tbody>${comparison.changes.map((change) => `<tr><th scope="row">${escapeHtml(statusLabel(change.field))}</th><td>${escapeHtml(JSON.stringify(change.before))}</td><td>${escapeHtml(JSON.stringify(change.after))}</td></tr>`).join('')}</tbody></table>` : '<p>No substantive differences.</p>'}`; return; } await transition(button.dataset.action); } catch (error) { showError(error); } });
$('#preview-enrichment').addEventListener('click', () => reviewEnrichment().catch(showError));
$$('[data-enrichment-close]').forEach((button) => button.addEventListener('click', () => $('#enrichment-dialog').close()));
$('#apply-enrichment').addEventListener('click', async () => { try { await api('/api/enrichment-apply', { method: 'POST', body: JSON.stringify({ commandId: commandId('enrichment') }) }); $('#enrichment-dialog').close(); await bootstrap(); if (state.selected) await selectResource(state.selected.resourceId); notice('Deterministic evidence updates applied.'); } catch (error) { showError(error); } });
$('#correction-review').addEventListener('click', async (event) => { if (!event.target.closest('#confirm-two-unchanged')) return; try { if (!await confirmTransition('Confirm that the actual content of both SawMaster dimension files remained unchanged? This records one governed correction, retains the original classifications, and invalidates the obsolete synthetic dispositions.')) return; const items = state.correctionCandidates.map((item) => ({ resourceId: item.resourceId, revisionId: item.currentRevisionId, expectedVersion: item.version })); await api('/api/bulk/correct-unchanged', { method: 'POST', body: JSON.stringify({ commandId: commandId('bulk-correction'), items, reason: 'PRODUCT_OWNER_CONFIRMED_ACTUAL_CONTENT_UNCHANGED', confirmed: true }) }); await bootstrap(); notice('Both classifications were corrected with retained history.'); } catch (error) { showError(error); } });
$('#export-registry').addEventListener('click', async () => { try { const archive = await api('/api/export'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' })); link.download = 'epic-l-policy2-resource-registry.json'; link.click(); URL.revokeObjectURL(link.href); notice('Resource registry exported.'); } catch (error) { showError(error); } });
$('#import-registry').addEventListener('change', async (event) => { try { const archive = JSON.parse(await event.target.files[0].text()); if (!await confirmTransition('Replace this isolated workspace with the validated backup? The current registry remains safe unless the entire archive validates.')) return; await api('/api/import', { method: 'POST', body: JSON.stringify({ commandId: commandId('import'), archive, replaceExisting: true }) }); state.selected = null; await bootstrap(); $('#detail-content').hidden = true; $('#detail-empty').hidden = false; notice('Validated registry restored.'); } catch (error) { showError(error); } finally { event.target.value = ''; } });
$('#reset-registry').addEventListener('click', async () => { try { if (!await confirmTransition('Reset the isolated workspace to the original nine B05 candidates? Export first if you need the current registry.')) return; await api('/api/reset', { method: 'POST', body: JSON.stringify({ commandId: commandId('reset'), confirmed: true }) }); state.selected = null; await bootstrap(); $('#detail-content').hidden = true; $('#detail-empty').hidden = false; notice('Workspace reset to the original candidates.'); } catch (error) { showError(error); } });
window.addEventListener('beforeunload', (event) => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });
function showError(error) { notice(`${error.code || 'ERROR'}: ${error.message}`); }
bootstrap().catch(showError);
