# Collini Industrial Suite - Design & Dev Guide (Skills)

## 1. Core Philosophy
The application follows a **Premium Industrial Dark** aesthetic. It must look professional, high-end, and optimized for factory floor visibility.

## 2. Color Palette (CSS Variables)
- `--bg-color`: `#0f141c` (Deep dark blue/gray)
- `--accent-color`: `#00f2fe` (Neon cyan/blue)
- `--accent-glow`: `rgba(0, 242, 254, 0.3)`
- `--text-primary`: `#ffffff`
- `--text-secondary`: `rgba(255, 255, 255, 0.7)`
- `--border-color`: `rgba(255, 255, 255, 0.1)`

## 3. UI Components & Classes

### Tables (Logbook)
- `.logbook-table`: Must have `border-collapse: separate` and `border-spacing: 0 8px`.
- `.logbook-table tr`: Rows must have a subtle background `rgba(255, 255, 255, 0.03)`.
- **Status Indicators (Left Border)**:
  - `.row-status-offen`: 4px solid `#ff3b30` (Piros)
  - `.row-status-in_arbeit`: 4px solid `#ffcc00` (Sárga)
  - `.row-status-erledigt`: 4px solid `#34c759` (Zöld)

### Badges
- `.status-badge-container`: Rounded pill shape, semi-transparent background, solid border.
  - `.offen`: Piros téma.
  - `.in_arbeit`: Sárga téma.
  - `.erledigt`: Zöld téma.

### Buttons
- `.add-entry-btn-premium`: Neon accent background, dark text, strong glow.
- `.small-btn`: Minimalist, bordered, for table actions like "START" or "KÉSZ".

## 4. Coding Patterns
- **Multilingual Support**: Always update `translations` object in `App.jsx` for both `hu` and `de`.
- **Date Formatting**: Use `formatDate` helper for consistent `YYYY.MM.DD HH:mm` display.
- **Supabase Integration**: Real-time subscriptions are preferred for logbook synchronization.

## 5. Industrial Requirements
- **High Contrast**: Ensure labels are readable under factory lighting.
- **Touch Friendly**: Buttons must be large enough for finger interaction (min 40px height).
- **Responsive**: Layout must work on wall-mounted displays, tablets, and mobile phones.

### Infotafel (Info Board)
- `.info-card`: Glassmorphism effect (`backdrop-filter: blur(10px)`), deep shadow.
- **Priority Themes**:
  - `priority-normal`: Standard border, subtle background.
  - `priority-high`: Yellow left border (`#ffcc00`), golden gradient overlay.
  - `priority-urgent`: Red left border (`#ff3b30`), red gradient overlay, pulse animation (`urgent-glow`).
- **Typography**: Message text should be larger (`1.15rem`) and bold for long-distance readability.

