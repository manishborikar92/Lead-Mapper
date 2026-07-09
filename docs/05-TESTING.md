# 05 — Testing Strategy & Verification Plan

### Status: **ARCHITECTURE FROZEN**

---

## 1. Test Framework Selection

We will use the **native Node.js Test Runner** (`node:test`) executed via `tsx` for TypeScript test compilation.
* **No Dependencies**: Eliminates the overhead of configuring Jest, Babel, or ts-jest in ESM projects.
* **Extreme Performance**: The native runner runs tests concurrently and has minimal startup latency.
* **Testing Command**:
  ```bash
  npm run test --prefix server
  ```
  Which triggers:
  ```bash
  tsx --test "src/features/**/*.test.ts"
  ```

---

## 2. Test Plan & Coverage Scope

We aim for **85%+ code coverage** in critical system layers (CSV parser, Zod validator, AI mapping connectors).

### Unit Tests
* **CSV Parsing (`csv.service.ts`)**:
  * Verify parsing of valid CSV arrays.
  * Verify handling of empty rows, missing headers, extra whitespace, and quoted line breaks.
* **Zod Schema Validation (`importer.validator.ts`)**:
  * Verify validation and coercion of valid records.
  * Verify rejection of malformed schemas (e.g., invalid dates, incorrect status enums).
* **AI Gateway & Pipeline Mocking (`ai.gateway.test.ts`)**:
  * Mock `callModel` on `GoogleGeminiProvider` to verify fallback routing, cooldown registry logs, and circuit breaker metrics.
  * Test preprocessor fuzzy mapping and confidence band classifications.
  * Test Request LRU cache hashing, hit/miss, and eviction limits.

### Integration Tests
* **HTTP API Routes (`importer.routes.ts`)**:
  * Use `supertest` to trigger endpoints on the Express `app` instance.
  * Test `POST /api/process-batch` with valid and invalid payloads.
  * Test route-level error middlewares (asserting `500` status codes on service crashes).
  * Validate CORS headers on responses.

---

## 3. Code Coverage Execution

We measure code coverage using Node's built-in coverage runner:
```bash
npm run test:coverage --prefix server
```
Which maps to:
```bash
node --import tsx --test --experimental-test-coverage "tests/**/*.test.ts"
```

---

## 4. Live API Verification (Sample Data Suite)

To verify that the application works seamlessly with a real Gemini API key and processes messy columns, locations, date formats, and edge cases, execute:
```bash
node --import tsx --env-file=.env tests/verify_live_api.ts
```
Inside the `server/` directory. This script will:
1. Load environment variables and the real `GEMINI_API_KEY`.
2. Read the five CSV datasets in `docs/sample-data/`.
3. Parse and map them through a live call to the AI Gateway (routing to `gemini-3.1-flash-lite`).
4. Execute automated validations to assert that name, email, normalized phone, enums, multiple contacts mapping, and programmatically skipped rows behave correctly.
