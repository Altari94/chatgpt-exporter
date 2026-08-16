# Developer Guide

## Schnellstart

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm lint
corepack pnpm test:extension
corepack pnpm build:extension
```

Die entpackte Erweiterung liegt danach unter `dist-extension/` und kann über `chrome://extensions` geladen werden.

## Architektur in einem Satz

Die Chrome-Extension ruft die authentifizierte ChatGPT-Web-API aus einem Content Script ab, bewahrt die Originalantwort unverändert als Raw Capture und leitet daraus optionale Darstellungen oder eine explizite HTTP-Übertragung ab.

```text
ChatGPT-Seite
    │
    ├── content.ts
    │     ├── chatgpt-source.ts      API/Auth/Conversation-Liste
    │     ├── raw-download.ts        verlustfreier Download
    │     ├── derived-export.ts      Text/Markdown/HTML/Clipboard
    │     └── service-worker.ts      HTTP-Destination
    │
    └── popup.ts / popup.html        Nutzeroberfläche
```

## Wichtige Dateien

| Datei | Verantwortung |
| --- | --- |
| `extension/manifest.json` | Manifest V3, Hosts und Berechtigungen |
| `extension/popup.html` | zugängliche Popup-Oberfläche und Styling |
| `extension/src/popup.ts` | UI-Zustand, Sprache, Auswahl und Nachrichten |
| `extension/src/content.ts` | ChatGPT-Seitenadapter und Exportaktionen |
| `extension/src/chatgpt-source.ts` | Session, Conversation-Endpunkte und Pagination |
| `extension/src/raw-download.ts` | Raw-Capture und Dateinamen/Download |
| `extension/src/derived-export.ts` | verlustbehaftete Projektionen aus Raw JSON |
| `extension/src/http-destination.ts` | validierter HTTP-Transport und Payload |
| `extension/src/service-worker.ts` | Endpoint-Einstellungen und Cross-Origin-Request |
| `src/core/capture.ts` | browserunabhängiges Capture-Modell |

## Nachrichtenvertrag

Popup und Content Script kommunizieren über typisierte Nachrichten:

- `DOWNLOAD_CURRENT_CONVERSATION`
- `LIST_CONVERSATIONS`
- `EXPORT_SELECTED_RAW`
- `CANCEL_EXPORT`
- `EXPORT_CURRENT` mit `text`, `markdown`, `html` oder `clipboard`
- `SEND_CURRENT_TO_ENDPOINT`
- `POPUP_PING`

Neue Aktionen sollten eine eigene Validierungsfunktion im Content Script besitzen. Unbekannte Nachrichten werden abgewiesen. Langlebige Aktionen müssen `true` aus dem `onMessage`-Handler zurückgeben und genau einmal antworten.

## Raw-Capture-Regel

`CaptureRecord.raw.text` ist die unveränderte HTTP-Antwort. Normalisierte oder gerenderte Inhalte dürfen niemals in dieses Feld zurückgeschrieben werden. Neue Formate lesen aus `record.raw.value` oder erzeugen eine getrennte Projektion.

## Neues Exportformat hinzufügen

1. Format in `DerivedFormat` ergänzen.
2. Renderer in `renderDerivedExport` implementieren.
3. Nachrichtenvalidierung in `content.ts` erweitern.
4. Button mit `data-export` in `popup.html` ergänzen.
5. Erfolgs-/Fehlerstatus und Dateiendung definieren.
6. Unit-/Extension-Test und manuelle ChatGPT-Prüfung ergänzen.

PNG und ZIP sind derzeit bewusst keine Erweiterungspunkte der Chrome-Produktlinie.

## Sicherheitsgrenzen

- Keine Zugangsdaten im Repository.
- Keine automatische Übertragung von Chats.
- HTTP-Endpoint nur nach expliziter Eingabe, Speicherung und Origin-Berechtigung.
- ChatGPT-Hosts sind auf die bekannten Webdomains begrenzt.
- Raw-Daten bleiben lokal, sofern der Nutzer nicht ausdrücklich einen Endpoint-Versand auslöst.

## Teststrategie

Automatisierte Tests prüfen Typen, Lint, Manifest, Capture-Erhalt, Pagination, Endpoint-Validierung und Timeout-Verhalten. Manuell müssen mindestens Raw JSON, ein abgeleitetes Format, Zwischenablage, Auswahl/Abbruch und Sprachumschaltung in einer echten `/c/{id}`-Unterhaltung geprüft werden.
