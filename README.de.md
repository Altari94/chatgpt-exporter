# ChatGPT Exporter – Chrome Extension

Die Chrome-Extension ist der empfohlene Weg dieses Forks. Sie benötigt kein Tampermonkey.

## Projekt

Dieser eigenständige MIT-Fork von [pionxzh/chatgpt-exporter](https://github.com/pionxzh/chatgpt-exporter) konzentriert sich auf eine native Chrome-Extension und portable Chat-Pakete. Der Original-JSON-Export bleibt unverändert erhalten; Markdown, Medienmanifest und lokale Bilder machen die Rohdaten lesbar und weiterverwendbar. Der frühere Userscript-Weg ist nicht der empfohlene Nutzerpfad und wird nicht in Chrome-Release-Artefakten ausgeliefert.

## Installation

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build:extension
```

Danach `chrome://extensions` öffnen, den Entwicklermodus aktivieren und `dist-extension/` als entpackte Erweiterung laden. Ohne lokalen Checkout kann stattdessen das `extension/`-Verzeichnis aus dem ZIP-Artefakt des aktuellen GitHub-Releases geladen werden.

## Funktionen

- Raw JSON als verlustfreier Primärexport
- Chat-Paket mit Raw JSON, Markdown, Medienmanifest und lokalen Bildern
- Text-, Markdown- und HTML-Export für den aktuellen Chat
- Kopieren in die Zwischenablage
- Export All mit Chatliste, Einzel-/Gesamtauswahl und Abbruch
- explizite HTTP-Destination für eigene Workflows
- Deutsch, Englisch und Spanisch im Popup

PNG-Screenshots und ZIP-Batch-Export gehören bewusst nicht zum Chrome-Produkt. Tampermonkey ist für neue Nutzer nicht erforderlich.

Weitere Details: [Installation](./docs/INSTALLATION.de.md), [Extension-Build](./docs/EXTENSION_BUILD.md), [Changelog](./CHANGELOG.md), [Sicherheitsprüfung](./docs/SECURITY_AND_PRIVACY.md), [Projektidee](./docs/PROJECT_INTENT.md), [Fork-Vergleich](./docs/UPSTREAM_VS_FORK.md) und [Branding](./docs/BRANDING.md).
