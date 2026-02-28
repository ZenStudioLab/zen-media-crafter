# Design: Pattern-Set Visual Templates for Media Generation

**Status:** Enhanced — Ready for Implementation  
**Date:** 2026-02-28  
**Author:** Toan (assisted by Gemini CLI)  
**Inspiration:** [AdCreative.ai](https://app.adcreative.ai/)  
**Skills Applied:** `design-patterns-implementation`, `ui-ux-pro-max`

---

## 1. Core Insight

> **The background image is always fixed. What changes across variants is the visual pattern.**

Observed from AdCreative.ai: the user uploads a product photo once. The system then generates **N design variants** where the product stays anchored, but each variant applies a different **visual pattern** — a combination of:

- Background overlay (solid color, gradient, or repeating texture)
- Text layout (position zones: top/center/bottom, left/right/split)
- Typography (font family, size scale, color)
- Accent elements (dividers, badges, CTA buttons)

This means a "Pattern" is **not a prompt snippet** — it is a **visual style template** that deterministically defines the visual frame of each variant. The LLM's role is narrower: it maps the user's punchlines to the right layout slots and optionally suggests copy variations.

---

## 2. Revised Mental Model

### Input
| Field | Type | Description |
|---|---|---|
| `backgroundImage` | `UserAsset` | Fixed product/scene photo — stays on all variants |
| `punchlines` | `string[]` | 1–5 punchy lines (headline, sub-headline, CTA, etc.) |
| `contentType` | `'meme' \| 'ad' \| 'promo'` | Drives which layout slots are visible |
| `selectedPatternIds` | `string[]` | Which visual templates to apply (1 variant per pattern) |

### Output
| | |
|---|---|
| **N Variants** | One `Composition` per selected pattern |
| **Fixed** | `backgroundImage` appears on every variant |
| **Variable** | Overlay, text positions, font, colors — driven by the Pattern |

---

## 3. Architecture

### 3.1 Entity: `Pattern` (Visual Template)

Patterns are **deterministic visual templates** — not prompt text — stored in Redux and optionally persisted to `localStorage`.

```typescript
// src/core/entities/pattern.ts

export interface TextSlot {
  id: 'headline' | 'subheadline' | 'cta' | 'caption';
  zone: 'top' | 'center' | 'bottom';
  align: 'left' | 'center' | 'right';
  fontFamily: string;
  fontSizeScale: number; // relative multiplier, e.g. 1.0, 1.5, 0.75
  color: string;         // hex
  fontWeight: 'normal' | 'bold' | 'extrabold';
}

export interface BackgroundTreatment {
  type: 'solid' | 'gradient' | 'texture';
  value: string;         // hex for solid; CSS gradient string; texture URL for texture
  overlayOpacity: number; // 0–1, applied on top of background image
}

export interface Pattern {
  id: string;
  name: string;           // e.g. "Neon Noir", "Corporate Minimalist"
  description: string;
  tags: string[];         // e.g. ["dark", "bold", "meme-friendly"]
  background: BackgroundTreatment;
  textSlots: TextSlot[];  // ordered by visual priority
  accentColor: string;    // used for dividers, badges, CTA buttons
  promptHints?: string;   // OPTIONAL — only used as soft LLM guidance if needed
}
```

> **Key design decision:** `promptHints` is optional and additive. The pattern is primarily structural, not prompt-driven. This keeps patterns deterministic and reproducible.

---

### 3.2 Entity: `PunchlineSet`

A clean container for all the copy the user wants on their media.

```typescript
// src/core/entities/punchline-set.ts

export interface PunchlineSet {
  headline: string;
  subheadline?: string;
  cta?: string;
  caption?: string;
  contentType: 'meme' | 'ad' | 'promo';
}
```

The `contentType` controls which text slots are rendered:
- `meme`: headline + caption only
- `ad`: headline + subheadline + CTA
- `promo`: headline + subheadline + CTA + caption

---

### 3.3 Use Case: `GenerateLayouts` (Updated)

The use case now has two responsibilities:

1. **Slot Mapping** — distribute punchlines into the Pattern's `textSlots`
2. **LLM Call** (optional) — the LLM enriches or varies copy if requested

```typescript
// Simplified signature
GenerateLayouts.execute({
  backgroundImage: UserAsset,
  punchlines: PunchlineSet,
  patterns: Pattern[],
  provider: ILLMProvider,
  useLLMCopyVariation: boolean, // default false — pure template mode
}): Promise<Composition[]>
```

**Pure Template Mode (`useLLMCopyVariation: false`):**
- 1 Composition per Pattern
- Slot mapping is deterministic (headline → first slot, subheadline → second, etc.)
- No LLM call — fast, offline-capable

**LLM-Assisted Mode (`useLLMCopyVariation: true`):**
- LLM receives background context + punchlines + `promptHints` from pattern
- LLM returns varied copy suggestions (still within the pattern's visual frame)
- Useful for generating "10 ad copy variations on the same Neon Noir template"

---

### 3.4 `DesignJSON` Composition Output

Each generated `Composition` wraps a `DesignJSON` where:
- The background image is always at `layer: 1`
- The overlay is at `layer: 2`
- Text elements occupy `layer: 3+` following the Pattern's slot positions

```json
{
  "version": "1.0",
  "canvas": { "width": 1080, "height": 1080 },
  "background": { "type": "image", "src": "asset-id-of-user-photo" },
  "overlay": { "type": "solid", "value": "#0d1117", "opacity": 0.6 },
  "elements": [
    {
      "id": "headline",
      "type": "text",
      "content": "Limited time offer",
      "style": { "fontSize": 64, "fontFamily": "Inter", "color": "#ffffff", "fontWeight": "extrabold" },
      "position": { "x": 80, "y": 200, "zone": "top-left" },
      "layer": 3
    },
    {
      "id": "cta",
      "type": "text",
      "content": "Shop Now →",
      "style": { "fontSize": 24, "fontFamily": "Inter", "color": "#00f5d4" },
      "position": { "x": 80, "y": 900, "zone": "bottom-left" },
      "layer": 4
    }
  ]
}
```

---

## 4. Redux State Shape

```typescript
interface PatternsState {
  availablePatterns: Pattern[];     // built-in + user-created patterns
  selectedPatternIds: string[];     // which patterns to apply on next generation
  customPatterns: Pattern[];        // user-defined patterns (persisted)
}

interface GenerationInputState {
  backgroundImageId: string | null; // UserAsset ID
  punchlines: PunchlineSet;
  useLLMCopyVariation: boolean;
}
```

---

## 5. Data Flow

```
User Uploads Image
        │
        ▼
  Redux: backgroundImageId ←──────────────────────────┐
        │                                              │
User Enters Punchlines (headline, CTA…)                │
        │                                              │
  Redux: punchlines                                    │
        │                                              │
User Selects Patterns (e.g. "Neon Noir", "Minimal")    │
        │                                              │
  Redux: selectedPatternIds                            │
        │                                              │
        ▼                                              │
  [Generate Button]                                    │
        │                                              │
        ▼                                              │
  GenerateLayouts.execute()                           │
   ├─ For each pattern:                               │
   │   ├─ Map punchlines → textSlots                 │
   │   ├─ (optional) LLM copy variation              │
   │   └─ Build DesignJSON (fixed bg + overlay + text)│
   └─ Return Composition[]                            │
        │                                              │
        ▼                                              │
  IRenderingEngine.render(DesignJSON)                  │
        │                                              │
        ▼                                              │
  Gallery: N variants shown                            │
   └─ All variants share same product image ──────────┘
```

---

## 6. Preset Pattern Library (Initial Seed)

| ID | Name | Background | Text Zone | Mood |
|---|---|---|---|---|
| `neon-noir` | Neon Noir | Dark overlay (#0d1117, 70%) + cyan accent | Bottom-left | Cyberpunk, gaming |
| `corporate-clean` | Corporate Clean | White overlay (90%) + navy text | Center | B2B, SaaS |
| `summer-vibrant` | Summer Vibrant | Orange gradient overlay | Top-center | FMCG, lifestyle |
| `minimal-mono` | Minimal Mono | Near-transparent (20%) | Top-left, large font | Premium, fashion |
| `bold-promo` | Bold Promo | Red + yellow gradient | Center split | Retail, flash sales |
| `meme-classic` | Meme Classic | None | Top + bottom caption zones | Social media memes |

---

## 7. UI Design (Pattern Selector)

```
┌─────────────────────────────────────────────────────────┐
│  📸 Background Image      ✏ Punchlines                  │
│  [Upload / Drag-drop]     Headline: [____________]      │
│                           Sub-Line: [____________]      │
│                           CTA:      [____________]      │
│                           Type: [Meme] [Ad] [Promo]    │
├─────────────────────────────────────────────────────────┤
│  🎨 Select Patterns (multiple = more variants)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Neon     │ │Corporate │ │ Summer   │ │ Minimal  │  │
│  │ Noir  ✓  │ │ Clean    │ │ Vibrant  │ │ Mono   ✓ │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  + Add custom pattern                                   │
├─────────────────────────────────────────────────────────┤
│  ⚙ Options  [✓ LLM Copy Variation]  [Provider: GPT-4o] │
│                                                         │
│             [🚀 Generate — 2 Variants]                  │
└─────────────────────────────────────────────────────────┘
```

Each pattern card shows a **live mini-preview** with the user's uploaded image + the pattern's overlay applied in real-time (no LLM needed — pure CSS/Canvas rendering).

---

## 8. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Pattern is visual template, not prompt | ✅ Structural | Deterministic, offline-capable, reproducible |
| 1 variant per pattern selected | ✅ Direct mapping | User controls exactly how many variants |
| LLM is optional, not required | ✅ additive | Works without API keys for styling |
| Punchlines as structured input | ✅ Typed slots | Better UX than free-form textarea; maps cleanly to text slots |
| Preset library seeded in Redux | ✅ In-memory | No backend needed for Phase 0–2 |

---

## 9. Testing Strategy

| Layer | Test Type | Scope |
|---|---|---|
| `Pattern` entity | Unit (Vitest) | Zod schema validates all fields |
| `PunchlineSet` entity | Unit (Vitest) | Required field enforcement |
| `mapPunchlinesToSlots()` | Unit (Vitest) | Correct slot assignment per content type |
| `GenerateLayouts` (template mode) | Unit (Vitest) | DesignJSON shape, correct overlay + layer structure |
| `GenerateLayouts` (LLM mode) | Unit (Vitest) | Mock LLM called with correct enriched prompt |
| Pattern Redux slice | Unit (Vitest) | Select, deselect, add custom, persist |
| Pattern Selector UI | React Testing Library | Chip toggle, live preview updates |
| Full generation flow | E2E (Playwright) | Upload → Select patterns → Generate → Gallery shows N variants |

---

*Next: See [Pattern-Based Generation — TDD Implementation Plan](./2026-02-28-pattern-based-generation.md)*
