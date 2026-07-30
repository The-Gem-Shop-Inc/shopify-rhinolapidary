# GitHub Project Workflow

## Purpose

This workflow defines how Rhino Lapidary PBIs move through planning, implementation, review, and completion.

## GitHub Project fields

Recommended fields:

| Field    | Values                                                         |
| -------- | -------------------------------------------------------------- |
| Status   | Backlog, Ready, In Progress, Review, Blocked, Done             |
| Epic     | Epic A, Epic B, Epic C, Launch                                 |
| Priority | P0, P1, P2, P3                                                 |
| Size     | S, M, L                                                        |
| Type     | Code, Process, Admin, Content, Test                            |
| Owner    | Person responsible for the work                                |
| Evidence | Link to PR, commit, doc, test run, screenshot, or release note |

## Status rules

### Backlog

PBI exists but is not ready to implement.

### Ready

PBI has a clear completion condition and no unresolved dependency.

### In Progress

Implementation has started.

### Review

Code, docs, or admin evidence is ready to be reviewed.

### Blocked

Work cannot continue until a dependency is resolved.

### Done

A PBI is Done only when:

* Acceptance criteria are satisfied.
* Required repository files are committed.
* Required admin/process evidence is linked.
* Relevant validation commands pass.
* The PBI tracker is updated.
* Follow-up risks are either resolved or entered in the risk register.

## Branch naming

Use:

```text id="n082op"
pbi/<pbi-id>-short-description
```

Example:

```text id="jgjzzu"
pbi/a-054-production-readiness-gate
```

## Commit convention

Use direct, implementation-focused commit messages:

```text id="p4tvjp"
Add production readiness validation gate
Document Shopify admin change evidence process
Validate launch fixture ownership
```

## PBI tracker rule

The Markdown PBI tracker remains the portable source of truth for ChatGPT-assisted planning.

The GitHub Project tracks live work execution.

Both should agree before Epic B begins.
