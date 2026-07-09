# GrowEasy CRM CSV Importer — Backend API Server

This is the Express.js API backend for the **Lead-Mapper** application. It handles parsing raw CSV streams, executing deterministic preprocessing rules, running semantic model extractions, caching successful validated responses, and orchestrating the AI Gateway routing pipeline.

---

## Backend System Architecture

The server relies on a modular, stateless pipeline structured to maximize throughput and minimize latency/token usage.

```
                  ┌──────────────────────────────────────────────┐
                  │          CSV Upload Stream Ingestion         │
                  └──────────────────────┬───────────────────────┘
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             CSV Parsing Service              │
                  └──────────────────────┬───────────────────────┘
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │            Preprocessing Service             │
                  │   - Fuzzy header resolution                  │
                  │   - Deterministic mappings & normalizations  │
                  │   - Partition into confidence bands          │
                  └──────────────────────┬───────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼ (Deterministic Only)                    ▼ (Requires AI Enrichment)
         ┌─────────────────────┐                   ┌─────────────────────┐
         │  Bypass AI Gateway  │                   │  LRU Request Cache  │
         └──────────┬──────────┘                   └──────────┬──────────┘
                    │                                         │
                    │                    ┌────────────────────┴────────────────────┐
                    │                    ▼ (Cache Hit)                             ▼ (Cache Miss)
                    │         ┌─────────────────────┐                   ┌─────────────────────┐
                    │         │ Return Cached Data  │                   │     AI Gateway      │
                    │         └──────────┬──────────┘                   │ - Dynamic Failover  │
                    │                    │                              │ - Quota Cooldowns   │
                    │                    │                              └──────────┬──────────┘
                    │                    │                                         │ (Policy Engine model call)
                    ▼                    ▼                                         ▼
         ┌─────────────────────────────────────────────────────────────────────────┐
         │                    CRM Schema Validation & Ingestion                    │
         └─────────────────────────────────────────────────────────────────────────┘
```

### Core Components

1. **Extraction Pipeline (`src/features/importer/services/pipeline.ts`)**: The coordinator orchestrating preprocessing, caching, AI Gateway queries, validation schemas, and skipped rows checks.
2. **Preprocessing Service (`src/features/importer/services/preprocessing.ts`)**: Fuzzy matches columns to standard CRM headers (e.g. `e-mail` -> `Email`) in ~2ms. Standardizes numbers to E.164 and formats dates. Filters out incomplete/unusable rows before model ingestion (Double Skip Guard).
3. **Request Cache (`src/shared/cache.ts`)**: An memory-based Least Recently Used (LRU) cache with size limits and TTL eviction. Prevents duplicate AI calls for repeating rows across multiple CSV imports.
4. **AI Gateway (`src/shared/ai.ts`)**: A resilient model router equipped with exponential backoff retries and cooldown registers. If a model encounters a 429 quota limit or a 503 timeout, the gateway instantly triggers fallback loops to route to the next priority model.
5. **Policy Engine (`src/shared/policy.ts`)**: Manages model priorities based on user-selected strategies:
   * **High Quality**: prioritizes `gemini-1.5-pro` / `gemini-2.5-pro`.
   * **Balanced (Default)**: prioritizes `gemini-3.1-flash-lite` / `gemini-2.5-flash-lite`.
   * **High Throughput**: prioritizes flash-tier models.

---

## Directory Organization

```
server/
├── src/
│   ├── config/                  # Environment variables loading
│   ├── features/importer/       # Inporter routes, controllers, schema validators, & pipelines
│   ├── shared/                  # Common AI Gateway modules, LRU caches, and middlewares
│   ├── app.ts                   # Express app setup and middleware configuration
│   └── server.ts                # App listener binding
├── tests/                       # Complete unit and integration test suites
│   └── sample-data/             # Five test CSV sheets (Facebook, Google Ads, Edge Cases, etc.)
├── package.json
└── tsconfig.json
```

---

## Local Setup

### 1. Installation
Install the required packages using npm:
```bash
npm install
```

### 2. Configure Environment variables
Create a `.env` file in the root of the `server/` directory:
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_google_gemini_api_key
ALLOWED_ORIGIN=http://localhost:3000
```

### 3. Run the Development Server
Launch the server in watch mode:
```bash
npm run dev
```
The API server will listen on `http://localhost:5000`.

---

## API Documentation

### 1. Ingest CSV File
* **Endpoint**: `POST /api/import`
* **Content-Type**: `multipart/form-data`
* **Body parameters**:
  * `file`: (Binary) The CSV file to process.
  * `policy`: (String, Optional) Custom routing policy (`HighQuality`, `Balanced`, `HighThroughput`, `EmergencyFallback`). Defaults to `Balanced`.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "imported": [
      {
        "created_at": "2026-07-09 15:56:01",
        "name": "Amit Kumar",
        "email": "amit.kumar@example.com",
        "mobile_without_country_code": "8888888888",
        "country_code": "+91",
        "data_source": "leads_on_demand",
        "crm_status": "GOOD_LEAD_FOLLOW_UP",
        "crm_note": "Interested in demo"
      }
    ],
    "skipped": []
  }
  ```

### 2. Process Raw Batches
* **Endpoint**: `POST /api/process-batch`
* **Content-Type**: `application/json`
* **Body parameters**:
  * `records`: (Array of objects) Raw key-value rows.
  * `policy`: (String, Optional) Fallback policy.
* **Success Response (200 OK)**: Returns mapped and normalized CRM arrays.

### 3. Health Check
* **Endpoint**: `GET /health`
* **Success Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-07-09T16:04:00Z"
  }
  ```

---

## Testing & Verification

### Run Test Suite
Runs unit and integration integration tests:
```bash
npm run test
```

### View Coverage Report
Inspect unit test line coverage stats:
```bash
npm run test:coverage
```

### Run Live API script
Executes integration mappings against the five stress-test files in `server/tests/sample-data/`:
```bash
node --import tsx --env-file=.env tests/verify_live_api.ts
```
