# Pattern-Based Media Generation — TDD Implementation Plan

> **Inspiration:** [AdCreative.ai](https://app.adcreative.ai/)  
> **Design Spec:** [Pattern-Set Input Design](./2026-02-28-pattern-set-input-design.md)  
> **Skills:** `design-patterns-implementation`, TDD (Red → Green → Refactor)

**Goal:** Implement visual Pattern templates + PunchlineSet input so that one upload generates N design variants, each with the same background image but a different visual pattern (overlay, text layout, typography).

**Architecture recap:**
- `Pattern` = visual template (overlay, text slots, fonts, colors) — **not** a prompt string
- `PunchlineSet` = structured copy (headline, subheadline, CTA, caption)
- `GenerateLayouts` maps punchlines → pattern slots → `DesignJSON`
- 1 `Composition` produced per selected Pattern

---

## Task 1: `Pattern` Entity & Zod Schema

**Files:**
- `src/core/entities/pattern.ts` ← NEW
- `src/__tests__/core/entities/pattern.test.ts` ← NEW

**Step 1: Write failing test**

```typescript
// src/__tests__/core/entities/pattern.test.ts
import { describe, it, expect } from 'vitest';
import { PatternSchema } from '../../../core/entities/pattern';

describe('Pattern Entity', () => {
  it('validates a full valid pattern', () => {
    const valid = {
      id: 'neon-noir',
      name: 'Neon Noir',
      description: 'Dark cyberpunk style',
      tags: ['dark', 'gaming'],
      background: { type: 'solid', value: '#0d1117', overlayOpacity: 0.7 },
      textSlots: [
        { id: 'headline', zone: 'bottom', align: 'left', fontFamily: 'Inter',
          fontSizeScale: 1.5, color: '#ffffff', fontWeight: 'extrabold' }
      ],
      accentColor: '#00f5d4',
    };
    expect(PatternSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a pattern missing required fields', () => {
    const invalid = { id: 'x', name: 'Bad' }; // missing background, textSlots, accentColor
    expect(PatternSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects invalid backgroundType', () => {
    const invalid = {
      id: 'x', name: 'X', description: 'X', tags: [],
      background: { type: 'video', value: '#fff', overlayOpacity: 0.5 }, // 'video' not allowed
      textSlots: [], accentColor: '#000',
    };
    expect(PatternSchema.safeParse(invalid).success).toBe(false);
  });
});
```

**Step 2:** `npx vitest src/__tests__/core/entities/pattern.test.ts` → **FAIL** (module not found)

**Step 3: Write minimal implementation**

```typescript
// src/core/entities/pattern.ts
import { z } from 'zod';

export const TextSlotSchema = z.object({
  id: z.enum(['headline', 'subheadline', 'cta', 'caption']),
  zone: z.enum(['top', 'center', 'bottom']),
  align: z.enum(['left', 'center', 'right']),
  fontFamily: z.string(),
  fontSizeScale: z.number().positive(),
  color: z.string(),
  fontWeight: z.enum(['normal', 'bold', 'extrabold']),
});

export const BackgroundTreatmentSchema = z.object({
  type: z.enum(['solid', 'gradient', 'texture']),
  value: z.string(),
  overlayOpacity: z.number().min(0).max(1),
});

export const PatternSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string()),
  background: BackgroundTreatmentSchema,
  textSlots: z.array(TextSlotSchema),
  accentColor: z.string(),
  promptHints: z.string().optional(),
});

export type TextSlot = z.infer<typeof TextSlotSchema>;
export type BackgroundTreatment = z.infer<typeof BackgroundTreatmentSchema>;
export type Pattern = z.infer<typeof PatternSchema>;
```

**Step 4:** Re-run → **PASS**

**Step 5 — Commit:**
```bash
git commit -m "feat(core): add Pattern entity with visual template schema"
```

---

## Task 2: `PunchlineSet` Entity & Zod Schema

**Files:**
- `src/core/entities/punchline-set.ts` ← NEW
- `src/__tests__/core/entities/punchline-set.test.ts` ← NEW

**Step 1: Write failing test**

```typescript
import { PunchlineSetSchema } from '../../../core/entities/punchline-set';

describe('PunchlineSet Entity', () => {
  it('validates a minimal ad punchline set', () => {
    expect(PunchlineSetSchema.safeParse({
      headline: '50% Off Today',
      contentType: 'ad',
    }).success).toBe(true);
  });

  it('validates a full meme punchline set', () => {
    expect(PunchlineSetSchema.safeParse({
      headline: 'When the code finally works',
      caption: 'And then you realize it works only on your machine',
      contentType: 'meme',
    }).success).toBe(true);
  });

  it('rejects missing headline', () => {
    expect(PunchlineSetSchema.safeParse({ contentType: 'ad' }).success).toBe(false);
  });
});
```

**Step 2:** Run → **FAIL**

**Step 3: Write minimal implementation**

```typescript
// src/core/entities/punchline-set.ts
import { z } from 'zod';

export const PunchlineSetSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  cta: z.string().optional(),
  caption: z.string().optional(),
  contentType: z.enum(['meme', 'ad', 'promo']),
});

export type PunchlineSet = z.infer<typeof PunchlineSetSchema>;
```

**Step 4:** Re-run → **PASS**

**Step 5 — Commit:**
```bash
git commit -m "feat(core): add PunchlineSet entity for structured copy input"
```

---

## Task 3: `mapPunchlinesToSlots()` — Pure Function

**Files:**
- `src/core/use-cases/map-punchlines-to-slots.ts` ← NEW
- `src/__tests__/core/use-cases/map-punchlines-to-slots.test.ts` ← NEW

This is the heart of the template-mode flow. It distributes a `PunchlineSet` into the `TextSlot[]` of a `Pattern`.

**Step 1: Write failing tests**

```typescript
import { mapPunchlinesToSlots } from '../../../core/use-cases/map-punchlines-to-slots';

const adPattern: Pattern = {
  id: 'test',
  name: 'Test',
  description: '',
  tags: [],
  accentColor: '#fff',
  background: { type: 'solid', value: '#000', overlayOpacity: 0.5 },
  textSlots: [
    { id: 'headline',    zone: 'top',    align: 'left', fontFamily: 'Inter', fontSizeScale: 1.5, color: '#fff', fontWeight: 'extrabold' },
    { id: 'subheadline', zone: 'center', align: 'left', fontFamily: 'Inter', fontSizeScale: 1.0, color: '#ccc', fontWeight: 'normal' },
    { id: 'cta',         zone: 'bottom', align: 'right', fontFamily: 'Inter', fontSizeScale: 0.8, color: '#0f0', fontWeight: 'bold' },
  ],
};

describe('mapPunchlinesToSlots()', () => {
  it('maps headline and CTA correctly', () => {
    const result = mapPunchlinesToSlots(
      { headline: '50% Off', cta: 'Shop Now', contentType: 'ad' },
      adPattern
    );
    expect(result.find(r => r.slotId === 'headline')?.text).toBe('50% Off');
    expect(result.find(r => r.slotId === 'cta')?.text).toBe('Shop Now');
  });

  it('skips slots whose punchline was not provided', () => {
    const result = mapPunchlinesToSlots(
      { headline: 'Hello', contentType: 'ad' }, // no subheadline
      adPattern
    );
    expect(result.find(r => r.slotId === 'subheadline')).toBeUndefined();
  });

  it('ignores slots not relevant to contentType meme', () => {
    // meme only shows headline + caption, never cta
    const result = mapPunchlinesToSlots(
      { headline: 'Top text', caption: 'Bottom text', contentType: 'meme' },
      adPattern
    );
    expect(result.find(r => r.slotId === 'cta')).toBeUndefined();
  });
});
```

**Step 2:** Run → **FAIL**

**Step 3: Write minimal implementation**

```typescript
// src/core/use-cases/map-punchlines-to-slots.ts
import { Pattern, TextSlot } from '@/core/entities/pattern';
import { PunchlineSet } from '@/core/entities/punchline-set';

const CONTENT_TYPE_ALLOWED_SLOTS: Record<PunchlineSet['contentType'], TextSlot['id'][]> = {
  meme:  ['headline', 'caption'],
  ad:    ['headline', 'subheadline', 'cta'],
  promo: ['headline', 'subheadline', 'cta', 'caption'],
};

export interface SlotMapping {
  slotId: TextSlot['id'];
  text: string;
  slot: TextSlot;
}

export function mapPunchlinesToSlots(
  punchlines: PunchlineSet,
  pattern: Pattern,
): SlotMapping[] {
  const allowed = CONTENT_TYPE_ALLOWED_SLOTS[punchlines.contentType];

  return pattern.textSlots
    .filter(slot => allowed.includes(slot.id))
    .flatMap(slot => {
      const text = punchlines[slot.id as keyof PunchlineSet] as string | undefined;
      if (!text) return [];
      return [{ slotId: slot.id, text, slot }];
    });
}
```

**Step 4:** Re-run → **PASS**

**Step 5 — Commit:**
```bash
git commit -m "feat(core): add mapPunchlinesToSlots — pure slot-mapping function"
```

---

## Task 4: Update `GenerateLayouts` Use Case

**Files:**
- `src/core/use-cases/generate-layouts.ts` ← MODIFY
- `src/__tests__/core/use-cases/generate-layouts.test.ts` ← MODIFY

**Step 1: Write failing tests**

```typescript
describe('GenerateLayouts (template mode)', () => {
  it('creates one Composition per Pattern', async () => {
    const patterns = [makePattern('dark'), makePattern('light')];
    const result = await GenerateLayouts.execute({
      backgroundImage: mockAsset,
      punchlines: { headline: 'Hello', contentType: 'ad' },
      patterns,
      provider: mockProvider,
      useLLMCopyVariation: false,
    });
    expect(result).toHaveLength(2);
    expect(result[0].name).toContain('dark');
    expect(result[1].name).toContain('light');
  });

  it('does NOT call provider in template mode', async () => {
    const providerSpy = vi.fn();
    await GenerateLayouts.execute({
      backgroundImage: mockAsset,
      punchlines: { headline: 'Hi', contentType: 'meme' },
      patterns: [makePattern('test')],
      provider: { generate: providerSpy } as any,
      useLLMCopyVariation: false,
    });
    expect(providerSpy).not.toHaveBeenCalled();
  });

  it('calls provider once per pattern in LLM mode', async () => {
    const providerSpy = vi.fn().mockResolvedValue(makeMockDesign());
    const patterns = [makePattern('a'), makePattern('b')];
    await GenerateLayouts.execute({
      backgroundImage: mockAsset,
      punchlines: { headline: 'Go!', cta: 'Buy', contentType: 'ad' },
      patterns,
      provider: { generate: providerSpy } as any,
      useLLMCopyVariation: true,
    });
    expect(providerSpy).toHaveBeenCalledTimes(2);
  });

  it('includes background image on every composition DesignJSON', async () => {
    const result = await GenerateLayouts.execute({
      backgroundImage: { id: 'img-001', ...mockAsset },
      punchlines: { headline: 'Test', contentType: 'promo' },
      patterns: [makePattern('x')],
      provider: mockProvider,
      useLLMCopyVariation: false,
    });
    expect(result[0].designJson.background.src).toBe('img-001');
  });
});
```

**Step 2:** Run → **FAIL**

**Step 3: Write implementation (template mode)**

```typescript
// src/core/use-cases/generate-layouts.ts
import { Pattern } from '@/core/entities/pattern';
import { PunchlineSet } from '@/core/entities/punchline-set';
import { UserAsset } from '@/core/entities/user-asset';
import { ILLMProvider } from '@/ports/i-llm-provider';
import { Composition } from '@/core/entities/composition';
import { DesignJSON } from '@/core/entities/design-json';
import { mapPunchlinesToSlots } from './map-punchlines-to-slots';

interface GenerateInput {
  backgroundImage: UserAsset;
  punchlines: PunchlineSet;
  patterns: Pattern[];
  provider: ILLMProvider;
  useLLMCopyVariation: boolean;
}

export class GenerateLayouts {
  static async execute(input: GenerateInput): Promise<Composition[]> {
    const { backgroundImage, punchlines, patterns, provider, useLLMCopyVariation } = input;

    return Promise.all(
      patterns.map(async (pattern) => {
        const slotMappings = mapPunchlinesToSlots(punchlines, pattern);

        let textElements = slotMappings.map((m, i) => ({
          id: m.slotId,
          type: 'text' as const,
          content: m.text,
          style: {
            fontFamily: m.slot.fontFamily,
            fontSize: Math.round(48 * m.slot.fontSizeScale),
            color: m.slot.color,
            fontWeight: m.slot.fontWeight,
          },
          position: zoneToPosition(m.slot.zone, m.slot.align),
          layer: 3 + i,
        }));

        if (useLLMCopyVariation && pattern.promptHints) {
          const enrichedPrompt = buildLLMPrompt(punchlines, pattern);
          const llmDesign = await provider.generate(enrichedPrompt);
          textElements = mergeWithLLMSuggestions(textElements, llmDesign);
        }

        const designJson: DesignJSON = {
          version: '1.0',
          canvas: { width: 1080, height: 1080 },
          background: { type: 'image', src: backgroundImage.id },
          overlay: {
            type: pattern.background.type,
            value: pattern.background.value,
            opacity: pattern.background.overlayOpacity,
          },
          elements: textElements,
        };

        return new Composition(pattern.name, designJson, 'template');
      })
    );
  }
}

function zoneToPosition(zone: string, align: string) {
  const y = zone === 'top' ? 80 : zone === 'center' ? 480 : 880;
  const x = align === 'left' ? 80 : align === 'center' ? 540 : 900;
  return { x, y, zone: `${zone}-${align}` };
}

function buildLLMPrompt(punchlines: PunchlineSet, pattern: Pattern): string {
  return (
    `Generate a ${punchlines.contentType} ad. ` +
    `Headline: "${punchlines.headline}". ` +
    `Style: ${pattern.promptHints ?? pattern.description}`
  );
}

function mergeWithLLMSuggestions(elements: any[], _llmDesign: any) {
  // TODO: Phase 2 — deep merge LLM copy suggestions into text elements
  return elements;
}
```

**Step 4:** Re-run → **PASS**

**Step 5 — Commit:**
```bash
git commit -m "feat(core): update GenerateLayouts — template mode + optional LLM copy variation"
```

---

## Task 5: Patterns Redux Slice (Updated)

**Files:**
- `src/store/patterns-slice.ts` ← NEW
- `src/store/generation-input-slice.ts` ← NEW
- `src/__tests__/store/patterns-slice.test.ts` ← NEW

**Step 1: Write failing tests**

```typescript
import patternsReducer, {
  selectPattern, deselectPattern, addCustomPattern
} from '../../store/patterns-slice';

describe('Patterns Slice', () => {
  it('can select a pattern', () => {
    const next = patternsReducer(initialState, selectPattern('neon-noir'));
    expect(next.selectedPatternIds).toContain('neon-noir');
  });

  it('cannot select the same pattern twice', () => {
    let state = patternsReducer(initialState, selectPattern('neon-noir'));
    state = patternsReducer(state, selectPattern('neon-noir'));
    expect(state.selectedPatternIds.filter(id => id === 'neon-noir')).toHaveLength(1);
  });

  it('can deselect a pattern', () => {
    let state = patternsReducer(initialState, selectPattern('neon-noir'));
    state = patternsReducer(state, deselectPattern('neon-noir'));
    expect(state.selectedPatternIds).not.toContain('neon-noir');
  });

  it('can add a custom pattern', () => {
    const custom = makeValidPattern('my-custom');
    const next = patternsReducer(initialState, addCustomPattern(custom));
    expect(next.availablePatterns.find(p => p.id === 'my-custom')).toBeDefined();
  });
});
```

**Step 2:** Run → **FAIL**

**Step 3: Write implementation** (see [Design Spec §4](./2026-02-28-pattern-set-input-design.md) for full Redux state shape)

```typescript
// src/store/patterns-slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pattern } from '@/core/entities/pattern';
import { PRESET_PATTERNS } from './preset-patterns';

interface PatternsState {
  availablePatterns: Pattern[];
  selectedPatternIds: string[];
  customPatterns: Pattern[];
}

const initialState: PatternsState = {
  availablePatterns: PRESET_PATTERNS,
  selectedPatternIds: [],
  customPatterns: [],
};

const patternsSlice = createSlice({
  name: 'patterns',
  initialState,
  reducers: {
    selectPattern: (state, action: PayloadAction<string>) => {
      if (!state.selectedPatternIds.includes(action.payload)) {
        state.selectedPatternIds.push(action.payload);
      }
    },
    deselectPattern: (state, action: PayloadAction<string>) => {
      state.selectedPatternIds = state.selectedPatternIds.filter(id => id !== action.payload);
    },
    addCustomPattern: (state, action: PayloadAction<Pattern>) => {
      state.customPatterns.push(action.payload);
      state.availablePatterns.push(action.payload);
    },
  },
});

export const { selectPattern, deselectPattern, addCustomPattern } = patternsSlice.actions;
export default patternsSlice.reducer;
```

**Step 4:** Re-run → **PASS**

**Step 5 — Commit:**
```bash
git commit -m "feat(store): add patterns Redux slice with preset patterns + custom pattern support"
```

---

## Task 6: Preset Pattern Library

**Files:**
- `src/store/preset-patterns.ts` ← NEW

```typescript
// src/store/preset-patterns.ts
import { Pattern } from '@/core/entities/pattern';

export const PRESET_PATTERNS: Pattern[] = [
  {
    id: 'neon-noir',
    name: 'Neon Noir',
    description: 'Dark cyberpunk — perfect for gaming, tech, nightlife',
    tags: ['dark', 'bold', 'gaming'],
    background: { type: 'solid', value: '#0d1117', overlayOpacity: 0.7 },
    textSlots: [
      { id: 'headline', zone: 'bottom', align: 'left', fontFamily: 'Inter', fontSizeScale: 1.5, color: '#ffffff', fontWeight: 'extrabold' },
      { id: 'subheadline', zone: 'bottom', align: 'left', fontFamily: 'Inter', fontSizeScale: 0.9, color: '#94a3b8', fontWeight: 'normal' },
      { id: 'cta', zone: 'bottom', align: 'left', fontFamily: 'Inter', fontSizeScale: 0.75, color: '#00f5d4', fontWeight: 'bold' },
    ],
    accentColor: '#00f5d4',
    promptHints: 'Cyberpunk aesthetic, neon accents, dark moody atmosphere',
  },
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    description: 'Professional, whitespace-heavy — ideal for SaaS, B2B',
    tags: ['light', 'professional', 'minimal'],
    background: { type: 'solid', value: '#ffffff', overlayOpacity: 0.88 },
    textSlots: [
      { id: 'headline', zone: 'center', align: 'center', fontFamily: 'Roboto', fontSizeScale: 1.4, color: '#1e293b', fontWeight: 'bold' },
      { id: 'subheadline', zone: 'center', align: 'center', fontFamily: 'Roboto', fontSizeScale: 0.9, color: '#64748b', fontWeight: 'normal' },
      { id: 'cta', zone: 'bottom', align: 'center', fontFamily: 'Roboto', fontSizeScale: 0.8, color: '#2563eb', fontWeight: 'bold' },
    ],
    accentColor: '#2563eb',
  },
  {
    id: 'summer-vibrant',
    name: 'Summer Vibrant',
    description: 'Warm orange-to-pink gradient — lifestyle, FMCG, food',
    tags: ['gradient', 'warm', 'lifestyle'],
    background: { type: 'gradient', value: 'linear-gradient(135deg, #f97316, #ec4899)', overlayOpacity: 0.75 },
    textSlots: [
      { id: 'headline', zone: 'top', align: 'center', fontFamily: 'Outfit', fontSizeScale: 1.6, color: '#ffffff', fontWeight: 'extrabold' },
      { id: 'cta', zone: 'bottom', align: 'center', fontFamily: 'Outfit', fontSizeScale: 0.85, color: '#ffffff', fontWeight: 'bold' },
    ],
    accentColor: '#fde68a',
    promptHints: 'Fun, energetic summer campaign with vibrant warm tones',
  },
  {
    id: 'meme-classic',
    name: 'Meme Classic',
    description: 'No overlay, top/bottom white text — pure meme format',
    tags: ['meme', 'social', 'humor'],
    background: { type: 'solid', value: '#000000', overlayOpacity: 0.0 },
    textSlots: [
      { id: 'headline', zone: 'top', align: 'center', fontFamily: 'Impact', fontSizeScale: 1.8, color: '#ffffff', fontWeight: 'extrabold' },
      { id: 'caption', zone: 'bottom', align: 'center', fontFamily: 'Impact', fontSizeScale: 1.8, color: '#ffffff', fontWeight: 'extrabold' },
    ],
    accentColor: '#ffffff',
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'Near-transparent overlay, large type, premium fashion feel',
    tags: ['minimal', 'premium', 'fashion'],
    background: { type: 'solid', value: '#000000', overlayOpacity: 0.2 },
    textSlots: [
      { id: 'headline', zone: 'top', align: 'left', fontFamily: 'Playfair Display', fontSizeScale: 2.0, color: '#ffffff', fontWeight: 'normal' },
      { id: 'subheadline', zone: 'top', align: 'left', fontFamily: 'Inter', fontSizeScale: 0.7, color: '#e2e8f0', fontWeight: 'normal' },
    ],
    accentColor: '#f1f5f9',
  },
  {
    id: 'bold-promo',
    name: 'Bold Promo',
    description: 'Red-to-yellow urgency gradient — retail flash sales',
    tags: ['gradient', 'promo', 'urgent', 'retail'],
    background: { type: 'gradient', value: 'linear-gradient(135deg, #dc2626, #fbbf24)', overlayOpacity: 0.82 },
    textSlots: [
      { id: 'headline', zone: 'center', align: 'center', fontFamily: 'Outfit', fontSizeScale: 2.0, color: '#ffffff', fontWeight: 'extrabold' },
      { id: 'subheadline', zone: 'center', align: 'center', fontFamily: 'Outfit', fontSizeScale: 1.0, color: '#fef9c3', fontWeight: 'bold' },
      { id: 'cta', zone: 'bottom', align: 'center', fontFamily: 'Outfit', fontSizeScale: 0.9, color: '#ffffff', fontWeight: 'bold' },
    ],
    accentColor: '#fbbf24',
    promptHints: 'Urgent sale promotion, bold call to action, limited time offer',
  },
];
```

**Commit:**
```bash
git commit -m "feat(store): add 6 preset Pattern templates (neon-noir, corporate-clean, summer-vibrant, meme-classic, minimal-mono, bold-promo)"
```

---

## Task 7: Pattern Selector UI Component

**Files:**
- `src/components/pattern-selector.tsx` ← NEW
- `src/__tests__/ui/pattern-selector.test.tsx` ← NEW

**Step 1: Write failing UI test**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { PatternSelector } from '../../../components/pattern-selector';
import { store } from '../../../store';

describe('PatternSelector', () => {
  it('renders all available patterns as cards', () => {
    render(<Provider store={store}><PatternSelector /></Provider>);
    expect(screen.getByText('Neon Noir')).toBeInTheDocument();
    expect(screen.getByText('Corporate Clean')).toBeInTheDocument();
  });

  it('toggles pattern selection on click', () => {
    render(<Provider store={store}><PatternSelector /></Provider>);
    const card = screen.getByTestId('pattern-card-neon-noir');
    fireEvent.click(card);
    expect(card).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(card);
    expect(card).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows variant count badge', () => {
    render(<Provider store={store}><PatternSelector /></Provider>);
    fireEvent.click(screen.getByTestId('pattern-card-neon-noir'));
    fireEvent.click(screen.getByTestId('pattern-card-meme-classic'));
    expect(screen.getByText('2 Variants')).toBeInTheDocument();
  });
});
```

**Step 2:** Run → **FAIL**

**Step 3: Implement `PatternSelector` component** (MUI `Card` + `Chip` grid, live mini-preview using CSS background + overlay)

**Step 4:** Re-run → **PASS**

**Step 5 — Commit:**
```bash
git commit -m "feat(ui): add PatternSelector component with toggle cards and variant count"
```

---

## Task 8: Wire into Generation Page (Integration)

**Files:**
- `src/app/generate/page.tsx` ← MODIFY
- `src/store/index.ts` ← MODIFY

```typescript
// In generate/page.tsx
const { availablePatterns, selectedPatternIds } = useAppSelector(s => s.patterns);
const { backgroundImageId, punchlines } = useAppSelector(s => s.generationInput);
const activePatterns = availablePatterns.filter(p => selectedPatternIds.includes(p.id));

const handleGenerate = async () => {
  const asset = assetRepository.get(backgroundImageId);
  const compositions = await GenerateLayouts.execute({
    backgroundImage: asset,
    punchlines,
    patterns: activePatterns,
    provider: strategyRegistry.getLLM(selectedProvider),
    useLLMCopyVariation,
  });
  dispatch(setCompositions(compositions));
};
```

**Commit:**
```bash
git commit -m "feat(ui): wire PatternSelector and PunchlineForm into generate page"
```

---

## Summary: What Changes vs. Original Plan

| Original Plan | Enhanced Plan |
|---|---|
| Pattern = `promptSnippet: string` | Pattern = visual template (overlay + textSlots + typography) |
| 1 LLM call per variant | 0 LLM calls in template mode; optional in LLM-assist mode |
| Freeform prompt appended | Structured `PunchlineSet` mapped to typed slots |
| No content type awareness | `contentType: 'meme' \| 'ad' \| 'promo'` filters slots |
| No background image lock | `backgroundImage` is fixed; only pattern varies |
| 2 preset patterns | 6 rich preset patterns |

---

*Design Spec: [Pattern-Set Input Design](./2026-02-28-pattern-set-input-design.md)*
