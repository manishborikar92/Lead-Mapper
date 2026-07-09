# 10 — Branding & Visual Identity Specification

### Status: **COMPLETED & ACTIVE**

This document outlines the branding decisions, graphic assets, and visual criteria used to establish the identity of the **Lead-Mapper** application.

---

## 1. Visual Strategy & Aesthetic Tone

Lead-Mapper is designed to look like a premium, state-of-the-art SaaS workspace.
* **Premium Obsidian Workspace**: Ditching generic grids, the interface utilizes a deep black/slate background (`#07090f` to `#121824`) to minimize eye strain and establish a sleek dashboard aesthetic.
* **Neon Accents**: Neon Cyan and Neon Indigo serve as core indicators of status and activity, representing speed, precision, and AI intelligence.
* **Minimalist UI Controls**: Transparent borders (`border-obsidian-800`), glassmorphic panels (`backdrop-blur-xl`), and rounded typography create a cohesive modern layout.

---

## 2. Branding Assets & Vectors

All core graphic assets are stored in the public assets directory:

### A. Professional SVG Logo (`web/public/logo.svg`)
A high-resolution, inline-vector branding graphic:
* **Icon Mark**: Shows a checklist grid layout enclosed in a rounded shield, representing safe and structured data ingestion. Includes neon cyan checkmarks and status dots representing data points.
* **Typography**: Paired with the elegant sans-serif font family `Outfit`, featuring two distinct styles: `GrowEasy` in heavy white and `LEAD-MAPPER` in uppercase cyan.

### B. App Icon & Favicon (`web/public/icon.svg`)
A square version of the branding logo configured for favicons, apple touch icons, and PWA manifests. It features:
* A `60x60` viewport.
* Clean, thick vector paths to ensure crisp scaling at micro sizes (e.g. `16x16` browser tab headers).
* Built-in CSS filter glows (`feGaussianBlur`) to preserve neon highlights across all platforms.

### C. Social Sharing Image (`web/public/og-image.png`)
A premium, widescreen (`1200x630`) Open Graph graphic depicting the Lead-Mapper dashboard interface.
* **Design**: Depicts an obsidian glassmorphic card upload interface highlighting successful mapped counts, charts, and clean cyan glows.
* **Impact**: Ensures that when users share links, the platform generates a beautiful, premium visual preview.

---

## 3. Typography & Styling System

The application font is **Outfit**, loaded dynamically from the Google Fonts CDN network.

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
```

### Rationale
* **Outfit** features geometric shapes and modern curves, making it ideal for dashboard panels, tables, and metric figures.
* The font weights chosen are `300` (Light) for details, `400` (Regular) for data cells, `500` (Medium) for tab indicators, `600` (Semi-Bold) for buttons, and `700` (Bold) for headings.
* Traditional default fonts (Arial, Times New Roman) are avoided to maintain premium SaaS formatting.
