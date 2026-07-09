# GrowEasy CRM CSV Importer — Frontend Client

This is the Next.js App Router frontend client for the **Lead-Mapper** application. It provides an onboarding dashboard with a drag-and-drop CSV dropzone, a horizontal-scrolling table preview grid, real-time progress loaders, and a comprehensive leads ingestion results dashboard.

---

## Key Features

1. **Brand Theme & Design System**: Styled according to strict custom visual guidelines using tailwind tokens:
   * **Base Background**: Deep Ink (`#0A0D12`).
   * **Card Backings**: Charcoal Panels (`#10151C`, `#141B23`).
   * **Highlight Accents**: Flat Neon Teal (`#4FD1C5`) and Coral Orange (`#FF7A45`).
   * **Typography Scales**: Headings use `Space Grotesk`, body copy uses `Inter`, and technical logs/consoles use `JetBrains Mono`.
2. **Interactive Mock Mapping Console**: Provides a live-ticking preview of mapped CSV fields, confidence ratings, and skipped rows directly on the onboarding page, boosting user engagement.
3. **Double Scrollable Tables**: Ensures that both the CSV Data Preview grid and Ingested Leads lists scale dynamically using `min-w-max` and `whitespace-nowrap` to prevent word wrapping. This enables smooth horizontal and vertical scrolling in all directions.
4. **CORS-Free Proxy Middleware**: Leverages Next.js `proxy.ts` (named proxy function) to rewrite client-side requests internally to `http://localhost:5000`, bypassing CORS preflight overhead.
5. **Aria & Accessibility compliant**: Custom keyboard trap indicators, skip navigation links, and screen reader announcements (`aria-live`, `aria-describedby`) ensure complete screen reader accessibility.

---

## Directory Organization

```
web/
├── public/                          # Brand SVGs, icons, and Open Graph mockups
│   ├── sample-data/                 # Stress-test templates (Facebook, Google Ads, etc.)
│   ├── logo.svg                     # Solid brand logo lockup (Chevron design)
│   ├── icon.svg                     # Centered Chevron Arrow stand-alone mark
│   └── og-image.png                 # Center-aligned 1200x630 banner
├── src/
│   ├── app/                         # App Router page layouts, sitemaps, and robots metadata
│   ├── features/importer/           # Client hooks, types, and dashboard components
│   │   ├── components/
│   │   │   ├── csv-upload.tsx       # Drag-and-drop dropzone card
│   │   │   ├── csv-preview-table.tsx# Scrollable raw grid layout
│   │   │   ├── progress-bar.tsx     # Indeterminate glowing progress card
│   │   │   └── result-dashboard.tsx # Tabs-driven success/skipped metrics panel
│   │   └── hooks/
│   │       └── useCSVImporter.ts    # React state machine for importer wizard
│   └── proxy.ts                     # Path-matching Next.js 16 api proxy router
├── tsconfig.json
└── package.json
```

---

## Local Setup

### 1. Installation
Install the package dependencies:
```bash
npm install
```

### 2. Configure Environment variables
Create a `.env.local` file in the root of the `web/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start Development Server
Run the local dev compiler:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Production Deployment

### 1. Run typecheck compilation
Verify TypeScript compiles with zero errors:
```bash
npm run typecheck
```

### 2. Compile Production Bundle
Build and optimize pages:
```bash
npm run build
```

### 3. Run Production Server
Serve the static compiled files locally:
```bash
npm run start
```
