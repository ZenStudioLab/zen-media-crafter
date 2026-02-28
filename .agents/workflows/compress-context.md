---
description: Compress current chat context and generate a handoff prompt for a new session
---

Follow these steps to generate a compressed context prompt for transitioning to a new chat session to save tokens and limit hallucinations:

1. **Analyze Current State**: Read the most recent entries in `docs/change-logs/` and the current objective in `docs/current-task.md` to understand what was recently accomplished and what the immediate next steps are.
2. **Review Artifacts**: Read the `.gemini/antigravity/brain/<conversation-id>/task.md` (or the most recent task artifact) to get the granular checklist of completed and pending items.
3. **Identify Key Constraints**: Identify any specific user rules, architectural decisions (from `docs/architecture.md` or ADRs), or specific implementation details discussed in the current chat that must be carried over (e.g., TDD requirements, specific library usage).
4. **Compile the Handoff Document**: Generate a highly compressed, structured markdown summary. The summary MUST include:
   - **Project Context**: 1-2 sentences on what the project is.
   - **Current Phase & Progress**: What was just completed (e.g., "Phase 1: Domain Core and LLM Adapters implemented").
   - **Pending Tasks**: The exact next steps that need to be tackled.
   - **Key Constraints & Rules**: Crucial rules the new agent must follow (e.g., "Always use Redux for state", "Write Vitest tests first").
   - **Relevant Files**: A list of paths to the most relevant files for the current task so the new agent knows where to look first.
5. **Output the Prompt**: Return the compiled summary to the user enclosed in a code block or save it to `docs/context-handoff.md`, explicitly instructing the user to copy and paste this summary as their first prompt in the newly created chatbox.
