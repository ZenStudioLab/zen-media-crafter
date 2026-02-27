# Zen Media Crafter: AI-Driven Layout Engine Design

**Status:** Drafted
**Date:** 2026-02-27

## Goal
A local-first UI tool that takes images as input and generates N unique, AI-driven layouts (memes, banners, ads, promos) that are downloadable and user-editable.

## Tech Stack
- **Frontend:** TypeScript, Vite, React, Material UI.
- **State:** Redux Toolkit (History, API Keys, active project state).
- **Core Patterns:** Hexagonal Architecture + Strategy Pattern.
- **LLM Integration:** Vercel AI SDK (with Strategy Pattern for swappable providers).
- **Rendering:** Multi-Strategy (Canvas, SVG, Node-Canvas).

## Architecture

### 1. The Strategy Registry
A central registry holds:
- `LLMProviders`: Strategies for generating `DesignJSON` from prompts.
- `RenderEngines`: Strategies for rendering `DesignJSON` to images.

### 2. The `DesignJSON` Schema
The "contract" between the AI and the Renderers:
```json
{
  "canvas": { "width": 1080, "height": 1080 },
  "background": { "type": "solid|gradient|image", "value": "#hex" },
  "elements": [
    {
      "id": "uuid",
      "type": "text",
      "content": "Summer Sale",
      "style": { "fontSize": 48, "color": "#fff", "fontFamily": "Inter" },
      "position": { "x": 100, "y": 200 }
    },
    {
      "id": "uuid",
      "type": "image",
      "src": "user_asset_id",
      "transform": { "scale": 1.2, "rotation": 0 }
    }
  ]
}
```

### 3. UI/UX: Hybrid Editing
- **Generation:** AI proposes N layouts based on user input.
- **Refinement:** User selects a layout, then uses a Material UI sidebar to "tweak" text, colors, and positions.
- **Preview:** Live preview via the selected `RenderEngine` (Canvas/SVG).

## Implementation Roadmap
1. **Scaffold Core:** Vite + React + MUI + Redux.
2. **Registry & Interfaces:** Define `ILLMProvider` and `IRenderingEngine`.
3. **Primary Strategies:** Implement `OpenAIAdapter` and `CanvasRenderer`.
4. **AI Integration:** Prompts for generating `DesignJSON`.
5. **Editing UI:** Sidebar for tweaking `DesignJSON` elements.
6. **Download:** Exporting the rendered result.
