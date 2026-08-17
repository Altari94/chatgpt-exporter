# Sicherheit und Datenschutz

## Datenfluss

1. Die Extension liest die aktuell geöffnete ChatGPT-Unterhaltung nur nach einer Nutzeraktion.
2. Die Rohantwort wird im Content Script als Text erfasst und separat als JSON geparst.
3. Beim lokalen Download verlässt die Unterhaltung den Browser nicht.
4. Beim HTTP-Ziel wird sie nur nach einem ausdrücklichen Klick an den konfigurierten Endpoint übertragen.

## Berechtigungen

| Berechtigung | Zweck | Zeitpunkt |
| --- | --- | --- |
| ChatGPT-Hostzugriff | Conversation-API der geöffneten ChatGPT-Seite | erforderlich für die Kernfunktion |
| `storage` | lokale Endpoint-Konfiguration | Installation |
| optionale Berechtigung `downloads` | vollständige lokale Chatpakete in einem eindeutigen Ordner ablegen | erst beim Chat-Paket-Download |
| optionale HTTP/HTTPS-Hosts | Versand an einen vom Nutzer gewählten Endpoint | erst bei Nutzung der HTTP-Destination |

Die Download-Berechtigung wird nur für den Chat-Paket-Export angefordert. Eine Ablehnung lässt Capture, einzelne Dateidownloads und HTTP-Export funktionsfähig; es fehlt dann nur die strukturierte lokale Paketablage. Die optionale Host-Berechtigung wird für die konkrete Origin angefordert. Eine Ablehnung lässt Download und lokale Exporte funktionsfähig.

## Schutzregeln

- Keine Tokens oder Cookies werden exportiert.
- Keine Credentials werden im Repository oder in `storage` hinterlegt.
- Kein automatischer Versand.
- HTTPS wird für produktive/private Daten empfohlen.
- Raw-Daten werden nicht durch Normalisierung überschrieben.
- Endpoint-Konfiguration bleibt lokal.
- Die Extension lädt Medien nur als Teil einer ausdrücklich gestarteten Chat-Paket-Aktion herunter. `media.json` dokumentiert Quelle, lokalen Pfad und Erfolg beziehungsweise Fehler jedes Assets.

## Bekannte Grenzen

Der ChatGPT-Adapter verwendet private Web-App-Endpoints. Änderungen an ChatGPT können den Adapter brechen. v1.0 unterstützt primär normale `/c/{id}`-Unterhaltungen; Share- und Projektpfade müssen als eigene Kompatibilitätsfälle geprüft werden.
