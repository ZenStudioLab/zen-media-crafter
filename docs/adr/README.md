# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for **Zen Media Crafter**.

> ADRs are **append-only**. Never edit an accepted ADR — write a new one to supersede it.

---

## Index

| ADR | Title | Status | Date |
|---|---|---|---|
| [0001](0001-hexagonal-strategy.md) | Hexagonal Architecture with Strategy Pattern | Accepted | 2026-02-27 |
| [0002](0002-design-json-schema.md) | DesignJSON as Universal Intermediate Format | Accepted | 2026-02-27 |
| [0003](0003-tdd-approach.md) | Test-Driven Development as First-Class Practice | Accepted | 2026-02-27 |
| [0004](0004-pattern-visual-template.md) | Pattern as Visual Template (Not Prompt String) | Accepted | 2026-02-28 |

---

## How to Create a New ADR

1. Copy the template below to `NNNN-short-title.md` (increment N from the last ADR)
2. Fill in all sections
3. Submit for review
4. Update this index on acceptance

## Template

```markdown
# ADR-NNNN: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded by [ADR-XXXX]
**Date:** YYYY-MM-DD

## Context
[Why is this decision needed?]

## Decision Drivers
- [Key constraint or requirement]

## Considered Options
### Option A: [Name]
- Pro: ...  Con: ...

## Decision
[What we decided and why]

## Consequences
### Positive
### Negative
### Risks

## Related Decisions
- [ADR-XXXX](link)
```

---

## Lifecycle

```
Proposed → Accepted → Deprecated / Superseded
               ↓
            Rejected
```
