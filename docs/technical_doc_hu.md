# Technikai Dokumentáció - Collini Schichtstärke Rechner

## Rendszer áttekintés
Ez egy modern, ipari környezetre tervezett webalkalmazás, amely a Collini üzemi folyamatait támogatja. A rendszer két fő modulból áll: egy rétegvastagság kalkulátorból és egy eseménynaplóból (Logbook).

## Technológiai verem
- **Frontend**: React.js (Vite)
- **Stílus**: Vanilla CSS (Industrial Dark Theme)
- **Backend**: Supabase (PostgreSQL, Real-time updates)
- **Ikonok**: Lucide React
- **PDF Generálás**: jsPDF, autoTable

## Főbb modulok
1. **Kalkulátor**: Termékspecifikus számítások a kádak maradékidejére és a rétegvastagságra.
2. **Logbook (KS24)**: Üzemi hiba- és eseménynapló, amely valós idejű szinkronizációval rendelkezik.
3. **Adminisztráció**: Termékek és paraméterek kezelése jelszóval védett felületen.

## Telepítés és Futtatás
```bash
npm install
npm run dev
```

## Adatbázis struktúra
A Supabase-ben a `products` és `log_entries` táblák tárolják az adatokat. A hozzáférés RLS (Row Level Security) szabályokkal védett.
