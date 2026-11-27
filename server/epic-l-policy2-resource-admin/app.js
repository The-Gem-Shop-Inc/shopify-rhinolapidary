'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');
const { Policy2DomainError } = require('../../scripts/lib/epic-l-policy2/common');
const { createB07ResourceAdminSystem } = require('../../scripts/lib/epic-l-policy2/resource-admin-fixture');

const SESSION_HEADER = 'x-rhino-synthetic-session';
const SESSION_VALUE = 'B07_LOCAL_ISOLATED';
const MAX_REQUEST_BYTES = 1_000_000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const STATIC_FILES = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
]);

function sendJson(response, status, value) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  const declaredLength = Number(request.headers['content-length'] || 0);
  if (declaredLength > MAX_REQUEST_BYTES) throw Object.assign(new Error('Request body is too large'), { code: 'REQUEST_TOO_LARGE', status: 413 });
  if (!String(request.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    throw Object.assign(new Error('API writes require application/json'), { code: 'JSON_CONTENT_TYPE_REQUIRED', status: 415 });
  }
  let text = '';
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_REQUEST_BYTES) throw Object.assign(new Error('Request body is too large'), { code: 'REQUEST_TOO_LARGE', status: 413 });
    text += chunk;
  }
  if (!text) return {};
  try { return JSON.parse(text); } catch { throw Object.assign(new Error('Request body must be valid JSON'), { code: 'INVALID_JSON' }); }
}

function routeRequest(system, method, pathname, query, body) {
  const admin = system.administration;
  const productOwner = system.actors.productOwner;
  const technical = system.actors.technical;
  if (method === 'GET' && pathname === '/api/bootstrap') return {
    mode: 'ISOLATED_SYNTHETIC_RESOURCE_ADMINISTRATION',
    productionIdentityBound: false,
    customerReleaseAuthorized: false,
    resources: admin.search(Object.fromEntries(query)),
    catalog: admin.catalogOptions(),
    activation: system.activation,
  };
  if (method === 'GET' && pathname === '/api/resources') return admin.search(Object.fromEntries(query));
  const detail = pathname.match(/^\/api\/resources\/([^/]+)$/);
  if (method === 'GET' && detail) return admin.detail(decodeURIComponent(detail[1]));
  const compare = pathname.match(/^\/api\/resources\/([^/]+)\/compare$/);
  if (method === 'GET' && compare) return admin.compare(decodeURIComponent(compare[1]), query.get('left'), query.get('right'));
  if (method === 'POST' && pathname === '/api/resources') return admin.createDraft({ ...body, actor: productOwner });
  const revision = pathname.match(/^\/api\/resources\/([^/]+)\/revisions$/);
  if (method === 'POST' && revision) return admin.startRevision({ ...body, actor: productOwner, resourceId: decodeURIComponent(revision[1]) });
  const historical = pathname.match(/^\/api\/resources\/([^/]+)\/historical-approval$/);
  if (method === 'POST' && historical) return admin.recordHistoricalApprovalAssertion({ ...body, actor: productOwner, resourceId: decodeURIComponent(historical[1]) });
  const technicalDisposition = pathname.match(/^\/api\/resources\/([^/]+)\/technical-disposition$/);
  if (method === 'POST' && technicalDisposition) return admin.recordFreshTechnicalDisposition({ ...body, actor: technical, resourceId: decodeURIComponent(technicalDisposition[1]) });
  const approve = pathname.match(/^\/api\/resources\/([^/]+)\/approve-internal$/);
  if (method === 'POST' && approve) return admin.approveInternal({ ...body, actor: productOwner, technicalActor: technical, resourceId: decodeURIComponent(approve[1]) });
  const supersede = pathname.match(/^\/api\/resources\/([^/]+)\/supersede$/);
  if (method === 'POST' && supersede) return admin.supersede({ ...body, actor: productOwner, resourceId: decodeURIComponent(supersede[1]) });
  const retire = pathname.match(/^\/api\/resources\/([^/]+)\/retire$/);
  if (method === 'POST' && retire) return admin.retire({ ...body, actor: productOwner, resourceId: decodeURIComponent(retire[1]) });
  if (method === 'GET' && pathname === '/api/export') return admin.exportRegistry({ actor: productOwner });
  if (method === 'POST' && pathname === '/api/import') return admin.importRegistry({ ...body, actor: productOwner });
  if (method === 'POST' && pathname === '/api/publication') return admin.assertCustomerPublicationBlocked();
  if (method === 'POST' && pathname === '/api/storefront-mutation') return admin.attemptStorefrontMutation();
  throw Object.assign(new Error('Route not found'), { code: 'ROUTE_NOT_FOUND', status: 404 });
}

function createResourceAdminServer({ rootDir = path.resolve(__dirname, '../..'), system } = {}) {
  const localSystem = system || createB07ResourceAdminSystem({ rootDir });
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    try {
      const host = String(request.headers.host || '');
      if (!/^(?:127\.0\.0\.1|localhost)(?::\d{1,5})?$/.test(host)) {
        return sendJson(response, 403, { error: { code: 'LOCAL_HOST_REQUIRED', message: 'B07 accepts only an explicit loopback Host.' } });
      }
      if (!url.pathname.startsWith('/api/')) {
        const target = STATIC_FILES.get(url.pathname);
        if (!target || request.method !== 'GET') return sendJson(response, 404, { error: { code: 'NOT_FOUND', message: 'Not found' } });
        const [filename, contentType] = target;
        response.writeHead(200, {
          'content-type': contentType,
          'cache-control': 'no-store',
          'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
          'x-content-type-options': 'nosniff',
        });
        return response.end(fs.readFileSync(path.join(PUBLIC_DIR, filename)));
      }
      if (request.headers[SESSION_HEADER] !== SESSION_VALUE) {
        return sendJson(response, 403, { error: { code: 'ISOLATED_SESSION_REQUIRED', message: 'The explicit B07 isolated synthetic session header is required.' } });
      }
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const expectedOrigin = `http://${host}`;
        if (request.headers.origin !== expectedOrigin) {
          return sendJson(response, 403, { error: { code: 'LOCAL_ORIGIN_REQUIRED', message: 'B07 writes require the exact loopback origin.' } });
        }
      }
      const body = ['POST', 'PUT', 'PATCH'].includes(request.method) ? await readJson(request) : {};
      const value = routeRequest(localSystem, request.method, url.pathname, url.searchParams, body);
      return sendJson(response, 200, { data: value });
    } catch (error) {
      const status = error.status || (error.code === 'ROUTE_NOT_FOUND' ? 404 : error.name === 'AuthorizationError' || error.name === 'ActivationError' ? 403 : error.name === 'ConflictError' ? 409 : 400);
      return sendJson(response, status, { error: { code: error.code || 'B07_REQUEST_FAILED', message: error.message, details: error instanceof Policy2DomainError ? error.details : {} } });
    }
  });
}

module.exports = { MAX_REQUEST_BYTES, SESSION_HEADER, SESSION_VALUE, createResourceAdminServer, routeRequest };
