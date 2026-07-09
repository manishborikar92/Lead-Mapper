# 08 — Implementation Plan & Roadmap

### Status: **ARCHITECTURE FROZEN**

---

## 1. Project Initialization Commands

When moving to Phase 2, we will run the following commands sequentially.

### A. Frontend Bootstrap (`web/`)
Create a Next.js App Router project in TypeScript, using npm, with ESLint, with Tailwind CSS enabled, and disabled sub-git setup.

```bash
npx create-next-app@latest web --use-npm --typescript --eslint --tailwind --src-dir --app --import-alias "@/*" --disable-git --yes
```

After creation, install additional frontend packages:
```bash
npm install --prefix web papaparse lucide-react clsx
npm install --prefix web -D @types/papaparse
```

### B. Backend Bootstrap (`server/`)
Initialize a Node.js project in TypeScript with tsx for execution and native test capabilities.

```bash
mkdir server
cd server
npm init -y
```

Install production packages:
```bash
npm install express cors multer csv-parse @google/generative-ai dotenv zod
```

Install development packages:
```bash
npm install -D typescript @types/node @types/express @types/cors @types/multer tsx eslint globals
```

Initialize TS compiler configurations:
```bash
npx tsc --init
```

---

## 2. In-Depth Development Roadmap

### Phase 2: Folder Structure & Base Configurations
* Execute backend/frontend boots.
* Setup configurations:
  * Configure backend `tsconfig.json` for ESM support (`moduleResolution: "node"`, `module: "NodeNext"`).
  * Configure backend `eslint.config.mjs`.
  * Set up backend `.env.example`.
  * Configure frontend CSS styling definitions in `globals.css` (Premium design system).

### Phase 3: Backend Core Logic & Ingestion Service
* Create Zod validators for inputs.
* Write `csv.service.ts` for CSV stream parsing.
* Implement error and file upload middlewares.
* Write controller route endpoints.

### Phase 4: AI Mapping & Prompts
* Write `extraction.prompt.ts` with target constraints.
* Build `ai.service.ts` integrating `@google/generative-ai` with JSON mode outputs.
* Build the double-layered filter logic to skip records missing emails and mobile numbers.

### Phase 5: Verification & Testing
* Write unit tests next to source files for parsing and validations.
* Write API integration tests using `supertest`.
* Fix lint issues and verify coverage targets.

### Phase 6: Frontend Ingestion Dashboard
* Build the drag-and-drop CSV Upload panel.
* Build the PapaParse light CSV reader and raw preview scrolling tables.
* Implement `useCSVImporter.ts` orchestrator hook for chunk batching, retries, and progress computations.

### Phase 7: Deployment & Submit Package
* Deploy Express server on Render Free.
* Deploy React client on Vercel Hobby.
* Setup environment bindings.
* Draft `submission-email.md` file.
