# Projektidee und Fork-Motivation

## Warum dieser Fork existiert

Der Fork entstand aus einem konkreten persönlichen Bedarf: ChatGPT-Unterhaltungen sollen als möglichst originales Rohmaterial für einen Second-Brain- und Analyseworkflow gesichert werden. Die bestehende Userscript-Lösung lieferte die wichtige Vorarbeit und bleibt deshalb sichtbar als Upstream-Grundlage und Legacy-Artefakt.

Die Weiterentwicklung verfolgt drei Leitideen:

1. Der Raw-Download ist das unveränderliche Primärartefakt.
2. Die Chrome-Extension ist der einzige empfohlene neue Nutzerpfad und benötigt kein Tampermonkey.
3. Zusätzliche Formate und HTTP-Ziele sind offene, verständliche Erweiterungspunkte statt versteckter persönlicher Sonderlogik.

## Produktentscheidungen

Die Fork-Version ist bewusst kleiner als Upstream. PNG-Screenshots und ZIP-Batch-Export wurden nicht portiert, weil sie für den Rohdatenworkflow keinen zentralen Nutzen haben und stärker von DOM-/Browserdetails abhängen. Export All bleibt erhalten, lädt aber einzelne Raw-JSON-Dateien mit Auswahl und Abbruch.

## Persönlicher Maintainer-Fokus

Der Fork wird primär nach Marcels eigenem Bedarf weiterentwickelt. Das schließt Community-Nutzung, Issues und externe Verbesserungen nicht aus; es bedeutet nur, dass keine langfristige Zusage für vollständige Feature-Parität oder regelmäßige Upstream-Synchronisation gemacht wird. Der persönliche Ursprung und die Namensnennung bleiben in dieser Dokumentation transparent.
