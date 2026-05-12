# Projektstátusz és Frissítési Napló - Collini Industrial Suite

## Aktuális Elkészültségi Fázis: **v1.3.5 - Stabil / Production Ready**

### Főbb képességek jelenleg:
- [x] **Rétegvastagság kalkuláció**: Precíz maradékidő számítás.
- [x] **Termékadatbázis**: Dinamikus termékkezelés Supabase alapokon.
- [x] **Logbuch (KS24)**: Teljes értékű ipari eseménynapló státusz- és prioritáskezeléssel.
- [x] **Infotafel**: Központi hirdetőtábla adminisztrátori vezérléssel.
- [x] **Multilingual**: Teljes HU/DE támogatás.
- [x] **Industrial UI**: Sötét módú, nagy kontrasztú ipari megjelenés.
- [x] **PDF Export**: Mérési jegyzőkönyvek generálása.
- [x] **Backup System**: Automatizált forráskód mentés.

---

## Frissítési Napló (Changelog)

### [1.3.5] - 2026-05-12
#### Hozzáadva
- **Rich Text Editor**: WYSIWYG szerkesztő az Infotafel hirdetményekhez (félkövér, aláhúzott, színválasztás).
- **Szerző-központú kártyák**: Az Infotafel kártyák fejlécében mostantól a létrehozó neve látható a jobb nyomonkövethetőség érdekében.
- **Smart Ticker**: Automatikus HTML-tisztítás a futófényben a zavartalan olvashatóságért.

#### Javítva
- **Popup UI**: A Login és egyéb kisméretű ablakok mostantól nem foglalják el a teljes képernyőt, méretük igazodik a tartalomhoz.
- **Modal szélesség**: Az Infotafel szerkesztő ablak 800px szélességű lett a kényelmesebb gépeléshez.
- **Lokalizációs Safeguard**: Beépített kód-szintű fordítás a részlegek számára (HU->DE kényszerítés).

### [1.3.0] - 2026-05-12
#### Hozzáadva
- **Hub UI Finomítás**: Modul kártyák méretének optimalizálása a jobb helykihasználás érdekében.
- **Vizuális Branding**: Visszaállított nagy, glow-effektes Collini logó a főképernyőn.
- **Nyelvi Elsődlegesség**: Alapértelmezett német nyelv (HU másodlagos).
- **Animációk**: Kártya beúszó animációk az Infotafelen.

#### Javítva
- **Redundancia**: Felesleges "Collini" szöveg eltávolítása a logó mellől a Hub-on.
- **Logó elrendezés**: Modulokban balra igazított, kisebb, diszkrétebb logó.

### [1.2.0] - 2026-05-12
#### Hozzáadva
- **Infotafel Modul**: Teljes körű hirdetménykezelés (Létrehozás, Szerkesztés, Törlés).
- **Admin Kontroll az Infotafelen**: Csak bejelentkezett adminok módosíthatják az üzeneteket.
- **Lejárati idő**: Hirdetmények automatikus elrejtése dátum alapján.
- **Backup Script**: `backup.ps1` létrehozása a biztonságos mentésekhez.
- **Technikai Dokumentáció**: HU és DE nyelvű részletes leírások.

#### Javítva
- **Logbuch vizuális korrekció**: Status-színek pontosítása (Offen: Piros, In Arbeit: Sárga, Erledigt: Zöld).
- **Prioritás Badge-ek**: Megnövelt méret és javított kontraszt az olvashatóság érdekében.
- **Row Styling**: A táblázat sorai most már az állapotuknak megfelelő oldalszegélyt kapnak.

### [1.1.0] - 2026-05-11
#### Hozzáadva
- **Global Ticker**: Futófény az aktív információknak minden nézetben.
- **Admin Dashboard**: Központi felület a termékek és konfigurációk kezeléséhez.
- **Dynamic Config**: Részlegek és nevek szerkeszthetősége az adatbázisból.

### [1.0.0] - Alapverzió
- Alapvető kalkulátor funkciók.
- Supabase integráció kezdete.
- Kezdeti Industrial Design.

---

## Jövőbeli tervek (Roadmap)
- [ ] **Wartungsplaner**: Gépkarbantartási ütemterv modul kidolgozása.
- [ ] **Checklista**: Műszakátvételi ellenőrző lista implementálása.
- [ ] **PWA támogatás**: Offline működés és mobil telepíthetőség javítása.
- [ ] **Statisztikák**: Grafikonos kimutatások a mérésekről és hibákról.
