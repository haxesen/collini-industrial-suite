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
- **Priority Classes**:
  - `.row-prio-kritisch`: Border-left 4px solid `#ff3b30`.
  - `.row-prio-hoch`: Border-left 4px solid `#ff9500`.
  - `.row-prio-mittel`: Border-left 4px solid `#00f2fe`.

### Badges
- `.status-badge-container`: Rounded pill shape, semi-transparent background, solid border.
  - `.offen`: Red theme.
  - `.arbeit`: Cyan theme.
  - `.erledigt`: Green theme.

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
