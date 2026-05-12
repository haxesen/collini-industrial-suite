# Collini Industrial Suite - Architecture Documentation

## 🏗️ Modular Architecture (v1.4.0+)

The project has transitioned from a monolithic `App.jsx` to a **Modular Domain-Driven Design**. This ensures that the application is scalable, maintainable, and ready for enterprise deployment.

### 🧩 Directory Structure

```text
src/
├── assets/             # Branding (Logos, SVGs)
├── components/         # Global Shared Components
│   ├── AdminLogin.jsx
│   ├── GlobalTicker.jsx
│   └── LanguageToggle.jsx
├── context/            # Global State Management
│   └── AppContext.jsx  # View, Lang, Admin status, Modals
├── hooks/              # Global Utility Hooks
├── modules/            # Feature Domains (Isolated)
│   ├── Admin/          # Management tools
│   ├── Calculator/     # Calculation engine & PDF logic
│   ├── Hub/            # Main navigation dashboard
│   ├── InfoWall/       # Announcement board
│   └── Logbook/        # Maintenance & event tracking
├── utils/              # Shared logic & strings
│   ├── helpers.js      # Formatting, time, priority helpers
│   ├── translations.js # Centralized multi-language strings
│   └── supabase.js     # DB client configuration
├── App.jsx             # Shell & Root Router
└── main.jsx            # Entry point with AppProvider
```

### 🔐 State Management

The application uses the **React Context API** (`AppContext`) to synchronize state across isolated modules:
- **`view`**: Controls which module is currently rendered.
- **`lang`**: Global localization (HU/DE).
- **`isAdmin`**: Global authentication state.
- **`showManager` / `showAdminLogin`**: Controls visibility of administrative overlays.

### ⚙️ Module Pattern

Each module follows a consistent pattern:
1.  **Component (`Module.jsx`)**: Handles only the UI rendering and user interactions.
2.  **Logic Hook (`useModule.js`)**: Encapsulates state, data fetching (Supabase), and business logic.
3.  **Styles**: Leverages the global `index.css` design system.

### 📊 Data Flow

1.  User interacts with a Module UI.
2.  The UI calls a function from the Module's Hook.
3.  The Hook interacts with Supabase or updates local state.
4.  Global changes (like switching views) are handled through the `useApp()` hook.

---
*Created: 2026-05-12*
