# Epic L Policy 2.0 B08A — Private submission ingestion

B08A adds a transport-independent, private ingestion boundary around the existing Registration 2.2.0 and Support/Safety 2.2.0 services. It is an isolated synthetic proof, not a Shopify Forms or Flow implementation.

## Decisions

- Authority comes from an authenticator outside the submitted envelope. Role labels, permissions, customer identity, and notification destinations are not accepted from payload fields.
- The envelope contains only submission kind, transport delivery metadata, and the business facts that cannot already be derived. The adapter generates receipt, correlation, command, attempt, audit, and processing-time identities.
- Missing first-use information defaults to `UNKNOWN`; missing support detail enters private clarification and ambiguous safety review. Neither default is represented as verified evidence or a safe finding.
- Delivery identity plus the canonical envelope digest is the idempotency boundary. Reuse with different content is rejected. The stable domain command reconciles a domain success if receipt finalization is interrupted, without creating a second registration or case.
- Registration, support, safety, notification, catalog, and audit rules remain owned by their existing domain services. B08A performs no eligibility decision, diagnosis, safety disposition, manufacturer referral, publication, or activation.
- Diagnostics retain error codes, attempts, and hashes, but exclude submitted payload and contact data. Diagnostic and audit reads require permissions independent of submitter authentication.
- The receipt store is an in-memory port for synthetic acceptance. It demonstrates consistency semantics but is not production durability, privacy retention, backup, or restore evidence.

## B08B handoff

B08B must verify the actual Shopify plan and transport behavior before selecting an adapter. It must establish production identity, least privilege, durable storage, attachment lifecycle, export/deletion behavior, notification recovery, and privacy controls. The external adapter must map verified provider delivery metadata into the B08A envelope; it must not bypass the domain commands or promote synthetic authority.

The eight Policy 2.0 readiness blockers remain active. R3-006 is in progress and blocked on B08B; no customer-facing promise or operational activation is authorized.
