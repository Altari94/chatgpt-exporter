# Fork-Maintenance und Upstream-Synchronisation

## Herkunft

Dieses Repository ist ein Fork von [`pionxzh/chatgpt-exporter`](https://github.com/pionxzh/chatgpt-exporter). Die MIT-Lizenz und die Upstream-Attribution bleiben erhalten.

## Branch-Modell

- `main`: veröffentlichter, geprüfter Stand
- `feat/*`: fokussierte Änderungen
- Tags: versionierte Meilensteine und Releases

## Upstream prüfen

```bash
git fetch upstream
git log --oneline --decorate --graph --all -20
```

Upstream-Änderungen werden nicht blind gemerged. Zuerst prüfen:

1. Ändert sich der ChatGPT-API-Vertrag?
2. Betrifft die Änderung `src/api.ts`, Exportformate oder Authentifizierung?
3. Passt sie zur Chrome-first-Architektur?
4. Sind Lizenz- und Attributionstexte weiterhin korrekt?

Danach werden relevante Commits gezielt übernommen, getestet und dokumentiert. Ein Fork-Release darf eigene Produktentscheidungen enthalten; es muss nicht jede Upstream-Funktion übernehmen.

## Release-Gate

Vor einem Release müssen `pnpm test`, `pnpm lint`, `pnpm test:extension`, `pnpm build` und `pnpm release:build` erfolgreich sein. Zusätzlich muss die manuelle Checkliste in `docs/RELEASE_CHECKLIST.md` abgehakt werden.

## Namensnennung und Lizenz

Die Upstream-Herkunft wird in README, Lizenz und dieser Datei genannt. Eigene Änderungen stammen aus diesem Fork; der persönliche Maintainer-Fokus wird transparent als Projektintention beschrieben.
