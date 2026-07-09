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
* **AI Connector Mocking (`ai.service.ts`)**:
  * Mock `@google/generative-ai` responses and verify prompt variables and JSON data shaping.
  * Test skipped row filters (no email and no mobile).

### Integration Tests
* **HTTP API Routes (`importer.routes.ts`)**:
  * Use `supertest` to trigger endpoints on the Express `app` instance.
  * Test `POST /api/process-batch` with valid and invalid payloads.
  * Test route-level error middlewares (asserting `500` status codes on service crashes).
  * Validate CORS headers on responses.

---

## 3. Code Coverage Execution

We will measure code coverage using Node's built-in coverage runner (available in Node.js v22+):
```bash
node --import tsx --test --experimental-test-coverage "src/features/**/*.test.ts"
```
This prints a clean coverage matrix showing statement, branch, and function coverage statistics in the terminal.
