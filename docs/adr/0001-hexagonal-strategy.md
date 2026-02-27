# ADR-0001: Hexagonal Architecture with Strategy Pattern

**Status:** Accepted  
**Date:** 2026-02-27  
**Skills Applied:** `architecture-patterns`, `design-patterns-implementation`, `architecture-decision-records`

---

## Context

The project must support multiple LLM providers (OpenAI, Gemini, Anthropic, Ollama) and multiple rendering engines (Canvas, SVG, Node-Canvas). Both dimensions need to be:
- **Independently swappable** at runtime without modifying core logic
- **Independently testable** without external API keys or a browser
- **Extendable by open-source contributors** without deep coupling

---

## Decision Drivers

- Adding a new LLM provider must require **zero changes to the core**
- The test suite must be runnable **without any API key** (mocks via ports)
- AI-generated layouts must be **user-editable** via a generic UI (requires a stable intermediate format)
- **SOLID**: Open/Closed Principle — open to extension, closed to modification

---

## Considered Options

### Option A: Monolithic Service Class
- **Pro**: Simple to start; one file to understand
- **Con**: Each new LLM or renderer requires touching the same class; no isolation for testing; violates OCP

### Option B: MVC with Service Layer
- **Pro**: Familiar pattern to most web developers
- **Con**: Services still need to know about concrete implementations; poor testability without full framework bootstrap

### Option C: Hexagonal Architecture + Strategy Pattern ✅
- **Pro**: Domain Core is framework-free; ports mock trivially; strategies swap at runtime; new adapters don't touch core
- **Con**: More upfront boilerplate; requires understanding of DI and interface design

---

## Decision

We use **Hexagonal Architecture** (Ports and Adapters) with the **Strategy Pattern** and a **Singleton StrategyRegistry**.

- **Domain Core**: Business logic (entities + use cases). No framework imports.
- **Ports**: TypeScript interfaces — `ILLMProvider`, `IRenderingEngine`, `IExporter`.
- **Adapters**: Concrete implementations registered into `StrategyRegistry` at startup.
- **StrategyRegistry**: Central Singleton that maps `id → strategy`. Wired in `instrumentation.ts`.

---

## Data Flow

```
User Input
    ↓
React UI (Redux dispatch)
    ↓
Next.js Server Action / API route
    ↓
GenerateLayouts (Use Case, Domain Core)
    ↓ calls ↓
ILLMProvider (port) → OpenAIAdapter (adapter)
    ↓ returns DesignJSON (validated by Zod)
IRenderingEngine (port) → CanvasRenderer (adapter)
    ↓ returns Blob
UI receives Composition[]
```

---

## Test Implications

Because adapters implement a port interface, any adapter can be replaced by a mock in tests:

```typescript
const mock: ILLMProvider = {
  id: 'mock',
  generateDesign: vi.fn().mockResolvedValue(validDesignJSON),
};
// No API key. No network. Instant.
```

See [ADR-0003](0003-tdd-approach.md) for the full testing strategy.

---

## Consequences

### Positive
- Adding a new LLM provider = create one file + register it → zero core changes ✅
- Domain Core unit tests run without any external service ✅
- The `DesignJSON` contract decouples LLM output from renderer input ✅

### Negative
- Initial setup involves more boilerplate (interfaces, registries, DI wiring)
- Contributors must understand port/adapter concepts before contributing

### Risks
- `DesignJSON` schema complexity if renderers need highly divergent inputs
- Mitigation: Formalized in [ADR-0002](0002-design-json-schema.md) with a Zod schema and versioning strategy

---

## Related Decisions

- [ADR-0002](0002-design-json-schema.md) — The `DesignJSON` port contract
- [ADR-0003](0003-tdd-approach.md) — TDD strategy enabled by this architecture
