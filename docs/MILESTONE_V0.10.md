# v0.10.0 – Medienvollständiger Capture

## Status

Erfolgreich umgesetzt und manuell in Chrome geprüft. Eingebettete Bilder werden
als separate Dateien gesichert; das Paket enthält außerdem eine nachvollziehbare
Zuordnung und eine lesbare Markdown-Projektion.

## User Stories

- Als Nutzer möchte ich Bilder aus einer Unterhaltung gemeinsam mit dem Raw-
  Export sichern.
- Als Nutzer eines lokalen Archivs oder Verarbeitungssystems möchte ich
  Bilddateien lokal referenzieren und später unabhängig vom ChatGPT-Frontend
  verarbeiten oder darstellen können.
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

## Arbeitsstand

- `extension/src/media-assets.ts` erkennt eindeutige Bildpointer und erzeugt
  sichere Dateinamen.
- `extension/src/chatgpt-source.ts` löst `sediment://`-Pointer über die
  authentifizierte ChatGPT-Dateischnittstelle auf.
- `extension/src/raw-download.ts` lädt Bilder und eine `{chat}.media.json`-
  Zuordnung neben dem unveränderten Raw-JSON herunter.
- Nicht verfügbare Medien werden im Manifest als `failed` dokumentiert; der
  übrige Chat-Export bleibt erhalten.
- Optionales Chrome-`downloads`-Recht legt ein vollständiges Chatpaket in einem
  deterministischen Unterordner ab und überschreibt keine fremden Dateien.
- Standardnamen folgen `{created}__{title-slug}__{id8}`; die vollständige
  Conversation-ID bleibt ausschließlich in den Metadaten erhalten.
- Der primäre Button erzeugt ein vollständiges Chat-Paket aus `conversation.json`,
  `conversation.md`, `media.json` und `assets/`.
- `conversation.md` enthält YAML-Frontmatter, den vollständigen linearen
  Gesprächsverlauf und relative Markdown-Bildlinks.
- Ein manueller Chrome-Test mit einem Bild bestätigte das vollständige Paket
  mit originalem JSON, Markdown, Manifest und lokaler Bilddatei.
- Reiner JSON-Export bleibt als separate Einzelchat-Option verfügbar.

## Bewusste Grenzen

- Keine automatische OCR- oder Bildanalyse in der Extension.
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
