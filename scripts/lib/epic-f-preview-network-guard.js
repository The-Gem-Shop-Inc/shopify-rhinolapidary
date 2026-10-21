'use strict';
// Diagnostic request policy; no storefront imports or instrumentation.
const VIDEO_HOST = /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|vimeocdn\.com|wistia\.com|wistia\.net)$/i;
const F_EVENT = /epic[-_]f|rhino[-_]machine[-_]event|machine_(?:resource|video|gallery|specification|context|delivery)|product_resource_(?:open|download)|rhino:(?:machine|resource)/i;
function classifyRequest(input) {
  const url = new URL(input.url || 'https://guard.invalid' + input.pathname);
  const decode = s => {try{return decodeURIComponent(s||'');}catch{return s||'';}};
  const pathname = decode(url.pathname), method = (input.method || 'GET').toUpperCase();
  const type = input.resourceType || 'other', headers = input.headers || {};
  const purpose = String(headers['sec-purpose'] || headers.purpose || '').toLowerCase();
  const passive = method === 'GET' && !input.isNavigation &&
    (['stylesheet','script','font','image','media'].includes(type) || /prefetch|preload/.test(purpose));
  const answer = (action, reason) => ({ action, reason, passive, purpose: purpose ? /prefetch/.test(purpose) ? 'prefetch' : 'preload' : null });
  // A preload header never bypasses the prohibited-request checks.
  if (/\/cart\/(add|change|update|clear)(?:\.js)?(?:\/|$)/i.test(pathname) ||
      (!['GET','HEAD'].includes(method) && (/\/(cart|contact|orders?)(?:\/|$)/i.test(pathname)||/form_type["=:\s]+contact/i.test(decode(input.postData))))) return answer('BLOCK','TRANSACTIONAL_MUTATION');
  if (/\/(checkout|checkouts)(?:\/|$)/i.test(pathname)) {
    const nativeAsset = /^\/checkouts\/internal\/.+\.(js|css|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|avif)$/i.test(pathname);
    if (!(nativeAsset && passive)) return answer('BLOCK','CHECKOUT_NAVIGATION_OR_ACTION');
  }
  if (input.explicitDownload || /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z)(?:$|\/)/i.test(pathname) ||
      /\/(manuals?|downloads?|support_files)(?:\/|$)/i.test(pathname) || /application\/(pdf|msword)/i.test(headers.accept || '')) return answer('BLOCK','GOVERNED_OR_UNREQUESTED_DOCUMENT');
  if (VIDEO_HOST.test(url.hostname)) return answer('BLOCK','EAGER_VIDEO_PROVIDER');
  if (F_EVENT.test(pathname) || F_EVENT.test(decode(url.search)) || F_EVENT.test(decode(input.postData)) || F_EVENT.test(input.eventName||'')) return answer('BLOCK','UNEXPECTED_F_ANALYTICS');
  if (passive) return answer('ALLOW','PASSIVE_NATIVE_OR_STOREFRONT_RESOURCE');
  return answer('ALLOW','READ_ONLY_OR_EXISTING_NATIVE_SURFACE');
}
module.exports = { classifyRequest, F_EVENT };
