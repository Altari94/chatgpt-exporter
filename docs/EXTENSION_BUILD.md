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

Der reproduzierbare Build erzeugt `dist-release/chatgpt-exporter-v0.9.0/` mit:

- `extension/`: primäres Chrome-Extension-Artefakt
- `legacy-userscript/chatgpt.user.js`: Kompatibilitätsartefakt für bestehende Installationen
- `RELEASE-METADATA.json`: Artefaktrollen und Build-Befehle

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
