# Fork-Setup: ChatGPT Exporter

Dieses Arbeitsverzeichnis liegt bewusst außerhalb des iCloud-Obsidian-Vaults.

## Git-Konfiguration

- `upstream`: https://github.com/pionxzh/chatgpt-exporter.git
- `origin`: `git@github.com:Altari94/chatgpt-exporter.git`
- Entwicklungsbranches: `feat/*`; veröffentlichte Stände werden über einen geprüften Pull Request und einen Release-Tag bereitgestellt

## Entwicklung starten

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

## Qualitätsprüfungen

```bash
corepack pnpm test
corepack pnpm lint
corepack pnpm build
corepack pnpm build:extension
corepack pnpm test:core
corepack pnpm test:extension
corepack pnpm release:build
```

## Geplanter Entwicklungsrahmen

Die bestehende Exportlogik bleibt der Kern. Neue Funktionen werden als klar getrennte Erweiterungen aufgebaut, insbesondere eine Browser-Extension und konfigurierbare, ausdrücklich ausgelöste Export-Ziele.

Keine Zugangsdaten oder privaten Vault-Inhalte in dieses Repository einchecken. Lokale Konfiguration gehört in nicht versionierte Dateien.
