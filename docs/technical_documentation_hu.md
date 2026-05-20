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
- **Global Ticker**: A kiemelt hirdetmények valós idejű futósávja sima kinyitási és becsukási animációkkal, valamint visszaigazolási rendszerrel az operátorok számára.

### 3.4. ChemNickel (Vegyi Nikkel Átpumpálás)
- Vegyi nikkel kádak (Ansatz és Wannenbeize) valós idejű állapotának követése.
- **Hibrid állapot-kiszámítás**: Automatikus meghatározás a naplózott átpumpálási történetből, vagy kézi felülbírálás (Manueller Modus).
- **Beizzeit Progress Bar**: Vastag folyamatjelző sáv a pácidőhöz (12 óra), pulzáló jelzéssel a befejezéskor (100%), valós idejű visszaszámlálóval és kiinduló/cél dátumokkal.
- **Megszakítás követése**: Idő előtti átpumpálás esetén a folyamatjelző fagyasztásra kerül, a stílusa megváltozik, és kiírja az időkülönbséget (pl. `-2h 15m`).
- **Összecsukható előzmények**: A kézzel definiált inicializáló sorok alapértelmezetten el vannak rejtve, de nyomtatáskor automatikusan láthatóvá válnak.

### 3.5. Wartungsplaner (Gépkarbantartás)
- Kémiai és vizes kádak heti és munkamenet alapú karbantartásának követése.
- Feladatok valós idejű mentése és állapotszinkronizációja (State Persistence).
- Géprajzi vizuális visszajelzés és síntartomány-kijelölés (Schienen) lila pulzáló effekttel.

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
- `collini_wartung_sessions`: Karbantartási munkamenetek lezárási és naptári heti (KW) adatai.
- `collini_wartung_tasks`: Karbantartási feladatok egyedi státuszai és elvégzési időpontjai.
- `collini_chemnickel_pumpings`: Vegyi nikkel átpumpálások és karbantartások történelmi logbook naplója.
- `collini_chemnickel_overrides`: Vegyi nikkel kádak manuális állapot (Ansatz/Wannenbeize) felülbírálásai.

## 6. Telepítés és Futtatás
1. Függőségek telepítése: `npm install`
2. Fejlesztői szerver indítása: `npm run dev`
3. Build készítése: `npm run build`
