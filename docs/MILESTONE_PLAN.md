# Produkt- und Meilensteinplan

## Produktziel

Eine stabile Chrome Extension erfasst eine ChatGPT-Unterhaltung originalgetreu und lädt sie mit einer Nutzeraktion als Rohmaterial herunter. Der Capture-Kern bleibt unabhängig von der persönlichen Second-Brain-Architektur und bietet generische Exportziele.

Das Second Brain ist kein Bestandteil dieses Repositories, sondern ein späterer Verbraucher der Capture-Schnittstelle.

## Versionierungsregeln

Jeder abgeschlossene Meilenstein erhält einen Abschluss-Commit und einen Git-Tag `v0.x.0`. Innerhalb eines Meilensteins sind mehrere Conventional-Commits erlaubt. Der Tag ist das Akzeptanz-Gate.

## Architekturgrenzen

### Core

Enthält Raw-Capture-Modell, Validierung, Normalisierung, Renderer, Artefakte und versionierte Payload-Schemata. Keine Chrome-, DOM-, Tampermonkey- oder Netzwerk-APIs.

### Source Adapter

Kennt ChatGPT-URLs, eingeloggte Seitensitzung, API-Endpunkte, Page Bridge und spätere DOM-Fallbacks. Diese Details dürfen nicht in UI oder Destinations gelangen.

### Chrome Runtime

Manifest V3, Content Script, Page Bridge, Service Worker, Options-/Popup-UI, Storage und Downloads. Der Service Worker erhält keine unnötigen ChatGPT-Tokens.

### Destinations

Transportieren fertige Capture-Artefakte und parsen keine Conversations. Erste Ziele: Download, Clipboard, HTTP-Endpoint.

### Sicherheits- und Datenregeln

- `raw` bleibt unverändert; `normalized` ist immer abgeleitet.
- Tokens und Sessiondaten werden nie exportiert.
- Automatische Übertragung ist standardmäßig deaktiviert.
- Endpoint-Konfiguration bleibt lokal und wird nicht committet.
- Payloadänderungen werden über `schemaVersion` dokumentiert.
- Keine privaten Conversation-Fixtures im Repository.

## v0.1 – Reproduzierbare Ausgangsbasis

### User Stories

- Als Entwickler möchte ich das Projekt reproduzierbar installieren, damit alle am gleichen Stand arbeiten.
- Als Entwickler möchte ich den bestehenden Userscript-Exporter ausführen, damit die Ausgangsfunktion geschützt ist.
- Als Entwickler möchte ich anonymisierte Fixtures haben, damit Parser und Exporte ohne private Chats getestet werden.

### Backlog

- Installations-, Build- und Qualitätsablauf dokumentieren.
- Upstream-/Fork-/Branch-Workflow festhalten.
- Fixtures für einfachen Chat, Branching, Code, Quellen, multimodale und lange Chats anlegen.
- API-, URL- und DOM-Annahmen inventarisieren.

### Akzeptanz-Gate

- `corepack pnpm install --frozen-lockfile`, `test`, `lint` und `build` sind erfolgreich.
- Das bestehende Userscript kann installiert und gestartet werden.
- Fixtures enthalten keine privaten Inhalte.
- Bekannte Upstream-Risiken sind dokumentiert.

### Abschluss

`chore(baseline): establish reproducible development baseline` — `v0.1.0`

## v0.2 – Raw-Capture-Kern

### User Stories

- Als Nutzer möchte ich die originale ChatGPT-Antwort unverändert erhalten, damit ich sie später selbst verarbeiten kann.
- Als Entwickler möchte ich Raw-Daten und Normalisierung trennen, damit Parseränderungen kein Rohmaterial beschädigen.
- Als Entwickler möchte ich den Kern ohne Browser ausführen können, damit er zuverlässig testbar ist.

### Backlog

- `CaptureRecord` mit `schemaVersion`, `source`, `raw` und optional `normalized` definieren.
- Response als Text erfassen und separat parsen.
- Normalisierung ausschließlich auf einer Kopie ausführen.
- Source-, Conversation- und Artifact-Typen aus UI und Exportern herauslösen.
- Fixture-basierte Core-Tests ergänzen.

### Akzeptanz-Gate

- Raw-Inhalt entspricht dem empfangenen JSON.
- Fehlende Normalisierung verhindert den Raw-Capture nicht.
- Core-Tests benötigen weder Chrome noch DOM noch Tampermonkey.
- Schema- und Kompatibilitätsregeln sind dokumentiert.

### Abschluss

`refactor(core): introduce raw-first capture model` — `v0.2.0`

## v0.3 – Chrome-Extension-Shell

### User Stories

- Als Nutzer möchte ich die Erweiterung direkt in Chrome installieren, ohne Tampermonkey zu konfigurieren.
- Als Nutzer möchte ich auf einer ChatGPT-Unterhaltung einen sichtbaren Capture-Einstiegspunkt haben.
- Als Entwickler möchte ich Extension-Runtime, ChatGPT-Adapter und Core getrennt testen.

### Backlog

- Manifest V3 und reproduzierbaren Extension-Build einführen.
- Content Script und Page Bridge für ChatGPT ergänzen.
- Typisierte Nachrichten zwischen Page Bridge, Content Script und Service Worker definieren.
- Minimalen Popup-/Options-Einstieg schaffen.
- Berechtigungen dokumentieren und minimieren.

### Akzeptanz-Gate

- Extension lässt sich in Chrome laden.
- ChatGPT-Seiten werden ohne globale `*://*/*`-Berechtigung erkannt.
- Eine Testnachricht erreicht alle vorgesehenen Komponenten.
- Kein Token wird an externe Ziele oder unnötig an den Service Worker gegeben.
- Userscript bleibt baubar.

### Abschluss

`feat(extension): add manifest-v3 chrome extension shell` — `v0.3.0`

## v0.4 – Ein-Klick-Raw-Download (persönliches Kernziel)

### User Stories

- Als Nutzer möchte ich den aktuell geöffneten Chat mit einem Klick als Roh-JSON herunterladen.
- Als Nutzer möchte ich bei fehlender Sitzung oder Unterhaltung eine verständliche Fehlermeldung erhalten.
- Als Nutzer möchte ich einen sinnvollen Dateinamen, ohne dass der Dateiinhalt verändert wird.
- Als Nutzer möchte ich niemals eine unvollständige Datei als erfolgreichen Export gemeldet bekommen.

### Backlog

- Use Case `captureCurrentConversation` implementieren.
- Raw-JSON über `DownloadDestination` herunterladen.
- Dateiname aus Titel, Chat-ID und Zeit ableiten.
- Statusmodell für Capture und Download einführen.
- Fehlercodes für Authentifizierung, Schema, fehlende Unterhaltung und Bridge-Fehler definieren.

### Akzeptanz-Gate

- Eine Nutzeraktion erzeugt auf einer normalen ChatGPT-Unterhaltung eine vollständige Raw-JSON-Datei.
- Die Datei ist parsebar und enthält die originale Conversation-Struktur.
- Der Download funktioniert nach Navigation und Seitenwechsel reproduzierbar.
- Share-Seiten werden unterstützt oder mit einer getesteten Fehlermeldung abgewiesen.
- Es erfolgt kein automatischer externer Versand.

### Abschluss

`feat(capture): add one-click raw conversation download` — `v0.4.0`

Ab diesem Meilenstein ist dein persönliches Hauptziel erreicht.

## v0.5 – Bestehende Exportfunktionen erhalten

### User Stories

- Als bisheriger Nutzer möchte ich Text, Markdown, HTML, PNG und JSON weiter exportieren.
- Als Nutzer möchte ich den bestehenden Mehrfach-Export weiterverwenden.
- Als Entwickler möchte ich Renderer und Destinations nicht doppelt pflegen.

### Backlog

- Renderer auf das gemeinsame Capture-/Artifact-Modell umstellen.
- Download und Clipboard kapseln.
- Einzel- und Mehrfach-Export auf gemeinsame Use Cases führen.
- Regressionstests für Formate und ZIP-Batches ergänzen.

### Akzeptanz-Gate

- Alle dokumentierten Formate erzeugen weiterhin gültige Ergebnisse.
- Kein Renderer greift direkt auf Chrome- oder Tampermonkey-APIs zu.
- Einzel- und Mehrfach-Export bestehen Fixture-Regressionstests.
- Bestehende Einstellungen werden migriert oder klar behandelt.

### Abschluss

`refactor(export): route existing formats through destinations` — `v0.5.0`

## v0.6 – Offene HTTP-Destination

### User Stories

- Als Nutzer möchte ich einen eigenen HTTP-Endpoint konfigurieren, um Captures in mein eigenes System zu übernehmen.
- Als Nutzer möchte ich die Verbindung testen können, bevor ich Daten sende.
- Als Nutzer möchte ich jeden Versand ausdrücklich auslösen.
- Als Entwickler möchte ich ein dokumentiertes, generisches Payload erhalten.

### Backlog

- `HttpEndpointDestination` implementieren.
- Versioniertes `CaptureEnvelope` dokumentieren.
- Endpoint lokal speichern und Test-Connection anbieten.
- Timeout, Nicht-2xx-Fehler und kontrollierte Wiederholung behandeln.
- Lokalen Mock-Server für Payload-Tests bereitstellen.

### Akzeptanz-Gate

- Endpoint wird nur durch explizite Nutzeraktion aufgerufen.
- Payload enthält `schemaVersion`, `source` und unveränderte `raw`-Daten.
- Fehler werden verständlich angezeigt.
- Keine Credentials sind hardcodiert.
- Mock-Server kann den Payload validieren.

### Abschluss

`feat(destination): add generic http endpoint` — `v0.6.0`

Damit ist die offene Community-Schnittstelle fertig.

## v0.7 – Robustheit und Batch-Sicherheit

### User Stories

- Als Nutzer möchte ich bei großen Exporten sicher sein, dass keine Chats still fehlen.
- Als Nutzer möchte ich geladene, erfolgreiche und fehlgeschlagene Captures getrennt sehen.
- Als Entwickler möchte ich Rate-Limit- und API-Fehler diagnostizieren können.

### Backlog

- Batch-Export-Problem aus Issue #366 reproduzieren und beheben oder ausschließen.
- Erfolgs- und Fehlerzähler trennen.
- Rate-Limit-Verhalten und Retry-Grenzen dokumentieren.
- Export aller Projekte prüfen, ohne vorhandene Funktionen zu duplizieren.
- Partielle Batch-Läufe sichtbar machen.

### Akzeptanz-Gate

- Erfolgszahlen entsprechen tatsächlich gespeicherten Captures.
- Fehlende Chats werden sichtbar gemeldet.
- Wiederholungen sind begrenzt und verändern gesicherte Rohdaten nicht.
- Tests decken leere, partielle, rate-limitierte und große Batches ab.

### Abschluss

`fix(batch): make capture counts and partial failures explicit` — `v0.7.0`

## v0.8 – Open-Source-Release

### User Stories

- Als neuer Nutzer möchte ich die Extension ohne persönliche Projektkenntnisse installieren können.
- Als Entwickler möchte ich Erweiterungspunkte, Berechtigungen und Payload verstehen.
- Als Maintainer möchte ich Änderungen nachvollziehbar veröffentlichen und auf ChatGPT-Änderungen reagieren können.

### Backlog

- README für Chrome-Installation, Berechtigungen und Raw-Download aktualisieren.
- Userscript- und Extension-Builds dokumentieren.
- Changelog und Release-Checkliste ergänzen.
- Sicherheits- und Datenschutzprüfung durchführen.
- Lizenz, Herkunft und Upstream-Abweichungen dokumentieren.

### Akzeptanz-Gate

- Eine neue Person kann das Projekt aus dem README bauen und installieren.
- Qualitätsprüfungen laufen erfolgreich.
- Keine privaten Daten, Zugangsdaten oder lokalen Pfade sind enthalten.
- Lizenz und Herkunft des Forks bleiben sichtbar.
- Release-Artefakte sind reproduzierbar.

### Abschluss

`docs(release): document chrome extension and open capture interface` — `v0.8.0`

## Definition of Done für jeden Meilenstein

- User Stories und Backlog sind umgesetzt oder bewusst aus dem Scope entfernt.
- Alle Akzeptanzkriterien sind nachweisbar erfüllt.
- Tests, Lint und Build laufen erfolgreich.
- Dokumentation ist aktualisiert.
- Keine privaten Daten oder Credentials sind eingecheckt.
- Abschluss-Commit und Tag sind erstellt.

## Nicht Bestandteil dieses Projekts

- Second-Brain-Datenmodell
- Obsidian-Vault-Logik
- Knowledge Compiler
- persönliche Archivierungsregeln
- automatische Wissensableitung

Diese Funktionen gehören in ein separates Projekt und konsumieren nur die dokumentierte Capture-Schnittstelle.
