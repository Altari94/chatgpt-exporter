# Entwicklungsplan: persönlicher Fork von ChatGPT Exporter

Status: Entwurf  
Grundlage: Upstream-Stand `pionxzh/chatgpt-exporter`, Fork `Altari94/chatgpt-exporter`  
Branch: `feat/second-brain-capture`

## 1. Ausgangslage

Das bestehende Projekt ist ein funktionierendes TypeScript-/Preact-Userscript für Tampermonkey. Vite und `vite-plugin-monkey` erzeugen `dist/chatgpt.user.js`.

Bereits vorhanden:

- Erkennung von Chat-, Share- und Project-Seiten auf `chat.openai.com` und `chatgpt.com`.
- Zugriff auf die bestehende ChatGPT-Session und Backend-API.
- Normalisierung der Conversation-Struktur in `src/api.ts`.
- Export einzelner Unterhaltungen als Text, Markdown, HTML, PNG und JSON.
- Export vieler Unterhaltungen mit Auswahl, Suche, Sortierung, Projekten, ZIP-Dateien und offiziellen JSON-Daten.
- Verarbeitung von Bildern, Quellen, Tool-Ausgaben und optionalen Thinking-Inhalten.
- Persistente Userscript-Einstellungen über Greasemonkey/Tampermonkey-Storage.
- TypeScript-Prüfung, ESLint und Produktions-Build.

Aktuelle Grenzen:

- Laufzeit und UI sind direkt an ein injiziertes Userscript und an die ChatGPT-DOM-Struktur gekoppelt.
- Exportfunktionen rufen API, Normalisierung und konkrete Ausgabe (Clipboard/Download) direkt auf.
- Eine allgemeine Destination-Schnittstelle existiert noch nicht.
- Es gibt keine Browser-Extension mit Manifest V3, Service Worker oder Optionsseite.
- Die Tests bestehen aktuell im Wesentlichen aus TypeScript-Prüfung und Lint; belastbare Fixture-/Unit-Tests für Normalisierung und Payloads fehlen.
- API-Typen und Selektoren sind naturgemäß driftanfällig und müssen hinter klaren Adaptern liegen.

## 2. Zielbild

Der Fork bleibt zunächst vollständig rückwärtskompatibel zum bestehenden Userscript. Darauf wird eine generische Capture-Pipeline aufgebaut:

```text
ChatGPT-Seite
    |
    v
Source Adapter
    |
    v
Conversation Retrieval
    |
    v
Normalization / Capture Model
    |
    +--> Renderers: text, markdown, html, json, png
    |
    v
Destination Adapter
    +--> Download
    +--> Clipboard
    +--> Custom HTTP Endpoint

Userscript Adapter     Browser-Extension Adapter
bleibt nutzbar         wird schrittweise ergänzt
```

Die persönliche Second-Brain-Anbindung konsumiert diese generische HTTP-Schnittstelle. Sie bleibt außerhalb dieses Projekts und enthält keine private Vault-Konfiguration im Quelltext.

## 3. Meilensteine

### M0 – Baseline und Schutzgeländer

Ergebnis:

- reproduzierbarer Install-/Build-/Lint-/Test-Ablauf
- dokumentierter Upstream-/Fork-/Branch-Workflow
- kleine repräsentative Conversation-Fixtures ohne private Inhalte
- Liste der kritischen ChatGPT-Selektoren und API-Annahmen

Akzeptanz:

- `corepack pnpm install --frozen-lockfile`
- `corepack pnpm test`
- `corepack pnpm lint`
- `corepack pnpm build`
- bestehendes Userscript-Verhalten bleibt unverändert

### M1 – Kernlogik entkoppeln

Ergebnis:

- `ConversationSource`/Retrieval-Adapter für aktuelle ChatGPT-API und Share-Seiten
- explizites, versionierbares Capture-Modell
- Normalisierung und Renderlogik ohne direkte DOM-/Download-Abhängigkeit
- bestehende Exporte nutzen weiterhin denselben Kern

Akzeptanz:

- Normalisierung ist mit Fixtures testbar.
- Renderer liefern deterministische Ergebnisse.
- API-/DOM-Änderungen sind auf Adaptergrenzen konzentriert.

### M2 – Destination-Abstraktion

Ergebnis:

- gemeinsamer Typ für Exportartefakte (Name, MIME-Typ, Inhalt, Metadaten)
- `DownloadDestination` und `ClipboardDestination` als bestehende Implementierungen
- zentrale Fehler- und Statusbehandlung
- keine doppelte Exportlogik in den Destinations

Akzeptanz:

- bestehende Einzel- und Mehrfach-Exporte verwenden Destinations.
- Fehler werden sichtbar und reproduzierbar behandelt.
- keine ungewollte automatische Übertragung.

### M3 – Custom HTTP Endpoint im Userscript

Ergebnis:

- konfigurierbare Endpoint-URL
- explizite Aktion „an Endpoint senden“
- versioniertes JSON-Payload mit Capture-Metadaten und Inhalt
- Timeout, verständliche Fehlerzustände und kontrollierte Wiederholung
- Konfiguration bleibt lokal im Userscript-Storage

Akzeptanz:

- Test-Endpoint erhält exakt dokumentiertes Payload.
- Standardmäßig wird nichts automatisch versendet.
- Endpoint, Status und Fehler sind in der UI nachvollziehbar.
- keine Credentials oder privaten Vault-Daten im Repository.

### M4 – Browser-Extension-Shell

Ergebnis:

- Manifest V3
- Content Script für ChatGPT-Seiten
- Service Worker für kontrollierte Nachrichten und externe Requests
- Options-/Settings-Seite für Endpoint und Destination-Auswahl
- bestehende Userscript-Variante bleibt als Fallback erhalten

Akzeptanz:

- Extension lässt sich lokal laden und reproduzierbar bauen.
- Berechtigungen sind minimal und dokumentiert.
- Content Script, Service Worker und UI kommunizieren über typisierte Nachrichten.
- keine unnötige Speicherung von Conversation-Inhalten.

### M5 – Second-Brain-Integration und Sicherheitsprüfung

Ergebnis:

- dokumentiertes Endpoint-Schema und Beispielserver/Mock
- Integration in Marcels Second-Brain-Workflow als separater Verbraucher
- Prüfung von CORS, Authentifizierung, Replay-/Doppelversand und Datenschutz
- klare Installations- und Migrationsdokumentation

Akzeptanz:

- Ende-zu-Ende-Test mit lokalem oder kontrolliertem Endpoint.
- manueller Test mit Einzelchat, Share-Seite, Projekt und großem Export.
- Fehler-, Abbruch- und Wiederholungsfälle dokumentiert.

### M6 – Stabilisierung und Veröffentlichung

Ergebnis:

- Release-Checkliste, Changelog und Versionsstrategie
- Build-Artefakte für Userscript und Extension
- aktualisierte README mit klarer Trennung von Upstream-Funktionen und Fork-Erweiterungen
- optionaler Pull Request an Upstream, ohne die Fork-Entwicklung davon abhängig zu machen

Akzeptanz:

- sauberer Release-Commit und reproduzierbarer Build.
- keine bekannten kritischen Sicherheits- oder Datenverlustfehler.
- Installationspfad für persönliche Nutzung ist dokumentiert.

## 4. Wichtige Architekturentscheidungen

- Zuerst Kern und Destination-Abstraktion, danach Extension-Shell.
- Bestehende Exporte werden nicht parallel neu implementiert.
- Automatisches Senden ist nicht der Default.
- HTTP-Payload wird versioniert und enthält nur bewusst definierte Daten.
- API-Zugriff bleibt hinter einem Source-Adapter; UI kennt keine Bearer-Token-Details.
- Die Userscript-Variante bleibt bis zur bewiesenen Funktionsgleichheit erhalten.
- Jede neue Funktion erhält mindestens eine Anforderungsquelle, einen Testfall und eine kurze Dokumentation.

## 5. Offene Entscheidungen vor M1/M3

- Soll der HTTP-Endpoint nur normalisierte Daten oder zusätzlich das rohe API-JSON erhalten?
- Welches Payload-Format braucht der Second-Brain-Verbraucher genau?
- Wird Authentifizierung zunächst über lokalen Endpoint, statischen Header oder später über ein sichereres Verfahren gelöst?
- Soll die Extension nur ChatGPT unterstützen oder später weitere Chat-Anbieter abstrahieren?
- Welche Mindestbrowser (Chrome/Firefox/Edge) werden für M4 verbindlich unterstützt?

Der nächste konkrete Schritt ist M0: drei bis fünf anonymisierte Fixtures aus den vorhandenen Conversation-Typen definieren und die Kernpfade als testbare Grenzen dokumentieren.
