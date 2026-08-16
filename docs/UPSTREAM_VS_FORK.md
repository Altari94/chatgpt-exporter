# Upstream und Fork – Funktionsvergleich

## Ausgangspunkt: `pionxzh/chatgpt-exporter`

Das Upstream-Projekt ist primär ein Userscript. Es bietet unter anderem:

- Einzelchat-Exporte in Text, HTML, Markdown, JSON und PNG
- Export mehrerer Chats, Projekte und ZIP-Batches
- umfangreiche Einstellungen für Dateinamen, Metadaten, Zeitstempel, Quellen und Thinking-Inhalte
- Clipboard-Export und weitere JSON-Varianten
- bestehende Lokalisierung mit Englisch, Spanisch, Französisch, Indonesisch, Japanisch, Russisch, Türkisch und Chinesisch
- Kompatibilität mit Tampermonkey bzw. einem Userscript-Manager

## Ansatz dieses Forks

Der Fork übernimmt die bewährte Rohdatenidee und verschiebt die Nutzeroberfläche in eine native Manifest-V3-Chrome-Extension. Die Exportpipeline ist auf eine verlustfreie Rohkopie als Primärartefakt ausgerichtet.

## Aktueller Stand des Forks

- Raw JSON für den aktuellen Chat
- Text, Markdown und HTML als abgeleitete Einzelchat-Formate
- Zwischenablage
- Export All mit paginierter Chatliste, Suche, Einzel-/Gesamtauswahl und Abbruch
- expliziter HTTP-Endpoint mit optionaler Host-Berechtigung
- Deutsch, Englisch und Spanisch im Popup
- reproduzierbarer Extension- und Release-Build

Bewusst entfernt beziehungsweise nicht portiert: PNG-Screenshot und ZIP-Batch-Export. Sie erhöhen die Fragilität oder sind für den Second-Brain-Rohdatenworkflow nicht erforderlich.

## Warum Upstream verwenden?

Upstream ist sinnvoll, wenn du ein ausgereiftes Userscript, viele Exportvarianten, Projekt-/Batch-Funktionen, PNG oder die breite bestehende Lokalisierung brauchst.

## Warum diesen Fork verwenden?

Der Fork ist sinnvoll, wenn du eine eigenständige Chrome-Extension ohne Tampermonkey, einen klaren Raw-JSON-Workflow, explizite Weiterleitung an eigene Systeme und eine reduzierte, modernere Oberfläche möchtest.

Beide Projekte bleiben lizenz- und herkunftskompatibel. Der Fork ist keine vollständige Funktionskopie, sondern eine bewusst fokussierte Chrome-Produktlinie.
