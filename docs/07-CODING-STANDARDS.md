# 07 — Coding Standards & Development Guidelines

### Status: **ARCHITECTURE FROZEN**

---

## 1. Naming Conventions

* **Source Files**:
  * React Components: `kebab-case.tsx` (e.g., `csv-upload.tsx`, `progress-bar.tsx`).
  * Backend Source: `kebab-case.ts` (e.g., `importer.controller.ts`, `env.config.ts`).
  * Configuration: `kebab-case.js` or `kebab-case.mjs`.
* **Variables & Functions**:
  * Standard: `camelCase` (e.g., `processBatch`, `skippedCount`).
  * Custom Hooks: `use` prefix (e.g., `useCSVImporter`).
* **Classes & Interfaces**:
  * Standard: `PascalCase` (e.g., `CsvService`, `CRMRecord`).
* **Constants**:
  * Standard: `UPPER_SNAKE_CASE` (e.g., `ALLOWED_CRM_STATUSES`, `PORT`).

---

## 2. Import Organization & Aliases

### Frontend (`web/`)
We use absolute path aliases configured via `@/*` pointing to `src/*`:
```typescript
import { useState } from 'react';
import { useCSVImporter } from '@/features/importer/hooks/useCSVImporter';
import { CSVUpload } from '@/features/importer/components/csv-upload';
import { cn } from '@/lib/utils';
```

### Backend (`server/`)
To keep runtime executions free of complex compiler paths and third-party resolution wrappers (like `tsconfig-paths`), we will use **clean relative paths** in the backend:
```typescript
import express from 'express';
import { env } from '../../config/env.config';
import { validateBody } from '../../shared/middlewares/validation.middleware';
```

---

## 3. Error Handling & Logging

* **No Swallowing Errors**: Every catch block must handle the error or propagate it.
* **Express Error Boundary**: Catch errors in route handlers and forward them to Express's global handler:
  ```typescript
  try {
    const result = await this.importerService.process(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
  ```
* **Structured Logger**: Define a basic console wrapper:
  `[YYYY-MM-DD HH:MM:SS] [LEVEL] [MODULE] - Message`
  Example: `[2026-07-09 18:00:00] [INFO] [CSV_PARSER] - Parsed 120 rows from uploaded file.`

---

## 4. Conventional Commits

We follow the Conventional Commits specification:
* `feat: ...` for new features
* `fix: ...` for bug fixes
* `docs: ...` for documentation updates
* `test: ...` for adding or fixing tests
* `chore: ...` for updating dependencies or build configs
* `refactor: ...` for code changes that neither fix a bug nor add a feature
