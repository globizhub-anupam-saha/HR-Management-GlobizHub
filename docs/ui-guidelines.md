# GlobizHR — Apple Design System & UI Guidelines (HIG)

This document establishes the official visual, interaction, and component guidelines for the GlobizHR application across web (desktop and tablet) and Capacitor Android mobile environments, adhering to Apple Human Interface Guidelines (iOS 17+ and macOS Sonoma).

---

## 1. Design Tokens (Single Source of Truth)

All design tokens are defined as CSS variables in `src/app/globals.css` and mapped into Tailwind CSS `@theme inline`.

### 1.1 Spacing & Layout Rhythm
- **Base Unit:** 4px base with an 8pt layout rhythm.
- **Strictly Allowed Spacing Scale:** `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`.
- **Page Gutters:**
  - Mobile (< 768px): `16px` (`px-4`)
  - Tablet (768px - 1024px): `24px` (`sm:px-6`)
  - Desktop (> 1024px): `32px` (`lg:px-8`)
- **Content Max-Width:** `1200px` centered with auto margins (`max-w-[1200px] mx-auto`).
- **Card Padding:** `20px` to `24px` (`p-5 sm:p-6`).
- **Section Gap:** `32px` (`space-y-8` or `gap-8`).
- **Form Field Gap:** `16px` (`space-y-4` or `gap-4`).

### 1.2 Typography
- **Font Stack:**
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", var(--font-inter), system-ui, sans-serif;
  ```
  Resolves to Apple SF Pro natively on iOS/macOS; falls back cleanly to Inter elsewhere.
- **Type Hierarchy:**
  | Token | Size | Line Height | Weight | Tracking | Purpose |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Large Title** (`.type-large-title`) | 34px | 41px | 700 | -0.02em | Top-level screen title |
  | **Title 1** (`.type-title-1`) | 28px | 34px | 700 | -0.02em | Page headers / KPI values |
  | **Title 2** (`.type-title-2`) | 22px | 28px | 600 | -0.02em | Section titles, modal titles |
  | **Headline** (`.type-headline`) | 17px | 22px | 600 | -0.01em | Card titles, table sections |
  | **Body** (`.type-body`) | 15px (17px mobile) | 22px (24px mobile) | 400 | 0 | Standard body copy |
  | **Callout** (`.type-callout`) | 16px | 21px | 400 | 0 | Featured lead text |
  | **Subhead** (`.type-subhead`) | 15px | 20px | 500 | 0 | Input labels, secondary headers |
  | **Footnote** (`.type-footnote`) | 13px | 18px | 400 | 0 | Captions, metadata, helper text |
  | **Caption** (`.type-caption`) | 12px | 16px | 400 | 0 | Microcopy, badge labels |
- **Tabular Figures:** All financial figures, salary numbers, dates, and hours must utilize `font-variant-numeric: tabular-nums` (`.tabular-nums`).

### 1.3 Semantic Color Tokens
One primary accent per screen. Status colors are reserved exclusively for status.

#### Light Palette
- **Background (Grouped):** `#F2F2F7`
- **Surface / Card:** `#FFFFFF`
- **Elevated:** `#FFFFFF`
- **Label (Foreground):** `#000000`
- **Secondary Label:** `rgba(60, 60, 67, 0.60)`
- **Tertiary Label:** `rgba(60, 60, 67, 0.30)`
- **Separator / Hairline:** `rgba(60, 60, 67, 0.29)`
- **Fill:** `rgba(120, 120, 128, 0.12)`
- **Accent (Blue):** `#007AFF` (Halo: `rgba(0, 122, 255, 0.20)`)

#### Dark Palette
- **Background:** `#000000`
- **Surface / Card:** `#1C1C1E`
- **Elevated:** `#2C2C2E`
- **Label (Foreground):** `#FFFFFF`
- **Secondary Label:** `rgba(235, 235, 245, 0.60)`
- **Tertiary Label:** `rgba(235, 235, 245, 0.30)`
- **Separator / Hairline:** `rgba(84, 84, 88, 0.60)`
- **Fill:** `rgba(120, 120, 128, 0.24)`
- **Accent (Blue):** `#0A84FF` (Halo: `rgba(10, 132, 255, 0.25)`)

#### Status Colors
- **Green (Success / Present):** `#34C759` (Dark: `#30D158`)
- **Orange (Warning / Late):** `#FF9500` (Dark: `#FF9F0A`)
- **Red (Destructive / Absent):** `#FF3B30` (Dark: `#FF453A`)
- **Yellow:** `#FFCC00` (Dark: `#FFD60A`)

### 1.4 Corner Radii
- **Controls & Buttons:** `10px` (`rounded-[10px]`)
- **Form Inputs / Selects:** `10px` (`rounded-[10px]`)
- **Cards:** `20px` (`rounded-[20px]`)
- **Modals & Dialogs:** `20px` (`rounded-[20px]`)
- **Bottom Sheets:** `24px` top corners (`rounded-t-[24px]`)
- **Badges & Pills:** `9999px` (`rounded-full`)
- **Nested Radius Rule:** `Inner Radius = Outer Radius - Padding`.

### 1.5 Elevation & Materials
- **Contrast Separation:** Surfaces separate by background contrast (`#F2F2F7` vs `#FFFFFF` in light mode; `#000000` vs `#1C1C1E` in dark mode).
- **Soft Layered Shadows:** Light mode uses `box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)` (`.apple-shadow-card`). Dark mode relies strictly on border hairlines and surface contrast.
- **Hairlines:** Custom 0.5px hairlines via `.border-hairline`, `.border-hairline-t`, `.border-hairline-b` using the `--separator` variable.
- **Translucent Glass Materials:** Top header, sidebar, bottom tab bar, and popovers use `.material-translucent`:
  ```css
  background-color: var(--sidebar);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  ```

### 1.6 Motion & Springs
- **Default Easing:** `cubic-bezier(0.32, 0.72, 0, 1)` (Apple standard spring response).
- **Durations:**
  - Hover / press: `150ms`
  - Sheets / popovers / menus: `250ms`
  - Page-level transitions: `350ms`
- **Active Press State:** Interactive elements scale to 98% (`active:scale-[0.98]`).
- **Reduced Motion:** Fully honored via `@media (prefers-reduced-motion: reduce)`. Transforms are cancelled; smooth opacity fades are retained.

---

## 2. Component Guidelines

### 2.1 Buttons (`Button`)
- **Variants:**
  - `filled` / `default`: Solid accent blue with subtle shadow. Maximum 1 primary button per region.
  - `tinted` / `secondary`: 12% accent fill with accent text (`bg-primary/12 text-primary`).
  - `plain` / `ghost`: Text-only action with hover fill.
  - `outline`: 0.5px hairline separator border with surface background.
  - `destructive`: Red accent with destructive text/fill.
- **Heights:** Touch target `44px` (`size="touch"` / `size="lg"`), dense desktop `36px` (`size="default"`).

### 2.2 Form Controls (`Input`, `Select`, `Textarea`)
- **Background:** Borderless fill (`bg-fill`), `10px` radius.
- **Focus State:** 1px accent ring with a 3px 20% accent halo (`focus:shadow-[0_0_0_3px_var(--primary-halo)]`). No harsh black borders.
- **Placeholders:** Styled with tertiary label color (`placeholder:text-label-tertiary`).
- **Labels:** Positioned above inputs in `type-subhead` (`15px` font weight 500) in secondary label color.

### 2.3 Inset Grouped Lists (`InsetGroup`, `InsetRow`)
Used for settings, profile preferences, and structured read-only forms:
- `16px` rounded container with surface background.
- Row minimum height `44px`.
- Hairline dividers inset `16px` from the left edge.
- Trailing chevrons (`size-4 text-label-tertiary`) on navigable rows.

### 2.4 Tables (`Table`)
- Row height: `48px` to `50px`.
- No vertical grid lines.
- Row dividers: 0.5px hairline borders.
- Headers: Sticky translucent background (`.material-translucent`), `13px` non-uppercase text in secondary label color.
- Hover fill: subtle `rgba(120, 120, 128, 0.08)`.
- Financial and quantity figures: Right-aligned with `.tabular-nums`.

### 2.5 Badges & Status Pills (`Badge`)
- Fully rounded pills (`rounded-full`), height `24px` (`h-6`), `12px` font size with weight 600.
- 12-15% tinted status background with vivid high-contrast status text.

### 2.6 Toasts (`ToastProvider`)
- Centered top pill notification (Apple Dynamic Island / system toast).
- Translucent material with hairline border and auto-dismiss after 4 seconds.

---

## 3. Do's and Don'ts

| Do | Don't |
| :--- | :--- |
| **DO** use the 4px base / 8pt spacing rhythm (`4, 8, 12, 16, 20, 24, 32, 48`). | **DON'T** introduce ad-hoc values like `p-7`, `p-13`, `mt-[17px]`. |
| **DO** separate content using background contrast and soft 0.5px hairlines. | **DON'T** use 1px or 2px solid dark borders around cards and tables. |
| **DO** reserve status colors (green, orange, red) exclusively for status. | **DON'T** use green or purple for random decorative cards or primary actions. |
| **DO** provide minimum 44x44 touch targets for mobile and Capacitor. | **DON'T** design hover-only affordances without mobile touch alternatives. |
| **DO** format numbers in tables and payroll with `tabular-nums`. | **DON'T** use proportional font numerals that jitter when aligned in tables. |
| **DO** respect `prefers-reduced-motion` and Capacitor safe areas (`env(safe-area-inset-*)`). | **DON'T** fix position top or bottom bars without safe area padding. |

---

## 4. Accessibility & Mobile Compliance

1. **Color Contrast:** All text achieves at least `4.5:1` contrast against its surface. UI components achieve at least `3:1` against background.
2. **Keyboard Focus:** High-visibility Apple focus halo (`2px ring` with `2px offset`) on all interactive controls.
3. **Screen Readers:** All icon-only buttons include `aria-label` attributes.
4. **Dynamic Type:** All fonts scale proportionately with browser / OS accessibility zoom.
5. **Capacitor Mobile:** Safe area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) prevent notch and home-bar collisions.

