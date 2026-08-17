# Chrome-Extension-Build

## Lokale Entwicklung

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build:extension
```

In Chrome `chrome://extensions` öffnen, den Entwicklermodus aktivieren und `dist-extension/` als entpackte Erweiterung laden.

## Release-Artefakte

```bash
corepack pnpm release:build
```

Der reproduzierbare Build erzeugt `dist-release/chatgpt-exporter-v0.10.0/` mit:

- `extension/`: primäres Chrome-Extension-Artefakt
- `legacy-userscript/chatgpt.user.js`: Kompatibilitätsartefakt für bestehende Installationen
- `RELEASE-METADATA.json`: Artefaktrollen und Build-Befehle

Der Raw-Download erzeugt bei vorhandenen Bildreferenzen zusätzlich einzelne
Bilddateien und eine `{chat}.media.json`-Datei. Diese Sidecar-Datei ordnet jede
Bilddatei ihrem JSON-Pfad und Downloadstatus zu.

Bei der ersten Nutzung des strukturierten Exports fragt Chrome optional nach der
Berechtigung `downloads`. Nach Zustimmung werden die Dateien deterministisch
unter `Downloads/ChatGPT Exporter/{created}__{title-slug}__{id8}/` abgelegt:

```text
conversation.json
conversation.md
media.json
assets/asset-001-....jpg
```

`conversation.md` ist die lesbare, portable Darstellung des Pakets. Sie enthält
Frontmatter, Rollen, Gesprächsreihenfolge und relative Bildlinks wie
`![Bild](assets/asset-001.jpg)`. `conversation.json` bleibt die unveränderte
technische Quelle; der separate **Raw JSON**-Button exportiert nur diese Datei.

Die aktuelle Standardkonvention lautet:

```text
{created}__{title-slug}__{id8}
```

Beispiel: `2026-08-17__Schweden-Anfrage-Formulierung__6a81e30d`. Das Datum
stammt aus dem Chat, der Titel wird dateisicher gekürzt und `id8` ist der
stabile Kurzpräfix der Conversation-ID. Die vollständige ID bleibt in
`conversation.json` und `media.json` erhalten. Eigene Muster können später über
eine Optionen-Oberfläche ergänzt werden; dabei bleibt eine ID-Komponente
verpflichtend, damit Exporte eindeutig bleiben.

Ohne Zustimmung bleibt der einzelne Download als Fallback verfügbar; die
Extension verlangt die Berechtigung nicht für Capture, HTTP oder andere
Funktionen.

`dist-release/` ist absichtlich nicht versioniert. Das Release wird aus einem sauberen Git-Checkout erzeugt.

## Qualitätsgates

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm test:core
corepack pnpm test:extension
corepack pnpm build
corepack pnpm release:build
```
