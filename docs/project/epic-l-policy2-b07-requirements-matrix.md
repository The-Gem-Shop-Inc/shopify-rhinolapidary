# Epic L Policy 2.0 B07 recovery requirements matrix

Recorded: 2026-11-27

| Requirement group | Recovery result | Primary evidence |
|---|---|---|
| 39-path preservation and 12-candidate recovery | Implemented and verified | `data/epic-l-policy2-b07-recovery.json`; B07 validator |
| Exact nine-candidate B05 import and provenance | Implemented and verified | `resource-administration.js`; domain assertions |
| Search/filter inventory and actionable requirements | Implemented and verified | browser inventory test |
| Document/video drafts; separate edit and delivery identities | Implemented and verified | domain and browser draft tests |
| Exact Product/Variant/machine applicability, multiple assignments, stale/duplicate rejection | Implemented and verified | domain rejection suite; multi-machine browser test |
| Immutable revisions, comparison, supersession, retirement | Implemented and verified | domain suite; accessible comparison browser test |
| Historical Kevin assertion without fabricated evidence | Implemented and verified | OPEN-09-bound domain workflow |
| Changed content requires fresh disposition | Implemented and verified | domain approval-inheritance rejection |
| Independent rights, language, accessibility, synthetic availability | Implemented and verified | contract and domain approval requirements |
| Validated restricted-data-safe export/import round trip | Implemented and verified | domain round trip and browser restore test |
| Authorization, idempotency, concurrency, audit | Implemented and verified | domain and HTTP rejection suite |
| Loopback isolation, request limits, Host/Origin/session safeguards | Implemented and verified | server implementation and HTTP tests |
| Keyboard, focus, labels, errors, unsaved changes, confirmations, WCAG A/AA scan | Implemented and verified | Playwright and axe tests |
| Production staff identity binding | Blocked | Production identity remains unresolved |
| Production persistence/privacy retention readiness | Blocked | Demonstration in-memory store only |
| Live provider availability verification | Blocked | B07 makes zero provider calls |
| Human resource evidence completion | Partially implemented | Interface exists; per-resource evidence remains human work |
| Customer resource publication/delivery | Not applicable to B07; prohibited | Canonical activation gate and direct mutation rejection |
| M1 operational readiness | Blocked | All eight readiness blockers retained |

This matrix guided recovery; it does not replace executable acceptance or authorize operational use.
