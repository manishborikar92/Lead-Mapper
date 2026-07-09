# 13 — Security & Ingestion Defenses Specification

### Status: **COMPLETED & ACTIVE**

This document specifies the security policies, headers, validations, and defenses implemented across the **Lead-Mapper** application.

---

## 1. CORS Policy
To prevent unauthorized domains from invoking our API endpoints, the Express server limits cross-origin resource sharing to trusted origins:
* **Development**: Bound to `http://localhost:3000` (the React development server).
* **Production**: Bound to the host of the deployed Vercel frontend via `env.ALLOWED_ORIGIN`.
* **Allowed Methods**: Restricts requests strictly to `['GET', 'POST', 'OPTIONS']`.
* **Headers**: Permits only `['Content-Type']`.

---

## 2. HTTP Security Headers & CSP
Both client and server send strict headers to protect against web exploits:

### A. Next.js Client CSP (`web/next.config.ts`)
Configures a strict **Content Security Policy (CSP)** and headers on all response paths:
* `Content-Security-Policy`: Restricts resource fetching to trusted endpoints (`'self'`, Google Fonts, Render backend API). Prevents inline script executions.
* `X-Frame-Options: DENY`: Defends against Clickjacking by blocking page framing.
* `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing exploits.
* `Referrer-Policy: strict-origin-when-cross-origin`: Controls referrer headers.
* `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Disables browser hardware permissions.

### B. Express Server Security Headers (`server/src/app.ts`)
Injects headers protecting all API response payloads:
* `X-Frame-Options: DENY`
* `X-Content-Type-Options: nosniff`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Content-Security-Policy: default-src 'self'`

---

## 3. Upload Validation & Ingestion Defenses

* **File Size Cap**: Multer middleware rejects files larger than **10MB** before loading them into memory to prevent Denial of Service (DoS) attacks.
* **MIME-Type Checks**: Verification rejects uploads if the file extension is not `.csv` OR the MIME-type is not `text/csv` (combating script-masquerading uploads).
* **In-Memory Streaming**: The server processes files inside volatile memory buffers (`multer.memoryStorage()`). The file is never written to disk, eliminating directory traversal (`../../`) write exploits.
* **XSS Sanitization**: User fields rendered in preview grids or results dashboards are automatically escaped by React. This neutralizes HTML/JavaScript scripts (e.g. `<script>alert('XSS')</script>`).
* **AI Schema Injection Defenses**: Prompt inputs are mapped to strict JSON-schema specifications. Any attempts to inject malicious commands or prompt overrides are isolated to the string cells, and coerced/rejected by the backend **Zod Validation Layer** before CRM ingestion.
