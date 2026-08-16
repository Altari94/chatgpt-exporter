# v0.9.0 – Chrome-first Export UI

## Ziel

Die Chrome Extension ist das primäre Produkt: Ein Raw-JSON-Download steht im Vordergrund; nützliche Einzelchat-Formate aus dem bisherigen Userscript sind ohne Tampermonkey erreichbar.

## User Stories

- Als Nutzer möchte ich den aktuellen Chat mit einem Klick als unverändertes Raw JSON sichern.
- Als Nutzer möchte ich den aktuellen Chat zusätzlich als Text, Markdown oder HTML exportieren.
- Als Nutzer möchte ich Text direkt in die Zwischenablage kopieren.
- Als Nutzer möchte ich alle sichtbaren Chats als einzelne Raw-JSON-Dateien herunterladen.
- Als Nutzer möchte ich die Chatliste durchsuchen, einzelne Chats auswählen, alle auswählen oder einen laufenden Export abbrechen.
- Als Nutzer möchte ich die Popup-Sprache auf Deutsch, Englisch oder Spanisch stellen.
- Als Nutzer möchte ich HTTP-Destination-Einstellungen nur bei Bedarf sehen.
- Als Entwickler möchte ich, dass abgeleitete Formate aus derselben Capture-Quelle entstehen und den Raw-Download nicht verändern.

## Umsetzung

- `extension/popup.html`: responsive Kartenstruktur, Dark-Mode, sichtbare Fokuszustände, Raw-Export als Primäraktion.
- `extension/src/derived-export.ts`: browserunabhängige Projektion der ChatGPT-Mapping-Kette in Text, Markdown und HTML.
- `extension/src/content.ts`: typisierte `EXPORT_CURRENT`-Aktion, Download- und Clipboard-Adapter.
- `extension/src/chatgpt-source.ts`: paginierter Abruf der Chatliste und einzelner Rohantworten.
- Chatlistenseiten werden bei bekannter Gesamtzahl mit begrenzter Parallelität geladen, damit die Auswahl schneller erscheint.
- `extension/src/popup.ts`: Such-, Auswahl-, Abbruch- und Sprachzustand der Oberfläche.
- `extension/manifest.json`: Extension-Version `0.9.0`.

## Bewusste Grenze

Export All lädt bis zu 1.000 sichtbare Chats paginiert und startet je Chat einen einzelnen Raw-JSON-Download. ZIP-Bündel und PNG-Screenshot werden bewusst aus dem Chrome-Produkt gestrichen. Raw JSON bleibt die einzige verlustfreie Quelle.

Die Medienvollständigkeit ist noch nicht erreicht. Bild- und Medienexport ist in
[v0.10.0](./MILESTONE_V0.10.md) als Release-Blocker vorgemerkt und muss vor der
ersten öffentlichen Community-Veröffentlichung umgesetzt und geprüft werden.

## Gate

- `pnpm test`
- `pnpm lint`
- `pnpm test:extension`
- manuell: Raw JSON, Markdown, HTML und Clipboard auf einer normalen `/c/{id}`-Unterhaltung prüfen
