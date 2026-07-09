# 01 — Architecture Specification

### Status: **ARCHITECTURE FROZEN**

---

## 1. Language Decision & Constraints

We will use **TypeScript exclusively** cross-stack.
* **Scope**: All application source files in both `web/` and `server/` must be written in TypeScript (`.ts` and `.tsx` extensions).
* **JavaScript Exception**: JavaScript files (`.js` or `.mjs`) are permitted **only** where strictly required by framework configuration tools (e.g., `next.config.mjs`, `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json`).
* **Strict Mode**: The TypeScript configuration (`tsconfig.json`) on both sides will enforce:
  * `strict: true` (strict type checking)
  * `noImplicitAny: true`
  * `strictNullChecks: true`
  * `skipLibCheck: true`

---

## 2. Architectural Style: Feature-Based Modular Architecture

To ensure clean boundaries and ease of review, we will adopt a **Feature-Based Modular Architecture** for both applications.

### Design Principles
* **Co-location**: Code that changes together lives together. A single feature folder contains its routes, controllers, services, prompts, validators, types, and unit tests.
* **Low Coupling**: Features communicate with other features only via explicit interfaces or shared utilities.
* **High Cohesion**: Avoid bloated global directories like `controllers/` or `services/` containing unrelated domains.

### Frontend Component Architecture
* **Server Components**: Used for static wrappers, root HTML structures, metadata declarations, and SEO parameters.
* **Client Components (`"use client"`)**: Used for the interactive dashboard pages, drag-and-drop zones, rendering scrolling tables, progress loaders, and controlling states.
* **State Location**: State is encapsulated in custom React hooks (e.g. `useCSVImporter`) that manage:
  * Uploaded file references and raw parsed rows.
  * Ingestion progress counters, batch states, and retry queues.
  * Extracted records, errors, and skipped row trackers.
* **API clients**: Extracted into clean stateless services.

### Backend Routing & Controller Architecture
* **app.ts vs. server.ts Split**:
  * **`app.ts`**: Configures the Express application, registers third-party middleware (CORS, body-parser, file upload handler), binds routers, and sets up central error handling middleware.
  * **`server.ts`**: Entry point that imports `app.ts`, reads environment configurations, and starts the HTTP server. This allows tests to import `app.ts` to execute route validations in-memory without blocking TCP ports.
* **Async Route Handling**: Express 5.1.0 natively catches rejected promises in middleware and route handlers, passing them directly to the error handling middleware. We do not need external libraries like `express-async-errors`.
