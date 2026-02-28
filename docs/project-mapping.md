# Zen Media Crafter: File Organization

**Author:** Toan  
**Last Updated:** 2026-02-28

> This is the canonical source of truth for where code lives. Follow this structure strictly to maintain the Hexagonal Architecture.

---

## Root Structure

```
zen-media-crafter/
├── app/                    # Next.js App Router (UI + Server Actions)
├── src/                    # All application source code
│   ├── core/               # Domain Core (NO framework/external deps)
│   ├── ports/              # TypeScript interfaces (contracts)
│   ├── adapters/           # Concrete implementations
│   ├── registry/           # StrategyRegistry singleton
│   ├── store/              # Redux Toolkit slices
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Pure utility functions
│   └── __tests__/          # Unit + integration tests (mirrors src/)
├── tests/
│   └── e2e/                # Playwright E2E tests
├── docs/
│   ├── adr/                # Architecture Decision Records
│   ├── plans/              # Versioned design plans
│   └── change-logs/        # ISO-date change logs
├── public/                 # Static assets
├── vitest.config.ts
├── playwright.config.ts
└── next.config.ts
```

---

## Detailed Source Map

### `src/core/` — Domain Core
> Pure TypeScript. Zero imports from Next.js, MUI, Redux, or any LLM SDK.

```
src/core/
├── entities/
│   ├── project.ts          # Project aggregate root
│   ├── composition.ts      # Single design variant
│   ├── design-json.ts      # DesignJSON type + Zod schema (incl. overlay field)
│   ├── user-asset.ts       # Uploaded image reference
│   ├── pattern.ts          # Pattern visual template entity + Zod schema [NEW]
│   └── punchline-set.ts    # Structured copy input entity + Zod schema [NEW]
├── use-cases/
│   ├── generate-layouts.ts # Maps PunchlineSet onto Patterns; optional LLM copy variation
│   ├── map-punchlines-to-slots.ts  # Pure fn: distributes copy into pattern slots [NEW]
│   ├── tweak-element.ts    # Mutates one DesignJSON element
│   └── export-asset.ts     # Calls IRenderingEngine + IExporter
└── value-objects/
    ├── canvas-dimensions.ts
    └── element-style.ts
```

### `src/ports/` — Contracts (Interfaces)

```
src/ports/
├── i-llm-provider.ts       # interface ILLMProvider
├── i-rendering-engine.ts   # interface IRenderingEngine
└── i-exporter.ts           # interface IExporter
```

### `src/adapters/` — Implementations

```
src/adapters/
├── llm/
│   ├── openai-adapter.ts   # implements ILLMProvider (OpenAI via Vercel AI SDK)
│   ├── gemini-adapter.ts   # implements ILLMProvider (Google Gemini)
│   └── ollama-adapter.ts   # implements ILLMProvider (local Ollama)
└── renderers/
    ├── canvas-renderer.ts      # implements IRenderingEngine (client-side Canvas)
    ├── svg-renderer.ts         # implements IRenderingEngine (SVG)
    └── node-canvas-renderer.ts # implements IRenderingEngine (SSR, server only)
```

### `src/registry/`

```
src/registry/
├── strategy-registry.ts    # Singleton registry (Singleton Pattern)
└── index.ts                # re-exports
```

### `src/store/` — Redux Slices

```
src/store/
├── index.ts                # configureStore()
├── api-keys-slice.ts       # OpenAI, Gemini, Anthropic keys
├── project-slice.ts        # Active project + compositions
├── patterns-slice.ts       # Pattern library, selectedPatternIds, customPatterns [NEW]
├── generation-input-slice.ts  # backgroundImageId, PunchlineSet, useLLMCopyVariation [NEW]
├── preset-patterns.ts      # Built-in Pattern library (6 presets) [NEW]
├── ui-slice.ts             # Generation state, selected provider/renderer
└── history-slice.ts        # Undo/redo stack
```

### `src/hooks/`

```
src/hooks/
├── use-generate-layouts.ts # Dispatches GenerateLayouts use case
├── use-selected-composition.ts
├── use-patterns.ts         # Selects patterns from Redux, toggle helpers [NEW]
└── use-api-keys.ts
```

### `app/` — Next.js App Router

```
app/
├── layout.tsx              # Root: ThemeProvider + Provider (Redux)
├── page.tsx                # Home: upload + configure
├── generate/
│   └── page.tsx            # Generation view
├── gallery/
│   └── page.tsx            # Results gallery + download
└── api/
    ├── generate/
    │   └── route.ts        # POST: runs GenerateLayouts (server)
    └── export/
        └── route.ts        # POST: runs ExportAsset via Node-Canvas (server)
```

### `src/__tests__/` — Test Mirror

```
src/__tests__/
├── core/
│   ├── entities/
│   │   ├── pattern.test.ts         # Pattern Zod schema validation [NEW]
│   │   └── punchline-set.test.ts   # PunchlineSet Zod schema validation [NEW]
│   └── use-cases/
│       ├── generate-layouts.test.ts
│       └── map-punchlines-to-slots.test.ts  # Slot distribution logic [NEW]
├── adapters/
│   ├── llm/                # Integration tests for LLM adapters
│   └── renderers/          # Integration tests for renderers
├── registry/               # Unit tests for StrategyRegistry
├── store/
│   ├── patterns-slice.test.ts         # Select/deselect/custom pattern [NEW]
│   └── generation-input-slice.test.ts # Input state mutations [NEW]
└── ui/
    ├── pattern-selector.test.tsx      # Toggle cards, variant count badge [NEW]
    └── ...
```

### `tests/e2e/`

```
tests/e2e/
├── generate-layouts.spec.ts    # Upload → Select patterns → Generate N variants
├── pattern-selector.spec.ts    # Pattern card toggle, variant count [NEW]
├── tweak-element.spec.ts       # Edit text without regenerating
└── export-asset.spec.ts        # Download final asset
```

---

## Naming Conventions

| File type | Convention | Example |
|---|---|---|
| TypeScript files | `kebab-case.ts` | `openai-adapter.ts` |
| React components | `kebab-case.tsx` | `composition-card.tsx` |
| Test files | `kebab-case.test.ts` | `generate-layouts.test.ts` |
| Interfaces | `i-prefix.ts` | `i-llm-provider.ts` |
| Redux slices | `kebab-case-slice.ts` | `project-slice.ts` |
| ADRs | `NNNN-title.md` | `0001-hexagonal-strategy.md` |
| Change logs | `YYYY-MM-DD.md` | `2026-02-27.md` |
| Design plans | `YYYY-MM-DD-topic-design.md` | `2026-02-27-zen-media-crafter-design.md` |

---

## Dependency Rules

```
app/ → src/hooks/ → src/store/ → src/core/
                 ↘ src/ports/
src/adapters/ → src/ports/ (implements)
src/registry/ → src/ports/ (stores)
src/core/ → src/ports/ (uses)
```

> ⚠️ `src/core/` must NEVER import from `src/adapters/`, `src/registry/`, `app/`, or any framework.
