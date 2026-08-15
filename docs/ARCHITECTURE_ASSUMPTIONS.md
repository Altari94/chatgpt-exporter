# Architekturannahmen der Baseline

Stand: v0.1 Baseline

## Laufzeit und Build

- TypeScript-/Preact-Userscript; Vite und `vite-plugin-monkey` erzeugen `dist/chatgpt.user.js`.
- Node.js >= 20 und pnpm 8.14.1 sind über `packageManager` festgelegt.
- Chrome-Extension-Code existiert in v0.1 noch nicht.

## Unterstützte URLs

Der Build matcht `chat.openai.com` und `chatgpt.com` für Startseite, Query-Varianten, `/c/*`, `/g/*`, `/gpts`, `/gpts/*`, `/share/*` und `/share/*/continue`. Die URL-Erkennung liegt in `src/page.ts` und `src/constants.ts`.

## ChatGPT-Zugriff

- Sessiondaten werden über `/api/auth/session` gelesen.
- Backend-Aufrufe laufen über interne `/backend-api`-Endpunkte.
- Zugriff benötigt die eingeloggte Seitensitzung.
- Workspace-Kontext wird über Cookie und Accounts-Check ermittelt.
- Diese Endpunkte sind keine garantiert stabile öffentliche API.

## DOM- und UI-Annahmen

- Navigation: `[data-testid="accounts-profile-button"]`.
- Conversation-Turns: `[data-testid^="conversation-turn-"]` und `[data-message-id]`.
- ChatGPT rendert dynamisch; Selektoren können brechen.
- `sentinel-js` überwacht DOM-Veränderungen.
- Share-Seiten besitzen einen abweichenden React-Router-Kontext.

## Daten- und Ausgabeannahmen

- Conversations enthalten eine `mapping` aus Knoten mit `parent`, `children` und optionaler Nachricht.
- Der aktive Verlauf wird über `current_node` bestimmt.
- Nachrichten können Text, Code, multimodale Inhalte, Quellen, Tool-Ausgaben und Thinking-Metadaten enthalten.
- `processConversation()` erzeugt eine abgeleitete lineare Ansicht.
- Rohes API-JSON und abgeleitete Ansicht müssen im Zielmodell getrennt bleiben.
- Einzel- und Mehrfach-Exporte verwenden derzeit direkt Clipboard, Download und ZIP-Erzeugung.
- Bild-Pointer können je nach Aufruf ersetzt werden; das darf im Raw-Pfad nicht passieren.

## Risiken für spätere Meilensteine

- Interne Endpunkte, Sessionformate oder DOM-Selektoren können sich ändern.
- Große Batches sind rate-limit- und timeout-gefährdet.
- Userscript-Berechtigungen verursachen einen Teil der bisherigen Supportfälle.
- Eine Chrome Extension benötigt eigene Manifest-, Host-Permission- und Bridge-Entscheidungen.
