# ChatGPT Exporter – Extensión de Chrome

La extensión de Chrome es el método recomendado de este fork. No requiere Tampermonkey.

## Instalación

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build:extension
```

Abre `chrome://extensions`, activa el modo de desarrollador y carga `dist-extension/` como extensión sin empaquetar.

## Funciones

- JSON original como exportación primaria sin pérdida
- Exportación de un chat a texto, Markdown o HTML
- Copia de texto al portapapeles
- Export All con lista de chats, selección individual o total y cancelación
- Destino HTTP explícito para flujos propios
- Interfaz en alemán, inglés y español

Las capturas PNG y la exportación ZIP por lotes no forman parte deliberadamente del producto Chrome. Los usuarios nuevos no necesitan Tampermonkey.

Más información: [Build de la extensión](./docs/EXTENSION_BUILD.md), [hito v0.9](./docs/MILESTONE_V0.9.md), [seguridad](./docs/SECURITY_AND_PRIVACY.md), [branding](./docs/BRANDING.md).
