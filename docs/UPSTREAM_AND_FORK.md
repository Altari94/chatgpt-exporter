# Upstream, Fork und Herkunft

Dieses Repository ist ein Fork von [`pionxzh/chatgpt-exporter`](https://github.com/pionxzh/chatgpt-exporter) und behält dessen MIT-Lizenz und Attribution.

## Was aus dem Upstream stammt

- bestehende Exportformate und Renderer
- ChatGPT-API- und Conversation-Modelle
- Userscript-Build und vorhandene Mehrfach-Exportlogik

## Was dieser Fork ergänzt

- Chrome-Extension mit Manifest V3
- Raw-first-Capture-Modell
- gemeinsame Destination-Abstraktion
- versioniertes HTTP-Capture-Envelope
- optionale Endpoint-Host-Berechtigungen
- Queue-Summaries und sichtbare partielle Batch-Fehler

## Produktentscheidung

Die Chrome Extension ist der empfohlene Nutzerweg. Das Userscript bleibt als Legacy-Artefakt für bestehende Installationen und Upstream-Kompatibilität erhalten, wird aber nicht als gleichwertige neue Installation beworben.

Die Release-Version `v1.0.0` bezeichnet die stabile Fork-/Extension-Linie. Das Legacy-Userscript bleibt ein separates Kompatibilitätsartefakt und ist kein automatischer Updatepfad der Chrome-Extension.

## Änderungsstrategie

- Upstream-Änderungen werden regelmäßig geprüft.
- ChatGPT-Adapteränderungen werden isoliert und getestet.
- Fork-spezifische Änderungen werden in Release-Dokumenten nachvollziehbar beschrieben.
- Keine privaten Chatdaten, Endpoint-URLs oder lokalen Pfade werden committed.
