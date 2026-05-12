# Technische Dokumentation - Collini Schichtstärke Rechner

## Systemübersicht
Diese moderne Webanwendung wurde für die industrielle Umgebung von Collini entwickelt. Sie umfasst einen Schichtstärke-Rechner und ein digitales Logbuch (KS24) zur Prozessoptimierung.

## Technologie-Stack
- **Frontend**: React.js (Vite)
- **Styling**: Vanilla CSS (Industrial Dark Theme)
- **Backend**: Supabase (PostgreSQL, Echtzeit-Updates)
- **Icons**: Lucide React
- **Export**: jsPDF für Messprotokolle

## Hauptmodule
1. **Rechner**: Produktspezifische Berechnungen für Liegezeit und Soll-Dicke.
2. **Logbuch**: Fehler- und Ereignisprotokollierung mit Echtzeit-Synchronisation.
3. **Administration**: Passwortgeschützte Verwaltung von Produkten und Parametern.

## Wartung
Das System ist so konzipiert, dass es wartungsarm ist. Änderungen an den Berechnungsparametern können direkt über das Admin-Panel vorgenommen werden.
