# Current Task: Phase 0 — Foundation

**Sprint:** Phase 0  
**Status:** Planning Complete → Ready for Execution  
**Last Updated:** 2026-02-27  
**Owner:** Toan

---

## Big Picture

Build the foundation of Zen Media Crafter: scaffold the project, define all ports/interfaces, wire the StrategyRegistry, and write the first passing unit tests for the Domain Core. No LLM integration yet — we're establishing the **skeleton that everything else hangs from**.

---

## Phase 0 Goals

1. **Scaffold**: Next.js 16 + React 19 + MUI + Redux Toolkit + Vitest + Playwright
2. **Domain Core**: Entities (`Project`, `Composition`, `DesignJSON`, `UserAsset`) with Zod validation
3. **Ports**: TypeScript interfaces (`ILLMProvider`, `IRenderingEngine`, `IExporter`)
4. **Registry**: `StrategyRegistry` singleton — registers and retrieves strategies
5. **Mock Adapters**: `MockLLMProvider` + `MockRenderer` for TDD-first development
6. **First Tests**: Full TDD cycle for `GenerateLayouts` use case using mocks
7. **Config UI**: API Key input form (Redux slice — no generation yet)

---

## Acceptance Criteria

- [ ] `npx vitest run` passes with ≥1 test for each use case
- [ ] `StrategyRegistry` unit tests: register, retrieve, throw on unknown ID
- [ ] `DesignJSON` Zod schema rejects invalid payloads
- [ ] `GenerateLayouts` use case: calls `ILLMProvider` N times (tested with mock)
- [ ] `npm run dev` starts without errors
- [ ] API Key form renders and persists to Redux store

---

## Phase Roadmap

| Phase | Focus | Status |
|---|---|---|
| **Phase 0** | Foundation (scaffold, ports, registry, TDD) | 🟡 In Progress |
| **Phase 1** | OpenAI Adapter + Canvas Renderer (real data) | ⬜ Not Started |
| **Phase 2** | Generation UI (upload, prompt, gallery) | ⬜ Not Started |
| **Phase 3** | Tweak Editor (sidebar, live preview) | ⬜ Not Started |
| **Phase 4** | Export + Download (Node-Canvas SSR) | ⬜ Not Started |
| **Phase 5** | Gemini + Ollama Adapters | ⬜ Not Started |

---

## Key Docs

- [Architecture](./architecture.md)
- [File Organization](./project-mapping.md)
- [ADR-0001: Hexagonal + Strategy](./adr/0001-hexagonal-strategy.md)
- [ADR-0002: DesignJSON Schema](./adr/0002-design-json-schema.md)
- [ADR-0003: TDD Approach](./adr/0003-tdd-approach.md)
- [Design Plan](./plans/2026-02-27-zen-media-crafter-design.md)
