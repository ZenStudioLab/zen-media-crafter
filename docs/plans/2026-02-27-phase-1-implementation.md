# Phase 1 Implementation Plan & Task Tracking

**Status:** Ready for Execution
**Date:** 2026-02-27
**Stack:** Next.js 16 (App Router) · Vitest · Playwright · Redux Toolkit · MUI · Zod

---

## The Master Checklist (TDD-First)

> **Rule:** No production code without a failing test first.

### 1. Foundation Scaffold
- [ ] Initialize Next.js 16 App Router: `npx create-next-app@latest ./`
- [ ] Install dependencies: `npm i @reduxjs/toolkit react-redux @mui/material @mui/icons-material zod ai @ai-sdk/openai`
- [ ] Install dev dependencies: `npm i -D vitest @vitest/coverage-v8 playwright`
- [ ] Configure `vitest.config.ts` (node environment, 80% coverage threshold for core/registry)
- [ ] Configure `playwright.config.ts`

### 2. Domain Core (Red → Green → Refactor)
- [ ] Test + Implement `DesignJSONSchema` (Zod parsing, validation rules)
- [ ] Test + Implement `Project` and `Composition` entities
- [ ] Test + Implement `StrategyRegistry` (singleton, registration, retrieval)
- [ ] Test + Implement `GenerateLayouts` use case (mocking `ILLMProvider`)

### 3. Redux Architecture
- [ ] Setup `store/index.ts`
- [ ] Create `api-keys-slice.ts` (OpenAI, Gemini keys)
- [ ] Create `ui-slice.ts` (theme, sidebar, selected provider)
- [ ] Create `project-slice.ts` (active elements, compositions)

### 4. Mock Adapters (For Testing)
- [ ] Create `MockLLMProvider` in `src/__tests__/fixtures/`
- [ ] Create `MockRenderer` in `src/__tests__/fixtures/`

### 5. Open AI Adapter integration
- [ ] TDD: Write integration test for `OpenAIAdapter` mapping `DesignJSON` correctly
- [ ] Implement `OpenAIAdapter` using `@ai-sdk/openai` and `generateObject` with Zod schema
- [ ] Register `OpenAIAdapter` in `instrumentation.ts`

### 6. First UI Verification
- [ ] Build API Key configuration UI (MUI Sidebar / Dialog)
- [ ] Connect UI to `api-keys-slice`
- [ ] Ensure Redux DevTools show state updating correctly

---

## Verification Gates

1. `npx vitest run --coverage` → ≥80% coverage for Domain Core
2. `npm run dev` → starts on port 3000 without errors
3. Redux state successfully logs an API key change
