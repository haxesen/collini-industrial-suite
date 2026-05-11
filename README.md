# Project: Collini Schichtstärke Rechner

Professional, mobile-first web application for industrial coating thickness calculation, tailored for the Collini Wien facility.

## 🚀 Live Access
- **URL:** [collini-schichtstarke-rechner.vercel.app](https://collini-schichtstarke-rechner.vercel.app)
- **GitHub:** `haxesen/collini-schichtstarke-rechner`

## 🛠 Tech Stack
- **Frontend:** React (Vite)
- **Icons:** Lucide React (Industrial iconography)
- **Styling:** Custom CSS3 (Industrial Dark Theme, Glassmorphism, Outfit Typography)
- **Backend/Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **PWA:** Manifest support for home screen installation.

## ✨ Implemented Features

### 1. Calculation Engine
- **Logic:** `((CurrentTime * TargetThickness) / CurrentThickness) - CurrentTime`
- **Dynamic Updates:** Results update in real-time as inputs change.
- **Unit Toggle:** Output can be displayed in Minutes (min), Seconds (sek), or Hours:Minutes (h:m).
- **Reset Function:** Quick reset of all input fields.

### 2. Cloud History & Logging
- **Save Result:** Persistent storage of batch number, product name, and calculation result to the cloud.
- **History View:** Browsable list of past calculations with date/time stamps and batch details.
- **Data Retention:** Access historical data across devices.

### 3. Product Management (Cloud-Sync)
- **Supabase Integration:** Syncs product names and target thickness values globally.
- **Product Manager:** Add, **Edit**, and Delete products with immediate updates.
- **Selection:** Quick-select from a dropdown with automatic target thickness loading.

### 4. Localization & Persistence
- **Dual-Language:** Full support for **Hungarian (HU)** and **German (DE)**.
- **Smart Persistence:** Remembers the selected language for future visits using localStorage.

### 5. Premium UI/UX
- **Modern Industrial Look:** High-contrast dark theme with consistent branding.
- **Lucide Icons:** Replaced basic emojis with professional, clean industrial icons.
- **Responsive Layout:** Tailored for factory-floor mobile usage with large touch areas.
- **Official Branding:** Inverted Collini logo for maximum visibility on dark backgrounds.

## 📦 Database Infrastructure
- **Supabase Project:** `n3xt-level.eu`
- **Tables:**
  - `public.collini_products`: Managed product target values.
  - `public.collini_history`: Logged measurement results.

## 🔮 Future Roadmap
- [ ] **Barcode/QR Scanning:** Use mobile camera to scan delivery notes.
- [ ] **OCR:** Automated text recognition for physical documents.
- [ ] **PDF Export:** Generate quality reports for internal documentation.

---
*Documentation updated: 2026-05-11*
*Created by: Horvát Tamás*
