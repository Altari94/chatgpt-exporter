# ChatGPT Exporter – Extensión de Chrome

La extensión de Chrome es el método recomendado de este fork. No requiere Tampermonkey.

## Proyecto

Este fork independiente con licencia MIT de [pionxzh/chatgpt-exporter](https://github.com/pionxzh/chatgpt-exporter) se centra en una extensión nativa de Chrome y paquetes de conversación portátiles. El JSON original se conserva sin modificar; Markdown, el manifiesto multimedia y los archivos locales facilitan su lectura y reutilización. La ruta histórica de userscript no es el método recomendado ni se incluye en los artefactos de lanzamiento de Chrome.

## Instalación

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build:extension
```

Abre `chrome://extensions`, activa el modo de desarrollador y carga `dist-extension/` como extensión sin empaquetar.

## Funciones

- JSON original como exportación primaria sin pérdida
- Paquete del chat con JSON original, Markdown, manifiesto multimedia e imágenes locales
- Exportación de un chat a texto, Markdown o HTML
- Copia de texto al portapapeles
- Export All con lista de chats, selección individual o total y cancelación
- Destino HTTP explícito para flujos propios
- Interfaz en alemán, inglés y español

Las capturas PNG y la exportación ZIP por lotes no forman parte deliberadamente del producto Chrome. Los usuarios nuevos no necesitan Tampermonkey.

Más información: [Instalación](./docs/INSTALLATION.es.md), [build de la extensión](./docs/EXTENSION_BUILD.md), [cambios](./CHANGELOG.md), [seguridad](./docs/SECURITY_AND_PRIVACY.md), [motivación del proyecto](./docs/PROJECT_INTENT.md), [comparación con upstream](./docs/UPSTREAM_VS_FORK.md) y [branding](./docs/BRANDING.md).
