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

Der reproduzierbare Build liest die Version aus `package.json` und erzeugt für v1.0.0 `dist-release/chatgpt-exporter-v1.0.0/` mit:

- `extension/`: primäres Chrome-Extension-Artefakt
- `RELEASE-METADATA.json`: Artefaktrollen und Build-Befehle

Zusätzlich entsteht `dist-release/chatgpt-exporter-v1.0.0.zip`. Dieses ZIP ist das Artefakt für den manuellen Upload in einen GitHub Release und enthält das oben genannte Verzeichnis. Der Upstream-kompatible Legacy-Userscript-Build wird bewusst nicht in Chrome-Extension-Releases gepackt, damit dessen eigener Updatepfad nicht versehentlich mit der Extension-Version vermischt wird.

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

Ohne Zustimmung bleiben Capture, Einzeldateidownload und HTTP-Export nutzbar;
die Extension verlangt die Berechtigung nicht bei Installation oder für andere
Funktionen.

`dist-release/` ist absichtlich nicht versioniert. Das Release wird aus einem sauberen Git-Checkout erzeugt.

## GitHub-Release

1. Alle Qualitätsgates ausführen und die manuelle Checkliste abhaken.
2. Einen geprüften Release-Commit pushen und einen passenden Tag erstellen, zum Beispiel `v1.0.0`.
3. Den Tag pushen. Der Workflow **Verify release tag** prüft Version, Lint, Tests und den reproduzierbaren Release-Build.
4. Erst nach erfolgreichem Workflow einen GitHub Release für denselben Tag erstellen und das lokal erzeugte ZIP aus `dist-release/` als Asset hochladen.

Die Veröffentlichung ist bewusst ein manueller, überprüfbarer Schritt: Ein Tag erzeugt keinen stillen öffentlichen Release und kein Workflow schreibt zurück in den Branch.

## Qualitätsgates

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm test:core
corepack pnpm test:extension
corepack pnpm build
corepack pnpm release:build
```
