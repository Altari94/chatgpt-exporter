# Instalación (Español)

## Instalar desde una versión publicada

1. Descarga `chatgpt-exporter-vX.Y.Z.zip` desde la página de versiones de GitHub.
2. Descomprime el archivo.
3. Abre `chrome://extensions` en Chrome y activa el **Modo de desarrollador**.
4. Selecciona **Cargar descomprimida** y elige el directorio `extension` extraído.
5. Abre una conversación normal en `https://chatgpt.com/c/{id}` y abre el popup de la extensión.
6. Selecciona **Descargar paquete de chat** y acepta el permiso opcional de descargas de Chrome cuando se solicite.

El paquete se guarda bajo `Downloads/ChatGPT Exporter/` e incluye el `conversation.json` original, `conversation.md` legible, `media.json` y los archivos capturados en `assets/`.

## Instalar desde el código fuente

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build:extension
```

Carga `dist-extension/` con los mismos pasos de Chrome.

## Resolución de problemas

- Recarga la extensión en `chrome://extensions` después de una compilación local.
- Actualiza la pestaña de ChatGPT después de cargar o recargar la extensión.
- Usa una URL de conversación normal. Las páginas compartidas y de proyecto no forman parte de la garantía de compatibilidad de v1.0.
- Usa **Raw JSON** si rechazas el permiso de descarga estructurada.

Lee [seguridad y privacidad](./SECURITY_AND_PRIVACY.md) antes de configurar un destino HTTP.
