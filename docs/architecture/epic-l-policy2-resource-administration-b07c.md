# Epic L Policy 2.0 B07C — Resource administration usability successor

B07C keeps the B07 domain, authorization, audit, immutable-history, and publication gates while changing the administrative projection. Routine work now presents three operations: edit administrative details, update document or video content, and correct an administrative error.

Administrative detail edits append a governed patch event to the active revision. They do not create a content revision or change its content classification. Content replacement creates a new revision, records an authenticated reason automatically, clears technical disposition, and automatically supersedes the predecessor. Corrections append the original and effective classifications, actor, time, reason, and invalidated dispositions; verified differing hashes cannot be corrected to unchanged.

## Field responsibility

| Value | Software responsibility | Human decision retained |
| --- | --- | --- |
| Language | Default `en-US`; mark the basis as defaulted | Override or declare language-neutral content |
| Title and category | Suggest from inventory filename and category | Override when the suggestion is misleading |
| Product and Variant | Display catalog titles and store exact GIDs | Confirm exact applicability |
| Machine version | Reuse the observed candidate version | Clarify only materially ambiguous versions |
| Source and provider | Resolve B05 and Epic E evidence | Supply a genuinely new source |
| Immutable identity | Hash actual repository bytes; reject Git LFS pointer bytes | Resolve unavailable external provider revisions |
| Delivery URL | Reuse a canonical audited file URL | Leave pending when no delivery artifact exists |
| Availability | Record isolated deterministic checks | Future authorized production provider verification |
| Rights and accessibility | Preserve independent evidence and automate triage | Decide distribution permission and remediate actual accessibility issues |
| Technical approval | Authenticated action is the evidence event | Confirm historical unchanged content or approve genuinely changed content |

## Persistence and recovery

The loopback server stores a digested V1 registry outside the repository at `%LOCALAPPDATA%\RhinoLapidary\Policy2ResourceAdmin\registry.json` by default. Each save validates a temporary file before atomic replacement and retains the prior valid file as `.backup`. Startup restores the first valid current or backup archive. This is local administrative continuity only, not production durability or privacy readiness.

The enrichment CLI validates a supplied V1 archive and previews changes without writing it:

```powershell
npm run enrich:epic-l-policy2-b07c -- --archive "C:\path\epic-l-policy2-resource-registry.json"
```

Apply mode requires a different, non-existing output path. It never overwrites the source archive and makes no provider request, upload, publication, or Shopify mutation.

All eight readiness blockers remain active. Resource publication, operational activation, production identity binding, and live provider verification remain outside B07C.
