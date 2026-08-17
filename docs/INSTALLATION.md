# Installation (English)

## Install from a release

1. Download `chatgpt-exporter-vX.Y.Z.zip` from the GitHub release page.
2. Unzip the archive.
3. Open `chrome://extensions` in Chrome and enable **Developer mode**.
4. Select **Load unpacked** and choose the extracted `extension` directory.
5. Open a normal `https://chatgpt.com/c/{id}` conversation, then open the extension popup.
6. Select **Download chat package**. Approve the optional Chrome download permission when asked.

The package is stored beneath `Downloads/ChatGPT Exporter/` and contains the original `conversation.json`, readable `conversation.md`, `media.json`, and captured files in `assets/`.

## Install from source

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build:extension
```

Load `dist-extension/` using the same Chrome steps above.

## Troubleshooting

- Reload the extension in `chrome://extensions` after a local rebuild.
- Refresh the ChatGPT tab after loading or reloading the extension.
- Use a normal conversation URL. Share pages and project pages are not part of the v1.0 compatibility guarantee.
- Use **Raw JSON** if the structured package download permission is declined.

See [security and privacy](./SECURITY_AND_PRIVACY.md) before configuring an HTTP destination.
