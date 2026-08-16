# Community-QoL-Prüfung

## Bereits sinnvoll umgesetzt

- Chrome-first-Installation ohne Userscript-Manager
- verlustfreier Raw-Export als klare Primäraktion
- Auswahl und Abbruch bei Export All
- Suche und Mehrfachauswahl
- optionale HTTP-Berechtigung nur bei Nutzung des Endpoints
- reproduzierbare Builds und automatisierte Extension-Tests
- Deutsch, Englisch und Spanisch im Popup

## Sinnvolle nächste Verbesserungen

1. Fortschrittsanzeige mit aktuellem Chat und Fehlerliste bei Export All.
2. Option „nur fehlgeschlagene Chats erneut versuchen“.
3. Projekte/Custom GPTs in der Chatliste getrennt filtern.
4. Chrome-Download-API prüfen, falls viele Einzel-Downloads durch Browserlimits gebremst werden.
5. Kleine Optionsseite für Sprache, Maximalanzahl und Downloadverhalten.
6. GitHub Actions um Build, Extension-Test und Release-Artefakt ergänzen.

## Bewertung

Für ein erstes Open-Source-Projekt reicht der aktuelle Umfang fachlich aus: Der Kernnutzen ist klar, die Architektur ist erweiterbar und Tampermonkey ist aus dem neuen Nutzerpfad entfernt. Vor einer breiten Veröffentlichung sollten vor allem Fortschritts-/Fehlerfeedback und die GitHub-Release-Automatisierung ergänzt werden.
