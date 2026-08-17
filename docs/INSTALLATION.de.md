# Installation (Deutsch)

## Installation aus einem Release

1. `chatgpt-exporter-vX.Y.Z.zip` von der GitHub-Release-Seite herunterladen.
2. Das Archiv entpacken.
3. In Chrome `chrome://extensions` öffnen und den **Entwicklermodus** aktivieren.
4. **Entpackte Erweiterung laden** wählen und das entpackte Verzeichnis `extension` auswählen.
5. Eine normale Unterhaltung unter `https://chatgpt.com/c/{id}` öffnen und das Extension-Popup öffnen.
6. **Chat-Paket herunterladen** wählen und die optionale Chrome-Downloadberechtigung bestätigen.

Das Paket liegt unter `Downloads/ChatGPT Exporter/` und enthält das originale `conversation.json`, das lesbare `conversation.md`, `media.json` und erfasste Dateien unter `assets/`.

## Installation aus dem Quelltext

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build:extension
```

Danach `dist-extension/` mit denselben Chrome-Schritten laden.

## Fehlerbehebung

- Nach einem lokalen Build die Erweiterung unter `chrome://extensions` neu laden.
- Anschließend den ChatGPT-Tab aktualisieren.
- Eine normale Conversation-URL verwenden. Share- und Projektseiten sind nicht Teil der v1.0-Kompatibilitätszusage.
- Bei abgelehnter Downloadberechtigung **Raw JSON** verwenden.

Vor der Konfiguration eines HTTP-Ziels bitte die [Sicherheits- und Datenschutzhinweise](./SECURITY_AND_PRIVACY.md) lesen.
