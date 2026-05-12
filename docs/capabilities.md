# Projekt Képességek és Feladatmegoldások

A **Collini Schichtstärke Rechner** több, mint egy egyszerű számológép. Az alábbi feladatok megoldására alkalmas:

## 1. Rétegvastagság Számítás (Calculator)
- **Cél**: A termék specifikációja alapján meghatározni a szükséges kifűtési időt és a várható rétegvastagságot.
- **Megoldás**: Dinamikus paraméterezés, ahol a sorszám (batch) és a mért adatok alapján a rendszer azonnal számolja a hátralévő időt.
- **Kimenet**: Digitális eredményjelző és nyomtatható mérési jegyzőkönyv (PDF).

## 2. Üzemi Naplózás (Logbook)
- **Cél**: A műszak során felmerülő hibák, események és karbantartási igények központi rögzítése.
- **Megoldás**: Egy mindenki számára látható, valós idejű táblázat, ahol a státuszok (NYITOTT -> FOLYAMATBAN -> BEFEJEZVE) nyomon követhetőek.
- **Előny**: Megszünteti a papír alapú füzeteket, az információ azonnal elérhető az irodából és az üzemből is.

## 3. Információs Tükör (Global Ticker)
- **Cél**: Fontos, sürgős információk eljuttatása minden dolgozóhoz.
- **Megoldás**: A kijelző tetején folyamatosan futó szöveges sáv, amely minden modulban látható.

## 4. Termékmenedzsment (Admin)
- **Cél**: A folyamatosan változó termékpaletta és technológiai paraméterek rugalmas kezelése.
- **Megoldás**: Jelszóval védett felület, ahol új termékek adhatóak hozzá, vagy a meglévők paraméterei (pl. időkonstansok) módosíthatóak kódolás nélkül.

## 5. Mobilitás és Elérhetőség
- **Cél**: Hogy a rendszer bárhol (targonca, kád mellett, iroda) elérhető legyen.
- **Megoldás**: PWA (Progressive Web App) technológia, így bármilyen okostelefonra vagy tabletre alkalmazásként telepíthető.
