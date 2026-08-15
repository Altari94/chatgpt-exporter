# v0.2 – Raw-first Capture-Modell

Der Core liegt in `src/core/capture.ts` und ist unabhängig von DOM, Chrome,
Tampermonkey und Netzwerkzugriff.

## Datenfluss

```text
Antworttext ──captureResponse──> CaptureRecord
       │                              ├── raw.text       (unverändert)
       │                              ├── raw.value      (geparste Sicht)
       │                              └── normalized     (optional, abgeleitet)
       └── Parsingfehler werden sichtbar an den Aufrufer weitergegeben
```

`withNormalization` erhält eine tiefe Kopie der geparsten Rohdaten. Ein
Normalizer darf damit arbeiten, ohne `raw.text` oder `raw.value` zu verändern.
Der Raw-Download verwendet ausschließlich `rawText(record)`.

Das Modell ist absichtlich noch kein Chrome-Adapter und kennt keine konkrete
ChatGPT-API. Diese Grenze bleibt für v0.3 (Extension-Shell) und v0.4
(Ein-Klick-Download) erhalten.
