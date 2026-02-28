# ADR-0004: Pattern as Visual Template (Not Prompt String)

**Status:** Accepted  
**Date:** 2026-02-28  
**Skills Applied:** `design-patterns-implementation`, `architecture-decision-records`

---

## Context

The system needs to generate **N design variants** from a single user-uploaded image. The user provides structured copy (headline, CTA, etc.) and the tool produces variants that differ visually — not semantically.

Inspired by tools like [AdCreative.ai](https://app.adcreative.ai/), the core observation is:

> **The background image is always fixed. What changes across variants is the visual pattern.**

The original plan represented a "Pattern" as a `promptSnippet: string` appended to the LLM prompt. This was a first approximation. The enhanced design reveals that a Pattern is a **deterministic visual template**, not a text hint.

---

## Decision Drivers

- Variants must be **reproducible**: same inputs + same pattern = identical output
- Template-mode generation must work **offline** (no LLM, no API key)
- Copy input is structured (headline, subheadline, CTA, caption) — not freeform
- The number of generated variants is controlled by the user via **pattern selection** (1 per pattern)
- Visual style (overlay, font, color) must be **decoupled** from copy content

---

## Considered Options

### Option A: Pattern as `promptSnippet: string` (original)
- **Pro**: Simple; no new entities needed
- **Con**: LLM always required; output is non-deterministic; no structured slot mapping; styling is unpredictable

### Option B: Pattern as DesignJSON fragment (partial template)
- **Pro**: Reuses existing DesignJSON schema
- **Con**: Partial DesignJSON is hard to validate; merge logic is complex; cannot express overlay separately

### Option C: Pattern as Visual Template entity ✅
- **Pro**: Deterministic; offline-capable; cleanly typed; slot mapping is a pure function; 1 pattern = 1 variant is crystal clear; LLM is additive (optional copy variation), not required
- **Con**: More domain entities; requires slot-mapping logic

---

## Decision

We adopt **Pattern as a typed Visual Template** entity in the Domain Core.

### Pattern Structure

```typescript
interface Pattern {
  id: string;
  name: string;
  description: string;
  tags: string[];
  background: BackgroundTreatment; // overlay type + value + opacity
  textSlots: TextSlot[];            // ordered layout zones per content type
  accentColor: string;
  promptHints?: string;             // optional — used only in LLM-assist mode
}
```

### Generation Mode

| Mode | LLM Required | Deterministic | Use Case |
|---|---|---|---|
| **Template** (`useLLMCopyVariation: false`) | ❌ No | ✅ Yes | Fast, offline, reproducible |
| **LLM-Assist** (`useLLMCopyVariation: true`) | ✅ Yes | ❌ No | Copy variation within a fixed visual frame |

### Slot Mapping

`mapPunchlinesToSlots(punchlines, pattern)` is a **pure function** in the Domain Core. It:
1. Filters slots by `contentType` (`meme` / `ad` / `promo`)
2. Maps each punchline field to its matching slot
3. Returns `SlotMapping[]` — the only input to DesignJSON text element construction

### Variant Count

**1 Composition is produced per selected Pattern.** The user controls variant count by selecting more patterns. This is explicit and predictable — no magic `n: 10` parameter.

---

## `DesignJSON` Extension

The `overlay` field is added as a **non-breaking optional extension** to `DesignJSONSchema v1.0` (see [ADR-0002](0002-design-json-schema.md)):

```typescript
overlay: z.object({
  type: z.enum(['solid', 'gradient', 'texture']),
  value: z.string(),
  opacity: z.number().min(0).max(1),
}).optional()
```

**Layer convention:**
- `layer: 1` = background image (always the user's photo)
- `layer: 2` = reserved for overlay rendering
- `layer: 3+` = text/accent elements from Pattern slots

---

## Consequences

### Positive
- Template-mode generation is **instantaneous and works without API keys** ✅
- Pattern selection directly maps to variant count — **transparent UX** ✅
- `mapPunchlinesToSlots` is a pure function — **100% unit-testable, zero mocks needed** ✅
- LLM is used only for copy variation, not for structural layout — **less hallucination risk** ✅
- The Domain Core grows two clean entities (`Pattern`, `PunchlineSet`) with Zod validation ✅

### Negative
- Users must choose from predefined text slot zones (`top` / `center` / `bottom`) — less flexible than free-form LLM
- Mitigation: Custom pattern creation UI allows users to define their own slot positions

### Risks
- Pattern's `textSlots` might not fit atypical layouts (e.g. diagonal or circular text)
- Mitigation: Future `PatternV2` can introduce a `position: { x, y }` override alongside zone

---

## Related Decisions

- [ADR-0001](0001-hexagonal-strategy.md) — Hexagonal architecture; Pattern lives in Domain Core
- [ADR-0002](0002-design-json-schema.md) — `overlay` field added to DesignJSON v1.0 schema
- [ADR-0003](0003-tdd-approach.md) — `mapPunchlinesToSlots` is pure and fully unit-tested
