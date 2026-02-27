# ADR-0002: DesignJSON as Universal Intermediate Format

**Status:** Accepted  
**Date:** 2026-02-27  
**Skill Applied:** `architecture-decision-records`

---

## Context

The system needs a stable contract between two independently swappable components:
1. **LLM Providers** — produce layout descriptions as JSON output
2. **Rendering Engines** — consume layout descriptions to produce images

Without a formal schema, each adapter would need to know about every other adapter, creating tight coupling. Any change in one adapter would cascade across all others.

Additionally, the `DesignJSON` must be:
- **Editable** by the UI (the "tweak" feature)
- **Serializable** to Redux state and persisted to disk
- **Validatable** at runtime to prevent invalid AI output from crashing the renderer

---

## Decision Drivers

- LLM output must be validated before reaching any renderer
- UI must be able to partially update a single element without knowing the renderer
- The schema must support multiple element types: text, image, shape
- The schema must be versionable to allow non-breaking evolution

---

## Considered Options

### Option A: Free-form JSON (no schema)
- **Pro**: Adapters can produce whatever they want
- **Con**: No validation, impossible to build a generic editor, breaks on schema drift

### Option B: Renderer-specific formats
- **Pro**: Each renderer can be optimized
- **Con**: LLM adapters must know about renderers; coupling is total

### Option C: `DesignJSON` as a versioned, Zod-validated schema ✅
- **Pro**: Single source of truth; LLMs and renderers are fully decoupled; UI edits one canonical format; Zod provides runtime safety
- **Con**: Some rendering features must be expressible in the schema (managed via `layer` and `transform`)

---

## Decision

We adopt **DesignJSON v1.0** as the universal intermediate format, validated by a Zod schema at the port boundary.

---

## Full Schema

```typescript
// src/core/entities/design-json.ts
import { z } from 'zod';

export const ElementStyleSchema = z.object({
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  color: z.string().optional(),
  fontWeight: z.enum(['normal', 'bold']).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
});

export const TransformSchema = z.object({
  scale: z.number().default(1),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
});

export const ElementSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string().uuid(),
    type: z.literal('text'),
    content: z.string(),
    style: ElementStyleSchema,
    position: z.object({ x: z.number(), y: z.number() }),
    layer: z.number().int().positive(),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal('image'),
    src: z.string(),        // UserAsset ID reference
    transform: TransformSchema,
    position: z.object({ x: z.number(), y: z.number() }),
    layer: z.number().int().positive(),
  }),
]);

export const BackgroundSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('solid'), value: z.string() }),
  z.object({
    type: z.literal('gradient'),
    from: z.string(),
    to: z.string(),
    direction: z.number().default(135),
  }),
  z.object({ type: z.literal('image'), assetId: z.string() }),
]);

export const DesignJSONSchema = z.object({
  version: z.literal('1.0'),
  canvas: z.object({ width: z.number(), height: z.number() }),
  background: BackgroundSchema,
  elements: z.array(ElementSchema),
});

export type DesignJSON = z.infer<typeof DesignJSONSchema>;
```

---

## Validation Strategy

Zod validation occurs at **the port boundary** — inside `GenerateLayouts` use case, immediately after the `ILLMProvider` returns a result:

```typescript
const raw = await llmProvider.generateDesign(prompt, assets);
const validated = DesignJSONSchema.safeParse(raw);
if (!validated.success) {
  throw new InvalidDesignError(validated.error);
}
```

Renderers receive a **typed, validated `DesignJSON`** — no additional validation needed inside adapters.

---

## Versioning Strategy

- The `version` field is a **discriminated literal** in the schema
- Breaking changes → new schema file + new version literal (e.g. `'2.0'`)
- Non-breaking additions → add `.optional()` fields to existing schema
- Migration helpers go in `src/core/utils/design-json-migrator.ts`

---

## Consequences

### Positive
- LLM adapters are fully decoupled from renderers
- UI can edit any element generically (select by ID, mutate field, re-render)
- Invalid AI output is caught at use-case boundary, not inside a renderer
- TypeScript infers the full type automatically from Zod schema

### Negative
- Some highly renderer-specific features (e.g. SVG filters) cannot be expressed generically
- Mitigation: `elements` may include a `meta` any-typed bag for renderer hints

### Risks
- LLM providers may produce JSON that doesn't match the schema
- Mitigation: Provide the schema as a JSON Schema in the LLM system prompt; retry on parse failure (up to 3 times)

---

## Related Decisions

- [ADR-0001](0001-hexagonal-strategy.md) — Establishes the port contract this schema serves
- [ADR-0003](0003-tdd-approach.md) — Zod schema is unit-tested in Domain Core
