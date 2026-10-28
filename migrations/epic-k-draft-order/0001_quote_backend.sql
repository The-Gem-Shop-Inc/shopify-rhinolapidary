CREATE TABLE quote_submission_claims (
  idempotency_key TEXT PRIMARY KEY NOT NULL,
  payload_hash TEXT NOT NULL,
  quote_reference TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK (state IN ('CLAIMED', 'MUTATING', 'FAILED_RETRYABLE', 'UNCERTAIN', 'COMPLETED')),
  attempt_count INTEGER NOT NULL DEFAULT 1 CHECK (attempt_count >= 1),
  lease_expires_at INTEGER NOT NULL,
  draft_id TEXT,
  draft_name TEXT,
  error_code TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CHECK (
    (state = 'COMPLETED' AND draft_id IS NOT NULL AND draft_name IS NOT NULL)
    OR state != 'COMPLETED'
  )
);

CREATE INDEX quote_submission_claims_state_idx
  ON quote_submission_claims (state, updated_at);

CREATE TABLE quote_rate_windows (
  rate_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 1),
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (rate_key, window_start)
);

CREATE INDEX quote_rate_windows_expiry_idx
  ON quote_rate_windows (expires_at);
