# Project: Collini Schichtstärke Rechner

Professional, mobile-first web application for industrial coating thickness calculation, tailored for the Collini Wien facility.

## 🚀 Live Access
- **URL:** [collini-schichtstarke-rechner.vercel.app](https://collini-schichtstarke-rechner.vercel.app)
- **GitHub:** `haxesen/collini-schichtstarke-rechner`

## 🛠 Tech Stack
- **Frontend:** React (Vite)
- **Styling:** Custom CSS3 (Industrial Dark Theme, Glassmorphism)
- **Backend/Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **PWA:** Manifest and Service Worker support for home screen installation.

## ✨ Implemented Features

### 1. Calculation Engine
- **Logic:** `((CurrentTime * TargetThickness) / CurrentThickness) - CurrentTime`
- **Dynamic Updates:** Results update in real-time as inputs change.
- **Unit Toggle:** Output can be displayed in:
  - Minutes (min)
  - Seconds (sek)
  - Hours:Minutes (h:m)

### 2. Product Management (Cloud-Sync)
- **Supabase Integration:** Stores product names and target thickness values.
- **Product Manager:** 
  - Add new products.
  - **Edit existing products** (In-place editing).
  - Delete products.
- **Selection:** Quick-select from a dropdown or manual entry.

### 3. Localization (Multi-language)
- Fully switchable interface: **Hungarian (HU)** and **German (DE)**.
- Persisted language state (optional, defaults to HU).

### 4. UI/UX & Design
- **Premium Industrial Look:** Deep dark backgrounds, accent glows, and readable typography.
- **Official Branding:** Integrated Collini SVG logo with matched glow effects.
- **Mobile Optimized:** Large touch targets, hidden browser input arrows, and responsive layout.
- **Creator Credit:** "Készítette: Horvát Tamás" / "Erstellt von Tamas Horvát" in the header.

## 📦 Database Schema
- **Project:** `n3xt-level.eu`
- **Table:** `public.collini_products`
  - `id`: uuid (Primary Key)
  - `name`: text
  - `target_thickness`: float8
  - `created_at`: timestamp

## 🔮 Future Roadmap (Ideas)
- [ ] **Barcode/QR Scanning:** Using the phone camera to scan delivery notes and automatically load product data/thickness.
- [ ] **OCR (Text Recognition):** Intelligent scanning of physical documents.
- [ ] **History Logs:** Save calculation results locally or to the cloud for later review.
- [ ] **PDF Report:** Generate a simple PDF of the calculation for quality control.

---
*Documentation updated: 2026-05-11*
