# Projektstátusz és Frissítési Napló - Collini Industrial Suite

## Aktuális Elkészültségi Fázis: **v1.6.0 - Industrial Bath Controls & Timelines**

### Főbb képességek jelenleg:
- [x] **Moduláris Architektúra**: Teljesen szeparált funkcionális modulok (`Hub`, `Calculator`, `Logbook`, `InfoWall`, `Admin`, `ChemNickel`).
- [x] **Központosított Állapotkezelés**: React Context API alapú globális állapotszinkronizálás.
- [x] **ChemNickel Umpumpen**: Valós idejű vegyi nikkel kádállapot-követés automatikus pácidő (Beizzeit) folyamatjelzőkkel, manuális felülbírálásokkal és korai átpumpálási időkülönbségek fagyasztott rögzítésével.
- [x] **Wartungsplaner**: Moduláris ipari gépkarbantartási ütemterv kémiai és vizes pozíciók külön kezelésével.
- [x] **Rétegvastagság kalkuláció**: Precíz maradékidő számítás PDF exporttal.
- [x] **Logbuch (KS24)**: Teljes értékű ipari eseménynapló státusz- és prioritáskezeléssel.
- [x] **Infotafel**: Központi hirdetőtábla valós idejű futófény (Ticker) integrációval és sima, animált kinyitással/becsukással.
- [x] **Multilingual**: Teljes HU/DE támogatás külső fordítási fájlokkal.
- [x] **Industrial UI**: Sötét módú, nagy kontrasztú ipari megjelenés (Outfit Typography).

---

## Frissítési Napló (Changelog)

### [1.6.0] - 2026-05-20
#### Hozzáadva
- **ChemNickel Umpumpen Modul**: Vegyi nikkel kádak átpumpálási és karbantartási folyamatkövető modulja.
- **Kádvezérlő Hibrid Logika**: A kádak státuszának valós idejű auto-kalkulációja naplókból kombinálva Supabase manuális felülbírálásokkal (`collini_chemnickel_overrides`).
- **Folyamatjelző Timeline (Beizzeit)**: Teljes szélességű folyamatjelző sáv a Wannenbeize leteltét (12 óra) mutató animált pulzálással (100%), indítási és tervezett lejárati időpontokkal, valamint hátralévő idő számlálóval.
- **Megszakított Ciklusok Különbségkezelése**: Ha a WB letelte előtt újabb művelet történik a káddal, a betöltősáv fagyasztott állapotú narancs-szürke átmenetet kap, és kiírja a pácidőtől való negatív eltérést (pl. `Vorzeitig: -2h 15m`).
- **Összecsukható Manuális Sorok**: A manuális naplósorok alapértelmezetten becsukva jelennek meg, csökkentve a vizuális zajt, de nyomtatáskor automatikusan kibontakoznak.
- **Infosáv layout és animációs javítások**: A visszaigazolást jelző pontokat elszeparáltuk a gomboktól a fejlécbe, megszüntetve a vizuális átfedést. Emellett hardveresen gyorsított kinyitás/összecsukás animációt adtunk az infosávhoz (`transform` és `opacity` eltolással).

### [1.5.1] - 2026-05-17
#### Hozzáadva
- **Integrációs Tervezés & Koncepció**: A WSlave vezérlő szoftver képernyőképének (5.jpeg) részletes vizsgálata. Kétirányú gyártáskövető számlálók és valós idejű gép-előrejelzés (Prognose/ZielWT) adatkinyerési terve.
- **Német nyelvű Vezetői Pitch**: Műszaki és üzleti javaslat összeállítása a cégvezetés jóváhagyásához, fókuszban az OT-biztonsággal (Read-Only Agent).
- **SAP ERP Integrációs Terv**: SFTP/OData/Staging DB alapú vállalati integrációs lehetőségek elemzése.
- **IoT & Mikroszoftver Útmutató**: Okos adagolás, riasztások és mikroszámítógépes automatizációk tervezése.

### [1.5.0] - 2026-05-16
#### Hozzáadva
- **Wartungsplaner Modul**: Teljes körű gépkarbantartási ütemterv modul, amely külön kezeli a kémiai (`Chemical`) és vizes (`Water`) pozíciókat.
- **Több-Munkamenetes (Multi-Session) Architektúra**: Adatbázis-alapú (Supabase) folyamatkezelés. Egy naptári héten (Kalenderwoche - KW) belül több párhuzamos karbantartási munkamenet is futhat és visszakereshető.
- **Folyamatos Adatmentés (State Persistence)**: Az aktív (még le nem zárt) karbantartások feladatai (kipipálások, időadatok) automatikusan, valós időben mentődnek a felhőbe, megakadályozva az adatvesztést.
- **Teljes Kádadatbázis**: 26 hiányzó vizes kád és speciális zuhanypozíciók (`Duschposition`) hozzáadása. Vizuálisan valósághű színezések (pl. Ni-Strike: sötétzöld, Kupferbad: barna, Zinnbad: vanília).
- **Ipari Terminológia**: Státuszok egységesítése a német üzemeltetési standardokra (`GEPLANT`, `IN ARBEIT`, `ERLEDIGT`). Időadatok percalapú (`min`) megadása.
- **Valós Idejű Folyamatkövetés**: Dinamikus "Wartungsfortschritt" progress bar integrálása, amely az elvégzett feladatok arányát mutatja, és 100%-nál zöldre vált.
- **Extra Feladatok Sidebar**: Külön panel a speciális feladatoknak (pl. Anódcsere, Síntisztítás) modern, 3 oszlopos grid elrendezésben.
- **Dinamikus Tartomány Kijelölés**: A "Schienen" (síntisztítás) feladatnál kezdő- és végpont választható, amely a géprajzon azonnali, teljes fényerejű lila (`#a855f7`) pulzáló vizuális kiemelést (highlight) eredményez a kijelölt tartomány felett.
- **UI/UX Fejlesztések**: KW-Lapozó sáv az egyszerű heti navigációhoz. A táblázatok 15 soros (750px max-height) nézetre lettek optimalizálva a görgetés minimalizálása érdekében. Húzásos (Drag-to-select) és Shift+Click kijelölés. Több kád állapotának és akciójának egyszerre történő (Bulk) módosítása.

#### Javítva
- **Header Branding**: A modul fejlécének konzisztensé tétele a Collini Industrial Suite stílusrendszerével.
- **Gépterem-térkép Szinkron**: A táblázatos módosítások azonnali vizuális visszacsatolása a grafikus kád-elrendezésen.

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
- [x] **Wartungsplaner**: Gépkarbantartási ütemterv modul kidolgozása.
- [ ] **Checklista**: Műszakátvételi ellenőrző lista implementálása.
- [ ] **Produkciós Terv**: Vizuális produkciós ütemező modul.
- [ ] **Barcode/QR**: Dokumentumok és termékek gyors beolvasása.
- [ ] **WSlave Realtime Integráció (Koncepció fázis)**: Az óránkénti ZielWT és termelési számlálók (Input/Output) automatikus kinyerése a vezérlő PC-ről (`C:\SL_COLLINI_WIEN_KS24\DAT`) egy könnyűsúlyú, Read-Only Python/Node.js Agent segítségével (vezetői jóváhagyásra vár).

