# 02 — Folder Structure & Modular Boundaries

### Status: **ARCHITECTURE FROZEN**

---

## 1. Repository Directory Map

The codebase is split into `web/` (Next.js frontend) and `server/` (Express backend) directories. We use a **Feature-Based Modular Structure** to co-locate code by concern.

```
Lead-Mapper/
├── docs/                                # Project documentation
│   ├── 00-INDEX.md                      # Entry point index
│   ├── 01-ARCHITECTURE.md               # Architecture details
│   ├── 02-FOLDER-STRUCTURE.md           # This document
│   ├── 03-API.md                        # API specification
│   ├── 04-AI.md                         # Prompt & LLM design
│   ├── 05-TESTING.md                    # Testing strategy
│   ├── 06-DEPLOYMENT.md                 # Deployment steps
│   ├── 07-CODING-STANDARDS.md           # Coding style
│   └── 08-IMPLEMENTATION-PLAN.md        # Roadmap & init commands
├── server/                              # Node.js + Express Backend
│   ├── src/
│   │   ├── config/                      # Global configurations
│   │   │   └── env.config.ts
│   │   ├── features/                    # Feature modules
│   │   │   └── importer/                # Importer feature module
│   │   │       ├── importer.controller.ts
│   │   │       ├── importer.routes.ts
│   │   │       ├── importer.validator.ts
│   │   │       ├── csv.service.ts       # CSV parsing service
│   │   │       ├── ai.service.ts        # AI mapping service
│   │   │       ├── extraction.prompt.ts # Prompt templates
│   │   │       └── importer.test.ts     # In-folder unit tests
│   │   ├── shared/                      # Shared global resources
│   │   │   └── middlewares/
│   │   │       ├── error.middleware.ts
│   │   │       └── upload.middleware.ts
│   │   ├── app.ts                       # Express application configuration
│   │   └── server.ts                    # Entrypoint execution
│   ├── package.json
│   ├── tsconfig.json
│   └── eslint.config.mjs
├── web/                                 # Next.js Frontend
│   ├── src/
│   │   ├── app/                         # Routing pages and layouts
│   │   │   ├── layout.tsx               # Root wrapper
│   │   │   ├── page.tsx                 # Main dashboard route
│   │   │   └── globals.css              # Custom premium design tokens
│   │   ├── features/                    # Feature modules
│   │   │   └── importer/                # CSV Importer module
│   │   │       ├── components/
│   │   │       │   ├── csv-upload.tsx   # Dropzone
│   │   │       │   ├── csv-preview-table.tsx
│   │   │       │   ├── progress-bar.tsx
│   │   │       │   └── result-dashboard.tsx
│   │   │       ├── hooks/
│   │   │       │   └── useCSVImporter.ts # Orchestrator hook
│   │   │       ├── services/
│   │   │       │   └── api.ts           # Axios/Fetch API caller
│   │   │       └── types.ts             # Module specific types
│   │   ├── shared/                      # Shared cross-feature UI elements
│   │   │   └── components/
│   │   │       └── ui/                  # Buttons, cards, modals (if any)
│   │   └── lib/                         # Standard utilities (fetch wrapper, etc.)
│   ├── package.json
│   ├── tsconfig.json
│   └── eslint.config.mjs
```

---

## 2. Feature Boundary Rules

To prevent code entanglement, we establish strict directory rules:

* **Self-Containment**: A feature subdirectory under `src/features/` must contain all files relevant to that specific domain. Unrelated domains must not import directly from `features/importer/` unless there is a global interface declared.
* **Shared Logic**: Code that is generic and re-usable across multiple features (e.g. Express error middleware, button styling classes) must reside in `src/shared/` or `src/lib/`.
* **Feature Tests**: Unit and integration tests for a feature must be written in the same directory as the source code (e.g. `importer.test.ts`), maintaining immediate access and visibility.
