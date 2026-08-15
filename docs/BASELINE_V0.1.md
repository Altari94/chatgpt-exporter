# Baseline v0.1

## Zweck

Nachweis, dass der Fork reproduzierbar entwickelt werden kann und die bestehende Userscript-Ausgangsfunktion vor dem Umbau geschützt ist.

## Prüfungen am 15.08.2026

```text
corepack pnpm install --frozen-lockfile  ✓
corepack pnpm test                       ✓
corepack pnpm lint                       ✓
corepack pnpm build                      ✓
```

Der Build erzeugt weiterhin `dist/chatgpt.user.js`.

## Fixture-Satz

`tests/fixtures/synthetic-conversations.json` enthält synthetische Fälle für lineare Dialoge, Branching, Code/Quellen, Multimodalität und längere Verläufe. Es gibt keine echten Chatdaten.

## Gate-Entscheidung

v0.1 ist erfüllt, wenn die Prüfungen erfolgreich sind, die Fixtures vorhanden sind und die Architekturannahmen dokumentiert sind. Parser- und Regressionstests gehören zu v0.2.
