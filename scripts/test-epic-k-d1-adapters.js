'use strict';

const assert = require('assert/strict');
const {
  CLAIM_LEASE_MS,
  createD1IdempotencyStore,
  createD1RateLimiter,
} = require('../server/epic-k-draft-order/d1-adapters');

class FakeD1 {
  constructor() {
    this.claims = new Map();
    this.references = new Map();
    this.rates = new Map();
  }

  prepare(sql) {
    const normalized = sql.replace(/\s+/g, ' ').trim();
    const database = this;
    return {
      bind(...values) {
        return {
          async run() { return database.run(normalized, values); },
          async first() { return database.first(normalized, values); },
        };
      },
    };
  }

  result(changes) { return { success: true, meta: { changes } }; }

  run(sql, values) {
    if (sql.startsWith('DELETE FROM quote_rate_windows')) return this.result(0);
    if (sql.startsWith('INSERT INTO quote_submission_claims')) {
      const [key, hash, reference, lease, now] = values;
      if (this.claims.has(key)) return this.result(0);
      if (this.references.has(reference)) throw new Error('UNIQUE constraint failed: quote_reference');
      const row = {
        idempotency_key: key, payload_hash: hash, quote_reference: reference,
        state: 'CLAIMED', attempt_count: 1, lease_expires_at: lease,
        draft_id: null, draft_name: null, error_code: null,
        created_at: now, updated_at: now,
      };
      this.claims.set(key, row);
      this.references.set(reference, key);
      return this.result(1);
    }

    const row = this.claims.get(values[0]);
    if (!row || row.payload_hash !== values[1]) return this.result(0);
    if (sql.includes("SET state = 'UNCERTAIN', error_code = 'MUTATION_LEASE_EXPIRED'")) {
      if (row.state !== 'MUTATING' || row.lease_expires_at > values[2]) return this.result(0);
      Object.assign(row, { state: 'UNCERTAIN', error_code: 'MUTATION_LEASE_EXPIRED', lease_expires_at: 0, updated_at: values[2] });
      return this.result(1);
    }
    if (sql.includes("SET state = 'CLAIMED', attempt_count")) {
      const [, , reference, lease, now] = values;
      if (row.quote_reference !== reference) return this.result(0);
      if (!(row.state === 'FAILED_RETRYABLE' || (row.state === 'CLAIMED' && row.lease_expires_at <= now))) return this.result(0);
      Object.assign(row, { state: 'CLAIMED', attempt_count: row.attempt_count + 1, lease_expires_at: lease, error_code: null, updated_at: now });
      return this.result(1);
    }
    if (sql.includes("SET state = 'MUTATING'")) {
      if (row.state !== 'CLAIMED') return this.result(0);
      Object.assign(row, { state: 'MUTATING', updated_at: values[2], lease_expires_at: values[3] });
      return this.result(1);
    }
    if (sql.includes("SET state = 'COMPLETED'")) {
      if (!['MUTATING', 'UNCERTAIN'].includes(row.state)) return this.result(0);
      Object.assign(row, { state: 'COMPLETED', draft_id: values[2], draft_name: values[3], error_code: null, lease_expires_at: 0, updated_at: values[4] });
      return this.result(1);
    }
    if (sql.includes("SET state = 'FAILED_RETRYABLE'")) {
      if (!['CLAIMED', 'MUTATING'].includes(row.state)) return this.result(0);
      Object.assign(row, { state: 'FAILED_RETRYABLE', error_code: values[2], lease_expires_at: 0, updated_at: values[3] });
      return this.result(1);
    }
    if (sql.includes("SET state = 'UNCERTAIN'")) {
      if (row.state !== 'MUTATING') return this.result(0);
      Object.assign(row, { state: 'UNCERTAIN', error_code: values[2], lease_expires_at: 0, updated_at: values[3] });
      return this.result(1);
    }
    throw new Error(`Unsupported FakeD1 run statement: ${sql}`);
  }

  first(sql, values) {
    if (sql.startsWith('SELECT idempotency_key')) return { ...this.claims.get(values[0]) };
    if (sql.startsWith('INSERT INTO quote_rate_windows')) {
      const rateKey = `${values[0]}:${values[1]}`;
      const count = (this.rates.get(rateKey) || 0) + 1;
      this.rates.set(rateKey, count);
      return { request_count: count };
    }
    throw new Error(`Unsupported FakeD1 first statement: ${sql}`);
  }
}

async function main() {
  let passed = 0;
  const test = async (name, fn) => {
    await fn();
    passed += 1;
    console.log(`PASS ${name}`);
  };

  await test('concurrent identical claims acquire exactly one execution lease', async () => {
    const store = createD1IdempotencyStore(new FakeD1());
    const input = { key: 'claim-1', payloadHash: 'hash-a', reference: 'KQ-CONCUR1-1', now: 1000 };
    const states = await Promise.all([store.claim(input), store.claim(input), store.claim(input)]);
    assert.equal(states.filter((entry) => entry.state === 'ACQUIRED').length, 1);
    assert.equal(states.filter((entry) => entry.state === 'IN_PROGRESS').length, 2);
  });

  await test('duplicate reference with different payload is rejected as a conflict', async () => {
    const store = createD1IdempotencyStore(new FakeD1());
    await store.claim({ key: 'claim-2', payloadHash: 'hash-a', reference: 'KQ-DUPREF1-1', now: 1000 });
    const conflict = await store.claim({ key: 'claim-2', payloadHash: 'hash-b', reference: 'KQ-DUPREF1-1', now: 1001 });
    assert.equal(conflict.state, 'CONFLICT');
  });

  await test('confirmed retryable failures can reacquire but active claims cannot', async () => {
    const store = createD1IdempotencyStore(new FakeD1());
    const input = { key: 'claim-3', payloadHash: 'hash-a', reference: 'KQ-RETRY01-1', now: 1000 };
    await store.claim(input);
    assert.equal((await store.claim({ ...input, now: 1001 })).state, 'IN_PROGRESS');
    await store.markRetryableFailure({ key: input.key, payloadHash: input.payloadHash, code: 'REJECTED', now: 1002 });
    assert.equal((await store.claim({ ...input, now: 1003 })).state, 'ACQUIRED');
  });

  await test('expired mutation leases become uncertain and never reacquire blindly', async () => {
    const db = new FakeD1();
    const store = createD1IdempotencyStore(db);
    const input = { key: 'claim-4', payloadHash: 'hash-a', reference: 'KQ-UNKNOWN1-1', now: 1000 };
    await store.claim(input);
    await store.markMutationStarted({ key: input.key, payloadHash: input.payloadHash, now: 1001 });
    const result = await store.claim({ ...input, now: 1001 + CLAIM_LEASE_MS + 1 });
    assert.equal(result.state, 'UNCERTAIN');
    assert.equal(db.claims.get(input.key).state, 'UNCERTAIN');
  });

  await test('completed claims retain the Shopify draft ID and linkable staff name', async () => {
    const store = createD1IdempotencyStore(new FakeD1());
    const input = { key: 'claim-5', payloadHash: 'hash-a', reference: 'KQ-COMPLETE-1', now: 1000 };
    await store.claim(input);
    await store.markMutationStarted({ key: input.key, payloadHash: input.payloadHash, now: 1001 });
    await store.complete({ key: input.key, payloadHash: input.payloadHash, draftId: 'gid://shopify/DraftOrder/1', draftName: '#D1', now: 1002 });
    const result = await store.claim({ ...input, now: 1003 });
    assert.equal(result.state, 'COMPLETED');
    assert.equal(result.record.draftName, '#D1');
  });

  await test('durable fixed-window limiter exhausts at the configured bound', async () => {
    const limiter = createD1RateLimiter(new FakeD1());
    const results = [];
    for (let index = 0; index < 4; index += 1) {
      results.push(await limiter.consume({ key: 'shop:client', limit: 3, windowSeconds: 60, now: 10_000 }));
    }
    assert.deepEqual(results.map((entry) => entry.allowed), [true, true, true, false]);
    assert.equal(results[3].remaining, 0);
  });

  console.log(`Epic K K1D-02 D1 adapter tests passed: ${passed}/${passed}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
