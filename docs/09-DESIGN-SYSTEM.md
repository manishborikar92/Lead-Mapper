# 09 — Design System Specification

### Status: **COMPLETED & ACTIVE**

This document specifies the design tokens, spacing scale, typography, and motion parameters that define the **Lead-Mapper** visual design system. All component layouts reference these values directly using Tailwind utility classes.

---

## 1. Color Palette Tokens

The design features a dark, premium, obsidian workspace styling highlighted by neon accents.

| Token Name | CSS Variable | Hex Value | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| `obsidian-950` | `--color-obsidian-950` | `#07090f` | Main app background color. |
| `obsidian-900` | `--color-obsidian-900` | `#0b0f19` | Intermediate page backgrounds, panels. |
| `obsidian-800` | `--color-obsidian-800` | `#121824` | Card background base, list containers. |
| `obsidian-700` | `--color-obsidian-700` | `#1c263c` | Border lines, inactive input controls. |
| `obsidian-600` | `--color-obsidian-600` | `#293856` | Hover borders, disabled text tokens. |
| `brand-cyan` | `--color-brand-cyan` | `#06b6d4` | Primary brand accent, glow points, indicators. |
| `brand-indigo` | `--color-brand-indigo` | `#6366f1` | Secondary brand accent, action gradients. |
| `brand-violet` | `--color-brand-violet` | `#8b5cf6` | Highlight elements, focus highlights. |

---

## 2. Spacing & Radius Scales

All layouts conform to a strict 4px-grid system.

### Spacing Scale
* `1` (4px) / `2` (8px): Micro gaps, icon padding.
* `3` (12px) / `4` (16px): Cell padding, small margins.
* `5` (20px) / `6` (24px): Card margins, container spacing.
* `8` (32px) / `10` (40px) / `12` (48px): Section breaks, outer app container gaps.

### Corner Radius
* `rounded-md` (6px): In-table pills, badges.
* `rounded-xl` (12px): Standard buttons, input controls.
* `rounded-2xl` (16px): Upload Dropzones, metric panel cards.
* `rounded-3xl` (24px): Master layout wrapper panel.
* `rounded-full`: Connection pill, progress sliders, avatar rings.

---

## 3. Typography System
* **Primary Sans-Serif Font**: `Outfit` (loaded via Google Fonts edge with fallbacks to system-sans).
* **Text Scales**:
  * `text-xs` (12px, tracking-wide): Table column headers, badge labels.
  * `text-sm` (14px, leading-relaxed): General data cell text, paragraph values.
  * `text-base` (16px, medium): Subtitles, helper text inputs.
  * `text-lg` (18px, semibold): Small headers, metric figures.
  * `text-xl` (20px, bold): Card headers, confirmation titles.
  * `text-3xl` (30px, heavy): Metric summary scores.
  * `text-4xl` (36px, extra-bold): Hero text headers.

---

## 4. Shadows & Motion Tokens

### Custom Shadows
* `shadow-neon-glow`: Radial soft cyan outer shadow (`0 0 20px rgba(6, 182, 212, 0.15)`).
* `shadow-neon-card`: Elevated card drop shadow combined with a subtle white inset rim to simulate high-end glassmorphism.

### Motion / Animations
* **Float (`animate-float`)**: A keyframe animation generating a soft 4px hover float on key branding elements.
* **Shimmer (`animate-shimmer`)**: A 1.8s ease-in-out translation animation driving the indeterminate load bars.
* **Reduced Motion Safe**: Evaluates browser media directives. When `prefers-reduced-motion: reduce` is active, all transition times, animations, and keyframes are automatically set to `0s` or disabled to prevent visual strain.
