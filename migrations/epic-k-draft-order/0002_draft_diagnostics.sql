CREATE TABLE quote_submission_diagnostics (
  diagnostic_id INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotency_key TEXT NOT NULL,
  quote_reference TEXT NOT NULL,
  reconciliation_tag TEXT NOT NULL,
  outcome_category TEXT NOT NULL CHECK (
    outcome_category IN (
      'DRAFT_CREATED',
      'SHOPIFY_INPUT_REJECTED',
      'SHOPIFY_GRAPHQL_REJECTED',
      'SHOPIFY_HTTP_REJECTED',
      'SHOPIFY_RATE_LIMITED',
      'ADMIN_RESULT_UNCERTAIN'
    )
  ),
  field_paths_json TEXT NOT NULL DEFAULT '[]',
  classifications_json TEXT NOT NULL DEFAULT '[]',
  http_status INTEGER CHECK (http_status IS NULL OR (http_status >= 100 AND http_status <= 599)),
  assessed_at INTEGER NOT NULL
);

CREATE INDEX quote_submission_diagnostics_reference_idx
  ON quote_submission_diagnostics (quote_reference, assessed_at);

CREATE INDEX quote_submission_diagnostics_key_idx
  ON quote_submission_diagnostics (idempotency_key, assessed_at);
