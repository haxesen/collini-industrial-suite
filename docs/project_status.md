# Projektstátusz és Frissítési Napló - Collini Industrial Suite

## Aktuális Elkészültségi Fázis: **v1.4.0 - Modular Enterprise Architecture**

### Főbb képességek jelenleg:
- [x] **Moduláris Architektúra**: Teljesen szeparált funkcionális modulok (`Hub`, `Calculator`, `Logbook`, `InfoWall`, `Admin`).
- [x] **Központosított Állapotkezelés**: React Context API alapú globális állapotszinkronizálás.
- [x] **Rétegvastagság kalkuláció**: Precíz maradékidő számítás PDF exporttal.
- [x] **Logbuch (KS24)**: Teljes értékű ipari eseménynapló státusz- és prioritáskezeléssel.
- [x] **Infotafel**: Központi hirdetőtábla valós idejű futófény (Ticker) integrációval.
- [x] **Multilingual**: Teljes HU/DE támogatás külső fordítási fájlokkal.
- [x] **Industrial UI**: Sötét módú, nagy kontrasztú ipari megjelenés (Outfit Typography).

---

## Frissítési Napló (Changelog)

### [1.4.0] - 2026-05-12
#### Hozzáadva
- **Modularizáció**: A monolitikus `App.jsx` szétbontása önálló modulokra a `src/modules/` könyvtárban.
- **Custom Hooks**: Minden modul saját hook-ot kapott a logika kezelésére (pl. `useCalculator`, `useLogbook`).
- **AppContext**: Globális állapotkezelő a nézetek, nyelvek és admin jogosultságok szinkronizálására.
- **Segédfunkciók Tára**: Központosított `helpers.js` a dátum és idő formázáshoz.
- **Fordítási Rendszer**: Különálló `translations.js` fájl a könnyebb lokalizáció érdekében.

#### Javítva
- **Kód Tisztaság**: Az `App.jsx` mérete 1200 sorról ~80 sorra csökkent, ami drasztikusan javítja a karbantarthatóságot.
- **Skálázhatóság**: Az új architektúra lehetővé teszi tetszőleges számú új modul hozzáadását a meglévő kód módosítása nélkül.

### [1.3.5] - 2026-05-12
#### Hozzáadva
- **Rich Text Editor**: WYSIWYG szerkesztő az Infotafel hirdetményekhez.
- **Szerző-központú kártyák**: Az Infotafel kártyák fejlécében a létrehozó neve látható.
- **Smart Ticker**: Automatikus HTML-tisztítás a futófényben.

#### Javítva
- **Popup UI**: A Login és egyéb kisméretű ablakok mérete optimalizálva.
- **Modal szélesség**: Az Infotafel szerkesztő ablak 800px szélességű lett.

### [1.3.0] - 2026-05-12
#### Hozzáadva
- **Hub UI Finomítás**: Modul kártyák méretének optimalizálása.
- **Vizuális Branding**: Visszaállított nagy, glow-effektes Collini logó a főképernyőn.
- **Nyelvi Elsődlegesség**: Alapértelmezett német nyelv.

---

## Jövőbeli tervek (Roadmap)
- [ ] **Wartungsplaner**: Gépkarbantartási ütemterv modul kidolgozása.
- [ ] **Checklista**: Műszakátvételi ellenőrző lista implementálása.
- [ ] **Produkciós Terv**: Vizuális produkciós ütemező modul.
- [ ] **Barcode/QR**: Dokumentumok és termékek gyors beolvasása.
