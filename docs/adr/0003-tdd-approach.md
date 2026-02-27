# ADR-0003: Test-Driven Development as First-Class Practice

**Status:** Accepted  
**Date:** 2026-02-27  
**Skill Applied:** `architecture-decision-records`, `test-driven-development`

---

## Context

The project employs Hexagonal Architecture with multiple swappable adapters and a `DesignJSON` schema as a port contract. Without systematic testing discipline, the risk of regressions between adapters is high.

Furthermore, because LLM providers can produce unpredictable output, the validation and use-case logic must be proven correct in isolation before integration — which is exactly what TDD enables.

---

## Decision

All code in `src/core/`, `src/ports/`, and `src/adapters/` must follow **Red → Green → Refactor** as specified by the `test-driven-development` skill.

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

---

## Testing Pyramid

```
          /      E2E       \     ← Playwright (slow, few)
         / Unit+Integration \   ← Vitest (fast, many)
        /      Unit          \  ← Vitest (instant, most)
```

| Layer | Tool | Location | Coverage Target |
|---|---|---|---|
| Domain Core (entities, use cases) | Vitest | `src/__tests__/core/` | **≥ 80%** |
| Ports (interfaces — tested via mocks) | Vitest | `src/__tests__/core/` | covered by use case tests |
| Adapters (LLM, renderers) | Vitest | `src/__tests__/adapters/` | **≥ 60%** |
| StrategyRegistry | Vitest | `src/__tests__/registry/` | **≥ 90%** |
| UI Components | Vitest + React Testing Library | `src/__tests__/ui/` | **≥ 60%** |
| E2E Workflows | Playwright | `tests/e2e/` | Key user journeys |

---

## Tooling Setup

```bash
# Unit/integration
npx vitest run                   # Run all tests once
npx vitest watch                 # Watch mode (TDD loop)
npx vitest run --coverage        # Coverage report

# E2E
npx playwright test              # All E2E tests
npx playwright test --ui         # Visual runner
```

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',  // for core/adapters
    globals: true,
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
      include: ['src/core/**', 'src/registry/**'],
    },
  },
});
```

---

## Mock Strategy

Per the Hexagonal Architecture, adapters are mocked at the port interface level. **Never mock internal domain logic.**

```typescript
// src/__tests__/core/use-cases/generate-layouts.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GenerateLayouts } from '../../../core/use-cases/generate-layouts';
import type { ILLMProvider } from '../../../ports/i-llm-provider';

const mockProvider: ILLMProvider = {
  id: 'mock',
  generateDesign: vi.fn().mockResolvedValue({
    version: '1.0',
    canvas: { width: 1080, height: 1080 },
    background: { type: 'solid', value: '#000000' },
    elements: [],
  }),
};

describe('GenerateLayouts', () => {
  it('calls the LLM provider N times', async () => {
    const useCase = new GenerateLayouts(mockProvider);
    const results = await useCase.execute({ prompt: 'test', n: 3, assets: [] });
    expect(mockProvider.generateDesign).toHaveBeenCalledTimes(3);
    expect(results).toHaveLength(3);
  });
});
```

---

## Red Flags (indicators to stop and restart with TDD)

- Code written before a test file exists
- Test passes immediately on first run (it can't — the code didn't exist yet)
- "I'll add tests later" — there is no later in this project
- Mocking internal domain entities (only mock external ports)

---

## Consequences

### Positive
- Regressions between adapter swaps are caught immediately
- Domain Core can be tested without any LLM API key or browser
- New contributors can verify their adapter is correct before integration
- Enables safe refactoring of the `DesignJSON` schema

### Negative
- Slightly more upfront time to write tests before implementation
- Mock setup for LLM adapters requires understanding the port contract

### Mitigations
- `MockLLMProvider` and `MockRenderer` are provided in `src/__tests__/fixtures/`
- Vitest watch mode (`npx vitest watch`) makes the TDD loop fast

---

## Related Decisions

- [ADR-0001](0001-hexagonal-strategy.md) — Hexagonal Architecture makes ports easily mockable
- [ADR-0002](0002-design-json-schema.md) — Zod schema is itself unit-tested
