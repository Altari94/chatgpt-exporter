# Developer guide (English)

## Architecture

```text
ChatGPT web page
  -> content script / chatgpt-source.ts (authenticated retrieval)
  -> capture record (unchanged raw response plus parsed view)
  -> package, derived-format, or HTTP destination
  -> popup (explicit user actions only)
```

`src/core/` is browser-independent. The Chrome runtime is in `extension/src/`; the legacy userscript remains separate. Preserve the raw response: `CaptureRecord.raw.text` must never be reconstructed from a renderer or normalized view.

## Key modules

| Module | Responsibility |
| --- | --- |
| `chatgpt-source.ts` | authenticated ChatGPT retrieval, list pagination, media fetches |
| `raw-download.ts` | package assembly and Chrome download API integration |
| `media-assets.ts` | media discovery, file naming and manifest entries |
| `derived-export.ts` | Text, Markdown and HTML projections |
| `http-destination.ts` | validated, explicit HTTP transport |
| `popup.ts` | UI state, i18n, selection and message dispatch |

## Change safely

1. Keep adapter changes limited to `chatgpt-source.ts` when ChatGPT changes.
2. Add a typed protocol message and validation for a new user action.
3. Keep derived formats separate from the raw JSON artifact.
4. Add or adjust fixtures and tests.
5. Run the full release gate from the README.

The German [developer guide](./DEVELOPER_GUIDE.md) contains the detailed message contract and implementation notes.
