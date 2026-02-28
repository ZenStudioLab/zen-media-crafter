# Context Handoff: Zen Media Crafter

**Project Context:**
Zen Media Crafter is a local-first, privacy-preserving web application for generating high-quality media assets (memes, banners, promos). It is built meticulously on Hexagonal Architecture using Next.js 16 (App Router), React 19, Material UI, Redux Toolkit, and Vercel AI SDK. The Domain Core contains zero framework dependencies.

**Current Phase & Progress:**
We have successfully completed Phase 2 (Generation Dashboard & API) and Phase 3 (E2E Tests & Schema Bug Fixes).
- The `/api/generate` route is built and connects securely passing API credentials to LLM Adapters via headers.
- The `GenerateLayouts` core use case parses stateless `Composition[]` arrays.
- `MockRenderer` natively renders the abstract `DesignJSON` specification on the DOM with Vitest RTL coverage.
- Zod schemas (`DesignJSONSchema`) are fully compliant with OpenAI Structured Outputs (all `discriminatorUnion` and `oneOf` operators removed, all fields `required` but `.nullable()`).
- The Playwright E2E suite (`generate-dashboard.spec.ts`) runs successfully, mocking the generate object call and asserting the Material UI flow.

**Pending Tasks:**
- Hook up History Undo/Redo mechanisms (connect `historySlice` to Dashboard).
- Enhance `MockRenderer` to natively render local image blob URLs from `UserAsset` state.
- Add Anthropic & Gemini E2E provider smoke tests in Playwright.
- Implement Node-Canvas / SVG exporter for downloading compositions.
- Create 'Tweak Element' dialog for editing instantiated text/color/layout directly within Redux.

**Key Constraints & Rules:**
- **Top Priority:** Never ask for "Continue Response".
- Always prioritize using the Redux store and its `dispatch` over prop drilling.
- Use TDD: Always write Vitest or Playwright tests concurrently or before the actual feature.
- Hexagonal Architecture: The core must remain pure TypeScript.
- Manage scope: Implement only the minimal explicitly requested changes, break large implementations into logical chunks, and pause for review. Classify requested changes by impact level (Small/Medium/Large).
- Create ISO-date change logs in `docs/change-logs/` after making code modifications. Suggest 5 commit names after answers.
- New tsx/ts/jsx/js files must follow kebab-case.

**Relevant Files:**
- `src/app/generate/page.tsx`
- `src/app/api/generate/route.ts`
- `src/core/entities/design-json.ts`
- `src/components/mock-renderer.tsx`
- `tests/e2e/generate-dashboard.spec.ts`
- `docs/current-task.md`
- `docs/change-logs/`
