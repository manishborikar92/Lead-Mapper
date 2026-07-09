# 12 — Performance & Optimization Report

### Status: **COMPLETED & ACTIVE**

This document reports the performance optimizations, caching behaviors, and architectural refinements implemented on the **Lead-Mapper** web client.

---

## 1. Bundle Size & Dependency Optimization

We keep the client codebase extremely lightweight:
* **Zero Large Framework Dependencies**: The client does not use heavy UI libraries (like Material UI, Bootstrap, or Semantic UI). All styling is handled via utility-first **Tailwind CSS v4**, which compiles into a single minimized CSS bundle.
* **SVG Icons**: We import only required icons from `lucide-react`, ensuring that unused icons are tree-shaken and removed during Next.js production builds.
* **Browser CSV Parsing**: By utilizing **PapaParse** directly in the client, we review and parse data rows in-browser using a light client-side worker, avoiding the need to send large file buffers to the server before previewing.

---

## 2. Next.js App Router Optimizations

* **Removed Unused Font Loaders**: We replaced the default Next.js template Geist font loaders with custom global imports, reducing client-side font script compilation times.
* **Server Components Integration**: Layouts and SEO metadata are declared inside Next.js Server Components, rendering the shell statically and delivering fast initial load times (LCP).
* **Relative Proxy Routing**: By utilizing `proxy.ts`, all browser API calls bypass preflight CORS `OPTIONS` verification checks, saving roundtrip latencies during lead uploads.

---

## 3. Client Caching & In-Browser Memory

* **State Persistence**: Lead counts and records are cached in React component states, rendering instantly during tab changes without requiring DOM rebuilds.
* **CSV Row Splitting**: The raw preview table limits visible rows to the first **100 records**. This mitigates DOM node bloat, ensuring that even when uploading CSV files containing thousands of records, the browser scroll performance remains smooth and responsive.
