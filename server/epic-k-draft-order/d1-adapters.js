'use strict';

const CLAIM_LEASE_MS = 60 * 1000;

function changes(result) {
  return Number(result?.meta?.changes || 0);
}

function recordFromRow(row) {
  if (!row) return null;
  return {
    key: row.idempotency_key,
    payloadHash: row.payload_hash,
    reference: row.quote_reference,
    state: row.state,
    draftId: row.draft_id || null,
    draftName: row.draft_name || null,
    errorCode: row.error_code || null,
    attemptCount: Number(row.attempt_count || 0),
    leaseExpiresAt: Number(row.lease_expires_at || 0),
  };
}

function createD1IdempotencyStore(db, { leaseMs = CLAIM_LEASE_MS } = {}) {
  if (!db?.prepare) throw new Error('A D1 database binding is required.');

  async function read(key) {
    const row = await db.prepare(`
      SELECT idempotency_key, payload_hash, quote_reference, state, draft_id,
             draft_name, error_code, attempt_count, lease_expires_at
      FROM quote_submission_claims
      WHERE idempotency_key = ?1
    `).bind(key).first();
    return recordFromRow(row);
  }

  return {
    async claim({ key, payloadHash, reference, now }) {
      const leaseExpiresAt = now + leaseMs;
      const inserted = await db.prepare(`
        INSERT INTO quote_submission_claims (
          idempotency_key, payload_hash, quote_reference, state, attempt_count,
          lease_expires_at, created_at, updated_at
        ) VALUES (?1, ?2, ?3, 'CLAIMED', 1, ?4, ?5, ?5)
        ON CONFLICT(idempotency_key) DO NOTHING
      `).bind(key, payloadHash, reference, leaseExpiresAt, now).run();
      if (changes(inserted) === 1) return { state: 'ACQUIRED' };

      let prior = await read(key);
      if (!prior) throw new Error('D1 did not return the existing idempotency claim.');
      if (prior.payloadHash !== payloadHash || prior.reference !== reference) return { state: 'CONFLICT' };
      if (prior.state === 'COMPLETED') return { state: 'COMPLETED', record: prior };
      if (prior.state === 'UNCERTAIN') return { state: 'UNCERTAIN', record: prior };

      if (prior.state === 'MUTATING' && prior.leaseExpiresAt <= now) {
        const uncertain = await db.prepare(`
          UPDATE quote_submission_claims
          SET state = 'UNCERTAIN', error_code = 'MUTATION_LEASE_EXPIRED',
              lease_expires_at = 0, updated_at = ?3
          WHERE idempotency_key = ?1 AND payload_hash = ?2
            AND state = 'MUTATING' AND lease_expires_at <= ?3
        `).bind(key, payloadHash, now).run();
        if (changes(uncertain) === 1) return { state: 'UNCERTAIN' };
        prior = await read(key);
      }

      if (prior.state === 'FAILED_RETRYABLE' || (prior.state === 'CLAIMED' && prior.leaseExpiresAt <= now)) {
        const reacquired = await db.prepare(`
          UPDATE quote_submission_claims
          SET state = 'CLAIMED', attempt_count = attempt_count + 1,
              lease_expires_at = ?4, error_code = NULL, updated_at = ?5
          WHERE idempotency_key = ?1 AND payload_hash = ?2 AND quote_reference = ?3
            AND (
              state = 'FAILED_RETRYABLE'
              OR (state = 'CLAIMED' AND lease_expires_at <= ?5)
            )
        `).bind(key, payloadHash, reference, leaseExpiresAt, now).run();
        if (changes(reacquired) === 1) return { state: 'ACQUIRED' };
        prior = await read(key);
        if (!prior) throw new Error('D1 lost the idempotency claim during reacquisition.');
        if (prior.state === 'COMPLETED') return { state: 'COMPLETED', record: prior };
        if (prior.state === 'UNCERTAIN') return { state: 'UNCERTAIN', record: prior };
      }
      return { state: 'IN_PROGRESS', record: prior };
    },

    async markMutationStarted({ key, payloadHash, now }) {
      const result = await db.prepare(`
        UPDATE quote_submission_claims
        SET state = 'MUTATING', lease_expires_at = ?4, updated_at = ?3
        WHERE idempotency_key = ?1 AND payload_hash = ?2 AND state = 'CLAIMED'
      `).bind(key, payloadHash, now, now + leaseMs).run();
      if (changes(result) !== 1) throw new Error('The draft mutation could not acquire its durable execution fence.');
    },

    async complete({ key, payloadHash, draftId, draftName, now }) {
      if (!draftId || !draftName) throw new Error('A confirmed Shopify draft ID and name are required.');
      const result = await db.prepare(`
        UPDATE quote_submission_claims
        SET state = 'COMPLETED', draft_id = ?3, draft_name = ?4,
            error_code = NULL, lease_expires_at = 0, updated_at = ?5
        WHERE idempotency_key = ?1 AND payload_hash = ?2
          AND state IN ('MUTATING', 'UNCERTAIN')
      `).bind(key, payloadHash, draftId, draftName, now).run();
      if (changes(result) !== 1) throw new Error('The confirmed draft could not be stored against its idempotency claim.');
    },

    async markRetryableFailure({ key, payloadHash, code, now }) {
      const result = await db.prepare(`
        UPDATE quote_submission_claims
        SET state = 'FAILED_RETRYABLE', error_code = ?3,
            lease_expires_at = 0, updated_at = ?4
        WHERE idempotency_key = ?1 AND payload_hash = ?2 AND state IN ('CLAIMED', 'MUTATING')
      `).bind(key, payloadHash, code, now).run();
      if (changes(result) !== 1) throw new Error('The retryable failure state could not be recorded.');
    },

    async markUncertain({ key, payloadHash, code, now }) {
      const result = await db.prepare(`
        UPDATE quote_submission_claims
        SET state = 'UNCERTAIN', error_code = ?3,
            lease_expires_at = 0, updated_at = ?4
        WHERE idempotency_key = ?1 AND payload_hash = ?2 AND state = 'MUTATING'
      `).bind(key, payloadHash, code, now).run();
      if (changes(result) !== 1) throw new Error('The uncertain mutation state could not be recorded.');
    },
  };
}

function createD1RateLimiter(db) {
  if (!db?.prepare) throw new Error('A D1 database binding is required.');
  return {
    async consume({ key, limit, windowSeconds, now }) {
      const nowSeconds = Math.floor(now / 1000);
      const windowStart = Math.floor(nowSeconds / windowSeconds) * windowSeconds;
      const expiresAt = windowStart + windowSeconds;
      await db.prepare(`
        DELETE FROM quote_rate_windows
        WHERE rowid IN (
          SELECT rowid FROM quote_rate_windows
          WHERE expires_at < ?1
          ORDER BY expires_at
          LIMIT 25
        )
      `).bind(nowSeconds - 3600).run();
      const row = await db.prepare(`
        INSERT INTO quote_rate_windows (rate_key, window_start, request_count, expires_at)
        VALUES (?1, ?2, 1, ?3)
        ON CONFLICT(rate_key, window_start)
        DO UPDATE SET request_count = request_count + 1
        RETURNING request_count
      `).bind(key, windowStart, expiresAt).first();
      const count = Number(row?.request_count);
      if (!Number.isInteger(count) || count < 1) throw new Error('D1 did not return the rate-limit count.');
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        retryAfterSeconds: Math.max(1, expiresAt - nowSeconds),
      };
    },
  };
}

module.exports = { CLAIM_LEASE_MS, createD1IdempotencyStore, createD1RateLimiter };
