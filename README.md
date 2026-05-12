# Project: Collini Industrial Suite

Ein modulares, industrielles Dashboard für die Produktionsüberwachung und Schichtverwaltung, optimiert für den Einsatz in Galvanikbetrieben (z.B. Collini KS-24).

## ✨ Neue Funktionen & Updates

- **Globales Ladesystem**: Elegantes Overlay für alle asynchronen Datenbankoperationen (Supabase), um dem Benutzer visuelles Feedback zu geben.
- **Vollbildmodus**: Integrierte Schaltflächen für den Vollbildmodus (Header & InfoWall), optimiert für dedizierte Monitore und Terminals.
- **Multi-Linien-Architektur**: Unterstützung für mehrere Produktionslinien (KS-01, KS-24, KS-39 usw.) mit aktivem/inaktivem Status und dynamischem Grid-Layout.
- **Reines Deutsch (DE)**: Die gesamte Benutzeroberfläche wurde auf professionelles Deutsch umgestellt und alle ungarischen Fragmente wurden entfernt.
- **Optimiertes Grid-Layout**: Ein modernes Kachel-Layout für die Maschinenauswahl mit automatischer Priorisierung aktiver Anlagen.

## 🚀 Module

- **Logbook**: Digitale Schichtprotokollierung mit Echtzeit-Synchronisierung.
- **InfoWall**: Digitales Schwarzes Brett für wichtige Produktionsmitteilungen.
- **Calculator**: Präziser Rechner für Schichtstärken und Prozessparameter.
- **Admin**: Zentrales Management für Produkte, Personal und Anlagenkonfiguration.

## 🚀 Live Access
- **URL:** [collini-industrial-suite.vercel.app](https://collini-industrial-suite.vercel.app)
- **GitHub:** `haxesen/collini-schichtstarke-rechner`

## 🛠 Tech Stack
- **Frontend:** React (Vite)
- **Architecture:** Modular Domain-Driven Design (MDDD)
- **State Management:** React Context API (Centralized Global State)
- **Icons:** Lucide React (Industrial iconography)
- **Styling:** Custom CSS3 (Industrial Dark Theme, Glassmorphism, Outfit Typography)
- **Backend/Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **PWA:** Manifest support for home screen installation.

## ✨ Implemented Modules

### 1. Central Hub (Dashboard)
- Entry point for all industrial modules.
- Modern card-based navigation with status indicators.
- Quick access to active announcements and administrative tools.

### 2. Calculation Engine (Schichtstärke Rechner)
- **Logic:** `((CurrentTime * TargetThickness) / CurrentThickness) - CurrentTime`
- **Dynamic Updates:** Results update in real-time as inputs change.
- **Unit Toggle:** Output in Minutes (min), Seconds (sek), or Hours:Minutes (h:m).
- **PDF Export:** Generate professional calculation reports.

### 3. Logbook (Logbuch)
- Comprehensive incident and maintenance tracking.
- Real-time status updates (Open, In Progress, Done).
- Advanced filtering by department, priority, and status.
- Cloud-synced history for facility-wide transparency.

### 4. Info Wall (Hirdetőtábla)
- Real-time announcement board for facility staff.
- Rich-text editor for administrators.
- Automatic expiration and priority-based highlighting.
- Global Ticker integration for critical updates.

### 5. Admin Dashboard
- Centralized management of products, departments, and personnel.
- Secure access control.
- Dynamic configuration of module-specific settings.

## 📂 Project Structure
- `src/context/`: Global application state and translations.
- `src/modules/`: Isolated feature modules (Hub, Calculator, Logbook, etc.).
- `src/components/`: Reusable UI components.
- `src/utils/`: Shared helper functions and localization.
- `src/assets/`: Branding and static resources.

## 🔮 Future Roadmap
- [ ] **Barcode/QR Scanning:** Use mobile camera to scan delivery notes.
- [ ] **Production Planning:** Visual scheduling for coating lines.
- [ ] **Wartungsplaner:** Automated maintenance scheduling and alerts.

---
*Documentation updated: 2026-05-12*
*Created by: Horvat Tamás*
