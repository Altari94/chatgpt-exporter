# Projektidee und Fork-Motivation

## Warum dieser Fork existiert

Der Fork entstand aus dem Bedarf nach einem nativen Chrome-Workflow: ChatGPT-Unterhaltungen sollen als möglichst originales Rohmaterial für lokale Archive, Analysen und beliebige Verarbeitungssysteme gesichert werden. Die bestehende Userscript-Lösung lieferte die wichtige Vorarbeit und bleibt deshalb sichtbar als Upstream-Grundlage und Legacy-Artefakt.

Die Weiterentwicklung verfolgt drei Leitideen:

1. Der Raw-Download ist das unveränderliche Primärartefakt.
2. Die Chrome-Extension ist der einzige empfohlene neue Nutzerpfad und benötigt kein Tampermonkey.
3. Zusätzliche Formate und HTTP-Ziele sind offene, verständliche Erweiterungspunkte statt versteckter Sonderlogik.

## Produktentscheidungen

Die Fork-Version ist bewusst kleiner als Upstream. PNG-Screenshots und ZIP-Batch-Export wurden nicht portiert, weil sie für den paketbasierten Rohdatenexport keinen zentralen Nutzen haben und stärker von DOM-/Browserdetails abhängen. Export All bleibt erhalten, lädt aber vollständige Chat-Pakete mit Auswahl und Abbruch.

## Maintainer-Fokus

Der Fork wird maintainergeführt und nach klaren, praktischen Anforderungen weiterentwickelt. Das schließt Community-Nutzung, Issues und externe Verbesserungen nicht aus; es bedeutet nur, dass keine langfristige Zusage für vollständige Feature-Parität oder regelmäßige Upstream-Synchronisation gemacht wird. Herkunft und Namensnennung bleiben transparent.

## Aktuelles Branding

Die Extension nutzt vorläufig das Minimal-Studios-Logo als Icon auf weißem
Hintergrund. Das Branding ist bewusst von der Exportarchitektur getrennt und
kann später ersetzt werden, ohne Capture-, Export- oder Berechtigungscode zu
ändern. Details und Asset-Zuordnung stehen in [BRANDING.md](./BRANDING.md).
