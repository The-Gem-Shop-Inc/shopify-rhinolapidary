'use strict';
// Passive CLI endpoint observer. Never prints the URL/identifier, bodies or headers.
for (const module of [require('node:https'), require('node:http')]) {
  const original = module.request;
  module.request = function (...args) {
    const request = original.apply(this, args);
    if (!request.path?.startsWith('/theme_preview.json')) return request;
    request.on('response', response => {
      process.stderr.write('__RHINO_PREVIEW_RESPONSE__' + JSON.stringify({
        status: response.statusCode, requestId: response.headers['x-request-id'] || null,
        target: new URL(request.path, 'https://redacted.invalid').searchParams.get('preview_theme_id'),
      }) + '\n');
    });
    return request;
  };
}
