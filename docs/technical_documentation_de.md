# Technische Dokumentation - Collini Schichtstärke Rechner

## 1. Übersicht
Der Collini Schichtstärke Rechner ist eine für industrielle Umgebungen konzipierte Webanwendung. Sie unterstützt bei der Berechnung der Schichtdicke und der benötigten Restzeit in Galvanisierungsprozessen. Die Anwendung nutzt ein modernes "Industrial Dark Mode" Design für optimale Lesbarkeit in Produktionshallen.

## 2. Technologie-Stack
- **Frontend**: React.js (Vite)
- **Backend/Datenbank**: Supabase (PostgreSQL)
- **Styling**: Vanilla CSS (basiert auf Custom Properties)
- **Icons**: Lucide React
- **PDF-Generierung**: jsPDF, jsPDF-AutoTable

## 3. Module und Funktionen

### 3.1. Schichtstärke Rechner
- Automatische Restzeitberechnung basierend auf Eingabeparametern.
- Integration der Produktdatenbank (automatisches Laden von Soll-Werten).
- Einheitenumschaltung (min, sek, h:m).
- Speichern von Ergebnissen und PDF-Export.

### 3.2. Logbuch (KS24)
- Protokollierung von Betriebsereignissen, Fehlern und Wartungsarbeiten.
- **Statusverwaltung**:
  - `Offen`: Rote Markierung, erfordert sofortige Aufmerksamkeit.
  - `In Arbeit`: Gelbe Markierung, Reparatur wurde begonnen.
  - `Erledigt`: Grüne Markierung, Aufgabe abgeschlossen.
- **Prioritäten**: Kritisch, Hoch, Mittel mit visueller Hervorhebung.
- Administratorrechte zum Bearbeiten und Löschen.

### 3.3. Infotafel
- Anzeige wichtiger Betriebsinformationen und Ankündigungen.
- Admin-Oberfläche zur Verwaltung der Nachrichten.
- Prioritätsbasierte Farbkodierung (Normal, Hoch, Dringend).
- Verwaltung von Ablaufdaten (automatisches Ausblenden).

## 4. Administration und Sicherheit
- **Admin-Login**: Passwortgeschützter Bereich (Standard: `Admin`).
- **Produktverwaltung**: Hinzufügen, Bearbeiten und Löschen von Produkten.
- **Konfiguration**: Verwaltung von Abteilungen, Instandhaltern und Anlagenführern.

## 5. Datenbankstruktur (Supabase)
- `collini_products`: Produktdaten und Soll-Schichtdicken.
- `collini_history`: Verlauf der gespeicherten Kalkulationen.
- `logbook`: Einträge im Ereignisprotokoll.
- `collini_logbook_config`: Dynamische Einstellungen (Abteilungen, Namen).
- `collini_info_wall`: Daten der Infotafel.

## 6. Installation und Ausführung
1. Abhängigkeiten installieren: `npm install`
2. Entwicklungsserver starten: `npm run dev`
3. Build erstellen: `npm run build`
