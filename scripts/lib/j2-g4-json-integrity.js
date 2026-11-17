'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { TextDecoder } = require('node:util');

const SHOPIFY_HEADERS = Object.freeze({
  language: [
    '/*',
    ' * ------------------------------------------------------------',
    ' * IMPORTANT: The contents of this file are auto-generated.',
    ' *',
    ' * This file may be updated by the Shopify admin language editor',
    ' * or related systems. Please exercise caution as any changes',
    ' * made to this file may be overwritten.',
    ' * ------------------------------------------------------------',
    ' */',
  ].join('\n'),
  theme: [
    '/*',
    ' * ------------------------------------------------------------',
    ' * IMPORTANT: The contents of this file are auto-generated.',
    ' *',
    ' * This file may be updated by the Shopify admin theme editor',
    ' * or related systems. Please exercise caution as any changes',
    ' * made to this file may be overwritten.',
    ' * ------------------------------------------------------------',
    ' */',
  ].join('\n'),
});

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function decodeUtf8(value, label = 'JSON input') {
  if (Buffer.isBuffer(value)) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(value);
    } catch (error) {
      throw new SyntaxError(`${label}: invalid UTF-8 (${error.message})`);
    }
  }
  return String(value);
}

function stripApprovedShopifyHeader(text, { allowShopifyHeader = false, label = 'JSON input' } = {}) {
  if (!text.startsWith('/*')) return { jsonText: text, headerKind: null, headerBytes: 0 };
  assert(allowShopifyHeader, `${label}: comments are not permitted`);
  const end = text.indexOf('*/');
  assert(end >= 0, `${label}: unterminated leading comment`);
  let bodyIndex = end + 2;
  if (text.startsWith('\r\n', bodyIndex)) bodyIndex += 2;
  else if (text.startsWith('\n', bodyIndex)) bodyIndex += 1;
  const rawHeader = text.slice(0, end + 2);
  const normalized = rawHeader.replace(/\r\n/g, '\n');
  const entry = Object.entries(SHOPIFY_HEADERS).find(([, header]) => header === normalized);
  assert(entry, `${label}: unapproved leading comment`);
  return {
    jsonText: text.slice(bodyIndex),
    headerKind: entry[0],
    headerBytes: Buffer.byteLength(text.slice(0, bodyIndex), 'utf8'),
  };
}

function normalizeNumber(raw) {
  const match = /^(-?)(0|[1-9]\d*)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(raw);
  assert(match, `Invalid JSON number: ${raw}`);
  const negative = match[1] === '-';
  const fraction = match[3] || '';
  let digits = `${match[2]}${fraction}`.replace(/^0+/, '');
  let exponent = Number(match[4] || 0) - fraction.length;
  assert(Number.isSafeInteger(exponent), `JSON number exponent is outside the supported deterministic range: ${raw}`);
  if (!digits) return '0e0';
  while (digits.endsWith('0')) {
    digits = digits.slice(0, -1);
    exponent += 1;
  }
  return `${negative ? '-' : ''}${digits}e${exponent}`;
}

class StrictJsonParser {
  constructor(text, label) {
    this.text = text;
    this.label = label;
    this.index = 0;
  }

  fail(message) {
    throw new SyntaxError(`${this.label}: ${message} at offset ${this.index}`);
  }

  skipWhitespace() {
    while (/[\u0009\u000a\u000d\u0020]/.test(this.text[this.index] || '')) this.index += 1;
  }

  parse() {
    this.skipWhitespace();
    const node = this.parseValue();
    this.skipWhitespace();
    if (this.index !== this.text.length) this.fail('unexpected trailing content');
    return node;
  }

  parseValue() {
    this.skipWhitespace();
    const char = this.text[this.index];
    if (char === '{') return this.parseObject();
    if (char === '[') return this.parseArray();
    if (char === '"') return { type: 'string', value: this.parseString() };
    if (char === 't') return this.parseKeyword('true', { type: 'boolean', value: true });
    if (char === 'f') return this.parseKeyword('false', { type: 'boolean', value: false });
    if (char === 'n') return this.parseKeyword('null', { type: 'null', value: null });
    if (char === '-' || /\d/.test(char || '')) return this.parseNumber();
    this.fail('expected a JSON value');
  }

  parseKeyword(keyword, node) {
    if (this.text.slice(this.index, this.index + keyword.length) !== keyword) this.fail(`expected ${keyword}`);
    this.index += keyword.length;
    return node;
  }

  parseString() {
    const start = this.index;
    this.index += 1;
    let escaped = false;
    while (this.index < this.text.length) {
      const code = this.text.charCodeAt(this.index);
      const char = this.text[this.index];
      if (!escaped && char === '"') {
        this.index += 1;
        const token = this.text.slice(start, this.index);
        try {
          return JSON.parse(token);
        } catch (error) {
          this.fail(`invalid JSON string (${error.message})`);
        }
      }
      if (!escaped && code < 0x20) this.fail('unescaped control character in string');
      if (!escaped && char === '\\') escaped = true;
      else escaped = false;
      this.index += 1;
    }
    this.fail('unterminated string');
  }

  parseNumber() {
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(this.text.slice(this.index));
    if (!match) this.fail('invalid JSON number');
    this.index += match[0].length;
    return { type: 'number', raw: match[0], normalized: normalizeNumber(match[0]) };
  }

  parseArray() {
    this.index += 1;
    const items = [];
    this.skipWhitespace();
    if (this.text[this.index] === ']') {
      this.index += 1;
      return { type: 'array', items };
    }
    while (true) {
      items.push(this.parseValue());
      this.skipWhitespace();
      const char = this.text[this.index];
      if (char === ']') {
        this.index += 1;
        return { type: 'array', items };
      }
      if (char !== ',') this.fail('expected comma or closing bracket');
      this.index += 1;
    }
  }

  parseObject() {
    this.index += 1;
    const entries = [];
    const keys = new Set();
    this.skipWhitespace();
    if (this.text[this.index] === '}') {
      this.index += 1;
      return { type: 'object', entries };
    }
    while (true) {
      this.skipWhitespace();
      if (this.text[this.index] !== '"') this.fail('expected an object key');
      const key = this.parseString();
      if (keys.has(key)) this.fail(`duplicate object key ${JSON.stringify(key)}`);
      keys.add(key);
      this.skipWhitespace();
      if (this.text[this.index] !== ':') this.fail('expected colon after object key');
      this.index += 1;
      entries.push([key, this.parseValue()]);
      this.skipWhitespace();
      const char = this.text[this.index];
      if (char === '}') {
        this.index += 1;
        return { type: 'object', entries };
      }
      if (char !== ',') this.fail('expected comma or closing brace');
      this.index += 1;
    }
  }
}

function canonicalizeNode(node) {
  switch (node.type) {
    case 'null': return 'n';
    case 'boolean': return node.value ? 'b1' : 'b0';
    case 'number': return `d${node.normalized};`;
    case 'string': return `s${JSON.stringify(node.value)};`;
    case 'array': return `a[${node.items.map(canonicalizeNode).join('')}]`;
    case 'object': {
      const sorted = [...node.entries].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
      return `o{${sorted.map(([key, value]) => `${JSON.stringify(key)}:${canonicalizeNode(value)}`).join('')}}`;
    }
    default: throw new Error(`Unknown JSON node type: ${node.type}`);
  }
}

function parseJsonDocument(value, options = {}) {
  const text = decodeUtf8(value, options.label);
  const stripped = stripApprovedShopifyHeader(text, options);
  const ast = new StrictJsonParser(stripped.jsonText, options.label || 'JSON input').parse();
  let parsed;
  try {
    parsed = JSON.parse(stripped.jsonText);
  } catch (error) {
    throw new SyntaxError(`${options.label || 'JSON input'}: ${error.message}`);
  }
  const canonical = canonicalizeNode(ast);
  return {
    value: parsed,
    canonical,
    semanticDigest: sha256(Buffer.from(canonical, 'utf8')),
    headerKind: stripped.headerKind,
    headerBytes: stripped.headerBytes,
  };
}

function flattenLeaves(value, prefix = '', output = {}) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenLeaves(item, `${prefix}[${index}]`, output));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      flattenLeaves(item, prefix ? `${prefix}.${key}` : key, output);
    }
  } else {
    output[prefix] = value;
  }
  return output;
}

module.exports = {
  SHOPIFY_HEADERS,
  canonicalizeNode,
  decodeUtf8,
  flattenLeaves,
  normalizeNumber,
  parseJsonDocument,
  sha256,
  stripApprovedShopifyHeader,
};
