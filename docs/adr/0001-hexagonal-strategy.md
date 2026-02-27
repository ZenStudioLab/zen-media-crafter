# ADR-0001: Hexagonal Architecture with Strategy Pattern

## Status
Accepted

## Context
The project needs to support multiple LLM providers (OpenAI, Anthropic, Gemini, Ollama) and multiple rendering engines (Canvas, SVG, Node-Canvas) while remaining extensible for open-source contributors. We also need a scalable way to handle AI-generated layouts that are user-editable.

## Decision
We will use **Hexagonal Architecture** (Ports and Adapters) combined with the **Strategy Pattern**.

- **Domain Core**: Business logic for projects, compositions, and image processing.
- **Ports**: TypeScript Interfaces defining the contract for `ILLMProvider` and `IRenderingEngine`.
- **Adapters**: Concrete implementations (e.g., `OpenAIAdapter`, `CanvasRenderer`) that register themselves with a central `StrategyRegistry`.

## Consequences
- **Positive**: Adding new providers or renderers requires zero changes to the core logic. Testing is simplified by mocking adapters.
- **Negative**: Initial setup involves more boilerplate (interfaces, registries).
- **Risks**: Complexity in the `DesignJSON` schema if rendering engines diverge too much.
