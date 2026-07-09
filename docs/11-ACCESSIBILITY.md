# 11 — Accessibility (A11y) & Compliance Audit

### Status: **COMPLETED & ACTIVE**

This document specifies the accessibility enhancements, standard compliance parameters, and navigation features built into the **Lead-Mapper** application.

---

## 1. Keyboard Navigation Support

All components are fully navigable without a mouse:
* **Skip Navigation Link**: A hidden anchor is placed at the top of the body, allowing screen reader and keyboard-only users to bypass headers and jump directly to the importer area.
* **Interactive Dropzones**: The CSV upload card has been refactored with `tabIndex={0}` and a keyboard handler (`onKeyDown`). Users can focus the dropzone via `Tab` and trigger file selection by pressing `Space` or `Enter`.
* **Tab Controls**: Results page navigation utilizes interactive tab triggers with proper keyboard handlers, allowing users to scroll between Mapped Leads and Skipped Rows.

---

## 2. ARIA Cues & Semantic HTML

We maintain clean heading structures and semantic HTML tags:
* **Dynamic Announcement (`aria-live`)**: The progress and error displays use `aria-live="polite"` and `aria-live="assertive"` respectively. When files are uploading or processing, the screen reader instantly announces status changes to the user.
* **Tab Roles**: The Mapped/Skipped logs are wrapped in standard `role="tablist"` containers. Individual tabs declare `role="tab"`, `aria-selected`, and `aria-controls` properties matching WCAG recommendations.
* **Semantic Tables**: All preview and output data grids utilize semantic `<table>`, `<thead>`, `<tbody>`, and table header elements declaring explicit scopes (`scope="col"` for columns and `scope="row"` for index cells).
* **Button Labels**: Control buttons declare explicit `aria-label` labels where descriptive text is needed. Icons are hidden from screen readers using `aria-hidden="true"`.

---

## 3. Focus Visibility & Visual Polish

* **Focus Outline (`focus-ring`)**: Default browser focus outlines are replaced with a high-contrast cyan border ring:
  ```css
  .focus-ring {
    outline: 2px solid transparent;
    outline-offset: 2px;
    transition: outline-color 0.2s ease-in-out;
  }
  .focus-ring:focus-visible {
    outline-color: var(--color-brand-cyan);
  }
  ```
  This ensures that focused elements are highly visible during keyboard navigation.

---

## 4. Reduced Motion Support

For users suffering from vestibular issues, the design system respects operating system animation flags. The global stylesheet includes a media-query override that disables animations if the user has enabled "Reduce Motion":

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-delay: -1ms !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    background-attachment: initial !important;
    scroll-behavior: auto !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
}
```
This instantly silences floats, pulses, and loading shimmers.
