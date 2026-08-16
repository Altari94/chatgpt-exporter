# ChatGPT Exporter – Chrome Extension

Die Chrome-Extension ist der empfohlene Weg dieses Forks. Sie benötigt kein Tampermonkey.

## Installation

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build:extension
```

Danach `chrome://extensions` öffnen, den Entwicklermodus aktivieren und `dist-extension/` als entpackte Erweiterung laden.

## Funktionen

- Raw JSON als verlustfreier Primärexport
- Text-, Markdown- und HTML-Export für den aktuellen Chat
- Kopieren in die Zwischenablage
- Export All mit Chatliste, Einzel-/Gesamtauswahl und Abbruch
- explizite HTTP-Destination für eigene Workflows
- Deutsch, Englisch und Spanisch im Popup

PNG-Screenshots und ZIP-Batch-Export gehören bewusst nicht zum Chrome-Produkt. Tampermonkey ist für neue Nutzer nicht erforderlich.

Weitere Details: [Extension-Build](./docs/EXTENSION_BUILD.md), [v0.9-Milestone](./docs/MILESTONE_V0.9.md), [Sicherheitsprüfung](./docs/SECURITY_AND_PRIVACY.md), [Branding](./docs/BRANDING.md).
