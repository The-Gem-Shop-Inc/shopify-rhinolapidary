'use strict';

const SESSION = { 'x-rhino-synthetic-session': 'B07_LOCAL_ISOLATED' };
const CATEGORIES = ['MANUAL','DYNAMIC_INSTRUCTION_DOCUMENT','DIAGRAM','SETUP_GUIDE','TUTORIAL_VIDEO','SAFETY_NOTICE'];
const HISTORICAL_APPROVAL_EVIDENCE = 'repository-evidence:data/epic-l-policy2-decision-receipt-r3.json#OPEN-09';
const state = { catalog: [], resources: [], selected: null, dirty: false };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const commandId = (prefix) => `${prefix}-${crypto.randomUUID()}`;

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...SESSION, ...(options.body ? {'content-type':'application/json'} : {}), ...(options.headers || {}) } });
  const payload = await response.json();
  if (!response.ok) throw Object.assign(new Error(payload.error?.message || 'Request failed'), payload.error || {});
  return payload.data;
}

function notice(message) {
  const node = $('#notice'); node.textContent = message; node.classList.add('visible');
  window.setTimeout(() => node.classList.remove('visible'), 3500);
}

function fillSelect(select, options, label, value) {
  select.innerHTML = `<option value="">${escapeHtml(label)}</option>` + options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('');
  select.value = value || '';
}

function productOptions() { return state.catalog.map((product) => ({ value: product.productGid, label: `${product.title} [${product.status}] · ${product.productGid}` })); }
function variantOptions(productGid = '') {
  const products = productGid ? state.catalog.filter((product) => product.productGid === productGid) : state.catalog;
  return products.flatMap((product) => product.variants.map((variant) => ({ value: variant.variantGid, label: `${product.title} / ${variant.title} · ${variant.variantGid}` })));
}

function assignmentRow(assignment = {}, index = 0) {
  const productId = `assignment-product-${index}`;
  const variantId = `assignment-variant-${index}`;
  const machineId = `assignment-machine-${index}`;
  const statusId = `assignment-status-${index}`;
  return `<div class="applicability-row" data-assignment>
    <label for="${productId}">Product<select id="${productId}" name="assignmentProduct"><option value="">Unassigned draft</option>${productOptions().map((option) => `<option value="${escapeHtml(option.value)}"${option.value === assignment.productGid ? ' selected':''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
    <label for="${variantId}">Variant<select id="${variantId}" name="assignmentVariant"><option value="">Unassigned draft</option>${variantOptions(assignment.productGid).map((option) => `<option value="${escapeHtml(option.value)}"${option.value === assignment.variantGid ? ' selected':''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
    <label for="${machineId}">Machine version<input id="${machineId}" name="assignmentMachineVersion" value="${escapeHtml(assignment.machineVersion || '')}"></label>
    <label for="${statusId}">Status<select id="${statusId}" name="assignmentApprovalStatus"><option${assignment.approvalStatus !== 'EXPLICITLY_APPROVED' ? ' selected':''}>OBSERVED_NOT_APPROVED</option><option${assignment.approvalStatus === 'EXPLICITLY_APPROVED' ? ' selected':''}>EXPLICITLY_APPROVED</option></select></label>
    <button class="remove-assignment" type="button" aria-label="Remove machine assignment ${index + 1}">Remove</button>
  </div>`;
}

function renderAssignments(assignments = [{}]) {
  const values = assignments.length ? assignments : [{}];
  $('#applicability-list').innerHTML = values.map(assignmentRow).join('');
}

async function bootstrap() {
  const data = await api('/api/bootstrap');
  state.catalog = data.catalog; state.resources = data.resources;
  $$('select[name="category"]').forEach((select) => fillSelect(select, CATEGORIES.map((value) => ({value,label:value.replaceAll('_',' ')})), select.closest('#filter-form') ? 'All categories' : 'Choose category', select.value));
  $$('select[name="productGid"]').forEach((select) => fillSelect(select, productOptions(), select.closest('#filter-form') ? 'All products' : 'Unassigned draft', select.value));
  $$('select[name="variantGid"]').forEach((select) => fillSelect(select, variantOptions(), select.closest('#filter-form') ? 'All variants' : 'Unassigned draft', select.value));
  renderList();
}

async function refreshList() {
  const params = new URLSearchParams(new FormData($('#filter-form')));
  for (const [key,value] of [...params]) if (!value) params.delete(key);
  state.resources = await api(`/api/resources?${params}`); renderList();
}

function renderList() {
  $('#inventory-count').textContent = `${state.resources.length} resource${state.resources.length === 1 ? '' : 's'} shown`;
  $('#resource-list').innerHTML = state.resources.length ? state.resources.map((row) => `<button class="resource-card" type="button" data-resource-id="${escapeHtml(row.resourceId)}" aria-current="${row.resourceId === state.selected?.resourceId}"><strong>${escapeHtml(row.title)}</strong><span class="meta"><span>${escapeHtml(row.category)}</span><span>${escapeHtml(row.currentRevisionId)}</span><span class="status${row.missingRequirements.length ? ' warning':''}">${escapeHtml(row.lifecycleStatus)}</span><span>${row.missingRequirements.length} missing</span></span></button>`).join('') : '<div class="empty-state"><strong>No resources match these filters.</strong><p>Clear a filter or create a new draft.</p></div>';
}

async function selectResource(resourceId) {
  state.selected = await api(`/api/resources/${encodeURIComponent(resourceId)}`); renderList(); renderDetail();
}

function renderDetail() {
  const record = state.selected; $('#detail-empty').hidden = true; const root = $('#detail-content'); root.hidden = false;
  const current = record.revisions.at(-1);
  const assignments = current.applicability.map((item) => `${item.machineVersion}: ${item.productGid} / ${item.variantGid} [${item.approvalStatus}]`).join('\n') || 'No assignment yet';
  root.innerHTML = `<div class="section-heading"><div><p class="eyebrow">${escapeHtml(record.origin.kind)}</p><h2>${escapeHtml(current.title)}</h2></div><button type="button" data-action="revise">Start revision</button></div>
    <div class="actions"><span class="status">${escapeHtml(current.lifecycleStatus)}</span><button class="secondary" type="button" data-action="historical">Bind Product Owner historical assertion</button><button class="secondary" type="button" data-action="technical">Record fresh synthetic disposition</button><button class="secondary" type="button" data-action="approve">Approve internally</button>${current.supersedesRevisionId ? '<button class="secondary" type="button" data-action="supersede">Supersede predecessor</button>':''}<button class="secondary" type="button" data-action="retire">Retire</button></div>
    <h3>Actionable requirements</h3>${current.missingRequirements.length ? `<div class="missing"><strong>Resolve before internal approval</strong><ul>${current.missingRequirements.map((item) => `<li>${escapeHtml(item.replaceAll('_',' ').toLowerCase())}</li>`).join('')}</ul></div>` : '<p>No internal evidence requirements are missing. Customer release remains blocked.</p>'}
    <h3>Current revision</h3><dl class="detail-grid"><div><dt>Administrative revision</dt><dd>${escapeHtml(current.revisionId)}</dd></div><div><dt>Immutable content identity</dt><dd>${escapeHtml(current.immutableRevisionIdentity || 'Unresolved')}</dd></div><div><dt>Editable source</dt><dd>${escapeHtml(current.editableSourceIdentity)}</dd></div><div><dt>Proposed delivery</dt><dd>${escapeHtml(current.proposedCustomerDeliveryLink || 'Unresolved')}</dd></div><div><dt>Provider</dt><dd>${escapeHtml(current.providerType || 'Unresolved')}</dd></div><div><dt>Language</dt><dd>${escapeHtml(current.language || 'Unresolved')}</dd></div><div><dt>Revision status</dt><dd>${escapeHtml(current.changeStatus)}</dd></div><div class="wide"><dt>Exact applicability</dt><dd><pre>${escapeHtml(assignments)}</pre></dd></div><div><dt>Rights</dt><dd>${escapeHtml(current.rightsDisposition.status)}</dd></div><div><dt>Accessibility</dt><dd>${escapeHtml(current.accessibilityDisposition.status)}</dd></div><div><dt>Availability</dt><dd>${escapeHtml(current.availabilityDisposition.status)} (synthetic; production not verified)</dd></div><div><dt>Technical evidence</dt><dd>${escapeHtml(current.technicalApproval?.eventType || 'Unresolved')}</dd></div></dl>
    <h3>Immutable revision history</h3><ol class="history">${record.revisions.slice().reverse().map((revision) => `<li><strong>Revision ${revision.sequence}: ${escapeHtml(revision.revisionId)}</strong><div class="meta"><span>${escapeHtml(revision.changeStatus)}</span><span>${escapeHtml(revision.lifecycleStatus)}</span><span>${escapeHtml(revision.createdAt)}</span></div>${record.revisions.length > 1 && revision.revisionId !== current.revisionId ? `<button class="secondary" type="button" data-action="compare" data-left="${escapeHtml(revision.revisionId)}" data-right="${escapeHtml(current.revisionId)}">Compare with current</button>`:''}</li>`).join('')}</ol><div id="comparison" aria-live="polite"></div>`;
}

function openResourceForm(mode) {
  const form = $('#resource-form'); form.reset(); $('#form-error').hidden = true;
  fillSelect(form.elements.category, CATEGORIES.map((value) => ({value,label:value.replaceAll('_',' ')})), 'Choose category');
  form.elements.changeStatus.value = mode === 'new' ? 'NEW_DRAFT' : 'CHANGED_CONTENT';
  $('#dialog-heading').textContent = mode === 'new' ? 'Create draft' : 'Start immutable revision';
  if (mode === 'revision') {
    const current = state.selected.revisions.at(-1); const assignment = current.applicability[0] || {};
    for (const name of ['title','category','language','editableSourceIdentity','proposedCustomerDeliveryLink','immutableRevisionIdentity']) form.elements[name].value = current[name] || '';
    form.elements.resourceId.value = state.selected.resourceId; form.elements.baseRevisionId.value = current.revisionId; form.elements.expectedVersion.value = state.selected.version;
    form.elements.providerType.value = current.providerType || '';
    renderAssignments(current.applicability);
    form.elements.rightsStatus.value = current.rightsDisposition.status; form.elements.accessibilityStatus.value = current.accessibilityDisposition.status; form.elements.availabilityStatus.value = current.availabilityDisposition.status;
    form.elements.changeReason.value = 'B07_RESOURCE_REVISION_UPDATE';
  } else renderAssignments();
  state.dirty = false; $('#resource-dialog').showModal(); form.elements.title.focus();
}

function formInput(form) {
  const evidenceRefs = form.elements.evidenceRefs.value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  const applicability = $$('[data-assignment]', form).map((row) => ({ productGid:$('[name="assignmentProduct"]',row).value, variantGid:$('[name="assignmentVariant"]',row).value, machineVersion:$('[name="assignmentMachineVersion"]',row).value, approvalStatus:$('[name="assignmentApprovalStatus"]',row).value })).filter((assignment) => assignment.productGid || assignment.variantGid || assignment.machineVersion);
  const syntheticAvailable = form.elements.availabilityStatus.value === 'SYNTHETIC_AVAILABLE';
  return { title:form.elements.title.value, category:form.elements.category.value, language:form.elements.language.value || null, editableSourceIdentity:form.elements.editableSourceIdentity.value, proposedCustomerDeliveryLink:form.elements.proposedCustomerDeliveryLink.value || null, immutableRevisionIdentity:form.elements.immutableRevisionIdentity.value || null, providerType:form.elements.providerType.value || null, changeStatus:form.elements.changeStatus.value, changeReason:form.elements.changeReason.value, changeEvidenceRefs:evidenceRefs.length ? evidenceRefs : ['B07_SYNTHETIC_ADMIN_FORM'], applicability, rightsDisposition:{status:form.elements.rightsStatus.value,evidenceRefs}, accessibilityDisposition:{status:form.elements.accessibilityStatus.value,evidenceRefs}, availabilityDisposition:{status:form.elements.availabilityStatus.value,checkedAt:syntheticAvailable ? new Date().toISOString():null,evidenceRefs:syntheticAvailable && !evidenceRefs.length ? ['B07_SYNTHETIC_CHECK']:evidenceRefs,synthetic:true,productionVerified:false} };
}

async function saveResource(event) {
  event.preventDefault(); const form = event.currentTarget; const input = formInput(form);
  try {
    const resourceId = form.elements.resourceId.value;
    const result = resourceId ? await api(`/api/resources/${encodeURIComponent(resourceId)}/revisions`, {method:'POST',body:JSON.stringify({commandId:commandId('revision'),expectedVersion:Number(form.elements.expectedVersion.value),baseRevisionId:form.elements.baseRevisionId.value,input})}) : await api('/api/resources',{method:'POST',body:JSON.stringify({commandId:commandId('draft'),input})});
    state.dirty = false; $('#resource-dialog').close(); await refreshList(); await selectResource(result.resourceId); notice('Governed revision saved.');
  } catch (error) { const node=$('#form-error'); node.textContent=`${error.code || 'ERROR'}: ${error.message}`; node.hidden=false; node.focus(); }
}

async function confirmTransition(message) { const dialog=$('#confirmation-dialog'); $('#confirmation-copy').textContent=message; dialog.showModal(); return new Promise((resolve) => dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true})); }
async function transition(action) {
  const record=state.selected,current=record.revisions.at(-1); let result;
  if (action==='historical') result=await api(`/api/resources/${encodeURIComponent(record.resourceId)}/historical-approval`,{method:'POST',body:JSON.stringify({commandId:commandId('historical'),expectedVersion:record.version,revisionId:current.revisionId,approvalEvidenceReference:HISTORICAL_APPROVAL_EVIDENCE,authorityLimitations:['PRODUCTION_IDENTITY_UNVERIFIED','CUSTOMER_RELEASE_NOT_AUTHORIZED']})});
  if (action==='technical') result=await api(`/api/resources/${encodeURIComponent(record.resourceId)}/technical-disposition`,{method:'POST',body:JSON.stringify({commandId:commandId('technical'),expectedVersion:record.version,revisionId:current.revisionId,evidenceRefs:['B07_SYNTHETIC_TECHNICAL_DISPOSITION']})});
  if (action==='approve' && await confirmTransition('Record internal approval? This does not authorize customer release or production availability.')) result=await api(`/api/resources/${encodeURIComponent(record.resourceId)}/approve-internal`,{method:'POST',body:JSON.stringify({commandId:commandId('approve'),expectedVersion:record.version,revisionId:current.revisionId,reason:'B07_INTERNAL_RESOURCE_ADMINISTRATION',evidenceRefs:['B07_SYNTHETIC_ACCEPTANCE']})});
  if (action==='retire' && await confirmTransition('Retire this revision while retaining all evidence and history?')) result=await api(`/api/resources/${encodeURIComponent(record.resourceId)}/retire`,{method:'POST',body:JSON.stringify({commandId:commandId('retire'),expectedVersion:record.version,revisionId:current.revisionId,reason:'B07_ADMINISTRATIVE_RETIREMENT',evidenceRefs:['B07_SYNTHETIC_ADMIN_ACTION']})});
  if (action==='supersede' && await confirmTransition('Supersede the predecessor while retaining both immutable revisions and all evidence?')) result=await api(`/api/resources/${encodeURIComponent(record.resourceId)}/supersede`,{method:'POST',body:JSON.stringify({commandId:commandId('supersede'),expectedVersion:record.version,previousRevisionId:current.supersedesRevisionId,replacementRevisionId:current.revisionId,reason:'B07_RESOURCE_REPLACEMENT',evidenceRefs:['B07_SYNTHETIC_ADMIN_ACTION']})});
  if (result) { state.selected=result; await refreshList(); renderDetail(); notice('Transition recorded with append-only evidence.'); }
}

$('#filter-form').addEventListener('input', refreshList);
$('#resource-list').addEventListener('click',(event)=>{const button=event.target.closest('[data-resource-id]');if(button)selectResource(button.dataset.resourceId).catch(showError);});
$('#new-resource').addEventListener('click',()=>openResourceForm('new'));
$('#resource-form').addEventListener('input',()=>{state.dirty=true;}); $('#resource-form').addEventListener('submit',saveResource);
$$('[data-close]').forEach((button)=>button.addEventListener('click',()=>{if(!state.dirty||window.confirm('Discard unsaved changes?')){$('#resource-dialog').close();state.dirty=false;}}));
$('#resource-dialog').addEventListener('cancel',(event)=>{if(state.dirty&&!window.confirm('Discard unsaved changes?'))event.preventDefault();else state.dirty=false;});
$('#add-applicability').addEventListener('click',()=>{const assignments=$$('[data-assignment]').map((row)=>({productGid:$('[name="assignmentProduct"]',row).value,variantGid:$('[name="assignmentVariant"]',row).value,machineVersion:$('[name="assignmentMachineVersion"]',row).value,approvalStatus:$('[name="assignmentApprovalStatus"]',row).value}));assignments.push({});renderAssignments(assignments);state.dirty=true;});
$('#applicability-list').addEventListener('click',(event)=>{const button=event.target.closest('.remove-assignment');if(!button)return;button.closest('[data-assignment]').remove();if(!$('#applicability-list').children.length)renderAssignments();state.dirty=true;});
$('#applicability-list').addEventListener('change',(event)=>{if(event.target.name!=='assignmentProduct')return;const row=event.target.closest('[data-assignment]');fillSelect($('[name="assignmentVariant"]',row),variantOptions(event.target.value),'Unassigned draft');});
$('#detail-content').addEventListener('click',async(event)=>{const button=event.target.closest('[data-action]');if(!button)return;try{if(button.dataset.action==='revise')return openResourceForm('revision');if(button.dataset.action==='compare'){const comparison=await api(`/api/resources/${encodeURIComponent(state.selected.resourceId)}/compare?left=${encodeURIComponent(button.dataset.left)}&right=${encodeURIComponent(button.dataset.right)}`);$('#comparison').innerHTML=`<h4>Revision comparison</h4>${comparison.changes.length ? `<table class="comparison-table"><thead><tr><th scope="col">Field</th><th scope="col">Earlier revision</th><th scope="col">Current revision</th></tr></thead><tbody>${comparison.changes.map((change)=>`<tr><th scope="row">${escapeHtml(change.field)}</th><td>${escapeHtml(JSON.stringify(change.before))}</td><td>${escapeHtml(JSON.stringify(change.after))}</td></tr>`).join('')}</tbody></table>`:'<p>No substantive differences.</p>'}`;return;}await transition(button.dataset.action);}catch(error){showError(error);}});
$('#export-registry').addEventListener('click',async()=>{try{const archive=await api('/api/export');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([JSON.stringify(archive,null,2)],{type:'application/json'}));link.download='epic-l-policy2-resource-registry.json';link.click();URL.revokeObjectURL(link.href);notice('Synthetic resource registry exported.');}catch(error){showError(error);}});
$('#import-registry').addEventListener('change',async(event)=>{try{const archive=JSON.parse(await event.target.files[0].text());if(!await confirmTransition('Replace this isolated demonstration registry with the validated backup? Current in-memory data will be replaced only after full validation.'))return;await api('/api/import',{method:'POST',body:JSON.stringify({commandId:commandId('import'),archive,replaceExisting:true})});notice('Validated synthetic archive restored.');state.selected=null;await refreshList();$('#detail-content').hidden=true;$('#detail-empty').hidden=false;}catch(error){showError(error);}finally{event.target.value='';}});
window.addEventListener('beforeunload',(event)=>{if(state.dirty){event.preventDefault();event.returnValue='';}});
function showError(error){notice(`${error.code || 'ERROR'}: ${error.message}`);}
bootstrap().catch(showError);
