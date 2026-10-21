'use strict';
// Observer only: never intercepts, aborts, fulfills, or blocks browser traffic.
function classifyRequest(input) {
  const type = String(input.resourceType || input.type || 'other').toLowerCase();
  const method = String(input.method || 'GET').toUpperCase();
  const url = new URL(input.url);
  let pathname; try { pathname = decodeURIComponent(url.pathname); } catch { pathname = url.pathname; }
  const mutationMethod = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const bodyPresent = !!(input.bodyPresent || input.postData || input.hasPostData);
  const navigation = type === 'document' && !!input.isNavigation;
  const answer = (classification, reason) => ({ action: classification === 'TRANSACTION' ? 'INVALIDATE' : 'ALLOW', classification, reason, resourceType: type, method, bodyPresent, navigation });
  const commerceMutation = /\/cart\/(?:add|change|update|clear)(?:\.js)?(?:\/|$)/i.test(pathname) ||
    /\/orders?(?:\.json)?(?:\/|$)/i.test(pathname) ||
    /\/checkouts?(?:\/(?:action|complete|process|payment|pay|orders?))?(?:\.json)?$/i.test(pathname) ||
    /\/(?:pay|payments?)\/(?:transaction|confirm|complete|process|authorize|capture)(?:\/|$)/i.test(pathname);
  const formMutation = /\/(?:contact|account|customers?)(?:\/|$)/i.test(pathname);
  if (mutationMethod && (commerceMutation || formMutation)) return answer('TRANSACTION', 'Mutation-capable method on commerce/customer/form endpoint');
  if (bodyPresent && /form_type["=:\s]+(?:contact|customer|create_customer)/i.test(input.postData || '')) return answer('TRANSACTION', 'Customer/contact form body');
  if (navigation && input.isMainFrame === true && /\/(?:cart\/(?:add|change|update|clear)|checkout|checkouts|orders?|pay|payments?)(?:[/.]|$)/i.test(pathname)) return answer('TRANSACTION', 'Top-level commerce document navigation');
  return answer('PASSIVE_RESOURCE', mutationMethod ? 'Existing non-commerce native/telemetry request' : 'Passive GET/HEAD/OPTIONS resource');
}
function expectedNavigation(actual, expected) {
  try { const a = new URL(actual), e = new URL(expected); return a.origin === e.origin && a.pathname === e.pathname && a.search === e.search; } catch { return false; }
}
module.exports = { classifyRequest, expectedNavigation };
