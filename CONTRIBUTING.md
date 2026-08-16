# Contributing

Beiträge sind willkommen, auch wenn dieses Repository primär als persönlicher Fork gepflegt wird.

## Vor einem Pull Request

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm lint
corepack pnpm test:extension
```

Bitte beschreibe bei Extension-Änderungen:

- welche Nutzeraktion sich ändert;
- welche Berechtigungen und ChatGPT-Endpunkte betroffen sind;
- ob Raw JSON unverändert bleibt;
- wie die Änderung manuell getestet wurde.

## Designregeln

- Chrome-Extension vor Legacy-Userscript.
- Kleine, typisierte Nachrichten statt impliziter Seiteneffekte.
- Keine Zugangsdaten, privaten Pfade oder persönlichen Chatdaten in Tests und Commits.
- Neue Exportformate als getrennte Projektionen aus Raw JSON.
- Änderungen an ChatGPT-internen Endpunkten mit Fehlerbehandlung und Test abdecken.

Conventional Commits werden bevorzugt, zum Beispiel `feat(extension): add export filter` oder `fix(capture): preserve raw response`.
