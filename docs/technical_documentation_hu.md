# Technikai Dokumentáció - Collini Schichtstärke Rechner

## 1. Áttekintés
A Collini Schichtstärke Rechner egy ipari környezetre tervezett webalkalmazás, amely segít a galvanizálási folyamatok során a rétegvastagság és a szükséges maradékidő kiszámításában. Az alkalmazás modern, "Industrial Dark Mode" dizájnt használ, amely kiváló olvashatóságot biztosít üzemi körülmények között is.

## 2. Technológiai Stack
- **Frontend**: React.js (Vite)
- **Backend/Adatbázis**: Supabase (PostgreSQL)
- **Stílus**: Vanilla CSS (Custom Properties alapú design system)
- **Ikonok**: Lucide React
- **PDF Generálás**: jsPDF, jsPDF-AutoTable

## 3. Modulok és Funkciók

### 3.1. Rétegvastagság Kalkulátor
- Automatikus maradékidő számítás bemeneti paraméterek alapján.
- Termékadatbázis integráció (Soll-értékek automatikus betöltése).
- Mértékegység váltás (perc, másodperc, óra:perc).
- Eredmények mentése és PDF exportálása.

### 3.2. Logbuch (KS24) - Eseménynapló
- Üzemi események, hibák és karbantartási munkák rögzítése.
- **Státuszkezelés**:
  - `Offen` (Nyitott): Piros jelzés, azonnali figyelmet igényel.
  - `In Arbeit` (Folyamatban): Sárga jelzés, a javítás megkezdődött.
  - `Erledigt` (Befejezve): Zöld jelzés, a feladat lezárva.
- **Prioritások**: Kritikus, Magas, Közepes jelölések vizuális kiemeléssel.
- Adminisztrátori szerkesztési és törlési jogkörök.

### 3.3. Infotafel (Hirdetőtábla)
- Fontos üzemi információk és hirdetmények megjelenítése.
- Adminisztrátori felület az üzenetek kezeléséhez.
- Prioritás alapú színezés (Normal, High, Urgent).
- Lejárati idő kezelése (automatikus elrejtés).

## 4. Adminisztráció és Biztonság
- **Admin Login**: Jelszóval védett felület (alapértelmezett: `Admin`).
- **Termékkezelés**: Új termékek felvétele, meglévők módosítása/törlése.
- **Konfiguráció**: Részlegek, karbantartók és operátorok listájának kezelése.

## 5. Adatbázis Szerkezet (Supabase)
- `collini_products`: Termékadatok és célvastagságok.
- `collini_history`: Mentett kalkulációk előzményei.
- `logbook`: Eseménynapló bejegyzések.
- `collini_logbook_config`: Dinamikus beállítások (részlegek, nevek).
- `collini_info_wall`: Hirdetmények adatai.

## 6. Telepítés és Futtatás
1. Függőségek telepítése: `npm install`
2. Fejlesztői szerver indítása: `npm run dev`
3. Build készítése: `npm run build`
