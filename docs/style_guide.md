# Collini Industrial Suite - Design & Dev Guide (Skills)

## 1. Core Philosophy
The application follows a **Premium Industrial Dark** aesthetic. It must look professional, high-end, and optimized for factory floor visibility. The architecture is **Modular and Domain-Driven**, ensuring that each feature is isolated and independently scalable.

## 2. Color Palette (CSS Variables)
- `--bg-color`: `#0f141c` (Deep dark blue/gray)
- `--accent-color`: `#00f2fe` (Neon cyan/blue)
- `--accent-glow`: `rgba(0, 242, 254, 0.3)`
- `--text-primary`: `#ffffff`
- `--text-secondary`: `rgba(255, 255, 255, 0.7)`
- `--border-color`: `rgba(255, 255, 255, 0.1)`

## 3. Architecture & Coding Patterns

### Modular Structure
- **Modules**: Every feature lives in `src/modules/[FeatureName]/`.
  - `FeatureName.jsx`: The UI component.
  - `useFeatureName.js`: The business logic (custom hook).
- **Global Context**: Use `useApp()` from `src/context/AppContext` for global state (language, view, admin status).
- **Utilities**: Shared logic (date formatting, priority labels) must reside in `src/utils/helpers.js`.
- **Translations**: Text contents must be retrieved from `t` (from `AppContext`) and defined in `src/utils/translations.js`.

### UI Components
- **Global Ticker**: Rendered in the main shell (`App.jsx`), synchronized via Supabase.
- **Modals**: Use the `.manager-overlay` class for consistent glassmorphism overlays.
- **Buttons**:
  - `.add-entry-btn-premium`: Neon accent background, dark text, strong glow.
  - `.icon-btn-header`: Transparent background, subtle border, used for header actions.

## 4. UI Components & Classes (CSS)

### Tables (Logbook)
- `.logbook-table`: `border-collapse: separate` and `border-spacing: 0 8px`.
- **Status Borders**:
  - `.row-status-offen`: 4px solid `#ff3b30` (Red)
  - `.row-status-in_arbeit`: 4px solid `#ffcc00` (Yellow)
  - `.row-status-erledigt`: 4px solid `#34c759` (Green)

### Infotafel (Announcement Board)
- `.info-card`: Glassmorphism effect (`backdrop-filter: blur(10px)`).
- **Priority Themes**:
  - `priority-normal`: Standard border.
  - `priority-high`: Yellow border, golden glow.
  - `priority-urgent`: Red border, pulsing red glow.

## 5. Industrial Requirements
- **High Contrast**: Readable under factory lighting.
- **Touch Friendly**: Interactive elements must have a minimum hit area of 44x44px.
- **Responsive**: Layout must work on wall-mounted industrial monitors and mobile handhelds.

---
*Last Updated: 2026-05-12*
