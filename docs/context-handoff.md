# Zen Media Crafter - Context Handoff

**Project Context**: Zen Media Crafter is a local-first, privacy-preserving tool for generating high-quality media assets (memes, banners, ads) using user-provided images and AI-generated layouts. It is built using Next.js 16 (App Router), React 19, Redux Toolkit, and MUI, strictly following Hexagonal Architecture and the Strategy Pattern.

**Current Phase & Progress**: We are finishing up Phase 0 (Foundation) and moving into Phase 2 (Generation UI). We just successfully wired the `PatternSelector` component and `PunchlineSet` form inputs into `src/app/generate/page.tsx`. Additionally, we refactored the `POST /api/generate` endpoint to accept the new `GeneratePayloadSchema` (deterministic patterns and punchline variables), hardened API error boundaries, fixed all TypeScript type errors, and ensured 100% of Vitest unit tests (35/35) pass, including proper mock handling for the LLM adapter in `generate.test.ts`.

**Pending Tasks (Next Steps)**:
1. **E2E Testing**: Add Playwright end-to-end tests for the `PatternSelector` and the generation flow to ensure the UI behaves correctly in the browser.
2. **Deep-Merge LLM Copy**: Implement the `mergeWithLLMSuggestions` placeholder in `GenerateLayouts` so the LLM copy variations are actually injected into the output `DesignJSON` text nodes.
3. **UI Enhancements**: Integrate `lucide-react` icons across the `GeneratePage` and replace the hardcoded `mockUploadAsset` with a real image upload/selection mechanism.
4. **Custom Pattern Creator**: Begin building an admin UI to visually create and tweak custom `Pattern` templates instead of hardcoding them in `preset-patterns.ts`.

**Key Constraints & Rules**:
- **Hexagonal Architecture**: The Domain Core must remain framework-free (no React/Next.js imports) and 100% unit-testable.
- **Test-Driven Development (TDD)**: Always write failing Vitest or Playwright tests first before implementing functionality (Red -> Green -> Refactor).
- **State Management**: Always prioritize using Redux Toolkit (`dispatch`) over prop drilling.
- **DesignJSON Schema**: Strictly adhere to ADR-0002 for canvas element configurations (background, layers, overlays).
- **Commits & Logs**: After code changes, summarize what was done, ask for confirmation, suggest 5 commit names, and append the work to the daily changelog (`docs/change-logs/`).

**Relevant Files**:
- UI: `src/app/generate/page.tsx`, `src/components/pattern-selector.tsx`
- API & Core: `src/app/api/generate/route.ts`, `src/core/use-cases/generate-layouts.ts`
- Tests: `src/__tests__/api/generate.test.ts`, `tests/e2e/generate-dashboard.spec.ts`
