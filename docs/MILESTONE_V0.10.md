# v0.10.0 – Medienvollständiger Capture

## Status

Vorgemerkt und Release-Blocker für den ersten Community-Release. Die aktuelle
Extension exportiert Chatdaten, aber eingebettete Bilder und andere Medien sind
noch nicht als eigenständige, lokal verarbeitbare Artefakte gesichert.

## User Stories

- Als Nutzer möchte ich Bilder aus einer Unterhaltung gemeinsam mit dem Raw-
  Export sichern.
- Als Second-Brain-Workflow möchte ich Bilddateien lokal referenzieren und
  später unabhängig vom ChatGPT-Frontend verarbeiten oder darstellen können.
- Als Entwickler möchte ich erkennen können, welche Medien erfolgreich geladen,
  übersprungen oder nicht mehr verfügbar waren.

## Geplanter Scope

- Medienreferenzen aus der originalen Conversation-Struktur erkennen.
- Bilder mit stabilen, sicheren Dateinamen neben dem JSON ablegen.
- Im Exportmanifest die Zuordnung zwischen Conversation, Nachricht und Bild
  dokumentieren.
- Originale Rohdaten unverändert lassen; angereicherte Medien als getrennte
  Artefakte ausgeben.
- Fehler, fehlende Berechtigungen und nicht mehr erreichbare Medien sichtbar
  machen.

## Bewusste Grenzen

- Keine automatische OCR-, Bildanalyse- oder Second-Brain-Logik in der
  Extension.
- Keine stillen Uploads an externe Dienste.
- Keine Ersetzung des Raw-JSON durch ein proprietäres Medienformat.

## Akzeptanz-Gate

- Ein Chat mit mindestens einem Bild erzeugt reproduzierbar JSON plus zugehörige
  Bilddatei(en).
- Die exportierte Zuordnung erlaubt eine spätere Darstellung ohne DOM-Scraping.
- Nicht verfügbare Medien werden gemeldet und verhindern nicht den übrigen
  Export.
- Einzelchat und Export All verhalten sich konsistent und bleiben abbrechbar.
- Tests, Dokumentation, Datenschutzprüfung und manuelle Chrome-Prüfung sind
  erfolgreich.

